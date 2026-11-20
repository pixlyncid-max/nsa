<?php

return [
    'articles.header.title' => [
        'label' => 'Judul Halaman Artikel',
        'hint' => 'Artikel → PageHeader daftar artikel',
        'type' => 'text',
        'default' => 'Artikel & Wawasan Akuakultur',
        'max' => 80,
        'placeholders' => [],
    ],
    'articles.search.placeholder' => [
        'label' => 'Placeholder Pencarian Artikel',
        'hint' => 'Artikel → Kolom pencarian',
        'type' => 'text',
        'default' => 'Cari artikel atau topik budidaya...',
        'max' => 80,
        'placeholders' => [],
    ],
    'articles.detail.read_time' => [
        'label' => 'Format Waktu Baca',
        'hint' => 'Artikel → Detail artikel (placeholder: {minutes})',
        'type' => 'text',
        'default' => '{minutes} menit baca',
        'max' => 40,
        'placeholders' => ['minutes'],
    ],
];
