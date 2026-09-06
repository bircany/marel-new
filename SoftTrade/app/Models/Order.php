<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_number',
        'user_id',
        'guest_email',
        'guest_phone',
        'guest_name',
        'coupon_id',
        'shipping_address',
        'billing_address',
        'subtotal',
        'discount_amount',
        'shipping_cost',
        'tax_amount',
        'total',
        'status',
        'payment_status',
        'payment_method',
        'cargo_company',
        'tracking_number',
        'shipped_at',
        'delivered_at',
        'notes',
        'admin_notes',
        'measurement_confirmed_at',
        'measurement_notes',
    ];

    protected function casts(): array
    {
        return [
            'shipping_address' => 'array',   // jsonb → PHP array
            'billing_address'  => 'array',
            'subtotal'         => 'decimal:2',
            'discount_amount'  => 'decimal:2',
            'shipping_cost'    => 'decimal:2',
            'tax_amount'       => 'decimal:2',
            'total'            => 'decimal:2',
            'shipped_at'       => 'datetime',
            'delivered_at'     => 'datetime',
            'measurement_confirmed_at' => 'datetime',
        ];
    }

    // ── Accessor'lar ──────────────────────────────────────────────────────────

    protected function customerName(): Attribute
    {
        return Attribute::make(
            get: function () {
                if ($this->user) {
                    return $this->user->full_name;
                }

                return $this->guest_name
                    ?? data_get($this->shipping_address, 'name')
                    ?? 'Müşteri';
            }
        );
    }

    protected function notifyEmail(): Attribute
    {
        return Attribute::make(
            get: function () {
                $email = $this->user?->email
                    ?? $this->guest_email
                    ?? data_get($this->shipping_address, 'email');

                return is_string($email) && filter_var($email, FILTER_VALIDATE_EMAIL) ? $email : null;
            }
        );
    }

    protected function formattedTotal(): Attribute
    {
        return Attribute::make(
            get: fn () => number_format((float) $this->total, 2, ',', '.') . ' ₺'
        );
    }

    protected function isPayable(): Attribute
    {
        return Attribute::make(
            get: fn () => in_array($this->payment_status, ['pending', 'failed'])
        );
    }

    protected function isCancellable(): Attribute
    {
        return Attribute::make(
            get: fn () => in_array($this->status, ['pending', 'awaiting_measurement', 'measure_ok', 'processing'], true)
        );
    }

    // ── İlişkiler ─────────────────────────────────────────────────────────────

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function coupon(): BelongsTo
    {
        return $this->belongsTo(Coupon::class)->withDefault();
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    // ── Scope'lar ─────────────────────────────────────────────────────────────

    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    public function scopePaid($query)
    {
        return $query->where('payment_status', 'paid');
    }

    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    // ── Yardımcı Metodlar ─────────────────────────────────────────────────────

    /**
     * Benzersiz sipariş numarası üret: ORD-20250228-00001
     */
    public static function generateOrderNumber(): string
    {
        $prefix = 'ORD-' . now()->format('Ymd') . '-';
        $last   = static::whereDate('created_at', today())
                        ->orderByDesc('id')
                        ->value('order_number');
        $seq = $last ? (int) substr($last, -5) + 1 : 1;
        return $prefix . str_pad($seq, 5, '0', STR_PAD_LEFT);
    }
}
