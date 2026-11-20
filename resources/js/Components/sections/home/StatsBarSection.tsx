import CountUp from '@/Components/motion/CountUp';
import { RevealGroup, RevealItem } from '@/Components/motion/Reveal';

interface StatsBarSectionProps {
    stats: {
        total_members: number;
        total_provinces: number;
        total_dpcs: number;
        total_products: number;
    };
}

export default function StatsBarSection({ stats }: StatsBarSectionProps) {
    const items = [
        {
            value: stats.total_members,
            suffix: '+',
            label: 'Anggota Terverifikasi',
            sub: 'Pembudidaya, nelayan & UMKM',
        },
        {
            value: stats.total_provinces,
            suffix: '',
            label: 'Provinsi Terjangkau',
            sub: 'Kepengurusan DPW daerah',
        },
        {
            value: stats.total_dpcs,
            suffix: '',
            label: 'DPC Kabupaten / Kota',
            sub: 'Sentra produksi perikanan',
        },
        {
            value: stats.total_products,
            suffix: '+',
            label: 'Ragam Produk & Spot',
            sub: 'Pakan, bibit, sewa & wisata',
        },
    ];

    return (
        <section
            aria-label="Statistik Angka Utama"
            className="border-y border-line bg-white py-12 md:py-16"
        >
            <div className="container-page">
                {/* Framer: reveal per kolom. anime.js: angka di dalam <CountUp>. */}
                <RevealGroup className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-4 md:gap-0 md:divide-x md:divide-line">
                    {items.map((item) => (
                        <RevealItem
                            key={item.label}
                            className="flex min-w-0 flex-col items-start md:px-8 md:first:pl-0 md:last:pr-0"
                        >
                            <p className="t-stat text-navy">
                                <CountUp to={item.value} suffix={item.suffix} />
                            </p>
                            <p className="mt-3 text-sm font-bold text-ink">
                                {item.label}
                            </p>
                            <p className="mt-1 text-xs text-slate">{item.sub}</p>
                        </RevealItem>
                    ))}
                </RevealGroup>
            </div>
        </section>
    );
}
