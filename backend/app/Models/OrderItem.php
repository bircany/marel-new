<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'product_id',
        'variant_id',
        'product_name',
        'variant_label',
        'measurement_label',
        'custom_measurements',
        'pricing_snapshot',
        'stock_source',
        'sku',
        'unit_price',
        'quantity',
        'subtotal',
    ];

    protected function casts(): array
    {
        return [
            'unit_price' => 'decimal:2',
            'subtotal'   => 'decimal:2',
            'custom_measurements' => 'array',
            'pricing_snapshot' => 'array',
        ];
    }

    // ── İlişkiler ─────────────────────────────────────────────────────────────

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class)->withDefault([
            'name' => $this->product_name,
        ]);
    }

    public function variant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class, 'variant_id')->withDefault();
    }
}
