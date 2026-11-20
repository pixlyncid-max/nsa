import AdminLayout from '@/Layouts/AdminLayout';
import Card from '@/Components/ui/Card';
import Button from '@/Components/ui/Button';
import Input from '@/Components/ui/Input';
import { StatusBadge } from '@/Components/ui/Badge';
import Pagination from '@/Components/ui/Pagination';
import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    Search,
    FileSpreadsheet,
    Eye,
    ShoppingBag,
    CheckCircle2,
} from 'lucide-react';

interface OrderItem {
    id: number;
    code: string;
    user_name: string;
    user_email: string | null;
    status: string;
    subtotal: number;
    shipping_cost: number;
    total: number;
    payment_status: string;
    payment_method: string;
    has_proof: boolean;
    created_at: string;
}

interface PaginatedData<T> {
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
    orders: PaginatedData<OrderItem>;
    filters: {
        search?: string;
        status?: string;
        sort?: string;
    };
    statusOptions: Array<{ value: string; label: string }>;
}

export default function OrdersIndex({
    orders,
    filters,
    statusOptions,
}: OrdersIndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');

    const formatRupiah = (val: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(val);
    };

    const handleFilter = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        router.get(
            '/admin/pesanan',
            {
                search: search || undefined,
                status: status || undefined,
            },
            { preserveState: true }
        );
    };

    return (
        <AdminLayout title="Pesanan & Transaksi">
            <div className="space-y-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h2 className="font-display text-xl font-bold text-navy">
                            Daftar Pesanan Toko NSA
                        </h2>
                        <p className="text-sm text-slate">
                            Konfirmasi bukti pembayaran, perbarui status pengiriman, dan ekspor riwayat transaksi
                        </p>
                    </div>
                    <a
                        href={`/admin/pesanan/ekspor-csv?${new URLSearchParams({
                            status: status || '',
                            search: search || '',
                        }).toString()}`}
                        className="inline-flex h-10 items-center gap-2 rounded-lg border border-line bg-white px-4 text-xs font-semibold text-navy transition hover:bg-mist shadow-sm"
                    >
                        <FileSpreadsheet className="h-4 w-4 text-success" />
                        Ekspor CSV
                    </a>
                </div>

                {/* Filter */}
                <Card className="p-5">
                    <form onSubmit={handleFilter} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="sm:col-span-2">
                            <Input
                                placeholder="Cari kode pesanan, nama pembeli, email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                leading={<Search className="h-4 w-4 text-slate" />}
                            />
                        </div>

                        <div>
                            <select
                                className="h-11 w-full rounded-control border border-line bg-white px-3 text-sm text-ink focus:border-ocean focus:outline-none focus:ring-2 focus:ring-ocean/15"
                                value={status}
                                onChange={(e) => {
                                    setStatus(e.target.value);
                                    router.get(
                                        '/admin/pesanan',
                                        {
                                            search: search || undefined,
                                            status: e.target.value || undefined,
                                        },
                                        { preserveState: true }
                                    );
                                }}
                            >
                                <option value="">Semua Status Pesanan</option>
                                {statusOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </form>
                </Card>

                {/* Table */}
                <Card className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-line bg-mist text-xs font-semibold uppercase text-slate">
                                <tr>
                                    <th className="px-4 py-3.5">Kode Pesanan</th>
                                    <th className="px-4 py-3.5">Pembeli</th>
                                    <th className="px-4 py-3.5">Total Belanja</th>
                                    <th className="px-4 py-3.5">Status Pesanan</th>
                                    <th className="px-4 py-3.5">Bukti Bayar</th>
                                    <th className="px-4 py-3.5">Tanggal</th>
                                    <th className="px-4 py-3.5 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-line">
                                {orders.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-12 text-center text-slate">
                                            Tidak ada pesanan yang sesuai filter.
                                        </td>
                                    </tr>
                                ) : (
                                    orders.data.map((o) => (
                                        <tr key={o.id} className="h-16 transition hover:bg-mist/70">
                                            <td className="px-4 py-3 font-mono font-bold text-navy">
                                                #{o.code}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="font-semibold text-ink">{o.user_name}</div>
                                                <div className="text-xs text-slate">{o.user_email || '-'}</div>
                                            </td>
                                            <td className="px-4 py-3 font-semibold text-navy">
                                                {formatRupiah(o.total)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <StatusBadge status={o.status} />
                                            </td>
                                            <td className="px-4 py-3">
                                                {o.has_proof ? (
                                                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-success">
                                                        <CheckCircle2 className="h-3.5 w-3.5" /> Terlampir
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-slate">Belum ada</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-xs text-slate">
                                                {o.created_at}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <Link
                                                    href={`/admin/pesanan/${o.id}`}
                                                    className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-line bg-white px-3 text-xs font-semibold text-ocean transition hover:border-ocean hover:bg-ocean/5"
                                                >
                                                    <Eye className="h-3.5 w-3.5" />
                                                    Detail
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {orders.last_page > 1 && (
                        <div className="border-t border-line p-4">
                            <Pagination
                                page={orders.current_page}
                                lastPage={orders.last_page}
                                onChange={(p) => router.get('/admin/pesanan', { ...filters, page: p }, { preserveState: true })}
                            />
                        </div>
                    )}
                </Card>
            </div>
        </AdminLayout>
    );
}
