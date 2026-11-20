<?php

namespace App\Enums;

enum ProgramCategory: string
{
    case Pelatihan = 'pelatihan';
    case Pendampingan = 'pendampingan';
    case InformasiPasar = 'informasi_pasar';
    case AksesKemitraan = 'akses_kemitraan';
    case TeknologiBudidaya = 'teknologi_budidaya';
    case PengembanganUsaha = 'pengembangan_usaha';

    /**
     * Label kategori program dalam Bahasa Indonesia.
     */
    public function label(): string
    {
        return match ($this) {
            self::Pelatihan => 'Pelatihan',
            self::Pendampingan => 'Pendampingan',
            self::InformasiPasar => 'Informasi Pasar',
            self::AksesKemitraan => 'Akses Kemitraan',
            self::TeknologiBudidaya => 'Teknologi Budidaya',
            self::PengembanganUsaha => 'Pengembangan Usaha',
        };
    }
}
