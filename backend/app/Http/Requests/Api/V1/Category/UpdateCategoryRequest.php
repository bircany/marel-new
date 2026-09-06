<?php

namespace App\Http\Requests\Api\V1\Category;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use App\Models\Category;

class UpdateCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->role === 'admin';
    }

    protected function prepareForValidation(): void
    {
        $categoryId = $this->route('category')?->id;
        $parentId = $this->input('parent_id');
        if ($parentId === '' || $parentId === 'null') {
            $parentId = null;
        }

        if ($this->slug) {
            $baseSlug = Str::slug($this->slug);
        } elseif ($this->name) {
            $baseSlug = Str::slug($this->name);
        } else {
            $baseSlug = null;
        }

        $payload = ['parent_id' => $parentId];

        if ($baseSlug) {
            $slug = $baseSlug;
            $counter = 2;
            while (Category::where('slug', $slug)->where('id', '!=', $categoryId)->exists()) {
                $slug = "{$baseSlug}-{$counter}";
                $counter++;
            }
            $payload['slug'] = $slug;
        }

        $this->merge($payload);
    }

    public function rules(): array
    {
        $categoryId = $this->route('category')?->id;

        return [
            'parent_id'  => ['nullable', 'exists:categories,id', "not_in:{$categoryId}"],
            'name'       => ['sometimes', 'string', 'max:150'],
            'slug'       => ['sometimes', 'string', 'max:170', "unique:categories,slug,{$categoryId}"],
            'image'      => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'is_active'  => ['boolean'],
            'sort_order' => ['integer', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'slug.unique'          => 'Bu slug zaten kullanımda.',
            'parent_id.not_in'     => 'Kategori kendisinin alt kategorisi olamaz.',
            'image.max'            => 'Görsel boyutu en fazla 2MB olabilir.',
        ];
    }
}
