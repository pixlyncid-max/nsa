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
    $seoData = is_array($seo ?? null) ? $seo : [];
    $seoSiteName = \App\Support\Brand::shortName();
    $seoTitle = (string) ($seoData['title'] ?? \App\Support\Brand::name());
    $seoDescription = (string) ($seoData['description'] ?? \App\Support\Brand::tagline());
    $seoType = (string) ($seoData['type'] ?? 'website');
    $seoUrl = (string) ($seoData['url'] ?? ($seoCanonical ?? url()->current()));
    $rawSeoImage = $seoData['image'] ?? null;
    if (! $rawSeoImage && ! $isAdminArea) {
        $rawSeoImage = app(\App\Services\SiteMediaService::class)->uploadedUrl('hero_desktop')
            ?? (file_exists(public_path('images/brand/logo-navbar@3x.png')) ? '/images/brand/logo-navbar@3x.png' : null);
    }
    $seoImage = null;
    if (is_string($rawSeoImage) && trim($rawSeoImage) !== '') {
        $rawSeoImage = trim($rawSeoImage);
        $seoImage = preg_match('/^https?:\/\//i', $rawSeoImage)
            ? $rawSeoImage
            : rtrim(request()->getSchemeAndHttpHost(), '/').'/'.ltrim($rawSeoImage, '/');
    }
@endphp
<!DOCTYPE html>
<html lang="{{ $htmlLang }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title inertia>{{ $seoTitle }}</title>

        @if (! $isAdminArea)
            <meta name="description" content="{{ $seoDescription }}">
            <meta property="og:site_name" content="{{ $seoSiteName }}">
            <meta property="og:type" content="{{ $seoType }}">
            <meta property="og:title" content="{{ $seoTitle }}">
            <meta property="og:description" content="{{ $seoDescription }}">
            <meta property="og:url" content="{{ $seoUrl }}">
            @if ($seoImage)
                <meta property="og:image" content="{{ $seoImage }}">
                <meta property="og:image:secure_url" content="{{ $seoImage }}">
                <meta property="og:image:alt" content="{{ $seoTitle }}">
            @endif
            <meta name="twitter:card" content="{{ $seoImage ? 'summary_large_image' : 'summary' }}">
            <meta name="twitter:title" content="{{ $seoTitle }}">
            <meta name="twitter:description" content="{{ $seoDescription }}">
            @if ($seoImage)
                <meta name="twitter:image" content="{{ $seoImage }}">
            @endif
        @endif

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
