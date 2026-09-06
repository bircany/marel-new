<?php

namespace App\Http\Requests\Api\V1\Product;

use Illuminate\Foundation\Http\FormRequest;

class PreviewPriceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'variant_id' => ['nullable', 'exists:product_variants,id'],
            'quantity' => ['nullable', 'integer', 'min:1', 'max:100'],
            'width' => ['nullable', 'numeric', 'gt:0'],
            'height' => ['nullable', 'numeric', 'gt:0'],
        ];
    }
}
