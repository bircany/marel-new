<?php

namespace App\Http\Controllers\Api\V1\Reviews;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Review\StoreReviewRequest;
use App\Http\Resources\Api\V1\ReviewResource;
use App\Models\Order;
use App\Models\Product;
use App\Models\Review;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    use ApiResponse;

    /**
     * GET /api/v1/reviews/mine
     *
     * Giris yapmis kullanicinin kendi yorumlarini listeler.
     */
    public function myReviews(Request $request): JsonResponse
    {
        $reviews = Review::where('user_id', $request->user()->id)
            ->with('product')
            ->latest()
            ->paginate(20);

        return $this->success(
            ReviewResource::collection($reviews),
            'Yorumlariniz listelendi.',
            200,
            [
                'current_page' => $reviews->currentPage(),
                'last_page' => $reviews->lastPage(),
                'total' => $reviews->total(),
            ]
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/v1/products/{product:slug}/reviews
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Bir ürünün onaylanmış yorumlarını döner.
     */
    public function index(Request $request, Product $product): JsonResponse
    {
        $reviews = Review::where('product_id', $product->id)
            ->approved()
            ->with('user')
            ->withCount([]) // ek sayımlar gerekirse eklenebilir
            ->latest()
            ->paginate(15);

        $stats = [
            'total'   => $reviews->total(),
            'average' => Review::where('product_id', $product->id)
                ->approved()
                ->avg('rating')
                ? round(Review::where('product_id', $product->id)->approved()->avg('rating'), 1)
                : null,
            'distribution' => Review::where('product_id', $product->id)
                ->approved()
                ->selectRaw('rating, COUNT(*) as count')
                ->groupBy('rating')
                ->orderByDesc('rating')
                ->pluck('count', 'rating'),
        ];

        return $this->success(
            ReviewResource::collection($reviews),
            data: ['stats' => $stats],
            meta: [
                'current_page' => $reviews->currentPage(),
                'last_page'    => $reviews->lastPage(),
                'total'        => $reviews->total(),
            ]
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POST /api/v1/reviews
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Yorum oluştur.
     *
     * Kurallar:
     *  1. Kullanıcı bu ürünü satın almış olmalı (teslim edilmiş/confirmed siparişte olmalı)
     *  2. Aynı ürüne ikinci yorum yapılamaz
     *  3. Yorum varsayılan olarak 'pending' durumunda oluşur, admin onayı gerekir
     */
    public function store(StoreReviewRequest $request): JsonResponse
    {
        $user    = $request->user();
        $product = Product::findOrFail($request->product_id);

        // 1. Satın alma doğrulaması
        $hasPurchased = Order::where('user_id', $user->id)
            ->whereIn('status', ['delivered', 'confirmed', 'processing'])
            ->whereHas('items', fn ($q) => $q->where('product_id', $product->id))
            ->exists();

        if (! $hasPurchased) {
            return $this->error(
                'Yorum yapabilmek için bu ürünü satın almış ve siparişinizin teslim edilmiş olması gerekmektedir.',
                403
            );
        }

        // 2. Tekrar yorum kontrolü
        $alreadyReviewed = Review::where('user_id', $user->id)
            ->where('product_id', $product->id)
            ->exists();

        if ($alreadyReviewed) {
            return $this->error('Bu ürüne zaten bir yorum yaptınız.', 422);
        }

        $review = Review::create([
            'user_id'               => $user->id,
            'product_id'            => $product->id,
            'rating'                => $request->rating,
            'title'                 => $request->title,
            'comment'               => $request->comment,
            'status'                => 'pending',      // admin onayı bekliyor
            'is_verified_purchase'  => true,
        ]);

        return $this->created(
            new ReviewResource($review->load('user', 'product')),
            'Yorumunuz alındı. Admin onayından sonra yayınlanacaktır.'
        );
    }

    /**
     * PUT /api/v1/reviews/{review}
     *
     * Kullanici kendi yorumunu duzenleyebilir.
     * Onaylanmis yorum duzenlenince yeniden onaya (pending) alinir.
     */
    public function updateMine(Request $request, Review $review): JsonResponse
    {
        if ((int) $review->user_id !== (int) $request->user()->id) {
            return $this->forbidden('Bu yorumu duzenleme yetkiniz yok.');
        }

        $validated = $request->validate([
            'rating' => ['required', 'integer', 'between:1,5'],
            'title' => ['nullable', 'string', 'max:150'],
            'comment' => ['nullable', 'string', 'max:2000'],
        ], [
            'rating.required' => 'Puan zorunludur.',
            'rating.between' => 'Puan 1 ile 5 arasinda olmalidir.',
            'title.max' => 'Baslik en fazla 150 karakter olabilir.',
            'comment.max' => 'Yorum en fazla 2000 karakter olabilir.',
        ]);

        $review->update([
            'rating' => $validated['rating'],
            'title' => $validated['title'] ?? null,
            'comment' => $validated['comment'] ?? null,
            'status' => $review->status === 'approved' ? 'pending' : $review->status,
            'admin_note' => null,
        ]);

        return $this->success(
            new ReviewResource($review->fresh()->load('product')),
            'Yorumunuz guncellendi.'
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PUT /api/v1/admin/reviews/{review}/status
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Admin yorumu onayla veya reddet.
     */
    public function updateStatus(Request $request, Review $review): JsonResponse
    {
        $request->validate([
            'status'       => ['required', 'in:approved,rejected,pending'],
            'admin_note'   => ['nullable', 'string', 'max:300'],
        ]);

        $review->update([
            'status'     => $request->status,
            'admin_note' => $request->admin_note,
        ]);

        return $this->success(
            new ReviewResource($review->load('user', 'product')),
            match($request->status) {
                'approved' => 'Yorum onaylandı ve yayınlandı.',
                'rejected' => 'Yorum reddedildi.',
                default    => 'Yorum durumu güncellendi.',
            }
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/v1/admin/reviews
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Admin: tüm yorumları listele — filtrelenebilir.
     */
    public function adminIndex(Request $request): JsonResponse
    {
        $reviews = Review::with(['user', 'product'])
            ->when($request->status,  fn ($q) => $q->where('status', $request->status))
            ->when($request->rating,  fn ($q) => $q->where('rating', $request->rating))
            ->when($request->search,  fn ($q) => $q->whereHas(
                'product',
                fn ($p) => $p->where('name', 'ilike', "%{$request->search}%")
            ))
            ->latest()
            ->paginate(25);

        return $this->success(
            ReviewResource::collection($reviews),
            meta: ['total' => $reviews->total()]
        );
    }
}
