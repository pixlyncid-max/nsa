import { openCartDrawer } from '@/Components/layout/CartDrawer';
import Container from '@/Components/layout/Container';
import Badge from '@/Components/ui/Badge';
import Breadcrumb from '@/Components/ui/Breadcrumb';
import Button from '@/Components/ui/Button';
import Carousel from '@/Components/ui/Carousel';
import PublicLayout from '@/Layouts/PublicLayout';
import { cx } from '@/lib/cx';
import { focusRing } from '@/lib/ui';
import { Head, Link, router } from '@inertiajs/react';
import {
    Calendar,
    CheckCircle2,
    Clock,
    FileText,
    Fish,
    ListChecks,
    MapPin,
    MessageSquareQuote,
    Minus,
    Plus,
    Scale,
    ShieldCheck,
    ShoppingBag,
    Sparkles,
    Star,
    Ticket,
    Truck,
    Users,
} from 'lucide-react';
import { lazy, Suspense, useState } from 'react';
import { toast } from 'sonner';
import type { Swiper as SwiperType } from 'swiper';

const ProductGallerySwiper = lazy(
    () => import('@/Components/product/ProductGallerySwiper')
);

interface ProductImage {
    id: number;
    path: string;
}

interface ProductDetail {
    id: number;
    name: string;
    slug: string;
    type: 'physical' | 'rental' | 'spot' | 'community';
    type_label: string;
    description: string;
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
    images: ProductImage[];
}

interface RelatedProduct {
    id: number;
    name: string;
    slug: string;
    type: string;
    price: number;
    effective_price: number;
    is_member_price_applied: boolean;
    category_name?: string;
    location: string | null;
    image: string | null;
}

interface ShowProps {
    product: ProductDetail;
    relatedProducts: RelatedProduct[];
}

type DetailTab = 'description' | 'specs' | 'reviews';

