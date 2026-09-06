<?php

namespace Database\Factories;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition(): array
    {
        $name = Str::title(fake()->unique()->words(3, true));

        return [
            'category_id' => Category::factory(),
            'brand_id' => Brand::factory(),
            'name' => $name,
            'slug' => Str::slug($name . '-' . fake()->unique()->numberBetween(1, 99999)),
            'description' => fake()->sentence(),
            'short_description' => fake()->sentence(6),
            'price' => fake()->randomFloat(2, 100, 5000),
            'sale_price' => null,
            'stock' => fake()->numberBetween(0, 100),
            'sku' => null,
            'status' => 'active',
            'attributes' => null,
            'weight' => null,
            'is_featured' => false,
        ];
    }
}
