<?php

namespace App\Http\Controllers\Api\V1\Orders;

use App\Events\OrderPlaced;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Order\PlaceOrderRequest;
use App\Http\Resources\Api\V1\OrderDetailResource;
use App\Http\Resources\Api\V1\OrderResource;
use App\Models\Address;
use App\Models\CartItem;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Services\CargoTrackingService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $orders = Order::where('user_id', $request->user()->id)
            ->with('items')
            ->when($request->status, fn ($q) => $q->byStatus($request->status))
            ->latest()
            ->paginate(15);

        return $this->success(
            OrderResource::collection($orders),
            meta: [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'total' => $orders->total(),
            ]
        );
    }

    public function show(Request $request, Order $order): JsonResponse
    {
        abort_unless($order->user_id === $request->user()->id, 403, 'Bu siparise erisim yetkiniz yok.');

        $order->load(['items.product.coverImage', 'coupon']);

        return $this->success(new OrderDetailResource($order));
    }

    /**
     * POST /api/v1/orders/track
     * Misafir sipariş + kargo takibi (sipariş no + e-posta).
     */
    public function track(Request $request, CargoTrackingService $cargo): JsonResponse
    {
        $validated = $request->validate([
            'order_number' => ['required', 'string', 'max:40'],
            'email' => ['required', 'email', 'max:120'],
        ]);

        $order = Order::with(['user', 'items'])
            ->where('order_number', trim($validated['order_number']))
            ->first();

        if (! $order) {
            return $this->error('Sipariş bulunamadı. Sipariş numarası ve e-postayı kontrol edin.', 404);
        }

        $email = strtolower(trim($validated['email']));
        $orderEmail = strtolower((string) (
            $order->guest_email
            ?? $order->user?->email
            ?? data_get($order->shipping_address, 'email', '')
        ));
        $addressPhoneEmailOk = $orderEmail !== '' && hash_equals($orderEmail, $email);

        if (! $addressPhoneEmailOk) {
            return $this->error('Sipariş bulunamadı. Sipariş numarası ve e-postayı kontrol edin.', 404);
        }

        $cargoLive = $cargo->resolveStatus($order->cargo_company, $order->tracking_number);

        return $this->success([
            'order' => (new OrderDetailResource($order))->resolve(),
            'cargo' => [
                'company' => $order->cargo_company,
                'company_label' => $cargo->companyLabel($order->cargo_company),
                'tracking_number' => $order->tracking_number,
                'tracking_url' => $cargo->trackingUrl($order->cargo_company, $order->tracking_number),
                'live_status' => $cargoLive['status'],
                'events' => $cargoLive['events'],
                'source' => $cargoLive['source'],
            ],
        ], 'Sipariş durumu getirildi.');
    }

    /**
     * GET /api/v1/orders/{order}/cargo
     * Giriş yapmış kullanıcı için canlı kargo durumu.
     */
    public function cargoStatus(Request $request, Order $order, CargoTrackingService $cargo): JsonResponse
    {
        abort_unless($order->user_id === $request->user()->id, 403, 'Bu siparise erisim yetkiniz yok.');

        $live = $cargo->resolveStatus($order->cargo_company, $order->tracking_number);

        return $this->success([
            'company' => $order->cargo_company,
            'company_label' => $cargo->companyLabel($order->cargo_company),
            'tracking_number' => $order->tracking_number,
            'tracking_url' => $cargo->trackingUrl($order->cargo_company, $order->tracking_number),
            'live_status' => $live['status'],
            'events' => $live['events'],
            'source' => $live['source'],
        ]);
    }

    public function store(PlaceOrderRequest $request): JsonResponse
    {
        $user = $request->user() ?? $request->user('sanctum');
        $sessionId = $request->input('session_id')
            ?: $request->header('X-Session-ID');

        // Sepet: auth user veya misafir session
        $cartQuery = CartItem::query()->with(['product', 'variant']);
        if ($user) {
            $cartQuery->where('user_id', $user->id);
        } else {
            if (! $sessionId) {
                return $this->error('Misafir sepeti bulunamadı. Sayfayı yenileyip tekrar deneyin.', 422);
            }
            $cartQuery->where('session_id', $sessionId)->whereNull('user_id');
        }
        $cartItems = $cartQuery->get();

        if ($cartItems->isEmpty()) {
            return $this->error('Sepetiniz bos. Siparis olusturulamadi.', 422);
        }

        // Adres: kayıtlı veya inline misafir
        $addressSnapshot = null;
        $guestEmail = null;
        $guestPhone = null;
        $guestName = null;

        if ($user && $request->filled('address_id')) {
            $address = Address::where('id', $request->address_id)
                ->where('user_id', $user->id)
                ->firstOrFail();
            $addressSnapshot = [
                'name' => $address->name,
                'phone' => $address->phone,
                'email' => $user->email,
                'city' => $address->city,
                'district' => $address->district,
                'neighborhood' => $address->neighborhood,
                'full_address' => $address->full_address,
                'zip_code' => $address->zip_code,
            ];
        } elseif ($request->filled('shipping')) {
            $shipping = $request->input('shipping');
            $guestEmail = strtolower(trim((string) ($shipping['email'] ?? $user?->email ?? '')));
            $guestPhone = trim((string) ($shipping['phone'] ?? ''));
            $guestName = trim((string) ($shipping['name'] ?? ''));
            if (! $user && $guestEmail === '') {
                return $this->error('Misafir sipariş için e-posta zorunludur.', 422);
            }
            $addressSnapshot = [
                'name' => $guestName,
                'phone' => $guestPhone,
                'email' => $guestEmail ?: $user?->email,
                'city' => $shipping['city'],
                'district' => $shipping['district'],
                'neighborhood' => $shipping['neighborhood'] ?? null,
                'full_address' => $shipping['full_address'],
                'zip_code' => $shipping['zip_code'] ?? null,
            ];
        } else {
            return $this->error('Teslimat adresi zorunludur.', 422);
        }

        $stockErrors = [];
        foreach ($cartItems as $item) {
            $product = $item->product;
            if (! $product?->id) {
                $stockErrors[] = 'Sepette urunu bulunamayan bir kayit var.';
                continue;
            }

            [$available] = $this->resolveAvailableStock(
                $product,
                $item->variant?->id ? $item->variant : null
            );

            if ($available !== null && $item->quantity > $available) {
                $stockErrors[] = sprintf(
                    '"%s" icin yeterli stok yok. Istenen: %d, Mevcut: %d',
                    $product->name,
                    $item->quantity,
                    (int) $available
                );
            }
        }

        if (! empty($stockErrors)) {
            return $this->error('Stok yetersizligi nedeniyle siparis olusturulamadi.', 422, $stockErrors);
        }

        $coupon = null;
        $subtotal = $cartItems->sum(fn ($item) => round($this->resolveUnitPrice($item) * $item->quantity, 2));
        $discountAmount = 0.0;

        if ($request->filled('coupon_code')) {
            $coupon = Coupon::valid()
                ->where('code', strtoupper($request->coupon_code))
                ->first();

            if (! $coupon) {
                return $this->error('Kupon gecersiz veya suresi dolmus.', 422);
            }

            if (($coupon->audience ?? 'public') === 'personal') {
                if (! $user || ! $coupon->isAssignedToUser($user->id)) {
                    return $this->error('Bu kupon hesabiniza tanimli degil.', 422);
                }
            }

            $discountAmount = $coupon->calculateDiscount($subtotal);
        }

        $shippingCost = 0.0;
        $total = max(0, $subtotal - $discountAmount + $shippingCost);

        $needsMeasurement = $cartItems->contains(function ($item) {
            return is_array($item->custom_measurements) && ! empty($item->custom_measurements);
        });
        $initialStatus = $needsMeasurement ? 'awaiting_measurement' : 'pending';

        try {
            $order = DB::transaction(function () use (
                $user,
                $guestEmail,
                $guestPhone,
                $guestName,
                $addressSnapshot,
                $cartItems,
                $coupon,
                $subtotal,
                $discountAmount,
                $shippingCost,
                $total,
                $request,
                $sessionId,
                $initialStatus
            ) {
                $order = Order::create([
                    'order_number' => Order::generateOrderNumber(),
                    'user_id' => $user?->id,
                    'guest_email' => $user ? null : $guestEmail,
                    'guest_phone' => $user ? null : $guestPhone,
                    'guest_name' => $user ? null : $guestName,
                    'coupon_id' => $coupon?->id,
                    'shipping_address' => $addressSnapshot,
                    'billing_address' => $addressSnapshot,
                    'subtotal' => $subtotal,
                    'discount_amount' => $discountAmount,
                    'shipping_cost' => $shippingCost,
                    'tax_amount' => 0.0,
                    'total' => $total,
                    'status' => $initialStatus,
                    'payment_status' => 'pending',
                    'payment_method' => $request->payment_method,
                    'notes' => $request->notes,
                ]);

                foreach ($cartItems as $cartItem) {
                    $product = $cartItem->product;
                    if (! $product?->id) {
                        throw new \RuntimeException('Sepette gecersiz urun bulundu.');
                    }

                    $variant = $cartItem->variant?->id ? $cartItem->variant : null;
                    [$availableStock, $stockSource] = $this->resolveAvailableStock($product, $variant);

                    if ($availableStock !== null && $cartItem->quantity > $availableStock) {
                        throw new \RuntimeException(sprintf(
                            '"%s" icin stok yetersiz. Istenen: %d, Mevcut: %d',
                            $product->name,
                            $cartItem->quantity,
                            $availableStock
                        ));
                    }

                    $unitPrice = $this->resolveUnitPrice($cartItem);
                    $customMeasurements = $cartItem->custom_measurements;

                    $order->items()->create([
                        'product_id' => $product->id,
                        'variant_id' => $variant?->id,
                        'product_name' => $product->name,
                        'variant_label' => $variant?->label,
                        'measurement_label' => $this->buildMeasurementLabel($customMeasurements),
                        'custom_measurements' => $customMeasurements,
                        'pricing_snapshot' => $cartItem->pricing_snapshot,
                        'stock_source' => $stockSource,
                        'sku' => $variant?->sku ?? $product->sku,
                        'unit_price' => $unitPrice,
                        'quantity' => $cartItem->quantity,
                        'subtotal' => round($unitPrice * $cartItem->quantity, 2),
                    ]);

                    if ($stockSource === 'variant' && $variant) {
                        ProductVariant::where('id', $variant->id)
                            ->decrement('stock', $cartItem->quantity);
                    } elseif ($stockSource === 'product') {
                        Product::where('id', $product->id)
                            ->decrement('stock', $cartItem->quantity);
                    }
                }

                if ($coupon) {
                    $coupon->increment('used_count');

                    if ($user && ($coupon->audience ?? 'public') === 'personal') {
                        $coupon->users()->updateExistingPivot($user->id, [
                            'used_count' => DB::raw('used_count + 1'),
                        ]);
                    }
                }

                if ($user) {
                    CartItem::where('user_id', $user->id)->delete();
                } elseif ($sessionId) {
                    CartItem::where('session_id', $sessionId)->whereNull('user_id')->delete();
                }

                return $order;
            });
        } catch (\RuntimeException $e) {
            return $this->error($e->getMessage(), 422);
        } catch (\Throwable $e) {
            return $this->error('Siparis olusturulamadi: ' . $e->getMessage(), 500);
        }

        OrderPlaced::dispatch($order->load(['user', 'items', 'coupon']));

        if ($initialStatus === 'awaiting_measurement') {
            \App\Events\OrderStatusChanged::dispatch($order, 'pending', 'awaiting_measurement');
        }

        return $this->created(
            new OrderDetailResource($order->load(['items.product.coverImage', 'coupon'])),
            'Siparisiniz basariyla olusturuldu.'
        );
    }

    public function cancel(Request $request, Order $order): JsonResponse
    {
        abort_unless($order->user_id === $request->user()->id, 403);

        if (! $order->is_cancellable) {
            return $this->error(
                match ($order->status) {
                    'shipped' => 'Kargoya verilmis siparis iptal edilemez.',
                    'delivered' => 'Teslim edilmis siparis iptal edilemez.',
                    'cancelled' => 'Siparis zaten iptal edilmis.',
                    default => 'Bu siparis iptal edilemez.',
                }
            );
        }

        DB::transaction(function () use ($order) {
            foreach ($order->items as $item) {
                $stockSource = $item->stock_source;

                if ($stockSource === 'variant' && $item->variant_id) {
                    ProductVariant::where('id', $item->variant_id)
                        ->increment('stock', $item->quantity);
                } elseif ($stockSource === 'product') {
                    Product::where('id', $item->product_id)
                        ->increment('stock', $item->quantity);
                } elseif (! $stockSource) {
                    if ($item->variant_id) {
                        ProductVariant::where('id', $item->variant_id)
                            ->increment('stock', $item->quantity);
                    } else {
                        Product::where('id', $item->product_id)
                            ->increment('stock', $item->quantity);
                    }
                }
            }

            $order->update(['status' => 'cancelled']);
        });

        return $this->success(new OrderDetailResource($order->fresh('items.product.coverImage')), 'Siparis iptal edildi.');
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

    private function buildMeasurementLabel(?array $customMeasurements): ?string
    {
        if (empty($customMeasurements)) {
            return null;
        }

        $width = isset($customMeasurements['width']) ? (float) $customMeasurements['width'] : null;
        $height = isset($customMeasurements['height']) ? (float) $customMeasurements['height'] : null;

        if ($width && $height) {
            return rtrim(rtrim(number_format($width, 2, '.', ''), '0'), '.')
                . 'x'
                . rtrim(rtrim(number_format($height, 2, '.', ''), '0'), '.')
                . ' cm';
        }

        return 'Custom measurements';
    }

    /**
     * GET /api/v1/admin/orders
     * Tum siparisler - filtrelenebilir
     */
    public function adminIndex(Request $request): JsonResponse
    {
        $orders = Order::with(['user', 'items'])
            ->when($request->status, fn ($q) => $q->byStatus($request->status))
            ->when($request->payment_status, fn ($q) => $q->where('payment_status', $request->payment_status))
            ->when($request->user_id, fn ($q) => $q->forUser((int) $request->user_id))
            ->when($request->search, fn ($q) => $q->where('order_number', 'ilike', "%{$request->search}%"))
            ->when($request->date_from, fn ($q) => $q->whereDate('created_at', '>=', $request->date_from))
            ->when($request->date_to, fn ($q) => $q->whereDate('created_at', '<=', $request->date_to))
            ->latest()
            ->paginate((int) ($request->per_page ?? 25));

        return $this->success(
            OrderResource::collection($orders),
            meta: [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'total' => $orders->total(),
            ]
        );
    }

    /**
     * GET /api/v1/admin/orders/{order}
     * Admin siparis detayi
     */
    public function adminShow(Order $order): JsonResponse
    {
        return $this->success(
            new OrderDetailResource($order->load(['user', 'items.product.coverImage', 'coupon'])),
            'Siparis detayi getirildi.'
        );
    }

    /**
     * PUT /api/v1/admin/orders/{order}/status
     * Siparis durumunu guncelle
     */
    public function updateStatus(Request $request, Order $order): JsonResponse
    {
        $request->validate([
            'status' => ['required', 'in:pending,awaiting_measurement,measure_ok,processing,shipped,delivered,cancelled,refunded'],
            'payment_status' => ['nullable', 'in:pending,paid,failed,refunded'],
            'tracking_number' => ['nullable', 'string', 'max:100'],
            'cargo_company' => ['nullable', 'string', 'max:50'],
            'admin_notes' => ['nullable', 'string'],
            'measurement_notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $previousStatus = $order->status;
        $data = $request->only(['status', 'payment_status', 'tracking_number', 'cargo_company', 'admin_notes', 'measurement_notes']);

        if ($request->filled('cargo_company')) {
            $data['cargo_company'] = app(CargoTrackingService::class)->normalizeCompany($request->cargo_company);
        }

        if ($request->status === 'shipped' && ! $order->shipped_at) {
            $data['shipped_at'] = now();
        }

        if ($request->status === 'delivered' && ! $order->delivered_at) {
            $data['delivered_at'] = now();
        }

        if ($request->status === 'measure_ok' && ! $order->measurement_confirmed_at) {
            $data['measurement_confirmed_at'] = now();
        }

        if (($data['status'] ?? null) === 'shipped' && empty($data['cargo_company']) && empty($order->cargo_company)) {
            $data['cargo_company'] = app(CargoTrackingService::class)->normalizeCompany(null);
        }

        $order->update($data);

        $fresh = $order->fresh(['items.product.coverImage', 'coupon', 'user']);

        if ($previousStatus !== $fresh->status) {
            \App\Events\OrderStatusChanged::dispatch($fresh, $previousStatus, $fresh->status);
        }

        return $this->success(
            new OrderDetailResource($fresh),
            'Siparis durumu guncellendi.'
        );
    }
}
