<?php

namespace App\Enums;

enum MembershipType: string
{
    case Pembudidaya = 'Pembudidaya';
    case Nelayan = 'Nelayan';
    case Pengolah = 'Pengolah';
    case Pedagang = 'Pedagang';
    case Eksportir = 'Eksportir';
    case Importir = 'Importir';
    case Supplier = 'Supplier';
    case Industri = 'Industri';
    case Akademisi = 'Akademisi';
    case Konsultan = 'Konsultan';
    case PemerhatiPerikanan = 'Pemerhati Perikanan';
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
