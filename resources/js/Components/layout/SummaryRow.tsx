import { cx } from '@/lib/cx';
import type { ReactNode } from 'react';

export interface SummaryRowProps {
    children: ReactNode;
    cols?: 1 | 2 | 3 | 4;
    className?: string;
}

const colClasses: Record<number, string> = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
};

/**
 * Baris metrik dan kartu ringkasan data yang adaptif di berbagai ukuran layar.
 */
export default function SummaryRow({
    children,
    cols = 3,
    className,
}: SummaryRowProps) {
    return (
        <div
            className={cx(
                'grid gap-4 sm:gap-6',
                colClasses[cols] ?? colClasses[3],
                className
            )}
        >
            {children}
        </div>
    );
}
