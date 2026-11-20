import { cx } from '@/lib/cx';
import type { ReactNode } from 'react';

/** Lebar maksimum 1240px; padding samping 24px (mobile) / 48px (desktop). */
export default function Container({
    children,
    className,
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <div
            className={cx(
                'container-page',
                className
            )}
        >
            {children}
        </div>
    );
}
