<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Urun listeleme icin kisa resource.
 */
class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $baseUrl = rtrim((string) (config('app.url') ?: $request->getSchemeAndHttpHost()), '/');
        $stockMode = $this->stock_mode ?? 'product';
        $inStock = $this->resolveInStock($stockMode);
        $coverUrl = $this->resource->relationLoaded('coverImage') && $this->coverImage
            ? $baseUrl . '/storage/' . ltrim($this->coverImage->path, '/')
            : null;

        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'short_description' => $this->short_description,
            'price' => (float) $this->price,
            'formatted_price' => $this->formatted_price,
            'sale_price' => $this->sale_price ? (float) $this->sale_price : null,
            'formatted_sale_price' => $this->formatted_sale_price,
            'is_on_sale' => $this->is_on_sale,
            'discount_percentage' => $this->discount_percentage,
            'current_price' => (float) $this->current_price,
            'formatted_current_price' => number_format((float) $this->current_price, 2, ',', '.') . ' TL',
            'stock' => $this->stock,
            'in_stock' => $inStock,
            'status' => $this->status,
            'measurement_mode' => $this->measurement_mode ?? 'fixed',
            'stock_mode' => $stockMode,
            'is_made_to_order' => (bool) ($this->is_made_to_order ?? false),
            'is_featured' => $this->is_featured,
            'sku' => $this->sku,
            'cover_image' => $coverUrl ? ['url' => $coverUrl] : null,
            'cover_image_url' => $coverUrl,
            'category' => $this->when(
                $this->resource->relationLoaded('category') && $this->category,
                fn () => ['id' => $this->category->id, 'name' => $this->category->name, 'slug' => $this->category->slug]
            ),
            'brand' => $this->when(
                $this->resource->relationLoaded('brand') && $this->brand,
                fn () => ['id' => $this->brand->id, 'name' => $this->brand->name]
            ),
            'created_at' => $this->created_at->toIso8601String(),
        ];
    }

    private function resolveInStock(string $stockMode): bool
    {
        if ($stockMode === 'unlimited') {
            return true;
        }

        if ($stockMode === 'variant' && $this->resource->relationLoaded('variants')) {
            return $this->variants->contains(function ($variant): bool {
                return (bool) $variant->is_active && (int) $variant->stock > 0;
            });
        }

        return (int) $this->stock > 0;
    }
}
