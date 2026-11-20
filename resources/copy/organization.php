<?php

return [
    'organization.header.title' => [
        'label' => 'Judul Halaman Organisasi',
        'hint' => 'Organisasi → PageHeader',
        'type' => 'text',
        'default' => 'Struktur Organisasi NSA',
        'max' => 80,
        'placeholders' => [],
    ],
    'organization.dpp.title' => [
        'label' => 'Judul Bagian DPP',
        'hint' => 'Organisasi → Halaman DPP',
        'type' => 'text',
        'default' => 'Dewan Pengurus Pusat (DPP)',
        'max' => 80,
        'placeholders' => [],
    ],
    'organization.dpw.empty' => [
        'label' => 'Pesan DPW Belum Terbentuk',
        'hint' => 'Organisasi → DPW saat provinsi belum memiliki pengurus',
        'type' => 'textarea',
        'default' => 'Dewan Pengurus Wilayah untuk provinsi ini belum terbentuk. Hubungi sekretariat DPP untuk inisiasi pembentukan.',
        'max' => 200,
        'placeholders' => [],
    ],
    'organization.dpc.title' => [
        'label' => 'Judul Bagian DPC',
        'hint' => 'Organisasi → Halaman DPC',
        'type' => 'text',
        'default' => 'Dewan Pengurus Cabang (DPC)',
        'max' => 80,
        'placeholders' => [],
    ],
];
