import AdminLayout from '@/Layouts/AdminLayout';
import Card from '@/Components/ui/Card';
import Button from '@/Components/ui/Button';
import Input from '@/Components/ui/Input';
import Pagination from '@/Components/ui/Pagination';
import Modal from '@/Components/ui/Modal';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import {
    Inbox,
    Search,
    CheckCircle2,
    Trash2,
    Mail,
    Eye,
    Clock,
} from 'lucide-react';

interface MessageItem {
    id: number;
    name: string;
    email: string;
    topic: string;
    message: string;
    is_read: boolean;
    read_at: string | null;
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

interface MessagesProps {
    messages: PaginatedData<MessageItem>;
    filters: {
        search?: string;
        topic?: string;
    };
    topics: Array<{ value: string; label: string }>;
}

export default function MessagesIndex({ messages, filters, topics }: MessagesProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [topic, setTopic] = useState(filters.topic || '');
    const [selectedMessage, setSelectedMessage] = useState<MessageItem | null>(null);

    const handleFilter = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        router.get(
            '/admin/pesan',
            {
                search: search || undefined,
                topic: topic || undefined,
            },
            { preserveState: true }
        );
    };

    const handleOpenMessage = (msg: MessageItem) => {
        setSelectedMessage(msg);
        if (!msg.is_read) {
            router.patch(`/admin/pesan/${msg.id}/baca`, {}, { preserveScroll: true });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Hapus pesan ini?')) {
            router.delete(`/admin/pesan/${id}`, {
                onSuccess: () => setSelectedMessage(null),
            });
        }
    };

    return (
        <AdminLayout title="Pesan Kontak & Kemitraan">
            <div className="space-y-6">
                <div>
                    <h2 className="font-display text-xl font-bold text-navy">
                        Pesan Masuk & Ajuan Kemitraan
                    </h2>
                    <p className="text-sm text-slate">
                        Tinjau pertanyaan publik, permohonan kerjasama, dan ajuan kemitraan organisasi
                    </p>
                </div>

                {/* Filter */}
                <Card className="p-4">
                    <form onSubmit={handleFilter} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="sm:col-span-2">
                            <Input
                                placeholder="Cari nama, email pengirim, pesan..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                leading={<Search className="h-4 w-4 text-slate" />}
                            />
                        </div>

                        <div>
                            <select
                                className="h-11 w-full rounded-control border border-line bg-white px-3 text-sm text-ink focus:border-ocean focus:outline-none focus:ring-2 focus:ring-ocean/15"
                                value={topic}
                                onChange={(e) => {
                                    setTopic(e.target.value);
                                    router.get(
                                        '/admin/pesan',
                                        {
                                            search: search || undefined,
                                            topic: e.target.value || undefined,
                                        },
                                        { preserveState: true }
                                    );
                                }}
                            >
                                <option value="">Semua Topik</option>
                                {topics.map((t) => (
                                    <option key={t.value} value={t.value}>
                                        {t.label}
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
                                    <th className="px-4 py-3.5">Status</th>
                                    <th className="px-4 py-3.5">Pengirim</th>
                                    <th className="px-4 py-3.5">Topik</th>
                                    <th className="px-4 py-3.5">Pesan</th>
                                    <th className="px-4 py-3.5">Waktu</th>
                                    <th className="px-4 py-3.5 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-line">
                                {messages.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center text-slate">
                                            Tidak ada pesan masuk.
                                        </td>
                                    </tr>
                                ) : (
                                    messages.data.map((m) => (
                                        <tr
                                            key={m.id}
                                            className={`h-16 transition hover:bg-mist/70 cursor-pointer ${
                                                !m.is_read ? 'bg-ocean/5 font-medium' : ''
                                            }`}
                                            onClick={() => handleOpenMessage(m)}
                                        >
                                            <td className="px-4 py-3">
                                                {m.is_read ? (
                                                    <span className="text-xs text-slate">Dibaca</span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-ocean px-2 py-0.5 text-[10px] font-bold text-white">
                                                        Baru
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="font-semibold text-ink">{m.name}</div>
                                                <div className="text-xs text-slate">{m.email}</div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="rounded bg-mist px-2 py-0.5 text-xs font-medium text-navy uppercase">
                                                    {m.topic}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 max-w-xs truncate text-slate">
                                                {m.message}
                                            </td>
                                            <td className="px-4 py-3 text-xs text-slate">
                                                {m.created_at}
                                            </td>
                                            <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                                                <button
                                                    onClick={() => handleDelete(m.id)}
                                                    className="p-1.5 text-slate hover:text-danger rounded-lg transition"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {messages.last_page > 1 && (
                        <div className="border-t border-line p-4">
                            <Pagination
                                page={messages.current_page}
                                lastPage={messages.last_page}
                                onChange={(p) =>
                                    router.get(
                                        '/admin/pesan',
                                        {
                                            search: search || undefined,
                                            topic: topic || undefined,
                                            page: p,
                                        },
                                        { preserveState: true }
                                    )
                                }
                            />
                        </div>
                    )}
                </Card>
            </div>

            {/* Modal Detail Pesan */}
            <Modal
                open={!!selectedMessage}
                onClose={() => setSelectedMessage(null)}
                title={selectedMessage ? `Pesan: ${selectedMessage.topic}` : 'Detail Pesan'}
                size="md"
            >
                {selectedMessage && (
                    <div className="p-6 space-y-4">
                        <div className="flex items-center justify-between border-b border-line pb-3">
                            <div>
                                <span className="rounded bg-ocean/10 px-2 py-0.5 text-xs font-bold text-ocean uppercase">
                                    {selectedMessage.topic}
                                </span>
                                <h3 className="font-display text-lg font-bold text-navy mt-1">
                                    {selectedMessage.name}
                                </h3>
                                <p className="text-xs text-slate">{selectedMessage.email}</p>
                            </div>
                            <span className="text-xs text-slate">{selectedMessage.created_at}</span>
                        </div>

                        <div className="rounded-lg bg-mist p-4 text-sm text-ink leading-relaxed whitespace-pre-wrap">
                            {selectedMessage.message}
                        </div>

                        <div className="flex justify-between items-center pt-2">
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleDelete(selectedMessage.id)}
                                className="!text-danger !border-danger/30 hover:!bg-danger/10"
                            >
                                <Trash2 className="mr-1 h-3.5 w-3.5" /> Hapus
                            </Button>

                            <a
                                href={`mailto:${selectedMessage.email}?subject=Re: Pertanyaan NSA - ${selectedMessage.topic}`}
                                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-ocean px-4 text-xs font-semibold text-white hover:bg-ocean/90"
                            >
                                <Mail className="h-3.5 w-3.5" /> Balas via Email
                            </a>
                        </div>
                    </div>
                )}
            </Modal>
        </AdminLayout>
    );
}
