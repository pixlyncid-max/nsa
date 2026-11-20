import { spring } from '@/animations/variants';
import { RevealSection } from '@/Components/motion/Reveal';
import { cx } from '@/lib/cx';
import { motion } from 'framer-motion';
import { useState } from 'react';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

interface CategoryChartsSectionProps {
    categoryCharts: {
        distribution: {
            name: string;
            slug: string;
            count: number;
            color: string;
        }[];
        yearlyTrend: {
            year: string;
            lele: number;
            nila: number;
            mas: number;
        }[];
    };
}

export default function CategoryChartsSection({
    categoryCharts,
}: CategoryChartsSectionProps) {
    const [activeTab, setActiveTab] = useState<'trend' | 'distribution'>(
        'trend'
    );
    const [selectedCategory, setSelectedCategory] = useState<
        'lele' | 'nila' | 'mas'
    >('lele');

    const commodityDetails = {
        lele: {
            name: 'Ikan Lele (Clarias gariepinus)',
            growth: '+12,4% / tahun',
            sentra: 'Jawa Timur, Jawa Barat, Jawa Tengah',
            cycle: '60 - 90 Hari',
            characteristics:
                'Ketahanan tinggi, adaptif dengan sistem bioflok & kolam terpal sempit.',
        },
        nila: {
            name: 'Ikan Nila (Oreochromis niloticus)',
            growth: '+9,8% / tahun',
            sentra: 'Jawa Barat, Sumatera Barat, Sulawesi Selatan',
            cycle: '90 - 120 Hari',
            characteristics:
                'Permintaan konsumsi stabil, cocok di kolam air tenang dan sistem KJA danau.',
        },
        mas: {
            name: 'Ikan Mas (Cyprinus carpio)',
            growth: '+5,2% / tahun',
            sentra: 'Jawa Barat (Cirata & Jatiluhur), Sumatera Utara',
            cycle: '120 - 150 Hari',
            characteristics:
                'Komoditas bernilai ekonomis tinggi untuk kuliner tradisional dan spot pemancingan.',
        },
    };

    const activeDetail = commodityDetails[selectedCategory];

    return (
        <RevealSection
            id="grafik-kategori"
            aria-labelledby="grafik-title"
            className="border-b border-line bg-white section"
        >
            <div className="container-page">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                    <div>
                        <p className="t-eyebrow text-ocean">
                            Data Komoditas Unggulan
                        </p>
                        <h2 id="grafik-title" className="t-h2 mt-2">
                            Perbandingan & Tren Pertumbuhan Komoditas
                        </h2>
                        <p className="measure mt-2 text-sm text-slate">
                            Visualisasi volume pembudidaya nasional dan dinamika
                            adopsi komoditas dari tahun ke tahun.
                        </p>
                    </div>

                    {/* Tab Pilihan Grafik: Tren Tahunan vs Distribusi (Framer layoutId) */}
                    <div className="flex rounded-control border border-line bg-mist p-1">
                        {(
                            [
                                ['trend', 'Tren Tahunan (2022-2025)'],
                                ['distribution', 'Perbandingan Nasional'],
                            ] as const
                        ).map(([id, label]) => {
                            const active = activeTab === id;
                            return (
                                <button
                                    key={id}
                                    type="button"
                                    onClick={() => setActiveTab(id)}
                                    className={cx(
                                        'relative rounded-control px-4 py-1.5 text-xs font-semibold transition-colors',
                                        active
                                            ? 'text-navy'
                                            : 'text-slate hover:text-ink'
                                    )}
                                >
                                    {active ? (
                                        <motion.span
                                            layoutId="chart-mode-pill"
                                            transition={spring}
                                            className="absolute inset-0 rounded-control bg-white shadow-soft"
                                        />
                                    ) : null}
                                    <span className="relative z-10">{label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Sub Tab Pemilihan Komoditas untuk Detail */}
                <div className="mt-8 flex flex-wrap items-center gap-2">
                    <span className="mr-2 text-xs font-semibold text-slate">
                        Fokus Analisis:
                    </span>
                    {(['lele', 'nila', 'mas'] as const).map((catKey) => {
                        const isCatActive = selectedCategory === catKey;
                        const labels = {
                            lele: 'Ikan Lele',
                            nila: 'Ikan Nila',
                            mas: 'Ikan Mas',
                        };
                        return (
                            <button
                                key={catKey}
                                type="button"
                                onClick={() => setSelectedCategory(catKey)}
                                className={cx(
                                    'rounded-control px-4 py-2 text-xs font-bold transition-all',
                                    isCatActive
                                        ? 'bg-ocean text-white shadow-soft'
                                        : 'border border-line bg-white text-ink hover:border-ocean hover:text-ocean'
                                )}
                            >
                                {labels[catKey]}
                            </button>
                        );
                    })}
                </div>

                {/* Area Visualisasi Grafik */}
                <div className="mt-8 grid gap-8 lg:grid-cols-12">
                    {/* Grafik Recharts Utama (8 Kolom) */}
                    <div className="rounded-card border border-line bg-white p-6 shadow-soft lg:col-span-8">
                        <div className="mb-6 flex items-center justify-between">
                            <h3 className="font-display text-base font-bold text-navy">
                                {activeTab === 'trend'
                                    ? 'Dinamika Pertumbuhan Pembudidaya (Orang)'
                                    : 'Distribusi Volume Pembudidaya per Komoditas'}
                            </h3>
                            <span className="text-xs text-slate">
                                Sumber: Database NSA & BPS
                            </span>
                        </div>

                        <div className="h-72 w-full">
                            {activeTab === 'trend' ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart
                                        data={categoryCharts.yearlyTrend}
                                    >
                                        <defs>
                                            <linearGradient
                                                id="leleGrad"
                                                x1="0"
                                                y1="0"
                                                x2="0"
                                                y2="1"
                                            >
                                                <stop
                                                    offset="5%"
                                                    stopColor="#014081"
                                                    stopOpacity={0.4}
                                                />
                                                <stop
                                                    offset="95%"
                                                    stopColor="#014081"
                                                    stopOpacity={0}
                                                />
                                            </linearGradient>
                                            <linearGradient
                                                id="nilaGrad"
                                                x1="0"
                                                y1="0"
                                                x2="0"
                                                y2="1"
                                            >
                                                <stop
                                                    offset="5%"
                                                    stopColor="#056ED4"
                                                    stopOpacity={0.4}
                                                />
                                                <stop
                                                    offset="95%"
                                                    stopColor="#056ED4"
                                                    stopOpacity={0}
                                                />
                                            </linearGradient>
                                            <linearGradient
                                                id="masGrad"
                                                x1="0"
                                                y1="0"
                                                x2="0"
                                                y2="1"
                                            >
                                                <stop
                                                    offset="5%"
                                                    stopColor="#27AAE1"
                                                    stopOpacity={0.4}
                                                />
                                                <stop
                                                    offset="95%"
                                                    stopColor="#27AAE1"
                                                    stopOpacity={0}
                                                />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            stroke="#E1E9F2"
                                        />
                                        <XAxis
                                            dataKey="year"
                                            stroke="#5B6B7F"
                                            fontSize={12}
                                        />
                                        <YAxis
                                            stroke="#5B6B7F"
                                            fontSize={12}
                                            tickFormatter={(val) =>
                                                `${val / 1000}k`
                                            }
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#FFFFFF',
                                                borderColor: '#E1E9F2',
                                                borderRadius: '10px',
                                                boxShadow:
                                                    '0 8px 24px -12px rgba(1,64,129,.18)',
                                                fontSize: '12px',
                                            }}
                                            formatter={(value) => [
                                                `${Number(value).toLocaleString('id-ID')} Orang`,
                                                '',
                                            ]}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="lele"
                                            name="Ikan Lele"
                                            stroke="#014081"
                                            fillOpacity={1}
                                            fill="url(#leleGrad)"
                                            strokeWidth={2}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="nila"
                                            name="Ikan Nila"
                                            stroke="#056ED4"
                                            fillOpacity={1}
                                            fill="url(#nilaGrad)"
                                            strokeWidth={2}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="mas"
                                            name="Ikan Mas"
                                            stroke="#27AAE1"
                                            fillOpacity={1}
                                            fill="url(#masGrad)"
                                            strokeWidth={2}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={categoryCharts.distribution}
                                    >
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            stroke="#E1E9F2"
                                        />
                                        <XAxis
                                            dataKey="name"
                                            stroke="#5B6B7F"
                                            fontSize={11}
                                            interval={0}
                                        />
                                        <YAxis
                                            stroke="#5B6B7F"
                                            fontSize={12}
                                            tickFormatter={(val) =>
                                                `${val / 1000}k`
                                            }
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#FFFFFF',
                                                borderColor: '#E1E9F2',
                                                borderRadius: '10px',
                                                boxShadow:
                                                    '0 8px 24px -12px rgba(1,64,129,.18)',
                                                fontSize: '12px',
                                            }}
                                            formatter={(value) => [
                                                `${Number(value).toLocaleString('id-ID')} Pembudidaya`,
                                                'Total',
                                            ]}
                                        />
                                        <Bar
                                            dataKey="count"
                                            fill="#056ED4"
                                            radius={[6, 6, 0, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>

                        {/* Legenda Grafik */}
                        <div className="mt-4 flex flex-wrap items-center justify-center gap-6 border-t border-line pt-3 text-xs text-slate">
                            <span className="flex items-center gap-1.5">
                                <span className="h-3 w-3 rounded-full bg-navy" />
                                Ikan Lele
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="h-3 w-3 rounded-full bg-ocean" />
                                Ikan Nila
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="h-3 w-3 rounded-full bg-sky" />
                                Ikan Mas
                            </span>
                        </div>
                    </div>

                    {/* Ringkasan Profil Komoditas Terpilih (4 Kolom) */}
                    <div className="flex flex-col justify-between rounded-card border border-line bg-mist p-6 shadow-soft lg:col-span-4">
                        <div>
                            <span className="rounded-full bg-ocean/10 px-3 py-1 text-xs font-bold text-ocean">
                                Profil Budidaya
                            </span>
                            <h3 className="mt-3 font-display text-xl font-bold text-navy">
                                {activeDetail.name}
                            </h3>

                            <div className="mt-5 space-y-4 text-xs">
                                <div>
                                    <p className="font-semibold text-slate">
                                        Laju Pertumbuhan:
                                    </p>
                                    <p className="text-sm font-bold text-success">
                                        {activeDetail.growth}
                                    </p>
                                </div>
                                <div>
                                    <p className="font-semibold text-slate">
                                        Sentra Produksi Terbesar:
                                    </p>
                                    <p className="text-sm font-semibold text-ink">
                                        {activeDetail.sentra}
                                    </p>
                                </div>
                                <div>
                                    <p className="font-semibold text-slate">
                                        Siklus Pembesaran Panen:
                                    </p>
                                    <p className="text-sm font-semibold text-ink">
                                        {activeDetail.cycle}
                                    </p>
                                </div>
                                <div>
                                    <p className="font-semibold text-slate">
                                        Karakteristik & Teknologi:
                                    </p>
                                    <p className="mt-1 leading-relaxed text-slate">
                                        {activeDetail.characteristics}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 border-t border-line pt-4">
                            <p className="text-xs text-slate">
                                Ingin bermitra memasok hasil panen komoditas
                                ini?
                            </p>
                            <a
                                href="/kontak"
                                className="mt-2 inline-flex items-center text-xs font-bold text-ocean hover:underline"
                            >
                                Hubungi Divisi Kemitraan NSA &rarr;
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </RevealSection>
    );
}
