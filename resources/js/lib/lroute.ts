import type { PageProps } from '@/types';
import { usePage } from '@inertiajs/react';
import { useCallback } from 'react';

type RouteParams = Record<string, string | number | undefined> | string | number;

function detectDocumentLocale(): string {
    if (typeof document !== 'undefined') {
        const lang = document.documentElement.lang?.toLowerCase();
        if (lang === 'en' || lang === 'id') {
            return lang;
        }
    }
    return 'id';
}

/**
 * Menghasilkan URL rute terlokalisasi menggunakan Ziggy.
 * Bila bahasa aktif 'en' dan rute 'en.{name}' terdaftar, gunakan awalan /en.
 */
export function lroute(
    name: string,
    params?: RouteParams,
    absolute = false,
    locale?: string
): string {
    const activeLocale = locale ?? detectDocumentLocale();
    const baseName = name.startsWith('en.') ? name.slice(3) : name;

    if (typeof route === 'function') {
        const enName = `en.${baseName}`;
        if (activeLocale === 'en' && route().has(enName)) {
            return route(enName, params as never, absolute);
        }
        if (route().has(baseName)) {
            return route(baseName, params as never, absolute);
        }
    }

    return activeLocale === 'en' ? '/en' : '/';
}

/**
 * Memberi awalan '/en' pada path publik (mis. '/produk' → '/en/produk')
 * bila bahasa aktif adalah 'en'. Area non-publik (/akun, /anggota, /admin, /login, /register) tidak diberi awalan.
 */
export function lpath(path: string, locale?: string): string {
    const activeLocale = locale ?? detectDocumentLocale();
    if (activeLocale !== 'en') {
        return path;
    }

    if (
        !path.startsWith('/') ||
        path === '/en' ||
        path.startsWith('/en/') ||
        path.startsWith('/en?') ||
        path.startsWith('/en#') ||
        path.startsWith('/akun') ||
        path.startsWith('/anggota') ||
        path.startsWith('/admin') ||
        path.startsWith('/login') ||
        path.startsWith('/register')
    ) {
        return path;
    }

    if (path === '/') {
        return '/en';
    }

    if (path.startsWith('/?') || path.startsWith('/#')) {
        return `/en${path.slice(1)}`;
    }

    return `/en${path}`;
}

/**
 * Hook React untuk memakai lroute() yang otomatis terikat ke prop Inertia `locale`.
 */
export function useLocalizedRoute() {
    const locale = usePage<PageProps>().props.locale ?? 'id';

    return useCallback(
        (name: string, params?: RouteParams, absolute = false) =>
            lroute(name, params, absolute, locale),
        [locale]
    );
}

/**
 * Hook ringkas untuk memeriksa bahasa aktif (`locale`, `isEn`, `lp`).
 */
export function useLocale() {
    const rawLocale = usePage<PageProps>().props.locale;
    const locale: 'id' | 'en' = rawLocale === 'en' ? 'en' : 'id';
    const isEn = locale === 'en';

    const lp = useCallback((path: string) => lpath(path, locale), [locale]);

    return { locale, isEn, lp };
}
