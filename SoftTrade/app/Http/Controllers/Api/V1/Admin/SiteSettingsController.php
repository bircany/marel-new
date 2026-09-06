<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\SitePage;
use App\Models\SiteSetting;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SiteSettingsController extends Controller
{
    use ApiResponse;

    public function index(): JsonResponse
    {
        $settings = SiteSetting::query()->pluck('value', 'key');
        $pages = SitePage::query()->orderBy('id')->get(['key', 'title', 'is_active']);

        return $this->success([
            'homepage' => $settings['homepage'] ?? [],
            'footer' => $settings['footer'] ?? [],
            'contact' => $settings['contact'] ?? [],
            'pages' => $pages,
        ]);
    }

    public function update(Request $request, string $section): JsonResponse
    {
        abort_unless(in_array($section, ['homepage', 'footer', 'contact', 'pages'], true), 404);

        if ($section === 'pages') {
            $validated = $request->validate([
                'pages' => ['required', 'array'],
                'pages.*.key' => ['required', 'string', 'exists:site_pages,key'],
                'pages.*.is_active' => ['required', 'boolean'],
            ]);

            foreach ($validated['pages'] as $row) {
                SitePage::where('key', $row['key'])->update(['is_active' => $row['is_active']]);
            }

            return $this->success(SitePage::query()->orderBy('id')->get(['key', 'title', 'is_active']), 'Sayfa durumlari guncellendi.');
        }

        $validated = $request->validate([
            'value' => ['required', 'array'],
        ]);

        SiteSetting::updateOrCreate(
            ['key' => $section],
            ['value' => $validated['value']]
        );

        return $this->success(SiteSetting::where('key', $section)->value('value'), 'Ayarlar guncellendi.');
    }
}
