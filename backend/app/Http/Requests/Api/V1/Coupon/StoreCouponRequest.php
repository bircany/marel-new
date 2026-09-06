<?php

namespace App\Http\Requests\Api\V1\Coupon;

use Illuminate\Foundation\Http\FormRequest;

class StoreCouponRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->role === 'admin';
    }

    public function rules(): array
    {
        return [
            'code' => ['required', 'string', 'max:50', 'unique:coupons,code'],
            'audience' => ['required', 'in:public,personal'],
            'type' => ['required', 'in:fixed,percent'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'max_discount' => ['nullable', 'numeric', 'min:0'],
            'min_order' => ['nullable', 'numeric', 'min:0'],
            'usage_limit' => ['nullable', 'integer', 'min:1'],
            'is_active' => ['boolean'],
            'expires_at' => ['nullable', 'date', 'after:now'],
            'user_ids' => ['nullable', 'array'],
            'user_ids.*' => ['integer', 'exists:users,id'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'code' => strtoupper(trim($this->code ?? '')),
        ]);
    }

    public function messages(): array
    {
        return [
            'code.required' => 'Kupon kodu zorunludur.',
            'code.unique' => 'Bu kupon kodu zaten kullaniliyor.',
            'type.required' => 'Kupon tipi zorunludur.',
            'audience.required' => 'Kupon hedefi zorunludur.',
            'amount.required' => 'Indirim miktari zorunludur.',
            'expires_at.after' => 'Son kullanma tarihi gelecekte olmali.',
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($v) {
            if ($this->type === 'percent' && $this->amount > 100) {
                $v->errors()->add('amount', 'Yuzde kuponu en fazla %100 olabilir.');
            }

            if ($this->audience === 'personal' && empty($this->user_ids)) {
                $v->errors()->add('user_ids', 'Kisiye ozel kupon icin en az bir kullanici secmelisiniz.');
            }
        });
    }
}
