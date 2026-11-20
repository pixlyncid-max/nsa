<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Konfigurasi Dokumen Pendaftaran Anggota NSA
    |--------------------------------------------------------------------------
    |
    | Berkas dokumen persyaratan disimpan pada disk privat dan divalidasi
    | sesuai spesifikasi masing-masing jenis berkas.
    |
    */

    'ktp' => [
        'type' => 'ktp',
        'title' => 'Kartu Tanda Penduduk (KTP)',
        'description' => 'Foto atau pindaian KTP asli penanggung jawab usaha.',
        'required' => true,
        'multiple' => false,
        'max_files' => 1,
        'max_size_kb' => 2048,
        'allowed_mimes' => ['image/jpeg', 'image/png', 'application/pdf'],
        'allowed_extensions' => ['jpg', 'jpeg', 'png', 'pdf'],
    ],

    'passport' => [
        'type' => 'passport',
        'title' => 'Paspor (Warga Negara Asing)',
        'description' => 'Foto atau pindaian halaman identitas paspor yang masih berlaku.',
        'required' => false,
        'multiple' => false,
        'max_files' => 1,
        'max_size_kb' => 5120,
        'allowed_mimes' => ['image/jpeg', 'image/png', 'application/pdf'],
        'allowed_extensions' => ['jpg', 'jpeg', 'png', 'pdf'],
    ],

    'cbib' => [
        'type' => 'cbib',
        'title' => 'Sertifikat CBIB / CPIB',
        'description' => 'Pindaian sertifikat Cara Budidaya / Pembenihan Ikan yang Baik (CBIB / CPIB).',
        'required' => false,
        'multiple' => false,
        'max_files' => 1,
        'max_size_kb' => 5120,
        'allowed_mimes' => ['application/pdf', 'image/jpeg', 'image/png'],
        'allowed_extensions' => ['pdf', 'jpg', 'jpeg', 'png'],
    ],

    'nib' => [
        'type' => 'nib',
        'title' => 'Nomor Induk Berusaha (NIB)',
        'description' => 'Dokumen NIB resmi dari OSS berformat PDF atau gambar.',
        'required' => true,
        'multiple' => false,
        'max_files' => 1,
        'max_size_kb' => 5120,
        'allowed_mimes' => ['application/pdf', 'image/jpeg', 'image/png'],
        'allowed_extensions' => ['pdf', 'jpg', 'jpeg', 'png'],
    ],

    'npwp' => [
        'type' => 'npwp',
        'title' => 'NPWP Badan / Usaha',
        'description' => 'Kartu atau surat keterangan terdaftar NPWP badan (opsional).',
        'required' => false,
        'multiple' => false,
        'max_files' => 1,
        'max_size_kb' => 2048,
        'allowed_mimes' => ['application/pdf', 'image/jpeg', 'image/png'],
        'allowed_extensions' => ['pdf', 'jpg', 'jpeg', 'png'],
    ],

    'business_photo' => [
        'type' => 'business_photo',
        'title' => 'Foto Tempat / Kegiatan Usaha',
        'description' => 'Foto tambak, kolam, dermaga, gudang, atau armada usaha (minimal 1, maksimal 5).',
        'required' => true,
        'multiple' => true,
        'min_files' => 1,
        'max_files' => 5,
        'max_size_kb' => 3072,
        'allowed_mimes' => ['image/jpeg', 'image/png'],
        'allowed_extensions' => ['jpg', 'jpeg', 'png'],
    ],

    'deed' => [
        'type' => 'deed',
        'title' => 'Akta Pendirian',
        'description' => 'Akta notaris pendirian atau SK Kemenkumham (opsional, bila berbadan hukum).',
        'required' => false,
        'multiple' => false,
        'max_files' => 1,
        'max_size_kb' => 5120,
        'allowed_mimes' => ['application/pdf', 'image/jpeg', 'image/png'],
        'allowed_extensions' => ['pdf', 'jpg', 'jpeg', 'png'],
    ],

    'akta' => [
        'type' => 'akta',
        'title' => 'Akta Perusahaan / Notaris',
        'description' => 'Salinan akta pendirian atau perubahan perusahaan.',
        'required' => false,
        'multiple' => false,
        'max_files' => 1,
        'max_size_kb' => 5120,
        'allowed_mimes' => ['application/pdf', 'image/jpeg', 'image/png'],
        'allowed_extensions' => ['pdf', 'jpg', 'jpeg', 'png'],
    ],

    'sk_kemenkumham' => [
        'type' => 'sk_kemenkumham',
        'title' => 'SK Kemenkumham',
        'description' => 'Surat Keputusan pengesahan badan hukum.',
        'required' => false,
        'multiple' => false,
        'max_files' => 1,
        'max_size_kb' => 5120,
        'allowed_mimes' => ['application/pdf', 'image/jpeg', 'image/png'],
        'allowed_extensions' => ['pdf', 'jpg', 'jpeg', 'png'],
    ],

    'siup' => [
        'type' => 'siup',
        'title' => 'Surat Izin Usaha Perdagangan (SIUP)',
        'description' => 'Dokumen SIUP atau izin operasional sejenis.',
        'required' => false,
        'multiple' => false,
        'max_files' => 1,
        'max_size_kb' => 5120,
        'allowed_mimes' => ['application/pdf', 'image/jpeg', 'image/png'],
        'allowed_extensions' => ['pdf', 'jpg', 'jpeg', 'png'],
    ],

    'izin_lokasi' => [
        'type' => 'izin_lokasi',
        'title' => 'Izin Lokasi / PKKPR',
        'description' => 'Persetujuan Kesesuaian Kegiatan Pemanfaatan Ruang atau Izin Lokasi.',
        'required' => false,
        'multiple' => false,
        'max_files' => 1,
        'max_size_kb' => 5120,
        'allowed_mimes' => ['application/pdf', 'image/jpeg', 'image/png'],
        'allowed_extensions' => ['pdf', 'jpg', 'jpeg', 'png'],
    ],

    'other' => [
        'type' => 'other',
        'title' => 'Dokumen Pendukung Lainnya',
        'description' => 'Sertifikat kelayakan (CBIB, CPIB, HACCP, SKP) atau izin perikanan (opsional, maksimal 3).',
        'required' => false,
        'multiple' => true,
        'min_files' => 0,
        'max_files' => 3,
        'max_size_kb' => 5120,
        'allowed_mimes' => ['application/pdf', 'image/jpeg', 'image/png'],
        'allowed_extensions' => ['pdf', 'jpg', 'jpeg', 'png'],
    ],
];
