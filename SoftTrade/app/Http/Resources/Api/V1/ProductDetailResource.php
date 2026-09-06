<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Urun detay sayfasi icin tam resource.
 */
class ProductDetailResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $stockMode = $this->stock_mode ?? 'product';
        $inStock = $this->resolveInStock($stockMode);

        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'short_description' => $this->short_description,

            'price' => (float) $this->price,
            'formatted_price' => $this->formatted_price,
            'sale_price' => $this->sale_price ? (float) $this->sale_price : null,
            'formatted_sale_price' => $this->formatted_sale_price,
            'is_on_sale' => $this->is_on_sale,
            'discount_percentage' => $this->discount_percentage,
            'current_price' => (float) $this->current_price,

            'stock' => $this->stock,
            'in_stock' => $inStock,
            'sku' => $this->sku,
            'status' => $this->status,
            'measurement_mode' => $this->measurement_mode ?? 'fixed',
            'stock_mode' => $stockMode,
            'is_made_to_order' => (bool) ($this->is_made_to_order ?? false),
            'is_featured' => $this->is_featured,
            'weight' => $this->weight ? (float) $this->weight : null,
            'attributes' => $this->attributes,
            'view_count' => $this->view_count,

            'images' => ProductImageResource::collection(
                $this->whenLoaded('images')
            ),

            'variants' => ProductVariantResource::collection(
                $this->whenLoaded('variants')
            ),

            'option_axes' => ProductOptionAxisResource::collection(
                $this->whenLoaded('optionAxes')
            ),

            'custom_measurement_rule' => $this->when(
                $this->resource->relationLoaded('customMeasurementRule') && $this->customMeasurementRule,
                fn () => new ProductCustomMeasurementRuleResource($this->customMeasurementRule)
            ),

            'category' => $this->when(
                $this->resource->relationLoaded('category'),
                fn () => new CategoryResource($this->category)
            ),

            'brand' => $this->when(
                $this->resource->relationLoaded('brand') && $this->brand,
                fn () => new BrandResource($this->brand)
            ),

            'reviews' => $this->when(
                $this->resource->relationLoaded('approvedReviews'),
                fn () => $this->approvedReviews->map(fn ($review) => [
                    'id' => $review->id,
                    'rating' => $review->rating,
                    'comment' => $review->comment,
                    'verified' => $review->is_verified_purchase,
                    'user' => $review->user?->full_name,
                    'created_at' => $review->created_at->toIso8601String(),
                ])
            ),

            'rating_avg' => $this->when(
                $this->resource->relationLoaded('approvedReviews'),
                fn () => $this->approvedReviews->avg('rating')
                    ? round($this->approvedReviews->avg('rating'), 1)
                    : null
            ),
            'review_count' => $this->when(
                $this->resource->relationLoaded('approvedReviews'),
                fn () => $this->approvedReviews->count()
            ),

            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
        ];
    }

    private function resolveInStock(string $stockMode): bool
    {
        if ($stockMode === 'unlimited') {
            return true;
        }

        if ($stockMode === 'variant') {
            if ($this->resource->relationLoaded('variants')) {
                return $this->variants->contains(function ($variant): bool {
                    return (bool) $variant->is_active && (int) $variant->stock > 0;
                });
            }

            return false;
        }

        return (int) $this->stock > 0;
    }
}
