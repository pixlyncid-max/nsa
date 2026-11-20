import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, type ReactNode } from 'react';

interface ParallaxProps {
    children: ReactNode;
    /** Pergeseran maksimum (px). Positif = bergerak lebih lambat dari scroll. */
    offset?: number;
    className?: string;
}

/** Parallax halus berbasis posisi scroll elemen (hanya translateY). */
export default function Parallax({ children, offset = 40, className }: ParallaxProps) {
    const ref = useRef<HTMLDivElement>(null);
    const reduced = usePrefersReducedMotion();
    const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
    const y = useTransform(scrollYProgress, [0, 1], [offset, -offset]);

    return (
        <motion.div ref={ref} style={reduced ? undefined : { y }} className={className}>
            {children}
        </motion.div>
    );
}

