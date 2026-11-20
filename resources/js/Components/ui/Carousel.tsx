import { spring } from '@/animations/variants';
import { useMediaQuery, usePrefersReducedMotion } from '@/hooks/useMediaQuery';
import { cx } from '@/lib/cx';
import { focusRing } from '@/lib/ui';
import { animate, motion, useMotionValue, type PanInfo } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
    Children,
    useCallback,
    useEffect,
    useId,
    useLayoutEffect,
    useRef,
    useState,
    type KeyboardEvent,
    type ReactNode,
} from 'react';

interface PerView {
    base: number;
    md?: number;
    lg?: number;
}

interface CarouselProps {
    children: ReactNode;
    /** Label aksesibel, mis. "Cerita anggota". */
    label: string;
    perView?: PerView;
    /** Jarak antar slide dalam px (kelipatan 8). */
    gap?: number;
    /** Interval autoplay (ms). 0 = mati. */
    autoplay?: number;
    className?: string;
}

function usePerView({ base, md = base, lg = md }: PerView): number {
    const isMd = useMediaQuery('(min-width: 768px)');
    const isLg = useMediaQuery('(min-width: 1024px)');
    return isLg ? lg : isMd ? md : base;
}

/**
 * Carousel ringan berbasis Framer Motion.
 * Swipe/drag, tombol navigasi, indikator (layoutId), autoplay yang berhenti
 * saat hover/fokus, responsif, dan bisa dioperasikan dengan keyboard.
 */
export default function Carousel({
    children,
    label,
    perView = { base: 1, md: 2, lg: 3 },
    gap = 24,
    autoplay = 6000,
    className,
}: CarouselProps) {
    const slides = Children.toArray(children);
    const count = slides.length;
    const visible = Math.min(usePerView(perView), count);
    const maxIndex = Math.max(0, count - visible);
    const pages = maxIndex + 1;

    const uid = useId();
    const reduced = usePrefersReducedMotion();
    const viewportRef = useRef<HTMLDivElement>(null);
    const [step, setStep] = useState(0);
    const [index, setIndex] = useState(0);
    const [paused, setPaused] = useState(false);
    const x = useMotionValue(0);

    // Lebar satu langkah = (lebar viewport + gap) / jumlah slide terlihat.
    useLayoutEffect(() => {
        const node = viewportRef.current;
        if (!node) return;
        const measure = () => setStep((node.clientWidth + gap) / visible);
        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(node);
        return () => observer.disconnect();
    }, [gap, visible]);

    // Jaga index tetap valid saat jumlah slide terlihat berubah.
    const current = Math.min(index, maxIndex);

    useEffect(() => {
        const controls = animate(x, -current * step, reduced ? { duration: 0 } : spring);
        return () => controls.stop();
    }, [current, step, reduced, x]);

    const goTo = useCallback(
        (next: number) => setIndex(((next % pages) + pages) % pages),
        [pages]
    );

    useEffect(() => {
        if (!autoplay || paused || reduced || pages <= 1) return;
        const timer = window.setInterval(() => goTo(current + 1), autoplay);
        return () => window.clearInterval(timer);
    }, [autoplay, paused, reduced, pages, current, goTo]);

    const onDragEnd = (_: unknown, info: PanInfo) => {
        const threshold = step / 4;
        if (info.offset.x < -threshold || info.velocity.x < -400) {
            setIndex(Math.min(current + 1, maxIndex));
        } else if (info.offset.x > threshold || info.velocity.x > 400) {
            setIndex(Math.max(current - 1, 0));
        } else {
            animate(x, -current * step, spring);
        }
    };

    const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        const keys: Record<string, number> = {
            ArrowRight: current + 1,
            ArrowLeft: current - 1,
            Home: 0,
            End: maxIndex,
        };
        if (!(event.key in keys)) return;
        event.preventDefault();
        goTo(keys[event.key]);
    };

    const navButton = cx(
        'grid h-11 w-11 place-items-center rounded-full border border-line bg-white text-navy shadow-soft transition-colors hover:border-ocean hover:text-ocean disabled:opacity-40',
        focusRing
    );

    return (
        <div
            role="region"
            aria-roledescription="carousel"
            aria-label={label}
            tabIndex={0}
            onKeyDown={onKeyDown}
            onPointerEnter={() => setPaused(true)}
            onPointerLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
            }}
            className={cx('rounded-card', focusRing, className)}
        >
            <div ref={viewportRef} className="overflow-hidden">
                <motion.div
                    id={`${uid}-track`}
                    aria-live={paused ? 'polite' : 'off'}
                    className="flex cursor-grab touch-pan-y active:cursor-grabbing"
                    style={{ x, gap }}
                    drag={pages > 1 ? 'x' : false}
                    dragConstraints={{ left: -maxIndex * step, right: 0 }}
                    dragElastic={0.12}
                    dragMomentum={false}
                    onDragEnd={onDragEnd}
                >
                    {slides.map((slide, i) => {
                        const shown = i >= current && i < current + visible;
                        return (
                            <div
                                key={i}
                                role="group"
                                aria-roledescription="slide"
                                aria-label={`${i + 1} dari ${count}`}
                                aria-hidden={!shown}
                                inert={!shown}
                                className="shrink-0"
                                style={{
                                    flexBasis: `calc((100% - ${gap * (visible - 1)}px) / ${visible})`,
                                }}
                            >
                                {slide}
                            </div>
                        );
                    })}
                </motion.div>
            </div>

            {pages > 1 ? (
                <div className="mt-8 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2" role="group" aria-label="Pilih slide">
                        {Array.from({ length: pages }, (_, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={() => goTo(i)}
                                aria-label={`Ke slide ${i + 1}`}
                                aria-current={i === current ? 'true' : undefined}
                                aria-controls={`${uid}-track`}
                                className={cx('relative grid h-11 w-6 place-items-center', focusRing, 'rounded-full')}
                            >
                                <span className="h-1.5 w-1.5 rounded-full bg-line" />
                                {i === current ? (
                                    <motion.span
                                        layoutId={`${uid}-dot`}
                                        transition={spring}
                                        className="absolute h-1.5 w-5 rounded-full bg-ocean"
                                    />
                                ) : null}
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => goTo(current - 1)}
                            aria-label="Slide sebelumnya"
                            aria-controls={`${uid}-track`}
                            className={navButton}
                        >
                            <ChevronLeft size={20} strokeWidth={1.75} />
                        </button>
                        <button
                            type="button"
                            onClick={() => goTo(current + 1)}
                            aria-label="Slide berikutnya"
                            aria-controls={`${uid}-track`}
                            className={navButton}
                        >
                            <ChevronRight size={20} strokeWidth={1.75} />
                        </button>
                    </div>
                </div>
            ) : null}
        </div>
    );
}

