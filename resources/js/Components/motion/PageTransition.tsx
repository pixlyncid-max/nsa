import { pageTransition } from '@/animations/variants';
import { usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import type { ReactNode } from 'react';

/** Area dengan shell tetap (sidebar): hanya kontennya yang bertransisi. */
const SHELL_PREFIXES = ['/admin', '/akun'];

function transitionKey(url: string): string {
    const path = url.split(/[?#]/)[0];
    return SHELL_PREFIXES.find((prefix) => path === prefix || path.startsWith(`${prefix}/`)) ?? path;
}

/**
 * Transisi antar halaman Inertia (fade + geser 12px, design.md momen 7).
 * Dipasang sekali di root (app.tsx). Kunci = pathname, sehingga perubahan
 * query string (filter, paginasi) tidak memicu transisi ulang.
 * Reduced motion ditangani global oleh <MotionConfig reducedMotion="user">.
 */
export default function PageTransition({ children }: { children: ReactNode }) {
    const { url } = usePage();

    return (
        <AnimatePresence mode="wait" initial={false}>
            <motion.div
                key={transitionKey(url)}
                variants={pageTransition}
                initial="initial"
                animate="enter"
                exit="exit"
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
}

/** Animasi masuk untuk konten di dalam shell dashboard. */
export function ContentTransition({ children }: { children: ReactNode }) {
    return (
        <motion.div variants={pageTransition} initial="initial" animate="enter">
            {children}
        </motion.div>
    );
}
