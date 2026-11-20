import Section from '@/Components/layout/Section';
import ContourPattern from '@/Components/motion/ContourPattern';
import Button from '@/Components/ui/Button';
import { useCopy } from '@/hooks/useCopy';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';
import { useLocale } from '@/lib/lroute';
import { resolveMembershipCta } from '@/lib/membershipCta';
import type { PageProps } from '@/types';
import { usePage } from '@inertiajs/react';
import { ArrowRight, QrCode, Shield, Wifi } from 'lucide-react';

export default function WhyJoinSection() {
    const { props } = usePage<PageProps>();
    const { t } = useCopy();
    const { isEn } = useLocale();
    const user = props.auth?.user;
    const promoData = props.membershipPromo;
    const brandShort = props.brand?.short_name || 'NSA';
    const reducedMotion = usePrefersReducedMotion();

    const cta = resolveMembershipCta(user, promoData, brandShort, t);

    const benefits = isEn
        ? [
              {
                  num: '01',
                  title: 'Guaranteed Market & Distribution Access',
                  desc: 'Connect directly with catering, hotel, fillet factory, and inter-island buyers through stable pricing contracts without complex middlemen.',
              },
              {
                  num: '02',
                  title: 'Legality & CBIB Quality Assistance',
                  desc: 'End-to-end support for aquaculture NIB licensing, Good Aquaculture Practices (CBIB) certification, and official seed origin certificates.',
              },
              {
                  num: '03',
                  title: 'Member Pricing on Production Inputs',
                  desc: 'Collective sourcing of factory feed, probiotic vitamins, and certified seeds at exclusive member rates to cut pond operating costs.',
              },
              {
                  num: '04',
                  title: 'Advocacy & Business Protection',
                  desc: 'Institutional support when facing aquatic environmental challenges, coastal zoning permits, or regional pond governance disputes.',
              },
          ]
        : [
              {
                  num: '01',
                  title: 'Kepastian Akses Pasar & Distribusi',
                  desc: 'Terhubung langsung dengan jaringan buyer katering, hotel, pabrik fillet, dan pasar antar-pulau dengan kontrak harga stabil tanpa rantai perantara berbelit.',
              },
              {
                  num: '02',
                  title: 'Pendampingan Legalitas & Mutu CPIB',
                  desc: 'Bantuan tuntas penerbitan NIB perikanan budidaya, standardisasi Cara Budidaya Ikan yang Baik (CPIB), dan surat keterangan asal benih resmi KKP.',
              },
              {
                  num: '03',
                  title: 'Harga Khusus Sarana Produksi',
                  desc: 'Konsolidasi pasokan pakan pabrikan, vitamin probiotik, dan bibit bersertifikat dengan harga khusus anggota yang memangkas biaya operasional kolam.',
              },
              {
                  num: '04',
                  title: 'Advokasi & Perlindungan Usaha',
                  desc: 'Dukungan kelembagaan bila menghadapi kendala lingkungan perairan, izin zonasi ruang pesisir, atau sengketa tata kelola tambak di daerah.',
              },
          ];

    return (
        <Section
            id="kenapa-bergabung"
            index="05"
            label={isEn ? 'Why Join' : 'Kenapa Bergabung'}
            tone="navy"
            bleed={false}
            className="relative overflow-hidden"
        >
            {/* Tekstur Kontur Air Aqua Lembut di Latar Navy */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -inset-20 flex items-center justify-center opacity-25"
            >
                <ContourPattern
                    tone="aqua"
                    opacity={0.3}
                    rings={8}
                    size="130%"
                    animate={!reducedMotion}
                />
            </div>

            <div className="relative z-10">
                {/* 5/7 Asymmetric Grid */}
                <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
                    {/* Left Column (7 cols): Manfaat Bernomor Besar */}
                    <div className="lg:col-span-7">
                        <h2 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl leading-[1.12]">
                            {isEn
                                ? `Why Thousands of Fish Farmers Join ${brandShort}`
                                : `Mengapa Ribuan Petambak Bergabung Bersama ${brandShort}?`}
                        </h2>
                        <p className="measure mt-4 text-base text-mist/90 leading-relaxed">
                            {isEn
                                ? 'We solve real challenges at the pondside: high feed costs, inconsistent seed quality, and weak bargaining power during peak harvest.'
                                : 'Kami hadir menyelesaikan kendala nyata di pematang kolam: pakan mahal, benih tidak seragam, dan posisi tawar yang lemah saat panen raya tiba.'}
                        </p>

                        {/* 4 Poin Manfaat Bernomor Besar */}
                        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
                            {benefits.map((b) => (
                                <div key={b.num} className="group relative rounded-xl border border-white/10 bg-white/5 p-5 transition-all duration-200 hover:border-aqua/40 hover:bg-white/10">
                                    <span className="font-mono text-2xl font-black text-aqua/90">
                                        {b.num}
                                    </span>
                                    <h3 className="mt-2 font-display text-base font-bold text-white leading-snug">
                                        {b.title}
                                    </h3>
                                    <p className="mt-1.5 text-xs text-mist/80 leading-relaxed">
                                        {b.desc}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 flex items-center gap-4">
                            <Button
                                href={cta.primaryHref}
                                size="lg"
                                className="!bg-aqua !text-navy hover:!bg-white font-bold shadow-lift"
                                icon={<ArrowRight className="h-4 w-4" />}
                            >
                                {cta.primaryLabel}
                            </Button>
                        </div>
                    </div>

                    {/* Right Column (5 cols): Pratinjau KTA Digital Miring */}
                    <div className="lg:col-span-5 flex justify-center">
                        <div className="relative w-full max-w-sm">
                            {/* Kartu Digital Sedikit Miring */}
                            <div className="relative transform rotate-2 hover:rotate-0 transition-transform duration-300 ease-out rounded-2xl border-2 border-white/30 bg-[#012954] p-6 text-white shadow-lift">
                                {/* Header Kartu */}
                                <div className="flex items-start justify-between border-b border-white/15 pb-4">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-aqua text-navy font-black text-xs">
                                                NSA
                                            </span>
                                            <div>
                                                <div className="text-[11px] font-bold tracking-wider uppercase text-white">
                                                    Nusantara Aquatic
                                                </div>
                                                <div className="text-[9px] text-aqua tracking-widest uppercase">
                                                    {isEn ? 'Digital Member Card' : 'Kartu Tanda Anggota Digital'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <Wifi className="h-5 w-5 text-aqua/80 rotate-90" />
                                </div>

                                {/* Microchip Logam Emas Realistis */}
                                <div className="mt-5 flex items-center justify-between">
                                    <div className="h-8 w-11 rounded-md bg-gradient-to-tr from-amber-400 via-yellow-200 to-amber-500 border border-amber-300/60 shadow-xs relative overflow-hidden">
                                        <div className="absolute inset-x-0 top-1/2 h-px bg-amber-800/40" />
                                        <div className="absolute inset-y-0 left-1/3 w-px bg-amber-800/40" />
                                        <div className="absolute inset-y-0 right-1/3 w-px bg-amber-800/40" />
                                    </div>
                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                                        <Shield className="h-3 w-3" />
                                        {isEn ? 'Verified' : 'Terverifikasi'}
                                    </span>
                                </div>

                                {/* Nomor KTA & Info Anggota */}
                                <div className="mt-5">
                                    <div className="font-mono text-lg font-bold tracking-widest text-aqua">
                                        NSA-3271-2025-0892
                                    </div>

                                    <div className="mt-3 flex items-end justify-between">
                                        <div>
                                            <div className="text-[10px] uppercase tracking-wider text-mist/70">
                                                {isEn ? 'Member Name' : 'Nama Anggota'}
                                            </div>
                                            <div className="font-display text-sm font-bold text-white uppercase tracking-wide">
                                                Hendra Wijaya
                                            </div>
                                            <div className="text-[11px] text-aqua/90">
                                                Mina Samudra Barokah
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <div className="text-[10px] uppercase tracking-wider text-mist/70">
                                                {isEn ? 'Valid Thru' : 'Berlaku Hingga'}
                                            </div>
                                            <div className="font-mono text-xs font-semibold text-white">
                                                12/2026
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between text-[10px] text-mist/70">
                                        <span>DPW JAWA BARAT · DPC BOGOR</span>
                                        <span className="flex items-center gap-1 text-white">
                                            <QrCode className="h-3.5 w-3.5 text-aqua" />
                                            {isEn ? 'Encrypted QR' : 'QR Terenkripsi'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Section>
    );
}
