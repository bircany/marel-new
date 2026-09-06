<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrderConfirmation extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly Order $order
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Siparişiniz Alındı — #{$this->order->order_number}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.orders.confirmation',
            with: [
                'order'    => $this->order,
                'user'     => $this->order->user,
                'customerName' => $this->order->customer_name,
                'items'    => $this->order->items,
                'address'  => $this->order->shipping_address,
                'iban' => config('marel.iban'),
                'bankName' => config('marel.bank_name'),
                'accountHolder' => config('marel.account_holder'),
                'paymentNote' => config('marel.payment_note'),
                'whatsappPhone' => config('marel.whatsapp_phone'),
                'trackPageUrl' => rtrim((string) config('marel.storefront_url'), '/').'/siparis-takip',
            ],
        );
    }
}
