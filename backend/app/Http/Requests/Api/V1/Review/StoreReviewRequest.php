<?php

namespace App\Http\Requests\Api\V1\Review;

use Illuminate\Foundation\Http\FormRequest;

class StoreReviewRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'product_id' => ['required', 'exists:products,id'],
            'rating'     => ['required', 'integer', 'min:1', 'max:5'],
            'comment'    => ['nullable', 'string', 'max:1000'],
            'title'      => ['nullable', 'string', 'max:150'],
        ];
    }

    public function messages(): array
    {
        return [
            'product_id.required' => 'Ürün seçilmesi zorunludur.',
            'product_id.exists'   => 'Ürün bulunamadı.',
            'rating.required'     => 'Puan zorunludur.',
            'rating.min'          => 'Puan en az 1 olmalıdır.',
            'rating.max'          => 'Puan en fazla 5 olabilir.',
            'comment.max'         => 'Yorum en fazla 1000 karakter olabilir.',
        ];
    }
}
