<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductImageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'url'        => asset('storage/' . $this->path),
            'alt_text'   => $this->alt_text,
            'is_cover'   => $this->is_cover,
            'sort_order' => $this->sort_order,
        ];
    }
}
