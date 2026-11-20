import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import Card from '@/Components/ui/Card';
import Button from '@/Components/ui/Button';
import Input from '@/Components/ui/Input';
import Textarea from '@/Components/ui/Textarea';
import Modal from '@/Components/ui/Modal';
import { router } from '@inertiajs/react';
import { Plus, Edit, Trash2, FolderTree, CheckCircle2, XCircle } from 'lucide-react';

interface CategoryItem {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    is_active: boolean;
    types_count: number;
}

interface CategoriesProps {
    categories: CategoryItem[];
}

export default function Categories({ categories }: CategoriesProps) {
    const [modalOpen, setModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);

    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [description, setDescription] = useState('');
    const [isActive, setIsActive] = useState(true);

    const openCreate = () => {
        setEditingCategory(null);
        setName('');
        setSlug('');
        setDescription('');
        setIsActive(true);
        setModalOpen(true);
    };

    const openEdit = (cat: CategoryItem) => {
        setEditingCategory(cat);
        setName(cat.name);
        setSlug(cat.slug);
        setDescription(cat.description || '');
        setIsActive(cat.is_active);
        setModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            name,
            slug: slug || undefined,
            description: description || null,
            is_active: isActive,
        };

        if (editingCategory) {
            router.put(`/admin/master-keanggotaan/kategori/${editingCategory.id}`, payload, {
                onSuccess: () => setModalOpen(false),
            });
        } else {
            router.post('/admin/master-keanggotaan/kategori', payload, {
                onSuccess: () => setModalOpen(false),
            });
        }
    };

    const handleDelete = (id: number, catName: string) => {
        if (confirm(`Yakin ingin menghapus kategori "${catName}"?`)) {
            router.delete(`/admin/master-keanggotaan/kategori/${id}`);
        }
    };

    return (
        <AdminLayout title="Master Kategori Keanggotaan">
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-navy tracking-tight font-display">
                            Kategori Keanggotaan NSA
                        </h2>
                        <p className="text-sm text-steel mt-0.5">
                            Klasifikasi peran dan status peserta (Pembudidaya, Pembenih, Pengolah/Buyer, dll).
                        </p>
                    </div>
                    <Button onClick={openCreate} className="inline-flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Tambah Kategori
                    </Button>
                </div>

                <Card>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-sand/30 border-b border-sand text-navy font-semibold">
                                <tr>
                                    <th className="px-4 py-3">Nama Kategori</th>
                                    <th className="px-4 py-3">Slug</th>
                                    <th className="px-4 py-3">Deskripsi</th>
                                    <th className="px-4 py-3 text-center">Jumlah Jenis</th>
                                    <th className="px-4 py-3 text-center">Status</th>
                                    <th className="px-4 py-3 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-sand/40">
                                {categories.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-8 text-steel">
                                            Belum ada kategori keanggotaan terdaftar.
                                        </td>
                                    </tr>
                                ) : (
                                    categories.map((cat) => (
                                        <tr key={cat.id} className="hover:bg-sand/15 transition-colors">
                                            <td className="px-4 py-3 font-medium text-navy">
                                                <div className="flex items-center gap-2">
                                                    <FolderTree className="w-4 h-4 text-ocean shrink-0" />
                                                    {cat.name}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-steel font-mono text-xs">{cat.slug}</td>
                                            <td className="px-4 py-3 text-steel max-w-xs truncate">
                                                {cat.description || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-center font-medium text-navy">
                                                {cat.types_count} jenis
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {cat.is_active ? (
                                                    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium">
                                                        <CheckCircle2 className="w-3.5 h-3.5" /> Aktif
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium">
                                                        <XCircle className="w-3.5 h-3.5" /> Nonaktif
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() => openEdit(cat)}
                                                >
                                                    <Edit className="w-3.5 h-3.5 mr-1" />
                                                    Edit
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="danger"
                                                    onClick={() => handleDelete(cat.id, cat.name)}
                                                    disabled={cat.types_count > 0}
                                                    title={cat.types_count > 0 ? 'Hapus jenis terkait terlebih dahulu' : 'Hapus kategori'}
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Modal Form Tambah / Edit */}
                <Modal
                    isOpen={modalOpen}
                    onClose={() => setModalOpen(false)}
                    title={editingCategory ? 'Edit Kategori Keanggotaan' : 'Tambah Kategori Keanggotaan'}
                >
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            label="Nama Kategori"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Contoh: Pembudidaya Ikan Air Tawar"
                            required
                        />

                        <Input
                            label="Slug URL (Opsional)"
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            placeholder="pembudidaya-ikan"
                            helperText="Otomatis dibentuk dari nama jika dikosongkan."
                        />

                        <Textarea
                            label="Deskripsi / Catatan"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Penjelasan cakupan kategori ini..."
                            rows={3}
                        />

                        <div className="flex items-center gap-2 pt-2">
                            <input
                                type="checkbox"
                                id="cat_is_active"
                                checked={isActive}
                                onChange={(e) => setIsActive(e.target.checked)}
                                className="rounded border-sand text-ocean focus:ring-ocean"
                            />
                            <label htmlFor="cat_is_active" className="text-sm font-medium text-navy cursor-pointer">
                                Status Aktif (Tampil di formulir pendaftaran)
                            </label>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-sand">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setModalOpen(false)}
                            >
                                Batal
                            </Button>
                            <Button type="submit">
                                {editingCategory ? 'Simpan Perubahan' : 'Tambahkan Kategori'}
                            </Button>
                        </div>
                    </form>
                </Modal>
            </div>
        </AdminLayout>
    );
}
