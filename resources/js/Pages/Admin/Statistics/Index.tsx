import AdminLayout from '@/Layouts/AdminLayout';
import Card from '@/Components/ui/Card';
import Button from '@/Components/ui/Button';
import Input from '@/Components/ui/Input';
import Modal from '@/Components/ui/Modal';
import Pagination from '@/Components/ui/Pagination';
import { router, Link } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, Edit, Trash2, ChartColumn, Fish } from 'lucide-react';

interface SnapshotItem {
    id: number;
    province_id: number;
    province_name: string;
    fish_category_id: number | null;
    fish_category_name: string;
    year: number;
    farmer_count: number;
    source: string;
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

interface StatisticsProps {
    snapshots: PaginatedData<SnapshotItem>;
    provinces: Array<{ id: number; name: string }>;
    fishCategories: Array<{ id: number; name: string }>;
    filters: {
        province_id?: string;
        fish_category_id?: string;
        year?: string;
    };
}

export default function StatisticsIndex({
    snapshots,
    provinces,
    fishCategories,
    filters,
}: StatisticsProps) {
    const [provinceFilter, setProvinceFilter] = useState(filters.province_id || '');
    const [fishCatFilter, setFishCatFilter] = useState(filters.fish_category_id || '');

    const [modalOpen, setModalOpen] = useState(false);
    const [editingSnapshot, setEditingSnapshot] = useState<SnapshotItem | null>(null);

    const [provinceId, setProvinceId] = useState(String(provinces[0]?.id ?? ''));
    const [fishCategoryId, setFishCategoryId] = useState('');
    const [year, setYear] = useState(2025);
    const [farmerCount, setFarmerCount] = useState(100);
    const [source, setSource] = useState('Data Dinas Kelautan & Perikanan');

    const openCreate = () => {
        setEditingSnapshot(null);
        setProvinceId(String(provinces[0]?.id ?? ''));
        setFishCategoryId('');
        setYear(2025);
        setFarmerCount(100);
        setSource('Data Dinas Kelautan & Perikanan');
        setModalOpen(true);
    };

    const openEdit = (s: SnapshotItem) => {
        setEditingSnapshot(s);
        setProvinceId(String(s.province_id));
        setFishCategoryId(s.fish_category_id ? String(s.fish_category_id) : '');
        setYear(s.year);
        setFarmerCount(s.farmer_count);
        setSource(s.source);
        setModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            province_id: Number(provinceId),
            fish_category_id: fishCategoryId ? Number(fishCategoryId) : null,
            year: Number(year),
            farmer_count: Number(farmerCount),
            source,
        };

        if (editingSnapshot) {
            router.put(`/admin/statistik/${editingSnapshot.id}`, payload, {
                onSuccess: () => setModalOpen(false),
            });
        } else {
            router.post('/admin/statistik', payload, {
                onSuccess: () => setModalOpen(false),
            });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Hapus entri data statistik ini?')) {
            router.delete(`/admin/statistik/${id}`);
        }
    };

    const handleFilterChange = (prov: string, fish: string) => {
        router.get(
            '/admin/statistik',
            {
                province_id: prov || undefined,
                fish_category_id: fish || undefined,
            },
            { preserveState: true }
        );
    };

