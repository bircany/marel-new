<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CartItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $product = $this->product;
        $variant = $this->variant && $this->variant->id ? $this->variant : null;

        $unitPrice = $this->unit_price_snapshot !== null
            ? (float) $this->unit_price_snapshot
            : ($product
                ? (float) $product->current_price + (float) ($variant?->price_modifier ?? 0)
                : 0.0);

        $lineTotal = round($unitPrice * $this->quantity, 2);

        $customMeasurements = $this->custom_measurements;
        $measurementLabel = is_array($customMeasurements) && isset($customMeasurements['width'], $customMeasurements['height'])
            ? sprintf('%sx%s cm', $customMeasurements['width'], $customMeasurements['height'])
            : null;

        $baseUrl = rtrim((string) (config('app.url') ?: $request->getSchemeAndHttpHost()), '/');
        $coverImage = $product && $product->relationLoaded('coverImage') && $product->coverImage
            ? $baseUrl . '/storage/' . ltrim($product->coverImage->path, '/')
            : null;

        return [
            'id' => $this->id,
            'quantity' => $this->quantity,
            'measurement_hash' => $this->measurement_hash ?: null,
            'custom_measurements' => $customMeasurements,
            'measurement_label' => $measurementLabel,
            'pricing_snapshot' => $this->pricing_snapshot,

            'product' => $product ? [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'sku' => $product->sku,
                'cover_image' => $coverImage,
                'cover_image_url' => $coverImage,
                'stock' => $product->stock,
                'in_stock' => $product->stock > 0,
                'is_on_sale' => $product->is_on_sale,
                'measurement_mode' => $product->measurement_mode ?? 'fixed',
            ] : null,

            'variant' => $variant ? [
                'id' => $variant->id,
                'label' => $variant->label,
                'stock' => $variant->stock,
            ] : null,

            'unit_price' => $unitPrice,
            'formatted_unit_price' => number_format($unitPrice, 2, ',', '.') . ' ?',
            'line_total' => $lineTotal,
            'formatted_line_total' => number_format($lineTotal, 2, ',', '.') . ' ?',
        ];
    }
}
