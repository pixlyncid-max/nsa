<?php

return [
    /*
    | Dokumen legalitas yang diwajibkan berdasarkan kategori kegiatan pendaftar.
    | Format: ['Nama Kategori' => ['tipe_dokumen_1', 'tipe_dokumen_2']]
    */
    'required_legalities' => [
        'Eksportir' => ['nib'],
        'Pengolah' => ['nib'],
    ],

    /*
    | Pengaturan KTP untuk WNI (fallback jika belum diset di tabel settings).
    */
    'require_ktp_for_wni' => true,
];
