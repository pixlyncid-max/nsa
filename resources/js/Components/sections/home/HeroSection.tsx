import { dur, ease } from '@/animations/variants';
import ContourPattern from '@/Components/motion/ContourPattern';
import MagneticButton from '@/Components/motion/MagneticButton';
import Parallax from '@/Components/motion/Parallax';
import SplitText from '@/Components/motion/SplitText';
import Button from '@/Components/ui/Button';
import { useAnimeScope } from '@/hooks/useAnimeScope';
import { createTimeline, stagger, utils } from 'animejs';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Sparkles, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

interface HeroSectionProps {
    fisheryFacts: { title: string; description: string }[];
    latestMembers: { business_name: string; location: string; type: string }[];
}

/**
 * Pembagian tugas animasi di hero:
 * - anime.js  : timeline intro (eyebrow → judul per kata → paragraf → tombol → kolase).
 * - Framer    : parallax kolase (wrapper luar) dan pergantian kartu fakta.
 * Elemen yang dianimasikan keduanya tidak pernah sama.
 */
export default function HeroSection({
    fisheryFacts,
    latestMembers,
}: HeroSectionProps) {
    const [factIndex, setFactIndex] = useState(0);

    // Berganti fakta perikanan setiap 6 detik secara halus
    useEffect(() => {
        if (!fisheryFacts || fisheryFacts.length <= 1) return;
        const interval = setInterval(() => {
            setFactIndex((prev) => (prev + 1) % fisheryFacts.length);
        }, 6000);
        return () => clearInterval(interval);
    }, [fisheryFacts]);

    const heroRef = useAnimeScope<HTMLElement>((root) => {
        const q = (name: string) => root.querySelectorAll(`[data-hero="${name}"]`);
        const fadeTargets = ['eyebrow', 'lead', 'cta', 'fact'].flatMap((n) => Array.from(q(n)));

        utils.set(fadeTargets, { opacity: 0, y: 20 });
        utils.set(q('card'), { opacity: 0, y: 40, scale: 0.96 });
        utils.set(q('badge'), { opacity: 0, scale: 0.8 });

        createTimeline({ defaults: { ease: 'outExpo', duration: 900 } })
            .add(q('eyebrow'), { opacity: 1, y: 0 })
            .add(root.querySelectorAll('h1 [data-split]'), { y: '0%', delay: stagger(70) }, '-=700')
            .add(q('lead'), { opacity: 1, y: 0 }, '-=600')
            .add(q('cta'), { opacity: 1, y: 0 }, '-=700')
            .add(q('card'), { opacity: 1, y: 0, scale: 1, delay: stagger(140) }, '-=900')
            .add(q('badge'), { opacity: 1, scale: 1, ease: 'outBack', delay: stagger(120) }, '-=600')
            .add(q('fact'), { opacity: 1, y: 0 }, '-=800');
    });

    const activeFact = fisheryFacts[factIndex] ?? fisheryFacts[0];
    const topMember = latestMembers[0];

    return (
        <section ref={heroRef} className="section-hero relative overflow-hidden bg-white">
            {/* Latar garis kontur air halus (digambar oleh anime.js) */}
            <div className="pointer-events-none absolute inset-0 -top-12 z-0 opacity-40">
                <ContourPattern tone="sky" opacity={0.35} size="100%" />
            </div>

            <div className="container-page relative z-10">
                <div className="grid items-center gap-16 lg:grid-cols-12 lg:gap-8">
                    {/* Kolom Kiri: 7 Kolom */}
                    <div className="lg:col-span-7">
                        <span data-hero="eyebrow" className="eyebrow-pill">
                            <Sparkles size={14} className="text-sky" />
                            Asosiasi Perikanan &amp; Budidaya Indonesia
                        </span>

                        {/* Judul bertahap per kata (mask reveal) */}
                        <h1 className="t-display mt-6 font-bold text-navy">
                            <SplitText
                                text="Menyatukan Pembudidaya,"
                                className="block"
                                animate={false}
                            />
                            <SplitText
                                text="Memajukan Hasil Bahari."
                                className="block text-ocean"
                                animate={false}
                            />
                        </h1>

                        <p data-hero="lead" className="measure t-body-lg mt-6 text-slate">
                            Wadah resmi bagi pembudidaya, nelayan, dan pelaku
                            rantai pasok perikanan Indonesia. Dapatkan kepastian
                            pasar, bantuan legalitas usaha, hingga pendampingan
                            teknologi pakan mandiri di seluruh nusantara.
                        </p>

                        {/* Tombol Utama */}
                        <div data-hero="cta" className="mt-8 flex flex-wrap items-center gap-4">
                            <MagneticButton>
                                <Button
                                    href="/daftar"
                                    size="lg"
                                    icon={<ArrowRight size={18} />}
                                >
                                    Daftar Anggota
                                </Button>
                            </MagneticButton>
                            <Button
                                href="/produk"
                                variant="secondary"
                                size="lg"
                            >
                                Lihat Produk
                            </Button>
                        </div>

                        {/* Kartu Fakta Perikanan Hari Ini (Pemicu Rasa Penasaran) */}
                        {activeFact && (
                            <div data-hero="fact" className="mt-12 max-w-lg">
                                <div className="rounded-card border border-line bg-mist/90 p-4 shadow-soft">
                                    <div className="flex items-center justify-between text-xs font-semibold text-ocean">
                                        <span className="flex items-center gap-2 uppercase tracking-wide">
                                            <span className="h-2 w-2 animate-pulse rounded-full bg-ocean" />
                                            Fakta Perikanan Hari Ini
                                        </span>
                                        <span className="text-[11px] tabular-nums text-slate">
                                            {factIndex + 1} dari{' '}
                                            {fisheryFacts.length}
                                        </span>
                                    </div>
                                    <AnimatePresence mode="wait" initial={false}>
                                        <motion.div
                                            key={factIndex}
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -8 }}
                                            transition={{ duration: dur.base, ease }}
                                            aria-live="polite"
                                        >
                                            <h4 className="mt-2 text-sm font-semibold text-ink">
                                                {activeFact.title}
                                            </h4>
                                            <p className="mt-1 text-xs leading-relaxed text-slate">
                                                {activeFact.description}
                                            </p>
                                        </motion.div>
                                    </AnimatePresence>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Kolom Kanan: 5 Kolom - Kolase Foto Miring (parallax Framer di wrapper luar) */}
                    <Parallax offset={32} className="relative pb-8 lg:col-span-5">
                        <div className="relative mx-auto max-w-md lg:max-w-none">
                            {/* Foto Utama 1: Tambak / Kolam Budidaya */}
                            <div data-hero="card" className="relative z-10">
                                <div className="relative -rotate-2 overflow-hidden rounded-card border-4 border-white bg-slate shadow-lift transition-transform duration-300 ease-brand hover:rotate-0">
                                    <div className="flex aspect-[4/3] w-full flex-col justify-end bg-gradient-to-br from-navy via-ocean to-sky p-6 text-white">
                                        <div className="absolute inset-0 bg-navy/20 mix-blend-multiply" />
                                        <span className="relative z-10 text-xs font-bold uppercase tracking-wider text-aqua">
                                            Sentra Budidaya
                                        </span>
                                        <p className="relative z-10 mt-1 font-display text-lg font-bold">
                                            Tambak Air Payau &amp; Kolam Sirkulasi
                                            Tertutup
                                        </p>
                                        <p className="relative z-10 text-xs text-mist/90">
                                            Jawa Barat, Jawa Timur &amp; Sulawesi
                                            Selatan
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Foto 2: Aktivitas Pembudidaya Sortir Panen (Menumpuk Miring) */}
                            <div data-hero="card" className="absolute -bottom-8 -left-2 z-20 w-3/5 sm:-left-4">
                                <div className="rotate-3 overflow-hidden rounded-card border-4 border-white bg-white shadow-lift transition-transform duration-300 ease-brand hover:rotate-0">
                                    <div className="flex aspect-[4/3] w-full flex-col justify-end bg-gradient-to-tr from-ocean to-aqua/80 p-4 text-white">
                                        <span className="text-[10px] font-bold uppercase text-navy">
                                            Kemitraan Petani
                                        </span>
                                        <p className="text-xs font-bold leading-tight text-ink">
                                            Sortir Mutu Benih &amp; Pakan Mandiri
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Lencana Mengambang: Anggota Terbaru */}
                            {topMember && (
                                <div
                                    data-hero="badge"
                                    className="absolute -top-4 right-0 z-20 max-w-[210px] rounded-control border border-line bg-white p-3 shadow-lift sm:-right-2"
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ocean/10 text-ocean">
                                            <Users size={14} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate">
                                                Anggota Terbaru
                                            </p>
                                            <p className="truncate text-xs font-semibold text-ink">
                                                {topMember.business_name}
                                            </p>
                                            <p className="truncate text-[10px] text-slate">
                                                {topMember.location}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Lencana Bawah Kanan: 38 Provinsi */}
                            <div
                                data-hero="badge"
                                className="absolute -bottom-6 right-2 z-20 rounded-full border border-line bg-navy px-4 py-2 text-white shadow-soft"
                            >
                                <p className="flex items-center gap-2 text-xs font-semibold text-aqua">
                                    <span className="h-2 w-2 rounded-full bg-success" />
                                    Jaringan di 38 Provinsi
                                </p>
                            </div>
                        </div>
                    </Parallax>
                </div>
            </div>
        </section>
    );
}
