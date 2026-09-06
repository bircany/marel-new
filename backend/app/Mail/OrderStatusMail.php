<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrderStatusMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly Order $order,
        public readonly string $previousStatus,
        public readonly string $newStatus,
    ) {}

    public function envelope(): Envelope
    {
        $subjects = [
            'awaiting_measurement' => 'Ölçü onayı bekleniyor',
            'measure_ok' => 'Ölçüleriniz onaylandı',
            'processing' => 'Siparişiniz üretime alındı',
            'shipped' => 'Siparişiniz kargoya verildi',
            'delivered' => 'Siparişiniz teslim edildi',
            'cancelled' => 'Siparişiniz iptal edildi',
        ];

        $label = $subjects[$this->newStatus] ?? 'Sipariş durumu güncellendi';

        return new Envelope(
            subject: "{$label} — #{$this->order->order_number}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.orders.status',
            with: [
                'order' => $this->order,
                'previousStatus' => $this->previousStatus,
                'newStatus' => $this->newStatus,
                'customerName' => $this->order->customer_name,
                'items' => $this->order->items,
                'address' => $this->order->shipping_address,
                'trackingUrl' => $this->order->tracking_number
                    ? app(\App\Services\CargoTrackingService::class)
                        ->trackingUrl($this->order->cargo_company, $this->order->tracking_number)
                    : null,
                'whatsappUrl' => $this->whatsappUrl(),
                'iban' => config('marel.iban'),
                'bankName' => config('marel.bank_name'),
                'accountHolder' => config('marel.account_holder'),
                'paymentNote' => config('marel.payment_note'),
                'trackPageUrl' => rtrim((string) config('marel.storefront_url'), '/').'/siparis-takip',
            ],
        );
    }

    private function whatsappUrl(): string
    {
        $phone = preg_replace('/\D+/', '', (string) config('marel.whatsapp_phone')) ?: '905467356602';
        $msg = match ($this->newStatus) {
            'shipped' => "Merhaba Marel, {$this->order->order_number} numaralı siparişimin kargo bilgisini almak istiyorum.",
            'delivered' => "Merhaba Marel, {$this->order->order_number} numaralı siparişim teslim edildi, teşekkürler.",
            'measure_ok' => "Merhaba Marel, {$this->order->order_number} ölçü onayı sonrası ödeme dekontumu iletmek istiyorum.",
            default => "Merhaba Marel, {$this->order->order_number} numaralı siparişim hakkında bilgi almak istiyorum.",
        };

        return 'https://wa.me/'.$phone.'?text='.rawurlencode($msg);
    }
}
