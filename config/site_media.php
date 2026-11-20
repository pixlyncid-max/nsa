<?php

/**
 * Daftar seluruh slot foto/gambar non-produk pada website NSA yang dapat diatur dari CMS.
 * Nilai unggahan disimpan di tabel `settings` dengan kunci `site_media.{key}`
 * (khusus logo tetap disinkronkan dengan `brand_logo_dark` & `brand_logo_light`).
 */
return [
    'groups' => [
        'brand' => 'Logo & Identitas',
        'hero' => 'Hero Beranda',
        'join_strip' => 'Strip Ajakan Footer',
        'explore' => 'Navbar & Jelajah Komoditas',
        'about' => 'Halaman Tentang Kami',
    ],

    'slots' => [
        // 1. Logo & Identitas
        'brand_logo_dark' => [
            'group' => 'brand',
            'setting_key' => 'brand_logo_dark',
            'label' => 'Logo Utama (Latar Terang / Navbar)',
            'hint' => 'Navbar desktop & mobile. Kosongkan untuk memakai logo bawaan NSA.',
            'recommended' => 'Tinggi min. 120 px (PNG/SVG transparan)',
            'aspect' => 'aspect-[16/6]',
            'default' => '/images/brand/logo-navbar@2x.png',
        ],
        'brand_logo_light' => [
            'group' => 'brand',
            'setting_key' => 'brand_logo_light',
            'label' => 'Logo Putih (Latar Gelap / Footer)',
            'hint' => 'Footer navy (#014081). Kosongkan untuk memakai versi putih bawaan NSA.',
            'recommended' => 'Tinggi min. 132 px (PNG/SVG transparan)',
            'aspect' => 'aspect-[16/6]',
            'dark_preview' => true,
            'default' => '/images/brand/logo-footer-white@2x.png',
        ],

        // 2. Hero Beranda
        'hero_desktop' => [
            'group' => 'hero',
            'label' => 'Gambar Latar Hero (Desktop)',
            'hint' => 'Banner utama Beranda pada layar desktop & tablet.',
            'recommended' => '2560 × 1100 px (WebP / JPG, lanskap lebar)',
            'aspect' => 'aspect-[21/9]',
            'default' => null,
        ],
        'hero_mobile' => [
            'group' => 'hero',
            'label' => 'Gambar Latar Hero (Mobile)',
            'hint' => 'Banner utama Beranda pada layar ponsel.',
            'recommended' => '1080 × 1440 px (WebP / JPG, potret)',
            'aspect' => 'aspect-[3/4]',
            'default' => null,
        ],

        // 3. Strip Ajakan Footer
        'join_strip_desktop' => [
            'group' => 'join_strip',
            'label' => 'Latar Strip Ajakan Gabung (Desktop)',
            'hint' => 'Strip biru ajakan daftar anggota tepat di atas Footer (desktop).',
            'recommended' => '2560 × 320 px (WebP / JPG)',
            'aspect' => 'aspect-[16/4]',
            'dark_preview' => true,
            'default' => null,
        ],
        'join_strip_mobile' => [
            'group' => 'join_strip',
            'label' => 'Latar Strip Ajakan Gabung (Mobile)',
            'hint' => 'Strip biru ajakan daftar anggota tepat di atas Footer (mobile).',
            'recommended' => '1080 × 720 px (WebP / JPG)',
            'aspect' => 'aspect-[3/2]',
            'dark_preview' => true,
            'default' => null,
        ],

        // 4. Navbar & Jelajah Komoditas
        'megamenu_spotlight' => [
            'group' => 'explore',
            'label' => 'Foto Sorotan Mega-Menu Produk',
            'hint' => 'Navbar → Dropdown Produk sisi kanan (Sorotan Katalog).',
            'recommended' => '800 × 600 px (4:3)',
            'aspect' => 'aspect-[4/3]',
            'default' => '/images/products/featured-spotlight.jpg',
        ],
        'explore_freshwater' => [
            'group' => 'explore',
            'label' => 'Panel Jelajah: Budidaya Air Tawar',
            'hint' => 'Beranda (Bab 04 Jelajah Produk) & Katalog Produk.',
            'recommended' => '1200 × 900 px (4:3)',
            'aspect' => 'aspect-[4/3]',
            'default' => '/images/home/produk-air-tawar.jpg',
        ],
        'explore_saltwater' => [
            'group' => 'explore',
            'label' => 'Panel Jelajah: Marikultur & Air Laut',
            'hint' => 'Beranda (Bab 04 Jelajah Produk) & Katalog Produk.',
            'recommended' => '1200 × 900 px (4:3)',
            'aspect' => 'aspect-[4/3]',
            'default' => '/images/home/produk-air-laut.jpg',
        ],
        'explore_other' => [
            'group' => 'explore',
            'label' => 'Panel Jelajah: Sarana & Kebutuhan Tambak',
            'hint' => 'Beranda (Bab 04 Jelajah Produk) & Katalog Produk.',
            'recommended' => '1200 × 900 px (4:3)',
            'aspect' => 'aspect-[4/3]',
            'default' => '/images/home/produk-lain-lain.jpg',
        ],

        // 5. Halaman Tentang Kami
        'about_banner' => [
            'group' => 'about',
            'label' => 'Foto Banner Utama Tentang Kami',
            'hint' => 'Halaman Tentang Kami → Header / Banner pembuka.',
            'recommended' => '1920 × 800 px (lanskap)',
            'aspect' => 'aspect-[16/7]',
            'default' => '/images/home/hero-kolam.jpg',
        ],
        'about_history_1' => [
            'group' => 'about',
            'label' => 'Galeri Sejarah 1 (Budidaya Kolam)',
            'hint' => 'Halaman Tentang Kami → Linimasa Sejarah slide 1.',
            'recommended' => '1200 × 800 px (3:2)',
            'aspect' => 'aspect-[3/2]',
            'default' => '/images/home/hero-kolam.jpg',
        ],
        'about_history_2' => [
            'group' => 'about',
            'label' => 'Galeri Sejarah 2 (Tambak Pesisir)',
            'hint' => 'Halaman Tentang Kami → Linimasa Sejarah slide 2.',
            'recommended' => '1200 × 800 px (3:2)',
            'aspect' => 'aspect-[3/2]',
            'default' => '/images/home/hero-tambak.jpg',
        ],
        'about_history_3' => [
            'group' => 'about',
            'label' => 'Galeri Sejarah 3 (Panen & Komoditas)',
            'hint' => 'Halaman Tentang Kami → Linimasa Sejarah slide 3.',
            'recommended' => '1200 × 800 px (3:2)',
            'aspect' => 'aspect-[3/2]',
            'default' => '/images/home/hero-panen.jpg',
        ],
    ],
];
