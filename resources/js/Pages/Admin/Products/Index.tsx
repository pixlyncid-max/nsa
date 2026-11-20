import AdminLayout from '@/Layouts/AdminLayout';
import Card from '@/Components/ui/Card';
import Button from '@/Components/ui/Button';
import Input from '@/Components/ui/Input';
import Badge from '@/Components/ui/Badge';
import Pagination from '@/Components/ui/Pagination';
import { Link, router, usePage } from '@inertiajs/react';
import type { PageProps } from '@/types';
import { useState } from 'react';
import {
    Plus,
    Search,
    Package,
    FolderTree,
    Edit,
    Trash2,
    Eye,
    CheckCircle2,
    XCircle,
} from 'lucide-react';

interface ProductItem {
    id: number;
    name: string;
    slug: string;
    type: string;
    category_name: string;
    price: number;
    member_price: number | null;
    stock: number;
    weight: number;
    location: string | null;
    is_active: boolean;
    primary_image: string | null;
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

interface ProductsIndexProps {
    products: PaginatedData<ProductItem>;
    categories: Array<{ id: number; name: string; group: string }>;
    filters: {
        search?: string;
        category_id?: string;
        type?: string;
        is_active?: string;
        sort?: string;
    };
    typeOptions: Array<{ value: string; label: string }>;
}

export default function ProductsIndex({
    products,
    categories,
    filters,
    typeOptions,
}: ProductsIndexProps) {
    const { auth } = usePage<PageProps>().props;
    const isSuperadmin = auth.user?.role === 'superadmin';

    const [search, setSearch] = useState(filters.search || '');
    const [categoryId, setCategoryId] = useState(filters.category_id || '');
    const [type, setType] = useState(filters.type || '');

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
            '/admin/produk',
            {
                search: search || undefined,
                category_id: categoryId || undefined,
                type: type || undefined,
            },
            { preserveState: true }
        );
    };

    const handleDelete = (id: number, name: string) => {
        if (confirm(`Hapus produk "${name}"?`)) {
            router.delete(`/admin/produk/${id}`);
        }
    };

    return (
        <AdminLayout title="Katalog Produk NSA">
            <div className="space-y-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h2 className="font-display text-xl font-bold text-navy">
                            Manajemen Produk & Layanan
                        </h2>
                        <p className="text-sm text-slate">
                            Kelola komoditas, sewa, spot mancing, harga anggota, dan stok
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button href="/admin/kategori-produk" variant="secondary" size="md">
                            <FolderTree className="mr-1.5 h-4 w-4" />
                            Kelola Kategori
                        </Button>
                        <Button href="/admin/produk/create" variant="primary" size="md">
                            <Plus className="mr-1.5 h-4 w-4" />
                            Tambah Produk
                        </Button>
                    </div>
                </div>

                {/* Filter */}
                <Card className="p-5">
                    <form onSubmit={handleFilter} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="lg:col-span-2">
                            <Input
                                placeholder="Cari nama produk, deskripsi..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                leading={<Search className="h-4 w-4 text-slate" />}
                            />
                        </div>

                        <div>
                            <select
                                className="h-11 w-full rounded-control border border-line bg-white px-3 text-sm text-ink focus:border-ocean focus:outline-none focus:ring-2 focus:ring-ocean/15"
                                value={categoryId}
                                onChange={(e) => {
                                    setCategoryId(e.target.value);
                                    router.get(
                                        '/admin/produk',
                                        {
                                            search: search || undefined,
                                            category_id: e.target.value || undefined,
                                            type: type || undefined,
                                        },
                                        { preserveState: true }
                                    );
                                }}
                            >
                                <option value="">Semua Kategori</option>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name} ({c.group})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <select
                                className="h-11 w-full rounded-control border border-line bg-white px-3 text-sm text-ink focus:border-ocean focus:outline-none focus:ring-2 focus:ring-ocean/15"
                                value={type}
                                onChange={(e) => {
                                    setType(e.target.value);
                                    router.get(
                                        '/admin/produk',
                                        {
                                            search: search || undefined,
                                            category_id: categoryId || undefined,
                                            type: e.target.value || undefined,
                                        },
                                        { preserveState: true }
                                    );
                                }}
                            >
                                <option value="">Semua Tipe</option>
                                {typeOptions.map((t) => (
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
                                    <th className="px-4 py-3.5">Produk</th>
                                    <th className="px-4 py-3.5">Kategori / Tipe</th>
                                    <th className="px-4 py-3.5">Harga Publik</th>
                                    <th className="px-4 py-3.5">Harga Anggota</th>
                                    <th className="px-4 py-3.5">Stok</th>
                                    <th className="px-4 py-3.5">Status</th>
                                    <th className="px-4 py-3.5 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-line">
                                {products.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-12 text-center text-slate">
                                            Tidak ada produk yang ditemukan.
                                        </td>
                                    </tr>
                                ) : (
                                    products.data.map((p) => (
                                        <tr key={p.id} className="h-16 transition hover:bg-mist/70">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    {p.primary_image ? (
                                                        <img
                                                            src={p.primary_image}
                                                            alt={p.name}
                                                            className="h-12 w-12 rounded-lg object-cover border border-line"
                                                        />
                                                    ) : (
                                                        <div className="grid h-12 w-12 place-items-center rounded-lg bg-mist border border-line text-slate">
                                                            <Package className="h-5 w-5" />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-semibold text-ink">{p.name}</p>
                                                        <span className="text-xs text-slate">{p.location || 'Nasional'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-ink">{p.category_name}</div>
                                                <span className="text-xs capitalize text-slate">{p.type}</span>
                                            </td>
                                            <td className="px-4 py-3 font-semibold text-navy">
                                                {formatRupiah(p.price)}
                                            </td>
                                            <td className="px-4 py-3 font-semibold text-ocean">
                                                {p.member_price !== null ? formatRupiah(p.member_price) : '-'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={p.stock <= 5 ? 'font-bold text-danger' : 'text-ink'}>
                                                    {p.stock} unit
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                {p.is_active ? (
                                                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-success">
                                                        <CheckCircle2 className="h-3.5 w-3.5" /> Aktif
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate">
                                                        <XCircle className="h-3.5 w-3.5" /> Non-aktif
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <Link
                                                        href={`/admin/produk/${p.id}/edit`}
                                                        className="inline-flex h-8 items-center gap-1 rounded-lg border border-line px-2.5 text-xs font-semibold text-ink hover:bg-mist"
                                                    >
                                                        <Edit className="h-3.5 w-3.5" />
                                                        Edit
                                                    </Link>
                                                    {isSuperadmin && (
                                                        <button
                                                            onClick={() => handleDelete(p.id, p.name)}
                                                            className="inline-flex h-8 items-center rounded-lg border border-line px-2 text-xs font-semibold text-danger hover:bg-danger/10"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {products.last_page > 1 && (
                        <div className="border-t border-line p-4">
                            <Pagination
                                page={products.current_page}
                                lastPage={products.last_page}
                                onChange={(p) => router.get('/admin/produk', { ...filters, page: p }, { preserveState: true })}
                            />
                        </div>
                    )}
                </Card>
            </div>
        </AdminLayout>
    );
}
