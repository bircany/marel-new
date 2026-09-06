<?php

namespace App\Http\Requests\Api\V1\Order;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PlaceOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function user($guard = null)
    {
        return parent::user($guard) ?? parent::user('sanctum');
    }

    public function rules(): array
    {
        $authenticated = $this->user() !== null;

        return [
            'address_id' => [
                Rule::requiredIf($authenticated && ! $this->filled('shipping.name')),
                'nullable',
                'integer',
                'exists:addresses,id',
            ],
            'shipping' => [
                Rule::requiredIf(! $authenticated || ! $this->filled('address_id')),
                'nullable',
                'array',
            ],
            'shipping.name' => ['required_with:shipping', 'string', 'max:150'],
            'shipping.phone' => ['required_with:shipping', 'string', 'max:30'],
            'shipping.email' => [
                Rule::requiredIf(! $authenticated),
                'nullable',
                'email',
                'max:150',
            ],
            'shipping.city' => ['required_with:shipping', 'string', 'max:80'],
            'shipping.district' => ['required_with:shipping', 'string', 'max:80'],
            'shipping.neighborhood' => ['nullable', 'string', 'max:120'],
            'shipping.full_address' => ['required_with:shipping', 'string', 'max:500'],
            'shipping.zip_code' => ['nullable', 'string', 'max:20'],
            'session_id' => ['nullable', 'string', 'max:80'],
            'coupon_code' => ['nullable', 'string', 'exists:coupons,code'],
            // Kart / iyzico yok — havale+WhatsApp veya kapıda
            'payment_method' => ['required', 'string', 'in:bank_transfer,cash_on_delivery'],
            'notes' => ['nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'address_id.required' => 'Teslimat adresi seçimi zorunludur.',
            'shipping.required' => 'Teslimat bilgileri zorunludur.',
            'shipping.email.required' => 'Misafir sipariş için e-posta zorunludur.',
            'payment_method.required' => 'Ödeme yöntemi seçimi zorunludur.',
            'payment_method.in' => 'Geçerli bir ödeme yöntemi seçiniz (Havale/WhatsApp veya kapıda).',
        ];
    }
}
