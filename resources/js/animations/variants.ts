import type { Transition, Variants } from 'framer-motion';

/**
 * Variants & preset Framer Motion yang dipakai ulang di seluruh aplikasi.
 * Hanya menganimasikan `transform` dan `opacity` (design.md bagian 7).
 */

export const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const dur = {
    fast: 0.18,
    base: 0.35,
    slow: 0.7,
} as const;

export const spring: Transition = { type: 'spring', stiffness: 380, damping: 30, mass: 0.6 };

/** Muncul sekali saat 80px masuk layar. */
export const viewportOnce = { once: true, margin: '0px 0px -80px 0px' } as const;

/** Fade + slide-up. Terima `custom` (index) untuk delay manual. */
export const fadeUp: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: (i: number = 0) => ({
        opacity: 1,
        y: 0,
        transition: { duration: dur.slow, ease, delay: i * 0.08 },
    }),
};

export const fadeIn: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: dur.slow, ease } },
};

export const scaleIn: Variants = {
    hidden: { opacity: 0, scale: 0.96 },
    visible: { opacity: 1, scale: 1, transition: { duration: dur.base, ease } },
};

/** Kontainer yang memicu anak-anaknya berurutan. */
export function staggerContainer(stagger = 0.08, delayChildren = 0): Variants {
    return {
        hidden: {},
        visible: { transition: { staggerChildren: stagger, delayChildren } },
    };
}

/** Transisi halaman: fade + geser 12px (design.md momen 7). */
export const pageTransition: Variants = {
    initial: { opacity: 0, y: 12 },
    enter: { opacity: 1, y: 0, transition: { duration: 0.25, ease } },
    exit: { opacity: 0, y: -8, transition: { duration: dur.fast, ease } },
};

/** Micro-interaction kartu: naik 4px. */
export const hoverLift = {
    whileHover: { y: -4 },
    whileTap: { scale: 0.99 },
    transition: spring,
} as const;

/** Micro-interaction tombol / link kecil. */
export const pressable = {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.97 },
    transition: spring,
} as const;

/** Panel modal / dropdown. */
export const popIn: Variants = {
    hidden: { opacity: 0, y: 8, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: dur.base, ease } },
    exit: { opacity: 0, y: 8, scale: 0.98, transition: { duration: dur.fast, ease } },
};

