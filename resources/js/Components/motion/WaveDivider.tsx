import type { ContourTone } from '@/Components/motion/ContourPattern';
import { useDrawPaths } from '@/hooks/useDrawPaths';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';
import { wavePath } from '@/lib/contour';
import { cx } from '@/lib/cx';
import { useMemo, useRef } from 'react';

type WaveFill = 'navy' | 'ocean' | 'mist' | 'white';

const toneClass: Record<ContourTone, string> = {
    line: 'text-line',
    mist: 'text-mist',
    sky: 'text-sky',
    aqua: 'text-aqua',
    ocean: 'text-ocean',
    navy: 'text-navy',
    white: 'text-white',
};

const fillClass: Record<WaveFill, string> = {
    navy: 'fill-navy',
    ocean: 'fill-ocean',
    mist: 'fill-mist',
    white: 'fill-white',
};

interface WaveDividerProps {
    /** Varian: garis 1px (default) atau 3 lapis gelombang bergerak untuk Hero */
    variant?: 'line' | 'hero-layers';
    /** Warna garis ombak 1px (varian line). */
    tone?: ContourTone;
    /** Isi di bawah garis, untuk peralihan ke section berwarna (varian line). */
    fill?: WaveFill;
    /** Balik vertikal (untuk tepi bawah section). */
    flip?: boolean;
    animate?: boolean;
    className?: string;
}

const WIDTH = 1440;
const HEIGHT = 24;

/**
 * Pembatas gelombang antar section.
 * Mendukung varian `line` (1px editorial) dan `hero-layers` (3 lapis ombak
 * bergerak lambat #3AD1F3, #27AAE1, #056ED4 yang bertransisi bersih ke putih).
 */
export default function WaveDivider({
    variant = 'line',
    tone = 'line',
    fill,
    flip = false,
    animate = true,
    className,
}: WaveDividerProps) {
    const ref = useRef<SVGSVGElement>(null);
    const reducedMotion = usePrefersReducedMotion();
    const line = useMemo(() => wavePath(WIDTH, HEIGHT), []);

    useDrawPaths(ref, {
        enabled: variant === 'line' && animate && !reducedMotion,
        duration: 2200,
        gap: 0,
    });

    if (variant === 'hero-layers') {
        const shouldAnimate = animate && !reducedMotion;

        return (
            <div
                aria-hidden="true"
                className={cx(
                    'pointer-events-none relative h-[14%] min-h-[60px] max-h-[96px] w-full overflow-hidden select-none',
                    className
                )}
            >
                {/* Lapis Belakang: Aqua #3AD1F3 (opacity 0.35), geser kiri 32s */}
                <div
                    className={cx(
                        'absolute inset-x-0 bottom-0 h-full w-[200%] will-change-transform',
                        shouldAnimate && 'hero-wave-back'
                    )}
                >
                    <svg
                        viewBox="0 0 2880 96"
                        preserveAspectRatio="none"
                        className="h-full w-full"
                    >
                        <path
                            d="M0,48 C240,12 480,82 720,44 C960,8 1200,78 1440,48 C1680,12 1920,82 2160,44 C2400,8 2640,78 2880,48 L2880,96 L0,96 Z"
                            fill="#3AD1F3"
                            fillOpacity="0.35"
                        />
                    </svg>
                </div>

                {/* Lapis Tengah: Sky #27AAE1 (opacity 0.55), geser kanan 26s */}
                <div
                    className={cx(
                        'absolute inset-x-0 bottom-0 h-[86%] w-[200%] will-change-transform',
                        shouldAnimate && 'hero-wave-mid'
                    )}
                >
                    <svg
                        viewBox="0 0 2880 96"
                        preserveAspectRatio="none"
                        className="h-full w-full"
                    >
                        <path
                            d="M0,52 C300,84 600,16 900,52 C1140,80 1290,26 1440,52 C1740,84 2040,16 2340,52 C2580,80 2730,26 2880,52 L2880,96 L0,96 Z"
                            fill="#27AAE1"
                            fillOpacity="0.55"
                        />
                    </svg>
                </div>

                {/* Lapis Depan: Ocean #056ED4 (opacity 0.9), geser kiri 20s */}
                <div
                    className={cx(
                        'absolute inset-x-0 bottom-0 h-[72%] w-[200%] will-change-transform',
                        shouldAnimate && 'hero-wave-front'
                    )}
                >
                    <svg
                        viewBox="0 0 2880 96"
                        preserveAspectRatio="none"
                        className="h-full w-full"
                    >
                        <path
                            d="M0,58 C260,24 520,88 780,52 C1020,20 1240,82 1440,58 C1700,24 1960,88 2220,52 C2460,20 2680,82 2880,58 L2880,96 L0,96 Z"
                            fill="#056ED4"
                            fillOpacity="0.9"
                        />
                    </svg>
                </div>

                {/* Transisi Bersih ke Putih di Bagian Paling Bawah */}
                <svg
                    viewBox="0 0 1440 44"
                    preserveAspectRatio="none"
                    className="absolute inset-x-0 -bottom-px h-[38%] w-full"
                >
                    <path
                        d="M0,26 C360,4 720,40 1080,18 C1260,8 1360,18 1440,24 L1440,44 L0,44 Z"
                        fill="#FFFFFF"
                    />
                </svg>
            </div>
        );
    }

    return (
        <svg
            ref={ref}
            aria-hidden="true"
            focusable="false"
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            preserveAspectRatio="none"
            className={cx(
                'block h-6 w-full',
                toneClass[tone],
                flip && '-scale-y-100',
                className
            )}
        >
            {fill ? (
                <path
                    d={`${line} L${WIDTH + 60} ${HEIGHT} L0 ${HEIGHT} Z`}
                    className={fillClass[fill]}
                    stroke="none"
                />
            ) : null}
            <path
                d={line}
                data-draw=""
                fill="none"
                stroke="currentColor"
                strokeWidth={1}
            />
        </svg>
    );
}
