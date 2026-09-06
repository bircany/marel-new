<?php

namespace App\Http\Requests\Api\V1\Brand;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;

class UpdateBrandRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->role === 'admin';
    }

    protected function prepareForValidation(): void
    {
        if ($this->slug) {
            $this->merge(['slug' => Str::slug($this->slug)]);
        } elseif ($this->name) {
            $this->merge(['slug' => Str::slug($this->name)]);
        }
    }

    public function rules(): array
    {
        $brandId = $this->route('brand')?->id;

        return [
            'name'      => ['sometimes', 'string', 'max:100', "unique:brands,name,{$brandId}"],
            'slug'      => ['sometimes', 'string', 'max:120', "unique:brands,slug,{$brandId}"],
            'logo'      => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp,svg', 'max:1024'],
            'is_active' => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.unique' => 'Bu marka adı zaten kullanımda.',
            'slug.unique' => 'Bu slug zaten kullanımda.',
        ];
    }
}
