@php
    $currentLocale = app()->getLocale();
    $localeMeta = config("locales.locales.{$currentLocale}", config('locales.locales.id'));
    $htmlLang = $localeMeta['html_lang'] ?? $currentLocale;
    $ogLocale = $localeMeta['og_locale'] ?? 'id_ID';
    $alternateOgLocale = $currentLocale === 'en' ? 'id_ID' : 'en_US';
    $isAdminArea = request()->is('admin') || request()->is('admin/*');
    $seoAlternates = ! $isAdminArea && \App\Support\LocaleUrl::isLocalizedRoute(request())
        ? \App\Support\LocaleUrl::alternates(request())
        : null;
    $seoCanonical = ! $isAdminArea ? \App\Support\LocaleUrl::canonical(request()) : null;
@endphp
<!DOCTYPE html>
<html lang="{{ $htmlLang }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title inertia>{{ config('brand.short_name', config('app.name', 'NSA')) }}</title>

        @if (! $isAdminArea && $seoCanonical)
            <link rel="canonical" href="{{ $seoCanonical }}">
            <meta property="og:locale" content="{{ $ogLocale }}">
            <meta property="og:locale:alternate" content="{{ $alternateOgLocale }}">
        @endif

        @if ($seoAlternates)
            <link rel="alternate" hreflang="id" href="{{ strtok($seoAlternates['id'], '?') ?: $seoAlternates['id'] }}">
            <link rel="alternate" hreflang="en" href="{{ strtok($seoAlternates['en'], '?') ?: $seoAlternates['en'] }}">
            <link rel="alternate" hreflang="x-default" href="{{ strtok($seoAlternates['id'], '?') ?: $seoAlternates['id'] }}">
        @endif

        <!-- Google Fonts: Bricolage Grotesque & Plus Jakarta Sans -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..700&family=Plus+Jakarta+Sans:wght@400..700&display=swap" rel="stylesheet">

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx'])
        @inertiaHead
    </head>
    <body class="font-sans antialiased bg-white text-ink selection:bg-ocean selection:text-white min-h-screen">
        @inertia
    </body>
</html>
