import AdminLayout from '@/Layouts/AdminLayout';
import Card from '@/Components/ui/Card';
import Button from '@/Components/ui/Button';
import Input from '@/Components/ui/Input';
import Textarea from '@/Components/ui/Textarea';
import Modal from '@/Components/ui/Modal';
import { router, Link } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, Edit, Trash2, ArrowLeft, Fish, CheckCircle2, XCircle } from 'lucide-react';

interface FishCategoryItem {
    id: number;
    name: string;
    slug: string;
    icon: string | null;
    description: string | null;
    is_active: boolean;
    statistic_snapshots_count: number;
}

interface FishCategoriesProps {
    categories: FishCategoryItem[];
}

export default function FishCategoriesIndex({ categories }: FishCategoriesProps) {
    const [modalOpen, setModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<FishCategoryItem | null>(null);

    const [name, setName] = useState('');
    const [icon, setIcon] = useState('fish');
    const [description, setDescription] = useState('');
    const [isActive, setIsActive] = useState(true);

    const openCreate = () => {
        setEditingCategory(null);
        setName('');
        setIcon('fish');
        setDescription('');
        setIsActive(true);
        setModalOpen(true);
    };

    const openEdit = (c: FishCategoryItem) => {
        setEditingCategory(c);
        setName(c.name);
        setIcon(c.icon || 'fish');
        setDescription(c.description || '');
        setIsActive(c.is_active);
        setModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            name,
            icon,
            description: description || null,
            is_active: isActive,
        };

        if (editingCategory) {
            router.put(`/admin/kategori-ikan/${editingCategory.id}`, payload, {
                onSuccess: () => setModalOpen(false),
            });
        } else {
            router.post('/admin/kategori-ikan', payload, {
                onSuccess: () => setModalOpen(false),
            });
        }
    };

    const handleDelete = (id: number, catName: string) => {
        if (confirm(`Hapus kategori ikan "${catName}"?`)) {
            router.delete(`/admin/kategori-ikan/${id}`);
        }
    };

    return (
        <AdminLayout title="Kategori Ikan & Komoditas">
            <div className="space-y-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <Link
                            href="/admin/statistik"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate hover:text-navy mb-1"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" /> Kembali ke Statistik
                        </Link>
                        <h2 className="font-display text-xl font-bold text-navy">
                            Kategori Komoditas Perikanan
                        </h2>
                        <p className="text-sm text-slate">
                            Kelola daftar spesies ikan (Lele, Nila, Mas, Patin, Udang, dll.) untuk komoditas dan filter peta
                        </p>
                    </div>
                    <Button variant="primary" size="md" onClick={openCreate}>
                        <Plus className="mr-1.5 h-4 w-4" />
                        Tambah Kategori Ikan
                    </Button>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {categories.map((c) => (
                        <Card key={c.id} className="p-5 flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="grid h-8 w-8 place-items-center rounded-lg bg-ocean/10 text-ocean">
                                            <Fish className="h-4 w-4" />
                                        </div>
                                        <h3 className="font-display font-bold text-navy text-base">
                                            {c.name}
                                        </h3>
                                    </div>
                                    {c.is_active ? (
                                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-success">
                                            <CheckCircle2 className="h-3 w-3" /> Aktif
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate">
                                            <XCircle className="h-3 w-3" /> Nonaktif
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-slate line-clamp-2 mt-1">
                                    {c.description || 'Tidak ada deskripsi.'}
                                </p>
                            </div>

                            <div className="mt-4 pt-3 border-t border-line flex items-center justify-between text-xs">
                                <span className="text-slate font-mono">
                                    {c.statistic_snapshots_count} data statistik
                                </span>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => openEdit(c)}
                                        className="p-1 text-slate hover:text-ocean transition"
                                    >
                                        <Edit className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(c.id, c.name)}
                                        className="p-1 text-slate hover:text-danger transition"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>

            <Modal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editingCategory ? 'Edit Kategori Ikan' : 'Tambah Kategori Ikan Baru'}
                size="md"
            >
                <form onSubmit={handleSubmit} className="p-1">
                    <div className="space-y-4">
                        <Input
                            label="Nama Ikan / Komoditas"
                            placeholder="Contoh: Ikan Nila, Udang Vaname"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />

                        <Input
                            label="Nama Ikon Lucide"
                            placeholder="fish, anchor, etc."
                            value={icon}
                            onChange={(e) => setIcon(e.target.value)}
                        />

                        <Textarea
                            label="Deskripsi Ringkas"
                            placeholder="Karakteristik atau informasi spesies..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                        />

                        <div>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="rounded border-line text-ocean focus:ring-ocean"
                                    checked={isActive}
                                    onChange={(e) => setIsActive(e.target.checked)}
                                />
                                <span className="text-sm font-semibold text-ink">
                                    Aktif dan tampil di filter peta Beranda
                                </span>
                            </label>
                        </div>
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
