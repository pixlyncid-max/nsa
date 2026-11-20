import AdminLayout from '@/Layouts/AdminLayout';
import CountUp from '@/Components/motion/CountUp';
import { RevealGroup, RevealItem } from '@/Components/motion/Reveal';
import Card from '@/Components/ui/Card';
import Button from '@/Components/ui/Button';
import Badge, { StatusBadge } from '@/Components/ui/Badge';
import { Link } from '@inertiajs/react';
import {
    Users,
    Clock,
    ShoppingBag,
    Wallet,
    ArrowRight,
    CheckCircle2,
    Eye,
    PackageCheck,
    AlertCircle,
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from 'recharts';

interface MetricItem {
    approved_members: number;
    pending_members: number;
    total_revenue: number;
    pending_orders: number;
    total_products: number;
}

interface ChartItem {
    month: string;
    total: number;
    approved: number;
}

interface PendingMember {
    id: number;
    name: string;
    email: string;
    phone: string;
    province: string;
    created_at: string;
}

interface PendingOrder {
    id: number;
    code: string;
    user_name: string;
    total: number;
    payment_method: string;
    proof_path: string | null;
    created_at: string;
}

interface TranslationAlert {
    failedCount: number;
    threshold: number;
}

interface DashboardProps {
    metrics: MetricItem;
    chart: ChartItem[];
    pendingMembers: PendingMember[];
    pendingOrders: PendingOrder[];
    translationAlert?: TranslationAlert | null;
}

export default function Dashboard({
    metrics,
    chart,
    pendingMembers,
    pendingOrders,
    translationAlert,
}: DashboardProps) {
    const formatRupiah = (val: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(val);
    };

    return (
        <AdminLayout title="Dasbor Pengelola NSA">
            <div className="space-y-8">
                {translationAlert ? (
                    <div
                        role="alert"
                        className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-danger/30 bg-rose-50/80 px-4 py-3 text-sm text-danger"
                    >
                        <div className="flex items-center gap-2.5">
                            <AlertCircle className="h-5 w-5 shrink-0" />
                            <span>
                                <strong>{translationAlert.failedCount} terjemahan gagal</strong>{' '}
                                melampaui ambang batas ({translationAlert.threshold}). Tinjau dan jalankan ulang di Pusat Terjemahan.
                            </span>
                        </div>
                        <Link
                            href="/admin/terjemahan?tab=content&status=failed"
                            className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-control bg-danger px-3 text-xs font-semibold text-white hover:bg-danger/90"
                        >
                            <span>Buka Pusat Terjemahan</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                    </div>
                ) : null}

                {/* 4 Kartu Ringkasan (anime.js CountUp + Framer stagger) */}
                <RevealGroup className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    <RevealItem>
                        <Card interactive className="flex h-full items-center gap-4 p-5">
                            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-control bg-success/10 text-success">
                                <Users className="h-6 w-6" strokeWidth={1.75} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate">
                                    Anggota Resmi
                                </p>
                                <p className="font-display text-2xl font-bold tabular-nums text-navy">
                                    <CountUp to={metrics.approved_members} />
                                </p>
                                <span className="text-xs text-slate">Aktif terverifikasi</span>
                            </div>
                        </Card>
                    </RevealItem>

                    <RevealItem>
                        <Card interactive className="flex h-full items-center gap-4 p-5">
                            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-control bg-warning/10 text-warning">
                                <Clock className="h-6 w-6" strokeWidth={1.75} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate">
                                    Menunggu Verifikasi
                                </p>
                                <p className="font-display text-2xl font-bold tabular-nums text-navy">
                                    <CountUp to={metrics.pending_members} />
                                </p>
                                <Link
                                    href="/admin/anggota?status=pending"
                                    className="inline-flex items-center gap-1 text-xs font-medium text-ocean hover:underline"
                                >
                                    Perlu ditinjau <ArrowRight className="h-3 w-3" />
                                </Link>
                            </div>
                        </Card>
                    </RevealItem>

                    <RevealItem>
                        <Card interactive className="flex h-full items-center gap-4 p-5">
                            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-control bg-ocean/10 text-ocean">
                                <Wallet className="h-6 w-6" strokeWidth={1.75} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate">
                                    Total Omzet Toko
                                </p>
                                <p className="font-display text-xl font-bold tabular-nums text-navy">
                                    {formatRupiah(metrics.total_revenue)}
                                </p>
                                <span className="text-xs text-slate">Pesanan terbayar</span>
                            </div>
                        </Card>
                    </RevealItem>

                    <RevealItem>
                        <Card interactive className="flex h-full items-center gap-4 p-5">
                            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-control bg-sky/15 text-sky">
                                <ShoppingBag className="h-6 w-6" strokeWidth={1.75} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate">
                                    Pesanan Perlu Konfirmasi
                                </p>
                                <p className="font-display text-2xl font-bold tabular-nums text-navy">
                                    <CountUp to={metrics.pending_orders} />
                                </p>
                                <Link
                                    href="/admin/pesanan?status=pending_payment"
                                    className="inline-flex items-center gap-1 text-xs font-medium text-ocean hover:underline"
                                >
                                    Cek bukti bayar <ArrowRight className="h-3 w-3" />
                                </Link>
                            </div>
                        </Card>
                    </RevealItem>
                </RevealGroup>

                {/* Grafik Pertumbuhan Pendaftaran Anggota */}
                <Card className="p-6">
                    <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                        <div>
                            <h3 className="font-display text-lg font-bold text-navy">
                                Tren Pendaftaran Anggota
                            </h3>
                            <p className="text-sm text-slate">
                                Perkembangan akun terdaftar dan disetujui selama 6 bulan terakhir
                            </p>
                        </div>
                        <Badge tone="info">Data Real-time</Badge>
                    </div>

                    <div className="h-72 w-full pt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#056ED4" stopOpacity={0.25} />
                                        <stop offset="95%" stopColor="#056ED4" stopOpacity={0.0} />
                                    </linearGradient>
                                    <linearGradient id="approvedGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.25} />
                                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0.0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
                                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#ffffff',
                                        borderRadius: '12px',
                                        border: '1px solid #e2e8f0',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                                        fontSize: '13px',
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="total"
                                    name="Pendaftar"
                                    stroke="#056ED4"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#totalGrad)"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="approved"
                                    name="Disetujui"
                                    stroke="#22c55e"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#approvedGrad)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Bagian Perlu Tindakan */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Perlu Tindakan: Anggota Pending */}
                    <Card className="overflow-hidden p-6">
                        <div className="mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-warning" />
                                <h3 className="font-display text-base font-bold text-navy">
                                    Pendaftaran Anggota Pending
                                </h3>
                            </div>
                            <Button href="/admin/anggota?status=pending" variant="ghost" size="sm">
                                Lihat Semua
                            </Button>
                        </div>

                        {pendingMembers.length === 0 ? (
                            <div className="py-8 text-center text-sm text-slate">
                                <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-success" />
                                Tidak ada pendaftaran yang perlu ditinjau.
                            </div>
                        ) : (
                            <div className="divide-y divide-line overflow-hidden rounded-lg border border-line">
                                {pendingMembers.map((m) => (
                                    <div
                                        key={m.id}
                                        className="flex items-center justify-between p-3 text-sm transition hover:bg-mist"
                                    >
                                        <div className="min-w-0 pr-4">
                                            <p className="truncate font-semibold text-ink">{m.name}</p>
                                            <p className="truncate text-xs text-slate">
                                                {m.province} &bull; {m.created_at}
                                            </p>
                                        </div>
                                        <Button
                                            href={`/admin/anggota/${m.id}`}
                                            variant="secondary"
                                            size="sm"
                                            className="shrink-0"
                                        >
                                            Verifikasi
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>

                    {/* Perlu Tindakan: Pesanan Menunggu Pembayaran */}
                    <Card className="overflow-hidden p-6">
                        <div className="mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <PackageCheck className="h-5 w-5 text-ocean" />
                                <h3 className="font-display text-base font-bold text-navy">
                                    Pesanan Menunggu Konfirmasi Bayar
                                </h3>
                            </div>
                            <Button href="/admin/pesanan?status=pending_payment" variant="ghost" size="sm">
                                Lihat Semua
                            </Button>
                        </div>

                        {pendingOrders.length === 0 ? (
                            <div className="py-8 text-center text-sm text-slate">
                                <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-success" />
                                Semua konfirmasi pembayaran telah diproses.
                            </div>
                        ) : (
                            <div className="divide-y divide-line overflow-hidden rounded-lg border border-line">
                                {pendingOrders.map((o) => (
                                    <div
                                        key={o.id}
                                        className="flex items-center justify-between p-3 text-sm transition hover:bg-mist"
                                    >
                                        <div className="min-w-0 pr-4">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-xs font-semibold text-navy">
                                                    #{o.code}
                                                </span>
                                                <Badge tone="pending">Konfirmasi</Badge>
                                            </div>
                                            <p className="mt-0.5 truncate text-xs text-slate">
                                                {o.user_name} &bull; {formatRupiah(o.total)}
                                            </p>
                                        </div>
                                        <Button
                                            href={`/admin/pesanan/${o.id}`}
                                            variant="secondary"
                                            size="sm"
                                            className="shrink-0"
                                        >
                                            Detail
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
}