export default function ProductShow({ product, relatedProducts }: ShowProps) {
    const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(
        null
    );
    const [activeSlide, setActiveSlide] = useState(0);
    const [activeTab, setActiveTab] = useState<DetailTab>('description');
    const [qty, setQty] = useState(1);
    const [adding, setAdding] = useState(false);

    // Opsi khusus untuk rental (sewa kolam / fasilitas)
    const [rentalStartDate, setRentalStartDate] = useState(
        new Date().toISOString().split('T')[0]
    );
    const [rentalDuration, setRentalDuration] = useState('1');

    // Opsi khusus untuk spot pemancingan
    const [spotVisitDate, setSpotVisitDate] = useState(
        new Date().toISOString().split('T')[0]
    );
    const [spotTicketCount, setSpotTicketCount] = useState(1);

    const isPhysical = product.type === 'physical';
    const isRental = product.type === 'rental';
    const isSpot = product.type === 'spot';
    const isCommunity = product.type === 'community';

    const isOutOfStock = isPhysical && product.stock < 1;

    const durationMonths = Math.max(1, Number(rentalDuration) || 1);
    const effectiveQty = isSpot
        ? spotTicketCount
        : isRental
        ? durationMonths
        : isCommunity
        ? 1
        : qty;

    const estimatedTotal = Number(product.effective_price) * effectiveQty;

    const buildOptions = () => {
        if (isRental) {
            return {
                start_date: rentalStartDate,
                duration: `${durationMonths} bulan`,
            };
        }
        if (isSpot) {
            return {
                visit_date: spotVisitDate,
                tickets: spotTicketCount,
            };
        }
        return {};
    };

    const handleAddToCart = (andCheckout = false) => {
        if (isOutOfStock) {
            toast.error('Maaf, stok produk ini sedang habis.');
            return;
        }

        setAdding(true);
        router.post(
            '/keranjang/tambah',
            {
                product_id: product.id,
                qty: effectiveQty,
                options: buildOptions(),
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Berhasil ditambahkan ke keranjang!', {
                        description: `${product.name} (${effectiveQty} unit)`,
                    });
                    if (andCheckout) {
                        router.visit('/checkout');
                    } else {
                        openCartDrawer();
                    }
                },
                onError: (errs) => {
                    const msg =
                        Object.values(errs)[0] ||
                        'Gagal menambahkan ke keranjang';
                    toast.error(msg as string);
                },
                onFinish: () => setAdding(false),
            }
        );
    };

    const imagesList = product.images.length > 0 ? product.images : [];

    const groupLabel =
        product.group === 'freshwater'
            ? 'Air Tawar'
            : product.group === 'saltwater'
            ? 'Air Laut'
            : 'Lain-lain';

    const groupSlug =
        product.group === 'freshwater'
            ? 'air-tawar'
            : product.group === 'saltwater'
            ? 'air-laut'
            : 'lain-lain';

    const specsRows = [
        { label: 'Kategori', value: product.category_name },
        { label: 'Kelompok Perairan', value: groupLabel },
        { label: 'Tipe Layanan', value: product.type_label },
        {
            label: 'Lokasi Sentra',
            value: product.location || 'Jaringan Nasional NSA',
        },
        ...(isPhysical
            ? [
                  {
                      label: 'Ketersediaan Stok',
                      value:
                          product.stock > 0
                              ? `${product.stock} unit tersedia`
                              : 'Stok habis',
                  },
                  {
                      label: 'Berat Satuan',
                      value: product.weight
                          ? `${product.weight} gram`
                          : 'Standar Pengiriman',
                  },
              ]
            : []),
        {
            label: 'Verifikasi Mitra',
            value: 'Standar Mutu & Budidaya Berkelanjutan NSA',
        },
    ];

    const reviews = [
        {
            id: 1,
            author: 'H. Rahmat Hidayat',
            role: 'Anggota Pembudidaya · Jawa Barat',
            comment:
                'Kualitas sesuai spesifikasi asosiasi, pengemasan rapi, dan potongan harga anggota langsung otomatis terhitung saat pemesanan.',
        },
        {
            id: 2,
            author: 'Koperasi Mina Bahari',
            role: 'Mitra Cabang · Jawa Timur',
            comment:
                'Koordinasi pengiriman dari sentra sangat responsif. Sangat membantu efisiensi operasional siklus tambak kami.',
        },
    ];

    return (
        <PublicLayout>
            <Head title={`${product.name} · Katalog NSA`} />

            {/* Breadcrumb Bar */}
            <div className="border-b border-line bg-mist/40 py-3.5">
                <Container>
                    <Breadcrumb
                        items={[
                            { label: 'Beranda', href: '/' },
                            { label: 'Produk', href: '/produk' },
                            ...(product.group
                                ? [
                                      {
                                          label: groupLabel,
                                          href: `/produk/${groupSlug}`,
                                      },
                                  ]
                                : []),
                            {
                                label: product.category_name,
                                href: `/produk?category=${product.category_slug}`,
                            },
                            { label: product.name },
                        ]}
                    />
                </Container>
            </div>

            <Container className="py-8 md:py-12">
                {/* Dua Kolom: Kiri Galeri Besar (Swiper + Miniatur), Kanan Panel Beli Menempel */}
                <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-12">
                    {/* Kolom Kiri (7 kolom): Galeri Besar + Miniatur */}
                    <div className="space-y-4 lg:col-span-7">
                        <div className="relative overflow-hidden rounded-t-[36px] rounded-b-card border border-line bg-white shadow-soft">
                            {imagesList.length > 0 ? (
                                <Suspense
                                    fallback={
                                        <div className="aspect-[4/3] w-full animate-pulse bg-mist" />
                                    }
                                >
                                    <ProductGallerySwiper
                                        images={imagesList}
                                        productName={product.name}
                                        onSwiper={setSwiperInstance}
                                        onSlideChange={setActiveSlide}
                                    />
                                </Suspense>
                            ) : (
                                <div className="flex aspect-[4/3] w-full flex-col items-center justify-center bg-mist text-slate">
                                    <Fish className="h-16 w-16 text-ocean/35 stroke-[1.25]" />
                                    <span className="mt-2 font-display text-sm font-semibold text-navy">
                                        {product.category_name} · NSA
                                    </span>
                                </div>
                            )}

                            <div className="pointer-events-none absolute left-4 top-4 z-10 flex flex-wrap gap-1.5">
                                <Badge
                                    tone="neutral"
                                    className="bg-white/95 shadow-xs"
                                >
                                    {product.type_label}
                                </Badge>
                                {product.is_member_price_applied ? (
                                    <Badge
                                        tone="info"
                                        className="bg-white/95 shadow-xs"
                                    >
                                        Harga Anggota Aktif
                                    </Badge>
                                ) : null}
                            </div>
                        </div>

                        {/* Baris Miniatur (Thumbnails) */}
                        {imagesList.length > 1 ? (
                            <div
                                role="tablist"
                                aria-label="Miniatur foto produk"
                                className="flex items-center gap-3 overflow-x-auto pb-1"
                            >
                                {imagesList.map((img, idx) => {
                                    const isCurrent = activeSlide === idx;
                                    return (
                                        <button
                                            key={img.id}
                                            type="button"
                                            role="tab"
                                            aria-selected={isCurrent}
                                            aria-label={`Lihat foto ${idx + 1}`}
                                            onClick={() =>
                                                swiperInstance?.slideTo(idx)
                                            }
                                            className={cx(
                                                'relative aspect-[4/3] w-20 shrink-0 overflow-hidden rounded-control border-2 transition-all sm:w-24',
                                                focusRing,
                                                isCurrent
                                                    ? 'border-ocean ring-2 ring-ocean/25'
                                                    : 'border-line opacity-70 hover:opacity-100'
                                            )}
                                        >
                                            <img
                                                src={img.path}
                                                alt=""
                                                className="h-full w-full object-cover"
                                            />
                                        </button>
                                    );
                                })}
                            </div>
                        ) : null}

                        {/* Jaminan Standar NSA */}
                        <div className="grid grid-cols-3 gap-3 rounded-card border border-line bg-mist/40 p-4 text-center">
                            <div className="flex flex-col items-center">
                                <ShieldCheck className="h-5 w-5 text-ocean" />
                                <span className="mt-1 text-xs font-bold text-navy">
                                    Mitra Resmi
                                </span>
                                <span className="text-[11px] text-slate">
                                    Terverifikasi NSA
                                </span>
                            </div>
                            <div className="flex flex-col items-center">
                                <Truck className="h-5 w-5 text-ocean" />
                                <span className="mt-1 text-xs font-bold text-navy">
                                    Logistik Aman
                                </span>
                                <span className="text-[11px] text-slate">
                                    Prosedur Benih &amp; Pakan
                                </span>
                            </div>
                            <div className="flex flex-col items-center">
                                <Sparkles className="h-5 w-5 text-ocean" />
                                <span className="mt-1 text-xs font-bold text-navy">
                                    Harga Anggota
                                </span>
                                <span className="text-[11px] text-slate">
                                    Khusus KTA Aktif
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Kolom Kanan (5 kolom): Panel Beli yang Menempel */}
                    <aside
                        className="lg:sticky lg:col-span-5"
                        style={{ top: 'calc(var(--header-h, 72px) + 20px)' }}
                    >
                        <div className="rounded-card border border-line bg-white p-6 shadow-soft sm:p-7">
                            {/* Kategori & Lokasi */}
                            <div className="flex flex-wrap items-center gap-2 text-xs text-slate">
                                <span className="font-bold text-ocean">
                                    {product.category_name}
                                </span>
                                {product.location ? (
                                    <>
                                        <span>·</span>
                                        <span className="inline-flex items-center gap-1">
                                            <MapPin className="h-3.5 w-3.5 text-ocean" />
                                            {product.location}
                                        </span>
                                    </>
                                ) : null}
                            </div>

                            <h1 className="mt-2 font-display text-2xl font-bold leading-snug text-navy sm:text-3xl">
                                {product.name}
                            </h1>

                            {/* Kotak Harga & Status Harga Anggota */}
                            <div className="mt-4 rounded-control border border-line bg-mist/50 p-4">
                                <div className="flex flex-wrap items-baseline gap-2.5">
                                    <span className="font-display text-3xl font-extrabold tracking-tight text-navy">
                                        Rp{' '}
                                        {Number(
                                            product.effective_price
                                        ).toLocaleString('id-ID')}
                                    </span>

                                    {product.is_member_price_applied ? (
                                        <>
                                            <span className="text-sm text-slate line-through">
                                                Rp{' '}
                                                {Number(
                                                    product.price
                                                ).toLocaleString('id-ID')}
                                            </span>
                                            <span className="rounded-full bg-ocean/15 px-2.5 py-0.5 text-xs font-bold text-ocean">
                                                Harga Anggota
                                            </span>
                                        </>
                                    ) : product.member_price ? (
                                        <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-semibold text-ocean border border-ocean/25">
                                            Harga Anggota: Rp{' '}
                                            {Number(
                                                product.member_price
                                            ).toLocaleString('id-ID')}
                                        </span>
                                    ) : null}
                                </div>

                                {!product.is_member_price_applied &&
                                product.member_price ? (
                                    <div className="mt-3 flex items-center justify-between gap-2 border-t border-line pt-2.5 text-xs text-navy">
                                        <span>
                                            Anggota resmi hemat{' '}
                                            <strong>
                                                Rp{' '}
                                                {(
                                                    Number(product.price) -
                                                    Number(product.member_price)
                                                ).toLocaleString('id-ID')}
                                            </strong>
                                        </span>
                                        <Link
                                            href="/register"
                                            className="font-bold text-ocean hover:underline"
                                        >
                                            Daftar Anggota →
                                        </Link>
                                    </div>
                                ) : null}
                            </div>

                            {/* Panel Konfigurasi Sesuai ProductType */}
                            <div className="mt-6 border-t border-line pt-5">
                                {/* 1. PHYSICAL: Jumlah + Stok */}
                                {isPhysical ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between text-xs text-slate">
                                            <span className="inline-flex items-center gap-1.5">
                                                <CheckCircle2
                                                    className={cx(
                                                        'h-4 w-4',
                                                        product.stock > 0
                                                            ? 'text-emerald-600'
                                                            : 'text-danger'
                                                    )}
                                                />
                                                Stok:{' '}
                                                <strong className="text-navy">
                                                    {product.stock > 0
                                                        ? `${product.stock} unit tersedia`
                                                        : 'Habis'}
                                                </strong>
                                            </span>

                                            {product.weight ? (
                                                <span className="inline-flex items-center gap-1">
                                                    <Scale className="h-3.5 w-3.5 text-ocean" />
                                                    {product.weight} g / unit
                                                </span>
                                            ) : null}
                                        </div>

                                        <div>
                                            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-navy">
                                                Jumlah Pembelian
                                            </label>
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="inline-flex items-center rounded-control border border-line bg-white">
                                                    <button
                                                        type="button"
                                                        disabled={qty <= 1}
                                                        onClick={() =>
                                                            setQty((q) =>
                                                                Math.max(
                                                                    1,
                                                                    q - 1
                                                                )
                                                            )
                                                        }
                                                        aria-label="Kurangi jumlah"
                                                        className="p-2.5 text-slate hover:text-navy disabled:opacity-40"
                                                    >
                                                        <Minus className="h-4 w-4" />
                                                    </button>
                                                    <span className="w-12 text-center text-sm font-bold text-navy">
                                                        {qty}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        disabled={
                                                            product.stock > 0 &&
                                                            qty >= product.stock
                                                        }
                                                        onClick={() =>
                                                            setQty((q) => q + 1)
                                                        }
                                                        aria-label="Tambah jumlah"
                                                        className="p-2.5 text-slate hover:text-navy disabled:opacity-40"
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                    </button>
                                                </div>

                                                <div className="text-right">
                                                    <span className="block text-[11px] text-slate">
                                                        Subtotal
                                                    </span>
                                                    <span className="font-display text-lg font-bold text-navy">
                                                        Rp{' '}
                                                        {estimatedTotal.toLocaleString(
                                                            'id-ID'
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : null}

                                {/* 2. RENTAL: Tanggal Mulai + Durasi + Total */}
                                {isRental ? (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                            <div>
                                                <label
                                                    htmlFor="rental-start"
                                                    className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-navy"
                                                >
                                                    <Calendar className="h-3.5 w-3.5 text-ocean" />
                                                    Tanggal Mulai
                                                </label>
                                                <input
                                                    id="rental-start"
                                                    type="date"
                                                    value={rentalStartDate}
                                                    onChange={(e) =>
                                                        setRentalStartDate(
                                                            e.target.value
                                                        )
                                                    }
                                                    className={cx(
                                                        'h-10 w-full rounded-control border border-line bg-white px-3 text-xs font-medium text-navy',
                                                        focusRing
                                                    )}
                                                />
                                            </div>

                                            <div>
                                                <label
                                                    htmlFor="rental-duration"
                                                    className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-navy"
                                                >
                                                    <Clock className="h-3.5 w-3.5 text-ocean" />
                                                    Durasi Sewa
                                                </label>
                                                <select
                                                    id="rental-duration"
                                                    value={rentalDuration}
                                                    onChange={(e) =>
                                                        setRentalDuration(
                                                            e.target.value
                                                        )
                                                    }
                                                    className={cx(
                                                        'h-10 w-full rounded-control border border-line bg-white px-3 text-xs font-semibold text-navy',
                                                        focusRing
                                                    )}
                                                >
                                                    <option value="1">
                                                        1 Bulan
                                                    </option>
                                                    <option value="3">
                                                        3 Bulan (1 Siklus)
                                                    </option>
                                                    <option value="6">
                                                        6 Bulan
                                                    </option>
                                                    <option value="12">
                                                        12 Bulan (1 Tahun)
                                                    </option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between rounded-control border border-ocean/25 bg-ocean/5 px-4 py-3">
                                            <div>
                                                <span className="block text-xs font-bold text-navy">
                                                    Total Estimasi Sewa (
                                                    {durationMonths} Bulan)
                                                </span>
                                                <span className="text-[11px] text-slate">
                                                    Mulai {rentalStartDate}
                                                </span>
                                            </div>
                                            <span className="font-display text-xl font-extrabold text-navy">
                                                Rp{' '}
                                                {estimatedTotal.toLocaleString(
                                                    'id-ID'
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                ) : null}

                                {/* 3. SPOT: Tanggal Kunjungan + Jumlah Tiket */}
                                {isSpot ? (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                            <div>
                                                <label
                                                    htmlFor="spot-date"
                                                    className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-navy"
                                                >
                                                    <Calendar className="h-3.5 w-3.5 text-ocean" />
                                                    Tanggal Kunjungan
                                                </label>
                                                <input
                                                    id="spot-date"
                                                    type="date"
                                                    value={spotVisitDate}
                                                    onChange={(e) =>
                                                        setSpotVisitDate(
                                                            e.target.value
                                                        )
                                                    }
                                                    className={cx(
                                                        'h-10 w-full rounded-control border border-line bg-white px-3 text-xs font-medium text-navy',
                                                        focusRing
                                                    )}
                                                />
                                            </div>

                                            <div>
                                                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-navy">
                                                    <Ticket className="h-3.5 w-3.5 text-ocean" />
                                                    Jumlah Tiket
                                                </label>
                                                <div className="flex h-10 items-center justify-between rounded-control border border-line bg-white px-2">
                                                    <button
                                                        type="button"
                                                        disabled={
                                                            spotTicketCount <= 1
                                                        }
                                                        onClick={() =>
                                                            setSpotTicketCount(
                                                                (c) =>
                                                                    Math.max(
                                                                        1,
                                                                        c - 1
                                                                    )
                                                            )
                                                        }
                                                        aria-label="Kurangi tiket"
                                                        className="p-1.5 text-slate hover:text-navy disabled:opacity-40"
                                                    >
                                                        <Minus className="h-3.5 w-3.5" />
                                                    </button>
                                                    <span className="text-xs font-bold text-navy">
                                                        {spotTicketCount} Tiket
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setSpotTicketCount(
                                                                (c) => c + 1
                                                            )
                                                        }
                                                        aria-label="Tambah tiket"
                                                        className="p-1.5 text-slate hover:text-navy"
                                                    >
                                                        <Plus className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between rounded-control border border-ocean/25 bg-ocean/5 px-4 py-3">
                                            <span className="text-xs font-bold text-navy">
                                                Total ({spotTicketCount} Tiket)
                                            </span>
                                            <span className="font-display text-xl font-extrabold text-navy">
                                                Rp{' '}
                                                {estimatedTotal.toLocaleString(
                                                    'id-ID'
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                ) : null}

                                {/* 4. COMMUNITY: Tombol Gabung */}
                                {isCommunity ? (
                                    <div className="rounded-control border border-ocean/25 bg-ocean/5 p-4">
                                        <div className="flex items-start gap-3">
                                            <Users className="mt-0.5 h-5 w-5 shrink-0 text-ocean" />
                                            <div className="text-xs leading-relaxed text-slate">
                                                <p className="font-bold text-navy">
                                                    Program Komunitas &amp;
                                                    Kemitraan Budidaya
                                                </p>
                                                <p className="mt-1">
                                                    Dapatkan akses kelompok
                                                    pembudidaya, pendampingan
                                                    teknis lapangan, serta
                                                    konsolidasi panen bersama
                                                    pengurus cabang.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ) : null}
                            </div>

                            {/* Tombol Aksi Beli / Gabung */}
                            <div className="mt-6 border-t border-line pt-5">
                                {isOutOfStock ? (
                                    <div className="rounded-control border border-danger/30 bg-danger/10 p-4 text-center">
                                        <p className="text-sm font-bold text-danger">
                                            Stok produk sedang habis
                                        </p>
                                        <p className="mt-1 text-xs text-slate">
                                            Hubungi sekretariat cabang untuk
                                            jadwal ketersediaan kloter
                                            berikutnya.
                                        </p>
                                    </div>
                                ) : isCommunity ? (
                                    <div className="space-y-2.5">
                                        <Button
                                            type="button"
                                            size="lg"
                                            disabled={adding}
                                            onClick={() =>
                                                handleAddToCart(true)
                                            }
                                            className="w-full justify-center font-bold"
                                        >
                                            <Users className="mr-1.5 h-5 w-5" />
                                            Gabung Komunitas Sekarang
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            size="md"
                                            disabled={adding}
                                            onClick={() =>
                                                handleAddToCart(false)
                                            }
                                            className="w-full justify-center text-xs"
                                        >
                                            Simpan ke Keranjang
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-2.5 sm:flex-row">
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            size="lg"
                                            disabled={adding}
                                            onClick={() =>
                                                handleAddToCart(false)
                                            }
                                            className="flex-1 justify-center font-bold"
                                        >
                                            <ShoppingBag className="mr-1.5 h-4 w-4 text-ocean" />
                                            Tambah ke Keranjang
                                        </Button>
                                        <Button
                                            type="button"
                                            size="lg"
                                            disabled={adding}
                                            onClick={() =>
                                                handleAddToCart(true)
                                            }
                                            className="flex-1 justify-center font-bold"
                                        >
                                            Beli Sekarang
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </aside>
                </div>

                {/* Tab Bawah: Deskripsi / Spesifikasi / Ulasan */}
                <div className="mt-14 border-t border-line pt-10">
                    <div
                        role="tablist"
                        aria-label="Informasi detail produk"
                        className="flex flex-wrap gap-2 border-b border-line pb-3"
                    >
                        <button
                            type="button"
                            role="tab"
                            aria-selected={activeTab === 'description'}
                            onClick={() => setActiveTab('description')}
                            className={cx(
                                'inline-flex min-h-[42px] items-center gap-2 rounded-full px-5 py-2 text-xs font-bold transition-colors sm:text-sm',
                                focusRing,
                                activeTab === 'description'
                                    ? 'bg-navy text-white'
                                    : 'bg-mist text-slate hover:text-navy'
                            )}
                        >
                            <FileText className="h-4 w-4" />
                            Deskripsi
                        </button>

                        <button
                            type="button"
                            role="tab"
                            aria-selected={activeTab === 'specs'}
                            onClick={() => setActiveTab('specs')}
                            className={cx(
                                'inline-flex min-h-[42px] items-center gap-2 rounded-full px-5 py-2 text-xs font-bold transition-colors sm:text-sm',
                                focusRing,
                                activeTab === 'specs'
                                    ? 'bg-navy text-white'
                                    : 'bg-mist text-slate hover:text-navy'
                            )}
                        >
                            <ListChecks className="h-4 w-4" />
                            Spesifikasi
                        </button>

                        <button
                            type="button"
                            role="tab"
                            aria-selected={activeTab === 'reviews'}
                            onClick={() => setActiveTab('reviews')}
                            className={cx(
                                'inline-flex min-h-[42px] items-center gap-2 rounded-full px-5 py-2 text-xs font-bold transition-colors sm:text-sm',
                                focusRing,
                                activeTab === 'reviews'
                                    ? 'bg-navy text-white'
                                    : 'bg-mist text-slate hover:text-navy'
                            )}
                        >
                            <MessageSquareQuote className="h-4 w-4" />
                            Ulasan ({reviews.length})
                        </button>
                    </div>

                    <div className="mt-6 max-w-3xl">
                        {activeTab === 'description' ? (
                            <div className="prose prose-sm max-w-none whitespace-pre-line leading-relaxed text-ink">
                                {product.description ||
                                    'Produk dan layanan terverifikasi dari jaringan anggota Nusantara Sustainable Aquatic (NSA). Memenuhi standar kualitas air, ketertelusuran benih, serta prosedur distribusi berkelanjutan.'}
                            </div>
                        ) : null}

                        {activeTab === 'specs' ? (
                            <div className="overflow-hidden rounded-card border border-line bg-white">
                                <dl className="divide-y divide-line text-sm">
                                    {specsRows.map((row) => (
                                        <div
                                            key={row.label}
                                            className="grid grid-cols-1 gap-1 px-5 py-3.5 sm:grid-cols-3 sm:gap-4"
                                        >
                                            <dt className="font-semibold text-slate">
                                                {row.label}
                                            </dt>
                                            <dd className="font-bold text-navy sm:col-span-2">
                                                {row.value}
                                            </dd>
                                        </div>
                                    ))}
                                </dl>
                            </div>
                        ) : null}

                        {activeTab === 'reviews' ? (
                            <div className="space-y-4">
                                {reviews.map((rev) => (
                                    <div
                                        key={rev.id}
                                        className="rounded-card border border-line bg-white p-5 shadow-xs"
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <div>
                                                <p className="font-display text-sm font-bold text-navy">
                                                    {rev.author}
                                                </p>
                                                <p className="text-xs text-ocean">
                                                    {rev.role}
                                                </p>
                                            </div>
                                            <div
                                                aria-label="Penilaian 5 dari 5"
                                                className="flex items-center gap-0.5 text-amber-500"
                                            >
                                                {[1, 2, 3, 4, 5].map((n) => (
                                                    <Star
                                                        key={n}
                                                        className="h-3.5 w-3.5 fill-current"
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <p className="mt-3 text-xs leading-relaxed text-slate sm:text-sm">
                                            &ldquo;{rev.comment}&rdquo;
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : null}
                    </div>
                </div>

                {/* Produk Terkait: Baris Horizontal yang Bisa Digeser */}
                {relatedProducts.length > 0 ? (
                    <div className="mt-16 border-t border-line pt-10">
                        <div className="mb-6 flex items-end justify-between">
                            <div>
                                <span className="text-xs font-bold uppercase tracking-wider text-ocean">
                                    Katalog Serupa
                                </span>
                                <h2 className="mt-1 font-display text-2xl font-bold text-navy">
                                    Produk Terkait Lainnya
                                </h2>
                            </div>
                            <Link
                                href="/produk"
                                className="text-xs font-bold text-ocean hover:text-navy"
                            >
                                Lihat Semua Katalog →
                            </Link>
                        </div>

                        <Carousel
                            label="Produk terkait lainnya"
                            perView={{ base: 2, md: 3, lg: 4 }}
                            gap={20}
                        >
                            {relatedProducts.map((rel, idx) => (
                                <Link
                                    key={rel.id}
                                    href={`/produk/detail/${rel.slug}`}
                                    className="group flex h-full flex-col justify-between"
                                >
                                    <div>
                                        <div
                                            className={cx(
                                                'aspect-[4/3] w-full overflow-hidden bg-mist',
                                                idx % 2 === 0
                                                    ? 'rounded-t-[26px] rounded-b-card'
                                                    : 'rounded-card'
                                            )}
                                        >
                                            {rel.image ? (
                                                <img
                                                    src={rel.image}
                                                    alt={rel.name}
                                                    loading="lazy"
                                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-xs font-bold text-slate">
                                                    NSA
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-3">
                                            <p className="text-[11px] font-semibold text-ocean">
                                                {rel.category_name}
                                                {rel.location
                                                    ? ` · ${rel.location}`
                                                    : ''}
                                            </p>
                                            <h3 className="mt-0.5 line-clamp-2 font-display text-sm font-bold text-navy group-hover:text-ocean">
                                                {rel.name}
                                            </h3>
                                        </div>
                                    </div>

                                    <div className="mt-2 pt-2">
                                        <span className="font-display text-base font-extrabold text-navy">
                                            Rp{' '}
                                            {Number(
                                                rel.effective_price
                                            ).toLocaleString('id-ID')}
                                        </span>
                                        {rel.is_member_price_applied ? (
                                            <span className="ml-2 rounded-full bg-ocean/10 px-2 py-0.5 text-[10px] font-bold text-ocean">
                                                Harga Anggota
                                            </span>
                                        ) : null}
                                    </div>
                                </Link>
                            ))}
                        </Carousel>
                    </div>
                ) : null}
            </Container>
        </PublicLayout>
    );
}
