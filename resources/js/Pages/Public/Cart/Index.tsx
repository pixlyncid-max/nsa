import Container from '@/Components/layout/Container';
import PageHeader from '@/Components/layout/PageHeader';
import Button from '@/Components/ui/Button';
import EmptyState from '@/Components/ui/EmptyState';
import PublicLayout from '@/Layouts/PublicLayout';
import { cx } from '@/lib/cx';
import { focusRing } from '@/lib/ui';
import { Head, Link, router } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowLeft,
    ArrowRight,
    Fish,
    Minus,
    Plus,
    RotateCcw,
    Scale,
    ShieldCheck,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface CartItemData {
    id: number;
    product_id: number;
    name: string;
    slug: string;
    type: 'physical' | 'rental' | 'spot' | 'community';
    category_name: string;
    image: string | null;
    qty: number;
    options?: {
        start_date?: string;
        duration?: string;
        visit_date?: string;
        tickets?: number;
    };
    unit_price: number;
    normal_price: number;
    member_price: number | null;
    is_member_price_applied: boolean;
    subtotal: number;
    weight: number;
    stock: number;
    is_out_of_stock: boolean;
}

interface CartDetails {
    id?: number;
    items: CartItemData[];
    total_qty: number;
    total_weight: number;
    subtotal: number;
}

interface CartPageProps {
    cart: CartDetails;
}

