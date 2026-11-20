import ArchImage from '@/Components/layout/ArchImage';
import Container from '@/Components/layout/Container';
import ImageMask from '@/Components/layout/ImageMask';
import PageHeader from '@/Components/layout/PageHeader';
import SectionHeading from '@/Components/layout/SectionHeading';
import StickyIndex, {
    type StickyIndexItem,
} from '@/Components/layout/StickyIndex';
import ContourPattern from '@/Components/motion/ContourPattern';
import CountUp from '@/Components/motion/CountUp';
import Button from '@/Components/ui/Button';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';
import { useSiteMedia } from '@/hooks/useSiteMedia';
import PublicLayout from '@/Layouts/PublicLayout';
import { cx } from '@/lib/cx';
import { homeMedia } from '@/lib/homeMedia';
import { resolveMembershipCta } from '@/lib/membershipCta';
import { focusRing } from '@/lib/ui';
import type { PageProps } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    ArrowRight,
    Briefcase,
    Calendar,
    Check,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Copy,
    Eye,
    FileCheck2,
    ShieldCheck,
    X,
} from 'lucide-react';
import React, { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import type { Swiper as SwiperType } from 'swiper';

const HistoryTimelineSwiper = lazy(
    () => import('@/Components/about/HistoryTimelineSwiper')
);

interface TeamMember {
    id: number;
    name: string;
    position: string;
    photo?: string | null;
    period?: string | null;
    bio?: string | null;
}

export interface ProgramItem {
    id: number;
    title: string;
    slug: string;
    category: string;
    category_label: string;
    summary: string | null;
    cover_url: string | null;
    is_public: boolean;
    schedule: string | null;
    order: number;
}

interface LegalityItem {
    label: string;
    value: string;
}

interface AboutProps {
    title: string;
    content: {
        subtitle?: string;
        history: string;
        vision: string;
        missions: string[];
        values: Array<{ title: string; desc: string }>;
        legalities: LegalityItem[];
    };
    team: TeamMember[];
    programs?: ProgramItem[];
}

const CHAPTERS: StickyIndexItem[] = [
    { id: 'sejarah', index: '01', label: 'Sejarah' },
    { id: 'visi-misi', index: '02', label: 'Visi & Misi' },
    { id: 'program-kerja', index: '03', label: 'Program Kerja' },
    { id: 'nilai', index: '04', label: 'Nilai' },
    { id: 'legalitas', index: '05', label: 'Legalitas' },
    { id: 'tim', index: '06', label: 'Tim' },
];

export default function About({
    title,
    content,
    team = [],
    programs = [],
}: AboutProps) {
    const { props } = usePage<PageProps>();
    const user = props.auth?.user;
    const promo = props.membershipPromo;
    const brandShort = props.brand?.short_name || 'NSA';
    const isApprovedMember = user?.membership_status === 'approved';
    const reduced = usePrefersReducedMotion();
    const { media } = useSiteMedia();

    const cta = resolveMembershipCta(user, promo, brandShort);

    const missions = Array.isArray(content?.missions) ? content.missions : [];
    const values = Array.isArray(content?.values) ? content.values : [];
    const legalities = Array.isArray(content?.legalities)
        ? content.legalities
        : [];

    // Swiper untuk garis waktu sejarah horizontal
    const [historySwiper, setHistorySwiper] = useState<SwiperType | null>(null);

    // Accordion Program Kerja (default buka baris pertama bila ada)
    const [openProgramId, setOpenProgramId] = useState<number | null>(
        programs[0]?.id ?? null
    );
    const programButtonRefs = useRef<Array<HTMLButtonElement | null>>([]);

    // Modal pratinjau dokumen legalitas
    const [activeLegality, setActiveLegality] = useState<LegalityItem | null>(
        null
    );
    const [copiedDoc, setCopiedDoc] = useState(false);

    useEffect(() => {
        if (!activeLegality) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setActiveLegality(null);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [activeLegality]);

    const milestones = [
        {
            year: '2018',
            title: 'Inisiasi dari Pematang Kolam Bogor',
            desc:
                content.history ||
                'Didirikan pada tahun 2018 di Bogor dari keresahan bersama para pelaku budidaya air tawar dan petambak pesisir terhadap biaya pakan dan fluktuasi harga panen.',
            image: media('about_history_1', homeMedia.hero[0]?.src),
            alt: 'Pertemuan awal pembudidaya kolam air tawar',
        },
        {
            year: '2019',
            title: 'Pengesahan Akta & Badan Hukum Nasional',
            desc: 'Resmi berbadan hukum perkumpulan melalui Akta Notaris dan pengesahan SK Kementerian Hukum dan HAM RI sebagai wadah profesi perikanan.',
            image: media('about_history_2', homeMedia.hero[1]?.src),
            alt: 'Konsolidasi pengurus pusat dan wilayah',
        },
        {
            year: '2021',
            title: 'Jejaring Pakan Mandiri & Standardisasi Benih',
            desc: 'Membentuk simpul pengadaan pakan kolektif dan kemitraan balai pembenihan bersertifikat di sentra Jawa, Sumatera, dan Sulawesi.',
            image: media('about_history_3', homeMedia.hero[2]?.src),
            alt: 'Panen komoditas budidaya anggota',
        },
        {
            year: '2023',
            title: 'Perluasan 38 Provinsi & KTA Digital',
            desc: 'Transformasi pendataan pembudidaya berbasis komoditas dan penerbitan Kartu Tanda Anggota (KTA) digital terverifikasi QR.',
            image: media('explore_freshwater', homeMedia.products['air-tawar']),
            alt: 'Sentra budidaya air tawar modern',
        },
        {
            year: '2025',
            title: 'Inkubasi Ekspor & Pasar Horeka Terpadu',
            desc: 'Pendampingan sertifikasi CPIB mandiri dan pembukaan jalur distribusi langsung ke jaringan hotel, restoran, katering, serta pasar ekspor.',
            image: media('explore_saltwater', homeMedia.products['air-laut']),
            alt: 'Komoditas marikultur dan tambak pesisir',
        },
    ];

    const handleProgramKeyDown = (
        e: React.KeyboardEvent<HTMLButtonElement>,
        idx: number
    ) => {
        if (programs.length <= 1) return;
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            const nextIdx = (idx + 1) % programs.length;
            programButtonRefs.current[nextIdx]?.focus();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const prevIdx = (idx - 1 + programs.length) % programs.length;
            programButtonRefs.current[prevIdx]?.focus();
        }
    };

    const handleCopyLegality = async (val: string) => {
        try {
            await navigator.clipboard.writeText(val);
            setCopiedDoc(true);
            toast.success('Nomor dokumen disalin ke papan klip.');
            setTimeout(() => setCopiedDoc(false), 2000);
        } catch {
            toast.error('Gagal menyalin nomor dokumen.');
        }
    };

    return (
        <PublicLayout>
            <Head title={`${title} · NSA Indonesia`}>
                <meta
                    name="description"
                    content="Profil resmi NSA (Nusantara Sustainable Aquatic): sejarah pendirian, visi misi, program kerja, nilai organisasi, legalitas hukum, dan tim pengurus."
                />
            </Head>

            {/* PageHeader Berfoto Lebar dengan Judul Besar */}
            <PageHeader
                breadcrumbs={[
                    { label: 'Beranda', href: '/' },
                    { label: 'Tentang Kami' },
                ]}
                eyebrow="Profil & Integritas Organisasi"
                title="Berakar dari Kolam, Bergerak untuk Nusantara."
                description={
                    content.subtitle ||
                    'Wadah profesi dan pelaku usaha perikanan budidaya independen yang mengadvokasi kemandirian petambak dari hulu ke hilir.'
                }
                variant="with-image"
                imageSrc={media('about_banner', homeMedia.hero[0]?.src)}
                imageAlt="Pembudidaya Nusantara Sustainable Aquatic"
            >
                <div className="grid grid-cols-2 gap-6 border-t border-line pt-6 sm:grid-cols-4">
                    <div>
                        <div className="font-display text-2xl font-extrabold text-navy sm:text-3xl">
                            <CountUp from={2000} to={2018} locale="en-US" />
                        </div>
                        <div className="mt-1 text-[11px] font-bold uppercase tracking-wider text-slate">
                            Tahun Berdiri
                        </div>
                    </div>
                    <div>
                        <div className="font-display text-2xl font-extrabold text-ocean sm:text-3xl">
                            <CountUp to={38} />
                        </div>
                        <div className="mt-1 text-[11px] font-bold uppercase tracking-wider text-slate">
                            Provinsi
                        </div>
                    </div>
                    <div>
                        <div className="font-display text-2xl font-extrabold text-navy sm:text-3xl">
                            <CountUp to={12000} suffix="+" />
                        </div>
                        <div className="mt-1 text-[11px] font-bold uppercase tracking-wider text-slate">
                            Pembudidaya
                        </div>
                    </div>
                    <div>
                        <div className="font-display text-2xl font-extrabold text-ocean sm:text-3xl">
                            <CountUp to={100} suffix="%" />
                        </div>
                        <div className="mt-1 text-[11px] font-bold uppercase tracking-wider text-slate">
                            Resmi Kemenkumham
                        </div>
                    </div>
                </div>
            </PageHeader>

            {/* Mobile: Indeks Menjadi Baris Tab yang Bisa Digeser di Bawah Header */}
            <StickyIndex items={CHAPTERS} variant="mobile-bar" />

            {/* Tata Letak Bab Panjang: StickyIndex Kiri (Desktop) + 6 Bab di Kanan */}
            <Container className="py-12 lg:py-16">
                <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12">
                    {/* Kolom Kiri (3 kolom): StickyIndex Scrollspy Desktop */}
                    <aside className="hidden lg:col-span-3 lg:block">
                        <StickyIndex
                            items={CHAPTERS}
                            title="Indeks Tentang Kami"
                        />
                    </aside>

                    {/* Kolom Kanan (9 kolom): 6 Bab Panjang */}
                    <div className="min-w-0 space-y-20 lg:col-span-9 lg:space-y-24">
                        {/* =========================================================
                            01 SEJARAH: Garis Waktu Horizontal (Swiper/Drag) + Foto Lengkung
                           ========================================================= */}
                        <section
                            id="sejarah"
                            aria-labelledby="heading-sejarah"
                            className="scroll-mt-32"
                        >
                            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                                <div>
                                    <h2
                                        id="heading-sejarah"
                                        className="font-display text-3xl font-bold tracking-tight text-navy sm:text-4xl"
                                    >
                                        Menjawab Kegelisahan Petambak Rakyat
                                    </h2>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            historySwiper?.slidePrev()
                                        }
                                        aria-label="Tonggak sejarah sebelumnya"
                                        className={cx(
                                            'flex h-10 w-10 items-center justify-center rounded-control border border-line bg-white text-navy transition-colors hover:border-ocean hover:text-ocean',
                                            focusRing
                                        )}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            historySwiper?.slideNext()
                                        }
                                        aria-label="Tonggak sejarah berikutnya"
                                        className={cx(
                                            'flex h-10 w-10 items-center justify-center rounded-control border border-line bg-white text-navy transition-colors hover:border-ocean hover:text-ocean',
                                            focusRing
                                        )}
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            <p className="measure mt-4 text-base leading-relaxed text-ink">
                                {content.history}
                            </p>

                            {/* Garis Waktu Horizontal yang Bisa Digeser (Swiper/Drag) */}
                            <div className="mt-8">
                                <Suspense
                                    fallback={
                                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                            <div className="h-80 animate-pulse rounded-card bg-mist" />
                                            <div className="hidden h-80 animate-pulse rounded-card bg-mist sm:block" />
                                        </div>
                                    }
                                >
                                    <HistoryTimelineSwiper
                                        milestones={milestones}
                                        onSwiper={setHistorySwiper}
                                    />
                                </Suspense>
                            </div>
                        </section>

                        {/* =========================================================
                            02 VISI & MISI: Satu Bab Kontras Navy
                           ========================================================= */}
                        <section
                            id="visi-misi"
                            aria-labelledby="heading-visi-misi"
                            className="relative overflow-hidden rounded-2xl bg-navy p-8 text-white shadow-lift scroll-mt-32 sm:p-12"
                        >
                            <div
                                aria-hidden="true"
                                className="pointer-events-none absolute -right-16 -top-16 h-96 w-96 opacity-25"
                            >
                                <ContourPattern
                                    tone="aqua"
                                    opacity={0.35}
                                    rings={8}
                                    animate={!reduced}
                                />
                            </div>

                            <div className="relative z-10">
                                {/* Visi sebagai Satu Kalimat Sangat Besar */}
                                <div>
                                    <p
                                        id="heading-visi-misi"
                                        className="t-eyebrow text-aqua"
                                    >
                                        Visi Utama
                                    </p>
                                    <blockquote className="mt-3 font-display text-2xl font-extrabold leading-[1.16] tracking-tight text-white sm:text-4xl lg:text-[2.6rem]">
                                        &ldquo;{content.vision}&rdquo;
                                    </blockquote>
                                </div>

                                {/* Misi sebagai Daftar Bernomor */}
                                <div className="mt-12 border-t border-white/15 pt-8">
                                    <p className="t-eyebrow text-aqua mb-4">
                                        Mandat &amp; Misi Perjuangan
                                    </p>
                                    <ol className="divide-y divide-white/15">
                                        {missions.map((mission, idx) => (
                                            <li
                                                key={idx}
                                                className="flex items-start gap-5 py-4 first:pt-0 last:pb-0"
                                            >
                                                <span className="font-mono text-2xl font-extrabold text-aqua shrink-0">
                                                    {String(idx + 1).padStart(
                                                        2,
                                                        '0'
                                                    )}
                                                </span>
                                                <p className="text-sm leading-relaxed text-white/90 sm:text-base">
                                                    {mission}
                                                </p>
                                            </li>
                                        ))}
                                    </ol>
                                </div>
                            </div>
                        </section>

                        {/* =========================================================
                            03 PROGRAM KERJA: Daftar Bernomor Besar + Accordion Keyboard-Accessible
                           ========================================================= */}
                        <section
                            id="program-kerja"
                            aria-labelledby="heading-program-kerja"
                            className="scroll-mt-32"
                        >
                            <SectionHeading
                                eyebrow="Inisiatif & Aksi Nyata"
                                title="Program Kerja Unggulan"
                                description="Daftar program kerja publik resmi NSA. Pilih atau tekan Enter pada baris program untuk membaca penjelasan lengkap dan membuka halaman rincian."
                            />

                            {programs.length > 0 ? (
                                <div className="mt-8 divide-y divide-line overflow-hidden rounded-card border border-line bg-white shadow-soft">
                                    {programs.map((program, idx) => {
                                        const isOpen =
                                            openProgramId === program.id;
                                        const panelId = `program-panel-${program.id}`;
                                        const headerId = `program-header-${program.id}`;

                                        return (
                                            <div
                                                key={program.id}
                                                className={cx(
                                                    'transition-colors',
                                                    isOpen
                                                        ? 'bg-mist/35'
                                                        : 'bg-white hover:bg-mist/20'
                                                )}
                                            >
                                                <h3>
                                                    <button
                                                        ref={(el) => {
                                                            programButtonRefs.current[
                                                                idx
                                                            ] = el;
                                                        }}
                                                        id={headerId}
                                                        type="button"
                                                        aria-expanded={isOpen}
                                                        aria-controls={panelId}
                                                        onClick={() =>
                                                            setOpenProgramId(
                                                                isOpen
                                                                    ? null
                                                                    : program.id
                                                            )
                                                        }
                                                        onKeyDown={(e) =>
                                                            handleProgramKeyDown(
                                                                e,
                                                                idx
                                                            )
                                                        }
                                                        className={cx(
                                                            'flex w-full items-start justify-between gap-4 p-6 text-left sm:items-center sm:p-7',
                                                            focusRing
                                                        )}
                                                    >
                                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6 min-w-0 flex-1">
                                                            <span
                                                                className={cx(
                                                                    'font-display text-3xl font-extrabold tracking-tight transition-colors sm:text-4xl sm:w-14 shrink-0',
                                                                    isOpen
                                                                        ? 'text-ocean'
                                                                        : 'text-navy/30'
                                                                )}
                                                            >
                                                                {String(
                                                                    idx + 1
                                                                ).padStart(
                                                                    2,
                                                                    '0'
                                                                )}
                                                            </span>

                                                            <div className="min-w-0 flex-1">
                                                                <div className="flex flex-wrap items-center gap-2">
                                                                    <span className="inline-flex items-center rounded-full bg-ocean/10 px-3 py-0.5 text-xs font-bold text-ocean">
                                                                        {
                                                                            program.category_label
                                                                        }
                                                                    </span>
                                                                    {program.schedule ? (
                                                                        <span className="inline-flex items-center gap-1 text-xs font-medium text-slate">
                                                                            <Calendar className="h-3.5 w-3.5 text-ocean" />
                                                                            {
                                                                                program.schedule
                                                                            }
                                                                        </span>
                                                                    ) : null}
                                                                </div>

                                                                <span className="mt-2 block font-display text-xl font-bold text-navy sm:text-2xl">
                                                                    {
                                                                        program.title
                                                                    }
                                                                </span>

                                                                {program.summary ? (
                                                                    <span className="mt-1 block line-clamp-1 text-xs text-slate sm:text-sm">
                                                                        {
                                                                            program.summary
                                                                        }
                                                                    </span>
                                                                ) : null}
                                                            </div>
                                                        </div>

                                                        <span
                                                            aria-hidden="true"
                                                            className={cx(
                                                                'mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line bg-white text-navy transition-transform duration-200 sm:mt-0',
                                                                isOpen
                                                                    ? 'rotate-180 border-ocean text-ocean'
                                                                    : ''
                                                            )}
                                                        >
                                                            <ChevronDown className="h-4 w-4" />
                                                        </span>
                                                    </button>
                                                </h3>

                                                {/* Panel Accordion yang Melebar saat Dibuka */}
                                                <AnimatePresence initial={false}>
                                                    {isOpen ? (
                                                        <motion.div
                                                            id={panelId}
                                                            role="region"
                                                            aria-labelledby={
                                                                headerId
                                                            }
                                                            initial={
                                                                reduced
                                                                    ? undefined
                                                                    : {
                                                                          height: 0,
                                                                          opacity: 0,
                                                                      }
                                                            }
                                                            animate={{
                                                                height: 'auto',
                                                                opacity: 1,
                                                            }}
                                                            exit={
                                                                reduced
                                                                    ? undefined
                                                                    : {
                                                                          height: 0,
                                                                          opacity: 0,
                                                                      }
                                                            }
                                                            transition={{
                                                                duration: 0.24,
                                                                ease: 'easeOut',
                                                            }}
                                                            className="overflow-hidden"
                                                        >
                                                            <div className="border-t border-line/70 px-6 pb-7 pt-5 sm:pl-26 sm:pr-8">
                                                                <div className="grid gap-6 md:grid-cols-12 md:items-center">
                                                                    <div
                                                                        className={
                                                                            program.cover_url
                                                                                ? 'md:col-span-8'
                                                                                : 'md:col-span-12'
                                                                        }
                                                                    >
                                                                        <p className="measure text-sm leading-relaxed text-ink sm:text-base">
                                                                            {program.summary ||
                                                                                'Program kerja terstruktur yang diselenggarakan oleh Nusantara Sustainable Aquatic untuk meningkatkan kapasitas budidaya, kepastian mutu, dan akses kemitraan anggota.'}
                                                                        </p>

                                                                        <div className="mt-5 flex flex-wrap items-center gap-3">
                                                                            <Button
                                                                                href={`/program/${program.slug}`}
                                                                                size="sm"
                                                                                icon={
                                                                                    <ArrowRight className="h-3.5 w-3.5" />
                                                                                }
                                                                            >
                                                                                Lihat
                                                                                Detail
                                                                            </Button>

                                                                            {isApprovedMember ? (
                                                                                <Button
                                                                                    href={`/program/${program.slug}`}
                                                                                    variant="secondary"
                                                                                    size="sm"
                                                                                >
                                                                                    Daftar
                                                                                    Program
                                                                                </Button>
                                                                            ) : null}
                                                                        </div>
                                                                    </div>

                                                                    {program.cover_url ? (
                                                                        <div className="md:col-span-4">
                                                                            <img
                                                                                src={
                                                                                    program.cover_url
                                                                                }
                                                                                alt={
                                                                                    program.title
                                                                                }
                                                                                loading="lazy"
                                                                                className="aspect-[4/3] w-full rounded-control border border-line object-cover"
                                                                            />
                                                                        </div>
                                                                    ) : null}
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    ) : null}
                                                </AnimatePresence>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="mt-8 rounded-card border border-line bg-mist/40 p-10 text-center text-slate">
                                    <Briefcase className="mx-auto mb-3 h-9 w-9 text-slate/60" />
                                    <p className="text-sm font-medium">
                                        Jadwal program kerja publik terbaru
                                        sedang dipersiapkan oleh sekretariat
                                        NSA.
                                    </p>
                                </div>
                            )}
                        </section>

                        {/* =========================================================
                            04 NILAI: Empat Nilai dengan Tipografi Besar Tanpa Ikon Lingkaran
                           ========================================================= */}
                        <section
                            id="nilai"
                            aria-labelledby="heading-nilai"
                            className="scroll-mt-32"
                        >
                            <SectionHeading
                                eyebrow="Prinsip Gerakan"
                                title="Nilai yang Kami Junjung"
                                description="Empat landasan etika kerja seluruh pembudidaya, pengurus wilayah, dan mitra rantai pasok di bawah naungan asosiasi."
                            />

                            <div className="mt-10 grid grid-cols-1 gap-x-10 gap-y-10 border-t border-line pt-8 sm:grid-cols-2">
                                {values.map((v, i) => (
                                    <article
                                        key={i}
                                        className="border-l-2 border-ocean pl-6"
                                    >
                                        <span className="font-mono text-xs font-bold uppercase tracking-widest text-ocean">
                                            Prinsip 0{i + 1}
                                        </span>
                                        <h3 className="mt-2 font-display text-2xl font-extrabold tracking-tight text-navy sm:text-3xl leading-tight">
                                            {v.title}
                                        </h3>
                                        <p className="mt-3 text-sm leading-relaxed text-slate sm:text-base">
                                            {v.desc}
                                        </p>
                                    </article>
                                ))}
                            </div>
                        </section>

                        {/* =========================================================
                            05 LEGALITAS: Dokumen/Akta sebagai Daftar Bergaris dengan Tombol Lihat
                           ========================================================= */}
                        <section
                            id="legalitas"
                            aria-labelledby="heading-legalitas"
                            className="scroll-mt-32"
                        >
                            <SectionHeading
                                eyebrow="Badan Hukum Resmi"
                                title="Legalitas & Ketetapan Organisasi"
                                description="NSA terdaftar secara sah dan beroperasi sesuai peraturan perundang-undangan Republik Indonesia."
                                align="split"
                                actions={
                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-xs font-bold text-emerald-700">
                                        <ShieldCheck className="h-4 w-4" />
                                        Aktif &amp; Terverifikasi
                                    </span>
                                }
                            />

                            {/* Daftar Bergaris Dokumen Legalitas dengan Tombol Lihat */}
                            <ul className="mt-8 divide-y divide-line border-y border-line">
                                {legalities.map((item, idx) => (
                                    <li
                                        key={idx}
                                        className="flex flex-col gap-4 py-5 transition-colors hover:bg-mist/30 sm:flex-row sm:items-center sm:justify-between sm:px-3"
                                    >
                                        <div className="flex items-start gap-4 min-w-0">
                                            <span className="font-mono text-xs font-bold text-ocean pt-1">
                                                DOC-0{idx + 1}
                                            </span>
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold uppercase tracking-wider text-slate">
                                                    {item.label}
                                                </p>
                                                <p className="mt-1 font-mono text-sm font-bold text-navy sm:text-base">
                                                    {item.value}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setActiveLegality(item)
                                                }
                                                className={cx(
                                                    'inline-flex min-h-[38px] items-center gap-1.5 rounded-control border border-line bg-white px-3.5 py-1.5 text-xs font-bold text-navy transition-colors hover:border-ocean hover:text-ocean',
                                                    focusRing
                                                )}
                                            >
                                                <Eye className="h-3.5 w-3.5 text-ocean" />
                                                Lihat
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </section>

                        {/* =========================================================
                            06 TIM: Potret Besar Tidak Seragam (Lengkung, Tegak), Nama & Jabatan
                           ========================================================= */}
                        <section
                            id="tim"
                            aria-labelledby="heading-tim"
                            className="scroll-mt-32"
                        >
                            <SectionHeading
                                eyebrow="Pengurus Nasional"
                                title="Dewan Pengurus Pusat (DPP)"
                                description="Para praktisi budidaya, akademisi kelautan, dan penggerak rantai pasok yang memimpin jalannya roda organisasi."
                                align="split"
                                actions={
                                    <Link
                                        href="/organisasi/dpp"
                                        className="group inline-flex items-center gap-1.5 text-sm font-bold text-ocean hover:text-navy"
                                    >
                                        Lihat Bagan Lengkap DPP
                                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </Link>
                                }
                            />

                            {team.length > 0 ? (
                                <div className="mt-10 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                                    {team.map((member, idx) => {
                                        const isArch = idx % 2 === 0;
                                        const isStaggered = idx % 3 === 1;

                                        return (
                                            <article
                                                key={member.id}
                                                className={cx(
                                                    'group flex flex-col',
                                                    isStaggered
                                                        ? 'lg:mt-8'
                                                        : ''
                                                )}
                                            >
                                                {isArch ? (
                                                    <ArchImage
                                                        src={member.photo}
                                                        alt={`${member.name}, ${member.position}`}
                                                        aspectRatio="aspect-[4/5]"
                                                    />
                                                ) : (
                                                    <ImageMask
                                                        src={member.photo}
                                                        alt={`${member.name}, ${member.position}`}
                                                        shape="tall"
                                                        aspectRatio="aspect-[3/4]"
                                                    />
                                                )}

                                                <div className="mt-4">
                                                    <p className="text-xs font-bold uppercase tracking-wider text-ocean">
                                                        {member.position}
                                                    </p>
                                                    <h3 className="mt-1 font-display text-xl font-bold text-navy">
                                                        {member.name}
                                                    </h3>
                                                    {member.bio ? (
                                                        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate">
                                                            {member.bio}
                                                        </p>
                                                    ) : null}
                                                </div>
                                            </article>
                                        );
                                    })}
                                </div>
                            ) : null}

                            {/* Penutup Ajakan Bergabung */}
                            <div className="mt-16 rounded-card border border-line bg-mist/55 p-8 sm:p-10">
                                <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
                                    <div className="max-w-xl">
                                        <span className="t-eyebrow text-ocean">
                                            Bergabung Bersama Kami
                                        </span>
                                        <h3 className="mt-2 font-display text-2xl font-bold text-navy">
                                            {cta.title}
                                        </h3>
                                        <p className="mt-2 text-sm leading-relaxed text-slate">
                                            {cta.description}
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap gap-3 shrink-0">
                                        <Button
                                            href={cta.primaryHref}
                                            size="md"
                                            icon={
                                                <ArrowRight className="h-4 w-4" />
                                            }
                                        >
                                            {cta.primaryLabel}
                                        </Button>
                                        <Button
                                            href="/kontak"
                                            variant="secondary"
                                            size="md"
                                        >
                                            Hubungi Sekretariat
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </Container>

            {/* Modal Pratinjau Kutipan Dokumen Legalitas */}
            <AnimatePresence>
                {activeLegality ? (
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-label={`Rincian dokumen ${activeLegality.label}`}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setActiveLegality(null)}
                            className="fixed inset-0 bg-ink/45 backdrop-blur-xs"
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.96, y: 8 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.96, y: 8 }}
                            transition={{ duration: 0.2 }}
                            className="relative z-10 w-full max-w-lg rounded-2xl border border-line bg-white p-6 shadow-lift sm:p-8"
                        >
                            <div className="flex items-start justify-between gap-4 border-b border-line pb-4">
                                <div className="flex items-center gap-2.5">
                                    <FileCheck2 className="h-5 w-5 text-ocean" />
                                    <div>
                                        <span className="block text-[11px] font-bold uppercase tracking-wider text-ocean">
                                            Arsip Legalitas Resmi
                                        </span>
                                        <h3 className="font-display text-lg font-bold text-navy">
                                            {activeLegality.label}
                                        </h3>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setActiveLegality(null)}
                                    aria-label="Tutup rincian dokumen"
                                    className="rounded-control p-1 text-slate hover:bg-mist hover:text-navy"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="mt-5 space-y-4">
                                <div className="rounded-control border border-line bg-mist/60 p-4">
                                    <span className="block text-xs font-semibold text-slate">
                                        Nomor Ketetapan / Registrasi
                                    </span>
                                    <span className="mt-1 block font-mono text-base font-bold text-navy">
                                        {activeLegality.value}
                                    </span>
                                </div>

                                <p className="text-xs leading-relaxed text-slate">
                                    Dokumen asli tersimpan di Sekretariat
                                    Jenderal DPP Nusantara Sustainable Aquatic
                                    (Jakarta Pusat). Salinan fisik terlegalisasi
                                    dapat diajukan melalui halaman Kontak untuk
                                    keperluan kemitraan kelembagaan.
                                </p>
                            </div>

                            <div className="mt-6 flex flex-wrap items-center justify-end gap-2.5 border-t border-line pt-4">
                                <button
                                    type="button"
                                    onClick={() =>
                                        handleCopyLegality(activeLegality.value)
                                    }
                                    className={cx(
                                        'inline-flex min-h-[40px] items-center gap-2 rounded-control border border-line bg-mist px-4 py-2 text-xs font-bold text-navy hover:border-ocean hover:bg-white hover:text-ocean',
                                        focusRing
                                    )}
                                >
                                    {copiedDoc ? (
                                        <>
                                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                                            Tersalin
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="h-3.5 w-3.5 text-ocean" />
                                            Salin Nomor
                                        </>
                                    )}
                                </button>

                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={() => setActiveLegality(null)}
                                >
                                    Tutup
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                ) : null}
            </AnimatePresence>
        </PublicLayout>
    );
}
