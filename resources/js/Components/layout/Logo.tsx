import { useBrand } from '@/hooks/useBrand';
import { cx } from '@/lib/cx';
import { focusRing } from '@/lib/ui';
import { Link } from '@inertiajs/react';

interface LogoProps {
    /** `light` dipakai di atas latar navy. */
    tone?: 'dark' | 'light';
    href?: string;
    className?: string;
}

/** Logo resmi NSA bila ada di settings, fallback ke placeholder wordmark SVG. */
export default function Logo({
    tone = 'dark',
    href = '/',
    className,
}: LogoProps) {
    const brand = useBrand();
    const dark = tone === 'dark';
    const activeLogoUrl = dark
        ? brand.logo_dark || brand.logo_light
        : brand.logo_light || brand.logo_dark;

    return (
        <Link
            href={href}
            aria-label={`${brand.short_name}, ke beranda`}
            className={cx(
                'inline-flex items-center gap-2.5 rounded-control',
                focusRing,
                className
            )}
        >
            {activeLogoUrl ? (
                <img
                    src={activeLogoUrl}
                    alt={brand.name}
                    className="h-8 max-w-[160px] object-contain"
                />
            ) : (
                <>
                    <svg
                        viewBox="0 0 28 28"
                        className="h-7 w-7"
                        fill="none"
                        strokeWidth="2"
                        strokeLinecap="round"
                        aria-hidden="true"
                    >
                        <rect
                            width="28"
                            height="28"
                            rx="8"
                            className={dark ? 'fill-navy' : 'fill-white'}
                        />
                        <path
                            d="M5 12c3-3 6-3 9 0s6 3 9 0"
                            className={dark ? 'stroke-aqua' : 'stroke-ocean'}
                        />
                        <path
                            d="M5 18c3-3 6-3 9 0s6 3 9 0"
                            className={dark ? 'stroke-white' : 'stroke-navy'}
                        />
                    </svg>
                    <span
                        className={cx(
                            'font-display text-2xl font-bold leading-none tracking-tight',
                            dark ? 'text-navy' : 'text-white'
                        )}
                    >
                        {brand.short_name}
                    </span>
                </>
            )}
        </Link>
    );
}
