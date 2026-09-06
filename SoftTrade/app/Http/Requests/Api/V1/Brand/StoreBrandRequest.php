<?php

namespace App\Http\Requests\Api\V1\Brand;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;

class StoreBrandRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->role === 'admin';
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'slug' => $this->slug
                ? Str::slug($this->slug)
                : Str::slug($this->name),
        ]);
    }

    public function rules(): array
    {
        return [
            'name'      => ['required', 'string', 'max:100', 'unique:brands,name'],
            'slug'      => ['required', 'string', 'max:120', 'unique:brands,slug'],
            'logo'      => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp,svg', 'max:1024'],
            'is_active' => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Marka adı zorunludur.',
            'name.unique'   => 'Bu marka adı zaten kullanımda.',
            'slug.unique'   => 'Bu slug zaten kullanımda.',
            'logo.max'      => 'Logo boyutu en fazla 1MB olabilir.',
        ];
    }
}
