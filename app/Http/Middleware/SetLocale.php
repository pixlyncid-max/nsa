<?php

namespace App\Http\Middleware;

use Carbon\Carbon;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    public function handle(Request $request, Closure $next): Response
    {
        $supported = (array) config('locales.supported', ['id', 'en']);
        $default = (string) config('locales.default', 'id');
        $cookieName = (string) config('locales.cookie_name', 'locale');

        // Aturan utama: CMS (/admin) SELALU Bahasa Indonesia dan tidak pernah diubah.
        if ($request->is('admin') || $request->is('admin/*')) {
            App::setLocale('id');
            Carbon::setLocale('id');

            return $next($request);
        }

        $cookieLocale = $request->cookie($cookieName);
        $validCookie = is_string($cookieLocale) && in_array($cookieLocale, $supported, true)
            ? $cookieLocale
            : null;

        // Pengalihan khusus: hanya untuk kunjungan GET ke "/" tanpa awalan bila cookie 'locale' = en.
        // JANGAN pernah mengalihkan berdasarkan header Accept-Language.
        if ($request->is('/') && $request->isMethod('GET') && $validCookie === 'en') {
            $query = $request->getQueryString();
            $target = $query ? '/en?'.$query : '/en';

            return redirect($target);
        }

        // Urutan prioritas:
        // 1. Awalan URL 'en'
        // 2. users.locale (bila login)
        // 3. cookie 'locale'
        // 4. default 'id'
        $locale = $default;

        if ($request->segment(1) === 'en') {
            $locale = 'en';
        } else {
            $userLocale = $request->user()?->locale;
            if (is_string($userLocale) && in_array($userLocale, $supported, true)) {
                $locale = $userLocale;
            } elseif ($validCookie !== null) {
                $locale = $validCookie;
            }
        }

        App::setLocale($locale);
        Carbon::setLocale($locale);

        return $next($request);
    }
}
