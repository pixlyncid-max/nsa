import { useMediaQuery, usePrefersReducedMotion } from '@/hooks/useMediaQuery';
import { cx } from '@/lib/cx';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import type { PointerEvent, ReactNode } from 'react';

interface MagneticButtonProps {
    children: ReactNode;
    /** Seberapa jauh elemen mengikuti kursor (0.1 halus – 0.4 kuat). */
    strength?: number;
    className?: string;
}

/** Membungkus tombol agar bergeser halus mengikuti kursor. Opsional; mati di layar sentuh. */
export default function MagneticButton({
    children,
    strength = 0.25,
    className,
}: MagneticButtonProps) {
    const reduced = usePrefersReducedMotion();
    const finePointer = useMediaQuery('(pointer: fine)');
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const springX = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 });
    const springY = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 });
    const enabled = !reduced && finePointer;

    const onMove = (event: PointerEvent<HTMLDivElement>) => {
        if (!enabled) {
            return;
        }
        const rect = event.currentTarget.getBoundingClientRect();
        x.set((event.clientX - (rect.left + rect.width / 2)) * strength);
        y.set((event.clientY - (rect.top + rect.height / 2)) * strength);
    };

    const onLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            onPointerMove={onMove}
            onPointerLeave={onLeave}
            style={{ x: springX, y: springY }}
            className={cx('inline-block', className)}
        >
            {children}
        </motion.div>
    );
}
