<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductOptionValueResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'value' => $this->value,
            'label' => $this->label ?? $this->value,
            'hex_color' => $this->hex_color,
            'numeric_value' => $this->numeric_value !== null ? (float) $this->numeric_value : null,
            'sort_order' => $this->sort_order,
            'is_active' => (bool) $this->is_active,
        ];
    }
}
