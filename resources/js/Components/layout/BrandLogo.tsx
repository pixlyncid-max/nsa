import brandLogoManifest from '@/generated/brand-logo.json';
import { useBrand } from '@/hooks/useBrand';
import { cx } from '@/lib/cx';
import { useLocalizedRoute } from '@/lib/lroute';
import { focusRing } from '@/lib/ui';
import { Link } from '@inertiajs/react';
import { useState } from 'react';

export type BrandLogoFooterMode = 'original' | 'mono-white' | 'white-badge';

export interface BrandLogoProps {
    variant: 'navbar' | 'footer';
    className?: string;
    withLink?: boolean;
    scrolled?: boolean;
}

interface ScaleMap {
    '1x': string;
    '2x': string;
    '3x': string;
}

interface LogoManifest {
    available: boolean;
    footerMode: BrandLogoFooterMode;
    navbar: {
        displayWidth: number;
        displayHeight: number;
        webp: ScaleMap;
        png: ScaleMap;
        src: string;
    } | null;
    footer: {
        displayWidth: number;
        displayHeight: number;
        webp: ScaleMap;
        png: ScaleMap;
        src: string;
        whiteWebp: ScaleMap | null;
        whitePng: ScaleMap | null;
        whiteSrc: string | null;
    } | null;
}

const manifest = brandLogoManifest as LogoManifest;

function toSrcSet(map: ScaleMap): string {
    return `${map['1x']} 1x, ${map['2x']} 2x, ${map['3x']} 3x`;
}

export default function BrandLogo({
    variant,
    className,
    withLink = true,
    scrolled = false,
}: BrandLogoProps) {
    const brand = useBrand();
    const lroute = useLocalizedRoute();
    const [imgFailed, setImgFailed] = useState(false);

    const isNavbar = variant === 'navbar';

    // Prioritas 1: Unggahan Superadmin dari Settings (Prompt 0) menimpa bawaan
    const settingsOverrideUrl = isNavbar
        ? brand.logo_dark || brand.logo_light
        : brand.logo_light || brand.logo_dark;

    const configuredFooterMode = (brand as { logo_footer_mode?: string | null })
        .logo_footer_mode;
    const footerMode: BrandLogoFooterMode =
        configuredFooterMode === 'original' ||
        configuredFooterMode === 'mono-white' ||
        configuredFooterMode === 'white-badge'
            ? configuredFooterMode
            : manifest.footerMode || 'original';

    const heightClass = isNavbar
        ? cx(
              'h-8 w-auto object-contain transition-[height] duration-200',
              scrolled ? 'sm:h-[34px]' : 'sm:h-10'
          )
        : 'h-[44px] w-auto object-contain';

    let content: React.ReactNode;

    if (!imgFailed && settingsOverrideUrl) {
        content = (
            <img
                src={settingsOverrideUrl}
                alt={brand.name}
                width={isNavbar ? 106 : 117}
                height={isNavbar ? 40 : 44}
                loading={isNavbar ? 'eager' : 'lazy'}
                fetchPriority={isNavbar ? 'high' : undefined}
                onError={() => setImgFailed(true)}
                className={heightClass}
            />
        );
    } else if (!imgFailed && manifest.available && isNavbar && manifest.navbar) {
        const nav = manifest.navbar;
        content = (
            <picture className="inline-flex shrink-0 items-center">
                <source type="image/webp" srcSet={toSrcSet(nav.webp)} />
                <source type="image/png" srcSet={toSrcSet(nav.png)} />
                <img
                    src={nav.src}
                    srcSet={toSrcSet(nav.png)}
                    alt={brand.name}
                    width={nav.displayWidth}
                    height={nav.displayHeight}
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                    onError={() => setImgFailed(true)}
                    className={heightClass}
                />
            </picture>
        );
    } else if (!imgFailed && manifest.available && !isNavbar && manifest.footer) {
        const foot = manifest.footer;
        const useMonoWhite =
            footerMode === 'mono-white' && foot.whiteWebp && foot.whitePng && foot.whiteSrc;

        const webpMap = useMonoWhite ? foot.whiteWebp! : foot.webp;
        const pngMap = useMonoWhite ? foot.whitePng! : foot.png;
        const fallbackSrc = useMonoWhite ? foot.whiteSrc! : foot.src;

        const pictureEl = (
            <picture className="inline-flex shrink-0 items-center">
                <source type="image/webp" srcSet={toSrcSet(webpMap)} />
                <source type="image/png" srcSet={toSrcSet(pngMap)} />
                <img
                    src={fallbackSrc}
                    srcSet={toSrcSet(pngMap)}
                    alt={brand.name}
                    width={foot.displayWidth}
                    height={foot.displayHeight}
                    loading="lazy"
                    decoding="async"
                    onError={() => setImgFailed(true)}
                    className={heightClass}
                />
            </picture>
        );

        content =
            footerMode === 'white-badge' ? (
                <span className="inline-flex items-center rounded-[12px] bg-white px-3 py-2.5 shadow-xs">
                    {pictureEl}
                </span>
            ) : (
                pictureEl
            );
    } else {
        // Fallback teks bila berkas logo atau turunan tidak tersedia
        content = (
            <span
                className={cx(
                    'font-display text-2xl font-bold leading-none tracking-tight',
                    isNavbar ? 'text-navy' : 'text-white'
                )}
            >
                {brand.short_name}
            </span>
        );
    }

    if (!withLink) {
        return (
            <span className={cx('inline-flex shrink-0 items-center', className)}>
                {content}
            </span>
        );
    }

    return (
        <Link
            href={lroute('home')}
            aria-label={`${brand.name}`}
            className={cx(
                'inline-flex shrink-0 items-center rounded-control',
                focusRing,
                className
            )}
        >
            {content}
        </Link>
    );
}
