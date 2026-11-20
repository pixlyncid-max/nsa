export interface MemberStory {
    quote: string;
    name: string;
    business: string;
    location: string;
    commodity?: string;
}

/**
 * Kutipan pembudidaya anggota untuk Beranda.
 */
export const memberStories: MemberStory[] = [
    {
        quote: 'Lewat pendampingan sertifikasi CPIB asosiasi, panen nila merah kami berhasil menembus kontrak pasokan katering dan pasar swalayan tanpa perantara panjang.',
        name: 'H. Sudirman',
        business: 'Mina Barokah Farm',
        location: 'Kabupaten Tulungagung, Jawa Timur',
        commodity: 'Nila Merah',
    },
    {
        quote: 'Dukungan konsolidasi pakan pabrikan memangkas beban biaya pakan kami hingga belasan persen per siklus panen. Tambak lele bioflok kami kini jauh lebih sehat.',
        name: 'Budi Hartono',
        business: 'Tambak Surya Mandiri',
        location: 'Kabupaten Subang, Jawa Barat',
        commodity: 'Lele Sangkuriang',
    },
    {
        quote: 'Sebelum bergabung, bibit bandeng kerap datang tidak seragam. Asosiasi menghubungkan kelompok kami langsung ke balai pembenihan resmi dengan surat asal benih terverifikasi.',
        name: 'Siti Rahmawati',
        business: 'Kelompok Tani Pesisir Berdaya',
        location: 'Kabupaten Maros, Sulawesi Selatan',
        commodity: 'Bandeng & Udang',
    },
];
