import { router, usePage } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Mengekstrak pathname bersih dari URL (tanpa query string dan hash).
 */
export function extractPathname(rawUrl: string): string {
    const withoutHash = rawUrl.split('#')[0] ?? '/';
    const withoutQuery = withoutHash.split('?')[0] ?? '/';

    if (withoutQuery === '' || withoutQuery === '/') {
        return '/';
    }

    // Normalisasi bila URL absolut (mis. http://localhost/produk)
    try {
        if (/^https?:\/\//i.test(withoutQuery)) {
            const parsed = new URL(withoutQuery);
            return parsed.pathname.replace(/\/+$/, '') || '/';
        }
    } catch {
        // Fallback ke pemrosesan string relatif
    }

    const normalized = withoutQuery.startsWith('/')
        ? withoutQuery
        : `/${withoutQuery}`;

    return normalized.replace(/\/+$/, '') || '/';
}

/**
 * Menyimpan status penutupan di memori saja (tanpa localStorage/cookie/sessionStorage).
 * Otomatis terbuka kembali bila pathname berubah (navigasi Inertia atau Back/Forward)
 * atau bila `resetKey` (mis. status keanggotaan) berubah.
 */
export function useDismissUntilNavigation(resetKey?: string | null) {
    const { url } = usePage();
    const currentKey = resetKey ?? '__default__';

    const [dismissedKey, setDismissedKey] = useState<string | null>(null);
    const lastPathRef = useRef<string>(extractPathname(url));

    useEffect(() => {
        const handlePathChange = (nextUrl: string) => {
            const nextPath = extractPathname(nextUrl);
            if (nextPath !== lastPathRef.current) {
                lastPathRef.current = nextPath;
                setDismissedKey(null);
            }
        };

        const removeNavigateListener = router.on('navigate', (event) => {
            handlePathChange(event.detail.page.url);
        });

        const handlePopState = () => {
            if (typeof window !== 'undefined') {
                handlePathChange(window.location.pathname);
            }
        };

        if (typeof window !== 'undefined') {
            window.addEventListener('popstate', handlePopState);
        }

        return () => {
            removeNavigateListener();
            if (typeof window !== 'undefined') {
                window.removeEventListener('popstate', handlePopState);
            }
        };
    }, []);

    const dismissed = dismissedKey !== null && dismissedKey === currentKey;

    const dismiss = useCallback(() => {
        setDismissedKey(currentKey);
    }, [currentKey]);

    return { dismissed, dismiss };
}
