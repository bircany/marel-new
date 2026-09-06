<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CartItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'session_id',
        'product_id',
        'variant_id',
        'measurement_hash',
        'custom_measurements',
        'pricing_snapshot',
        'unit_price_snapshot',
        'quantity',
    ];

    protected function casts(): array
    {
        return [
            'custom_measurements' => 'array',
            'pricing_snapshot' => 'array',
            'unit_price_snapshot' => 'decimal:2',
        ];
    }

    // ── Accessor'lar ──────────────────────────────────────────────────────────

    /** Kalem toplamı: aktif fiyat × adet */
    protected function lineTotal(): Attribute
    {
        return Attribute::make(
            get: function () {
                if (! $this->product) return 0;

                $price = $this->unit_price_snapshot !== null
                    ? (float) $this->unit_price_snapshot
                    : ($this->variant
                        ? (float) $this->product->current_price + (float) $this->variant->price_modifier
                        : (float) $this->product->current_price);

                return round($price * $this->quantity, 2);
            }
        );
    }

    // ── İlişkiler ─────────────────────────────────────────────────────────────

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class)->withDefault();
    }

    public function variant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class, 'variant_id')->withDefault();
    }

    // ── Scope'lar ─────────────────────────────────────────────────────────────

    /** Giriş yapmış kullanıcıya ait sepet */
    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    /** Misafir oturumuna ait sepet */
    public function scopeForSession($query, string $sessionId)
    {
        return $query->whereNull('user_id')->where('session_id', $sessionId);
    }
}
