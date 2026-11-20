/**
 * Slot foto Beranda. Berkas belum tersedia di repositori; selama belum ada,
 * ImageMask menampilkan placeholder berlabel. Taruh foto asli kegiatan
 * budidaya di public/images/home/ dengan nama di bawah.
 */
export const homeMedia = {
    hero: [
        { src: '/images/home/hero-kolam.jpg', alt: 'Pembudidaya memberi pakan di kolam ikan' },
        { src: '/images/home/hero-tambak.jpg', alt: 'Tambak udang di pesisir' },
        { src: '/images/home/hero-panen.jpg', alt: 'Hasil panen ikan nila' },
    ],
    products: {
        'air-tawar': '/images/home/produk-air-tawar.jpg',
        'air-laut': '/images/home/produk-air-laut.jpg',
        'lain-lain': '/images/home/produk-lain-lain.jpg',
    } as Record<string, string>,
} as const;
