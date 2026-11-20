import AdminLayout from '@/Layouts/AdminLayout';
import Card from '@/Components/ui/Card';
import Button from '@/Components/ui/Button';
import { StatusBadge } from '@/Components/ui/Badge';
import { router, Link } from '@inertiajs/react';
import { useState } from 'react';
import {
    ArrowLeft,
    CheckCircle2,
    Package,
    Truck,
    CreditCard,
    User as UserIcon,
    MapPin,
    ExternalLink,
} from 'lucide-react';

interface OrderDetailProps {
    order: {
        id: number;
        code: string;
        status: string;
        subtotal: number;
        shipping_cost: number;
        total: number;
        address: any;
        note: string | null;
        created_at: string;
        user: {
            id: number;
            name: string;
            email: string;
            phone: string;
        } | null;
        items: Array<{
            id: number;
            product_name: string;
            product_slug: string | null;
            product_image: string | null;
            quantity: number;
            unit_price: number;
            subtotal: number;
        }>;
        payment: {
            id: number;
            method: string;
            amount: number;
            status: string;
            proof_url: string | null;
            confirmed_at: string | null;
            confirmed_by: string | null;
        } | null;
    };
    statusOptions: Array<{ value: string; label: string }>;
}

export default function OrderShow({ order, statusOptions }: OrderDetailProps) {
    const [selectedStatus, setSelectedStatus] = useState(order.status);
    const [updating, setUpdating] = useState(false);

    const formatRupiah = (val: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(val);
    };

    const handleConfirmPayment = () => {
        if (confirm(`Konfirmasi pembayaran untuk pesanan #${order.code}?`)) {
            router.post(`/admin/pesanan/${order.id}/konfirmasi`);
        }
    };

    const handleUpdateStatus = () => {
        setUpdating(true);
        router.patch(
            `/admin/pesanan/${order.id}/status`,
            { status: selectedStatus },
            {
                onFinish: () => setUpdating(false),
            }
        );
    };

    return (
        <AdminLayout title={`Pesanan #${order.code}`}>
            <div className="space-y-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <Link
                        href="/admin/pesanan"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-slate hover:text-navy"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Kembali ke Daftar Pesanan
                    </Link>

                    {order.status === 'pending_payment' && order.payment?.proof_url && (
                        <Button
                            variant="primary"
                            size="md"
                            onClick={handleConfirmPayment}
                            className="!bg-success hover:!bg-success/90"
                        >
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Konfirmasi Pembayaran
                        </Button>
                    )}
                </div>

                {/* Top Status Card */}
                <Card className="p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="font-mono text-2xl font-bold text-navy">
                                    #{order.code}
                                </h1>
                                <StatusBadge status={order.status} />
                            </div>
                            <p className="mt-1 text-sm text-slate">
                                Dipesan pada {order.created_at}
                            </p>
                        </div>

                        {/* Status Updater */}
                        <div className="flex items-center gap-2">
                            <select
                                className="h-10 rounded-control border border-line bg-white px-3 text-sm text-ink focus:border-ocean focus:outline-none focus:ring-2 focus:ring-ocean/15"
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                            >
                                {statusOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={handleUpdateStatus}
                                loading={updating}
                                disabled={selectedStatus === order.status}
                            >
                                Perbarui Status
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Main Content */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Items List (Left 2 cols) */}
                    <div className="space-y-6 lg:col-span-2">
                        <Card className="p-6">
                            <div className="mb-4 flex items-center gap-2 text-ocean">
                                <Package className="h-5 w-5" />
                                <h3 className="font-display text-base font-bold text-navy">
                                    Item Produk Dipesan
                                </h3>
                            </div>

                            <div className="divide-y divide-line">
                                {order.items.map((item) => (
                                    <div key={item.id} className="py-3 flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-3">
                                            {item.product_image ? (
                                                <img
                                                    src={item.product_image}
                                                    alt={item.product_name}
                                                    className="h-12 w-12 rounded-lg object-cover border border-line"
                                                />
                                            ) : (
                                                <div className="grid h-12 w-12 place-items-center rounded-lg bg-mist border border-line text-slate">
                                                    <Package className="h-5 w-5" />
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-semibold text-ink">{item.product_name}</p>
                                                <span className="text-xs text-slate">
                                                    {formatRupiah(item.unit_price)} &times; {item.quantity} unit
                                                </span>
                                            </div>
                                        </div>
                                        <div className="font-bold text-navy">
                                            {formatRupiah(item.subtotal)}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Summary Calculation */}
                            <div className="mt-4 border-t border-line pt-4 space-y-2 text-sm">
                                <div className="flex justify-between text-slate">
                                    <span>Subtotal Belanja</span>
                                    <span className="font-medium text-ink">{formatRupiah(order.subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-slate">
                                    <span>Biaya Pengiriman</span>
                                    <span className="font-medium text-ink">{formatRupiah(order.shipping_cost)}</span>
                                </div>
                                <div className="flex justify-between border-t border-line pt-2 text-base font-bold text-navy">
                                    <span>Total Tagihan</span>
                                    <span className="text-ocean">{formatRupiah(order.total)}</span>
                                </div>
                            </div>
                        </Card>

                        {/* Customer and Shipping details */}
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <Card className="p-5">
                                <div className="mb-3 flex items-center gap-2 text-ocean">
                                    <UserIcon className="h-4 w-4" />
                                    <h4 className="font-display text-sm font-bold text-navy">
                                        Informasi Pembeli
                                    </h4>
                                </div>
                                <div className="text-sm space-y-1">
                                    <p className="font-semibold text-ink">{order.user?.name ?? 'Tamu'}</p>
                                    <p className="text-slate text-xs">{order.user?.email ?? '-'}</p>
                                    <p className="text-slate text-xs">{order.user?.phone ?? '-'}</p>
                                </div>
                            </Card>

                            <Card className="p-5">
                                <div className="mb-3 flex items-center gap-2 text-ocean">
                                    <MapPin className="h-4 w-4" />
                                    <h4 className="font-display text-sm font-bold text-navy">
                                        Alamat Pengiriman
                                    </h4>
                                </div>
                                <div className="text-sm text-slate leading-relaxed">
                                    {order.address ? (
                                        typeof order.address === 'object' ? (
                                            <div>
                                                <p className="font-medium text-ink">{order.address.recipient_name || ''}</p>
                                                <p className="text-xs">{order.address.address_line || ''}</p>
                                                <p className="text-xs">{order.address.city || ''}, {order.address.province || ''}</p>
                                            </div>
                                        ) : (
                                            <p>{order.address}</p>
                                        )
                                    ) : (
                                        <p className="text-xs">Alamat tidak dicantumkan.</p>
                                    )}
                                </div>
                            </Card>
                        </div>
                    </div>

                    {/* Payment Proof Card (Right 1 col) */}
                    <div className="space-y-6">
                        <Card className="p-6">
                            <div className="mb-4 flex items-center gap-2 text-ocean">
                                <CreditCard className="h-5 w-5" />
                                <h3 className="font-display text-base font-bold text-navy">
                                    Bukti Pembayaran
                                </h3>
                            </div>

                            {order.payment ? (
                                <div className="space-y-4 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-slate">Metode:</span>
                                        <span className="font-semibold text-ink">{order.payment.method}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate">Nominal:</span>
                                        <span className="font-semibold text-navy">{formatRupiah(order.payment.amount)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate">Status Bayar:</span>
                                        <span className="font-bold uppercase text-xs text-ocean">{order.payment.status}</span>
                                    </div>

                                    {order.payment.confirmed_at && (
                                        <div className="rounded-lg bg-success/10 p-2.5 text-xs text-success">
                                            Dikonfirmasi pada {order.payment.confirmed_at} oleh {order.payment.confirmed_by}
                                        </div>
                                    )}

                                    {order.payment.proof_url ? (
                                        <div className="pt-2">
                                            <span className="mb-2 block text-xs font-semibold text-slate">
                                                Foto Bukti Transfer:
                                            </span>
                                            <a
                                                href={order.payment.proof_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="group block overflow-hidden rounded-lg border border-line"
                                            >
                                                <img
                                                    src={order.payment.proof_url}
                                                    alt="Bukti Transfer"
                                                    className="h-48 w-full object-contain bg-black/5 transition group-hover:scale-105"
                                                />
                                                <div className="flex items-center justify-center gap-1 bg-mist p-2 text-xs font-semibold text-ocean">
                                                    <ExternalLink className="h-3.5 w-3.5" />
                                                    Buka Ukuran Penuh
                                                </div>
                                            </a>
                                        </div>
                                    ) : (
                                        <div className="rounded-lg border border-line bg-mist p-4 text-center text-xs text-slate">
                                            Belum ada bukti pembayaran yang diunggah oleh pembeli.
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-xs text-slate">Belum ada data pembayaran.</p>
                            )}
                        </Card>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
