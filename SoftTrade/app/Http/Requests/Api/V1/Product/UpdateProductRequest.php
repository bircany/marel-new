<?php

namespace App\Http\Requests\Api\V1\Product;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;

class UpdateProductRequest extends FormRequest
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
        $productId = $this->route('product')?->id;

        return [
            'category_id'       => ['sometimes', 'exists:categories,id'],
            'brand_id'          => ['nullable', 'exists:brands,id'],
            'name'              => ['sometimes', 'string', 'max:250'],
            'slug'              => ['sometimes', 'string', 'max:280', "unique:products,slug,{$productId}"],
            'description'       => ['nullable', 'string'],
            'short_description' => ['nullable', 'string', 'max:500'],
            'price'             => ['sometimes', 'numeric', 'min:0'],
            'sale_price'        => ['nullable', 'numeric', 'gt:0', 'lt:price'],
            'stock'             => ['sometimes', 'integer', 'min:0'],
            'sku'               => ['nullable', 'string', 'max:100', "unique:products,sku,{$productId}"],
            'status'            => ['in:active,inactive,draft'],
            'attributes'        => ['nullable', 'array'],
            'measurement_mode'  => ['nullable', 'in:fixed,custom'],
            'stock_mode'        => ['nullable', 'in:product,variant,unlimited'],
            'is_made_to_order'  => ['boolean'],
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
            'weight'            => ['nullable', 'numeric', 'min:0'],
            'is_featured'       => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'slug.unique'      => 'Bu slug zaten kullanimda.',
            'sale_price.gt'    => 'Indirimli fiyat 0dan buyuk olmalidir.',
            'sale_price.lt'    => 'Indirimli fiyat, normal fiyattan dusuk olmalidir.',
            'sku.unique'       => 'Bu SKU zaten kullanimda.',
        ];
    }
}
