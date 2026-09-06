<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Auth\LoginRequest;
use App\Http\Requests\Api\V1\Auth\RegisterRequest;
use App\Http\Resources\Api\V1\UserResource;
use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    use ApiResponse;

    /**
     * POST /api/v1/auth/register
     *
     * Yeni kullanıcı kaydı oluşturur ve Sanctum token döner.
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            'first_name' => $request->first_name,
            'last_name'  => $request->last_name,
            'email'      => $request->email,
            'phone'      => $request->phone,
            'password'   => $request->password, // casts: 'hashed' ile otomatik hash
            'role'       => 'user',
        ]);

        $deviceName = $request->device_name ?? ($request->userAgent() ?? 'api-client');
        $token = $user->createToken($deviceName)->plainTextToken;

        return $this->created([
            'user'         => new UserResource($user),
            'access_token' => $token,
            'token_type'   => 'Bearer',
        ], 'Hesabınız başarıyla oluşturuldu.');
    }

    /**
     * POST /api/v1/auth/login
     *
     * Kullanıcı girişi yapar. Başarılıysa Sanctum token döner.
     *
     * Misafir sepeti birleştirme:
     * Frontend, giriş sonrasında session_id'yi (localStorage'dan) gönderir.
     * Bu sayede misafir cart_items, user_id'ye assign edilir.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return $this->error('Bu e-posta adresi ile kayıtlı bir kullanıcı bulunamadı.', 401);
        }

        if (!Hash::check($request->password, $user->password)) {
            return $this->error('Girdiğiniz şifre hatalı. Lütfen kontrol edip tekrar deneyin.', 401);
        }

        if (! $user->is_active) {
            return $this->error('Hesabınız askıya alınmış. Lütfen destek ile iletişime geçin.', 403);
        }

        // Önceki tüm cihaz tokenlerini iptal et (opsiyonel davranış)
        // $user->tokens()->delete();

        $deviceName = $request->device_name ?? ($request->userAgent() ?? 'api-client');
        $token = $user->createToken($deviceName)->plainTextToken;

        // Misafir sepetini kullanıcıya aktar
        if ($request->filled('session_id')) {
            $this->mergeGuestCart($user->id, $request->session_id);
        }

        return $this->success([
            'user'         => new UserResource($user),
            'access_token' => $token,
            'token_type'   => 'Bearer',
        ], 'Giriş başarılı.');
    }

    /**
     * POST /api/v1/auth/logout
     *
     * Mevcut Sanctum tokenını iptal eder.
     */
    public function logout(Request $request): JsonResponse
    {
        // Sadece mevcut cihazın tokenını sil
        $request->user()->currentAccessToken()->delete();

        return $this->success(message: 'Çıkış yapıldı.');
    }

    /**
     * GET /api/v1/auth/me
     *
     * Giriş yapmış kullanıcının bilgilerini döner.
     */
    public function me(Request $request): JsonResponse
    {
        return $this->success(new UserResource($request->user()));
    }

    /**
     * POST /api/v1/auth/refresh
     *
     * Mevcut tokenı iptal edip yeni bir token üretir.
     */
    public function refresh(Request $request): JsonResponse
    {
        $user = $request->user();
        $deviceName = $request->device_name ?? $user->currentAccessToken()->name;

        // Eski tokenı sil
        $user->currentAccessToken()->delete();

        // Yeni token üret
        $token = $user->createToken($deviceName)->plainTextToken;

        return $this->success([
            'access_token' => $token,
            'token_type'   => 'Bearer',
        ], 'Token yenilendi.');
    }

    // ── Yardımcı ─────────────────────────────────────────────────────────────

    /**
     * Misafir oturumundaki sepet öğelerini giriş yapan kullanıcıya aktar.
     *
     * Misafir sepet mantığı:
     * - Frontend her misafir için UUID üretir (localStorage'da saklanır)
     * - Bu UUID, cart_items.session_id sütununa kaydedilir
     * - Kullanıcı giriş yaptığında session_id payload'da gönderilir
     * - Çakışan ürünlerde miktarlar toplanır
     */
    private function mergeGuestCart(int $userId, string $sessionId): void
    {
        $guestItems = \App\Models\CartItem::whereNull('user_id')
                                         ->where('session_id', $sessionId)
                                         ->get();

        foreach ($guestItems as $guestItem) {
            $existing = \App\Models\CartItem::where('user_id', $userId)
                                            ->where('product_id', $guestItem->product_id)
                                            ->where('variant_id', $guestItem->variant_id)
                                            ->first();
            if ($existing) {
                // Çakışma: miktarları topla
                $existing->increment('quantity', $guestItem->quantity);
                $guestItem->delete();
            } else {
                // Yeni ürün: kullanıcıya assign et
                $guestItem->update([
                    'user_id'    => $userId,
                    'session_id' => null,
                ]);
            }
        }
    }
}
