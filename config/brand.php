<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Konfigurasi Brand & Identitas Organisasi
    |--------------------------------------------------------------------------
    |
    | Seluruh identitas organisasi dipusatkan di sini agar tidak tercecer di
    | berbagai file kode. Nilai default dapat ditimpa melalui tabel `settings`
    | oleh Superadmin melalui CMS Admin atau variabel environment (.env).
    |
    */

    'name' => env('BRAND_NAME', 'NSA (Nusantara Sustainable Aquatic)'),
    'short_name' => env('BRAND_SHORT_NAME', 'NSA'),
    'tagline' => env('BRAND_TAGLINE', 'Asosiasi Akuakultur dan Perikanan Berkelanjutan Nusantara'),
    'domain' => env('BRAND_DOMAIN', 'nsa.or.id'),
    'portal_name' => env('BRAND_PORTAL_NAME', 'Portal Anggota'),
    'support_phone' => env('BRAND_SUPPORT_PHONE', '+62 812-3456-7890'),
    'support_email' => env('BRAND_SUPPORT_EMAIL', 'info@nsa.or.id'),
    'address' => env('BRAND_ADDRESS', 'Jl. Pajajaran No. 128, Baranangsiang, Bogor, Jawa Barat 16143'),

    // Slot logo (relatif ke disk public Storage)
    'logo_light' => env('BRAND_LOGO_LIGHT', null),
    'logo_dark' => env('BRAND_LOGO_DARK', null),
    'logo' => [
        // Override opsional: 'original' | 'mono-white' | 'white-badge' (null = deteksi otomatis)
        'footer_mode' => env('BRAND_LOGO_FOOTER_MODE', null),
    ],

    'social' => [
        'instagram' => env('BRAND_SOCIAL_INSTAGRAM', 'https://instagram.com/nsa_indonesia'),
        'facebook' => env('BRAND_SOCIAL_FACEBOOK', 'https://facebook.com/nsaofficial'),
        'youtube' => env('BRAND_SOCIAL_YOUTUBE', 'https://youtube.com/@nsa_indonesia'),
        'linkedin' => env('BRAND_SOCIAL_LINKEDIN', 'https://linkedin.com/company/nsa-indonesia'),
    ],
];
