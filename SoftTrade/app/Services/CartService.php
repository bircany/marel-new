<?php

namespace App\Services;

use App\Models\CartItem;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class CartService
{
    /**
     * Kullanıcının sepet öğelerini ve toplam tutarı döner.
     */
    public function getCart(int $userId, ?string $sessionId = null): array
    {
        $query = CartItem::with(['product.coverImage', 'variant']);

        if ($userId) {
            $query->forUser($userId);
        } elseif ($sessionId) {
            $query->forSession($sessionId);
        }

        $items = $query->get();

        $subtotal = $items->sum(fn ($item) => $item->line_total);

        return [
            'items'    => $items,
            'subtotal' => $subtotal,
            'count'    => $items->sum('quantity'),
        ];
    }

    /**
     * Kupon uygula ve indirimli toplam döner.
     */
    public function applyCoupon(float $subtotal, string $code): array
    {
        $coupon = Coupon::valid()->where('code', strtoupper($code))->firstOrFail();

        $discount = $coupon->calculateDiscount($subtotal);

        return [
            'coupon'   => $coupon,
            'discount' => $discount,
            'total'    => max(0, $subtotal - $discount),
        ];
    }
}
