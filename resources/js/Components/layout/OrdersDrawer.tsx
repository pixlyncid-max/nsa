import Button from '@/Components/ui/Button';
import EmptyState from '@/Components/ui/EmptyState';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';
import { focusRing } from '@/lib/ui';
import { AnimatePresence, motion } from 'framer-motion';
import {
    CheckCircle2,
    Loader2,
    Package,
    ShoppingBag,
    Upload,
    X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

export interface OrderItemData {
    id: number;
    name: string;
    price: number;
    qty: number;
    subtotal: number;
}

export interface OrderData {
    id: number;
    code: string;
    status: string;
    status_label: string;
    total: number;
    items_count: number;
    items: OrderItemData[];
    created_at: string;
    payment_status: string;
    payment_method: string;
    proof_url: string | null;
}

export function openOrdersDrawer() {
    window.dispatchEvent(new CustomEvent('nsa:open-orders-drawer'));
}

export default function OrdersDrawer() {
    const reduced = usePrefersReducedMotion();
    const [open, setOpen] = useState(false);
    const [orders, setOrders] = useState<OrderData[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploadingOrderCode, setUploadingOrderCode] = useState<string | null>(null);

    useEffect(() => {
        const handleOpen = () => setOpen(true);
        window.addEventListener('nsa:open-orders-drawer', handleOpen);
        return () => window.removeEventListener('nsa:open-orders-drawer', handleOpen);
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && open) {
                setOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [open]);

    const loadOrders = async () => {
        setLoading(true);
        try {
            const res = await fetch('/akun/api/pesanan', {
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });
            if (res.ok) {
                const data = await res.json();
                setOrders(data.orders || []);
            }
        } catch {
            toast.error('Gagal memuat daftar pesanan');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!open) return;
        let isMounted = true;
        (async () => {
            await Promise.resolve();
            if (!isMounted) return;
            setLoading(true);
            try {
                const res = await fetch('/akun/api/pesanan', {
                    headers: {
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                });
                if (isMounted && res.ok) {
                    const data = await res.json();
                    if (isMounted) setOrders(data.orders || []);
                }
            } catch {
                if (isMounted) toast.error('Gagal memuat daftar pesanan');
            } finally {
                if (isMounted) setLoading(false);
            }
        })();

        return () => {
            isMounted = false;
        };
    }, [open]);

    const handleUploadProof = async (orderCode: string, file: File) => {
        setUploadingOrderCode(orderCode);
        const formData = new FormData();
        formData.append('proof', file);

        try {
            const token =
                document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
            const res = await fetch(`/akun/api/pesanan/${orderCode}/bukti-bayar`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': token,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: formData,
            });

            const result = await res.json();
            if (res.ok) {
                toast.success(result.message || 'Bukti bayar berhasil diunggah');
                loadOrders();
            } else {
                toast.error(result.message || 'Gagal mengunggah bukti bayar');
            }
        } catch {
            toast.error('Terjadi kesalahan saat mengunggah berkas');
        } finally {
            setUploadingOrderCode(null);
        }
    };

    const getStatusBadge = (status: string, label: string) => {
        let badgeStyle = 'bg-slate-100 text-slate-700 border-slate-200';
        if (status === 'pending_payment') {
            badgeStyle = 'bg-warning/10 text-warning border-warning/30';
        } else if (status === 'paid' || status === 'processing') {
            badgeStyle = 'bg-ocean/10 text-ocean border-ocean/30';
        } else if (status === 'shipped') {
            badgeStyle = 'bg-sky-50 text-sky-800 border-sky-200';
        } else if (status === 'completed') {
            badgeStyle = 'bg-success/10 text-success border-success/30';
        } else if (status === 'cancelled') {
            badgeStyle = 'bg-rose-50 text-rose-700 border-rose-200';
        }

        return (
            <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${badgeStyle}`}
            >
                {label}
            </span>
        );
    };

    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-[60] overflow-hidden font-sans">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: reduced ? 0 : 0.2 }}
                        onClick={() => setOpen(false)}
                        className="fixed inset-0 bg-ink/40 backdrop-blur-sm"
                        aria-hidden="true"
                    />

                    {/* Drawer Slide-over Panel */}
                    <div className="fixed inset-y-0 right-0 flex max-w-full pl-6 sm:pl-10">
                        <motion.aside
                            initial={{ x: reduced ? 0 : '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: reduced ? 0 : '100%' }}
                            transition={{
                                type: 'spring',
                                damping: 28,
                                stiffness: 300,
                            }}
                            className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-line"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="orders-drawer-title"
                        >
                            {/* Header Mandiri */}
                            <div className="p-5 border-b border-line bg-white flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-navy/5 text-navy flex items-center justify-center font-display font-bold">
                                        <Package className="w-5 h-5 text-ocean" />
                                    </div>
                                    <div>
                                        <h2
                                            id="orders-drawer-title"
                                            className="font-display font-bold text-lg text-navy tracking-tight leading-none"
                                        >
                                            Pesanan Saya
                                        </h2>
                                        <p className="text-xs text-slate-500 mt-1">
                                            Riwayat pesanan dan status transaksi Anda
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setOpen(false)}
                                    className={`p-2 text-slate-400 hover:text-navy hover:bg-mist rounded-control transition-colors ${focusRing}`}
                                    aria-label="Tutup panel"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Body Content */}
                            <div className="flex-1 overflow-y-auto p-5">
                                {loading ? (
                                    <div className="py-20 flex flex-col items-center justify-center text-slate-500">
                                        <Loader2 className="w-8 h-8 animate-spin text-ocean mb-2" />
                                        <p className="text-sm">Memuat daftar pesanan...</p>
                                    </div>
                                ) : orders.length === 0 ? (
                                    <EmptyState
                                        title="Belum ada pesanan"
                                        description="Anda belum memiliki transaksi pesanan produk perikanan di NSA."
                                        action={
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                href="/produk"
                                                onClick={() => setOpen(false)}
                                            >
                                                <ShoppingBag className="w-4 h-4 mr-1.5" />
                                                Jelajahi Produk
                                            </Button>
                                        }
                                    />
                                ) : (
                                    <div className="space-y-4">
                                        {orders.map((order) => (
                                            <div
                                                key={order.id}
                                                className="p-4 rounded-xl border border-line bg-white shadow-sm hover:border-ocean/40 transition-colors"
                                            >
                                                <div className="flex items-start justify-between gap-2 pb-3 border-b border-line/60">
                                                    <div>
                                                        <span className="font-mono text-xs font-bold text-navy">
                                                            {order.code}
                                                        </span>
                                                        <p className="text-xs text-slate-500 mt-0.5">
                                                            {order.created_at}
                                                        </p>
                                                    </div>
                                                    {getStatusBadge(order.status, order.status_label)}
                                                </div>

                                                {/* Items Preview */}
                                                <div className="py-3 space-y-2 text-xs">
                                                    {order.items.map((item) => (
                                                        <div
                                                            key={item.id}
                                                            className="flex justify-between items-center text-slate-700"
                                                        >
                                                            <span className="line-clamp-1 font-medium">
                                                                {item.name} × {item.qty}
                                                            </span>
                                                            <span className="font-semibold text-navy shrink-0">
                                                                Rp {Number(item.subtotal).toLocaleString('id-ID')}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Total & Action */}
                                                <div className="pt-3 border-t border-line/60 flex items-center justify-between">
                                                    <div>
                                                        <span className="text-[11px] text-slate-500">
                                                            Total Pembayaran
                                                        </span>
                                                        <p className="text-sm font-bold text-navy">
                                                            Rp {Number(order.total).toLocaleString('id-ID')}
                                                        </p>
                                                    </div>

                                                    {order.status === 'pending_payment' && (
                                                        <div className="flex items-center gap-2">
                                                            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-ocean hover:bg-navy rounded-lg cursor-pointer transition-colors shadow-sm">
                                                                {uploadingOrderCode === order.code ? (
                                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                                ) : (
                                                                    <Upload className="w-3.5 h-3.5" />
                                                                )}
                                                                <span>
                                                                    {order.proof_url
                                                                        ? 'Ganti Bukti'
                                                                        : 'Unggah Bukti'}
                                                                </span>
                                                                <input
                                                                    type="file"
                                                                    accept="image/*"
                                                                    className="hidden"
                                                                    disabled={
                                                                        uploadingOrderCode === order.code
                                                                    }
                                                                    onChange={(e) => {
                                                                        const file = e.target.files?.[0];
                                                                        if (file)
                                                                            handleUploadProof(
                                                                                order.code,
                                                                                file
                                                                            );
                                                                    }}
                                                                />
                                                            </label>
                                                        </div>
                                                    )}

                                                    {order.proof_url &&
                                                        order.status !== 'pending_payment' && (
                                                            <a
                                                                href={order.proof_url}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="text-xs font-semibold text-ocean hover:underline"
                                                            >
                                                                Lihat Bukti
                                                            </a>
                                                        )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.aside>
                    </div>
                </div>
            )}
        </AnimatePresence>
    );
}
