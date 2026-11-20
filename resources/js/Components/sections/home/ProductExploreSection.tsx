import { RevealGroup, RevealItem, RevealSection } from '@/Components/motion/Reveal';
import { Link } from '@inertiajs/react';
import { ArrowRight, Compass, Fish, Package, Waves } from 'lucide-react';

interface FeaturedProductItem {
    id: number;
    name: string;
    slug: string;
    description: string;
    price: number;
    member_price: number | null;
    location: string;
    type: string;
    category?: string;
    image?: string | null;
}

interface ProductExploreSectionProps {
    products: FeaturedProductItem[];
}

export default function ProductExploreSection({
    products,
}: ProductExploreSectionProps) {
    // 3 Pintu Masuk Kategori Utama (dengan tinggi tidak sama per design.md)
    const categoryPortals = [
        {
            title: 'Spot Air Tawar',
            desc: 'Pakan apung, bibit unggul nila & lele, sewa kolam pemancingan, serta komunitas budidaya.',
            href: '/produk?group=freshwater',
            icon: Waves,
            minHeight: 'min-h-[280px]',
            badge: 'Paling Diminati',
            color: 'from-navy via-navy-900 to-ocean',
        },
        {
            title: 'Spot Air Laut',
            desc: 'Umpan laut segar, sewa kapal nelayan GT tinggi, alat pancing profesional, dan marikultur.',
            href: '/produk?group=saltwater',
            icon: Compass,
            minHeight: 'min-h-[340px]',
            badge: 'Pesisir & Bahari',
            color: 'from-ocean via-navy to-navy-900',
        },
        {
            title: 'Kebutuhan & Lain-lain',
            desc: 'Probiotik kolam, vitamin multi-strain, garam krosok, dan peralatan pendukung tambak.',
            href: '/produk?group=other',
            icon: Package,
            minHeight: 'min-h-[260px]',
            badge: 'Sarana Produksi',
            color: 'from-slate via-navy to-ocean',
        },
    ];

    return (
        <RevealSection
            id="jelajah-produk"
            aria-labelledby="produk-title"
            className="border-b border-line bg-white section"
        >
            <div className="container-page">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                    <div>
                        <p className="t-eyebrow text-ocean">
                            Katalog & Layanan Usaha
                        </p>
                        <h2 id="produk-title" className="t-h2 mt-2">
                            Pintu Masuk Kebutuhan Perikanan
                        </h2>
                        <p className="measure mt-2 text-sm text-slate">
                            Temukan pakan bersertifikat, benih berkualitas, sewa
                            armada kapal, hingga spot kolam pemancingan terbaik.
                        </p>
                    </div>

                    <Link
                        href="/produk"
                        className="group inline-flex items-center gap-1.5 text-sm font-semibold text-ocean transition-colors hover:text-navy"
                    >
                        Lihat Seluruh Katalog
                        <ArrowRight size={16} className="transition-transform duration-150 group-hover:translate-x-1" />
                    </Link>
                </div>

                {/* 3 Panel Kategori Tidak Sama Tinggi dengan Stagger */}
                <RevealGroup className="mt-10 grid items-end gap-6 md:grid-cols-3">
                    {categoryPortals.map((portal) => {
                        const Icon = portal.icon;
                        return (
                            <RevealItem key={portal.title}>
                                <Link
                                    href={portal.href}
                                    className={`group relative flex flex-col justify-between overflow-hidden rounded-card bg-gradient-to-br ${portal.color} ${portal.minHeight} p-6 text-white shadow-soft transition-all duration-220 ease-brand hover:-translate-y-1 hover:shadow-lift`}
                                >
                                    <div className="flex items-start justify-between">
                                        <span className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-aqua backdrop-blur-sm">
                                            {portal.badge}
                                        </span>
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-transform duration-220 group-hover:scale-110">
                                            <Icon size={20} strokeWidth={1.75} />
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-display text-2xl font-bold tracking-tight text-white">
                                            {portal.title}
                                        </h3>
                                        <p className="mt-2 text-xs leading-relaxed text-mist/90">
                                            {portal.desc}
                                        </p>
                                        <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-aqua transition-transform duration-150 group-hover:translate-x-1">
                                            Buka Kategori &rarr;
                                        </span>
                                    </div>
                                </Link>
                            </RevealItem>
                        );
                    })}
                </RevealGroup>

                {/* Produk Unggulan Preview */}
                {products && products.length > 0 && (
                    <div className="mt-12">
                        <div className="mb-6 flex items-center justify-between border-t border-line pt-8">
                            <h3 className="font-display text-lg font-bold text-navy">
                                Produk &amp; Jasa Pilihan
                            </h3>
                            <span className="text-xs text-slate">
                                Harga khusus tersedia untuk anggota resmi
                            </span>
                        </div>

                        <RevealGroup className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {products.slice(0, 3).map((prod) => (
                                <RevealItem key={prod.id}>
                                    <Link
                                        href={`/produk/${prod.slug}`}
                                        className="group flex h-full flex-col justify-between rounded-card border border-line bg-white p-4 shadow-soft transition-all duration-220 ease-brand hover:-translate-y-1 hover:border-ocean/30 hover:shadow-lift"
                                    >
                                        <div>
                                            <div className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-control bg-mist">
                                                {prod.image ? (
                                                    <img
                                                        src={prod.image}
                                                        alt={prod.name}
                                                        loading="lazy"
                                                        className="h-full w-full object-cover transition-transform duration-300 ease-brand group-hover:scale-[1.04]"
                                                    />
                                                ) : (
                                                    <Fish
                                                        size={40}
                                                        className="text-sky/60 transition-transform duration-300 ease-brand group-hover:scale-[1.08]"
                                                    />
                                                )}
                                                {prod.category && (
                                                    <span className="absolute left-2 top-2 rounded-full border border-line bg-white/95 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ocean">
                                                        {prod.category}
                                                    </span>
                                                )}
                                            </div>

                                            <h4 className="mt-3 line-clamp-2 text-sm font-bold text-ink transition-colors group-hover:text-ocean">
                                                {prod.name}
                                            </h4>
                                            <p className="mt-1 line-clamp-2 text-xs text-slate">
                                                {prod.description}
                                            </p>
                                        </div>

                                        <div className="mt-4 border-t border-line/60 pt-3">
                                            <div className="flex items-baseline justify-between gap-2">
                                                <div>
                                                    <p className="font-display text-base font-bold text-navy">
                                                        Rp{' '}
                                                        {prod.price.toLocaleString(
                                                            'id-ID'
                                                        )}
                                                    </p>
                                                    {prod.member_price && (
                                                        <p className="text-[11px] font-semibold text-ocean">
                                                            Rp{' '}
                                                            {prod.member_price.toLocaleString(
                                                                'id-ID'
                                                            )}{' '}
                                                            (Harga Anggota)
                                                        </p>
                                                    )}
                                                </div>
                                                <span className="truncate text-[11px] text-slate">
                                                    {prod.location}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                </RevealItem>
                            ))}
                        </RevealGroup>
                    </div>
                )}
            </div>
        </RevealSection>
    );
}
