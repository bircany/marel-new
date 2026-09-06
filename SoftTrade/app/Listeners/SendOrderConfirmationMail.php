<?php

namespace App\Listeners;

use App\Events\OrderPlaced;
use App\Mail\OrderConfirmation;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Mail;

/**
 * OrderPlaced event'ini dinler ve sipariş onay e-postası gönderir.
 *
 * ShouldQueue interface'i sayesinde job kuyruğuna atar (non-blocking).
 * Queue bağlantısı: .env → QUEUE_CONNECTION=redis
 */
class SendOrderConfirmationMail implements ShouldQueue
{
    use InteractsWithQueue;

    /** Queue başarısız olursa kaç kez tekrar denenir */
    public int $tries = 3;

    /** Denemeler arasında bekleme süresi (saniye) */
    public int $backoff = 10;

    /**
     * Olayı ele al.
     */
    public function handle(OrderPlaced $event): void
    {
        $order = $event->order->load(['user', 'items', 'coupon']);
        $email = $order->notify_email;

        if (! $email) {
            \Illuminate\Support\Facades\Log::warning('Sipariş onay maili: alıcı e-posta yok', [
                'order_id' => $order->id,
            ]);

            return;
        }

        Mail::to($email)->send(new OrderConfirmation($order));
    }

    /**
     * Tüm denemeler başarısız olursa çağrılır.
     */
    public function failed(OrderPlaced $event, \Throwable $exception): void
    {
        // Opsiyonel: log veya admin bildirimi
        \Illuminate\Support\Facades\Log::error('Sipariş onay maili gönderilemedi', [
            'order_id' => $event->order->id,
            'error'    => $exception->getMessage(),
        ]);
    }
}
