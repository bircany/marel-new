<?php

namespace Tests\Unit;

use App\Http\Resources\Api\V1\OrderItemResource;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Http\Request;
use Tests\TestCase;

class OrderItemResourceTest extends TestCase
{
    public function test_resource_includes_measurement_and_pricing_snapshot_fields(): void
    {
        config(['app.url' => 'http://localhost']);

        $product = new Product([
            'slug' => 'test-product',
        ]);
        $product->setRelation('coverImage', new ProductImage([
            'path' => 'products/test.jpg',
        ]));

        $item = new OrderItem([
            'id' => 1,
            'product_id' => 10,
            'product_name' => 'Plise Perde',
            'variant_label' => 'Renk: Beyaz',
            'measurement_label' => '120x180 cm',
            'custom_measurements' => ['width' => 120, 'height' => 180],
            'pricing_snapshot' => ['formula_type' => 'area_m2', 'area_m2' => 2.16],
            'stock_source' => 'variant',
            'sku' => 'PRD-001',
            'unit_price' => 1499.90,
            'quantity' => 2,
            'subtotal' => 2999.80,
        ]);
        $item->setRelation('product', $product);

        $resource = new OrderItemResource($item);
        $payload = $resource->toArray(Request::create('/api/v1/orders/1', 'GET'));

        $this->assertSame('120x180 cm', $payload['measurement_label']);
        $this->assertSame(['width' => 120, 'height' => 180], $payload['custom_measurements']);
        $this->assertSame(['formula_type' => 'area_m2', 'area_m2' => 2.16], $payload['pricing_snapshot']);
        $this->assertSame('variant', $payload['stock_source']);
        $this->assertSame('http://localhost/storage/products/test.jpg', $payload['product_image']);
    }
}
