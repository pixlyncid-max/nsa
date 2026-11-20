import { hoverLift } from '@/animations/variants';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';
import { cx } from '@/lib/cx';
import { motion, type HTMLMotionProps } from 'framer-motion';
import type { HTMLAttributes, ReactNode } from 'react';

type CardPadding = 'none' | 'sm' | 'md' | 'lg';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    /** Kartu yang bisa diklik: naik 4px dan shadow `lift` (Framer Motion). */
    interactive?: boolean;
    padding?: CardPadding;
}

const paddings: Record<CardPadding, string> = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
};

export default function Card({
    interactive = false,
    padding = 'md',
    className,
    ...props
}: CardProps) {
    const reduced = usePrefersReducedMotion();
    const classes = cx(
        'rounded-card border border-line bg-white shadow-soft',
        paddings[padding],
        interactive && 'transition-shadow duration-220 ease-brand hover:border-ocean/30 hover:shadow-lift',
        className
    );

    if (interactive && !reduced) {
        return (
            <motion.div
                {...(props as HTMLMotionProps<'div'>)}
                {...hoverLift}
                className={classes}
            />
        );
    }

    return <div {...props} className={classes} />;
}

interface CardHeaderProps {
    title: string;
    description?: string;
    action?: ReactNode;
}

export function CardHeader({ title, description, action }: CardHeaderProps) {
    return (
        <div className="mb-4 flex items-start justify-between gap-4">
            <div>
                <h3 className="t-h3">{title}</h3>
                {description ? (
                    <p className="mt-1 text-sm text-slate">{description}</p>
                ) : null}
            </div>
            {action}
        </div>
    );
}
