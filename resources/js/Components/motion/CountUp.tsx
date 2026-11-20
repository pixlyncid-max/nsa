import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';
import { animate } from 'animejs';
import { useInView } from 'framer-motion';
import { useEffect, useMemo, useRef } from 'react';

interface CountUpProps {
    to: number;
    from?: number;
    duration?: number;
    prefix?: string;
    suffix?: string;
    locale?: string;
    className?: string;
}

/** Hitung naik dari `from` ke `to` saat masuk layar, sekali saja (anime.js). */
export default function CountUp({
    to,
    from = 0,
    duration = 1800,
    prefix = '',
    suffix = '',
    locale = 'id-ID',
    className,
}: CountUpProps) {
    const ref = useRef<HTMLSpanElement>(null);
    const inView = useInView(ref, { once: true });
    const reduced = usePrefersReducedMotion();
    const format = useMemo(() => new Intl.NumberFormat(locale), [locale]);

    useEffect(() => {
        const element = ref.current;
        if (!element || !inView) {
            return;
        }
        const write = (value: number) => {
            element.textContent = `${prefix}${format.format(Math.round(value))}${suffix}`;
        };

        if (reduced) {
            write(to);
            return;
        }

        const state = { value: from };
        const animation = animate(state, {
            value: to,
            duration,
            ease: 'outExpo',
            onUpdate: () => write(state.value),
        });

        return () => {
            animation.cancel();
        };
    }, [inView, reduced, to, from, duration, prefix, suffix, format]);

    return (
        <span className={className}>
            <span ref={ref} aria-hidden="true">
                {prefix}
                {format.format(from)}
                {suffix}
            </span>
            <span className="sr-only">
                {prefix}
                {format.format(to)}
                {suffix}
            </span>
        </span>
    );
}
