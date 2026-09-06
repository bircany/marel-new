<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CategoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'parent_id'  => $this->parent_id,
            'name'       => $this->name,
            'slug'       => $this->slug,
            'image_url'  => $this->image
                ? asset('storage/' . $this->image)
                : null,
            'is_active'  => $this->is_active,
            'sort_order' => $this->sort_order,

            // Nested tree — sadece yüklendiğinde (whenLoaded ile koşullu)
            'children'   => CategoryResource::collection(
                $this->whenLoaded('allChildren')
            ),

            // İstatistik — sadece ihtiyaç olduğunda
            'product_count' => $this->when(
                $this->resource->relationLoaded('products'),
                fn () => $this->products->count()
            ),

            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
        ];
    }
}
