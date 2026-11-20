<?php

/**
 * Konfigurasi strip ajakan gabung keanggotaan di atas Footer (FooterJoinStrip).
 *
 * - visible_statuses: daftar status pengguna yang melihat strip ajakan.
 * - except_routes: daftar nama route (mendukung wildcard Str::is) untuk
 *   menyembunyikan strip pada halaman publik tertentu.
 * - images: path master & varian gambar latar dekoratif (dimasukkan belakangan).
 */
return [
    'visible_statuses' => [
        'guest',
        'non_member',
        'draft',
    ],

    'except_routes' => [],

    'images' => [
        'desktop' => [
            'master' => 'images/join-strip/join-strip-desktop.webp',
            'base' => 'images/join-strip/join-strip-desktop',
            'width' => 2560,
            'height' => 320,
            'widths' => [1280, 1920, 2560],
            'object_position' => 'center',
            'alt' => '',
        ],
        'mobile' => [
            'master' => 'images/join-strip/join-strip-mobile.webp',
            'base' => 'images/join-strip/join-strip-mobile',
            'width' => 1080,
            'height' => 720,
            'widths' => [540, 1080],
            'object_position' => 'center',
            'alt' => '',
        ],
    ],
];
