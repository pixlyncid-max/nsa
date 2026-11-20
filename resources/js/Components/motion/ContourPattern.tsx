import { useDrawPaths } from '@/hooks/useDrawPaths';
import { contourPaths } from '@/lib/contour';
import { cx } from '@/lib/cx';
import { useMemo, useRef } from 'react';

export type ContourTone =
    'line' | 'mist' | 'sky' | 'aqua' | 'ocean' | 'navy' | 'white';

const toneClass: Record<ContourTone, string> = {
    line: 'text-line',
    mist: 'text-mist',
    sky: 'text-sky',
    aqua: 'text-aqua',
    ocean: 'text-ocean',
    navy: 'text-navy',
    white: 'text-white',
};

interface ContourPatternProps {
    /** Warna garis, hanya token brand/netral. */
    tone?: ContourTone;
    opacity?: number;
    /** Lebar dan tinggi (angka = px, atau string CSS). Default memenuhi induk. */
    size?: number | string;
    rings?: number;
    /** Ubah bentuk kontur tanpa mengubah gaya. */
    seed?: number;
    strokeWidth?: number;
    /** Gambar garis pelan saat masuk layar (anime.js). */
    animate?: boolean;
    className?: string;
}

/** Garis kontur air seperti peta kedalaman laut: identitas visual utama NSA. */
export default function ContourPattern({
    tone = 'line',
    opacity = 0.6,
    size = '100%',
    rings = 10,
    seed = 1,
    strokeWidth = 1,
    animate = true,
    className,
}: ContourPatternProps) {
    const ref = useRef<SVGSVGElement>(null);
    const paths = useMemo(() => contourPaths({ rings, seed }), [rings, seed]);

    useDrawPaths(ref, { enabled: animate });

    return (
        <svg
            ref={ref}
            aria-hidden="true"
            focusable="false"
            viewBox="0 0 800 600"
            preserveAspectRatio="xMidYMid slice"
            width={size}
            height={size}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            style={{ opacity }}
            className={cx('pointer-events-none', toneClass[tone], className)}
        >
            {paths.map((d, index) => (
                <path key={index} d={d} data-draw="" />
            ))}
        </svg>
    );
}
