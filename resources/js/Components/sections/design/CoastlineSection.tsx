import ArchImage from '@/Components/layout/ArchImage';
import ImageMask from '@/Components/layout/ImageMask';
import Marquee from '@/Components/layout/Marquee';
import PageHeader from '@/Components/layout/PageHeader';
import Section from '@/Components/layout/Section';
import SectionHeading from '@/Components/layout/SectionHeading';
import StickyIndex, { type StickyIndexItem } from '@/Components/layout/StickyIndex';
import Button from '@/Components/ui/Button';
import Card from '@/Components/ui/Card';
import Reveal from '@/Components/motion/Reveal';
import CountUp from '@/Components/motion/CountUp';
import React from 'react';
import { Anchor, ArrowRight, Fish, ShieldCheck, Waves } from 'lucide-react';

const indexItems: StickyIndexItem[] = [
    { id: 'demo-section-primitives', index: '01', label: 'Primitif Section & Heading' },
    { id: 'demo-grid-asymmetry', index: '02', label: 'Grid Asimetris 5/7, 4/8, 3/9' },
    { id: 'demo-photo-shapes', index: '03', label: 'Bentuk Foto (Arch, Tall, Circle)' },
    { id: 'demo-marquee-motion', index: '04', label: 'Marquee & Animasi Garis' },
];

