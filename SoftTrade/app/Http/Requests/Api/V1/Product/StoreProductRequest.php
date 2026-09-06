<?php

namespace App\Http\Requests\Api\V1\Product;

use App\Models\Product;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->role === 'admin';
    }

    protected function prepareForValidation(): void
    {
        $sourceSlug = $this->slug ?: $this->name;
        $baseSlug = Str::slug((string) $sourceSlug);
        $slug = $baseSlug;

        if (!$this->filled('slug') && $baseSlug !== '') {
            $counter = 2;
            while (Product::where('slug', $slug)->exists()) {
                $slug = "{$baseSlug}-{$counter}";
                $counter++;
            }
        }

        $this->merge([
            'slug' => $slug,
        ]);
    }

    public function rules(): array
    {
        return [
            'category_id' => ['required', 'exists:categories,id'],
            'brand_id' => ['nullable', 'exists:brands,id'],
            'name' => ['required', 'string', 'max:250'],
            'slug' => ['required', 'string', 'max:280', 'unique:products,slug'],
            'description' => ['nullable', 'string'],
            'short_description' => ['nullable', 'string', 'max:500'],
            'price' => ['required', 'numeric', 'min:0'],
            'sale_price' => ['nullable', 'numeric', 'gt:0', 'lt:price'],
            'stock' => ['required', 'integer', 'min:0'],
            'sku' => ['nullable', 'string', 'max:100', 'unique:products,sku'],
            'status' => ['in:active,inactive,draft'],
            'attributes' => ['nullable', 'array'],
            'measurement_mode' => ['nullable', 'in:fixed,custom'],
            'stock_mode' => ['nullable', 'in:product,variant,unlimited'],
            'is_made_to_order' => ['boolean'],
            'custom_measurement_rule' => ['nullable', 'array'],
            'custom_measurement_rule.min_width' => ['nullable', 'numeric', 'min:0'],
            'custom_measurement_rule.max_width' => ['nullable', 'numeric', 'min:0'],
            'custom_measurement_rule.step_width' => ['nullable', 'numeric', 'gt:0'],
            'custom_measurement_rule.min_height' => ['nullable', 'numeric', 'min:0'],
            'custom_measurement_rule.max_height' => ['nullable', 'numeric', 'min:0'],
            'custom_measurement_rule.step_height' => ['nullable', 'numeric', 'gt:0'],
            'custom_measurement_rule.formula_type' => ['nullable', 'in:area_m2,linear_width,linear_height,base_plus_extra'],
            'custom_measurement_rule.unit_price' => ['nullable', 'numeric', 'min:0'],
            'custom_measurement_rule.base_price' => ['nullable', 'numeric', 'min:0'],
            'custom_measurement_rule.min_billable_area' => ['nullable', 'numeric', 'min:0'],
            'custom_measurement_rule.min_total_price' => ['nullable', 'numeric', 'min:0'],
            'custom_measurement_rule.allow_decimal' => ['boolean'],
            'weight' => ['nullable', 'numeric', 'min:0'],
            'is_featured' => ['boolean'],

            'images' => ['nullable', 'array', 'max:10'],
            'images.*' => ['image', 'mimes:jpg,jpeg,png,webp', 'max:10240'],
            'media_asset_ids' => ['nullable', 'array', 'max:20'],
            'media_asset_ids.*' => ['integer', 'exists:media_assets,id'],

            'variants' => ['nullable', 'array'],
            'variants.*.name' => ['required', 'string', 'max:50'],
            'variants.*.value' => ['required', 'string', 'max:100'],
            'variants.*.price_modifier' => ['numeric'],
            'variants.*.stock' => ['required', 'integer', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'category_id.required' => 'Kategori secimi zorunludur.',
            'name.required' => 'Urun adi zorunludur.',
            'slug.unique' => 'Bu slug zaten kullanimda.',
            'price.required' => 'Fiyat zorunludur.',
            'sale_price.gt' => 'Indirimli fiyat 0dan buyuk olmali.',
            'sale_price.lt' => 'Indirimli fiyat, normal fiyattan dusuk olmali.',
            'stock.min' => 'Stok miktari 0dan kucuk olamaz.',
            'sku.unique' => 'Bu SKU zaten kullanimda.',
            'images.max' => 'En fazla 10 gorsel yukleyebilirsiniz.',
            'images.*.max' => 'Her gorsel en fazla 10MB olabilir.',
            'images.*.uploaded' => 'Dosya yuklenemedi. Daha kucuk bir dosya deneyin.',
            'media_asset_ids.max' => 'Galeriden en fazla 20 gorsel secilebilir.',
        ];
    }
}
