import Container from '@/Components/layout/Container';
import type { ReactNode } from 'react';

interface DesignSectionProps {
    id: string;
    eyebrow: string;
    title: string;
    description?: string;
    children: ReactNode;
}

/** Pembungkus satu kelompok contoh di galeri /desain. */
export default function DesignSection({
    id,
    eyebrow,
    title,
    description,
    children,
}: DesignSectionProps) {
    return (
        <section
            id={id}
            aria-labelledby={`${id}-title`}
            className="scroll-mt-24 border-t border-line section"
        >
            <Container>
                <p className="t-eyebrow">{eyebrow}</p>
                <h2 id={`${id}-title`} className="t-h2 mt-2">
                    {title}
                </h2>
                {description ? (
                    <p className="measure mt-3 text-slate">{description}</p>
                ) : null}
                <div className="mt-10 space-y-10">{children}</div>
            </Container>
        </section>
    );
}

/** Label kecil di atas satu contoh. */
export function Specimen({
    label,
    children,
    className,
}: {
    label: string;
    children: ReactNode;
    className?: string;
}) {
    return (
        <div className={className}>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate">
                {label}
            </p>
            {children}
        </div>
    );
}
