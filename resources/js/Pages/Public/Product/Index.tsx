import Container from '@/Components/layout/Container';
import { openCartDrawer } from '@/Components/layout/CartDrawer';
import PageHeader from '@/Components/layout/PageHeader';
import ContourPattern from '@/Components/motion/ContourPattern';
import Badge from '@/Components/ui/Badge';
import Button from '@/Components/ui/Button';
import EmptyState from '@/Components/ui/EmptyState';
import Input from '@/Components/ui/Input';
import Pagination from '@/Components/ui/Pagination';
import Select from '@/Components/ui/Select';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';
import { useSiteMedia } from '@/hooks/useSiteMedia';
import PublicLayout from '@/Layouts/PublicLayout';
import { cx } from '@/lib/cx';
import { homeMedia } from '@/lib/homeMedia';
import { focusRing } from '@/lib/ui';
import { Head, Link, router } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Compass,
    Filter,
    Fish,
    Loader2,
    MapPin,
    Package,
    RotateCcw,
    Search,
    ShoppingBag,
    SlidersHorizontal,
    Sparkles,
    Users,
    Waves,
    X,
} from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import { toast } from 'sonner';

interface CategoryChild {
    id: number;
    name: string;
    slug: string;
    group: string;
}

interface CategoryParent {
    id: number;
    name: string;
    slug: string;
    group: string;
    children?: CategoryChild[];
}

interface ProductItem {
    id: number;
    name: string;
    slug: string;
    type: 'physical' | 'rental' | 'spot' | 'community';
    type_label: string;
    price: number;
    member_price: number | null;
    effective_price: number;
    is_member_price_applied: boolean;
    stock: number;
    weight: number | null;
    location: string | null;
    category_name: string;
    category_slug: string | null;
    group: string | null;
    image: string | null;
}

interface PaginationData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

interface IndexProps {
    products: PaginationData<ProductItem>;
    filters: {
        search?: string;
        group?: string;
        category?: string;
        type?: string;
        min_price?: string;
        max_price?: string;
        location?: string;
        sort?: string;
    };
    categories: CategoryParent[];
    locations: string[];
    activeGroup: string | null;
    activeCategory: string | null;
}

const GROUP_PORTALS = [
    {
        value: 'freshwater',
        slug: 'air-tawar',
        label: 'Air Tawar',
        subtitle: 'Benih nila, lele, gurame, pakan apung, dan sarana kolam.',
        image: homeMedia.products['air-tawar'],
        icon: Waves,
        fallbackChips: [
            { label: 'Benih & Indukan', slug: 'benih-air-tawar' },
            { label: 'Pakan Apung', slug: 'pakan-air-tawar' },
            { label: 'Sewa Kolam', slug: 'sewa-kolam' },
        ],
    },
    {
        value: 'saltwater',
        slug: 'air-laut',
        label: 'Air Laut',
        subtitle: 'Udang vaname, bandeng, kerapu, marikultur, dan bahari.',
        image: homeMedia.products['air-laut'],
        icon: Compass,
        fallbackChips: [
            { label: 'Tambak Payau', slug: 'tambak-payau' },
            { label: 'Komoditas Laut', slug: 'komoditas-laut' },
            { label: 'Alat Tangkap', slug: 'alat-tangkap' },
        ],
    },
    {
        value: 'other',
        slug: 'lain-lain',
        label: 'Lain-lain',
        subtitle: 'Probiotik, suplemen air, aerator, dan kemitraan budidaya.',
        image: homeMedia.products['lain-lain'],
        icon: Package,
        fallbackChips: [
            { label: 'Probiotik & Vitamin', slug: 'probiotik' },
            { label: 'Alat Kualitas Air', slug: 'alat-kualitas-air' },
            { label: 'Kemitraan', slug: 'kemitraan' },
        ],
    },
] as const;

const SORT_OPTIONS = [
    { label: 'Terbaru', value: 'newest' },
    { label: 'Harga: Terendah ke Tertinggi', value: 'price_asc' },
    { label: 'Harga: Tertinggi ke Terendah', value: 'price_desc' },
];

const PRODUCT_TYPES = [
    { label: 'Semua Tipe', value: '' },
    { label: 'Produk Fisik (Pakan & Bibit)', value: 'physical' },
    { label: 'Sewa Kolam & Alat', value: 'rental' },
    { label: 'Spot Pemancingan', value: 'spot' },
    { label: 'Komunitas & Kemitraan', value: 'community' },
];

/**
 * Variasi bentuk sudut foto 4:3 Garis Pantai agar grid tidak monoton.
 */
