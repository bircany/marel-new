<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Coupon extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'audience',
        'type',
        'amount',
        'max_discount',   // yüzde kuponlarda tavan tutar
        'min_order',
        'usage_limit',
        'used_count',
        'is_active',
        'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'amount'       => 'decimal:2',
            'max_discount' => 'decimal:2',
            'min_order'    => 'decimal:2',
            'is_active'    => 'boolean',
            'expires_at'   => 'datetime',
        ];
    }

    // ── Accessor'lar ──────────────────────────────────────────────────────────

    /** Kupon hâlâ geçerli mi? */
    protected function isValid(): Attribute
    {
        return Attribute::make(
            get: function () {
                if (! $this->is_active) return false;
                if ($this->expires_at && $this->expires_at->isPast()) return false;
                if (! is_null($this->usage_limit) && $this->used_count >= $this->usage_limit) return false;
                return true;
            }
        );
    }

    // ── Hesaplama ─────────────────────────────────────────────────────────────

    /**
     * Verilen sipariş tutarına uygulanacak indirim miktarını döndür.
     *
     * Yüzde kuponlarda max_discount sınırı uygulanır:
     * Örn: %30 kupon + max_discount:200 → 700 TL sepette 210 TL hesaplanır ama 200 TL uygulanır.
     *
     * @param  float       $orderTotal  Sepet/sipariş ara toplamı
     * @param  int|null    $userId      Kullanıcı ID — daha önce kullandı mı kontrolü için
     */
    public function calculateDiscount(float $orderTotal, ?int $userId = null): float
    {
        if (! $this->is_valid || $orderTotal < (float) $this->min_order) {
            return 0.0;
        }

        if ($this->type === 'percent') {
            $calculated = round($orderTotal * ((float) $this->amount / 100), 2);

            // max_discount sınırına bak
            if ($this->max_discount && $calculated > (float) $this->max_discount) {
                $calculated = (float) $this->max_discount;
            }

            return min($calculated, $orderTotal);
        }

        // fixed — indirim tutarı sipariş toplamını geçemez
        return min((float) $this->amount, $orderTotal);
    }

    // ── İlişkiler ─────────────────────────────────────────────────────────────

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'coupon_user')
            ->withPivot(['assigned_by', 'usage_limit', 'used_count', 'is_active', 'assigned_at', 'expires_at'])
            ->withTimestamps();
    }

    public function isAssignedToUser(int $userId): bool
    {
        return $this->users()
            ->where('users.id', $userId)
            ->wherePivot('is_active', true)
            ->where(function ($q) {
                $q->whereNull('coupon_user.expires_at')->orWhere('coupon_user.expires_at', '>', now());
            })
            ->exists();
    }

    // ── Scope'lar ─────────────────────────────────────────────────────────────

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeValid($query)
    {
        return $query->active()
                     ->where(fn ($q) => $q->whereNull('expires_at')->orWhere('expires_at', '>', now()))
                     ->where(fn ($q) => $q->whereNull('usage_limit')->orWhereColumn('used_count', '<', 'usage_limit'));
    }
}
