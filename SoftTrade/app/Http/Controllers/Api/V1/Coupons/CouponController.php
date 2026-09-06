<?php

namespace App\Http\Controllers\Api\V1\Coupons;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Coupon\StoreCouponRequest;
use App\Http\Requests\Api\V1\Coupon\UpdateCouponRequest;
use App\Http\Resources\Api\V1\CouponResource;
use App\Models\Coupon;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CouponController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Coupon::class);

        $coupons = Coupon::query()
            ->withCount('users')
            ->when($request->type, fn ($q) => $q->where('type', $request->type))
            ->when($request->audience, fn ($q) => $q->where('audience', $request->audience))
            ->when($request->is_active !== null, fn ($q) => $q->where('is_active', (bool) $request->is_active))
            ->when($request->search, fn ($q) => $q->where('code', 'ilike', "%{$request->search}%"))
            ->latest()
            ->paginate(25);

        return $this->success(CouponResource::collection($coupons), meta: ['total' => $coupons->total()]);
    }

    public function store(StoreCouponRequest $request): JsonResponse
    {
        $this->authorize('create', Coupon::class);

        $data = $request->validated();
        $userIds = $data['user_ids'] ?? [];
        unset($data['user_ids']);

        $coupon = Coupon::create($data);

        if (($coupon->audience ?? 'public') === 'personal' && !empty($userIds)) {
            $syncData = [];
            foreach ($userIds as $userId) {
                $syncData[$userId] = [
                    'assigned_by' => $request->user()->id,
                    'assigned_at' => now(),
                    'is_active' => true,
                ];
            }
            $coupon->users()->sync($syncData);
        }

        return $this->created(new CouponResource($coupon->fresh()->loadCount('users')), 'Kupon olusturuldu.');
    }

    public function show(Coupon $coupon): JsonResponse
    {
        $this->authorize('view', $coupon);

        $coupon->load('users:id,first_name,last_name,email');

        return $this->success([
            'coupon' => new CouponResource($coupon->loadCount('users')),
            'users' => $coupon->users->map(fn ($u) => [
                'id' => $u->id,
                'name' => $u->full_name,
                'email' => $u->email,
            ]),
        ]);
    }

    public function update(UpdateCouponRequest $request, Coupon $coupon): JsonResponse
    {
        $this->authorize('update', $coupon);

        $data = $request->validated();
        $userIds = $data['user_ids'] ?? null;
        unset($data['user_ids']);

        $coupon->update($data);

        if (($coupon->audience ?? 'public') === 'personal') {
            if (is_array($userIds)) {
                $syncData = [];
                foreach ($userIds as $userId) {
                    $syncData[$userId] = [
                        'assigned_by' => $request->user()->id,
                        'assigned_at' => now(),
                        'is_active' => true,
                    ];
                }
                $coupon->users()->sync($syncData);
            }
        } else {
            $coupon->users()->detach();
        }

        return $this->success(new CouponResource($coupon->fresh()->loadCount('users')), 'Kupon guncellendi.');
    }

    public function destroy(Coupon $coupon): JsonResponse
    {
        $this->authorize('delete', $coupon);

        if ($coupon->orders()->exists()) {
            return $this->error('Bu kupon siparislerde kullanildigi icin silinemez. Pasif yapabilirsiniz.', 422);
        }

        $coupon->delete();

        return $this->noContent();
    }

    /**
     * Kullaniciya gorunecek kuponlar:
     * - aktif public kuponlar
     * - kullaniciya atanmis aktif personal kuponlar
     */
    public function myCoupons(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $publicCoupons = Coupon::query()
            ->where('audience', 'public')
            ->where('is_active', true)
            ->where(function ($q) {
                $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
            })
            ->get();

        $personalCoupons = Coupon::query()
            ->where('audience', 'personal')
            ->where('is_active', true)
            ->whereHas('users', function ($q) use ($userId) {
                $q->where('users.id', $userId)
                  ->where('coupon_user.is_active', true)
                  ->where(function ($qq) {
                      $qq->whereNull('coupon_user.expires_at')->orWhere('coupon_user.expires_at', '>', now());
                  });
            })
            ->get();

        $coupons = $publicCoupons->concat($personalCoupons)->unique('id')->values();

        return $this->success(CouponResource::collection($coupons), 'Kuponlar listelendi.');
    }
}
