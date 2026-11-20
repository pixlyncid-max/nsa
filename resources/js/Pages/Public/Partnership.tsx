import Marquee from '@/Components/layout/Marquee';
import PageHeader from '@/Components/layout/PageHeader';
import Section from '@/Components/layout/Section';
import SectionHeading from '@/Components/layout/SectionHeading';
import Button from '@/Components/ui/Button';
import EmptyState from '@/Components/ui/EmptyState';
import Input from '@/Components/ui/Input';
import Textarea from '@/Components/ui/Textarea';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';
import PublicLayout from '@/Layouts/PublicLayout';
import { cx } from '@/lib/cx';
import { focusRing } from '@/lib/ui';
import { Head, useForm } from '@inertiajs/react';
import { animate } from 'animejs';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Building2,
    ExternalLink,
    Handshake,
    Send,
    X,
} from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';

interface PartnerItem {
    id: number;
    name: string;
    logo?: string | null;
    type?: string | null;
    url?: string | null;
}

interface SchemeItem {
    id: string;
    title: string;
    tag: string;
    desc: string;
    benefits: string[];
}

interface PartnershipProps {
    partners: PartnerItem[];
    schemes: SchemeItem[];
}

type PartnerCategory =
    | 'Semua'
    | 'Pemerintah'
    | 'Swasta'
    | 'Akademisi'
    | 'Komunitas';

const PARTNER_TABS: PartnerCategory[] = [
    'Semua',
    'Pemerintah',
    'Swasta',
    'Akademisi',
    'Komunitas',
];

const partnershipSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, 'Nama narahubung minimal 2 karakter.')
        .max(150, 'Nama narahubung maksimal 150 karakter.'),
    institution: z
        .string()
        .trim()
        .min(2, 'Nama instansi atau perusahaan wajib diisi.')
        .max(150, 'Nama instansi maksimal 150 karakter.'),
    email: z
        .string()
        .trim()
        .email('Masukkan alamat email resmi yang valid.')
        .max(150, 'Alamat email maksimal 150 karakter.'),
    phone: z
        .string()
        .trim()
        .min(8, 'Nomor telepon atau WhatsApp minimal 8 digit.')
        .max(30, 'Nomor telepon maksimal 30 karakter.'),
    partnership_scheme: z
        .string()
        .trim()
        .min(1, 'Pilih skema kemitraan yang diajukan.'),
    message: z
        .string()
        .trim()
        .min(15, 'Rincian proposal minimal 15 karakter agar mudah ditelaah.')
        .max(2000, 'Rincian proposal maksimal 2000 karakter.'),
});

function classifyPartnerType(
    rawType?: string | null
): Exclude<PartnerCategory, 'Semua'> {
    const val = (rawType ?? '').toLowerCase();
    if (
        val.includes('pemerintah') ||
        val.includes('regulator') ||
        val.includes('kementerian') ||
        val.includes('dinas') ||
        val.includes('litbang') ||
        val.includes('balai')
    ) {
        return 'Pemerintah';
    }
    if (
        val.includes('akademisi') ||
        val.includes('universitas') ||
        val.includes('institut') ||
        val.includes('kampus') ||
        val.includes('riset')
    ) {
        return 'Akademisi';
    }
    if (
        val.includes('komunitas') ||
        val.includes('organisasi') ||
        val.includes('asosiasi') ||
        val.includes('himpunan') ||
        val.includes('koperasi')
    ) {
        return 'Komunitas';
    }
    return 'Swasta';
}

const PROCESS_STEPS = [
    {
        step: '01',
        title: 'Ajukan',
        lead: 'Kirim profil lembaga dan ruang lingkup kolaborasi.',
        requirement: 'Syarat: surat pengantar atau ringkasan program dan kontak PIC.',
    },
    {
        step: '02',
        title: 'Seleksi',
        lead: 'Tim sekretariat menelaah kesesuaian program dengan kebutuhan petambak.',
        requirement: 'Syarat: audiensi teknis serta verifikasi legalitas lembaga.',
    },
    {
        step: '03',
        title: 'Kerja Sama',
        lead: 'Penandatanganan nota kesepahaman dan pelaksanaan uji coba lapangan.',
        requirement: 'Syarat: penetapan target capaian bersama pengurus wilayah.',
    },
];

