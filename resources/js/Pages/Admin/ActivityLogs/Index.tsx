import AdminLayout from '@/Layouts/AdminLayout';
import Card from '@/Components/ui/Card';
import Button from '@/Components/ui/Button';
import Input from '@/Components/ui/Input';
import Modal from '@/Components/ui/Modal';
import Pagination from '@/Components/ui/Pagination';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import { Activity, Search, ShieldCheck, Eye, Clock, User } from 'lucide-react';

interface LogItem {
    id: number;
    user_name: string;
    action: string;
    subject: string | null;
    meta: any;
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

interface ActivityLogsProps {
    logs: PaginatedData<LogItem>;
    filters: {
        search?: string;
        action?: string;
    };
}

export default function ActivityLogsIndex({ logs, filters }: ActivityLogsProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedLog, setSelectedLog] = useState<LogItem | null>(null);

    const handleFilter = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        router.get(
            '/admin/log-aktivitas',
            {
                search: search || undefined,
            },
            { preserveState: true }
        );
    };

    return (
        <AdminLayout title="Log Aktivitas & Audit Trail">
            <div className="space-y-6">
                <div>
                    <span className="rounded bg-danger/10 px-2 py-0.5 text-xs font-bold text-danger">
                        Khusus Superadmin
                    </span>
                    <h2 className="font-display text-xl font-bold text-navy mt-1">
                        Rekam Jejak Aktivitas & Audit Trail
                    </h2>
                    <p className="text-sm text-slate">
                        Seluruh aksi penting (verifikasi anggota, perubahan harga, transaksi, penghapusan) tercatat otomatis
                    </p>
                </div>

                {/* Filter */}
                <Card className="p-4">
                    <form onSubmit={handleFilter} className="flex gap-2 max-w-md">
                        <Input
                            placeholder="Cari aktivitas, nama staf, subjek..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            leading={<Search className="h-4 w-4 text-slate" />}
                        />
                        <Button type="submit" variant="secondary" size="md">
                            Cari
                        </Button>
                    </form>
                </Card>

                {/* Table */}
                <Card className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-line bg-mist text-xs font-semibold uppercase text-slate">
                                <tr>
                                    <th className="px-4 py-3.5">Waktu Kejadian</th>
                                    <th className="px-4 py-3.5">Pengguna / Staf</th>
                                    <th className="px-4 py-3.5">Jenis Aksi</th>
                                    <th className="px-4 py-3.5">Deskripsi / Subjek</th>
                                    <th className="px-4 py-3.5 text-right">Detail Meta</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-line">
                                {logs.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-12 text-center text-slate">
                                            Belum ada rekam log aktivitas yang cocok.
                                        </td>
                                    </tr>
                                ) : (
                                    logs.data.map((l) => (
                                        <tr key={l.id} className="h-14 transition hover:bg-mist/70">
                                            <td className="px-4 py-3 font-mono text-xs text-slate">
                                                {l.created_at}
                                            </td>
                                            <td className="px-4 py-3 font-medium text-ink">
                                                <div className="flex items-center gap-1.5">
                                                    <User className="h-3.5 w-3.5 text-slate" />
                                                    {l.user_name}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="rounded bg-navy/10 px-2 py-0.5 font-mono text-xs font-semibold text-navy">
                                                    {l.action}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 max-w-sm truncate text-slate">
                                                {l.subject || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                {l.meta ? (
                                                    <button
                                                        onClick={() => setSelectedLog(l)}
                                                        className="inline-flex h-8 items-center gap-1 rounded-lg border border-line px-2.5 text-xs font-semibold text-ocean hover:bg-ocean/5"
                                                    >
                                                        <Eye className="h-3.5 w-3.5" /> Meta
                                                    </button>
                                                ) : (
                                                    <span className="text-xs text-slate">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {logs.last_page > 1 && (
                        <div className="border-t border-line p-4">
                            <Pagination
                                page={logs.current_page}
                                lastPage={logs.last_page}
                                onChange={(p) =>
                                    router.get(
                                        '/admin/log-aktivitas',
                                        { search: search || undefined, page: p },
                                        { preserveState: true }
                                    )
                                }
                            />
                        </div>
                    )}
                </Card>
            </div>

            {/* Modal Detail Meta */}
            <Modal
                open={!!selectedLog}
                onClose={() => setSelectedLog(null)}
                title={selectedLog?.action ? `Log: ${selectedLog.action}` : 'Detail Rekam Aktivitas'}
                size="md"
            >
                {selectedLog && (
                    <div className="p-6 space-y-4">
                        <div className="flex items-center justify-between border-b border-line pb-3">
                            <div>
                                <span className="font-mono text-xs font-bold text-navy uppercase">
                                    {selectedLog.action}
                                </span>
                                <h3 className="font-display text-base font-bold text-navy mt-1">
                                    {selectedLog.subject || 'Detail Rekam Aktivitas'}
                                </h3>
                                <p className="text-xs text-slate">
                                    Oleh: {selectedLog.user_name} &bull; {selectedLog.created_at}
                                </p>
                            </div>
                        </div>

                        <div>
                            <span className="block text-xs font-semibold text-slate mb-1">
                                Data Metadata (JSON):
                            </span>
                            <pre className="max-h-64 overflow-auto rounded-lg bg-navy p-3 text-xs text-white font-mono leading-relaxed">
                                {JSON.stringify(selectedLog.meta, null, 2)}
                            </pre>
                        </div>

                        <div className="flex justify-end pt-2">
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setSelectedLog(null)}
                            >
                                Tutup
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </AdminLayout>
    );
}
