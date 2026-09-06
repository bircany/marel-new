<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Siparişiniz Alındı</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f4f4f5; color: #18181b; }
        .wrapper { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,.08); }
        .header { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 40px 32px; text-align: center; color: #fff; }
        .header h1 { font-size: 22px; font-weight: 700; letter-spacing: -0.5px; }
        .header p { margin-top: 6px; opacity: .85; font-size: 14px; }
        .badge { display: inline-block; margin-top: 12px; background: rgba(255,255,255,.2); color: #fff; padding: 4px 14px; border-radius: 999px; font-size: 13px; font-weight: 600; letter-spacing: .5px; }
        .body { padding: 32px; }
        .greeting { font-size: 16px; margin-bottom: 20px; color: #3f3f46; }
        .section-title { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #71717a; margin-bottom: 12px; }
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
        .items-table th { background: #f4f4f5; padding: 10px 12px; text-align: left; font-size: 12px; font-weight: 600; color: #52525b; }
        .items-table td { padding: 12px; font-size: 14px; border-bottom: 1px solid #f4f4f5; vertical-align: top; }
        .items-table tr:last-child td { border-bottom: none; }
        .items-table .product-name { font-weight: 600; color: #18181b; }
        .items-table .variant { font-size: 12px; color: #71717a; margin-top: 2px; }
        .price-col { text-align: right; white-space: nowrap; font-weight: 600; }
        .summary-box { background: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 24px; }
        .summary-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 14px; color: #52525b; }
        .summary-row.total { border-top: 1px solid #e4e4e7; margin-top: 8px; padding-top: 12px; font-weight: 700; color: #18181b; font-size: 16px; }
        .summary-row.discount { color: #16a34a; }
        .address-box { background: #f4f4f5; border-radius: 8px; padding: 16px; font-size: 14px; line-height: 1.6; color: #3f3f46; margin-bottom: 24px; }
        .footer { background: #f9fafb; padding: 24px 32px; text-align: center; border-top: 1px solid #f0f0f0; }
        .footer p { font-size: 12px; color: #a1a1aa; line-height: 1.6; }
        .footer a { color: #3b82f6; text-decoration: none; }
    </style>
</head>
<body>
<div class="wrapper">

    {{-- ─── Header ─── --}}
    <div class="header">
        <h1>✓ Siparişiniz Alındı!</h1>
        <p>Siparişinizi aldık ve hazırlanmaya başlıyoruz.</p>
        <span class="badge"># {{ $order->order_number }}</span>
    </div>

    <div class="body">

        {{-- ─── Selamlama ─── --}}
        <p class="greeting">
            Merhaba <strong>{{ $customerName ?? $user?->full_name ?? 'Müşteri' }}</strong>, sipariş özetiniz aşağıda yer almaktadır.
        </p>

        {{-- ─── Ürünler ─── --}}
        <p class="section-title">Sipariş Kalemleri</p>
        <table class="items-table">
            <thead>
                <tr>
                    <th>Ürün</th>
                    <th style="text-align:right">Adet</th>
                    <th style="text-align:right">Tutar</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($items as $item)
                <tr>
                    <td>
                        <div class="product-name">{{ $item->product_name }}</div>
                        @if($item->variant_label)
                        <div class="variant">{{ $item->variant_label }}</div>
                        @endif
                    </td>
                    <td class="price-col">{{ $item->quantity }}</td>
                    <td class="price-col">
                        {{ number_format($item->subtotal, 2, ',', '.') }} ₺
                    </td>
                </tr>
                @endforeach
            </tbody>
        </table>

        {{-- ─── Fiyat Özeti ─── --}}
        <p class="section-title">Fiyat Özeti</p>
        <div class="summary-box">
            <div class="summary-row">
                <span>Ara Toplam</span>
                <span>{{ number_format($order->subtotal, 2, ',', '.') }} ₺</span>
            </div>
            @if($order->discount_amount > 0)
            <div class="summary-row discount">
                <span>İndirim (Kupon)</span>
                <span>- {{ number_format($order->discount_amount, 2, ',', '.') }} ₺</span>
            </div>
            @endif
            @if($order->shipping_cost > 0)
            <div class="summary-row">
                <span>Kargo</span>
                <span>{{ number_format($order->shipping_cost, 2, ',', '.') }} ₺</span>
            </div>
            @endif
            <div class="summary-row total">
                <span>Genel Toplam</span>
                <span>{{ number_format($order->total, 2, ',', '.') }} ₺</span>
            </div>
        </div>

        {{-- ─── Teslimat Adresi ─── --}}
        <p class="section-title">Teslimat Adresi</p>
        <div class="address-box">
            <strong>{{ $address['name'] ?? '' }}</strong><br>
            {{ $address['full_address'] ?? '' }}<br>
            {{ $address['district'] ?? '' }}, {{ $address['city'] ?? '' }}
            @if(!empty($address['zip_code'])) {{ $address['zip_code'] }} @endif
            <br>
            📱 {{ $address['phone'] ?? '' }}
        </div>

        {{-- ─── Ödeme bilgisi ─── --}}
        <p class="section-title">Ödeme Yöntemi</p>
        <div class="address-box">
            {{ match($order->payment_method) {
                'bank_transfer'   => '🏦 Havale / EFT (WhatsApp dekont)',
                'cash_on_delivery'=> '💰 Kapıda Ödeme',
                default           => $order->payment_method
            } }}
            — {{ $order->payment_status === 'paid' ? '✅ Ödendi' : '⏳ Ödeme Bekleniyor' }}
        </div>

        @if($order->payment_method === 'bank_transfer')
        <p class="section-title" style="margin-top:20px">Havale Bilgileri</p>
        <div class="address-box" style="margin-bottom:0">
            <strong>{{ $bankName ?? '' }}</strong> — {{ $accountHolder ?? '' }}<br>
            IBAN: <strong>{{ $iban ?? '' }}</strong><br>
            {{ $paymentNote ?? '' }}<br>
            WhatsApp: {{ $whatsappPhone ?? '' }}
        </div>
        @endif

    </div>

    {{-- ─── Footer ─── --}}
    <div class="footer">
        <p>
            Sipariş durumunuzu <a href="{{ $trackPageUrl ?? config('app.url') }}">Sipariş Takip</a> sayfasından izleyebilirsiniz.<br>
            Sorularınız için <a href="mailto:{{ config('mail.from.address') }}">{{ config('mail.from.address') }}</a> adresine yazabilirsiniz.<br><br>
            <span style="color:#d4d4d8">© {{ date('Y') }} {{ config('app.name') }}. Tüm hakları saklıdır.</span>
        </p>
    </div>

</div>
</body>
</html>