export default function CoastlineSection() {
    return (
        <div id="garis-pantai" className="space-y-12">
            {/* 1. Demonstrasi PageHeader dengan Anime.js SVG dan Breadcrumbs */}
            <div className="rounded-2xl border border-line bg-white overflow-hidden shadow-soft">
                <div className="bg-mist/80 px-6 py-3 border-b border-line flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-ocean">
                        Primitif: PageHeader
                    </span>
                    <span className="text-xs text-slate">anime.js SVG contour + breadcrumb</span>
                </div>

                <PageHeader
                    breadcrumbs={[
                        { label: 'Beranda', href: '/' },
                        { label: 'Galeri Desain', href: '/desain' },
                        { label: 'Layout Garis Pantai' },
                    ]}
                    eyebrow="TATA LETAK EDITORIAL"
                    title="Layout Garis Pantai NSA"
                    description="Sistem desain bab bernomor, komposisi asimetris dinamis, dan ragam bentuk foto arsitektural maritim Indonesia."
                    variant="default"
                >
                    <div className="flex flex-wrap gap-3">
                        <Button variant="primary">Eksplorasi Komponen</Button>
                        <Button variant="secondary">Dokumentasi design.md</Button>
                    </div>
                </PageHeader>
            </div>

            {/* Layout Asimetris dengan StickyIndex di Kiri (Pola 3 / 9 Kolom) */}
            <div className="grid gap-8 lg:grid-cols-12 items-start">
                {/* Indeks Samping Sticky (3 Kolom) */}
                <div className="lg:col-span-3">
                    <StickyIndex items={indexItems} title="Bab Garis Pantai" />
                </div>

                {/* Konten Utama (9 Kolom) */}
                <div className="lg:col-span-9 space-y-12">
                    {/* Bab 01: Section & SectionHeading */}
                    <div id="demo-section-primitives">
                        <Section
                            index="01"
                            label="PRIMITIF SECTION & HEADING"
                            tone="white"
                            className="rounded-2xl border border-line p-6 sm:p-10 !py-8 shadow-soft"
                        >
                            <SectionHeading
                                eyebrow="BAB 01 — KEPALA SEKSI"
                                title="Section & SectionHeading Dinamis"
                                description="Memberikan penomoran bab otomatis dengan garis pembatas tipis, mendukung varian nada white, mist, dan navy."
                                align="split"
                                actions={
                                    <Button variant="secondary" size="sm">
                                        Aksi Kanan Split
                                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                                    </Button>
                                }
                            />

                            <div className="mt-8 grid gap-4 sm:grid-cols-2">
                                <Card className="p-5 bg-white border border-line">
                                    <h4 className="font-display font-bold text-navy text-base">
                                        Varian Section Tone: White
                                    </h4>
                                    <p className="text-xs text-slate mt-2 leading-relaxed">
                                        Latar putih bersih dengan pembatas indeks bab berwarna ocean yang kontras dan nyaman dibaca.
                                    </p>
                                </Card>

                                <Card className="p-5 bg-mist border border-line">
                                    <h4 className="font-display font-bold text-navy text-base">
                                        Varian Section Tone: Mist
                                    </h4>
                                    <p className="text-xs text-slate mt-2 leading-relaxed">
                                        Latar biru muda kabut lembut (#F4F8FC) untuk transisi selang-seling antar bab konten.
                                    </p>
                                </Card>
                            </div>
                        </Section>
                    </div>

                    {/* Bab 02: Grid Asimetris (5/7, 4/8, 3/9) */}
                    <div id="demo-grid-asymmetry">
                        <Section
                            index="02"
                            label="GRID ASIMETRIS KONTRIBUTIF"
                            tone="mist"
                            className="rounded-2xl border border-line p-6 sm:p-10 !py-8 shadow-soft"
                        >
                            <SectionHeading
                                eyebrow="BAB 02 — KOMPOSISI GRID"
                                title="Pola Grid Asimetris 5/7 & 4/8"
                                description="Menolak tata letak 3-kartu simetris klise AI dengan ritme kolom yang kaya kontras visual."
                            />

                            {/* Contoh Asimetris 5 / 7 Kolom */}
                            <div className="mt-8 rounded-xl border border-line bg-white p-6">
                                <span className="font-mono text-xs font-bold text-ocean block mb-3">
                                    [Pola 5 Kolom Narasi / 7 Kolom Media]
                                </span>
                                <div className="grid gap-6 lg:grid-cols-12 items-center">
                                    <div className="lg:col-span-5 space-y-3">
                                        <h4 className="font-display font-bold text-navy text-lg">
                                            Kedaulatan Maritim & Akuakultur
                                        </h4>
                                        <p className="text-xs text-slate leading-relaxed">
                                            Komposisi 5 kolom memberikan ruang baca yang intim untuk narasi kepengurusan dan visi organisasi perikanan.
                                        </p>
                                        <div className="pt-2 flex items-center gap-3">
                                            <span className="font-display text-2xl font-bold text-ocean">
                                                <CountUp to={85} suffix="%" />
                                            </span>
                                            <span className="text-xs text-slate">
                                                Penyelesaian Pendaftaran 9 Langkah
                                            </span>
                                        </div>
                                    </div>
                                    <div className="lg:col-span-7 bg-mist rounded-xl p-5 border border-line">
                                        <div className="flex items-center gap-3 text-xs font-bold text-navy mb-2">
                                            <Fish className="w-4 h-4 text-ocean" />
                                            Katalog Komoditas Nasional
                                        </div>
                                        <p className="text-xs text-slate leading-relaxed">
                                            7 kolom memberikan ruang lega untuk kartu komparasi data, grafik sebaran bibit nila, patin, lele, dan udang vaname Nusantara.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Section>
                    </div>

                    {/* Bab 03: Bentuk Foto Beragam (Arch, Tall, Circle) */}
                    <div id="demo-demo-photo-shapes">
                        <Section
                            index="03"
                            label="RAGAM BENTUK FOTO ARSITEKTURAL"
                            tone="white"
                            className="rounded-2xl border border-line p-6 sm:p-10 !py-8 shadow-soft"
                        >
                            <SectionHeading
                                eyebrow="BAB 03 — MEDIA SHAPES"
                                title="Bentuk Foto: Arch, Tall, & Circle"
                                description="Semua elemen foto memiliki aspect-ratio eksplisit untuk menjamin zero Cumulative Layout Shift (CLS)."
                            />

                            <div className="mt-8 grid gap-6 sm:grid-cols-3 items-end">
                                {/* Arch Image (Lengkung Atas) */}
                                <div>
                                    <span className="font-mono text-xs font-bold text-ocean block mb-2 text-center">
                                        ArchImage (Lengkung Atas)
                                    </span>
                                    <ArchImage
                                        src="/images/heroes/aquaculture-hero.jpg"
                                        alt="Tambak Udang Pesisir Garis Pantai"
                                        aspectRatio="aspect-[4/5]"
                                        caption="ArchImage: lengkung atas 120px"
                                    />
                                </div>

                                {/* ImageMask Tall Portrait */}
                                <div>
                                    <span className="font-mono text-xs font-bold text-ocean block mb-2 text-center">
                                        ImageMask (Tall Portrait 3:4)
                                    </span>
                                    <ImageMask
                                        src="/images/heroes/fishermen-community.jpg"
                                        alt="Aktivitas Pembudidaya Ikan Nusantara"
                                        shape="tall"
                                        aspectRatio="aspect-[3/4]"
                                        caption="ImageMask: tall rounded-2xl"
                                    />
                                </div>

                                {/* ImageMask Circle */}
                                <div>
                                    <span className="font-mono text-xs font-bold text-ocean block mb-2 text-center">
                                        ImageMask (Lingkaran 1:1)
                                    </span>
                                    <div className="max-w-[200px] mx-auto">
                                        <ImageMask
                                            src="/images/avatars/member-default.jpg"
                                            alt="Profil Anggota Resmi NSA"
                                            shape="circle"
                                            aspectRatio="aspect-square"
                                            caption="ImageMask: circle 1:1"
                                        />
                                    </div>
                                </div>
                            </div>
                        </Section>
                    </div>

                    {/* Bab 04: Marquee & Animasi Garis */}
                    <div id="demo-marquee-motion">
                        <Section
                            index="04"
                            label="MARQUEE & GERAKAN HALUS"
                            tone="navy"
                            className="rounded-2xl p-6 sm:p-10 !py-8 shadow-soft"
                        >
                            <SectionHeading
                                eyebrow="BAB 04 — MOTION & MARQUEE"
                                title="Marquee Lambat & Reveal Motion"
                                description="Animasi kontinu yang berhenti otomatis saat kursor diarahkan atau saat reduced-motion aktif di peramban."
                                tone="light"
                            />

                            <div className="mt-8 rounded-xl bg-white/10 p-5 border border-white/15">
                                <Marquee label="Statistik Singkat NSA" duration={30}>
                                    <div className="flex items-center gap-8 text-white font-medium text-xs sm:text-sm">
                                        <span className="flex items-center gap-2">
                                            <ShieldCheck className="w-4 h-4 text-aqua" />
                                            Asosiasi Perikanan Berkelanjutan Terverifikasi
                                        </span>
                                        <span className="text-aqua">•</span>
                                        <span className="flex items-center gap-2">
                                            <Anchor className="w-4 h-4 text-aqua" />
                                            38 Dewan Pengurus Wilayah Seluruh Indonesia
                                        </span>
                                        <span className="text-aqua">•</span>
                                        <span className="flex items-center gap-2">
                                            <Waves className="w-4 h-4 text-aqua" />
                                            Jaringan 10.000+ Pembudidaya & Petambak
                                        </span>
                                    </div>
                                </Marquee>
                            </div>

                            <div className="mt-6 flex justify-end">
                                <Reveal delay={0.1}>
                                    <div className="inline-flex items-center gap-2 text-xs font-mono text-aqua bg-white/10 px-3 py-1.5 rounded-full">
                                        <span>Framer Motion & anime.js Siap Digunakan</span>
                                    </div>
                                </Reveal>
                            </div>
                        </Section>
                    </div>
                </div>
            </div>
        </div>
    );
}
