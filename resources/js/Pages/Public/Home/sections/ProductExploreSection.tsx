import Section from '@/Components/layout/Section';
import SectionHeading from '@/Components/layout/SectionHeading';
import Button from '@/Components/ui/Button';
import { useSiteMedia } from '@/hooks/useSiteMedia';
import { homeMedia } from '@/lib/homeMedia';
import { cx } from '@/lib/cx';
import { useLocale } from '@/lib/lroute';
import { Link } from '@inertiajs/react';
import { ArrowRight, Compass, Fish, Layers, Package, Waves } from 'lucide-react';
import { useState } from 'react';

export interface FeaturedProductItem {
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
    products?: FeaturedProductItem[];
}

export default function ProductExploreSection({
    products = [],
}: ProductExploreSectionProps) {
    const { isEn, lp } = useLocale();
    const { media } = useSiteMedia();
    const [activePanel, setActivePanel] = useState<number | null>(null);

    const portals = [
        {
            id: 0,
            title: isEn ? 'Freshwater Aquaculture' : 'Budidaya Air Tawar',
            group: 'freshwater',
            tag: isEn ? 'Most Popular' : 'Paling Populer',
            description: isEn
                ? 'Freshwater pond, biofloc, and floating net cage commodity centers with fast harvest turnover.'
                : 'Sentra komoditas kolam air tenang, bioflok, dan karamba jaring apung dengan perputaran panen cepat.',
            subCategories: isEn
                ? [
                      'Black & Red Tilapia',
                      'Sangkuriang Catfish',
                      'Common Carp & Gourami',
                      'Commercial Floating Feed',
                      'Biofloc Liners & Aerators',
                  ]
                : [
                      'Nila Hitam & Merah',
                      'Lele Sangkuriang',
                      'Ikan Mas & Gurame',
                      'Pakan Apung Komersial',
                      'Terpal & Aerator Bioflok',
                  ],
            image: media('explore_freshwater', homeMedia.products['air-tawar']),
            icon: Waves,
            href: lp('/produk?group=freshwater'),
        },
        {
            id: 1,
            title: isEn ? 'Mariculture & Saltwater' : 'Marikultur & Air Laut',
            group: 'saltwater',
            tag: isEn ? 'Coastal & Marine' : 'Pesisir Bahari',
            description: isEn
                ? 'Coastal and open-sea aquaculture: intensive vannamei shrimp ponds, milkfish fry, and export-grade grouper.'
                : 'Potensi pesisir dan laut terbuka: tambak payau udang vaname intensif, bibit bandeng, dan kerapu berkualitas ekspor.',
            subCategories: isEn
                ? [
                      'Intensive Vannamei Shrimp',
                      'Milkfish Fry & Saltwater',
                      'Grouper & Barramundi',
                      'Natural Bait & Supplements',
                      'Coastal Pond Equipment',
                  ]
                : [
                      'Udang Vaname Intensif',
                      'Nener & Bandeng Salin',
                      'Kerapu & Kakap Putih',
                      'Umpan Alami & Suplemen',
                      'Peralatan Tambak Pesisir',
                  ],
            image: media('explore_saltwater', homeMedia.products['air-laut']),
            icon: Compass,
            href: lp('/produk?group=saltwater'),
        },
        {
            id: 2,
            title: isEn ? 'Pond Inputs & Supplies' : 'Sarana & Kebutuhan Tambak',
            group: 'other',
            tag: isEn ? 'Production Support' : 'Dukungan Produksi',
            description: isEn
                ? 'Water quality enhancers, ammonia-degrading probiotics, natural feed, and field testing instruments.'
                : 'Penguat kualitas air, probiotik pengurai amonia, pakan alami, dan instrumen laboratorium lapangan.',
            subCategories: isEn
                ? [
                      'Multi-Strain Probiotics',
                      'Pure Coarse Salt',
                      'Agricultural Lime & Dolomite',
                      'Water Quality Test Kits',
                      'Harvest Nets & Gear',
                  ]
                : [
                      'Probiotik Multi-Strain',
                      'Garam Krosok Murni',
                      'Kapur Pertanian & Dolomit',
                      'Test Kit Kualitas Air',
                      'Jaring & Alat Panen',
                  ],
            image: media('explore_other', homeMedia.products['lain-lain']),
            icon: Package,
            href: lp('/produk?group=other'),
        },
    ];

    return (
        <Section
            id="jelajah-produk"
            index="04"
            label={isEn ? 'Explore Commodities' : 'Jelajah Komoditas'}
            tone="white"
            bleed={false}
            className="border-b border-line"
        >
            <SectionHeading
                eyebrow={isEn ? 'Market Access & Inputs' : 'Akses Pasar & Sarana'}
                title={
                    isEn
                        ? 'Aquaculture & Marine Product Hub'
                        : 'Sentra Produk Budidaya & Bahari'
                }
                description={
                    isEn
                        ? 'Connect your ponds to a trusted supply chain: certified seeds, quality feed, and wholesale buyers.'
                        : 'Hubungkan tambak Anda dengan rantai pasok tepercaya: bibit berizin, pakan berkualitas, hingga pembeli partai besar.'
                }
                align="split"
                actions={
                    <Link
                        href={lp('/produk')}
                        className="group inline-flex items-center gap-2 text-sm font-semibold text-ocean transition-colors hover:text-navy"
                    >
                        {isEn ? 'View Full Catalog' : 'Lihat Katalog Lengkap'}
                        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </Link>
                }
            />

            {/* Desktop: 3 Panel Tinggi yang MELEBAR saat Hover (flex-grow) */}
            <div className="mt-12 hidden md:flex gap-4 h-[500px]">
                {portals.map((portal) => {
                    const Icon = portal.icon;
                    return (
                        <div
                            key={portal.id}
                            onMouseEnter={() => setActivePanel(portal.id)}
                            onMouseLeave={() => setActivePanel(null)}
                            className={cx(
                                'group relative flex flex-col justify-end overflow-hidden rounded-card border border-line p-8 shadow-soft transition-all duration-500 ease-out',
                                activePanel === portal.id
                                    ? 'flex-[2.2] shadow-lift'
                                    : activePanel === null
                                    ? 'flex-1'
                                    : 'flex-1 opacity-90'
                            )}
                        >
                            {/* Background Image dengan Fallback Placeholder */}
                            <div className="absolute inset-0 -z-10 bg-navy">
                                {portal.image ? (
                                    <img
                                        src={portal.image}
                                        alt={portal.title}
                                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="h-full w-full bg-gradient-to-br from-navy via-navy to-ocean" />
                                )}
                                {/* Overlay Navy Tipis */}
                                <div className="absolute inset-0 bg-navy/65 transition-colors duration-300 group-hover:bg-navy/45" />
                                <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/50 to-transparent" />
                            </div>

                            {/* Badge Kategori Atas */}
                            <div className="absolute top-6 left-6 flex items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-xs">
                                    <Icon className="h-3.5 w-3.5 text-aqua" />
                                    {portal.tag}
                                </span>
                            </div>

                            {/* Konten Bawah */}
                            <div className="relative z-10 text-white">
                                <h3 className="font-display text-2xl lg:text-3xl font-bold tracking-tight text-white leading-tight">
                                    {portal.title}
                                </h3>

                                <p className="mt-2 text-xs lg:text-sm text-mist/90 leading-relaxed line-clamp-2">
                                    {portal.description}
                                </p>

                                {/* Sub-kategori yang Tampil / Melebar */}
                                <div className="mt-4 flex flex-wrap gap-1.5 pt-3 border-t border-white/20">
                                    {portal.subCategories.map((sub, i) => (
                                        <span
                                            key={i}
                                            className="rounded-md bg-white/15 px-2 py-0.5 text-[11px] font-medium text-white/90"
                                        >
                                            {sub}
                                        </span>
                                    ))}
                                </div>

                                <div className="mt-6">
                                    <Button
                                        href={portal.href}
                                        size="sm"
                                        className="!bg-aqua !text-navy hover:!bg-white font-bold"
                                        icon={<ArrowRight className="h-3.5 w-3.5" />}
                                    >
                                        {isEn ? 'Explore Products' : 'Jelajah Produk'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Mobile: Tiga Panel Bertumpuk */}
            <div className="mt-8 space-y-4 md:hidden">
                {portals.map((portal) => {
                    const Icon = portal.icon;
                    return (
                        <div
                            key={portal.id}
                            className="relative flex flex-col justify-end overflow-hidden rounded-card border border-line p-6 text-white min-h-[300px] shadow-soft"
                        >
                            <div className="absolute inset-0 -z-10 bg-navy">
                                {portal.image ? (
                                    <img
                                        src={portal.image}
                                        alt={portal.title}
                                        className="h-full w-full object-cover"
                                        loading="lazy"
                                    />
                                ) : null}
                                <div className="absolute inset-0 bg-navy/70" />
                                <div className="absolute inset-0 bg-gradient-to-t from-navy to-transparent" />
                            </div>

                            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-semibold text-white mb-2">
                                <Icon className="h-3 w-3 text-aqua" />
                                {portal.tag}
                            </span>

                            <h3 className="font-display text-xl font-bold text-white">
                                {portal.title}
                            </h3>

                            <p className="mt-1 text-xs text-mist/90 line-clamp-2">
                                {portal.description}
                            </p>

                            <div className="mt-3 flex flex-wrap gap-1">
                                {portal.subCategories.slice(0, 3).map((sub, i) => (
                                    <span
                                        key={i}
                                        className="rounded-sm bg-white/15 px-2 py-0.5 text-[10px] text-white/90"
                                    >
                                        {sub}
                                    </span>
                                ))}
                            </div>

                            <div className="mt-4">
                                <Button
                                    href={portal.href}
                                    size="sm"
                                    className="!bg-aqua !text-navy hover:!bg-white font-bold"
                                    icon={<ArrowRight className="h-3 w-3" />}
                                >
                                    {isEn ? 'Browse Category' : 'Telusuri Kategori'}
                                </Button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Sorotan Produk Unggulan */}
            {products && products.length > 0 ? (
                <div className="mt-14 pt-10 border-t border-line">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <Layers className="h-4 w-4 text-ocean" />
                            <h4 className="font-display text-base font-bold text-navy">
                                {isEn ? 'Latest Inputs & Harvests' : 'Sarana & Hasil Panen Terbaru'}
                            </h4>
                        </div>
                        <span className="text-xs text-slate">
                            {isEn ? 'Exclusive pricing for active NSA members' : 'Harga khusus anggota aktif NSA'}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                        {products.slice(0, 4).map((p) => (
                            <Link
                                key={p.id}
                                href={lp(`/produk/detail/${p.slug}`)}
                                className="group flex flex-col rounded-card border border-line bg-white p-3.5 shadow-xs transition-all duration-200 hover:border-ocean hover:shadow-soft"
                            >
                                <div className="relative aspect-square w-full overflow-hidden rounded-control bg-mist">
                                    {p.image ? (
                                        <img
                                            src={p.image}
                                            alt={p.name}
                                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-slate">
                                            <Fish className="h-8 w-8 text-ocean/30" />
                                        </div>
                                    )}
                                </div>
                                <div className="mt-3 flex-1 flex flex-col justify-between">
                                    <div>
                                        <span className="text-[10px] font-semibold text-ocean uppercase tracking-wider">
                                            {p.location}
                                        </span>
                                        <h5 className="mt-1 font-display text-sm font-bold text-navy line-clamp-1 group-hover:text-ocean">
                                            {p.name}
                                        </h5>
                                    </div>
                                    <div className="mt-2.5 pt-2 border-t border-line/60">
                                        <span className="font-display text-sm font-bold text-navy">
                                            Rp {p.price.toLocaleString('id-ID')}
                                        </span>
                                        {p.member_price ? (
                                            <div className="text-[11px] font-semibold text-ocean">
                                                {isEn ? 'Member:' : 'Anggota:'} Rp {p.member_price.toLocaleString('id-ID')}
                                            </div>
                                        ) : null}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            ) : null}
        </Section>
    );
}
