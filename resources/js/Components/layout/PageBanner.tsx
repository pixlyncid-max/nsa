import ContourPattern from '@/Components/motion/ContourPattern';
import { cx } from '@/lib/cx';
import type { ReactNode } from 'react';

export interface PageBannerProps {
    eyebrow?: string;
    title: string;
    subtitle?: string;
    action?: ReactNode;
    className?: string;
    children?: ReactNode;
}

/**
 * Banner judul bergradien biru tua sesuai spesifikasi design.md:
 * Dari navy (#014081) ke ocean (#056ED4) dengan aksen kontur aqua halus,
 * eyebrow kapital kecil aqua, display title putih tebal, dan teks deskripsi.
 */
export default function PageBanner({
    eyebrow,
    title,
    subtitle,
    action,
    className,
    children,
}: PageBannerProps) {
    return (
        <div
            className={cx(
                'relative overflow-hidden rounded-card bg-gradient-to-r from-navy via-navy to-ocean p-6 md:p-8 text-white shadow-soft',
                className
            )}
        >
            <ContourPattern
                tone="white"
                opacity={0.08}
                seed={3}
                rings={9}
                animate={false}
                className="absolute inset-0 pointer-events-none"
            />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="max-w-2xl min-w-0">
                    {eyebrow ? (
                        <p className="t-eyebrow text-aqua font-bold tracking-wider uppercase text-xs mb-2">
                            {eyebrow}
                        </p>
                    ) : null}

                    <h1 className="font-display text-2xl font-bold tracking-tight text-white md:text-3xl lg:text-[32px] leading-tight">
                        {title}
                    </h1>

                    {subtitle ? (
                        <p className="mt-2 text-sm leading-relaxed text-white/85 md:text-base">
                            {subtitle}
                        </p>
                    ) : null}

                    {children ? <div className="mt-4">{children}</div> : null}
                </div>

                {action ? (
                    <div className="flex shrink-0 flex-wrap items-center gap-3">
                        {action}
                    </div>
                ) : null}
            </div>
        </div>
    );
}
