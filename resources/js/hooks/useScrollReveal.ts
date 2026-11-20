import { fadeUp, viewportOnce } from '@/animations/variants';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';
import type { Variants } from 'framer-motion';

/**
 * Props siap-sebar untuk elemen `motion.*` agar muncul saat discroll.
 * Mengembalikan objek kosong bila pengguna memilih reduced motion.
 *
 *   const reveal = useScrollReveal();
 *   <motion.div {...reveal}>...</motion.div>
 */
export function useScrollReveal(variants: Variants = fadeUp, custom?: number) {
    const reduced = usePrefersReducedMotion();

    if (reduced) {
        return {};
    }

    return {
        variants,
        custom,
        initial: 'hidden',
        whileInView: 'visible',
        viewport: viewportOnce,
    } as const;
}

