<?php

namespace App\Http\Controllers\Api\V1\Cart;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Cart\AddCartItemRequest;
use App\Http\Requests\Api\V1\Cart\UpdateCartItemRequest;
use App\Http\Requests\Api\V1\Coupon\ApplyCouponRequest;
use App\Http\Resources\Api\V1\CartResource;
use App\Models\CartItem;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Services\ProductPricingService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CartController extends Controller
{
    use ApiResponse;

    private function cartOwner(Request $request): array
    {
        $user = auth('sanctum')->user();

        if ($user) {
            return ['user_id' => $user->id, 'session_id' => null];
        }

        $sessionId = $request->header('X-Session-ID') ?? $request->input('session_id');
        if (empty($sessionId)) {
            return ['user_id' => null, 'session_id' => '__empty__'];
        }

        return ['user_id' => null, 'session_id' => $sessionId];
    }

    private function cartQuery(Request $request)
    {
        ['user_id' => $userId, 'session_id' => $sessionId] = $this->cartOwner($request);

        return CartItem::when(
            $userId,
            fn ($q) => $q->forUser($userId),
            fn ($q) => $q->forSession($sessionId)
        );
    }

    public function index(Request $request): JsonResponse
    {
        $items = $this->cartQuery($request)
            ->with(['product.coverImage', 'variant'])
            ->get();

        return $this->success(new CartResource($items));
    }

    public function store(AddCartItemRequest $request, ProductPricingService $pricingService): JsonResponse
    {
        ['user_id' => $userId, 'session_id' => $sessionId] = $this->cartOwner($request);

        $product = Product::with('customMeasurementRule')->findOrFail($request->product_id);
        $variant = $request->variant_id ? ProductVariant::findOrFail($request->variant_id) : null;

        if ($variant && $variant->product_id !== $product->id) {
            return $this->error('Secilen varyant bu urune ait degil.', 422);
        }

        if (($product->measurement_mode ?? 'fixed') === 'custom' && (!$request->filled('width') || !$request->filled('height'))) {
            return $this->error('Serbest olculu urunde width ve height zorunludur.', 422);
        }

        try {
            $pricing = $pricingService->calculate($product, [
                'quantity' => (int) $request->quantity,
                'width' => $request->input('width'),
                'height' => $request->input('height'),
            ], $variant);
        } catch (\InvalidArgumentException $e) {
            return $this->error($e->getMessage(), 422);
        }

        $customMeasurements = $pricing['mode'] === 'custom'
            ? [
                'width' => (float) $request->input('width'),
                'height' => (float) $request->input('height'),
            ]
            : null;

        $measurementHash = $customMeasurements
            ? sha1(json_encode($customMeasurements))
            : '';

        [$availableStock] = $this->resolveAvailableStock($product, $variant);
        if ($availableStock !== null && $availableStock <= 0) {
            return $this->error('Urun stokta bulunmamaktadir.', 422);
        }

        $existing = CartItem::where([
            'user_id' => $userId,
            'session_id' => $sessionId,
            'product_id' => $product->id,
            'variant_id' => $variant?->id,
            'measurement_hash' => $measurementHash,
        ])->first();

        $currentQty = $existing ? $existing->quantity : 0;
        $requestedTotal = $currentQty + (int) $request->quantity;

        if ($availableStock !== null && $requestedTotal > $availableStock) {
            return $this->error(
                "Stok yetersiz. Mevcut stok: {$availableStock}, sepetteki: {$currentQty}, eklemek istediginiz: {$request->quantity}.",
                422
            );
        }

        if ($existing) {
            $existing->update([
                'quantity' => $requestedTotal,
                'unit_price_snapshot' => (float) $pricing['unit_price'],
                'pricing_snapshot' => $pricing['breakdown'] ?? null,
            ]);
        } else {
            CartItem::create([
                'user_id' => $userId,
                'session_id' => $sessionId,
                'product_id' => $product->id,
                'variant_id' => $variant?->id,
                'measurement_hash' => $measurementHash,
                'custom_measurements' => $customMeasurements,
                'unit_price_snapshot' => (float) $pricing['unit_price'],
                'pricing_snapshot' => $pricing['breakdown'] ?? null,
                'quantity' => (int) $request->quantity,
            ]);
        }

        return $this->created(
            $this->cartSummaryResponse($request),
            'Urun sepete eklendi.'
        );
    }

    public function update(UpdateCartItemRequest $request, CartItem $cartItem): JsonResponse
    {
        $this->ensureOwnership($request, $cartItem);

        $cartItem->loadMissing(['product', 'variant']);
        [$availableStock] = $this->resolveAvailableStock($cartItem->product, $cartItem->variant?->id ? $cartItem->variant : null);

        if ($availableStock !== null && (int) $request->quantity > $availableStock) {
            return $this->error("Stok yetersiz. Mevcut stok: {$availableStock}.", 422);
        }

        $cartItem->update(['quantity' => (int) $request->quantity]);

        return $this->success(
            $this->cartSummaryResponse($request),
            'Adet guncellendi.'
        );
    }

    public function destroy(Request $request, CartItem $cartItem): JsonResponse
    {
        $this->ensureOwnership($request, $cartItem);
        $cartItem->delete();

        return $this->success(
            $this->cartSummaryResponse($request),
            'Urun sepetten kaldirildi.'
        );
    }

    public function clear(Request $request): JsonResponse
    {
        $this->cartQuery($request)->delete();
        return $this->noContent();
    }

    public function merge(Request $request): JsonResponse
    {
        $request->validate([
            'session_id' => ['required', 'string'],
        ]);

        $user = $request->user();
        $sessionId = $request->session_id;

        $guestItems = CartItem::forSession($sessionId)
            ->with(['product', 'variant'])
            ->get();

        if ($guestItems->isEmpty()) {
            return $this->success(
                $this->cartSummaryResponse($request),
                'Birlestirilecek misafir sepeti bulunamadi.'
            );
        }

        $merged = 0;
        $skipped = 0;

        foreach ($guestItems as $guestItem) {
            [$availableStock] = $this->resolveAvailableStock(
                $guestItem->product,
                $guestItem->variant?->id ? $guestItem->variant : null
            );

            $existing = CartItem::where([
                'user_id' => $user->id,
                'product_id' => $guestItem->product_id,
                'variant_id' => $guestItem->variant_id,
                'measurement_hash' => $guestItem->measurement_hash ?? '',
            ])->first();

            if ($existing) {
                $newQty = $existing->quantity + $guestItem->quantity;
                $safeQty = $availableStock === null ? $newQty : min($newQty, $availableStock);

                if ($safeQty > $existing->quantity) {
                    $existing->update([
                        'quantity' => $safeQty,
                        'unit_price_snapshot' => $guestItem->unit_price_snapshot ?? $existing->unit_price_snapshot,
                        'pricing_snapshot' => $guestItem->pricing_snapshot ?? $existing->pricing_snapshot,
                    ]);
                }
                $guestItem->delete();
            } else {
                $safeQty = $availableStock === null ? $guestItem->quantity : min($guestItem->quantity, $availableStock);
                if ($safeQty > 0) {
                    $guestItem->update([
                        'user_id' => $user->id,
                        'session_id' => null,
                        'quantity' => $safeQty,
                    ]);
                    $merged++;
                } else {
                    $guestItem->delete();
                    $skipped++;
                }
            }
        }

        return $this->success(
            $this->cartSummaryResponse($request),
            "Sepet birlestirildi. ({$merged} urun eklendi" . ($skipped ? ", {$skipped} stok yetersizligi nedeniyle atlandi" : '') . ')'
        );
    }

    public function applyCoupon(ApplyCouponRequest $request): JsonResponse
    {
        $code = strtoupper(trim($request->coupon_code));
        $coupon = Coupon::where('code', $code)->first();

        if (! $coupon) {
            return $this->error('Kupon kodu gecersiz.', 422);
        }

        if (! $coupon->is_active) {
            return $this->error('Bu kupon aktif degil.', 422);
        }

        if (($coupon->audience ?? 'public') === 'personal') {
            if (! $request->user()) {
                return $this->error('Bu kupon sadece atandigi kullanicilar tarafindan kullanilabilir.', 422);
            }

            if (! $coupon->isAssignedToUser($request->user()->id)) {
                return $this->error('Bu kupon hesabiniza tanimli degil.', 422);
            }
        }

        if ($coupon->expires_at && $coupon->expires_at->isPast()) {
            return $this->error('Kupon suresi dolmus.', 422);
        }

        if ($coupon->usage_limit && $coupon->used_count >= $coupon->usage_limit) {
            return $this->error('Kupon kullanim limiti dolmus.', 422);
        }

        $cartItems = $this->cartQuery($request)->with(['product', 'variant'])->get();

        if ($cartItems->isNotEmpty()) {
            $cartTotal = $cartItems->sum(function ($item) {
                $unitPrice = $this->resolveUnitPrice($item);
                return round($unitPrice * $item->quantity, 2);
            });
        } else {
            $cartTotal = (float) ($request->cart_total ?? 0);
        }

        if ($cartTotal <= 0) {
            return $this->error('Sepetiniz bos. Kupon uygulanamaz.', 422);
        }

        if ($request->user()) {
            $alreadyUsed = Order::where('user_id', $request->user()->id)
                ->where('coupon_id', $coupon->id)
                ->whereNotIn('status', ['cancelled'])
                ->exists();

            if ($alreadyUsed) {
                return $this->error('Bu kuponu daha once kullandiniz.', 422);
            }
        }

        if ($coupon->min_order > 0 && $cartTotal < (float) $coupon->min_order) {
            return $this->error(
                sprintf(
                    'Bu kuponu kullanmak icin minimum %.2f ? tutarli sepet gereklidir. Mevcut sepet tutari: %.2f ?.',
                    $coupon->min_order,
                    $cartTotal
                ),
                422
            );
        }

        $discount = $coupon->calculateDiscount($cartTotal, $request->user()?->id);
        $newTotal = max(0, round($cartTotal - $discount, 2));

        return $this->success([
            'coupon' => [
                'code' => $coupon->code,
                'type' => $coupon->type,
                'amount' => (float) $coupon->amount,
                'max_discount' => $coupon->max_discount ? (float) $coupon->max_discount : null,
            ],
            'original_total' => $cartTotal,
            'discount_amount' => $discount,
            'new_total' => $newTotal,
            'formatted_discount' => number_format($discount, 2, ',', '.') . ' ?',
            'formatted_total' => number_format($newTotal, 2, ',', '.') . ' ?',
        ], 'Kupon basariyla uygulandi.');
    }

    public function removeCoupon(Request $request): JsonResponse
    {
        $cartTotal = 0.0;

        if ($request->user()) {
            $cartItems = $this->cartQuery($request)->with(['product', 'variant'])->get();
            $cartTotal = $cartItems->sum(function ($item) {
                return round($this->resolveUnitPrice($item) * $item->quantity, 2);
            });
        }

        return $this->success([
            'cart_total' => $cartTotal,
            'formatted_cart_total' => number_format($cartTotal, 2, ',', '.') . ' ?',
        ], 'Kupon sepetten kaldirildi.');
    }

    private function ensureOwnership(Request $request, CartItem $item): void
    {
        ['user_id' => $userId, 'session_id' => $sessionId] = $this->cartOwner($request);

        $owned = $userId
            ? $item->user_id === $userId
            : $item->session_id === $sessionId;

        abort_unless($owned, 403, 'Bu sepet kalemine erisim yetkiniz yok.');
    }

    private function cartSummaryResponse(Request $request): CartResource
    {
        $items = $this->cartQuery($request)
            ->with(['product.coverImage', 'variant'])
            ->get();

        return new CartResource($items);
    }

    /**
     * @return array{0:int|null,1:string}
     */
    private function resolveAvailableStock(Product $product, ?ProductVariant $variant): array
    {
        $stockMode = $product->stock_mode ?? 'product';

        if ($stockMode === 'unlimited') {
            return [null, 'none'];
        }

        if ($stockMode === 'variant' && $variant) {
            return [(int) $variant->stock, 'variant'];
        }

        return [(int) $product->stock, 'product'];
    }

    private function resolveUnitPrice(CartItem $item): float
    {
        if ($item->unit_price_snapshot !== null) {
            return (float) $item->unit_price_snapshot;
        }

        $modifier = $item->variant?->id ? (float) $item->variant->price_modifier : 0.0;
        return (float) ($item->product?->current_price ?? 0) + $modifier;
    }
}
