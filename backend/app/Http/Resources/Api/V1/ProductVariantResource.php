<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductVariantResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'name'           => $this->name,
            'value'          => $this->value,
            'label'          => $this->label,           // "Renk: Kırmızı"
            'price_modifier' => (float) $this->price_modifier,
            'final_price'    => $this->final_price,     // ürün fiyatı + modifier
            'stock'          => $this->stock,
            'in_stock'       => $this->stock > 0,
            'sku'            => $this->sku,
            'is_active'      => $this->is_active,
            'option_values'  => ProductOptionValueResource::collection(
                $this->whenLoaded('optionValues')
            ),
        ];
    }
}