function getPhotoRadiusClass(index: number, isSpotlight: boolean): string {
    if (isSpotlight) {
        return 'rounded-t-[32px] rounded-b-card';
    }
    const mod = index % 3;
    if (mod === 0) return 'rounded-t-[28px] rounded-b-card';
    if (mod === 1)
        return 'rounded-tl-[26px] rounded-br-[26px] rounded-tr-control rounded-bl-control';
    return 'rounded-card';
}

export default function ProductIndex({
    products,
    filters,
    categories,
    locations,
    activeGroup,
}: IndexProps) {
    const reduced = usePrefersReducedMotion();
    const { media } = useSiteMedia();
    const [search, setSearch] = useState(filters.search || '');
    const [minPrice, setMinPrice] = useState(filters.min_price || '');
    const [maxPrice, setMaxPrice] = useState(filters.max_price || '');
    const [selectedType, setSelectedType] = useState(filters.type || '');
    const [selectedLocation, setSelectedLocation] = useState(
        filters.location || ''
    );
    const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
    const [addingId, setAddingId] = useState<number | null>(null);
    const [failedPortalImg, setFailedPortalImg] = useState<
        Record<string, boolean>
    >({});

    const applyFilter = (newParams: Record<string, string | null>) => {
        const query: Record<string, string | undefined> = {
            ...filters,
            search: search || undefined,
            min_price: minPrice || undefined,
            max_price: maxPrice || undefined,
            type: selectedType || undefined,
            location: selectedLocation || undefined,
        };

        Object.entries(newParams).forEach(([k, v]) => {
            query[k] = v ?? undefined;
        });

        Object.keys(query).forEach((key) => {
            if (!query[key]) {
                delete query[key];
            }
        });

        router.get('/produk', query, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleSearchSubmit = (e: FormEvent) => {
        e.preventDefault();
        applyFilter({ search: search || null, page: null });
    };

    const handleReset = () => {
        setSearch('');
        setMinPrice('');
        setMaxPrice('');
        setSelectedType('');
        setSelectedLocation('');
        router.get('/produk');
    };

    const handleQuickAddToCart = (prod: ProductItem) => {
        if (prod.type === 'physical' && prod.stock < 1) {
            toast.error('Stok produk ini sedang habis.');
            return;
        }

        const today = new Date().toISOString().split('T')[0];
        const defaultOptions =
            prod.type === 'rental'
                ? { start_date: today, duration: '1 bulan' }
                : prod.type === 'spot'
                ? { visit_date: today, tickets: 1 }
                : {};

        setAddingId(prod.id);
        router.post(
            '/keranjang/tambah',
            {
                product_id: prod.id,
                qty: 1,
                options: defaultOptions,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Ditambahkan ke keranjang', {
                        description: prod.name,
                    });
                    openCartDrawer();
                },
                onError: (errs) => {
                    const msg =
                        Object.values(errs)[0] ||
                        'Gagal menambahkan ke keranjang';
                    toast.error(msg as string);
                },
                onFinish: () => setAddingId(null),
            }
        );
    };

    // Kumpulkan sub-kategori per kelompok dari prop categories
    const subCategoriesByGroup = useMemo(() => {
        const map: Record<string, Array<{ label: string; slug: string }>> = {
            freshwater: [],
            saltwater: [],
            other: [],
        };

        categories.forEach((parent) => {
            const grp = parent.group || 'other';
            if (!map[grp]) map[grp] = [];
            map[grp].push({ label: parent.name, slug: parent.slug });
            parent.children?.forEach((child) => {
                const cGrp = child.group || grp;
                if (!map[cGrp]) map[cGrp] = [];
                map[cGrp].push({ label: child.name, slug: child.slug });
            });
        });

        return map;
    }, [categories]);

    // Kumpulkan nama kategori untuk ringkasan filter aktif
    const categoryLabelBySlug = useMemo(() => {
        const map = new Map<string, string>();
        categories.forEach((c) => {
            map.set(c.slug, c.name);
            c.children?.forEach((sub) => map.set(sub.slug, sub.name));
        });
        return map;
    }, [categories]);

    // Daftar chip filter aktif di atas hasil
    const activeFilterChips = useMemo(() => {
        const chips: Array<{
            key: string;
            label: string;
            onRemove: () => void;
        }> = [];

        if (activeGroup) {
            const g = GROUP_PORTALS.find((p) => p.value === activeGroup);
            chips.push({
                key: 'group',
                label: `Kelompok: ${g?.label ?? activeGroup}`,
                onRemove: () =>
                    applyFilter({ group: null, category: null, page: null }),
            });
        }

        if (filters.category) {
            chips.push({
                key: 'category',
                label: `Kategori: ${
                    categoryLabelBySlug.get(filters.category) ??
                    filters.category
                }`,
                onRemove: () => applyFilter({ category: null, page: null }),
            });
        }

        if (filters.type) {
            const t = PRODUCT_TYPES.find((pt) => pt.value === filters.type);
            chips.push({
                key: 'type',
                label: `Tipe: ${t?.label ?? filters.type}`,
                onRemove: () => {
                    setSelectedType('');
                    applyFilter({ type: null, page: null });
                },
            });
        }

        if (filters.location) {
            chips.push({
                key: 'location',
                label: `Lokasi: ${filters.location}`,
                onRemove: () => {
                    setSelectedLocation('');
                    applyFilter({ location: null, page: null });
                },
            });
        }

        if (filters.min_price || filters.max_price) {
            const minStr = filters.min_price
                ? `Rp ${Number(filters.min_price).toLocaleString('id-ID')}`
                : '0';
            const maxStr = filters.max_price
                ? `Rp ${Number(filters.max_price).toLocaleString('id-ID')}`
                : '∞';
            chips.push({
                key: 'price',
                label: `Harga: ${minStr} – ${maxStr}`,
                onRemove: () => {
                    setMinPrice('');
                    setMaxPrice('');
                    applyFilter({
                        min_price: null,
                        max_price: null,
                        page: null,
                    });
                },
            });
        }

        if (filters.search) {
            chips.push({
                key: 'search',
                label: `Cari: "${filters.search}"`,
                onRemove: () => {
                    setSearch('');
                    applyFilter({ search: null, page: null });
                },
            });
        }

        return chips;
    }, [
        activeGroup,
        filters.category,
        filters.type,
        filters.location,
        filters.min_price,
        filters.max_price,
        filters.search,
        categoryLabelBySlug,
    ]);

    const activePortal = GROUP_PORTALS.find((g) => g.value === activeGroup);

    const renderFilterControls = (isMobile = false) => (
        <div className="space-y-6">
            {/* Kategori */}
            <div>
                <h3 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-navy">
                    Kategori
                </h3>
                <div className="max-h-56 space-y-1 overflow-y-auto pr-1 text-xs">
                    <button
                        type="button"
                        onClick={() => {
                            applyFilter({ category: null, page: null });
                            if (isMobile) setMobileFilterOpen(false);
                        }}
                        className={cx(
                            'block w-full rounded-control px-2.5 py-2 text-left transition-colors',
                            !filters.category
                                ? 'bg-navy font-bold text-white'
                                : 'text-slate hover:bg-mist hover:text-navy'
                        )}
                    >
                        Semua Kategori
                    </button>
                    {categories.map((cat) => (
                        <div key={cat.id} className="pt-1">
                            <button
                                type="button"
                                onClick={() => {
                                    applyFilter({
                                        category: cat.slug,
                                        page: null,
                                    });
                                    if (isMobile) setMobileFilterOpen(false);
                                }}
                                className={cx(
                                    'block w-full rounded-control px-2.5 py-1.5 text-left text-xs font-bold transition-colors',
                                    filters.category === cat.slug
                                        ? 'bg-ocean/10 text-ocean'
                                        : 'text-ink hover:bg-mist/60 hover:text-navy'
                                )}
                            >
                                {cat.name}
                            </button>
                            {cat.children && cat.children.length > 0 ? (
                                <div className="ml-2.5 mt-1 space-y-0.5 border-l border-line pl-2.5">
                                    {cat.children.map((sub) => (
                                        <button
                                            key={sub.id}
                                            type="button"
                                            onClick={() => {
                                                applyFilter({
                                                    category: sub.slug,
                                                    page: null,
                                                });
                                                if (isMobile)
                                                    setMobileFilterOpen(false);
                                            }}
                                            className={cx(
                                                'block w-full rounded-control px-2 py-1.5 text-left text-xs transition-colors',
                                                filters.category === sub.slug
                                                    ? 'bg-ocean/10 font-bold text-ocean'
                                                    : 'text-slate hover:bg-mist/50 hover:text-navy'
                                            )}
                                        >
                                            {sub.name}
                                        </button>
                                    ))}
                                </div>
                            ) : null}
                        </div>
                    ))}
                </div>
            </div>

            {/* Tipe Produk */}
            <div className="border-t border-line pt-5">
                <h3 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-navy">
                    Tipe Produk &amp; Layanan
                </h3>
                <div className="space-y-2">
                    {PRODUCT_TYPES.map((t) => (
                        <label
                            key={t.value}
                            className="flex cursor-pointer items-center gap-2.5 text-xs text-ink hover:text-ocean"
                        >
                            <input
                                type="radio"
                                name={
                                    isMobile
                                        ? 'mobile_product_type'
                                        : 'desktop_product_type'
                                }
                                checked={selectedType === t.value}
                                onChange={() => {
                                    setSelectedType(t.value);
                                    if (!isMobile) {
                                        applyFilter({
                                            type: t.value || null,
                                            page: null,
                                        });
                                    }
                                }}
                                className="h-4 w-4 border-line text-ocean focus:ring-ocean"
                            />
                            <span className="font-medium">{t.label}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Rentang Harga */}
            <div className="border-t border-line pt-5">
                <h3 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-navy">
                    Rentang Harga (Rp)
                </h3>
                <div className="grid grid-cols-2 gap-2">
                    <Input
                        type="number"
                        placeholder="Min"
                        aria-label="Harga minimum"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="text-xs"
                    />
                    <Input
                        type="number"
                        placeholder="Maks"
                        aria-label="Harga maksimum"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="text-xs"
                    />
                </div>
                {!isMobile ? (
                    <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => applyFilter({ page: null })}
                        className="mt-2.5 w-full justify-center text-xs"
                    >
                        Terapkan Rentang Harga
                    </Button>
                ) : null}
            </div>

            {/* Lokasi */}
            {locations.length > 0 ? (
                <div className="border-t border-line pt-5">
                    <h3 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-navy">
                        Lokasi Sentra
                    </h3>
                    <Select
                        value={selectedLocation}
                        onChange={(e) => {
                            setSelectedLocation(e.target.value);
                            if (!isMobile) {
                                applyFilter({
                                    location: e.target.value || null,
                                    page: null,
                                });
                            }
                        }}
                        className="text-xs"
                        options={[
                            { value: '', label: 'Semua Lokasi' },
                            ...locations.map((loc) => ({
                                value: loc,
                                label: loc,
                            })),
                        ]}
                    />
                </div>
            ) : null}
        </div>
    );

    return (
        <PublicLayout>
            <Head
                title={
                    activePortal
                        ? `Katalog ${activePortal.label} · Produk NSA`
                        : 'Katalog Produk & Sarana Budidaya · NSA'
                }
            />

            <PageHeader
                breadcrumbs={[
                    { label: 'Beranda', href: '/' },
                    { label: 'Produk', href: '/produk' },
                    ...(activePortal ? [{ label: activePortal.label }] : []),
                ]}
                eyebrow="Rantai Pasok & Kemitraan"
                title={
                    activePortal
                        ? `Sentra Produk ${activePortal.label}`
                        : 'Katalog Produk & Layanan Bahari'
                }
                description="Bibit unggul bersertifikat, pakan budidaya, sewa kolam, spot pemancingan, serta kemitraan komunitas resmi anggota NSA."
            >
                {/* Pencarian Cepat */}
                <form
                    onSubmit={handleSearchSubmit}
                    className="flex max-w-xl items-center gap-2"
                >
                    <div className="relative flex-1">
                        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari bibit nila, pakan apung, sewa tambak..."
                            aria-label="Cari produk"
                            className={cx(
                                'h-11 w-full rounded-control border border-line bg-white pl-10 pr-4 text-sm text-ink placeholder:text-slate focus:border-ocean',
                                focusRing
                            )}
                        />
                    </div>
                    <Button type="submit" size="md" className="h-11 px-5">
                        Cari
                    </Button>
                </form>
            </PageHeader>

            {/* Tiga Tab Besar Berfoto (Air Tawar, Air Laut, Lain-lain) */}
            <section
                aria-label="Kelompok Perairan Produk"
                className="border-b border-line bg-mist/40 py-6 sm:py-8"
            >
                <Container>
                    <div className="mb-3 flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate">
                            Pilih Kelompok Perairan
                        </span>
                        {activeGroup ? (
                            <button
                                type="button"
                                onClick={() =>
                                    applyFilter({
                                        group: null,
                                        category: null,
                                        page: null,
                                    })
                                }
                                className="text-xs font-semibold text-ocean hover:text-navy"
                            >
                                Tampilkan Semua Kelompok
                            </button>
                        ) : null}
                    </div>

                    <div className="flex flex-col gap-3 md:flex-row md:items-stretch">
                        {GROUP_PORTALS.map((portal) => {
                            const Icon = portal.icon;
                            const isActive = activeGroup === portal.value;
                            const portalImage = media(
                                portal.value === 'freshwater'
                                    ? 'explore_freshwater'
                                    : portal.value === 'saltwater'
                                      ? 'explore_saltwater'
                                      : 'explore_other',
                                portal.image
                            );
                            const subChips =
                                subCategoriesByGroup[portal.value]?.length > 0
                                    ? subCategoriesByGroup[portal.value]
                                    : portal.fallbackChips;

                            return (
                                <div
                                    key={portal.value}
                                    className={cx(
                                        'group relative isolate flex flex-col justify-between overflow-hidden rounded-card border bg-navy p-5 text-white transition-all duration-500 ease-out sm:p-6',
                                        isActive
                                            ? 'border-aqua shadow-lift md:flex-[2.2] min-h-[190px]'
                                            : 'border-line shadow-soft md:flex-1 min-h-[150px] hover:border-ocean'
                                    )}
                                >
                                    {/* Latar Foto + Kontur Fallback + Overlay Navy Tipis */}
                                    <div className="absolute inset-0 -z-10 bg-navy">
                                        {!failedPortalImg[portal.value] &&
                                        portalImage ? (
                                            <img
                                                src={portalImage}
                                                alt=""
                                                onError={() =>
                                                    setFailedPortalImg((p) => ({
                                                        ...p,
                                                        [portal.value]: true,
                                                    }))
                                                }
                                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                        ) : (
                                            <ContourPattern
                                                tone="aqua"
                                                opacity={0.28}
                                                rings={5}
                                                animate={false}
                                                className="absolute inset-0"
                                            />
                                        )}
                                        <div
                                            className={cx(
                                                'absolute inset-0 transition-colors duration-300',
                                                isActive
                                                    ? 'bg-gradient-to-r from-navy/75 via-navy/55 to-ocean/40'
                                                    : 'bg-navy/45 group-hover:bg-navy/30'
                                            )}
                                        />
                                    </div>

                                    <div className="flex items-start justify-between gap-3">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                applyFilter({
                                                    group: isActive
                                                        ? null
                                                        : portal.value,
                                                    category: null,
                                                    page: null,
                                                })
                                            }
                                            className="text-left focus:outline-none"
                                        >
                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-semibold text-aqua backdrop-blur-xs">
                                                <Icon className="h-3.5 w-3.5" />
                                                {isActive
                                                    ? 'Kelompok Aktif'
                                                    : 'Kelompok'}
                                            </span>
                                            <h2 className="mt-2 font-display text-xl font-bold tracking-tight text-white sm:text-2xl">
                                                {portal.label}
                                            </h2>
                                            <p className="mt-1 max-w-md text-xs leading-relaxed text-mist/85">
                                                {portal.subtitle}
                                            </p>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                applyFilter({
                                                    group: isActive
                                                        ? null
                                                        : portal.value,
                                                    category: null,
                                                    page: null,
                                                })
                                            }
                                            className={cx(
                                                'shrink-0 rounded-full px-3 py-1 text-[11px] font-bold transition-colors',
                                                focusRing,
                                                isActive
                                                    ? 'bg-aqua text-navy'
                                                    : 'bg-white/15 text-white hover:bg-white/25'
                                            )}
                                        >
                                            {isActive ? 'Aktif' : 'Pilih'}
                                        </button>
                                    </div>

                                    {/* Sub-kategori sebagai Chip saat Tab Aktif */}
                                    {isActive ? (
                                        <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-white/15 pt-3.5">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    applyFilter({
                                                        group: portal.value,
                                                        category: null,
                                                        page: null,
                                                    })
                                                }
                                                className={cx(
                                                    'rounded-full px-3 py-1 text-xs font-semibold transition-colors',
                                                    !filters.category
                                                        ? 'bg-white text-navy'
                                                        : 'bg-white/15 text-white hover:bg-white/25'
                                                )}
                                            >
                                                Semua {portal.label}
                                            </button>
                                            {subChips.map((chip) => {
                                                const chipActive =
                                                    filters.category ===
                                                    chip.slug;
                                                return (
                                                    <button
                                                        key={chip.slug}
                                                        type="button"
                                                        onClick={() =>
                                                            applyFilter({
                                                                group: portal.value,
                                                                category:
                                                                    chipActive
                                                                        ? null
                                                                        : chip.slug,
                                                                page: null,
                                                            })
                                                        }
                                                        className={cx(
                                                            'rounded-full px-3 py-1 text-xs font-semibold transition-colors',
                                                            chipActive
                                                                ? 'bg-aqua font-bold text-navy'
                                                                : 'bg-white/15 text-white hover:bg-white/25'
                                                        )}
                                                    >
                                                        {chip.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    ) : null}
                                </div>
                            );
                        })}
                    </div>
                </Container>
            </section>

            {/* Konten Katalog: Sidebar Filter Menempel + Grid Produk */}
            <Container className="py-10 sm:py-12">
                <div className="flex flex-col gap-10 lg:flex-row">
                    {/* Sidebar Kiri Menempel (Desktop) */}
                    <aside
                        className="hidden w-64 shrink-0 self-start lg:sticky lg:block"
                        style={{ top: 'calc(var(--header-h, 72px) + 20px)' }}
                    >
                        <div className="rounded-card border border-line bg-white p-5 shadow-soft">
                            <div className="mb-4 flex items-center justify-between border-b border-line pb-3">
                                <span className="flex items-center gap-2 font-display text-sm font-bold text-navy">
                                    <Filter className="h-4 w-4 text-ocean" />
                                    Filter Katalog
                                </span>
                                {activeFilterChips.length > 0 ? (
                                    <button
                                        type="button"
                                        onClick={handleReset}
                                        className="inline-flex items-center gap-1 text-xs font-semibold text-ocean hover:text-navy"
                                    >
                                        <RotateCcw className="h-3 w-3" />
                                        Reset
                                    </button>
                                ) : null}
                            </div>

                            {renderFilterControls(false)}
                        </div>
                    </aside>

                    {/* Kolom Utama Hasil Produk */}
                    <div className="min-w-0 flex-1">
                        {/* Baris Kontrol Atas: Tombol Bottom Sheet Mobile + Jumlah + Urutan */}
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setMobileFilterOpen(true)}
                                    className={cx(
                                        'inline-flex min-h-[40px] items-center gap-2 rounded-control border border-line bg-white px-3.5 py-2 text-xs font-bold text-navy shadow-xs lg:hidden',
                                        focusRing
                                    )}
                                >
                                    <SlidersHorizontal className="h-3.5 w-3.5 text-ocean" />
                                    Filter
                                    {activeFilterChips.length > 0 ? (
                                        <span className="rounded-full bg-ocean px-1.5 py-0.2 text-[10px] text-white">
                                            {activeFilterChips.length}
                                        </span>
                                    ) : null}
                                </button>
                                <p className="text-xs text-slate">
                                    Menampilkan{' '}
                                    <strong className="text-navy">
                                        {products.data.length}
                                    </strong>{' '}
                                    dari{' '}
                                    <strong className="text-navy">
                                        {products.total}
                                    </strong>{' '}
                                    produk
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <label
                                    htmlFor="product-sort"
                                    className="text-xs font-medium text-slate"
                                >
                                    Urutkan:
                                </label>
                                <select
                                    id="product-sort"
                                    value={filters.sort || 'newest'}
                                    onChange={(e) =>
                                        applyFilter({ sort: e.target.value })
                                    }
                                    className={cx(
                                        'h-10 rounded-control border border-line bg-white px-3 text-xs font-semibold text-navy focus:border-ocean',
                                        focusRing
                                    )}
                                >
                                    {SORT_OPTIONS.map((opt) => (
                                        <option
                                            key={opt.value}
                                            value={opt.value}
                                        >
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Ringkasan Filter Aktif sebagai Chip di Atas Hasil */}
                        {activeFilterChips.length > 0 ? (
                            <div
                                aria-label="Filter yang sedang aktif"
                                className="mt-4 flex flex-wrap items-center gap-2"
                            >
                                {activeFilterChips.map((chip) => (
                                    <span
                                        key={chip.key}
                                        className="inline-flex items-center gap-1.5 rounded-full border border-ocean/25 bg-ocean/10 px-3 py-1 text-xs font-semibold text-navy"
                                    >
                                        <span>{chip.label}</span>
                                        <button
                                            type="button"
                                            onClick={chip.onRemove}
                                            aria-label={`Hapus filter ${chip.label}`}
                                            className="rounded-full p-0.5 text-ocean hover:bg-ocean/20 hover:text-navy"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </span>
                                ))}
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="text-xs font-semibold text-slate underline hover:text-navy"
                                >
                                    Hapus semua
                                </button>
                            </div>
                        ) : null}

                        {/* Grid Produk Garis Pantai (Kartu Tanpa Bingkai Tebal + Kartu Sorotan 2 Kolom) */}
                        {products.data.length === 0 ? (
                            <div className="mt-8">
                                <EmptyState
                                    title="Tidak ada produk yang cocok"
                                    description="Ubah kata kunci pencarian atau bersihkan sebagian filter untuk melihat katalog lainnya."
                                    action={
                                        <Button
                                            size="sm"
                                            onClick={handleReset}
                                        >
                                            Bersihkan Semua Filter
                                        </Button>
                                    }
                                />
                            </div>
                        ) : (
                            <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
                                {products.data.map((prod, idx) => {
                                    // Produk pertama menjadi kartu sorotan 2 kolom bila daftar memiliki >= 4 item
                                    const isSpotlight =
                                        idx === 0 && products.data.length >= 4;
                                    const isOut =
                                        prod.type === 'physical' &&
                                        prod.stock < 1;
                                    const isAdding = addingId === prod.id;
                                    const radiusClass = getPhotoRadiusClass(
                                        idx,
                                        isSpotlight
                                    );

                                    return (
                                        <article
                                            key={prod.id}
                                            className={cx(
                                                'group flex flex-col justify-between transition-all duration-200',
                                                isSpotlight
                                                    ? 'sm:col-span-2 rounded-card bg-mist/55 p-4 sm:grid sm:grid-cols-12 sm:items-center sm:gap-6 sm:p-6'
                                                    : ''
                                            )}
                                        >
                                            {/* Foto 4:3 dengan Sudut Bergantian Halus */}
                                            <div
                                                className={cx(
                                                    'relative aspect-[4/3] w-full overflow-hidden bg-mist',
                                                    radiusClass,
                                                    isSpotlight
                                                        ? 'sm:col-span-6'
                                                        : ''
                                                )}
                                            >
                                                <Link
                                                    href={`/produk/detail/${prod.slug}`}
                                                    className="block h-full w-full"
                                                >
                                                    {prod.image ? (
                                                        <img
                                                            src={prod.image}
                                                            alt={prod.name}
                                                            loading={
                                                                idx < 3
                                                                    ? 'eager'
                                                                    : 'lazy'
                                                            }
                                                            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-mist via-white to-sky/15 text-slate">
                                                            <Fish className="h-10 w-10 text-ocean/35" />
                                                            <span className="mt-1 text-[11px] font-semibold text-slate">
                                                                {
                                                                    prod.category_name
                                                                }
                                                            </span>
                                                        </div>
                                                    )}
                                                </Link>

                                                {/* Label Tipe & Sorotan */}
                                                <div className="pointer-events-none absolute left-3 top-3 flex flex-wrap gap-1.5">
                                                    {isSpotlight ? (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-navy px-2.5 py-0.5 text-[10px] font-bold text-aqua shadow-xs">
                                                            <Sparkles className="h-3 w-3" />
                                                            Sorotan Katalog
                                                        </span>
                                                    ) : null}
                                                    <Badge
                                                        tone="neutral"
                                                        className="bg-white/95 text-[10px] px-2.5 py-0.5 shadow-xs"
                                                    >
                                                        {prod.type_label}
                                                    </Badge>
                                                </div>
                                            </div>

                                            {/* Informasi & Tombol Cepat */}
                                            <div
                                                className={cx(
                                                    'flex flex-1 flex-col justify-between',
                                                    isSpotlight
                                                        ? 'mt-4 sm:col-span-6 sm:mt-0'
                                                        : 'pt-3.5'
                                                )}
                                            >
                                                <div>
                                                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate">
                                                        <span className="font-semibold text-ocean">
                                                            {prod.category_name}
                                                        </span>
                                                        {prod.location ? (
                                                            <>
                                                                <span>·</span>
                                                                <span className="inline-flex items-center gap-1">
                                                                    <MapPin className="h-3 w-3 text-slate" />
                                                                    {
                                                                        prod.location
                                                                    }
                                                                </span>
                                                            </>
                                                        ) : null}
                                                    </div>

                                                    <h3
                                                        className={cx(
                                                            'mt-1 font-display font-bold text-navy transition-colors group-hover:text-ocean',
                                                            isSpotlight
                                                                ? 'text-xl sm:text-2xl leading-snug'
                                                                : 'text-base line-clamp-2 leading-snug'
                                                        )}
                                                    >
                                                        <Link
                                                            href={`/produk/detail/${prod.slug}`}
                                                        >
                                                            {prod.name}
                                                        </Link>
                                                    </h3>

                                                    {/* Harga Tebal & Label Harga Anggota */}
                                                    <div className="mt-3 flex flex-wrap items-baseline gap-2">
                                                        <span
                                                            className={cx(
                                                                'font-display font-extrabold tracking-tight text-navy',
                                                                isSpotlight
                                                                    ? 'text-2xl'
                                                                    : 'text-lg'
                                                            )}
                                                        >
                                                            Rp{' '}
                                                            {Number(
                                                                prod.effective_price
                                                            ).toLocaleString(
                                                                'id-ID'
                                                            )}
                                                        </span>

                                                        {prod.is_member_price_applied ? (
                                                            <>
                                                                <span className="text-xs text-slate line-through">
                                                                    Rp{' '}
                                                                    {Number(
                                                                        prod.price
                                                                    ).toLocaleString(
                                                                        'id-ID'
                                                                    )}
                                                                </span>
                                                                <span className="inline-flex items-center rounded-full bg-ocean/10 px-2 py-0.5 text-[10px] font-bold text-ocean">
                                                                    Harga
                                                                    Anggota
                                                                </span>
                                                            </>
                                                        ) : prod.member_price ? (
                                                            <span className="inline-flex items-center rounded-full bg-mist px-2 py-0.5 text-[10px] font-semibold text-ocean">
                                                                Harga Anggota:
                                                                Rp{' '}
                                                                {Number(
                                                                    prod.member_price
                                                                ).toLocaleString(
                                                                    'id-ID'
                                                                )}
                                                            </span>
                                                        ) : null}
                                                    </div>
                                                </div>

                                                {/* Baris Aksi Cepat */}
                                                <div className="mt-4 flex items-center gap-2 pt-2">
                                                    <button
                                                        type="button"
                                                        disabled={
                                                            isOut || isAdding
                                                        }
                                                        onClick={() =>
                                                            handleQuickAddToCart(
                                                                prod
                                                            )
                                                        }
                                                        className={cx(
                                                            'inline-flex min-h-[40px] flex-1 items-center justify-center gap-1.5 rounded-control px-3.5 py-2 text-xs font-bold transition-colors',
                                                            focusRing,
                                                            isOut
                                                                ? 'cursor-not-allowed bg-mist text-slate'
                                                                : 'bg-navy text-white hover:bg-ocean'
                                                        )}
                                                    >
                                                        {isAdding ? (
                                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                        ) : prod.type ===
                                                          'community' ? (
                                                            <Users className="h-3.5 w-3.5 text-aqua" />
                                                        ) : (
                                                            <ShoppingBag className="h-3.5 w-3.5 text-aqua" />
                                                        )}
                                                        <span>
                                                            {isOut
                                                                ? 'Stok Habis'
                                                                : prod.type ===
                                                                  'community'
                                                                ? 'Gabung'
                                                                : 'Tambah ke Keranjang'}
                                                        </span>
                                                    </button>

                                                    <Link
                                                        href={`/produk/detail/${prod.slug}`}
                                                        className={cx(
                                                            'inline-flex min-h-[40px] items-center justify-center rounded-control border border-line bg-white px-3 py-2 text-xs font-semibold text-navy transition-colors hover:border-ocean hover:text-ocean',
                                                            focusRing
                                                        )}
                                                    >
                                                        Detail
                                                    </Link>
                                                </div>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        )}

                        {/* Paginasi */}
                        <div className="mt-10 flex justify-center">
                            <Pagination
                                page={products.current_page}
                                lastPage={products.last_page}
                                onChange={(p: number) =>
                                    applyFilter({ page: p.toString() })
                                }
                            />
                        </div>
                    </div>
                </div>
            </Container>

            {/* Mobile Filter Bottom Sheet */}
            <AnimatePresence>
                {mobileFilterOpen ? (
                    <div className="fixed inset-0 z-50 lg:hidden">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: reduced ? 0 : 0.2 }}
                            onClick={() => setMobileFilterOpen(false)}
                            className="fixed inset-0 bg-ink/40 backdrop-blur-xs"
                        />

                        <motion.div
                            initial={{ y: reduced ? 0 : '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: reduced ? 0 : '100%' }}
                            transition={{
                                type: 'spring',
                                damping: 28,
                                stiffness: 300,
                            }}
                            role="dialog"
                            aria-label="Filter Katalog Produk"
                            className="fixed inset-x-0 bottom-0 z-10 flex max-h-[85vh] flex-col rounded-t-2xl bg-white shadow-lift"
                        >
                            {/* Handle Bar */}
                            <div className="flex justify-center pt-3 pb-1">
                                <span className="h-1.5 w-12 rounded-full bg-line" />
                            </div>

                            <div className="flex items-center justify-between border-b border-line px-5 py-3">
                                <span className="font-display text-base font-bold text-navy">
                                    Filter Katalog Produk
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setMobileFilterOpen(false)}
                                    aria-label="Tutup filter"
                                    className="rounded-control p-1 text-slate hover:bg-mist hover:text-navy"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto px-5 py-4">
                                {renderFilterControls(true)}
                            </div>

                            <div className="flex gap-3 border-t border-line bg-white px-5 py-4">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="md"
                                    onClick={() => {
                                        handleReset();
                                        setMobileFilterOpen(false);
                                    }}
                                    className="flex-1 justify-center"
                                >
                                    Reset
                                </Button>
                                <Button
                                    type="button"
                                    size="md"
                                    onClick={() => {
                                        applyFilter({ page: null });
                                        setMobileFilterOpen(false);
                                    }}
                                    className="flex-1 justify-center"
                                >
                                    Terapkan Filter
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                ) : null}
            </AnimatePresence>
        </PublicLayout>
    );
}
