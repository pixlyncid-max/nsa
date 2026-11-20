<?php

use App\Support\Brand;
use App\Support\LocaleUrl;
use Carbon\Carbon;

if (! function_exists('brand')) {
    /**
     * Dapatkan konfigurasi brand atau identitas organisasi.
     */
    function brand(?string $key = null, mixed $default = null): mixed
    {
        return Brand::get($key, $default);
    }
}

if (! function_exists('lroute')) {
    /**
     * Hasilkan URL rute sesuai bahasa aktif (id tanpa awalan, en berawalan /en).
     */
    function lroute(string $name, mixed $parameters = [], bool $absolute = true, ?string $locale = null): string
    {
        return LocaleUrl::route($name, $parameters, $absolute, $locale);
    }
}

if (! function_exists('format_number')) {
    /**
     * Format angka mengikuti pemisah ribuan bahasa aktif (id: titik, en: koma).
     */
    function format_number(int|float $number, int $decimals = 0, ?string $locale = null): string
    {
        $loc = LocaleUrl::normalizeLocale($locale ?? app()->getLocale());
        $decPoint = $loc === 'en' ? '.' : ',';
        $thousandsSep = $loc === 'en' ? ',' : '.';

        return number_format($number, $decimals, $decPoint, $thousandsSep);
    }
}

if (! function_exists('format_currency')) {
    /**
     * Format mata uang Rupiah (simbol "Rp" tetap dipakai di kedua bahasa; pemisah ribuan mengikuti bahasa).
     */
    function format_currency(int|float $amount, ?string $locale = null): string
    {
        return 'Rp '.format_number($amount, 0, $locale);
    }
}

if (! function_exists('format_date')) {
    /**
     * Format tanggal mengikuti bahasa aktif.
     */
    function format_date(DateTimeInterface|string|null $date, string $format = 'd F Y', ?string $locale = null): string
    {
        if ($date === null || $date === '') {
            return '-';
        }

        $loc = LocaleUrl::normalizeLocale($locale ?? app()->getLocale());

        return Carbon::parse($date)->locale($loc)->translatedFormat($format);
    }
}
