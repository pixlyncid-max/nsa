import Marquee from '@/Components/layout/Marquee';
import Section from '@/Components/layout/Section';
import SectionHeading from '@/Components/layout/SectionHeading';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';
import { useLocale } from '@/lib/lroute';
import { memberStories, type MemberStory } from '@/lib/memberStories';
import { AnimatePresence, motion } from 'framer-motion';
import { Building2, ChevronLeft, ChevronRight, Quote, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';

export interface PartnerItem {
    id: number;
    name: string;
    type: string;
    logo?: string | null;
    url?: string | null;
}

interface StoriesPartnersProps {
    partners?: PartnerItem[];
}

export default function StoriesPartnersSection({
    partners = [],
}: StoriesPartnersProps) {
    const { isEn } = useLocale();
    const [activeIndex, setActiveIndex] = useState(0);
    const reducedMotion = usePrefersReducedMotion();

    const enStories: MemberStory[] = [
        {
            quote: 'Through the association\'s CBIB certification coaching, our red tilapia harvests secured direct catering and supermarket supply contracts without long middlemen chains.',
            name: 'H. Sudirman',
            business: 'Mina Barokah Farm',
            location: 'Tulungagung Regency, East Java',
            commodity: 'Red Tilapia',
        },
        {
            quote: 'Collective factory feed procurement cut our feed costs by double digits each harvest cycle. Our biofloc catfish ponds are now healthier and more predictable.',
            name: 'Budi Hartono',
            business: 'Tambak Surya Mandiri',
            location: 'Subang Regency, West Java',
            commodity: 'Sangkuriang Catfish',
        },
        {
            quote: 'Before joining, milkfish fry quality was inconsistent. The association connected our group directly to certified hatcheries with verified seed origin certificates.',
            name: 'Siti Rahmawati',
            business: 'Kelompok Tani Pesisir Berdaya',
            location: 'Maros Regency, South Sulawesi',
            commodity: 'Milkfish & Shrimp',
        },
    ];

    const stories: MemberStory[] = isEn
        ? enStories
        : memberStories.length > 0
        ? memberStories
        : [
              {
                  quote: 'Lewat pendampingan sertifikasi CPIB asosiasi, panen nila merah kami berhasil menembus kontrak pasokan katering dan pasar swalayan tanpa perantara panjang.',
                  name: 'H. Sudirman',
                  business: 'Mina Barokah Farm',
                  location: 'Kabupaten Tulungagung, Jawa Timur',
                  commodity: 'Nila Merah',
              },
              {
                  quote: 'Dukungan konsolidasi pakan pabrikan memangkas beban biaya pakan kami hingga belasan persen per siklus panen. Tambak lele bioflok kami kini jauh lebih sehat.',
                  name: 'Budi Hartono',
                  business: 'Tambak Surya Mandiri',
                  location: 'Kabupaten Subang, Jawa Barat',
                  commodity: 'Lele Sangkuriang',
              },
              {
                  quote: 'Sebelum bergabung, bibit bandeng kerap datang tidak seragam. Asosiasi menghubungkan kelompok kami langsung ke balai pembenihan resmi dengan surat asal benih terverifikasi.',
                  name: 'Siti Rahmawati',
                  business: 'Kelompok Tani Pesisir Berdaya',
                  location: 'Kabupaten Maros, Sulawesi Selatan',
                  commodity: 'Bandeng & Udang',
              },
          ];

    // Otomatis berganti kutipan setiap 8 detik (bila tidak reduced motion)
    useEffect(() => {
        if (reducedMotion || stories.length <= 1) return;
        const interval = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % stories.length);
        }, 8000);
        return () => clearInterval(interval);
    }, [reducedMotion, stories.length]);

    const handlePrev = () => {
        setActiveIndex((prev) => (prev === 0 ? stories.length - 1 : prev - 1));
    };

    const handleNext = () => {
        setActiveIndex((prev) => (prev + 1) % stories.length);
    };

    const activeStory = stories[activeIndex];

    // Mitra institusi bawaan bila data database sedikit
    const defaultPartners: PartnerItem[] = [
        { id: 101, name: 'Kementerian Kelautan & Perikanan', type: 'Regulator & Pembina' },
        { id: 102, name: 'Fakultas Perikanan IPB', type: 'Riset Budidaya' },
        { id: 103, name: 'Balai Riset Budidaya Air Tawar', type: 'Pemuliaan Benih' },
        { id: 104, name: 'Himpunan Nelayan Seluruh Indonesia', type: 'Organisasi Profesi' },
        { id: 105, name: 'Masyarakat Akuakultur Indonesia', type: 'Mitra Keilmuan' },
        { id: 106, name: 'Asosiasi Rantai Dingin Bahari', type: 'Mitra Logistik' },
    ];

    const allPartners = partners.length > 0 ? partners : defaultPartners;

    return (
        <Section
            id="cerita-dan-mitra"
            index="07"
            label={isEn ? 'Member Stories & Partners' : 'Cerita Anggota & Mitra'}
            tone="white"
            bleed={false}
            className="!pb-8 sm:!pb-10"
        >
            <SectionHeading
                eyebrow={isEn ? 'Voices from the Pondside' : 'Suara dari Pematang Tambak'}
                title={isEn ? 'Indonesian Member Stories' : 'Cerita Anggota Nusantara'}
                description={
                    isEn
                        ? 'Real experiences from fish farmers and aquaculture entrepreneurs growing together through the association network.'
                        : 'Pengalaman nyata petambak dan pelaku usaha akuakultur yang berkembang bersama jejaring asosiasi.'
                }
            />

            {/* Kutipan Anggota (Satu Kutipan Besar Bergantian) */}
            <div className="mt-10 relative rounded-card border border-line bg-white p-8 sm:p-12 shadow-soft overflow-hidden">
                <Quote
                    aria-hidden="true"
                    className="absolute -right-4 -top-4 h-32 w-32 text-ocean/5 pointer-events-none"
                />

                <div className="relative z-10 min-h-[190px] flex flex-col justify-between">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeIndex}
                            initial={reducedMotion ? undefined : { opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={reducedMotion ? undefined : { opacity: 0, y: -10 }}
                            transition={{ duration: 0.35 }}
                            className="space-y-6"
                        >
                            <p className="font-display text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-navy leading-relaxed">
                                &ldquo;{activeStory.quote}&rdquo;
                            </p>

                            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-line">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-display text-base font-bold text-navy">
                                            {activeStory.name}
                                        </span>
                                        {activeStory.commodity ? (
                                            <span className="rounded-full bg-ocean/10 px-2.5 py-0.5 text-[11px] font-semibold text-ocean">
                                                {activeStory.commodity}
                                            </span>
                                        ) : null}
                                    </div>
                                    <div className="text-xs text-slate mt-0.5">
                                        <span className="text-ink font-medium">{activeStory.business}</span> · {activeStory.location}
                                    </div>
                                </div>

                                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                                    <ShieldCheck className="h-3.5 w-3.5" />
                                    {isEn ? 'Verified Member' : 'Anggota Terverifikasi'}
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Kontrol Navigasi Kutipan */}
                <div className="mt-6 flex items-center justify-between border-t border-line/60 pt-4">
                    <div className="flex items-center gap-2">
                        {stories.map((_, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={() => setActiveIndex(i)}
                                aria-label={`Pindah ke testimoni ${i + 1}`}
                                className={`h-2 rounded-full transition-all duration-300 ${
                                    i === activeIndex
                                        ? 'w-6 bg-ocean'
                                        : 'w-2 bg-line hover:bg-slate'
                                }`}
                            />
                        ))}
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handlePrev}
                            aria-label="Kutipan sebelumnya"
                            className="flex h-8 w-8 items-center justify-center rounded-control border border-line bg-white text-navy transition-colors hover:border-ocean hover:text-ocean shadow-xs"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                            type="button"
                            onClick={handleNext}
                            aria-label="Kutipan berikutnya"
                            className="flex h-8 w-8 items-center justify-center rounded-control border border-line bg-white text-navy transition-colors hover:border-ocean hover:text-ocean shadow-xs"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Marquee Logo Mitra */}
            <div className="mt-16 pt-10 border-t border-line">
                <div className="text-center mb-6">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate">
                        {isEn
                            ? 'Supported by Regulatory, Research & Maritime Industry Partners'
                            : 'Didukung oleh Lembaga Pembina, Riset & Industri Bahari'}
                    </span>
                </div>

                <Marquee
                    label={isEn ? 'Strategic Association Partners' : 'Mitra Strategis Asosiasi'}
                    duration={40}
                    gap={36}
                    minItems={8}
                >
                    {allPartners.map((partner) => (
                        <div
                            key={partner.id}
                            className="flex h-16 items-center gap-3 rounded-card border border-line bg-white px-5 shadow-xs transition-colors hover:border-ocean/40"
                        >
                            {partner.logo ? (
                                <img
                                    src={partner.logo}
                                    alt={partner.name}
                                    className="h-8 w-8 object-contain grayscale hover:grayscale-0 transition duration-200"
                                    loading="lazy"
                                />
                            ) : (
                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-mist text-ocean">
                                    <Building2 className="h-4 w-4" />
                                </span>
                            )}
                            <div className="max-w-[200px]">
                                <div className="truncate text-xs font-bold text-navy">
                                    {partner.name}
                                </div>
                                <div className="truncate text-[10px] text-slate">
                                    {partner.type}
                                </div>
                            </div>
                        </div>
                    ))}
                </Marquee>
            </div>
        </Section>
    );
}
