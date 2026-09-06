<?php

namespace App\Http\Controllers\Api\V1\Settings;

use App\Http\Controllers\Controller;
use App\Models\SitePage;
use App\Models\SiteSetting;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class PublicSettingsController extends Controller
{
    use ApiResponse;

    public function show(): JsonResponse
    {
        $settings = SiteSetting::query()->pluck('value', 'key');
        $pages = SitePage::query()->pluck('is_active', 'key');

        return $this->success([
            'homepage' => $settings['homepage'] ?? [],
            'footer' => $settings['footer'] ?? [],
            'contact' => $settings['contact'] ?? [],
            'payment' => $settings['payment'] ?? [
                'iban' => config('marel.iban'),
                'bank_name' => config('marel.bank_name'),
                'account_holder' => config('marel.account_holder'),
                'whatsapp_phone' => config('marel.whatsapp_phone'),
                'payment_note' => config('marel.payment_note'),
                'free_shipping_min' => 1000,
            ],
            'pages' => $pages,
        ]);
    }
}