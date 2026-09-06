<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $baseUrl = rtrim((string) (config('app.url') ?: $request->getSchemeAndHttpHost()), '/');
        $productImagePath = $this->product?->coverImage?->path;

        return [
            'id' => $this->id,
            'product_id' => $this->product_id,
            'product_name' => $this->product_name,
            'product_image' => $productImagePath
                ? $baseUrl . '/storage/' . ltrim($productImagePath, '/')
                : null,
            'variant_label' => $this->variant_label,
            'measurement_label' => $this->measurement_label,
            'custom_measurements' => $this->custom_measurements,
            'pricing_snapshot' => $this->pricing_snapshot,
            'stock_source' => $this->stock_source,
            'sku' => $this->sku,
            'unit_price' => (float) $this->unit_price,
            'formatted_unit_price' => number_format((float) $this->unit_price, 2, ',', '.') . ' TL',
            'quantity' => $this->quantity,
            'subtotal' => (float) $this->subtotal,
            'formatted_subtotal' => number_format((float) $this->subtotal, 2, ',', '.') . ' TL',
            'line_total' => (float) $this->subtotal,
            'formatted_line_total' => number_format((float) $this->subtotal, 2, ',', '.') . ' TL',
            'product_slug' => $this->product?->slug,
        ];
    }
}
