<?php

namespace App\Listeners;

use App\Events\OrderStatusChanged;
use App\Mail\OrderStatusMail;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendOrderStatusMail implements ShouldQueue
{
    use InteractsWithQueue;

    public int $tries = 3;

    public int $backoff = 10;

    /** Bildirim gönderilecek durumlar */
    private const NOTIFY_STATUSES = [
        'awaiting_measurement',
        'measure_ok',
        'processing',
        'shipped',
        'delivered',
        'cancelled',
    ];

    public function handle(OrderStatusChanged $event): void
    {
        if (! in_array($event->newStatus, self::NOTIFY_STATUSES, true)) {
            return;
        }

        $order = $event->order->loadMissing(['user', 'items', 'coupon']);
        $email = $order->notify_email;

        if (! $email) {
            Log::warning('Sipariş durum maili: alıcı e-posta yok', ['order_id' => $order->id]);

            return;
        }

        Mail::to($email)->send(new OrderStatusMail($order, $event->previousStatus, $event->newStatus));
    }

    public function failed(OrderStatusChanged $event, \Throwable $exception): void
    {
        Log::error('Sipariş durum maili gönderilemedi', [
            'order_id' => $event->order->id,
            'status' => $event->newStatus,
            'error' => $exception->getMessage(),
        ]);
    }
}
