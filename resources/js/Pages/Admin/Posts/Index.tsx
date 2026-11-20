import AdminLayout from '@/Layouts/AdminLayout';
import Card from '@/Components/ui/Card';
import Button from '@/Components/ui/Button';
import Input from '@/Components/ui/Input';
import Badge from '@/Components/ui/Badge';
import Pagination from '@/Components/ui/Pagination';
import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    Plus,
    Search,
    Newspaper,
    Edit,
    Trash2,
    Calendar,
    CheckCircle2,
    Clock,
    FileText,
} from 'lucide-react';

interface PostItem {
    id: number;
    title: string;
    slug: string;
    type: string;
    category_name: string;
    author_name: string;
    status: string;
    cover_url: string | null;
    published_at: string | null;
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

interface PostsIndexProps {
    posts: PaginatedData<PostItem>;
    filters: {
        search?: string;
        type?: string;
        status?: string;
    };
    categories: Array<{ id: number; name: string }>;
}

export default function PostsIndex({ posts, filters, categories }: PostsIndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [type, setType] = useState(filters.type || '');
    const [status, setStatus] = useState(filters.status || '');

    const handleFilter = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        router.get(
            '/admin/pos',
            {
                search: search || undefined,
                type: type || undefined,
                status: status || undefined,
            },
            { preserveState: true }
        );
    };

    const handleDelete = (id: number, title: string) => {
        if (confirm(`Hapus pos "${title}"?`)) {
            router.delete(`/admin/pos/${id}`);
        }
    };

    return (
        <AdminLayout title="Berita & Artikel NSA">
            <div className="space-y-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h2 className="font-display text-xl font-bold text-navy">
                            Manajemen Konten Publikasi
                        </h2>
                        <p className="text-sm text-slate">
                            Tulis dan kelola artikel edukasi, siaran pers, dan berita perikanan
                        </p>
                    </div>
                    <Button href="/admin/pos/create" variant="primary" size="md">
                        <Plus className="mr-1.5 h-4 w-4" />
                        Tulis Pos Baru
                    </Button>
                </div>

                {/* Filter */}
                <Card className="p-5">
                    <form onSubmit={handleFilter} className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                        <div className="sm:col-span-2">
                            <Input
                                placeholder="Cari judul pos, cuplikan..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                leading={<Search className="h-4 w-4 text-slate" />}
                            />
                        </div>

                        <div>
                            <select
                                className="h-11 w-full rounded-control border border-line bg-white px-3 text-sm text-ink focus:border-ocean focus:outline-none focus:ring-2 focus:ring-ocean/15"
                                value={type}
                                onChange={(e) => {
                                    setType(e.target.value);
                                    router.get(
                                        '/admin/pos',
                                        {
                                            search: search || undefined,
                                            type: e.target.value || undefined,
                                            status: status || undefined,
                                        },
                                        { preserveState: true }
                                    );
                                }}
                            >
                                <option value="">Semua Tipe (Berita & Artikel)</option>
                                <option value="article">Artikel Edukasi</option>
                                <option value="news">Berita Terkini</option>
                            </select>
                        </div>

                        <div>
                            <select
                                className="h-11 w-full rounded-control border border-line bg-white px-3 text-sm text-ink focus:border-ocean focus:outline-none focus:ring-2 focus:ring-ocean/15"
                                value={status}
                                onChange={(e) => {
                                    setStatus(e.target.value);
                                    router.get(
                                        '/admin/pos',
                                        {
                                            search: search || undefined,
                                            type: type || undefined,
                                            status: e.target.value || undefined,
                                        },
                                        { preserveState: true }
                                    );
                                }}
                            >
                                <option value="">Semua Status</option>
                                <option value="published">Diterbitkan (Published)</option>
                                <option value="draft">Draf (Draft)</option>
                                <option value="scheduled">Dijadwalkan (Scheduled)</option>
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
                                    <th className="px-4 py-3.5">Judul & Sampul</th>
                                    <th className="px-4 py-3.5">Tipe / Kategori</th>
                                    <th className="px-4 py-3.5">Penulis</th>
                                    <th className="px-4 py-3.5">Status</th>
                                    <th className="px-4 py-3.5">Jadwal Terbit</th>
                                    <th className="px-4 py-3.5 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-line">
                                {posts.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center text-slate">
                                            Belum ada artikel atau berita yang dibuat.
                                        </td>
                                    </tr>
                                ) : (
                                    posts.data.map((p) => (
                                        <tr key={p.id} className="h-16 transition hover:bg-mist/70">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    {p.cover_url ? (
                                                        <img
                                                            src={p.cover_url}
                                                            alt={p.title}
                                                            className="h-12 w-16 rounded-lg object-cover border border-line"
                                                        />
                                                    ) : (
                                                        <div className="grid h-12 w-16 place-items-center rounded-lg bg-mist border border-line text-slate">
                                                            <Newspaper className="h-5 w-5" />
                                                        </div>
                                                    )}
                                                    <div className="max-w-md">
                                                        <p className="font-semibold text-ink line-clamp-1">{p.title}</p>
                                                        <span className="text-xs text-slate font-mono">/{p.slug}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="rounded bg-mist px-2 py-0.5 text-xs font-semibold text-navy">
                                                    {p.type === 'news' ? 'Berita' : 'Artikel'}
                                                </span>
                                                <p className="text-xs text-slate mt-0.5">{p.category_name}</p>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-slate">
                                                {p.author_name}
                                            </td>
                                            <td className="px-4 py-3">
                                                {p.status === 'published' ? (
                                                    <Badge tone="approved">Terbit</Badge>
                                                ) : p.status === 'scheduled' ? (
                                                    <Badge tone="revision">Jadwal</Badge>
                                                ) : (
                                                    <Badge tone="neutral">Draf</Badge>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-xs text-slate">
                                                {p.published_at || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <Link
                                                        href={`/admin/pos/${p.id}/edit`}
                                                        className="inline-flex h-8 items-center gap-1 rounded-lg border border-line px-2.5 text-xs font-semibold text-ink hover:bg-mist"
                                                    >
                                                        <Edit className="h-3.5 w-3.5" />
                                                        Edit
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(p.id, p.title)}
                                                        className="inline-flex h-8 items-center rounded-lg border border-line px-2 text-xs font-semibold text-danger hover:bg-danger/10"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {posts.last_page > 1 && (
                        <div className="border-t border-line p-4">
                            <Pagination
                                page={posts.current_page}
                                lastPage={posts.last_page}
                                onChange={(p) => router.get('/admin/pos', { ...filters, page: p }, { preserveState: true })}
                            />
                        </div>
                    )}
                </Card>
            </div>
        </AdminLayout>
    );
}
