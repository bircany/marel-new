<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Services\SkuService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class SkuGenerationTest extends TestCase
{
    use RefreshDatabase;

    protected SkuService $skuService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->skuService = app(SkuService::class);
    }

    #[Test]
    public function brand_code_generation(): void
    {
        $brand = Brand::factory()->create(['name' => 'Apple']);
        $this->assertEquals('APP', $this->skuService->getBrandCode($brand));

        $brand = Brand::factory()->create(['name' => 'Samsung']);
        $this->assertEquals('SAM', $this->skuService->getBrandCode($brand));

        $this->assertEquals('NOB', $this->skuService->getBrandCode(null));
    }

    #[Test]
    public function category_code_generation(): void
    {
        $category = Category::factory()->create(['name' => 'Electronics']);
        $this->assertEquals('ELE', $this->skuService->getCategoryCode($category));

        $category = Category::factory()->create(['name' => 'Phones']);
        $this->assertEquals('PHN', $this->skuService->getCategoryCode($category));

        $this->assertEquals('NCA', $this->skuService->getCategoryCode(null));
    }

    #[Test]
    public function sku_generation_format(): void
    {
        $brand = Brand::factory()->create(['name' => 'Apple']);
        $category = Category::factory()->create(['name' => 'Electronics']);

        $product = Product::factory()->create([
            'brand_id' => $brand->id,
            'category_id' => $category->id,
            'sku' => null,
        ]);

        $sku = $this->skuService->generateSku($product);

        $this->assertMatchesRegularExpression('/^[A-Z]{2,3}-[A-Z]{2,3}-\d{3}$/', $sku);
        $this->assertStringStartsWith('APP-ELE-', $sku);
    }

    #[Test]
    public function sku_uniqueness(): void
    {
        $brand = Brand::factory()->create(['name' => 'Samsung']);
        $category = Category::factory()->create(['name' => 'Phones']);

        $product1 = Product::factory()->create([
            'brand_id' => $brand->id,
            'category_id' => $category->id,
            'sku' => null,
        ]);

        $sku1 = $this->skuService->generateSku($product1);

        $product2 = Product::factory()->create([
            'brand_id' => $brand->id,
            'category_id' => $category->id,
            'sku' => null,
        ]);

        $sku2 = $this->skuService->generateSku($product2);

        $this->assertNotEquals($sku1, $sku2);
        $this->assertEquals('SAM-PHN-001', $sku1);
        $this->assertEquals('SAM-PHN-002', $sku2);
    }

    #[Test]
    public function product_observer_creates_sku(): void
    {
        $brand = Brand::factory()->create(['name' => 'LG']);
        $category = Category::factory()->create(['name' => 'TVs']);

        $product = Product::create([
            'name' => 'LG OLED TV',
            'slug' => Str::slug('LG OLED TV-' . Str::random(6)),
            'brand_id' => $brand->id,
            'category_id' => $category->id,
            'price' => 1500.00,
        ]);

        $this->assertNotNull($product->sku);
        $this->assertStringStartsWith('LG-TV-', $product->sku);
    }

    #[Test]
    public function generate_sku_for_missing_products(): void
    {
        $brand = Brand::factory()->create(['name' => 'Sony']);
        $category = Category::factory()->create(['name' => 'Audio']);

        Product::withoutEvents(function () use ($brand, $category): void {
            Product::factory()->count(5)->create([
                'brand_id' => $brand->id,
                'category_id' => $category->id,
                'sku' => null,
            ]);
        });

        $result = $this->skuService->generateSkuForMissingProducts();

        $this->assertGreaterThan(0, $result['updated']);
        $this->assertEquals(0, count($result['failed']));

        $productsWithoutSku = Product::whereNull('sku')->count();
        $this->assertEquals(0, $productsWithoutSku);
    }

    #[Test]
    public function product_scopes(): void
    {
        $brand = Brand::factory()->create(['name' => 'Nike']);
        $category = Category::factory()->create(['name' => 'Shoes']);

        Product::factory()->create([
            'brand_id' => $brand->id,
            'category_id' => $category->id,
            'sku' => 'NIK-SHO-001',
        ]);

        Product::withoutEvents(function () use ($brand, $category): void {
            Product::factory()->create([
                'brand_id' => $brand->id,
                'category_id' => $category->id,
                'sku' => null,
            ]);
        });

        $this->assertEquals(1, Product::withSku()->count());
        $this->assertGreaterThan(0, Product::withoutSku()->count());
    }

    #[Test]
    public function generate_sku_if_missing_method(): void
    {
        $brand = Brand::factory()->create(['name' => 'Adidas']);
        $category = Category::factory()->create(['name' => 'Sports']);

        $product = Product::withoutEvents(function () use ($brand, $category): Product {
            return Product::factory()->create([
                'brand_id' => $brand->id,
                'category_id' => $category->id,
                'sku' => null,
            ]);
        });

        $product->generateSkuIfMissing();
        $product->save();

        $product->refresh();
        $this->assertNotNull($product->sku);
        $this->assertStringStartsWith('ADI-SPO-', $product->sku);
    }
}