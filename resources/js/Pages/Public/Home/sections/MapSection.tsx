import Container from '@/Components/layout/Container';
import Section from '@/Components/layout/Section';
import SectionHeading from '@/Components/layout/SectionHeading';
import CountUp from '@/Components/motion/CountUp';
import IndonesiaMap, {
    type ProvinceStatItem,
} from '@/Components/sections/home/IndonesiaMap';
import Button from '@/Components/ui/Button';
import { cx } from '@/lib/cx';
import { useLocale } from '@/lib/lroute';
import { AnimatePresence, motion } from 'framer-motion';
import {
    ArrowRight,
    Fish,
    Info,
    MapPin,
    Trophy,
    Users,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface MapSectionProps {
    provincesData: ProvinceStatItem[];
    rankedProvinces: Array<{
        rank: number;
        id: number;
        name: string;
        farmer_count: number;
    }>;
    fishCategories: Array<{
        id: number;
        name: string;
        slug: string;
        icon: string | null;
    }>;
    fisheryFacts?: Array<{
        title: string;
        description: string;
    }>;
}

export default function MapSection({
    provincesData = [],
    rankedProvinces: _initialRanked = [],
    fishCategories = [],
    fisheryFacts = [],
}: MapSectionProps) {
    const { isEn, lp } = useLocale();
    const [activeCategory, setActiveCategory] = useState<string>('all');
    const [selectedProvince, setSelectedProvince] =
        useState<ProvinceStatItem | null>(null);

    // Filter komoditas tab besar: Semua, Lele, Nila, Mas, lalu sisa kategori
    const filterOptions = [
        { slug: 'all', name: isEn ? 'All Commodities' : 'Semua Komoditas' },
        ...fishCategories.map((c) => ({ slug: c.slug, name: c.name })),
    ];

    // Hitung total untuk kategori aktif
    const totalForCategory = provincesData.reduce((acc, curr) => {
        return acc + (curr.by_category[activeCategory] ?? curr.farmer_count);
    }, 0);

    // Hitung 5 provinsi teratas berdasarkan kategori aktif
    const topFiveProvinces = [...provincesData]
        .map((p) => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            count: p.by_category[activeCategory] ?? p.farmer_count,
        }))
        .filter((p) => p.count > 0)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    // Rotasi Fakta Perikanan Hari Ini
    const [factIndex, setFactIndex] = useState(0);
    useEffect(() => {
        if (!fisheryFacts || fisheryFacts.length <= 1) return;
        const interval = setInterval(() => {
            setFactIndex((prev) => (prev + 1) % fisheryFacts.length);
        }, 7000);
        return () => clearInterval(interval);
    }, [fisheryFacts]);

    const activeFact = fisheryFacts[factIndex] || fisheryFacts[0];

    return (
        <Section
            id="peta-sebaran"
            index="02"
            label={isEn ? 'Fish Farmer Distribution Map' : 'Peta Sebaran Pembudidaya'}
            tone="mist"
            bleed={true}
            className="!pb-16 relative"
        >
            <Container className="mb-10">
                <SectionHeading
                    eyebrow={isEn ? 'Real-Time Sectoral Data' : 'Data Sektoral Real-Time'}
                    title={
                        isEn
                            ? 'Indonesian Fish Farmer Distribution Map'
                            : 'Peta Sebaran Pembudidaya Nusantara'
                    }
                    description={
                        isEn
                            ? 'Track pond operators, smallholder aquaculture hubs, and regional executive networks across 38 provinces in Indonesia.'
                            : 'Pantau konsentrasi petambak, sentra budidaya kolam rakyat, dan jejaring kepengurusan wilayah di 38 provinsi Indonesia.'
                    }
                />

                {/* Tab Besar Kategori Ikan */}
                <div className="mt-8 flex flex-wrap items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                    {filterOptions.map((cat) => {
                        const isSelected = activeCategory === cat.slug;
                        return (
                            <button
                                key={cat.slug}
                                type="button"
                                onClick={() => {
                                    setActiveCategory(cat.slug);
                                    setSelectedProvince(null);
                                }}
                                className={cx(
                                    'inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs sm:text-sm font-semibold transition-all duration-200',
                                    isSelected
                                        ? 'bg-navy text-white shadow-soft ring-2 ring-navy/20'
                                        : 'border border-line bg-white text-ink hover:border-ocean/40 hover:bg-white/90'
                                )}
                            >
                                <Fish
                                    className={cx(
                                        'h-3.5 w-3.5',
                                        isSelected ? 'text-aqua' : 'text-ocean'
                                    )}
                                />
                                {cat.name}
                            </button>
                        );
                    })}
                </div>
            </Container>

            {/* Lebar Penuh Tembus Kontainer */}
            <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8 items-start">
                    {/* Panel Kontrol Mengambang di Kiri (5 kolom pada LG) */}
                    <div className="lg:col-span-4 space-y-4">
                        {/* Box 1: Total Angka & Top 5 Provinsi */}
                        <div className="rounded-card border border-line bg-white p-5 sm:p-6 shadow-soft">
                            <div className="flex items-center justify-between border-b border-line pb-4">
                                <div>
                                    <span className="text-xs font-semibold uppercase tracking-wider text-slate">
                                        {isEn ? 'Total Fish Farmers' : 'Total Pembudidaya'}
                                    </span>
                                    <div className="font-display text-3xl font-bold tracking-tight text-navy">
                                        <CountUp to={totalForCategory} />
                                        <span className="text-sm font-medium text-slate ml-1">
                                            {isEn ? 'farmers' : 'orang'}
                                        </span>
                                    </div>
                                </div>
                                <span className="rounded-full bg-ocean/10 p-2 text-ocean">
                                    <Users className="h-5 w-5" />
                                </span>
                            </div>

                            {/* Peringkat 5 Provinsi Teratas */}
                            <div className="mt-5">
                                <div className="mb-3 flex items-center justify-between text-xs font-bold text-slate uppercase tracking-wider">
                                    <span className="flex items-center gap-1.5 text-navy">
                                        <Trophy className="h-3.5 w-3.5 text-amber-500" />
                                        {isEn ? 'Top 5 Provinces' : '5 Provinsi Terbanyak'}
                                    </span>
                                    <span>{isEn ? 'Farmers' : 'Petambak'}</span>
                                </div>

                                <div className="space-y-2.5">
                                    {topFiveProvinces.map((prov, idx) => {
                                        const percentage =
                                            totalForCategory > 0
                                                ? Math.round((prov.count / totalForCategory) * 100)
                                                : 0;
                                        return (
                                            <div
                                                key={prov.id}
                                                className="group cursor-pointer rounded-lg p-2 transition-colors hover:bg-mist/70"
                                                onClick={() => {
                                                    const found = provincesData.find((p) => p.id === prov.id);
                                                    if (found) setSelectedProvince(found);
                                                }}
                                            >
                                                <div className="flex items-center justify-between text-xs sm:text-sm">
                                                    <span className="font-medium text-ink group-hover:text-ocean flex items-center gap-2">
                                                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-mist text-[11px] font-bold text-slate">
                                                            {idx + 1}
                                                        </span>
                                                        {prov.name}
                                                    </span>
                                                    <span className="font-bold text-navy">
                                                        {prov.count.toLocaleString('id-ID')}
                                                    </span>
                                                </div>
                                                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-mist">
                                                    <div
                                                        className="h-full rounded-full bg-ocean transition-all duration-500"
                                                        style={{ width: `${Math.max(percentage, 6)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Fakta Perikanan Hari Ini Card */}
                        {activeFact ? (
                            <div className="rounded-card border border-line border-l-4 border-l-aqua bg-white p-5 shadow-xs">
                                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ocean">
                                    <Info className="h-3.5 w-3.5 text-aqua" />
                                    {isEn ? "Today's Fisheries Fact" : 'Fakta Perikanan Hari Ini'}
                                </div>
                                <h3 className="mt-2 font-display text-sm font-bold text-navy">
                                    {activeFact.title}
                                </h3>
                                <p className="mt-1.5 text-xs text-slate leading-relaxed">
                                    {activeFact.description}
                                </p>
                            </div>
                        ) : null}
                    </div>

                    {/* Sisi Kanan: Peta Indonesia Interaktif (8 kolom pada LG) */}
                    <div className="lg:col-span-8 relative">
                        <IndonesiaMap
                            data={provincesData}
                            activeCategory={activeCategory}
                            selectedProvinceId={selectedProvince?.id}
                            onSelectProvince={(prov) => setSelectedProvince(prov)}
                            className="w-full bg-white shadow-soft"
                        />

                        {/* Panel Detail Provinsi (Tampil Saat Provinsi Diklik) */}
                        <AnimatePresence>
                            {selectedProvince ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 16 }}
                                    transition={{ duration: 0.25 }}
                                    className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 rounded-card border-2 border-ocean bg-white p-5 shadow-lift z-20"
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-ocean uppercase tracking-wider">
                                                <MapPin className="h-3 w-3" />
                                                {isEn ? 'Regional Detail' : 'Detail Wilayah'}
                                            </span>
                                            <h4 className="font-display text-lg font-bold text-navy">
                                                {selectedProvince.name}
                                            </h4>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setSelectedProvince(null)}
                                            className="rounded-full p-1 text-slate hover:bg-mist hover:text-navy"
                                            aria-label={isEn ? 'Close province detail' : 'Tutup detail provinsi'}
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>

                                    <div className="mt-3 border-y border-line py-3">
                                        <div className="flex items-baseline justify-between">
                                            <span className="text-xs text-slate">
                                                {isEn ? 'Registered Farmers:' : 'Total Petambak Terdaftar:'}
                                            </span>
                                            <span className="font-display text-lg font-bold text-navy">
                                                {selectedProvince.farmer_count.toLocaleString('id-ID')}
                                            </span>
                                        </div>

                                        {/* Rincian Komoditas */}
                                        <div className="mt-2.5 space-y-1 text-xs">
                                            <div className="font-semibold text-slate mb-1">
                                                {isEn ? 'Commodity Breakdown:' : 'Rincian Komoditas:'}
                                            </div>
                                            {Object.entries(selectedProvince.by_category).slice(0, 4).map(([catKey, count]) => (
                                                <div key={catKey} className="flex justify-between text-slate">
                                                    <span className="capitalize">{catKey}:</span>
                                                    <span className="font-semibold text-ink">
                                                        {count.toLocaleString('id-ID')} {isEn ? 'farmers' : 'petambak'}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <Button
                                            href={lp(`/organisasi/dpw?provinsi=${selectedProvince.slug}`)}
                                            variant="secondary"
                                            size="sm"
                                            className="w-full justify-center !text-ocean hover:!bg-ocean hover:!text-white font-semibold"
                                            icon={<ArrowRight className="h-3.5 w-3.5" />}
                                        >
                                            {isEn
                                                ? `Open DPW ${selectedProvince.name}`
                                                : `Buka Halaman DPW ${selectedProvince.name}`}
                                        </Button>
                                    </div>
                                </motion.div>
                            ) : null}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </Section>
    );
}
