<?php

namespace App\Http\Requests\Api\V1\Cart;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCartItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'quantity' => ['required', 'integer', 'min:1', 'max:100'],
        ];
    }

    public function messages(): array
    {
        return [
            'quantity.required' => 'Adet zorunludur.',
            'quantity.min'      => 'Adet en az 1 olmalıdır.',
            'quantity.max'      => 'Sepette en fazla 100 adet olabilir.',
        ];
    }
}
