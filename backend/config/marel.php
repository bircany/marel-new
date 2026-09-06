<?php

return [
    'iban' => env('MAREL_IBAN', 'TR00 0000 0000 0000 0000 0000 00'),
    'bank_name' => env('MAREL_BANK_NAME', 'Marel Havale Hesabı'),
    'account_holder' => env('MAREL_ACCOUNT_HOLDER', 'Marel'),
    'whatsapp_phone' => env('MAREL_WHATSAPP_PHONE', '905467356602'),
    'storefront_url' => env('FRONTEND_URL', 'http://localhost:3000'),
    'payment_note' => env(
        'MAREL_PAYMENT_NOTE',
        'Açıklamaya sipariş numaranızı yazın. Dekontu WhatsApp üzerinden gönderin.'
    ),
];
