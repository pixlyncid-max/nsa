<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Konfigurasi Form Dinamis Aktivitas Perikanan
    |--------------------------------------------------------------------------
    |
    | Konfigurasi ini mendefinisikan field spesifik yang ditampilkan pada
    | Langkah 4 (Aktivitas Perikanan) berdasarkan kategori keanggotaan pendaftar.
    | Validasi di sisi server (ActivityFormRules) diturunkan langsung dari config ini.
    |
    */

    'categories' => [
        'pembudidaya' => [
            'title' => 'Aktivitas Budidaya Perikanan',
            'description' => 'Isi data komoditas, sistem budidaya, jumlah kolam, dan estimasi kapasitas produksi Anda.',
            'is_skippable' => false,
            'fields' => [
                'fish_category_id' => [
                    'label' => 'Komoditas Ikan / Udang',
                    'type' => 'select_fish',
                    'required' => true,
                    'validation' => ['required', 'integer', 'exists:fish_categories,id'],
                ],
                'farming_system' => [
                    'label' => 'Sistem Budidaya',
                    'type' => 'select',
                    'options' => [
                        'Kolam Tanah',
                        'Kolam Terpal',
                        'Kolam Beton',
                        'Keramba Jaring Apung (KJA)',
                        'Tambak Tradisional',
                        'Tambak Intensif',
                        'Bioflok',
                        'RAS (Recirculating Aquaculture System)',
                        'Aquaponik',
                        'Lainnya',
                    ],
                    'required' => true,
                    'validation' => ['required', 'string', 'max:100'],
                ],
                'pond_count' => [
                    'label' => 'Jumlah Kolam / Petak / Wadah',
                    'type' => 'number',
                    'unit' => 'unit',
                    'placeholder' => 'Contoh: 12',
                    'required' => false,
                    'validation' => ['nullable', 'integer', 'min:0'],
                ],
                'production_amount' => [
                    'label' => 'Estimasi Hasil Produksi',
                    'type' => 'number_unit_period',
                    'default_unit' => 'ton',
                    'default_period' => 'per siklus',
                    'units' => ['kg', 'ton', 'ekor'],
                    'periods' => ['per siklus', 'per bulan', 'per tahun'],
                    'required' => false,
                    'validation' => ['nullable', 'numeric', 'min:0'],
                ],
                'seed_need' => [
                    'label' => 'Kebutuhan Benih per Siklus',
                    'type' => 'text',
                    'placeholder' => 'Contoh: 20.000 ekor',
                    'required' => false,
                    'validation' => ['nullable', 'string', 'max:150'],
                ],
                'feed_need' => [
                    'label' => 'Kebutuhan Pakan per Siklus',
                    'type' => 'text',
                    'placeholder' => 'Contoh: 2 ton pellet apung',
                    'required' => false,
                    'validation' => ['nullable', 'string', 'max:150'],
                ],
                'notes' => [
                    'label' => 'Catatan Tambahan Budidaya',
                    'type' => 'textarea',
                    'placeholder' => 'Keterangan teknis kolam, sumber air, atau riwayat panen...',
                    'required' => false,
                    'validation' => ['nullable', 'string', 'max:500'],
                ],
            ],
        ],

        'pembenih' => [
            'title' => 'Aktivitas Pembenihan / Hatchery',
            'description' => 'Isi data komoditas benih/larva, kapasitas produksi, dan metode pembenihan yang dijalankan.',
            'is_skippable' => false,
            'fields' => [
                'fish_category_id' => [
                    'label' => 'Komoditas Benih',
                    'type' => 'select_fish',
                    'required' => true,
                    'validation' => ['required', 'integer', 'exists:fish_categories,id'],
                ],
                'farming_system' => [
                    'label' => 'Metode Pembenihan / Fasilitas',
                    'type' => 'select',
                    'options' => [
                        'Hatchery Semi-Alami',
                        'Hatchery Buatan (Induced Breeding)',
                        'Kolam Pendederan',
                        'Indoor Hatchery & Bak Kaca',
                        'Lainnya',
                    ],
                    'required' => true,
                    'validation' => ['required', 'string', 'max:100'],
                ],
                'pond_count' => [
                    'label' => 'Jumlah Bak / Kolam Pembenihan',
                    'type' => 'number',
                    'unit' => 'bak',
                    'placeholder' => 'Contoh: 8',
                    'required' => false,
                    'validation' => ['nullable', 'integer', 'min:0'],
                ],
                'production_amount' => [
                    'label' => 'Kapasitas Produksi Benih',
                    'type' => 'number_unit_period',
                    'default_unit' => 'ekor',
                    'default_period' => 'per siklus',
                    'units' => ['ekor', 'kantong', 'larva'],
                    'periods' => ['per siklus', 'per bulan', 'per tahun'],
                    'required' => false,
                    'validation' => ['nullable', 'numeric', 'min:0'],
                ],
                'notes' => [
                    'label' => 'Catatan Pembenihan',
                    'type' => 'textarea',
                    'placeholder' => 'Spesifikasi ukuran benih, strain indukan bersertifikat...',
                    'required' => false,
                    'validation' => ['nullable', 'string', 'max:500'],
                ],
            ],
        ],

        'buyer' => [
            'title' => 'Aktivitas Pembelian & Distribusi Komoditas',
            'description' => 'Isi data komoditas yang dicari, estimasi kapasitas pembelian, dan spesifikasi yang diminati.',
            'is_skippable' => false,
            'fields' => [
                'fish_category_id' => [
                    'label' => 'Komoditas yang Dibeli / Diperdagangkan',
                    'type' => 'select_fish',
                    'required' => true,
                    'validation' => ['required', 'integer', 'exists:fish_categories,id'],
                ],
                'purchase_capacity' => [
                    'label' => 'Kapasitas Serap / Pembelian',
                    'type' => 'number_unit_period',
                    'default_unit' => 'ton',
                    'default_period' => 'per bulan',
                    'units' => ['ton', 'kg', 'kontainer'],
                    'periods' => ['per minggu', 'per bulan', 'per tahun'],
                    'required' => false,
                    'validation' => ['nullable', 'string', 'max:100'],
                ],
                'notes' => [
                    'label' => 'Kriteria & Spesifikasi Pembelian',
                    'type' => 'textarea',
                    'placeholder' => 'Contoh: Ukuran 500-800 gram, kondisi hidup atau segar es, siap terima pasokan rutin...',
                    'required' => false,
                    'validation' => ['nullable', 'string', 'max:500'],
                ],
            ],
        ],

        'pengolah' => [
            'title' => 'Aktivitas Pengolahan Hasil Perikanan',
            'description' => 'Isi data bahan baku ikan yang diolah, jenis pengolahan, dan kapasitas produksi olahan Anda.',
            'is_skippable' => false,
            'fields' => [
                'fish_category_id' => [
                    'label' => 'Bahan Baku Ikan Utama',
                    'type' => 'select_fish',
                    'required' => true,
                    'validation' => ['required', 'integer', 'exists:fish_categories,id'],
                ],
                'farming_system' => [
                    'label' => 'Jenis Fasilitas Pengolahan',
                    'type' => 'select',
                    'options' => [
                        'Fillet & Pembekuan (Cold Storage)',
                        'Pengeringan & Pengasapan',
                        'Surimi & Olahan Daging Ikan',
                        'Pengalengan',
                        'Tepung & Minyak Ikan',
                        'Lainnya',
                    ],
                    'required' => true,
                    'validation' => ['required', 'string', 'max:100'],
                ],
                'production_amount' => [
                    'label' => 'Kapasitas Produksi Olahan',
                    'type' => 'number_unit_period',
                    'default_unit' => 'ton',
                    'default_period' => 'per bulan',
                    'units' => ['ton', 'kg'],
                    'periods' => ['per hari', 'per bulan', 'per tahun'],
                    'required' => false,
                    'validation' => ['nullable', 'numeric', 'min:0'],
                ],
                'purchase_capacity' => [
                    'label' => 'Kebutuhan Pasokan Bahan Baku',
                    'type' => 'text',
                    'placeholder' => 'Contoh: 10 ton ikan patin segar per minggu',
                    'required' => false,
                    'validation' => ['nullable', 'string', 'max:100'],
                ],
                'notes' => [
                    'label' => 'Keterangan Produk Olahan',
                    'type' => 'textarea',
                    'placeholder' => 'Merek produk olahan, standar sertifikasi HACCP/SKP...',
                    'required' => false,
                    'validation' => ['nullable', 'string', 'max:500'],
                ],
            ],
        ],

        'pakan-sarana' => [
            'title' => 'Aktivitas Pakan & Sarana Akuakultur',
            'description' => 'Isi data jenis sarana produksi perikanan yang diproduksi atau didistribusikan.',
            'is_skippable' => false,
            'fields' => [
                'farming_system' => [
                    'label' => 'Kategori Sarana Produksi',
                    'type' => 'select',
                    'options' => [
                        'Pakan Ikan & Udang',
                        'Probiotik, Vitamin & Obat Ikan',
                        'Kincir Air & Mesin Aerasi',
                        'Kolam Terpal & Plastik Geomembran',
                        'Alat Ukur Kualitas Air & Lab',
                        'Lainnya',
                    ],
                    'required' => true,
                    'validation' => ['required', 'string', 'max:100'],
                ],
                'production_amount' => [
                    'label' => 'Kapasitas Produksi / Distribusi',
                    'type' => 'number_unit_period',
                    'default_unit' => 'ton',
                    'default_period' => 'per bulan',
                    'units' => ['ton', 'sak', 'unit'],
                    'periods' => ['per bulan', 'per tahun'],
                    'required' => false,
                    'validation' => ['nullable', 'numeric', 'min:0'],
                ],
                'notes' => [
                    'label' => 'Spesifikasi & Keunggulan Sarana',
                    'type' => 'textarea',
                    'placeholder' => 'Merek, kandungan protein pakan, garansi alat...',
                    'required' => false,
                    'validation' => ['nullable', 'string', 'max:500'],
                ],
            ],
        ],

        // Kategori tanpa formulir khusus (Langkah tidak wajib / dilewati)
        'akademisi' => [
            'title' => 'Aktivitas Akademisi / Peneliti',
            'description' => 'Langkah ini bersifat opsional untuk kategori Akademisi & Peneliti.',
            'is_skippable' => true,
            'fields' => [],
        ],

        'konsultan' => [
            'title' => 'Aktivitas Konsultan & Profesional',
            'description' => 'Langkah ini bersifat opsional untuk kategori Konsultan & Profesional.',
            'is_skippable' => true,
            'fields' => [],
        ],

        'lainnya' => [
            'title' => 'Aktivitas Perikanan Lainnya',
            'description' => 'Langkah ini bersifat opsional untuk kategori Lainnya.',
            'is_skippable' => true,
            'fields' => [],
        ],
    ],
];
