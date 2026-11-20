<?php

namespace App\Support;

use App\Models\Setting;
use Illuminate\Support\Facades\Storage;

class Brand
{
    public static function name(): string
    {
        return Setting::get('brand_name')
            ?? Setting::get('site_name')
            ?? config('brand.name', 'NSA (Nusantara Sustainable Aquatic)');
    }

    public static function shortName(): string
    {
        return Setting::get('brand_short_name')
            ?? config('brand.short_name', 'NSA');
    }

    public static function tagline(): string
    {
        return Setting::get('brand_tagline')
            ?? Setting::get('site_tagline')
            ?? config('brand.tagline', 'Asosiasi Akuakultur dan Perikanan Berkelanjutan Nusantara');
    }

    public static function domain(): string
    {
        return Setting::get('brand_domain')
            ?? config('brand.domain', 'nsa.or.id');
    }

    public static function portalName(): string
    {
        return Setting::get('brand_portal_name')
            ?? config('brand.portal_name', 'Portal Anggota');
    }

    public static function supportPhone(): string
    {
        return Setting::get('brand_support_phone')
            ?? Setting::get('contact_phone')
            ?? config('brand.support_phone', '+62 812-3456-7890');
    }

    public static function supportEmail(): string
    {
        return Setting::get('brand_support_email')
            ?? Setting::get('contact_email')
            ?? config('brand.support_email', 'info@nsa.or.id');
    }

    public static function address(): string
    {
        return Setting::get('brand_address')
            ?? Setting::get('contact_address')
            ?? config('brand.address', 'Jl. Pajajaran No. 128, Baranangsiang, Bogor, Jawa Barat 16143');
    }

    public static function logoLight(): ?string
    {
        $path = Setting::get('brand_logo_light')
            ?? Setting::get('logo_light')
            ?? Setting::get('logo')
            ?? config('brand.logo_light');

        return $path ? Storage::url($path) : null;
    }

    public static function logoDark(): ?string
    {
        $path = Setting::get('brand_logo_dark')
            ?? Setting::get('logo_dark')
            ?? config('brand.logo_dark');

        return $path ? Storage::url($path) : null;
    }

    public static function toArray(): array
    {
        return [
            'name' => static::name(),
            'short_name' => static::shortName(),
            'tagline' => static::tagline(),
            'domain' => static::domain(),
            'portal_name' => static::portalName(),
            'support_phone' => static::supportPhone(),
            'support_email' => static::supportEmail(),
            'address' => static::address(),
            'logo_light' => static::logoLight(),
            'logo_dark' => static::logoDark(),
            'logo_footer_mode' => config('brand.logo.footer_mode'),
            'social' => [
                'instagram' => Setting::get('social_instagram', config('brand.social.instagram')),
                'facebook' => Setting::get('social_facebook', config('brand.social.facebook')),
                'youtube' => Setting::get('social_youtube', config('brand.social.youtube')),
                'linkedin' => Setting::get('social_linkedin', config('brand.social.linkedin')),
            ],
        ];
    }

    public static function get(?string $key = null, mixed $default = null): mixed
    {
        if ($key === null) {
            return static::toArray();
        }

        $brand = static::toArray();

        return data_get($brand, $key, $default);
    }
}
