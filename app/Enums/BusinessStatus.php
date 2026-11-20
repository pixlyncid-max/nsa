<?php

namespace App\Enums;

enum BusinessStatus: string
{
    case Perorangan = 'Perorangan';
    case CV = 'CV';
    case PT = 'PT';
    case Koperasi = 'Koperasi';
    case Kelompok = 'Kelompok Pembudidaya/Poklahan';
    case Lainnya = 'Lainnya';

    /**
     * Dapatkan semua nilai sebagai array string.
     *
     * @return array<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
