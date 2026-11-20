import { cx } from '@/lib/cx';
import { statusMeta, type BadgeTone } from '@/lib/status';
import type { ReactNode } from 'react';

const tones: Record<BadgeTone, { wrap: string; dot: string }> = {
    pending: { wrap: 'border-warning/30 bg-warning/10', dot: 'bg-warning' },
    approved: { wrap: 'border-success/30 bg-success/10', dot: 'bg-success' },
    revision: { wrap: 'border-sky/40 bg-sky/10', dot: 'bg-sky' },
    rejected: { wrap: 'border-danger/30 bg-danger/10', dot: 'bg-danger' },
    info: { wrap: 'border-ocean/30 bg-ocean/10', dot: 'bg-ocean' },
    neutral: { wrap: 'border-line bg-mist', dot: 'bg-slate' },
};

interface BadgeProps {
    tone?: BadgeTone;
    dot?: boolean;
    className?: string;
    children: ReactNode;
}

/** Pil kecil dengan titik berwarna; teks tetap `ink` agar kontras terjaga. */
export default function Badge({
    tone = 'neutral',
    dot = true,
    className,
    children,
}: BadgeProps) {
    const style = tones[tone];

    return (
        <span
            className={cx(
                'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold leading-none text-ink',
                style.wrap,
                className
            )}
        >
            {dot ? (
                <span
                    className={cx('h-1.5 w-1.5 rounded-full', style.dot)}
                    aria-hidden="true"
                />
            ) : null}
            {children}
        </span>
    );
}

/** Badge dari nilai Enum backend, mis. `approved` atau `pending_payment`. */
export function StatusBadge({ status }: { status: string }) {
    const meta = statusMeta[status] ?? { label: status, tone: 'neutral' };

    return <Badge tone={meta.tone}>{meta.label}</Badge>;
}
