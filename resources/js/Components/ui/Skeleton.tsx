import { cx } from '@/lib/cx';

interface SkeletonProps {
    className?: string;
}

export default function Skeleton({ className }: SkeletonProps) {
    return (
        <div
            aria-hidden="true"
            className={cx(
                'animate-pulse rounded-control bg-line/70 motion-reduce:animate-none',
                className
            )}
        />
    );
}

export function SkeletonText({
    lines = 3,
    className,
}: {
    lines?: number;
    className?: string;
}) {
    return (
        <div
            className={cx('space-y-2.5', className)}
            role="status"
            aria-label="Memuat konten"
        >
            {Array.from({ length: lines }, (_, index) => (
                <Skeleton
                    key={index}
                    className={cx(
                        'h-3.5',
                        index === lines - 1 ? 'w-2/3' : 'w-full'
                    )}
                />
            ))}
        </div>
    );
}