    return (
        <AdminLayout title="Statistik Pembudidaya">
            <div className="space-y-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h2 className="font-display text-xl font-bold text-navy">
                            Data Statistik Pembudidaya Nasional
                        </h2>
                        <p className="text-sm text-slate">
                            Kelola data manual per provinsi, kategori ikan, dan tahun untuk ditampilkan di peta Beranda
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button href="/admin/kategori-ikan" variant="secondary" size="md">
                            <Fish className="mr-1.5 h-4 w-4" />
                            Kategori Ikan
                        </Button>
                        <Button variant="primary" size="md" onClick={openCreate}>
                            <Plus className="mr-1.5 h-4 w-4" />
                            Input Data Statistik
                        </Button>
                    </div>
                </div>

                {/* Filter */}
                <Card className="p-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                        <select
                            className="h-11 w-full rounded-control border border-line bg-white px-3 text-sm text-ink focus:border-ocean focus:outline-none focus:ring-2 focus:ring-ocean/15"
                            value={provinceFilter}
                            onChange={(e) => {
                                setProvinceFilter(e.target.value);
                                handleFilterChange(e.target.value, fishCatFilter);
                            }}
                        >
                            <option value="">Semua Provinsi</option>
                            {provinces.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <select
                            className="h-11 w-full rounded-control border border-line bg-white px-3 text-sm text-ink focus:border-ocean focus:outline-none focus:ring-2 focus:ring-ocean/15"
                            value={fishCatFilter}
                            onChange={(e) => {
                                setFishCatFilter(e.target.value);
                                handleFilterChange(provinceFilter, e.target.value);
                            }}
                        >
                            <option value="">Semua Kategori Ikan</option>
                            {fishCategories.map((f) => (
                                <option key={f.id} value={f.id}>
                                    {f.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </Card>

                {/* Table */}
                <Card className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-line bg-mist text-xs font-semibold uppercase text-slate">
                                <tr>
                                    <th className="px-4 py-3.5">Provinsi</th>
                                    <th className="px-4 py-3.5">Kategori Ikan</th>
                                    <th className="px-4 py-3.5">Tahun</th>
                                    <th className="px-4 py-3.5">Jumlah Pembudidaya</th>
                                    <th className="px-4 py-3.5">Sumber Data</th>
                                    <th className="px-4 py-3.5 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-line">
                                {snapshots.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center text-slate">
                                            Belum ada data statistik manual.
                                        </td>
                                    </tr>
                                ) : (
                                    snapshots.data.map((s) => (
                                        <tr key={s.id} className="h-14 transition hover:bg-mist/70">
                                            <td className="px-4 py-3 font-semibold text-ink">
                                                {s.province_name}
                                            </td>
                                            <td className="px-4 py-3 text-ocean font-medium">
                                                {s.fish_category_name}
                                            </td>
                                            <td className="px-4 py-3 font-mono text-slate">
                                                {s.year}
                                            </td>
                                            <td className="px-4 py-3 font-bold text-navy">
                                                {s.farmer_count.toLocaleString('id-ID')} orang
                                            </td>
                                            <td className="px-4 py-3 text-xs text-slate">
                                                {s.source}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        onClick={() => openEdit(s)}
                                                        className="inline-flex h-8 items-center rounded-lg border border-line px-2.5 text-xs font-semibold text-ink hover:bg-mist"
                                                    >
                                                        <Edit className="h-3.5 w-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(s.id)}
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

                    {snapshots.last_page > 1 && (
                        <div className="border-t border-line p-4">
                            <Pagination
                                page={snapshots.current_page}
                                lastPage={snapshots.last_page}
                                onChange={(p) => router.get('/admin/statistik', { ...filters, page: p }, { preserveState: true })}
                            />
                        </div>
                    )}
                </Card>
            </div>

            {/* Modal Tambah/Edit Statistik */}
            <Modal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editingSnapshot ? 'Edit Entri Statistik' : 'Input Data Statistik Baru'}
                size="md"
            >
                <form onSubmit={handleSubmit} className="space-y-4">

                    <div className="mt-4 space-y-4">
                        <div>
                            <label className="mb-1 block text-xs font-semibold text-ink">
                                Provinsi
                            </label>
                            <select
                                className="h-11 w-full rounded-control border border-line bg-white px-3 text-sm text-ink focus:border-ocean focus:outline-none focus:ring-2 focus:ring-ocean/15"
                                value={provinceId}
                                onChange={(e) => setProvinceId(e.target.value)}
                                required
                            >
                                {provinces.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-semibold text-ink">
                                Kategori Ikan
                            </label>
                            <select
                                className="h-11 w-full rounded-control border border-line bg-white px-3 text-sm text-ink focus:border-ocean focus:outline-none focus:ring-2 focus:ring-ocean/15"
                                value={fishCategoryId}
                                onChange={(e) => setFishCategoryId(e.target.value)}
                            >
                                <option value="">Semua / Agregat</option>
                                {fishCategories.map((f) => (
                                    <option key={f.id} value={f.id}>
                                        {f.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Tahun"
                                type="number"
                                min={2000}
                                max={2099}
                                value={year}
                                onChange={(e) => setYear(Number(e.target.value))}
                                required
                            />

                            <Input
                                label="Jumlah Pembudidaya (Jiwa)"
                                type="number"
                                min={0}
                                value={farmerCount}
                                onChange={(e) => setFarmerCount(Number(e.target.value))}
                                required
                            />
                        </div>

                        <Input
                            label="Sumber Data"
                            placeholder="Contoh: DKP Provinsi, Sensus KKP 2024"
                            value={source}
                            onChange={(e) => setSource(e.target.value)}
                        />
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="secondary"
                            size="md"
                            onClick={() => setModalOpen(false)}
                        >
                            Batal
                        </Button>
                        <Button type="submit" variant="primary" size="md">
                            Simpan Data
                        </Button>
                    </div>
                </form>
            </Modal>
        </AdminLayout>
    );
}