const PARTNERSHIP_BENEFITS = [
    {
        index: '01',
        title: 'Jangkauan Langsung ke 38 Provinsi',
        desc: 'Terhubung dengan jaringan pembudidaya air tawar, payau, dan laut melalui kepengurusan DPW dan DPC aktif.',
    },
    {
        index: '02',
        title: 'Data Lapangan yang Terverifikasi',
        desc: 'Setiap mitra memperoleh rujukan komoditas, kapasitas kolam, dan kepastian legalitas usaha anggota.',
    },
    {
        index: '03',
        title: 'Kolam Percontohan Bersama',
        desc: 'Fasilitasi uji coba formulasi pakan, probiotik, atau perangkat sensor kualitas air langsung di tambak anggota.',
    },
    {
        index: '04',
        title: 'Hilirisasi Panen Terjadwal',
        desc: 'Skema penyerapan hasil panen dengan volume terukur dan standar Cara Budidaya Ikan yang Baik (CPIB).',
    },
    {
        index: '05',
        title: 'Diseminasi Riset ke Petambak',
        desc: 'Jembatan publikasi dan pendampingan teknis antara kampus, balai riset, dan pelaku usaha perikanan.',
    },
    {
        index: '06',
        title: 'Katalog & Publikasi Resmi',
        desc: 'Produk atau program mitra terverifikasi dapat terintegrasi di kanal resmi ekosistem NSA.',
    },
];

