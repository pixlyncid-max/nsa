import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';
import { animate, stagger } from 'animejs';
import { useInView } from 'framer-motion';
import { useEffect, useLayoutEffect, type RefObject } from 'react';

interface DrawOptions {
    enabled?: boolean;
    duration?: number;
    gap?: number;
}

function collectPaths(svg: SVGSVGElement | null): SVGPathElement[] {
    return svg
        ? Array.from(svg.querySelectorAll<SVGPathElement>('path[data-draw]'))
        : [];
}

export function useDrawPaths(
    ref: RefObject<SVGSVGElement | null>,
    { enabled = true, duration = 1800, gap = 70 }: DrawOptions = {}
): void {
    const reduced = usePrefersReducedMotion();
    const inView = useInView(ref, { once: true });
    const active = enabled && !reduced;

    // Sembunyikan garis sebelum cat pertama agar tidak berkedip.
    useLayoutEffect(() => {
        if (!active) {
            return;
        }
        const paths = collectPaths(ref.current);
        paths.forEach((path) => {
            const length = path.getTotalLength();
            path.style.strokeDasharray = `${length}`;
            path.style.strokeDashoffset = `${length}`;
        });
        return () => {
            paths.forEach((path) => {
                path.style.strokeDasharray = '';
                path.style.strokeDashoffset = '';
            });
        };
    }, [active, ref]);

    useEffect(() => {
        if (!active || !inView) {
            return;
        }
        const animation = animate(collectPaths(ref.current), {
            strokeDashoffset: 0,
            duration,
            ease: 'outQuart',
            delay: stagger(gap),
        });
        return () => {
            animation.cancel();
        };
    }, [active, inView, duration, gap, ref]);
}
