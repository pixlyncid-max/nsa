<?php

namespace App\Enums;

enum ProductType: string
{
    case Physical = 'physical';
    case Rental = 'rental';
    case Spot = 'spot';
    case Community = 'community';

    public function label(): string
    {
        return match ($this) {
            self::Physical => 'Produk Fisik',
            self::Rental => 'Sewa Peralatan',
            self::Spot => 'Spot Pemancingan',
            self::Community => 'Komunitas',
        };
    }
}
