<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Varsayılan kargo firması
    |--------------------------------------------------------------------------
    | Admin panelinde seçilmezse kullanılır. Desteklenen: mng, yurtici, aras,
    | surat, ptt, hepsijet, sendeo, other
    */
    'default_company' => env('CARGO_DEFAULT_COMPANY', 'mng'),

    /*
    |--------------------------------------------------------------------------
    | MNG Kargo / DHL eCommerce Turkey (ApiZone)
    |--------------------------------------------------------------------------
    | Credential yoksa yalnız public takip URL kullanılır.
    | Portal: https://apizone.mngkargo.com.tr
    */
    'mng' => [
        'enabled' => (bool) env('MNG_CARGO_ENABLED', false),
        'base_url' => env('MNG_CARGO_BASE_URL', 'https://testapi.mngkargo.com.tr'),
        'client_id' => env('MNG_CARGO_CLIENT_ID'),
        'client_secret' => env('MNG_CARGO_CLIENT_SECRET'),
        'customer_number' => env('MNG_CARGO_CUSTOMER_NUMBER'),
        'password' => env('MNG_CARGO_PASSWORD'),
        'public_track_url' => 'https://www.mngkargo.com.tr/tr/online-islemler/gonderi-takip?kod={tracking}',
    ],

    'providers' => [
        'mng' => [
            'label' => 'MNG Kargo',
            'track_url' => 'https://www.mngkargo.com.tr/tr/online-islemler/gonderi-takip?kod={tracking}',
        ],
        'yurtici' => [
            'label' => 'Yurtiçi Kargo',
            'track_url' => 'https://www.yurticikargo.com/tr/online-servisler/gonderi-sorgula?code={tracking}',
        ],
        'aras' => [
            'label' => 'Aras Kargo',
            'track_url' => 'https://www.araskargo.com.tr/tr/kargo-takip?code={tracking}',
        ],
        'surat' => [
            'label' => 'Sürat Kargo',
            'track_url' => 'https://www.suratkargo.com.tr/KargoTakip/?kargotakipno={tracking}',
        ],
        'ptt' => [
            'label' => 'PTT Kargo',
            'track_url' => 'https://gonderitakip.ptt.gov.tr/Track/Verify?q={tracking}',
        ],
        'hepsijet' => [
            'label' => 'HepsiJet',
            'track_url' => 'https://www.hepsijet.com/gonderi-takibi/{tracking}',
        ],
        'sendeo' => [
            'label' => 'Sendeo',
            'track_url' => 'https://www.sendeo.com.tr/gonderi-takip?barcode={tracking}',
        ],
        'other' => [
            'label' => 'Diğer',
            'track_url' => null,
        ],
    ],
];
