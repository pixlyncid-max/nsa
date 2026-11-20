export const copy = {
    brand: {
        name: 'NSA',
        fullName: 'NSA (Nusantara Sustainable Aquatic)',
        tagline:
            'Wadah bersama pembudidaya, nelayan, dan pelaku perikanan di seluruh Indonesia.',
    },
    actions: {
        login: 'Login',
        registerMember: 'Daftar Anggota',
        viewProducts: 'Lihat Produk',
        viewAllProducts: 'Lihat semua produk',
        cart: 'Keranjang',
        logout: 'Keluar',
        openMenu: 'Buka menu',
        closeMenu: 'Tutup menu',
        close: 'Tutup',
        skipToContent: 'Lompat ke konten',
        backToWebsite: 'Kembali ke Website',
    },
    help: {
        title: 'Butuh bantuan?',
        body: 'Sekretariat NSA siap membantu pada jam kerja.',
        action: 'Hubungi Kami',
    },
    footer: {
        about: 'Tentang NSA',
        menu: 'Menu',
        contact: 'Kontak',
        newsletter: 'Kabar NSA',
        newsletterBody: 'Berita dan kegiatan terbaru, dikirim sebulan sekali.',
        emailPlaceholder: 'Alamat email Anda',
        subscribe: 'Berlangganan',
        emailInvalid: 'Alamat email belum benar. Cek kembali penulisannya.',
        newsletterSoon: 'Fitur berlangganan segera tersedia.',
        rights: 'Hak cipta dilindungi.',
    },
} as const;

export const siteInfo = {
    email: 'info@nsa.or.id',
    phone: '+62 812-3456-7890',
    address:
        'Jl. Pajajaran No. 128, Baranangsiang, Bogor, Jawa Barat 16143',
    socials: [
        { label: 'Instagram', href: 'https://instagram.com/nsa_indonesia' },
        { label: 'Facebook', href: 'https://facebook.com/nsaofficial' },
        { label: 'YouTube', href: 'https://youtube.com/@nsa_indonesia' },
    ],
} as const;
