import { spring } from '@/animations/variants';
import CountUp from '@/Components/motion/CountUp';
import { RevealSection } from '@/Components/motion/Reveal';
import IndonesiaMap, {
    type ProvinceStatItem,
} from '@/Components/sections/home/IndonesiaMap';
import { cx } from '@/lib/cx';
import { motion } from 'framer-motion';
import { MapPin, Trophy, Users, X } from 'lucide-react';
import { useState } from 'react';

interface MapSectionProps {
    provincesData: ProvinceStatItem[];
    rankedProvinces: {
        rank: number;
        id: number;
        name: string;
        farmer_count: number;
    }[];
    fishCategories: {
        id: number;
        name: string;
        slug: string;
        icon: string | null;
    }[];
}

export default function MapSection({
    provincesData,
    rankedProvinces: _rankedProvinces,
    fishCategories,
}: MapSectionProps) {
    const [activeCategory, setActiveCategory] = useState<string>('all');
    const [selectedProvince, setSelectedProvince] =
        useState<ProvinceStatItem | null>(null);

    // Kategori filter utama: Semua, Lele, Nila, Mas + kategori lain
    const filterOptions = [
        { slug: 'all', name: 'Semua Komoditas' },
        ...fishCategories.map((c) => ({ slug: c.slug, name: c.name })),
    ];

    // Hitung total untuk kategori aktif
    const totalForCategory = provincesData.reduce((acc, curr) => {
        return acc + (curr.by_category[activeCategory] ?? curr.farmer_count);
    }, 0);

    // Hitung ranking realtime berdasarkan kategori aktif
    const activeRanked = [...provincesData]
        .map((p) => ({
            id: p.id,
            name: p.name,
            count: p.by_category[activeCategory] ?? p.farmer_count,
        }))
        .filter((p) => p.count > 0)
        .sort((a, b) => b.count - a.count)
        .slice(0, 7);

    return (
        <RevealSection
            id="peta-statistik"
            aria-labelledby="peta-title"
            className="border-b border-line bg-mist section"
        >
            <div className="container-page">
                {/* Header Section */}
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                    <div>
                        <p className="t-eyebrow text-ocean">
                            Peta Sebaran Nasional
                        </p>
                        <h2 id="peta-title" className="t-h2 mt-2">
                            Sebaran Pembudidaya & Potensi Perikanan
                        </h2>
                        <p className="measure mt-2 text-sm text-slate">
                            Eksplorasi data pembudidaya terverifikasi di seluruh
                            Indonesia. Arahkan kursor atau klik pada provinsi
                            untuk melihat perincian data daerah.
                        </p>
                    </div>

                    {/* Badge Total Nasional */}
                    <div className="flex items-center gap-3 rounded-card border border-line bg-white px-4 py-3 shadow-soft">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ocean/10 text-ocean">
                            <Users size={20} />
                        </div>
                        <div>
                            <p className="text-[11px] font-semibold text-slate">
                                Total Pembudidaya Terdata
                            </p>
                            <p className="font-display text-lg font-bold tabular-nums text-navy">
                                <CountUp to={totalForCategory} suffix=" Orang" />
                            </p>
                        </div>
                    </div>
                </div>

                {/* Filter Kategori Ikan Pills (Framer layoutId) */}
                <div className="mt-8 flex flex-wrap items-center gap-2">
                    <span className="mr-1 text-xs font-bold uppercase tracking-wider text-slate">
                        Pilih Komoditas:
                    </span>
                    {filterOptions.slice(0, 7).map((option) => {
                        const isActive = activeCategory === option.slug;
                        return (
                            <button
                                key={option.slug}
                                type="button"
                                onClick={() => {
                                    setActiveCategory(option.slug);
                                    setSelectedProvince(null);
                                }}
                                className={cx(
                                    'relative rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors',
                                    isActive
                                        ? 'text-white'
                                        : 'border border-line bg-white text-ink hover:border-ocean hover:text-ocean'
                                )}
                            >
                                {isActive ? (
                                    <motion.span
                                        layoutId="map-commodity-pill"
                                        transition={spring}
                                        className="absolute inset-0 rounded-full bg-navy shadow-soft"
                                    />
                                ) : null}
                                <span className="relative z-10">{option.name}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Layout Peta Kiri & Panel Peringkat Kanan */}
                <div className="mt-8 grid gap-8 lg:grid-cols-12">
                    {/* Sisi Kiri: Peta Interaktif (8 Kolom) */}
                    <div className="lg:col-span-8">
                        <IndonesiaMap
                            data={provincesData}
                            activeCategory={activeCategory}
                            selectedProvinceId={selectedProvince?.id}
                            onSelectProvince={setSelectedProvince}
                        />
                    </div>

                    {/* Sisi Kanan: Panel Peringkat & Detail Provinsi (4 Kolom) */}
                    <div className="flex flex-col gap-4 lg:col-span-4">
                        {/* Kartu Detail Provinsi Terpilih bila ada */}
                        {selectedProvince ? (
                            <div className="rounded-card border-2 border-ocean bg-white p-5 shadow-lift">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2">
                                        <MapPin
                                            size={18}
                                            className="text-ocean"
                                        />
                                        <h3 className="font-display text-lg font-bold text-navy">
                                            {selectedProvince.name}
                                        </h3>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setSelectedProvince(null)
                                        }
                                        className="rounded-full p-1 text-slate hover:bg-mist hover:text-ink"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>

                                <div className="mt-4 rounded-control bg-mist p-3">
                                    <p className="text-xs text-slate">
                                        Jumlah Pembudidaya (
                                        {activeCategory === 'all'
                                            ? 'Semua Komoditas'
                                            : activeCategory}
                                        ):
                                    </p>
                                    <p className="font-display text-2xl font-bold text-ocean">
                                        {(
                                            selectedProvince.by_category[
                                                activeCategory
                                            ] ?? selectedProvince.farmer_count
                                        ).toLocaleString('id-ID')}
                                        <span className="ml-1 text-xs font-normal text-slate">
                                            Orang
                                        </span>
                                    </p>
                                </div>

                                <div className="mt-4 space-y-2 text-xs">
                                    <p className="font-semibold text-ink">
                                        Rincian Komoditas Utama:
                                    </p>
                                    <div className="grid grid-cols-2 gap-2 text-slate">
                                        <span className="rounded border border-line p-1.5">
                                            Lele:{' '}
                                            {selectedProvince.by_category[
                                                'ikan-lele'
                                            ]?.toLocaleString('id-ID') ?? 0}
                                        </span>
                                        <span className="rounded border border-line p-1.5">
                                            Nila:{' '}
                                            {selectedProvince.by_category[
                                                'ikan-nila'
                                            ]?.toLocaleString('id-ID') ?? 0}
                                        </span>
                                        <span className="rounded border border-line p-1.5">
                                            Mas:{' '}
                                            {selectedProvince.by_category[
                                                'ikan-mas'
                                            ]?.toLocaleString('id-ID') ?? 0}
                                        </span>
                                        <span className="rounded border border-line p-1.5">
                                            Patin:{' '}
                                            {selectedProvince.by_category[
                                                'ikan-patin'
                                            ]?.toLocaleString('id-ID') ?? 0}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ) : null}

                        {/* Panel Peringkat Sentra Daerah */}
                        <div className="flex-1 rounded-card border border-line bg-white p-5 shadow-soft">
                            <div className="mb-4 flex items-center justify-between border-b border-line pb-3">
                                <h3 className="flex items-center gap-2 text-sm font-bold text-navy">
                                    <Trophy
                                        size={16}
                                        className="text-warning"
                                    />
                                    Peringkat Daerah Sentra
                                </h3>
                                <span className="text-[11px] text-slate">
                                    Top 7 Provinsi
                                </span>
                            </div>

                            <ul className="divide-y divide-line/60">
                                {activeRanked.map((item, idx) => {
                                    const isSelected =
                                        selectedProvince?.id === item.id;
                                    const percent =
                                        totalForCategory > 0
                                            ? (
                                                  (item.count /
                                                      totalForCategory) *
                                                  100
                                              ).toFixed(1)
                                            : '0';

                                    return (
                                        <li key={item.id}>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const found =
                                                        provincesData.find(
                                                            (p) =>
                                                                p.id === item.id
                                                        );
                                                    setSelectedProvince(
                                                        found ?? null
                                                    );
                                                }}
                                                className={cx(
                                                    'flex w-full items-center justify-between rounded-control px-2 py-2.5 text-left transition-colors',
                                                    isSelected
                                                        ? 'bg-mist font-semibold text-ocean'
                                                        : 'text-ink hover:bg-mist/70'
                                                )}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span
                                                        className={cx(
                                                            'flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold',
                                                            idx === 0
                                                                ? 'bg-warning/20 text-warning'
                                                                : idx === 1
                                                                  ? 'bg-sky/20 text-sky'
                                                                  : 'bg-mist text-slate'
                                                        )}
                                                    >
                                                        {idx + 1}
                                                    </span>
                                                    <span className="text-xs font-medium">
                                                        {item.name}
                                                    </span>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs font-bold text-navy">
                                                        {item.count.toLocaleString(
                                                            'id-ID'
                                                        )}
                                                    </p>
                                                    <p className="text-[10px] text-slate">
                                                        {percent}%
                                                    </p>
                                                </div>
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </RevealSection>
    );
}
