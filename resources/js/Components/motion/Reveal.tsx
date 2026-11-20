import { dur, ease, fadeUp, staggerContainer, viewportOnce } from '@/animations/variants';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';
import { motion, type HTMLMotionProps, type Variants } from 'framer-motion';
import { useMemo, type ReactNode } from 'react';

interface RevealProps {
    children: ReactNode;
    className?: string;
    delay?: number;
    y?: number;
}

/** Muncul saat masuk layar, sekali saja. Mati bila prefers-reduced-motion. */
export default function Reveal({
    children,
    className,
    delay = 0,
    y = 24,
}: RevealProps) {
    const reduced = usePrefersReducedMotion();
    const variants = useMemo<Variants>(
        () => ({
            hidden: { opacity: 0, y },
            visible: {
                opacity: 1,
                y: 0,
                transition: { duration: dur.slow, ease, delay },
            },
        }),
        [y, delay]
    );

    if (reduced) {
        return <div className={className}>{children}</div>;
    }

    return (
        <motion.div
            className={className}
            variants={variants}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
        >
            {children}
        </motion.div>
    );
}

const groupVariants = staggerContainer();

/** Beberapa anak muncul berurutan (stagger 80ms). */
export function RevealGroup({
    children,
    className,
    as = 'div',
}: {
    children: ReactNode;
    className?: string;
    as?: 'div' | 'ul' | 'ol';
}) {
    const reduced = usePrefersReducedMotion();
    const Tag = motion[as];

    if (reduced) {
        const Plain = as;
        return <Plain className={className}>{children}</Plain>;
    }

    return (
        <Tag
            className={className}
            variants={groupVariants}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
        >
            {children}
        </Tag>
    );
}

export function RevealItem({
    children,
    className,
    as = 'div',
}: {
    children: ReactNode;
    className?: string;
    as?: 'div' | 'li';
}) {
    const reduced = usePrefersReducedMotion();
    const Tag = motion[as];

    if (reduced) {
        const Plain = as;
        return <Plain className={className}>{children}</Plain>;
    }

    return (
        <Tag className={className} variants={fadeUp}>
            {children}
        </Tag>
    );
}

/**
 * Pengganti `<section>` yang fade + slide-up saat masuk layar.
 * Dipakai di semua halaman publik agar ritme kemunculan konsisten.
 */
export function RevealSection({ children, ...props }: HTMLMotionProps<'section'>) {
    const reduced = usePrefersReducedMotion();

    if (reduced) {
        return <motion.section {...props}>{children}</motion.section>;
    }

    return (
        <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '0px 0px -10% 0px' }}
            variants={fadeUp}
            {...props}
        >
            {children}
        </motion.section>
    );
}
