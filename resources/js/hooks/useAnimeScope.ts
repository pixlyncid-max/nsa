import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';
import { createScope } from 'animejs';
import { useInView } from 'framer-motion';
import { useLayoutEffect, useRef, type DependencyList } from 'react';

interface AnimeScopeOptions {
    /** Tunda sampai elemen masuk layar (sekali). */
    inView?: boolean;
    enabled?: boolean;
}

/**
 * Menjalankan animasi anime.js di dalam `createScope` yang terikat ke root,
 * lalu `revert()` otomatis saat unmount / deps berubah (cleanup penuh).
 * Tidak berjalan bila prefers-reduced-motion.
 */
export function useAnimeScope<T extends Element = HTMLDivElement>(
    setup: (root: T) => void,
    deps: DependencyList = [],
    { inView = false, enabled = true }: AnimeScopeOptions = {}
) {
    const ref = useRef<T>(null);
    const reduced = usePrefersReducedMotion();
    const visible = useInView(ref, { once: true, margin: '0px 0px -60px 0px' });
    const ready = enabled && !reduced && (!inView || visible);

    // Layout effect: nilai awal diterapkan sebelum paint agar tidak berkedip.
    useLayoutEffect(() => {
        const root = ref.current;
        if (!ready || !root) {
            return;
        }
        const scope = createScope({ root: root as unknown as HTMLElement }).add(() => setup(root));
        return () => scope.revert();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ready, ...deps]);

    return ref;
}

