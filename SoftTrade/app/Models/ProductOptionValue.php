<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class ProductOptionValue extends Model
{
    use HasFactory;

    protected $fillable = [
        'axis_id',
        'value',
        'label',
        'hex_color',
        'numeric_value',
        'sort_order',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'numeric_value' => 'decimal:4',
            'is_active' => 'boolean',
        ];
    }

    public function axis(): BelongsTo
    {
        return $this->belongsTo(ProductOptionAxis::class, 'axis_id');
    }

    public function variants(): BelongsToMany
    {
        return $this->belongsToMany(
            ProductVariant::class,
            'product_variant_option_values',
            'option_value_id',
            'variant_id'
        )->withTimestamps();
    }
}
