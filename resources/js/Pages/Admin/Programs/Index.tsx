import Badge from '@/Components/ui/Badge';
import Button from '@/Components/ui/Button';
import Card from '@/Components/ui/Card';
import AdminLayout from '@/Layouts/AdminLayout';
import { Link, router } from '@inertiajs/react';
import {
    ArrowDown,
    ArrowUp,
    Calendar,
    Check,
    Edit,
    ExternalLink,
    Filter,
    GripVertical,
    Lock,
    Plus,
    Search,
    Trash2,
    Users,
} from 'lucide-react';
import { useState, type ChangeEvent, type FormEvent } from 'react';

interface ProgramRow {
    id: number;
    title: string;
    slug: string;
    category: string;
    category_label: string;
    summary: string | null;
    status: 'draft' | 'published';
    is_public: boolean;
    cover_url: string | null;
    starts_at: string | null;
    ends_at: string | null;
    order: number;
    registrations_count: number;
}

interface CategoryOption {
    value: string;
    label: string;
}

interface ProgramsIndexProps {
    programs: ProgramRow[];
    categories: CategoryOption[];
    filters: {
        search: string;
        category: string;
        status: string;
    };
}

export default function ProgramsIndex({
    programs,
    categories,
    filters,
}: ProgramsIndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedCategory, setSelectedCategory] = useState(
        filters.category || ''
    );
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '');
    const [items, setItems] = useState<ProgramRow[]>(programs);
    const [hasReordered, setHasReordered] = useState(false);
    const [savingOrder, setSavingOrder] = useState(false);

    // Filter submit
    const handleFilterSubmit = (e: FormEvent) => {
        e.preventDefault();
        router.get(
            '/admin/programs',
            {
                search,
                category: selectedCategory,
                status: selectedStatus,
            },
            { preserveState: true }
        );
    };

    // Reorder: Move Item Up
    const moveItem = (index: number, direction: 'up' | 'down') => {
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= items.length) return;

        const updated = [...items];
        const temp = updated[index];
        updated[index] = updated[targetIndex];
        updated[targetIndex] = temp;

        // Assign new order numbers sequentially
        const reindexed = updated.map((item, idx) => ({
            ...item,
            order: idx + 1,
        }));

        setItems(reindexed);
        setHasReordered(true);
    };

    // Simpan Urutan Baru ke Backend
    const saveNewOrder = () => {
        setSavingOrder(true);
        const orderPayload = items.map((it, idx) => ({
            id: it.id,
            order: idx + 1,
        }));

        router.post(
            '/admin/programs/reorder',
            { orders: orderPayload },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setHasReordered(false);
                    setSavingOrder(false);
                },
                onError: () => setSavingOrder(false),
            }
        );
    };

    // Hapus Program
    const handleDelete = (prog: ProgramRow) => {
        if (confirm(`Apakah Anda yakin ingin menghapus program "${prog.title}"?`)) {
            router.delete(`/admin/programs/${prog.id}`, {
                preserveScroll: true,
            });
        }
    };

    return (
        <AdminLayout title="Program Kerja">
            <div className="space-y-6">
                {/* Header Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-5">
                    <div>
                        <h1 className="font-display text-2xl font-bold text-navy">
                            Kelola Program Kerja NSA
                        </h1>
                        <p className="text-xs text-slate mt-0.5">
                            Atur program kerja terstruktur, audiens target (publik atau khusus anggota), dan urutan prioritas.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {hasReordered ? (
                            <Button
                                onClick={saveNewOrder}
                                size="sm"
                                loading={savingOrder}
                                className="!bg-emerald-600 hover:!bg-emerald-700 !text-white font-semibold shadow-soft"
                            >
                                <Check className="h-4 w-4 mr-1.5" />
                                Simpan Urutan
                            </Button>
                        ) : null}

                        <Button href="/admin/programs/create" size="sm">
                            <Plus className="h-4 w-4 mr-1.5" />
                            Tambah Program
                        </Button>
                    </div>
                </div>

                {/* Filter & Search Bar */}
                <Card className="p-4 border-line shadow-soft bg-white">
                    <form
                        onSubmit={handleFilterSubmit}
                        className="flex flex-wrap items-center gap-3"
                    >
                        <div className="relative min-w-[220px] flex-1">
                            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate" />
                            <input
                                type="text"
                                placeholder="Cari judul program..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="h-10 w-full rounded-control border border-line bg-white pl-9 pr-3 text-xs md:text-sm text-ink placeholder:text-slate/60 focus:border-ocean focus:ring-2 focus:ring-ocean/15"
                            />
                        </div>

                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="h-10 rounded-control border border-line bg-white px-3 text-xs md:text-sm text-ink focus:border-ocean focus:ring-2 focus:ring-ocean/15"
                        >
                            <option value="">Semua Kategori</option>
                            {categories.map((c) => (
                                <option key={c.value} value={c.value}>
                                    {c.label}
                                </option>
                            ))}
                        </select>

                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="h-10 rounded-control border border-line bg-white px-3 text-xs md:text-sm text-ink focus:border-ocean focus:ring-2 focus:ring-ocean/15"
                        >
                            <option value="">Semua Status</option>
                            <option value="published">Terbit (Published)</option>
                            <option value="draft">Draf (Draft)</option>
                        </select>

                        <Button type="submit" variant="secondary" size="sm">
                            <Filter className="h-3.5 w-3.5 mr-1.5" />
                            Filter
                        </Button>
                    </form>
                </Card>

                {/* Table Program List */}
                <Card className="border-line shadow-soft overflow-hidden p-0 bg-white">
                    {items.length === 0 ? (
                        <div className="py-12 text-center text-slate">
                            <Calendar className="mx-auto h-12 w-12 text-slate/40 mb-3" />
                            <p className="font-semibold text-sm text-navy">
                                Belum ada program kerja
                            </p>
                            <p className="text-xs text-slate mt-1 max-w-sm mx-auto">
                                Buat program kerja baru untuk pelatihan, pendampingan, atau informasi pasar.
                            </p>
                            <div className="mt-4">
                                <Button href="/admin/programs/create" size="sm">
                                    <Plus className="h-3.5 w-3.5 mr-1" />
                                    Tambah Program Baru
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs md:text-sm">
                                <thead className="border-b border-line bg-mist/60 text-slate uppercase text-[11px] font-bold tracking-wider">
                                    <tr>
                                        <th className="px-4 py-3.5 text-center w-16">
                                            Urutan
                                        </th>
                                        <th className="px-4 py-3.5">Program</th>
                                        <th className="px-4 py-3.5">Kategori</th>
                                        <th className="px-4 py-3.5">Target Audiens</th>
                                        <th className="px-4 py-3.5">Status</th>
                                        <th className="px-4 py-3.5 text-center">
                                            Peserta
                                        </th>
                                        <th className="px-4 py-3.5 text-right">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-line text-ink font-medium">
                                    {items.map((prog, idx) => (
                                        <tr
                                            key={prog.id}
                                            className="hover:bg-mist/30 transition-colors"
                                        >
                                            {/* Kolom Urutan + Tombol Naik/Turun */}
                                            <td className="px-3 py-3 text-center whitespace-nowrap">
                                                <div className="flex items-center justify-center gap-1">
                                                    <span className="font-mono font-bold text-navy w-5 text-center">
                                                        {prog.order}
                                                    </span>
                                                    <div className="flex flex-col gap-0.5">
                                                        <button
                                                            type="button"
                                                            disabled={idx === 0}
                                                            onClick={() => moveItem(idx, 'up')}
                                                            title="Geser ke atas"
                                                            className="p-0.5 rounded text-slate hover:text-ocean disabled:opacity-20 disabled:cursor-not-allowed"
                                                        >
                                                            <ArrowUp className="h-3.5 w-3.5" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            disabled={idx === items.length - 1}
                                                            onClick={() => moveItem(idx, 'down')}
                                                            title="Geser ke bawah"
                                                            className="p-0.5 rounded text-slate hover:text-ocean disabled:opacity-20 disabled:cursor-not-allowed"
                                                        >
                                                            <ArrowDown className="h-3.5 w-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Program Info */}
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    {prog.cover_url ? (
                                                        <img
                                                            src={prog.cover_url}
                                                            alt={prog.title}
                                                            className="h-10 w-14 shrink-0 rounded-control object-cover border border-line"
                                                        />
                                                    ) : (
                                                        <div className="h-10 w-14 shrink-0 rounded-control bg-mist grid place-items-center text-slate">
                                                            <Calendar className="h-4 w-4" />
                                                        </div>
                                                    )}
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-navy text-sm truncate max-w-md">
                                                            {prog.title}
                                                        </p>
                                                        <p className="text-[11px] text-slate truncate max-w-sm mt-0.5">
                                                            {prog.summary || 'Tidak ada ringkasan'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Kategori */}
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <span className="inline-flex items-center rounded-full bg-ocean/10 px-2.5 py-0.5 text-xs font-semibold text-ocean">
                                                    {prog.category_label}
                                                </span>
                                            </td>

                                            {/* Audiens Target */}
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                {prog.is_public ? (
                                                    <span className="inline-flex items-center rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                                                        Terbuka untuk Umum
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700">
                                                        <Lock className="h-3 w-3" />
                                                        Khusus Anggota
                                                    </span>
                                                )}
                                            </td>

                                            {/* Status */}
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                {prog.status === 'published' ? (
                                                    <Badge tone="approved">Terbit</Badge>
                                                ) : (
                                                    <Badge tone="neutral">Draf</Badge>
                                                )}
                                            </td>

                                            {/* Peserta */}
                                            <td className="px-4 py-3 text-center whitespace-nowrap">
                                                <span className="inline-flex items-center gap-1 font-semibold text-slate">
                                                    <Users className="h-3.5 w-3.5 text-ocean" />
                                                    {prog.registrations_count}
                                                </span>
                                            </td>

                                            {/* Aksi */}
                                            <td className="px-4 py-3 text-right whitespace-nowrap">
                                                <div className="inline-flex items-center gap-2">
                                                    <a
                                                        href={`/program/${prog.slug}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        title="Lihat halaman publik"
                                                        className="grid h-8 w-8 place-items-center rounded-control text-slate hover:bg-mist hover:text-ocean transition-colors"
                                                    >
                                                        <ExternalLink className="h-4 w-4" />
                                                    </a>
                                                    <Link
                                                        href={`/admin/programs/${prog.id}/edit`}
                                                        title="Edit program"
                                                        className="grid h-8 w-8 place-items-center rounded-control text-slate hover:bg-mist hover:text-navy transition-colors"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(prog)}
                                                        title="Hapus program"
                                                        className="grid h-8 w-8 place-items-center rounded-control text-slate hover:bg-danger/10 hover:text-danger transition-colors"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>
            </div>
        </AdminLayout>
    );
}
