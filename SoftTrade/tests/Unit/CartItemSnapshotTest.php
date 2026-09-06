<?php

namespace Tests\Unit;

use App\Models\CartItem;
use App\Models\Product;
use App\Models\ProductVariant;
use Tests\TestCase;

class CartItemSnapshotTest extends TestCase
{
    public function test_line_total_uses_unit_price_snapshot_when_available(): void
    {
        $product = new Product([
            'price' => 200,
            'sale_price' => 150,
        ]);
        $variant = new ProductVariant([
            'price_modifier' => 25,
        ]);

        $item = new CartItem([
            'quantity' => 3,
            'unit_price_snapshot' => 99.90,
        ]);
        $item->setRelation('product', $product);
        $item->setRelation('variant', $variant);

        $this->assertSame(299.7, (float) $item->line_total);
    }

    public function test_line_total_falls_back_to_product_current_price_and_variant_modifier(): void
    {
        $product = new Product([
            'price' => 200,
            'sale_price' => 150,
        ]);
        $variant = new ProductVariant([
            'price_modifier' => 25,
        ]);

        $item = new CartItem([
            'quantity' => 2,
            'unit_price_snapshot' => null,
        ]);
        $item->setRelation('product', $product);
        $item->setRelation('variant', $variant);

        $this->assertSame(350.0, (float) $item->line_total);
    }
}
