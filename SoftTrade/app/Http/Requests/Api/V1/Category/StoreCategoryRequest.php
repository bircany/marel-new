<?php

namespace App\Http\Requests\Api\V1\Category;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use App\Models\Category;

class StoreCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->role === 'admin';
    }

    /** Slug yoksa name'den otomatik üret */
    protected function prepareForValidation(): void
    {
        $parentId = $this->input('parent_id');
        if ($parentId === '' || $parentId === 'null') {
            $parentId = null;
        }

        $baseSlug = $this->slug
            ? Str::slug($this->slug)
            : Str::slug($this->name);

        $slug = $baseSlug;
        if ($slug !== '') {
            $counter = 2;
            while (Category::where('slug', $slug)->exists()) {
                $slug = "{$baseSlug}-{$counter}";
                $counter++;
            }
        }

        $this->merge([
            'parent_id' => $parentId,
            'slug' => $slug,
        ]);
    }

    public function rules(): array
    {
        return [
            'parent_id'  => ['nullable', 'exists:categories,id'],
            'name'       => ['required', 'string', 'max:150'],
            'slug'       => ['required', 'string', 'max:170', 'unique:categories,slug'],
            'image'      => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'is_active'  => ['boolean'],
            'sort_order' => ['integer', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'  => 'Kategori adı zorunludur.',
            'slug.unique'    => 'Bu slug zaten kullanımda.',
            'image.image'    => 'Geçerli bir görsel dosyası yüklemelisiniz.',
            'image.max'      => 'Görsel boyutu en fazla 2MB olabilir.',
        ];
    }
}
