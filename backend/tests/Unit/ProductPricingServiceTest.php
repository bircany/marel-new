<?php

namespace Tests\Unit;

use App\Models\Product;
use App\Models\ProductCustomMeasurementRule;
use App\Models\ProductVariant;
use App\Services\ProductPricingService;
use InvalidArgumentException;
use Tests\TestCase;

class ProductPricingServiceTest extends TestCase
{
    public function test_fixed_price_calculation_with_variant_modifier(): void
    {
        $product = new Product([
            'price' => 100,
            'sale_price' => 80,
            'measurement_mode' => 'fixed',
        ]);
        $variant = new ProductVariant(['price_modifier' => 15]);

        $service = new ProductPricingService();
        $result = $service->calculate($product, ['quantity' => 2], $variant);

        $this->assertSame('fixed', $result['mode']);
        $this->assertSame(95.0, $result['unit_price']);
        $this->assertSame(190.0, $result['line_total']);
    }

    public function test_custom_area_formula_calculation(): void
    {
        $product = new Product([
            'measurement_mode' => 'custom',
        ]);
        $product->setRelation('customMeasurementRule', new ProductCustomMeasurementRule([
            'formula_type' => 'area_m2',
            'unit_price' => 500,
            'base_price' => 100,
            'min_billable_area' => 1.0,
            'min_total_price' => 0,
            'allow_decimal' => true,
            'min_width' => 50,
            'max_width' => 300,
            'step_width' => 1,
            'min_height' => 50,
            'max_height' => 300,
            'step_height' => 1,
        ]));

        $service = new ProductPricingService();
        $result = $service->calculate($product, ['width' => 100, 'height' => 100, 'quantity' => 1]);

        $this->assertSame('custom', $result['mode']);
        $this->assertSame(600.0, $result['unit_price']);
        $this->assertSame(600.0, $result['line_total']);
    }

    public function test_custom_price_requires_dimensions(): void
    {
        $this->expectException(InvalidArgumentException::class);

        $product = new Product(['measurement_mode' => 'custom']);
        $product->setRelation('customMeasurementRule', new ProductCustomMeasurementRule([
            'formula_type' => 'area_m2',
            'unit_price' => 300,
            'base_price' => 0,
            'allow_decimal' => true,
            'min_width' => 10,
            'max_width' => 200,
            'step_width' => 1,
            'min_height' => 10,
            'max_height' => 200,
            'step_height' => 1,
        ]));

        (new ProductPricingService())->calculate($product, ['quantity' => 1]);
    }
}
