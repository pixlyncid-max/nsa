import PageBanner from '@/Components/layout/PageBanner';
import { StatusBadge } from '@/Components/ui/Badge';
import Button from '@/Components/ui/Button';
import EmptyState from '@/Components/ui/EmptyState';
import Pagination from '@/Components/ui/Pagination';
import PortalLayout from '@/Layouts/PortalLayout';
import { ArrowRight, Clock, FileUp, Package, ShoppingBag } from 'lucide-react';

interface OrderSummaryItem {
    id: number;
    code: string;
    status: string;
    status_label: string;
    total: number;
    items_count: number;
    first_item_name: string;
    created_at: string;
    payment_status: string;
}

interface PaginationData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

interface OrdersIndexProps {
    orders: PaginationData<OrderSummaryItem>;
}

function formatRupiah(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

export default function AccountOrdersIndex({ orders }: OrdersIndexProps) {
    const list = orders?.data || [];

    return (
        <PortalLayout title="Pesanan Saya">
            <PageBanner
                eyebrow="TRANSAKSI TOKO"
                title="Riwayat Pesanan Saya"
                subtitle="Pantau status transaksi produk, benih, sarana budidaya, dan layanan perikanan NSA Anda."
                action={
                    <Button
                        href="/produk"
                        size="md"
                        className="!bg-aqua !text-navy hover:!bg-white font-semibold shadow-soft"
                    >
                        <ShoppingBag className="h-4 w-4 mr-1.5" />
                        Belanja Katalog
                    </Button>
                }
            />

            <div className="space-y-6">
                {/* Orders List */}
                {list.length === 0 ? (
                    <div className="rounded-card border border-line bg-white p-12 text-center shadow-soft">
                        <EmptyState
                            icon={Package}
                            title="Belum ada riwayat transaksi"
                            description="Anda belum memiliki pesanan produk budidaya atau sarana perikanan di katalog toko NSA."
                            action={
                                <Button href="/produk" size="md">
                                    <ShoppingBag className="h-4 w-4 mr-2" />
                                    Jelajahi Produk Sekarang
                                </Button>
                            }
                        />
                    </div>
                ) : (
                    <div className="space-y-4">
                        {list.map((order) => (
                            <div
                                key={order.id}
                                className="flex flex-col gap-4 rounded-card border border-line bg-white p-5 transition-all hover:border-ocean/40 hover:shadow-soft sm:flex-row sm:items-center sm:justify-between"
                            >
                                <div className="space-y-1.5 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="font-mono text-sm font-bold text-navy">
                                            {order.code}
                                        </span>
                                        <StatusBadge status={order.status} />
                                        {order.payment_status === 'pending' ? (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-2 py-0.5 text-[11px] font-semibold text-warning">
                                                <Clock className="h-3 w-3" />
                                                Menunggu Bukti Transfer
                                            </span>
                                        ) : null}
                                    </div>

                                    <p className="text-sm font-medium text-ink truncate">
                                        {order.first_item_name}
                                        {order.items_count > 1 ? (
                                            <span className="text-xs text-slate ml-1">
                                                (+{order.items_count - 1} produk lainnya)
                                            </span>
                                        ) : null}
                                    </p>

                                    <p className="text-xs text-slate">
                                        Dipesan pada {order.created_at} • Total {order.items_count} barang
                                    </p>
                                </div>

                                <div className="flex flex-row items-center justify-between sm:flex-col sm:items-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-line">
                                    <div>
                                        <span className="text-[11px] text-slate block sm:text-right">
                                            Total Pembayaran
                                        </span>
                                        <span className="font-display text-base font-bold text-navy">
                                            {formatRupiah(order.total)}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {order.payment_status === 'pending' ? (
                                            <Button
                                                href={`/akun/pesanan/${order.code}`}
                                                size="sm"
                                                className="!bg-warning !text-navy hover:!bg-warning/90 font-semibold"
                                            >
                                                <FileUp className="h-3.5 w-3.5 mr-1" />
                                                Unggah Bukti
                                            </Button>
                                        ) : (
                                            <Button
                                                href={`/akun/pesanan/${order.code}`}
                                                variant="secondary"
                                                size="sm"
                                            >
                                                Rincian
                                                <ArrowRight className="h-3.5 w-3.5 ml-1" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Pagination */}
                        <div className="pt-2">
                            <Pagination links={orders.links} />
                        </div>
                    </div>
                )}
            </div>
        </PortalLayout>
    );
}
