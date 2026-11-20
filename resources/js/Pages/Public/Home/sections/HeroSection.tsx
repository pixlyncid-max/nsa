import ContourPattern from '@/Components/motion/ContourPattern';
import WaveDivider from '@/Components/motion/WaveDivider';
import { useCopy } from '@/hooks/useCopy';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';
import { cx } from '@/lib/cx';
import { resolveMembershipCta } from '@/lib/membershipCta';
import { ease } from '@/lib/motion';
import { focusRing } from '@/lib/ui';
import type { PageProps } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Users } from 'lucide-react';
import { useMemo } from 'react';

export interface HeroImageVariant {
    exists: boolean;
    src: string;
    avifSrcSet: string;
    webpSrcSet: string;
    width: number;
    height: number;
    objectPosition: string;
    alt: string;
}

export interface HeroConfig {
    hasDesktop: boolean;
    hasMobile: boolean;
    desktop: HeroImageVariant;
    mobile: HeroImageVariant;
    guidesEnabled: boolean;
}

export interface HeroSectionProps {
    showWaves?: boolean;
    heroConfig?: HeroConfig;
}

export default function HeroSection({
    showWaves = true,
    heroConfig,
}: HeroSectionProps) {
    const { url, props } = usePage<PageProps>();
    const { t } = useCopy();
    const reducedMotion = usePrefersReducedMotion();

    const user = props.auth?.user;
    const promoData = props.membershipPromo;
    const brandShort = props.brand?.short_name || 'NSA';

    const titleLine1 = t('home.hero.title_line1');
    const titleLine2 = t('home.hero.title_line2');
    const subtitle = t('home.hero.subtitle');
    const defaultPrimaryLabel = t('home.hero.cta_primary');
    const secondaryLabel = t('home.hero.cta_secondary');

    const primaryCta = useMemo(() => {
        const resolved = resolveMembershipCta(user, promoData, brandShort, t, {
            defaultPrimaryLabel,
        });
        return {
            label: resolved.primaryLabel,
            href: resolved.primaryHref,
        };
    }, [user, promoData, brandShort, t, defaultPrimaryLabel]);

    const hasImage = Boolean(heroConfig?.hasDesktop || heroConfig?.hasMobile);

    const showGuides = useMemo(() => {
        if (!heroConfig?.guidesEnabled) return false;
        const query = url.includes('?') ? url.split('?')[1] : '';
        if (new URLSearchParams(query).get('guides') === '1') {
            return true;
        }
        if (typeof window !== 'undefined') {
            return new URLSearchParams(window.location.search).get('guides') === '1';
        }
        return false;
    }, [heroConfig?.guidesEnabled, url]);

    return (
        <section
            id="hero"
            aria-label="Beranda utama"
            className="relative flex w-full flex-col justify-start md:justify-center overflow-hidden min-h-[600px] md:min-h-[520px] lg:min-h-[clamp(520px,44vw,680px)]"
        >
            {/* Lapis 1: Gambar Latar atau Placeholder Kontur Air */}
            {hasImage && heroConfig ? (
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
                >
                    <picture
                        className={cx(
                            'block h-full w-full',
                            !reducedMotion && 'hero-bg-slow-zoom'
                        )}
                    >
                        {heroConfig.hasMobile && heroConfig.mobile.avifSrcSet ? (
                            <source
                                media="(max-width: 767px)"
                                type="image/avif"
                                srcSet={heroConfig.mobile.avifSrcSet}
                                sizes="100vw"
                            />
                        ) : null}
                        {heroConfig.hasMobile && heroConfig.mobile.webpSrcSet ? (
                            <source
                                media="(max-width: 767px)"
                                type="image/webp"
                                srcSet={heroConfig.mobile.webpSrcSet}
                                sizes="100vw"
                            />
                        ) : heroConfig.hasMobile ? (
                            <source
                                media="(max-width: 767px)"
                                srcSet={heroConfig.mobile.src}
                            />
                        ) : null}

                        {heroConfig.hasDesktop && heroConfig.desktop.avifSrcSet ? (
                            <source
                                media="(min-width: 768px)"
                                type="image/avif"
                                srcSet={heroConfig.desktop.avifSrcSet}
                                sizes="100vw"
                            />
                        ) : null}
                        {heroConfig.hasDesktop && heroConfig.desktop.webpSrcSet ? (
                            <source
                                media="(min-width: 768px)"
                                type="image/webp"
                                srcSet={heroConfig.desktop.webpSrcSet}
                                sizes="100vw"
                            />
                        ) : null}

                        <img
                            src={
                                heroConfig.hasDesktop
                                    ? heroConfig.desktop.src
                                    : heroConfig.mobile.src
                            }
                            alt=""
                            aria-hidden="true"
                            width={heroConfig.desktop.width}
                            height={heroConfig.desktop.height}
                            decoding="async"
                            fetchPriority="high"
                            className="h-full w-full object-cover object-bottom md:object-center"
                        />
                    </picture>
                </div>
            ) : (
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-gradient-to-b from-[#F4F8FC] to-[#E6F4FB]"
                >
                    <ContourPattern
                        tone="sky"
                        opacity={0.34}
                        rings={10}
                        seed={11}
                        animate={false}
                        className="absolute inset-0"
                    />
                </div>
            )}

            {/* Lapis 2: Overlay Pemudar Putih (Desktop Horizontal & Mobile Vertikal) */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-[1] hidden md:block"
                style={{ background: 'var(--hero-overlay-desktop)' }}
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-[1] md:hidden"
                style={{ background: 'var(--hero-overlay-mobile)' }}
            />

            {/* Lapis 3: Gelombang 3 Lapis di Bagian Bawah */}
            {showWaves ? (
                <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-full flex items-end">
                    <WaveDivider variant="hero-layers" animate={!reducedMotion} />
                </div>
            ) : null}

            {/* Mode Panduan Zona Aman (Khusus APP_ENV=local & ?guides=1) */}
            {showGuides ? (
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 z-[20]"
                >
                    <div className="absolute inset-y-0 left-0 w-[28%] border-r border-dashed border-ocean/70 bg-sky/10" />
                    <div className="absolute inset-y-0 left-[28%] right-[28%] border-x border-dashed border-navy/50" />
                    <div className="absolute inset-y-0 right-0 w-[28%] border-l border-dashed border-ocean/70 bg-sky/10" />
                    <div className="absolute inset-x-0 top-[8%] border-t border-dashed border-danger/70" />
                    <div className="absolute inset-x-0 bottom-[15%] border-b border-dashed border-danger/70" />
                </div>
            ) : null}

            {/* Lapis 4: Konten Teks Tengah */}
            <div className="relative z-10 mx-auto w-full max-w-[640px] px-5 pt-10 pb-36 text-center sm:px-6 md:py-16 md:pb-28 lg:py-20 lg:pb-32">
                <h1 className="font-display font-bold leading-[1.08] tracking-[-0.02em] [text-wrap:balance] text-[clamp(1.75rem,8vw,2.25rem)] md:text-[clamp(2rem,3.6vw,3.5rem)]">
                    <span className="block overflow-hidden pb-0.5 text-navy">
                        <motion.span
                            className="block will-change-transform"
                            initial={
                                reducedMotion
                                    ? false
                                    : { y: '105%', opacity: 0.15 }
                            }
                            animate={{ y: '0%', opacity: 1 }}
                            transition={{
                                duration: reducedMotion ? 0 : 0.7,
                                ease,
                                delay: 0,
                            }}
                        >
                            {titleLine1}
                        </motion.span>
                    </span>
                    <span className="block overflow-hidden pb-1 text-ocean">
                        <motion.span
                            className="block will-change-transform"
                            initial={
                                reducedMotion
                                    ? false
                                    : { y: '105%', opacity: 0.15 }
                            }
                            animate={{ y: '0%', opacity: 1 }}
                            transition={{
                                duration: reducedMotion ? 0 : 0.7,
                                ease,
                                delay: reducedMotion ? 0 : 0.12,
                            }}
                        >
                            {titleLine2}
                        </motion.span>
                    </span>
                </h1>

                <motion.p
                    initial={reducedMotion ? false : { opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        duration: reducedMotion ? 0 : 0.6,
                        ease,
                        delay: reducedMotion ? 0 : 0.24,
                    }}
                    className="mx-auto mt-5 max-w-[580px] text-base sm:text-[18px] leading-[1.6] text-slate line-clamp-3"
                >
                    {subtitle}
                </motion.p>

                {/* Dua Tombol Aksi */}
                <div className="mt-8 flex w-full flex-col items-stretch justify-center gap-3 md:w-auto md:flex-row md:items-center md:gap-4">
                    <motion.div
                        initial={reducedMotion ? false : { opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            duration: reducedMotion ? 0 : 0.55,
                            ease,
                            delay: reducedMotion ? 0 : 0.32,
                        }}
                        className="w-full md:w-auto"
                    >
                        <Link
                            href={primaryCta.href}
                            className={cx(
                                'group inline-flex h-12 w-full md:w-auto items-center justify-center gap-2.5 rounded-[10px] bg-ocean px-6 text-sm sm:text-[15px] font-semibold text-white shadow-soft transition-colors hover:bg-navy',
                                focusRing
                            )}
                        >
                            <Users className="h-4 w-4 shrink-0" strokeWidth={2} />
                            <span className="truncate">{primaryCta.label}</span>
                            <ArrowRight
                                className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-[3px]"
                                strokeWidth={2}
                            />
                        </Link>
                    </motion.div>

                    <motion.div
                        initial={reducedMotion ? false : { opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            duration: reducedMotion ? 0 : 0.55,
                            ease,
                            delay: reducedMotion ? 0 : 0.4,
                        }}
                        className="w-full md:w-auto"
                    >
                        <Link
                            href="/tentang-kami#program-kerja"
                            className={cx(
                                'group inline-flex h-12 w-full md:w-auto items-center justify-center gap-2.5 rounded-[10px] border-[1.5px] border-navy bg-white px-6 text-sm sm:text-[15px] font-semibold text-navy shadow-soft transition-colors hover:bg-mist',
                                focusRing
                            )}
                        >
                            <span
                                aria-hidden="true"
                                className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-navy/30 bg-mist text-navy"
                            >
                                <Play
                                    className="h-2.5 w-2.5 fill-current translate-x-[0.5px]"
                                    strokeWidth={2}
                                />
                            </span>
                            <span className="truncate">{secondaryLabel}</span>
                            <ArrowRight
                                className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-[3px]"
                                strokeWidth={2}
                            />
                        </Link>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