export default function CartIndex({ cart }: CartPageProps) {
    const [updatingId, setUpdatingId] = useState<number | null>(null);

    const handleUpdateQty = (itemId: number, newQty: number) => {
        if (newQty < 1) {
            handleRemoveItem(itemId);
            return;
        }

        setUpdatingId(itemId);
        router.patch(
            `/keranjang/item/${itemId}`,
            { qty: newQty },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Kuantitas produk diperbarui');
                },
                onError: (errs) => {
                    const msg =
                        Object.values(errs)[0] || 'Gagal mengubah kuantitas';
                    toast.error(msg as string);
                },
                onFinish: () => setUpdatingId(null),
            }
        );
    };

    const handleRemoveItem = (itemId: number) => {
        setUpdatingId(itemId);
        router.delete(`/keranjang/item/${itemId}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Produk dihapus dari keranjang');
            },
            onFinish: () => setUpdatingId(null),
        });
    };

    const handleClearCart = () => {
        if (
            confirm(
                'Apakah Anda yakin ingin mengosongkan seluruh keranjang belanja?'
            )
        ) {
            router.post(
                '/keranjang/kosongkan',
                {},
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        toast.success('Keranjang belanja telah dikosongkan');
                    },
                }
            );
        }
    };

    const items = cart.items || [];
    const hasOutOfStock = items.some((it) => it.is_out_of_stock);

    return (
        <PublicLayout>
            <Head title="Keranjang Belanja · NSA" />

            <PageHeader
                breadcrumbs={[
                    { label: 'Beranda', href: '/' },
                    { label: 'Produk', href: '/produk' },
                    { label: 'Keranjang Belanja' },
                ]}
                eyebrow="Pesanan Anda"
                title="Keranjang Belanja"
                description="Periksa kembali daftar komoditas, sarana budidaya, atau layanan yang Anda pilih sebelum melanjutkan ke tahap pengiriman."
            />

            <Container className="py-10 pb-28 lg:pb-16">
                {items.length === 0 ? (
                    <div className="mx-auto max-w-md py-10">
                        <EmptyState
                            title="Keranjang Belanja Masih Kosong"
                            description="Anda belum menambahkan produk ke keranjang. Jelajahi bibit ikan unggul, pakan, atau layanan budidaya anggota NSA."
                            action={
                                <Button href="/produk" size="md">
                                    Jelajahi Katalog Produk
                                </Button>
                            }
                        />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12">
                        {/* Kiri (8 kolom): Daftar Baris Bersih (Bukan Kartu) */}
                        <div className="lg:col-span-8">
                            <div className="flex items-center justify-between pb-4">
                                <span className="font-display text-sm font-bold uppercase tracking-wider text-navy">
                                    Daftar Barang ({cart.total_qty} unit)
                                </span>
                                <button
                                    type="button"
                                    onClick={handleClearCart}
                                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate transition-colors hover:text-danger"
                                >
                                    <RotateCcw className="h-3.5 w-3.5" />
                                    Kosongkan Keranjang
                                </button>
                            </div>

                            {hasOutOfStock ? (
                                <div className="mb-4 flex items-start gap-2.5 rounded-control border border-warning/30 bg-warning/10 p-4 text-xs text-warning">
                                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                                    <span>
                                        Beberapa item melebihi stok yang
                                        tersedia. Sesuaikan jumlah sebelum
                                        melanjutkan checkout.
                                    </span>
                                </div>
                            ) : null}

                            {/* Daftar Baris Bersih Dipisahkan Garis Tipis */}
                            <ul className="divide-y divide-line border-y border-line">
                                {items.map((item) => {
                                    const isBusy = updatingId === item.id;
                                    return (
                                        <li
                                            key={item.id}
                                            className={cx(
                                                'flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between',
                                                item.is_out_of_stock
                                                    ? 'bg-danger/5 px-3'
                                                    : ''
                                            )}
                                        >
                                            {/* Foto 4:3 + Rincian */}
                                            <div className="flex items-start gap-4 min-w-0 flex-1">
                                                <Link
                                                    href={`/produk/detail/${item.slug}`}
                                                    className="aspect-[4/3] w-24 shrink-0 overflow-hidden rounded-control border border-line bg-mist sm:w-28"
                                                >
                                                    {item.image ? (
                                                        <img
                                                            src={item.image}
                                                            alt={item.name}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center text-slate">
                                                            <Fish className="h-6 w-6 text-ocean/40" />
                                                        </div>
                                                    )}
                                                </Link>

                                                <div className="min-w-0 flex-1">
                                                    <span className="text-[11px] font-bold uppercase tracking-wider text-ocean">
                                                        {item.category_name}
                                                    </span>
                                                    <Link
                                                        href={`/produk/detail/${item.slug}`}
                                                        className="mt-0.5 block font-display text-base font-bold text-navy hover:text-ocean"
                                                    >
                                                        {item.name}
                                                    </Link>

                                                    {/* Harga Satuan & Label Harga Anggota */}
                                                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                                                        <span className="font-semibold text-ink">
                                                            Rp{' '}
                                                            {Number(
                                                                item.unit_price
                                                            ).toLocaleString(
                                                                'id-ID'
                                                            )}{' '}
                                                            / unit
                                                        </span>
                                                        {item.is_member_price_applied ? (
                                                            <span className="rounded-full bg-ocean/10 px-2 py-0.5 text-[10px] font-bold text-ocean">
                                                                Harga Anggota
                                                            </span>
                                                        ) : null}
                                                    </div>

                                                    {/* Opsi Sewa / Kunjungan */}
                                                    {item.options ? (
                                                        <div className="mt-1.5 text-xs text-slate">
                                                            {item.options
                                                                .start_date ? (
                                                                <p>
                                                                    Mulai Sewa:{' '}
                                                                    {
                                                                        item
                                                                            .options
                                                                            .start_date
                                                                    }{' '}
                                                                    (
                                                                    {
                                                                        item
                                                                            .options
                                                                            .duration
                                                                    }
                                                                    )
                                                                </p>
                                                            ) : null}
                                                            {item.options
                                                                .visit_date ? (
                                                                <p>
                                                                    Tanggal
                                                                    Kunjungan:{' '}
                                                                    {
                                                                        item
                                                                            .options
                                                                            .visit_date
                                                                    }
                                                                </p>
                                                            ) : null}
                                                        </div>
                                                    ) : null}

                                                    {item.is_out_of_stock ? (
                                                        <p className="mt-1 text-xs font-bold text-danger">
                                                            Stok tersisa hanya{' '}
                                                            {item.stock} unit
                                                        </p>
                                                    ) : null}
                                                </div>
                                            </div>

                                            {/* Kontrol Kuantitas + Subtotal + Hapus */}
                                            <div className="flex items-center justify-between gap-5 sm:justify-end">
                                                {item.type === 'community' ? (
                                                    <span className="rounded-full bg-mist px-3 py-1 text-xs font-semibold text-slate">
                                                        1 Paket
                                                    </span>
                                                ) : (
                                                    <div className="inline-flex items-center rounded-control border border-line bg-white">
                                                        <button
                                                            type="button"
                                                            disabled={
                                                                isBusy ||
                                                                item.qty <= 1
                                                            }
                                                            onClick={() =>
                                                                handleUpdateQty(
                                                                    item.id,
                                                                    item.qty - 1
                                                                )
                                                            }
                                                            aria-label="Kurangi kuantitas"
                                                            className="p-2 text-slate hover:text-navy disabled:opacity-40"
                                                        >
                                                            <Minus className="h-3.5 w-3.5" />
                                                        </button>
                                                        <span className="w-9 text-center text-xs font-bold text-navy">
                                                            {item.qty}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            disabled={
                                                                isBusy ||
                                                                (item.stock >
                                                                    0 &&
                                                                    item.qty >=
                                                                        item.stock)
                                                            }
                                                            onClick={() =>
                                                                handleUpdateQty(
                                                                    item.id,
                                                                    item.qty + 1
                                                                )
                                                            }
                                                            aria-label="Tambah kuantitas"
                                                            className="p-2 text-slate hover:text-navy disabled:opacity-40"
                                                        >
                                                            <Plus className="h-3.5 w-3.5" />
                                                        </button>
                                                    </div>
                                                )}

                                                <div className="min-w-[110px] text-right">
                                                    <span className="block font-display text-base font-extrabold text-navy">
                                                        Rp{' '}
                                                        {Number(
                                                            item.subtotal
                                                        ).toLocaleString(
                                                            'id-ID'
                                                        )}
                                                    </span>
                                                </div>

                                                <button
                                                    type="button"
                                                    disabled={isBusy}
                                                    onClick={() =>
                                                        handleRemoveItem(
                                                            item.id
                                                        )
                                                    }
                                                    aria-label={`Hapus ${item.name}`}
                                                    className={cx(
                                                        'rounded-control p-2 text-slate transition-colors hover:bg-danger/10 hover:text-danger',
                                                        focusRing
                                                    )}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>

                            <div className="mt-6">
                                <Link
                                    href="/produk"
                                    className="inline-flex items-center gap-2 text-xs font-bold text-ocean hover:text-navy"
                                >
                                    <ArrowLeft className="h-3.5 w-3.5" />
                                    Lanjut Belanja Produk Lain
                                </Link>
                            </div>
                        </div>

                        {/* Kanan (4 kolom): Ringkasan Menempel di Desktop */}
                        <aside
                            className="lg:sticky lg:col-span-4"
                            style={{ top: 'calc(var(--header-h, 72px) + 20px)' }}
                        >
                            <div className="rounded-card border border-line bg-mist/45 p-6 shadow-soft space-y-5">
                                <h2 className="border-b border-line pb-3 font-display text-lg font-bold text-navy">
                                    Ringkasan Pesanan
                                </h2>

                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between text-slate">
                                        <span>Total Kuantitas</span>
                                        <span className="font-bold text-navy">
                                            {cart.total_qty} unit
                                        </span>
                                    </div>

                                    {cart.total_weight > 0 ? (
                                        <div className="flex justify-between text-slate">
                                            <span className="inline-flex items-center gap-1.5">
                                                <Scale className="h-3.5 w-3.5 text-ocean" />
                                                Estimasi Berat
                                            </span>
                                            <span className="font-bold text-navy">
                                                {(
                                                    cart.total_weight / 1000
                                                ).toFixed(2)}{' '}
                                                kg
                                            </span>
                                        </div>
                                    ) : null}

                                    <div className="flex items-baseline justify-between border-t border-line pt-3">
                                        <span className="font-bold text-navy">
                                            Subtotal
                                        </span>
                                        <span className="font-display text-2xl font-extrabold text-navy">
                                            Rp{' '}
                                            {Number(
                                                cart.subtotal
                                            ).toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                    <p className="text-xs leading-relaxed text-slate">
                                        Opsi ekspedisi pengiriman dan metode
                                        pembayaran dipilih pada langkah
                                        berikutnya.
                                    </p>
                                </div>

                                <Button
                                    href="/checkout"
                                    size="lg"
                                    disabled={
                                        hasOutOfStock || items.length === 0
                                    }
                                    className="w-full justify-center font-bold"
                                >
                                    Lanjut ke Checkout
                                    <ArrowRight className="ml-1.5 h-4 w-4" />
                                </Button>

                                <div className="flex items-start gap-2.5 rounded-control border border-line bg-white p-3.5 text-xs text-slate">
                                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-ocean" />
                                    <span>
                                        Harga anggota diterapkan otomatis bagi
                                        akun dengan status keanggotaan aktif.
                                    </span>
                                </div>
                            </div>
                        </aside>
                    </div>
                )}
            </Container>

            {/* Mobile: Ringkasan Menempel di Bawah */}
            {items.length > 0 ? (
                <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 px-4 py-3.5 shadow-lift backdrop-blur-md lg:hidden">
                    <div className="mx-auto flex max-w-xl items-center justify-between gap-4">
                        <div>
                            <span className="block text-[11px] font-semibold text-slate">
                                Subtotal ({cart.total_qty} unit)
                            </span>
                            <span className="font-display text-lg font-extrabold text-navy">
                                Rp{' '}
                                {Number(cart.subtotal).toLocaleString('id-ID')}
                            </span>
                        </div>
                        <Button
                            href="/checkout"
                            size="md"
                            disabled={hasOutOfStock}
                            className="font-bold"
                        >
                            Lanjut Checkout
                            <ArrowRight className="ml-1 h-4 w-4" />
                        </Button>
                    </div>
                </div>
            ) : null}
        </PublicLayout>
    );
}
