<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReviewResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                    => $this->id,
            'rating'                => $this->rating,
            'title'                 => $this->title,
            'comment'               => $this->comment,
            'status'                => $this->status,
            'is_verified_purchase'  => $this->is_verified_purchase,

            'user' => $this->when(
                $this->resource->relationLoaded('user'),
                fn () => [
                    'name'   => $this->user?->full_name,
                    'avatar' => null, // avatar özelliği eklenirse buraya
                ]
            ),

            'product' => $this->when(
                $this->resource->relationLoaded('product'),
                fn () => [
                    'id'   => $this->product?->id,
                    'name' => $this->product?->name,
                    'slug' => $this->product?->slug,
                ]
            ),

            'created_at' => $this->created_at->toIso8601String(),
        ];
    }
}
