<?php

namespace App\Http\Requests\Api\V1\Coupon;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCouponRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->role === 'admin';
    }

    protected function prepareForValidation(): void
    {
        if ($this->code) {
            $this->merge(['code' => strtoupper(trim($this->code))]);
        }
    }

    public function rules(): array
    {
        $couponId = $this->route('coupon')?->id;

        return [
            'code' => ['sometimes', 'string', 'max:50', "unique:coupons,code,{$couponId}"],
            'audience' => ['sometimes', 'in:public,personal'],
            'type' => ['sometimes', 'in:fixed,percent'],
            'amount' => ['sometimes', 'numeric', 'min:0.01'],
            'max_discount' => ['nullable', 'numeric', 'min:0'],
            'min_order' => ['nullable', 'numeric', 'min:0'],
            'usage_limit' => ['nullable', 'integer', 'min:1'],
            'is_active' => ['boolean'],
            'expires_at' => ['nullable', 'date'],
            'user_ids' => ['nullable', 'array'],
            'user_ids.*' => ['integer', 'exists:users,id'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($v) {
            $type = $this->type ?? $this->route('coupon')?->type;
            $audience = $this->audience ?? $this->route('coupon')?->audience;

            if ($type === 'percent' && $this->filled('amount') && $this->amount > 100) {
                $v->errors()->add('amount', 'Yuzde kuponu en fazla %100 olabilir.');
            }

            if ($audience === 'personal' && $this->has('user_ids') && count($this->user_ids ?? []) === 0) {
                $v->errors()->add('user_ids', 'Kisiye ozel kupon icin en az bir kullanici secmelisiniz.');
            }
        });
    }
}
