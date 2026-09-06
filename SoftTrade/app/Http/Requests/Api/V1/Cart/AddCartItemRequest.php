<?php

namespace App\Http\Requests\Api\V1\Cart;

use Illuminate\Foundation\Http\FormRequest;

class AddCartItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // hem misafir hem kullanıcı ekleyebilir
    }

    public function rules(): array
    {
        return [
            'product_id' => ['required', 'exists:products,id'],
            'variant_id' => ['nullable', 'exists:product_variants,id'],
            'quantity'   => ['required', 'integer', 'min:1', 'max:100'],
            'width'      => ['nullable', 'numeric', 'gt:0'],
            'height'     => ['nullable', 'numeric', 'gt:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'product_id.required' => 'Ürün seçimi zorunludur.',
            'product_id.exists'   => 'Ürün bulunamadı.',
            'variant_id.exists'   => 'Seçilen varyant geçerli değil.',
            'quantity.required'   => 'Adet zorunludur.',
            'quantity.min'        => 'Adet en az 1 olmalıdır.',
            'quantity.max'        => 'Sepete tek seferde en fazla 100 adet ekleyebilirsiniz.',
        ];
    }
}
