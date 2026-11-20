import { useAnimeScope } from '@/hooks/useAnimeScope';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';
import { animate, stagger } from 'animejs';
import { Fragment, type ElementType } from 'react';

type SplitBy = 'word' | 'char';

interface SplitTextProps {
    text: string;
    by?: SplitBy;
    as?: ElementType;
    className?: string;
    /**
     * true  = animasi sendiri saat masuk layar (anime.js).
     * false = hanya membuat markup `[data-split]`; dianimasikan oleh timeline induk.
     */
    animate?: boolean;
    delay?: number;
}

/** Posisi awal tersembunyi (di bawah mask) sebelum anime.js berjalan. */
export const SPLIT_HIDDEN = { transform: 'translateY(110%)' } as const;

/**
 * Memecah teks per kata/huruf untuk animasi mask-reveal.
 * Pembaca layar menerima teks utuh lewat `aria-label`.
 */
export default function SplitText({
    text,
    by = 'word',
    as: Tag = 'span',
    className,
    animate: selfAnimate = true,
    delay = 0,
}: SplitTextProps) {
    const reduced = usePrefersReducedMotion();
    const hidden = reduced ? undefined : SPLIT_HIDDEN;

    const ref = useAnimeScope<HTMLElement>(
        (root) => {
            animate(root.querySelectorAll('[data-split]'), {
                y: ['110%', '0%'],
                duration: 900,
                ease: 'outExpo',
                delay: stagger(by === 'char' ? 22 : 60, { start: delay }),
            });
        },
        [text, by, delay],
        { inView: true, enabled: selfAnimate }
    );

    const words = text.split(' ');

    return (
        <Tag ref={ref} aria-label={text} className={className}>
            {words.map((word, w) => (
                <Fragment key={w}>
                    <span aria-hidden="true" className="inline-block overflow-hidden pb-[0.08em] align-bottom">
                        {by === 'word' ? (
                            <span data-split="" className="inline-block will-change-transform" style={hidden}>
                                {word}
                            </span>
                        ) : (
                            Array.from(word).map((char, c) => (
                                <span key={c} data-split="" className="inline-block will-change-transform" style={hidden}>
                                    {char}
                                </span>
                            ))
                        )}
                    </span>
                    {w < words.length - 1 ? ' ' : null}
                </Fragment>
            ))}
        </Tag>
    );
}
