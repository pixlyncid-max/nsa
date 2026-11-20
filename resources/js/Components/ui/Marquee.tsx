import { cx } from '@/lib/cx';
import { Children, type CSSProperties, type ReactNode } from 'react';

interface MarqueeProps {
    children: ReactNode;
    /** Label aksesibel untuk daftar. */
    label: string;
    /** Arah berjalan dibalik (kiri → kanan). */
    reverse?: boolean;
    /** Durasi satu putaran (detik). Semakin besar semakin pelan. */
    duration?: number;
    /** Jarak antar item dalam px. */
    gap?: number;
    /** Ulangi isi agar selalu lebih lebar dari layar. */
    minItems?: number;
    className?: string;
}

/**
 * Logo/teks berjalan tanpa putus. Murni CSS transform (komposit GPU),
 * berhenti saat hover/fokus, fade di kedua sisi. Bila reduced motion,
 * animasi berhenti dan daftar bisa digeser manual.
 */
export default function Marquee({
    children,
    label,
    reverse = false,
    duration = 40,
    gap = 48,
    minItems = 8,
    className,
}: MarqueeProps) {
    const items = Children.toArray(children);
    if (items.length === 0) return null;

    const repeat = Math.max(1, Math.ceil(minItems / items.length));
    const filled = Array.from({ length: repeat }, () => items).flat();

    // Dua salinan identik + padding kanan = gap, sehingga -50% pas tanpa sambungan.
    const list = (hidden: boolean) => (
        <ul
            aria-hidden={hidden || undefined}
            inert={hidden || undefined}
            className="flex shrink-0 items-center"
            style={{ gap, paddingRight: gap }}
        >
            {filled.map((item, i) => (
                <li key={i} className="shrink-0">
                    {item}
                </li>
            ))}
        </ul>
    );

    return (
        <div
            role="region"
            aria-label={label}
            className={cx(
                'group mask-fade-x overflow-hidden motion-reduce:overflow-x-auto',
                className
            )}
        >
            <div
                className={cx(
                    'flex w-max animate-marquee will-change-transform motion-reduce:animate-none',
                    'group-hover:paused group-focus-within:paused',
                    reverse && '[animation-direction:reverse]'
                )}
                style={{ '--marquee-duration': `${duration}s` } as CSSProperties}
            >
                {list(false)}
                {list(true)}
            </div>
        </div>
    );
}
