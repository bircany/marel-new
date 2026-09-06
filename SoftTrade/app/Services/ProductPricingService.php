<?php

namespace App\Services;

use App\Models\Product;
use App\Models\ProductVariant;
use InvalidArgumentException;

class ProductPricingService
{
    /**
     * @param array{
     *   quantity?: int,
     *   width?: float|int|string|null,
     *   height?: float|int|string|null
     * } $input
     * @return array<string, mixed>
     */
    public function calculate(Product $product, array $input = [], ?ProductVariant $variant = null): array
    {
        $quantity = max(1, (int) ($input['quantity'] ?? 1));
        $mode = (string) ($product->measurement_mode ?? 'fixed');

        return $mode === 'custom'
            ? $this->calculateCustom($product, $input, $quantity)
            : $this->calculateFixed($product, $variant, $quantity);
    }

    /**
     * @return array<string, mixed>
     */
    public function calculateFixed(Product $product, ?ProductVariant $variant, int $quantity): array
    {
        $modifier = $variant ? (float) $variant->price_modifier : 0.0;
        $unitPrice = round((float) $product->current_price + $modifier, 2);
        $lineTotal = round($unitPrice * $quantity, 2);

        return [
            'mode' => 'fixed',
            'quantity' => $quantity,
            'unit_price' => $unitPrice,
            'line_total' => $lineTotal,
            'formatted_unit_price' => number_format($unitPrice, 2, ',', '.') . ' ₺',
            'formatted_line_total' => number_format($lineTotal, 2, ',', '.') . ' ₺',
            'breakdown' => [
                'base_current_price' => (float) $product->current_price,
                'variant_price_modifier' => $modifier,
                'variant_id' => $variant?->id,
            ],
        ];
    }

    /**
     * @param array{
     *   width?: float|int|string|null,
     *   height?: float|int|string|null
     * } $input
     * @return array<string, mixed>
     */
    public function calculateCustom(Product $product, array $input, int $quantity): array
    {
        $rule = $product->customMeasurementRule;
        if (! $rule) {
            throw new InvalidArgumentException('Bu urun icin serbest olcu kurali tanimli degil.');
        }

        $width = isset($input['width']) ? (float) $input['width'] : null;
        $height = isset($input['height']) ? (float) $input['height'] : null;

        if ($width === null || $height === null || $width <= 0 || $height <= 0) {
            throw new InvalidArgumentException('Serbest olculu urunlerde width ve height zorunludur.');
        }

        $this->validateDimension($width, (float) $rule->min_width, (float) $rule->max_width, (float) $rule->step_width, 'width', (bool) $rule->allow_decimal);
        $this->validateDimension($height, (float) $rule->min_height, (float) $rule->max_height, (float) $rule->step_height, 'height', (bool) $rule->allow_decimal);

        $formulaType = (string) ($rule->formula_type ?? 'area_m2');
        $unitRate = (float) ($rule->unit_price ?? 0);
        $basePrice = (float) ($rule->base_price ?? 0);
        $areaM2 = round(($width * $height) / 10000, 4);
        $minBillableArea = (float) ($rule->min_billable_area ?? 0);
        $minTotalPrice = (float) ($rule->min_total_price ?? 0);

        $billableArea = $areaM2;
        $unitPrice = 0.0;

        if ($formulaType === 'area_m2') {
            $billableArea = max($areaM2, $minBillableArea > 0 ? $minBillableArea : $areaM2);
            $unitPrice = $basePrice + ($billableArea * $unitRate);
        } elseif ($formulaType === 'linear_width') {
            $unitPrice = $basePrice + ($width * $unitRate);
        } elseif ($formulaType === 'linear_height') {
            $unitPrice = $basePrice + ($height * $unitRate);
        } elseif ($formulaType === 'base_plus_extra') {
            $extraArea = max(0, $areaM2 - $minBillableArea);
            $unitPrice = $basePrice + ($extraArea * $unitRate);
        } else {
            throw new InvalidArgumentException('Desteklenmeyen formula_type.');
        }

        $unitPrice = round(max($unitPrice, $minTotalPrice), 2);
        $lineTotal = round($unitPrice * $quantity, 2);

        return [
            'mode' => 'custom',
            'quantity' => $quantity,
            'unit_price' => $unitPrice,
            'line_total' => $lineTotal,
            'formatted_unit_price' => number_format($unitPrice, 2, ',', '.') . ' ₺',
            'formatted_line_total' => number_format($lineTotal, 2, ',', '.') . ' ₺',
            'breakdown' => [
                'width' => $width,
                'height' => $height,
                'area_m2' => $areaM2,
                'billable_area_m2' => $billableArea,
                'formula_type' => $formulaType,
                'base_price' => $basePrice,
                'unit_rate' => $unitRate,
                'min_billable_area' => $minBillableArea,
                'min_total_price' => $minTotalPrice,
            ],
        ];
    }

    private function validateDimension(
        float $value,
        float $min,
        float $max,
        float $step,
        string $field,
        bool $allowDecimal
    ): void {
        if (! $allowDecimal && floor($value) !== $value) {
            throw new InvalidArgumentException("{$field} tam sayi olmali.");
        }

        if ($min > 0 && $value < $min) {
            throw new InvalidArgumentException("{$field} minimum {$min} olmali.");
        }

        if ($max > 0 && $value > $max) {
            throw new InvalidArgumentException("{$field} maksimum {$max} olmali.");
        }

        if ($step > 0) {
            $origin = $min > 0 ? $min : 0;
            $remainder = fmod(($value - $origin), $step);
            $epsilon = 0.00001;
            if ($remainder > $epsilon && abs($remainder - $step) > $epsilon) {
                throw new InvalidArgumentException("{$field} adimi {$step} olmali.");
            }
        }
    }
}
