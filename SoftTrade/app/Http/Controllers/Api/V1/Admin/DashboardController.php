<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\OrderResource;
use App\Http\Resources\Api\V1\ProductResource;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    use ApiResponse;

    /**
     * GET /api/v1/admin/dashboard
     *
     * Dönen veriler:
     *  - bugünkü sipariş sayısı ve geliri
     *  - bu ayki sipariş sayısı ve geliri
     *  - toplam kullanıcı sayısı
     *  - stok azalan ürünler (stock < 10)
     *  - son 5 sipariş
     *  - ürün, kategori, marka sayıları
     */
    public function index(Request $request): JsonResponse
    {
        $today     = now()->startOfDay();
        $monthStart= now()->startOfMonth();
        $threshold = (int) ($request->stock_threshold ?? 10);

        // ── Bugünkü istatistikler ──────────────────────────────────────────
        $todayStats = Order::query()
            ->whereDate('created_at', today())
            ->whereNotIn('status', ['cancelled'])
            ->selectRaw('COUNT(*) as count, COALESCE(SUM(total), 0) as revenue')
            ->first();

        // ── Bu ayki istatistikler ──────────────────────────────────────────
        $monthStats = Order::query()
            ->where('created_at', '>=', $monthStart)
            ->whereNotIn('status', ['cancelled'])
            ->selectRaw('COUNT(*) as count, COALESCE(SUM(total), 0) as revenue')
            ->first();

        // ── Ödeme istatistikleri ──────────────────────────────────────────
        $paidRevenue = Order::query()
            ->where('payment_status', 'paid')
            ->whereNotIn('status', ['cancelled'])
            ->sum('total');

        // ── Kullanıcı sayısı ─────────────────────────────────────────────
        $userStats = [
            'total'      => User::count(),
            'this_month' => User::where('created_at', '>=', $monthStart)->count(),
            'admins'     => User::where('role', 'admin')->count(),
        ];

        // ── Sipariş durum dağılımı ────────────────────────────────────────
        $orderStatusDist = Order::selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        // ── Son 5 sipariş ─────────────────────────────────────────────────
        $recentOrders = Order::with('user')
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn ($o) => [
                'id'             => $o->id,
                'order_number'   => $o->order_number,
                'customer'       => $o->user?->full_name,
                'total'          => (float) $o->total,
                'formatted_total'=> number_format((float) $o->total, 2, ',', '.') . ' ₺',
                'status'         => $o->status,
                'payment_status' => $o->payment_status,
                'created_at'     => $o->created_at->diffForHumans(),
            ]);

        // ── Stok azalan ürünler ───────────────────────────────────────────
        $lowStockProducts = Product::with('coverImage')
            ->where('stock', '<=', $threshold)
            ->where('status', 'active')
            ->orderBy('stock')
            ->limit(20)
            ->get()
            ->map(fn ($p) => [
                'id'          => $p->id,
                'name'        => $p->name,
                'slug'        => $p->slug,
                'stock'       => $p->stock,
                'sku'         => $p->sku,
                'cover_image' => $p->coverImage
                    ? asset('storage/' . $p->coverImage->path)
                    : null,
            ]);

        // ── En çok satan ürünler (son 30 gün) ────────────────────────────
        $topProducts = DB::table('order_items')
            ->join('products', 'products.id', '=', 'order_items.product_id')
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->where('orders.created_at', '>=', now()->subDays(30))
            ->whereNotIn('orders.status', ['cancelled'])
            ->selectRaw('
                order_items.product_id,
                order_items.product_name,
                SUM(order_items.quantity) as total_sold,
                SUM(order_items.subtotal) as total_revenue
            ')
            ->groupBy('order_items.product_id', 'order_items.product_name')
            ->orderByDesc('total_sold')
            ->limit(5)
            ->get();

        // ── Sayımlar ──────────────────────────────────────────────────────
        $counts = [
            'products'   => Product::count(),
            'active'     => Product::where('status', 'active')->count(),
            'categories' => Category::count(),
            'brands'     => Brand::count(),
            'orders'     => Order::count(),
            'pending_orders' => Order::where('status', 'pending')->count(),
        ];

        return $this->success([
            'today'  => [
                'orders'          => (int) $todayStats->count,
                'revenue'         => (float) $todayStats->revenue,
                'formatted_revenue' => number_format((float) $todayStats->revenue, 2, ',', '.') . ' ₺',
            ],
            'this_month' => [
                'orders'          => (int) $monthStats->count,
                'revenue'         => (float) $monthStats->revenue,
                'formatted_revenue' => number_format((float) $monthStats->revenue, 2, ',', '.') . ' ₺',
            ],
            'total_paid_revenue'   => (float) $paidRevenue,
            'formatted_paid_revenue' => number_format((float) $paidRevenue, 2, ',', '.') . ' ₺',

            'users'            => $userStats,
            'counts'           => $counts,
            'order_status_distribution' => $orderStatusDist,

            'recent_orders'    => $recentOrders,
            'top_products'     => $topProducts,
            'low_stock'        => [
                'threshold' => $threshold,
                'products'  => $lowStockProducts,
                'count'     => $lowStockProducts->count(),
            ],

            'generated_at'     => now()->toIso8601String(),
        ]);
    }
}
