<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Kargo takip yardımcıları.
 *
 * - Public takip URL (her firma)
 * - MNG ApiZone live status (credential varsa)
 */
class CargoTrackingService
{
    public function providers(): array
    {
        return config('cargo.providers', []);
    }

    public function companyLabel(?string $company): string
    {
        $key = $this->normalizeCompany($company);
        return (string) (config("cargo.providers.{$key}.label") ?? strtoupper($key));
    }

    public function trackingUrl(?string $company, ?string $trackingNumber): ?string
    {
        $trackingNumber = trim((string) $trackingNumber);
        if ($trackingNumber === '') {
            return null;
        }

        $key = $this->normalizeCompany($company);
        $template = config("cargo.providers.{$key}.track_url");
        if (! is_string($template) || $template === '') {
            return null;
        }

        return str_replace('{tracking}', urlencode($trackingNumber), $template);
    }

    /**
     * @return array{status:string|null,events:array<int,array{date:?string,description:string}>,source:string,tracking_url:?string,raw?:mixed}
     */
    public function resolveStatus(?string $company, ?string $trackingNumber): array
    {
        $trackingNumber = trim((string) $trackingNumber);
        $url = $this->trackingUrl($company, $trackingNumber);
        $base = [
            'status' => null,
            'events' => [],
            'source' => 'public_url',
            'tracking_url' => $url,
        ];

        if ($trackingNumber === '') {
            return $base;
        }

        if ($this->normalizeCompany($company) === 'mng' && $this->mngEnabled()) {
            try {
                $live = $this->queryMng($trackingNumber);
                if ($live !== null) {
                    return array_merge($base, $live, ['source' => 'mng_api', 'tracking_url' => $url]);
                }
            } catch (\Throwable $e) {
                Log::warning('MNG cargo track failed', ['error' => $e->getMessage()]);
            }
        }

        return $base;
    }

    public function normalizeCompany(?string $company): string
    {
        $key = strtolower(trim((string) ($company ?: config('cargo.default_company', 'mng'))));
        $aliases = [
            'mng kargo' => 'mng',
            'mngkargo' => 'mng',
            'dhl' => 'mng',
            'yurtiçi' => 'yurtici',
            'yurtici kargo' => 'yurtici',
            'aras kargo' => 'aras',
            'sürat' => 'surat',
            'surat kargo' => 'surat',
            'ptt kargo' => 'ptt',
        ];

        $key = $aliases[$key] ?? $key;

        return array_key_exists($key, config('cargo.providers', []))
            ? $key
            : 'other';
    }

    private function mngEnabled(): bool
    {
        $cfg = config('cargo.mng', []);

        return (bool) ($cfg['enabled'] ?? false)
            && filled($cfg['client_id'] ?? null)
            && filled($cfg['client_secret'] ?? null)
            && filled($cfg['customer_number'] ?? null)
            && filled($cfg['password'] ?? null);
    }

    /**
     * @return array{status:string|null,events:array<int,array{date:?string,description:string}>,raw:mixed}|null
     */
    private function queryMng(string $trackingNumber): ?array
    {
        $token = $this->mngToken();
        if (! $token) {
            return null;
        }

        $base = rtrim((string) config('cargo.mng.base_url'), '/');
        $isShipmentId = (bool) preg_match('/^\d{10,14}$/', $trackingNumber);
        $path = $isShipmentId
            ? "/mngapi/api/standardqueryapi/getshipmentstatusByShipmentId/{$trackingNumber}"
            : '/mngapi/api/standardqueryapi/getshipmentstatus/'.rawurlencode($trackingNumber);

        $response = Http::withToken($token)
            ->acceptJson()
            ->timeout(12)
            ->get($base.$path);

        if (! $response->successful()) {
            return null;
        }

        $json = $response->json();
        $status = data_get($json, 'shipmentStatus')
            ?? data_get($json, 'status')
            ?? data_get($json, 'data.shipmentStatus')
            ?? data_get($json, 'data.status');

        $eventsRaw = data_get($json, 'shipmentMovementList')
            ?? data_get($json, 'movements')
            ?? data_get($json, 'data.shipmentMovementList')
            ?? [];

        $events = [];
        if (is_array($eventsRaw)) {
            foreach ($eventsRaw as $event) {
                if (! is_array($event)) {
                    continue;
                }
                $events[] = [
                    'date' => data_get($event, 'eventDate') ?? data_get($event, 'date'),
                    'description' => (string) (
                        data_get($event, 'description')
                        ?? data_get($event, 'eventDescription')
                        ?? data_get($event, 'status')
                        ?? ''
                    ),
                ];
            }
        }

        return [
            'status' => is_string($status) ? $status : null,
            'events' => $events,
            'raw' => $json,
        ];
    }

    private function mngToken(): ?string
    {
        return Cache::remember('mng_cargo_jwt', now()->addHours(7), function () {
            $cfg = config('cargo.mng');
            $base = rtrim((string) $cfg['base_url'], '/');

            $response = Http::asJson()
                ->acceptJson()
                ->timeout(12)
                ->withHeaders([
                    'X-IBM-Client-Id' => (string) $cfg['client_id'],
                    'X-IBM-Client-Secret' => (string) $cfg['client_secret'],
                ])
                ->post($base.'/mngapi/api/token', [
                    'customerNumber' => (string) $cfg['customer_number'],
                    'password' => (string) $cfg['password'],
                    'identityType' => 1,
                ]);

            if (! $response->successful()) {
                Log::warning('MNG token failed', ['status' => $response->status()]);

                return null;
            }

            $token = data_get($response->json(), 'jwt')
                ?? data_get($response->json(), 'access_token')
                ?? data_get($response->json(), 'token');

            return is_string($token) && $token !== '' ? $token : null;
        });
    }
}
