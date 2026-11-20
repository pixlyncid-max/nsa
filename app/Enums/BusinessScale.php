<?php

namespace App\Enums;

enum BusinessScale: string
{
    case Mikro = 'Mikro';
    case Kecil = 'Kecil';
    case Menengah = 'Menengah';
    case Besar = 'Besar';

    /**
     * Dapatkan semua nilai sebagai array string.
     *
     * @return array<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    /**
     * Deskripsi kriteria omzet sesuai PP No. 7 Tahun 2021.
     */
    public function turnoverCriteria(): string
    {
        return match ($this) {
            self::Mikro => 'Penjualan tahunan sampai dengan Rp 2 Miliar',
            self::Kecil => 'Penjualan tahunan lebih dari Rp 2 Miliar s.d. Rp 15 Miliar',
            self::Menengah => 'Penjualan tahunan lebih dari Rp 15 Miliar s.d. Rp 50 Miliar',
            self::Besar => 'Penjualan tahunan lebih dari Rp 50 Miliar',
        };
    }
}
