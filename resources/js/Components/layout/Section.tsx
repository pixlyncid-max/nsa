import Container from '@/Components/layout/Container';
import { cx } from '@/lib/cx';
import React from 'react';

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
    id?: string;
    /** Nomor indeks bab, contoh: "01", "02" */
    index?: string;
    /** Label nama bab di sebelah nomor indeks */
    label?: string;
    /** Nada warna latar belakang */
    tone?: 'white' | 'mist' | 'navy';
    /** Bila true, konten tidak dibungkus Container bawaan */
    bleed?: boolean;
    className?: string;
    containerClassName?: string;
    children: React.ReactNode;
}

/**
 * Primitif Section dengan jarak vertikal standar dan indeks bab bernomor.
 * Bagian dari sistem layout "Garis Pantai".
 */
export default function Section({
    id,
    index: _index,
    label: _label,
    tone = 'white',
    bleed = false,
    className,
    containerClassName,
    children,
    ...rest
}: SectionProps) {
    void _index;
    void _label;

    const isNavy = tone === 'navy';
    const isMist = tone === 'mist';

    const toneClasses = isNavy
        ? 'bg-navy text-white'
        : isMist
        ? 'bg-mist text-ink border-y border-line/60'
        : 'bg-white text-ink';

    return (
        <section
            id={id}
            className={cx(
                'relative py-16 sm:py-20 md:py-24 lg:py-28',
                toneClasses,
                className
            )}
            {...rest}
        >
            {bleed ? (
                children
            ) : (
                <Container className={containerClassName}>{children}</Container>
            )}
        </section>
    );
}
