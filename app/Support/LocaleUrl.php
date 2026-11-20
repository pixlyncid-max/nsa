<?php

namespace App\Support;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

class LocaleUrl
{
    /**
     * Menghasilkan URL route sesuai bahasa aktif (atau locale tertentu).
     */
    public static function route(string $name, mixed $parameters = [], bool $absolute = true, ?string $locale = null): string
    {
        $targetLocale = self::normalizeLocale($locale ?? app()->getLocale());
        $baseName = str_starts_with($name, 'en.') ? substr($name, 3) : $name;

        if ($targetLocale === 'en' && Route::has('en.'.$baseName)) {
            return route('en.'.$baseName, $parameters, $absolute);
        }

        return route($baseName, $parameters, $absolute);
    }

    /**
     * Menghasilkan peta URL padanan (id & en) untuk halaman saat ini,
     * mempertahankan parameter rute dan query string.
     *
     * @return array<string, string>
     */
    public static function alternates(Request $request): array
    {
        $route = $request->route();
        $routeName = $route?->getName();
        $queryString = $request->getQueryString();
        $suffix = $queryString ? '?'.$queryString : '';

        if (is_string($routeName) && $routeName !== '') {
            $baseName = str_starts_with($routeName, 'en.') ? substr($routeName, 3) : $routeName;
            $params = $route->parameters();

            if (Route::has($baseName) && Route::has('en.'.$baseName)) {
                return [
                    'id' => route($baseName, $params, true).$suffix,
                    'en' => route('en.'.$baseName, $params, true).$suffix,
                ];
            }
        }

        $current = $request->fullUrl();

        return [
            'id' => $current,
            'en' => $current,
        ];
    }

    /**
     * Memeriksa apakah halaman saat ini merupakan rute publik yang dilokalisasi.
     */
    public static function isLocalizedRoute(Request $request): bool
    {
        $routeName = $request->route()?->getName();
        if (! is_string($routeName) || $routeName === '') {
            return false;
        }

        $baseName = str_starts_with($routeName, 'en.') ? substr($routeName, 3) : $routeName;

        return Route::has($baseName) && Route::has('en.'.$baseName);
    }

    public static function canonical(Request $request): string
    {
        $locale = self::normalizeLocale(app()->getLocale());
        $alternates = self::alternates($request);
        $url = $alternates[$locale] ?? $request->url();

        return strtok($url, '?') ?: $url;
    }

    public static function normalizeLocale(?string $locale): string
    {
        $supported = (array) config('locales.supported', ['id', 'en']);
        $default = (string) config('locales.default', 'id');

        if (is_string($locale) && in_array($locale, $supported, true)) {
            return $locale;
        }

        return $default;
    }
}
