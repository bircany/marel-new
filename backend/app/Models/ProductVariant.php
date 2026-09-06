<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class ProductVariant extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'name',
        'value',
        'price_modifier',
        'stock',
        'sku',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'price_modifier' => 'decimal:2',
            'is_active'      => 'boolean',
        ];
    }

    // ── Accessor'lar ──────────────────────────────────────────────────────────

    /** Varyantın gerçek fiyatı: ürün fiyatı + modifier */
    protected function finalPrice(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->product
                ? (float) $this->product->current_price + (float) $this->price_modifier
                : null
        );
    }

    /** Etiket: "Renk: Kırmızı" */
    protected function label(): Attribute
    {
        return Attribute::make(
            get: fn () => "{$this->name}: {$this->value}"
        );
    }

    // ── İlişkiler ─────────────────────────────────────────────────────────────

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function optionValues(): BelongsToMany
    {
        return $this->belongsToMany(
            ProductOptionValue::class,
            'product_variant_option_values',
            'variant_id',
            'option_value_id'
        )->withTimestamps();
    }

    // ── Scope'lar ─────────────────────────────────────────────────────────────

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeInStock($query)
    {
        return $query->where('stock', '>', 0);
    }
}
