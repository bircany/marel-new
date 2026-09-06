<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductOptionAxisResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'name' => $this->name,
            'type' => $this->type,
            'sort_order' => $this->sort_order,
            'is_required' => (bool) $this->is_required,
            'is_active' => (bool) $this->is_active,
            'values' => ProductOptionValueResource::collection($this->whenLoaded('values')),
        ];
    }
}
