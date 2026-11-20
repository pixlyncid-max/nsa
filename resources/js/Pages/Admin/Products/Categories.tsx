import AdminLayout from '@/Layouts/AdminLayout';
import Card from '@/Components/ui/Card';
import Button from '@/Components/ui/Button';
import Input from '@/Components/ui/Input';
import Modal from '@/Components/ui/Modal';
import { router, Link } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowLeft, Plus, Edit, Trash2, FolderTree } from 'lucide-react';

interface CategoryItem {
    id: number;
    parent_id: number | null;
    name: string;
    slug: string;
    group: string;
    icon: string | null;
    products_count: number;
}

interface CategoriesProps {
    categories: CategoryItem[];
    groups: Array<{ value: string; label: string }>;
}

export default function ProductCategories({
    categories,
    groups,
}: CategoriesProps) {
    const [modalOpen, setModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);

    const [name, setName] = useState('');
    const [group, setGroup] = useState('air-tawar');
    const [parentId, setParentId] = useState<string>('');
    const [icon, setIcon] = useState('');

    const openCreateModal = () => {
        setEditingCategory(null);
        setName('');
        setGroup('air-tawar');
        setParentId('');
        setIcon('');
        setModalOpen(true);
    };

    const openEditModal = (cat: CategoryItem) => {
        setEditingCategory(cat);
        setName(cat.name);
        setGroup(cat.group);
        setParentId(cat.parent_id ? String(cat.parent_id) : '');
        setIcon(cat.icon || '');
        setModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            name,
            group,
            parent_id: parentId ? Number(parentId) : null,
            icon: icon || null,
        };

        if (editingCategory) {
            router.put(`/admin/kategori-produk/${editingCategory.id}`, payload, {
                onSuccess: () => setModalOpen(false),
            });
        } else {
            router.post('/admin/kategori-produk', payload, {
                onSuccess: () => setModalOpen(false),
            });
        }
    };

    const handleDelete = (id: number, catName: string) => {
        if (confirm(`Hapus kategori "${catName}"?`)) {
            router.delete(`/admin/kategori-produk/${id}`);
        }
    };

    return (
        <AdminLayout title="Kategori Produk">
            <div className="space-y-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <Link
                            href="/admin/produk"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate hover:text-navy mb-1"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" /> Kembali ke Katalog Produk
                        </Link>
                        <h2 className="font-display text-xl font-bold text-navy">
                            Kelola Kategori Produk & Layanan
                        </h2>
                    </div>
                    <Button variant="primary" size="md" onClick={openCreateModal}>
                        <Plus className="mr-1.5 h-4 w-4" />
                        Tambah Kategori
                    </Button>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {groups.map((grp) => {
                        const groupCategories = categories.filter((c) => c.group === grp.value);
                        return (
                            <Card key={grp.value} className="p-5 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center justify-between border-b border-line pb-3 mb-3">
                                        <h3 className="font-display font-bold text-navy">
                                            {grp.label}
                                        </h3>
                                        <span className="rounded-full bg-mist px-2.5 py-0.5 text-xs font-semibold text-slate">
                                            {groupCategories.length} kategori
                                        </span>
                                    </div>

                                    {groupCategories.length === 0 ? (
                                        <p className="py-6 text-center text-xs text-slate">
                                            Belum ada sub-kategori.
                                        </p>
                                    ) : (
                                        <ul className="divide-y divide-line text-sm">
                                            {groupCategories.map((c) => (
                                                <li
                                                    key={c.id}
                                                    className="py-2.5 flex items-center justify-between"
                                                >
                                                    <div>
                                                        <p className="font-semibold text-ink">{c.name}</p>
                                                        <span className="text-xs text-slate">
                                                            {c.products_count} produk terkait
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            onClick={() => openEditModal(c)}
                                                            className="p-1 text-slate hover:text-ocean transition"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(c.id, c.name)}
                                                            className="p-1 text-slate hover:text-danger transition"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </Card>
                        );
                    })}
                </div>
            </div>

            <Modal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editingCategory ? 'Edit Kategori Produk' : 'Tambah Kategori Baru'}
                size="md"
            >
                <form onSubmit={handleSubmit} className="space-y-4">

                    <div className="mt-4 space-y-4">
                        <Input
                            label="Nama Kategori"
                            placeholder="Contoh: Pelet Pakan Ikan"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />

                        <div>
                            <label className="mb-1 block text-xs font-semibold text-ink">
                                Kelompok Utama
                            </label>
                            <select
                                className="h-11 w-full rounded-control border border-line bg-white px-3 text-sm text-ink focus:border-ocean focus:outline-none focus:ring-2 focus:ring-ocean/15"
                                value={group}
                                onChange={(e) => setGroup(e.target.value)}
                                required
                            >
                                {groups.map((g) => (
                                    <option key={g.value} value={g.value}>
                                        {g.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <Input
                            label="Ikon / Kata Kunci (Opsional)"
                            placeholder="Contoh: fish, anchor, package"
                            value={icon}
                            onChange={(e) => setIcon(e.target.value)}
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
                            Simpan Kategori
                        </Button>
                    </div>
                </form>
            </Modal>
        </AdminLayout>
    );
}
