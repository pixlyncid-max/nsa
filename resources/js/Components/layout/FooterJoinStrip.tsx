import Container from '@/Components/layout/Container';
import ContourPattern from '@/Components/motion/ContourPattern';
import Button from '@/Components/ui/Button';
import { useCopy } from '@/hooks/useCopy';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';
import { ease } from '@/lib/motion';
import type { JoinStripMedia } from '@/types';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, UserPlus } from 'lucide-react';
import { useRef } from 'react';

interface FooterJoinStripProps {
    ctaLabel: string;
    ctaHref: string;
    media?: JoinStripMedia;
}

/**
 * Strip ajakan bergabung satu baris di atas Footer.
 * Mendukung slot gambar latar AVIF/WebP dengan overlay kontras tinggi & parallax halus 8px,
 * atau fallback latar ocean (#056ED4) + kontur putih 10% selama gambar belum tersedia.
 */
export default function FooterJoinStrip({
    ctaLabel,
    ctaHref,
    media,
}: FooterJoinStripProps) {
    const { t } = useCopy();
    const reducedMotion = usePrefersReducedMotion();
    const sectionRef = useRef<HTMLElement>(null);

    const hasImage = Boolean(media?.hasDesktop || media?.hasMobile);

    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ['start end', 'end start'],
    });
    const parallaxY = useTransform(scrollYProgress, [0, 1], [-4, 4]);

    return (
        <section
            ref={sectionRef}
            aria-label="Ajakan keanggotaan NSA"
            className="relative flex items-center overflow-hidden bg-ocean text-white md:min-h-[144px]"
        >
            {/* Lapis Latar: Gambar <picture> (jika tersedia) atau Fallback Kontur Putih */}
            {hasImage && media ? (
                <>
                    <motion.div
                        aria-hidden="true"
                        style={reducedMotion ? undefined : { y: parallaxY }}
                        className="pointer-events-none absolute -inset-y-2 inset-x-0 z-0 will-change-transform"
                    >
                        <picture className="block h-full w-full">
                            {media.hasMobile && media.mobile.avifSrcSet ? (
                                <source
                                    media="(max-width: 767px)"
                                    type="image/avif"
                                    srcSet={media.mobile.avifSrcSet}
                                    sizes="100vw"
                                />
                            ) : null}
                            {media.hasMobile && media.mobile.webpSrcSet ? (
                                <source
                                    media="(max-width: 767px)"
                                    type="image/webp"
                                    srcSet={media.mobile.webpSrcSet}
                                    sizes="100vw"
                                />
                            ) : media.hasMobile ? (
                                <source
                                    media="(max-width: 767px)"
                                    srcSet={media.mobile.src}
                                />
                            ) : null}

                            {media.hasDesktop && media.desktop.avifSrcSet ? (
                                <source
                                    media="(min-width: 768px)"
                                    type="image/avif"
                                    srcSet={media.desktop.avifSrcSet}
                                    sizes="100vw"
                                />
                            ) : null}
                            {media.hasDesktop && media.desktop.webpSrcSet ? (
                                <source
                                    media="(min-width: 768px)"
                                    type="image/webp"
                                    srcSet={media.desktop.webpSrcSet}
                                    sizes="100vw"
                                />
                            ) : null}

                            <img
                                src={
                                    media.hasDesktop
                                        ? media.desktop.src
                                        : media.mobile.src
                                }
                                alt=""
                                aria-hidden="true"
                                loading="lazy"
                                decoding="async"
                                width={media.desktop.width}
                                height={media.desktop.height}
                                className="h-full w-full object-cover object-center"
                            />
                        </picture>
                    </motion.div>

                    {/* Overlay Kontras Desktop & Mobile */}
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 z-[1] hidden md:block"
                        style={{ background: 'var(--join-strip-overlay-desktop)' }}
                    />
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 z-[1] md:hidden"
                        style={{ background: 'var(--join-strip-overlay-mobile)' }}
                    />
                </>
            ) : (
                <ContourPattern
                    tone="white"
                    opacity={0.1}
                    seed={7}
                    rings={10}
                    animate={false}
                    className="pointer-events-none absolute inset-0 z-0"
                />
            )}

            <Container className="relative z-10 py-7">
                <motion.div
                    initial={reducedMotion ? false : { opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.25 }}
                    transition={{ duration: reducedMotion ? 0 : 0.5, ease }}
                    className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between md:gap-8"
                >
                    {/* Kiri: Kotak Ikon 40px + Blok Teks */}
                    <div className="flex min-w-0 items-start gap-4">
                        <span
                            aria-hidden="true"
                            className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-white/15 text-white"
                        >
                            <UserPlus className="h-5 w-5" strokeWidth={2} />
                        </span>
                        <div className="min-w-0">
                            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/90">
                                {t('global.join_strip.eyebrow')}
                            </p>
                            <h2 className="mt-1 font-display text-2xl font-bold leading-tight text-white">
                                {t('global.join_strip.title')}
                            </h2>
                            <p className="mt-1 max-w-[640px] text-sm leading-relaxed text-white/90 line-clamp-2">
                                {t('global.join_strip.text')}
                            </p>
                        </div>
                    </div>

                    {/* Kanan: Tombol Putih Satu Baris Sejajar */}
                    <div className="w-full shrink-0 md:w-auto">
                        <Button
                            href={ctaHref}
                            size="lg"
                            className="w-full md:w-auto !bg-white !text-navy hover:!bg-mist !border-0 shadow-soft"
                            icon={<ArrowRight strokeWidth={2} />}
                        >
                            {ctaLabel}
                        </Button>
                    </div>
                </motion.div>
            </Container>
        </section>
    );
}
