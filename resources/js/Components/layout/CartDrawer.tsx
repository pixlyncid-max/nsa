import Button from '@/Components/ui/Button';
import EmptyState from '@/Components/ui/EmptyState';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';
import { copy } from '@/lib/copy';
import { focusRing } from '@/lib/ui';
import { Link, router, usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Loader2, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export interface CartDrawerItem {
    id: number;
    product_id: number;
    name: string;
    slug: string;
    type: string;
    category_name: string;
    image: string | null;
    qty: number;
    options?: Record<string, unknown>;
    unit_price: number;
    normal_price: number;
    member_price: number | null;
    is_member_price_applied: boolean;
    subtotal: number;
    stock: number;
    is_out_of_stock: boolean;
}

export interface CartDrawerData {
    id?: number;
    items: CartDrawerItem[];
    total_qty: number;
    total_weight: number;
    subtotal: number;
}

export function openCartDrawer() {
    window.dispatchEvent(new CustomEvent('nsa:open-cart-drawer'));
}

export default function CartDrawer({
    open,
    onClose,
}: {
    open: boolean;
    onClose: () => void;
}) {
    const reduced = usePrefersReducedMotion();
    const { url } = usePage();
    const [cartData, setCartData] = useState<CartDrawerData | null>(null);
    const [updatingId, setUpdatingId] = useState<number | null>(null);

    useEffect(() => {
        if (!open) return;
        let isCancelled = false;

        fetch('/keranjang/data', {
            headers: {
                Accept: 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
        })
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
                if (!isCancelled && data) {
                    setCartData(data);
                }
            })
            .catch((e) => {
                console.error('Failed to load cart', e);
            });

        return () => {
            isCancelled = true;
        };
    }, [open, url]);

    const refreshCart = () => {
        fetch('/keranjang/data', {
            headers: {
                Accept: 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
        })
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
                if (data) setCartData(data);
            });
    };

    // Handle escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && open) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [open, onClose]);

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
                    refreshCart();
                    toast.success('Kuantitas diperbarui');
                },
                onError: (errs) => {
                    const msg = Object.values(errs)[0] || 'Gagal mengubah kuantitas';
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
                refreshCart();
                toast.success('Item dihapus dari keranjang');
            },
            onFinish: () => setUpdatingId(null),
        });
    };

    const items = cartData?.items ?? [];
    const subtotal = cartData?.subtotal ?? 0;

    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-[60] overflow-hidden">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: reduced ? 0 : 0.2 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-ink/40 backdrop-blur-sm"
                        aria-hidden="true"
                    />

                    {/* Drawer Panel */}
                    <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
                        <motion.aside
                            initial={{ x: reduced ? 0 : '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: reduced ? 0 : '100%' }}
                            transition={{
                                type: 'spring',
                                damping: 28,
                                stiffness: 300,
                            }}
                            className="flex w-screen max-w-md flex-col bg-white shadow-lift"
                            role="dialog"
                            aria-label="Keranjang Belanja"
                        >
                            {/* Drawer Header */}
                            <div className="flex items-center justify-between border-b border-line px-5 py-4">
                                <div className="flex items-center gap-2.5">
                                    <ShoppingBag className="h-5 w-5 text-ocean" />
                                    <h2 className="font-display text-lg font-bold text-navy">
                                        Keranjang Belanja
                                    </h2>
                                    {items.length > 0 && (
                                        <span className="rounded-full bg-mist px-2.5 py-0.5 text-xs font-semibold text-slate">
                                            {cartData?.total_qty ?? items.length} item
                                        </span>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className={`rounded-control p-1.5 text-slate hover:bg-mist hover:text-ink ${focusRing}`}
                                    aria-label="Tutup keranjang"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Drawer Body */}
                            <div className="flex-1 overflow-y-auto p-5">
                                {!cartData ? (
                                    <div className="flex h-40 items-center justify-center">
                                        <Loader2 className="h-7 w-7 animate-spin text-ocean" />
                                    </div>
                                ) : items.length === 0 ? (
                                    <div className="py-12">
                                        <EmptyState
                                            title="Keranjang masih kosong"
                                            description="Temukan bibit ikan unggul, pakan, peralatan budidaya, atau tiket kolam favorit Anda."
                                            action={
                                                <Button
                                                    href="/produk"
                                                    size="sm"
                                                    onClick={onClose}
                                                >
                                                    Jelajah Produk
                                                </Button>
                                            }
                                        />
                                    </div>
                                ) : (
                                    <ul className="divide-y divide-line">
                                        {items.map((item) => {
                                            const isBusy = updatingId === item.id;
                                            return (
                                                <li
                                                    key={item.id}
                                                    className="flex gap-3.5 py-4 first:pt-0 last:pb-0"
                                                >
                                                    {/* Foto Produk */}
                                                    <div className="relative h-18 w-18 shrink-0 overflow-hidden rounded-control border border-line bg-mist">
                                                        {item.image ? (
                                                            <img
                                                                src={item.image}
                                                                alt={item.name}
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-slate">
                                                                NSA
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Info Produk */}
                                                    <div className="flex flex-1 flex-col justify-between">
                                                        <div>
                                                            <div className="flex items-start justify-between gap-2">
                                                                <Link
                                                                    href={`/produk/detail/${item.slug}`}
                                                                    onClick={onClose}
                                                                    className="line-clamp-1 font-semibold text-navy hover:text-ocean transition-colors"
                                                                >
                                                                    {item.name}
                                                                </Link>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRemoveItem(item.id)}
                                                                    disabled={isBusy}
                                                                    className="text-slate hover:text-danger transition-colors p-1"
                                                                    title="Hapus"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                            <p className="text-xs text-slate mt-0.5">
                                                                {item.category_name}
                                                            </p>
                                                            <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                                                                <span className="text-sm font-bold text-navy">
                                                                    Rp {Number(item.unit_price).toLocaleString('id-ID')}
                                                                </span>
                                                                {item.is_member_price_applied && (
                                                                    <span className="rounded bg-sky/15 px-1.5 py-0.5 text-[10px] font-bold text-ocean">
                                                                        Harga Anggota
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Qty Stepper */}
                                                        <div className="mt-2.5 flex items-center justify-between">
                                                            {item.type === 'community' ? (
                                                                <span className="text-xs font-medium text-slate">
                                                                    1 Tiket / Akun
                                                                </span>
                                                            ) : (
                                                                <div className="flex items-center rounded-control border border-line bg-white">
                                                                    <button
                                                                        type="button"
                                                                        disabled={isBusy || item.qty <= 1}
                                                                        onClick={() => handleUpdateQty(item.id, item.qty - 1)}
                                                                        className="p-1 text-slate hover:text-navy disabled:opacity-40"
                                                                        aria-label="Kurangi kuantitas"
                                                                    >
                                                                        <Minus className="h-3.5 w-3.5" />
                                                                    </button>
                                                                    <span className="w-8 text-center text-xs font-bold text-navy">
                                                                        {item.qty}
                                                                    </span>
                                                                    <button
                                                                        type="button"
                                                                        disabled={isBusy || (item.stock > 0 && item.qty >= item.stock)}
                                                                        onClick={() => handleUpdateQty(item.id, item.qty + 1)}
                                                                        className="p-1 text-slate hover:text-navy disabled:opacity-40"
                                                                        aria-label="Tambah kuantitas"
                                                                    >
                                                                        <Plus className="h-3.5 w-3.5" />
                                                                    </button>
                                                                </div>
                                                            )}
                                                            <span className="text-xs font-semibold text-slate">
                                                                Subtotal: Rp {Number(item.subtotal).toLocaleString('id-ID')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}
                            </div>

                            {/* Drawer Footer */}
                            {items.length > 0 && (
                                <div className="border-t border-line bg-mist/50 p-5 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate">Total Estimasi</span>
                                        <span className="font-display text-xl font-bold text-navy">
                                            Rp {Number(subtotal).toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 pt-1">
                                        <Button
                                            href="/keranjang"
                                            variant="secondary"
                                            size="sm"
                                            onClick={onClose}
                                            className="w-full justify-center"
                                        >
                                            {copy.actions.cart}
                                        </Button>
                                        <Button
                                            href="/checkout"
                                            size="sm"
                                            onClick={onClose}
                                            className="w-full justify-center"
                                        >
                                            Checkout
                                            <ArrowRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </motion.aside>
                    </div>
                </div>
            )}
        </AnimatePresence>
    );
}
