import { cx } from '@/lib/cx';
import React from 'react';

export interface SectionHeadingProps {
    /** Eyebrow teks kecil kapital */
    eyebrow?: string;
    /** Judul display utama */
    title: string;
    /** Deskripsi pendukung */
    description?: string;
    /** Varian penataan: rata kiri (default) atau terpisah kiri-kanan (split) */
    align?: 'left' | 'split';
    /** Elemen aksi di sisi kanan (khusus varian split) */
    actions?: React.ReactNode;
    /** Nada warna: dark (default, latar putih/mist) atau light (latar navy) */
    tone?: 'dark' | 'light';
    className?: string;
}

/**
 * Primitif SectionHeading editorial Garis Pantai.
 * Mendukung varian rata kiri bertumpuk dan varian split (judul di kiri, aksi di kanan).
 */
export default function SectionHeading({
    eyebrow: _eyebrow,
    title,
    description,
    align = 'left',
    actions,
    tone = 'dark',
    className,
}: SectionHeadingProps) {
    void _eyebrow;

    const isLight = tone === 'light';

    const titleColor = isLight ? 'text-white' : 'text-navy';
    const descColor = isLight ? 'text-white/80' : 'text-slate';

    if (align === 'split') {
        return (
            <div
                className={cx(
                    'flex flex-col gap-6 md:flex-row md:items-end md:justify-between',
                    className
                )}
            >
                <div className="max-w-2xl">
                    <h2
                        className={cx(
                            'font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl leading-[1.12]',
                            titleColor
                        )}
                    >
                        {title}
                    </h2>
                    {description ? (
                        <p className={cx('mt-4 text-base sm:text-lg leading-relaxed', descColor)}>
                            {description}
                        </p>
                    ) : null}
                </div>

                {actions ? <div className="shrink-0">{actions}</div> : null}
            </div>
        );
    }

    return (
        <div className={cx('max-w-3xl', className)}>
            <h2
                className={cx(
                    'font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl leading-[1.12]',
                    titleColor
                )}
            >
                {title}
            </h2>
            {description ? (
                <p className={cx('mt-4 text-base sm:text-lg leading-relaxed', descColor)}>
                    {description}
                </p>
            ) : null}
        </div>
    );
}