export default function Partnership({
    partners = [],
    schemes = [],
}: PartnershipProps) {
    const reduced = usePrefersReducedMotion();
    const wavePathRef = useRef<SVGPathElement>(null);

    const [activePartnerTab, setActivePartnerTab] =
        useState<PartnerCategory>('Semua');
    const [selectedPartner, setSelectedPartner] = useState<PartnerItem | null>(
        null
    );
    const [failedLogos, setFailedLogos] = useState<Record<number, boolean>>({});
    const [clientErrors, setClientErrors] = useState<Record<string, string>>(
        {}
    );

    const { data, setData, post, processing, reset, errors } = useForm({
        name: '',
        institution: '',
        email: '',
        phone: '',
        partnership_scheme:
            schemes[0]?.title || 'Rantai Pasok Pakan & Bibit Unggul',
        message: '',
        fax_number: '',
    });

    // Gambar satu garis ombak penghubung 3 langkah skema (anime.js) saat masuk viewport
    useEffect(() => {
        const path = wavePathRef.current;
        if (!path) return;

        if (reduced) {
            path.style.strokeDasharray = '';
            path.style.strokeDashoffset = '0';
            return;
        }

        const length = path.getTotalLength();
        path.style.strokeDasharray = `${length}`;
        path.style.strokeDashoffset = `${length}`;

        let drawn = false;
        const observer = new IntersectionObserver(
            (entries) => {
                if (drawn) return;
                if (entries.some((entry) => entry.isIntersecting)) {
                    drawn = true;
                    const state = { offset: length };
                    try {
                        animate(state, {
                            offset: 0,
                            duration: 1400,
                            ease: 'outQuad',
                            onUpdate: () => {
                                path.style.strokeDashoffset = `${state.offset}`;
                            },
                        });
                    } catch {
                        path.style.strokeDashoffset = '0';
                    }
                    observer.disconnect();
                }
            },
            { threshold: 0.25 }
        );

        observer.observe(path);
        return () => observer.disconnect();
    }, [reduced]);

    // Tutup modal detail mitra dengan Escape
    useEffect(() => {
        if (!selectedPartner) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setSelectedPartner(null);
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [selectedPartner]);

    const partnersByTab = useMemo(() => {
        const grouped: Record<PartnerCategory, PartnerItem[]> = {
            Semua: partners,
            Pemerintah: [],
            Swasta: [],
            Akademisi: [],
            Komunitas: [],
        };

        partners.forEach((p) => {
            const cat = classifyPartnerType(p.type);
            grouped[cat].push(p);
        });

        return grouped;
    }, [partners]);

    const visiblePartners = partnersByTab[activePartnerTab] ?? [];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const parsed = partnershipSchema.safeParse({
            name: data.name,
            institution: data.institution,
            email: data.email,
            phone: data.phone,
            partnership_scheme: data.partnership_scheme,
            message: data.message,
        });

        if (!parsed.success) {
            const nextErrors: Record<string, string> = {};
            parsed.error.issues.forEach((issue) => {
                const key = String(issue.path[0] ?? '');
                if (key && !nextErrors[key]) {
                    nextErrors[key] = issue.message;
                }
            });
            setClientErrors(nextErrors);
            const firstMsg = Object.values(nextErrors)[0];
            toast.error(
                firstMsg || 'Periksa kembali isian formulir kemitraan Anda.'
            );
            return;
        }

        setClientErrors({});
        post('/kemitraan', {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(
                    'Pengajuan kemitraan berhasil dikirim! Tim NSA akan menelaah dan menghubungi Anda.'
                );
                reset();
            },
            onError: (err) => {
                const firstKey = Object.keys(err)[0];
                toast.error(
                    err[firstKey] ||
                        'Terdapat kesalahan pada formulir pengajuan.'
                );
            },
        });
    };

    const mergedErrors = {
        name: clientErrors.name || errors.name,
        institution: clientErrors.institution || errors.institution,
        email: clientErrors.email || errors.email,
        phone: clientErrors.phone || errors.phone,
        partnership_scheme:
            clientErrors.partnership_scheme || errors.partnership_scheme,
        message: clientErrors.message || errors.message,
    };

    return (
        <PublicLayout>
            <Head>
                <title>Kemitraan Strategis · NSA Indonesia</title>
                <meta
                    name="description"
                    content="Kolaborasi strategis NSA bersama pemerintah, swasta, akademisi, dan komunitas untuk memperkuat rantai pasok perikanan budidaya."
                />
            </Head>

            <PageHeader
                breadcrumbs={[
                    { label: 'Beranda', href: '/' },
                    { label: 'Kemitraan' },
                ]}
                eyebrow="Kolaborasi Lintas Sektor"
                title="Menyatukan kekuatan industri, riset, dan pemerintah untuk mengangkat kesejahteraan petambak rakyat."
                description="NSA membuka ruang kerja sama terukur dari penyediaan sarana budidaya, alih teknologi kolam, hingga penyerapan hasil panen berkelanjutan."
            />

            {/* =================================================================
                01 SKEMA KEMITRAAN: 3 Langkah + 1 Garis Ombak Anime.js (Bukan Kartu Seragam)
               ================================================================= */}
            <Section
                id="skema-kemitraan"
                index="01"
                label="Skema Kemitraan"
                tone="white"
                className="border-b border-line"
            >
                <SectionHeading
                    eyebrow="Alur Kerja Sama"
                    title="Tiga Langkah Menjalin Kemitraan"
                    description="Proses kolaborasi dirancang ringkas dan transparan agar program langsung menyentuh pembudidaya di lapangan."
                />

                {/* Garis Ombak Terhubung (Desktop) */}
                <div className="relative mt-12">
                    <div
                        aria-hidden="true"
                        className="pointer-events-none hidden md:block px-12 -mb-5"
                    >
                        <svg
                            viewBox="0 0 1000 64"
                            fill="none"
                            className="h-14 w-full stroke-ocean"
                            strokeWidth="2"
                        >
                            <path
                                ref={wavePathRef}
                                d="M 10 34 Q 130 6, 255 34 T 500 34 T 745 34 T 990 34"
                                strokeLinecap="round"
                            />
                        </svg>
                    </div>

                    {/* Tiga Langkah dengan Ritme Tidak Seragam */}
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-12 md:items-start">
                        {PROCESS_STEPS.map((item, idx) => {
                            const colSpan =
                                idx === 1
                                    ? 'md:col-span-4 md:mt-6'
                                    : 'md:col-span-4';
                            return (
                                <div
                                    key={item.step}
                                    className={cx(
                                        'relative border-t-2 border-navy pt-5',
                                        colSpan
                                    )}
                                >
                                    <div className="flex items-baseline justify-between gap-2">
                                        <span className="font-mono text-xs font-bold tracking-widest text-ocean">
                                            LANGKAH {item.step}
                                        </span>
                                        <span className="h-2.5 w-2.5 rounded-full bg-ocean ring-4 ring-ocean/15" />
                                    </div>

                                    <h3 className="mt-2 font-display text-2xl font-extrabold text-navy sm:text-3xl">
                                        {item.title}
                                    </h3>

                                    <p className="mt-2.5 text-sm leading-relaxed text-ink">
                                        {item.lead}
                                    </p>

                                    <p className="mt-3 border-l-2 border-aqua pl-3 text-xs font-medium text-slate">
                                        {item.requirement}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Pilihan Pilar Kerja Sama dari Backend */}
                {schemes.length > 0 ? (
                    <div className="mt-14 border-t border-line pt-10">
                        <p className="t-eyebrow text-slate mb-4">
                            Ruang Lingkup Kolaborasi Tersedia
                        </p>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {schemes.map((sch) => (
                                <div
                                    key={sch.id}
                                    className="flex items-start justify-between gap-4 border-b border-line pb-4"
                                >
                                    <div>
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-ocean">
                                            {sch.tag}
                                        </span>
                                        <h4 className="mt-0.5 font-display text-base font-bold text-navy">
                                            {sch.title}
                                        </h4>
                                        <p className="mt-1 text-xs leading-relaxed text-slate">
                                            {sch.desc}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : null}
            </Section>

            {/* =================================================================
                02 MITRA KAMI: Tab Jenis + Marquee Atas + Dinding Logo Seragam
               ================================================================= */}
            <Section
                id="mitra-kami"
                index="02"
                label="Mitra Kami"
                tone="mist"
                className="border-b border-line"
            >
                <SectionHeading
                    eyebrow="Jejaring Lembaga & Industri"
                    title="Mitra Strategis Nusantara"
                    description="Sinergi aktif bersama kementerian pembina, perguruan tinggi riset, dunia usaha, dan organisasi masyarakat pesisir."
                    align="split"
                    actions={
                        <div
                            role="tablist"
                            aria-label="Filter jenis mitra"
                            className="flex flex-wrap gap-1.5"
                        >
                            {PARTNER_TABS.map((tab) => {
                                const isActive = activePartnerTab === tab;
                                const count = partnersByTab[tab]?.length ?? 0;
                                return (
                                    <button
                                        key={tab}
                                        type="button"
                                        role="tab"
                                        aria-selected={isActive}
                                        onClick={() => setActivePartnerTab(tab)}
                                        className={cx(
                                            'inline-flex min-h-[38px] items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors',
                                            focusRing,
                                            isActive
                                                ? 'bg-navy text-white shadow-xs'
                                                : 'border border-line bg-white text-slate hover:border-ocean hover:text-navy'
                                        )}
                                    >
                                        <span>{tab}</span>
                                        <span
                                            className={cx(
                                                'font-mono text-[10px]',
                                                isActive
                                                    ? 'text-aqua'
                                                    : 'text-slate/70'
                                            )}
                                        >
                                            {count}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    }
                />

                {/* Marquee di Bagian Atas */}
                {partners.length > 0 ? (
                    <div className="mt-8 border-y border-line bg-white/70 py-4">
                        <Marquee
                            label="Deretan mitra strategis NSA"
                            duration={42}
                            gap={40}
                            minItems={8}
                        >
                            {partners.map((partner) => (
                                <button
                                    key={`mq-${partner.id}`}
                                    type="button"
                                    onClick={() => setSelectedPartner(partner)}
                                    className="flex items-center gap-2.5 px-2 py-1 text-left transition-opacity hover:opacity-80"
                                >
                                    <Building2 className="h-4 w-4 shrink-0 text-ocean" />
                                    <span className="font-display text-sm font-bold text-navy">
                                        {partner.name}
                                    </span>
                                </button>
                            ))}
                        </Marquee>
                    </div>
                ) : null}

                {/* Dinding Logo dengan Ukuran Seragam */}
                <div className="mt-8">
                    {visiblePartners.length > 0 ? (
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                            {visiblePartners.map((partner) => {
                                const showImg =
                                    Boolean(partner.logo) &&
                                    !failedLogos[partner.id];
                                return (
                                    <button
                                        key={partner.id}
                                        type="button"
                                        onClick={() =>
                                            setSelectedPartner(partner)
                                        }
                                        className={cx(
                                            'group flex h-40 flex-col items-center justify-center gap-3 rounded-card border border-line bg-white p-5 text-center shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-ocean hover:shadow-soft',
                                            focusRing
                                        )}
                                    >
                                        <div className="flex h-14 w-28 items-center justify-center">
                                            {showImg ? (
                                                <img
                                                    src={partner.logo!}
                                                    alt={partner.name}
                                                    loading="lazy"
                                                    onError={() =>
                                                        setFailedLogos(
                                                            (prev) => ({
                                                                ...prev,
                                                                [partner.id]:
                                                                    true,
                                                            })
                                                        )
                                                    }
                                                    className="max-h-12 max-w-full object-contain grayscale transition duration-200 group-hover:grayscale-0"
                                                />
                                            ) : (
                                                <Building2 className="h-9 w-9 text-ocean/60 transition-colors group-hover:text-ocean" />
                                            )}
                                        </div>

                                        <div className="min-w-0 w-full">
                                            <span className="block truncate font-display text-xs font-bold text-navy group-hover:text-ocean sm:text-sm">
                                                {partner.name}
                                            </span>
                                            <span className="mt-0.5 block truncate text-[11px] font-medium text-slate">
                                                {partner.type ||
                                                    classifyPartnerType(
                                                        partner.type
                                                    )}
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="rounded-card border border-dashed border-line bg-white p-8">
                            <EmptyState
                                title={`Belum ada mitra kategori ${activePartnerTab}`}
                                description={`Kami terbuka menjalin kolaborasi perdana dengan lembaga atau pelaku industri pada kategori ${activePartnerTab}.`}
                                action={
                                    <Button
                                        href="#ajukan-kemitraan"
                                        size="sm"
                                        onClick={() => setActivePartnerTab('Semua')}
                                    >
                                        Lihat Semua Mitra
                                    </Button>
                                }
                            />
                        </div>
                    )}
                </div>
            </Section>

            {/* =================================================================
                03 MANFAAT KEMITRAAN: Daftar Dua Kolom Bergaris Tanpa Ikon Lingkaran
               ================================================================= */}
            <Section
                id="manfaat-kemitraan"
                index="03"
                label="Manfaat Kemitraan"
                tone="white"
                className="border-b border-line"
            >
                <SectionHeading
                    eyebrow="Nilai Tambah Kolaborasi"
                    title="Manfaat Nyata bagi Mitra Strategis"
                    description="Keuntungan terukur yang diperoleh lembaga pemerintah, sektor swasta, kampus, dan komunitas saat bersinergi bersama NSA."
                />

                <div className="mt-10 grid grid-cols-1 gap-x-12 md:grid-cols-2">
                    {PARTNERSHIP_BENEFITS.map((item) => (
                        <div
                            key={item.index}
                            className="flex items-start gap-5 border-t border-line py-6"
                        >
                            <span className="font-mono text-sm font-bold text-ocean pt-1 shrink-0">
                                {item.index}
                            </span>
                            <div>
                                <h3 className="font-display text-lg font-bold text-navy">
                                    {item.title}
                                </h3>
                                <p className="mt-1.5 text-sm leading-relaxed text-slate">
                                    {item.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </Section>

            {/* =================================================================
                04 AJUKAN KEMITRAAN: Teks Pengantar Kiri + Formulir Menempel Kanan
               ================================================================= */}
            <Section
                id="ajukan-kemitraan"
                index="04"
                label="Ajukan Kemitraan"
                tone="mist"
                className="scroll-mt-24"
            >
                <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-14">
                    {/* Kiri (5 kolom): Teks Pengantar */}
                    <div className="lg:col-span-5 space-y-6">
                        <div>
                            <h2 className="font-display text-3xl font-extrabold tracking-tight text-navy sm:text-4xl leading-tight">
                                Mulai Sinergi Bersama Ekosistem NSA
                            </h2>
                            <p className="measure mt-4 text-base leading-relaxed text-slate">
                                Sampaikan profil instansi dan rencana program
                                Anda. Tim sekretariat kemitraan akan menelaah
                                ajuan serta menjadwalkan audiensi resmi dalam
                                1–2 hari kerja.
                            </p>
                        </div>

                        <div className="space-y-4 border-t border-line pt-6 text-sm text-ink">
                            <div className="flex items-start gap-3">
                                <Handshake className="mt-0.5 h-5 w-5 shrink-0 text-ocean" />
                                <div>
                                    <p className="font-bold text-navy">
                                        Audiensi &amp; Penjajakan Terbuka
                                    </p>
                                    <p className="text-xs leading-relaxed text-slate">
                                        Cocok untuk produsen pakan, lembaga
                                        riset, pembiayaan KUR, maupun pembeli
                                        partai besar hasil panen.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Kanan (7 kolom): Panel Formulir Menempel */}
                    <div
                        className="lg:sticky lg:col-span-7"
                        style={{ top: 'calc(var(--header-h, 72px) + 20px)' }}
                    >
                        <div className="rounded-card border border-line bg-white p-6 shadow-soft sm:p-10">
                            <form
                                onSubmit={handleSubmit}
                                noValidate
                                className="space-y-5"
                            >
                                {/* Honeypot anti-spam */}
                                <div
                                    className="pointer-events-none absolute -left-[9999px] h-0 overflow-hidden opacity-0"
                                    aria-hidden="true"
                                >
                                    <label htmlFor="fax_number">
                                        Fax Number
                                    </label>
                                    <input
                                        id="fax_number"
                                        type="text"
                                        name="fax_number"
                                        value={data.fax_number}
                                        onChange={(e) =>
                                            setData(
                                                'fax_number',
                                                e.target.value
                                            )
                                        }
                                        tabIndex={-1}
                                        autoComplete="off"
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <label
                                            htmlFor="partner-name"
                                            className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate"
                                        >
                                            Nama Narahubung *
                                        </label>
                                        <Input
                                            id="partner-name"
                                            type="text"
                                            required
                                            value={data.name}
                                            onChange={(e) =>
                                                setData('name', e.target.value)
                                            }
                                            placeholder="Contoh: Budi Santoso"
                                            error={mergedErrors.name}
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="partner-institution"
                                            className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate"
                                        >
                                            Nama Instansi / Perusahaan *
                                        </label>
                                        <Input
                                            id="partner-institution"
                                            type="text"
                                            required
                                            value={data.institution}
                                            onChange={(e) =>
                                                setData(
                                                    'institution',
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Contoh: PT Feed Indonesia"
                                            error={mergedErrors.institution}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <label
                                            htmlFor="partner-email"
                                            className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate"
                                        >
                                            Email Resmi *
                                        </label>
                                        <Input
                                            id="partner-email"
                                            type="email"
                                            required
                                            value={data.email}
                                            onChange={(e) =>
                                                setData('email', e.target.value)
                                            }
                                            placeholder="nama@instansi.co.id"
                                            error={mergedErrors.email}
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="partner-phone"
                                            className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate"
                                        >
                                            Nomor Telepon / WA *
                                        </label>
                                        <Input
                                            id="partner-phone"
                                            type="tel"
                                            required
                                            value={data.phone}
                                            onChange={(e) =>
                                                setData('phone', e.target.value)
                                            }
                                            placeholder="081234567890"
                                            error={mergedErrors.phone}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label
                                        htmlFor="partner-scheme"
                                        className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate"
                                    >
                                        Skema Kemitraan yang Diajukan *
                                    </label>
                                    <select
                                        id="partner-scheme"
                                        value={data.partnership_scheme}
                                        onChange={(e) =>
                                            setData(
                                                'partnership_scheme',
                                                e.target.value
                                            )
                                        }
                                        className={cx(
                                            'h-11 w-full rounded-control border border-line bg-white px-3.5 text-sm text-ink transition focus:border-ocean',
                                            focusRing
                                        )}
                                    >
                                        <option value="Rantai Pasok Pakan & Bibit Unggul">
                                            Rantai Pasok Pakan &amp; Bibit
                                            Unggul
                                        </option>
                                        <option value="Riset & Transfer Teknologi Akuakultur">
                                            Riset &amp; Transfer Teknologi
                                            Akuakultur
                                        </option>
                                        <option value="Hilirisasi & Akses Pasar Ekspor">
                                            Hilirisasi &amp; Akses Pasar Ekspor
                                        </option>
                                        <option value="Pembiayaan & Asuransi Usaha Budidaya">
                                            Pembiayaan &amp; Asuransi Usaha
                                            Budidaya
                                        </option>
                                        <option value="Kemitraan Lainnya">
                                            Kemitraan / Sponsorship Lainnya
                                        </option>
                                    </select>
                                    {mergedErrors.partnership_scheme ? (
                                        <p className="mt-1 text-xs text-danger">
                                            {mergedErrors.partnership_scheme}
                                        </p>
                                    ) : null}
                                </div>

                                <div>
                                    <label
                                        htmlFor="partner-message"
                                        className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate"
                                    >
                                        Rincian Proposal / Rencana Kerja Sama *
                                    </label>
                                    <Textarea
                                        id="partner-message"
                                        rows={4}
                                        required
                                        value={data.message}
                                        onChange={(e) =>
                                            setData('message', e.target.value)
                                        }
                                        placeholder="Jelaskan latar belakang, ruang lingkup kolaborasi, serta proyeksi manfaat bagi pembudidaya NSA..."
                                        error={mergedErrors.message}
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    loading={processing}
                                    size="lg"
                                    className="w-full justify-center font-bold"
                                >
                                    <Send className="mr-2 h-4 w-4" />
                                    Kirim Pengajuan Kemitraan
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            </Section>

            {/* Panel Singkat Detail Mitra Saat Logo Diklik */}
            <AnimatePresence>
                {selectedPartner ? (
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-label={`Informasi mitra ${selectedPartner.name}`}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedPartner(null)}
                            className="fixed inset-0 bg-ink/45 backdrop-blur-xs"
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.96, y: 8 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.96, y: 8 }}
                            transition={{ duration: 0.2 }}
                            className="relative z-10 w-full max-w-md rounded-2xl border border-line bg-white p-6 shadow-lift sm:p-7"
                        >
                            <div className="flex items-start justify-between gap-3 border-b border-line pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-control border border-line bg-mist">
                                        {selectedPartner.logo &&
                                        !failedLogos[selectedPartner.id] ? (
                                            <img
                                                src={selectedPartner.logo}
                                                alt={selectedPartner.name}
                                                className="max-h-9 max-w-9 object-contain"
                                            />
                                        ) : (
                                            <Building2 className="h-6 w-6 text-ocean" />
                                        )}
                                    </div>
                                    <div>
                                        <span className="block text-[11px] font-bold uppercase tracking-wider text-ocean">
                                            {selectedPartner.type ||
                                                classifyPartnerType(
                                                    selectedPartner.type
                                                )}
                                        </span>
                                        <h3 className="font-display text-lg font-bold text-navy">
                                            {selectedPartner.name}
                                        </h3>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setSelectedPartner(null)}
                                    aria-label="Tutup detail mitra"
                                    className="rounded-control p-1 text-slate hover:bg-mist hover:text-navy"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="mt-5 space-y-4 text-sm text-slate">
                                <p>
                                    Mitra kolaborasi resmi Nusantara Sustainable
                                    Aquatic (NSA) dalam pengembangan ekosistem
                                    perikanan budidaya Indonesia.
                                </p>

                                {selectedPartner.url ? (
                                    <a
                                        href={selectedPartner.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-2 font-bold text-ocean hover:text-navy"
                                    >
                                        <span>Kunjungi Situs Mitra</span>
                                        <ExternalLink className="h-4 w-4" />
                                    </a>
                                ) : (
                                    <p className="text-xs text-slate">
                                        Tautan situs resmi mitra belum
                                        ditambahkan.
                                    </p>
                                )}
                            </div>

                            <div className="mt-6 flex justify-end border-t border-line pt-4">
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={() => setSelectedPartner(null)}
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
