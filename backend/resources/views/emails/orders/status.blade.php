<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sipariş güncellemesi</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f4f4f5; color: #18181b; margin: 0; }
        .wrapper { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,.08); }
        .header { background: #0b1530; padding: 36px 28px; color: #fff; text-align: center; }
        .header h1 { font-size: 20px; margin: 0 0 8px; }
        .badge { display: inline-block; margin-top: 10px; background: rgba(217,183,95,.25); color: #d9b75f; padding: 4px 12px; border-radius: 999px; font-size: 13px; font-weight: 700; }
        .body { padding: 28px; }
        .box { background: #f8f7f3; border-radius: 8px; padding: 16px; margin: 16px 0; font-size: 14px; line-height: 1.6; }
        .btn { display: inline-block; margin: 8px 8px 0 0; padding: 12px 18px; border-radius: 8px; background: #111827; color: #fff !important; text-decoration: none; font-size: 14px; font-weight: 700; }
        .btn-wa { background: #128C7E; }
        .footer { padding: 20px 28px; text-align: center; font-size: 12px; color: #a1a1aa; }
    </style>
</head>
<body>
@php
    $labels = [
        'pending' => 'Sipariş alındı',
        'awaiting_measurement' => 'Ölçü onayı bekleniyor',
        'measure_ok' => 'Ölçü onaylandı',
        'processing' => 'Üretimde',
        'shipped' => 'Kargoya verildi',
        'delivered' => 'Teslim edildi',
        'cancelled' => 'İptal edildi',
        'refunded' => 'İade edildi',
    ];
@endphp
<div class="wrapper">
    <div class="header">
        <h1>{{ $labels[$newStatus] ?? 'Sipariş güncellendi' }}</h1>
        <p>Sipariş durumunuz değişti.</p>
        <span class="badge"># {{ $order->order_number }}</span>
    </div>
    <div class="body">
        <p>Merhaba <strong>{{ $customerName }}</strong>,</p>
        <p>Siparişiniz <strong>{{ $labels[$previousStatus] ?? $previousStatus }}</strong> durumundan <strong>{{ $labels[$newStatus] ?? $newStatus }}</strong> durumuna geçti.</p>

        @if($newStatus === 'shipped')
            <div class="box">
                <strong>Kargo:</strong> {{ $order->cargo_company ?: 'Marel kargo' }}<br>
                @if($order->tracking_number)
                    <strong>Takip no:</strong> {{ $order->tracking_number }}
                @endif
            </div>
            @if($trackingUrl)
                <a class="btn" href="{{ $trackingUrl }}">Kargoyu takip et</a>
            @endif
        @endif

        @if(in_array($newStatus, ['measure_ok', 'awaiting_measurement', 'processing'], true) && $order->payment_method === 'bank_transfer')
            <div class="box">
                <strong>Havale / EFT</strong><br>
                {{ $bankName }} — {{ $accountHolder }}<br>
                IBAN: <strong>{{ $iban }}</strong><br>
                {{ $paymentNote }}
            </div>
        @endif

        @if($newStatus === 'awaiting_measurement')
            <div class="box">Ölçüleriniz Marel ekibi tarafından teyit edilecek. Onay sonrası üretime alınır.</div>
        @endif

        @if($newStatus === 'measure_ok')
            <div class="box">Ölçüleriniz onaylandı. Ödeme dekontunu WhatsApp’tan iletebilirsiniz; ardından üretim başlar.</div>
        @endif

        <a class="btn" href="{{ $trackPageUrl }}">Sipariş takip</a>
        <a class="btn btn-wa" href="{{ $whatsappUrl }}">WhatsApp’tan yaz</a>
    </div>
    <div class="footer">© {{ date('Y') }} {{ config('app.name') }}</div>
</div>
</body>
</html>
