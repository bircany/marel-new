<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductCustomMeasurementRule extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'min_width',
        'max_width',
        'step_width',
        'min_height',
        'max_height',
        'step_height',
        'formula_type',
        'unit_price',
        'base_price',
        'min_billable_area',
        'min_total_price',
        'allow_decimal',
    ];

    protected function casts(): array
    {
        return [
            'min_width' => 'decimal:2',
            'max_width' => 'decimal:2',
            'step_width' => 'decimal:2',
            'min_height' => 'decimal:2',
            'max_height' => 'decimal:2',
            'step_height' => 'decimal:2',
            'unit_price' => 'decimal:2',
            'base_price' => 'decimal:2',
            'min_billable_area' => 'decimal:4',
            'min_total_price' => 'decimal:2',
            'allow_decimal' => 'boolean',
        ];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
