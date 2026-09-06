<?php

namespace App\Http\Requests\Api\V1\Coupon;

use Illuminate\Foundation\Http\FormRequest;

class ApplyCouponRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // hem giriş yapmış hem de misafir kullanıcılar uygulayabilir
    }

    public function rules(): array
    {
        return [
            'coupon_code' => ['required', 'string', 'max:50'],
            // Misafir kullanıcılar için sepet toplamı (sepet DB'de yoksa frontend hesaplayıp gönderir)
            'cart_total'  => ['nullable', 'numeric', 'min:0'],
        ];
    }

    protected function prepareForValidation(): void
    {
        // Frontend'den { code: "ABC" } gelebilir, geriye donuk uyumluluk
        if (!$this->filled('coupon_code') && $this->filled('code')) {
            $this->merge([
                'coupon_code' => $this->input('code'),
            ]);
        }
    }

    public function messages(): array
    {
        return [
            'coupon_code.required' => 'Kupon kodu zorunludur.',
        ];
    }
}
