<?php

namespace App\Http\Controllers\Api\V1\Payments;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    use ApiResponse;

    /** POST /api/v1/payments/initiate — Ödeme başlat */
    public function initiate(Request $request): JsonResponse
    {
        // TODO: İyzico / PayTr / Stripe entegrasyonu
        return $this->error('Ödeme entegrasyonu henüz uygulanmadı.', 501);
    }

    /** POST /api/v1/payments/callback — Ödeme sağlayıcıdan gelen callback */
    public function callback(Request $request): JsonResponse
    {
        // TODO: Ödeme doğrulama ve sipariş güncelleme
        return $this->success(message: 'Callback alındı.');
    }

    /** POST /api/v1/webhooks/payment — Webhook (Sanctum dışında) */
    public function webhook(Request $request): JsonResponse
    {
        // TODO: İmza doğrulama ve idempotent işlem
        return $this->success(message: 'Webhook işlendi.');
    }
}
