import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import Card from '@/Components/ui/Card';
import Button from '@/Components/ui/Button';
import Input from '@/Components/ui/Input';
import Select from '@/Components/ui/Select';
import Textarea from '@/Components/ui/Textarea';
import Modal from '@/Components/ui/Modal';
import { router } from '@inertiajs/react';
import { Plus, Edit, Trash2, Users, CheckCircle2, XCircle } from 'lucide-react';

interface CategoryOption {
    id: number;
    name: string;
}

interface TypeItem {
    id: number;
    category_id: number;
    name: string;
    slug: string;
    description: string | null;
    ad_art_rules: string | null;
    is_active: boolean;
    category?: CategoryOption;
    applications_count: number;
}

interface TypesProps {
    types: TypeItem[];
    categories: CategoryOption[];
}

export default function Types({ types, categories }: TypesProps) {
    const [modalOpen, setModalOpen] = useState(false);
    const [editingType, setEditingType] = useState<TypeItem | null>(null);

    const [categoryId, setCategoryId] = useState<string>('');
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [description, setDescription] = useState('');
    const [adArtRules, setAdArtRules] = useState('');
    const [isActive, setIsActive] = useState(true);

    const openCreate = () => {
        setEditingType(null);
        setCategoryId(categories.length > 0 ? String(categories[0].id) : '');
        setName('');
        setSlug('');
        setDescription('');
        setAdArtRules('');
        setIsActive(true);
        setModalOpen(true);
    };

    const openEdit = (t: TypeItem) => {
        setEditingType(t);
        setCategoryId(String(t.category_id));
        setName(t.name);
        setSlug(t.slug);
        setDescription(t.description || '');
        setAdArtRules(t.ad_art_rules || '');
        setIsActive(t.is_active);
        setModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            category_id: Number(categoryId),
            name,
            slug: slug || undefined,
            description: description || null,
            ad_art_rules: adArtRules || null,
            is_active: isActive,
        };

        if (editingType) {
            router.put(`/admin/master-keanggotaan/jenis/${editingType.id}`, payload, {
                onSuccess: () => setModalOpen(false),
            });
        } else {
            router.post('/admin/master-keanggotaan/jenis', payload, {
                onSuccess: () => setModalOpen(false),
            });
        }
    };

    const handleDelete = (id: number, typeName: string) => {
        if (confirm(`Yakin ingin menghapus jenis keanggotaan "${typeName}"?`)) {
            router.delete(`/admin/master-keanggotaan/jenis/${id}`);
        }
    };

    return (
        <AdminLayout title="Master Jenis Keanggotaan">
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-navy tracking-tight font-display">
                            Jenis Keanggotaan NSA
                        </h2>
                        <p className="text-sm text-steel mt-0.5">
                            Sub-tipe keanggotaan terikat kategori (mis. Anggota Biasa, Luar Biasa, Kehormatan).
                        </p>
                    </div>
                    <Button onClick={openCreate} className="inline-flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Tambah Jenis
                    </Button>
                </div>

                <Card>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-sand/30 border-b border-sand text-navy font-semibold">
                                <tr>
                                    <th className="px-4 py-3">Nama Jenis</th>
                                    <th className="px-4 py-3">Kategori Induk</th>
                                    <th className="px-4 py-3">Slug</th>
                                    <th className="px-4 py-3 text-center">Pendaftar</th>
                                    <th className="px-4 py-3 text-center">Status</th>
                                    <th className="px-4 py-3 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-sand/40">
                                {types.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-8 text-steel">
                                            Belum ada jenis keanggotaan terdaftar.
                                        </td>
                                    </tr>
                                ) : (
                                    types.map((t) => (
                                        <tr key={t.id} className="hover:bg-sand/15 transition-colors">
                                            <td className="px-4 py-3 font-medium text-navy">
                                                <div className="flex items-center gap-2">
                                                    <Users className="w-4 h-4 text-ocean shrink-0" />
                                                    {t.name}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-steel">
                                                <span className="px-2 py-0.5 rounded bg-sand/40 text-navy font-medium text-xs">
                                                    {t.category?.name || 'Tanpa Kategori'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-steel font-mono text-xs">{t.slug}</td>
                                            <td className="px-4 py-3 text-center font-medium text-navy">
                                                {t.applications_count} pendaftar
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {t.is_active ? (
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
                                                    onClick={() => openEdit(t)}
                                                >
                                                    <Edit className="w-3.5 h-3.5 mr-1" />
                                                    Edit
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="danger"
                                                    onClick={() => handleDelete(t.id, t.name)}
                                                    disabled={t.applications_count > 0}
                                                    title={t.applications_count > 0 ? 'Jenis ini sudah memiliki pendaftar' : 'Hapus jenis'}
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
                    title={editingType ? 'Edit Jenis Keanggotaan' : 'Tambah Jenis Keanggotaan'}
                >
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Select
                            label="Kategori Induk"
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            options={categories.map((c) => ({ value: String(c.id), label: c.name }))}
                            required
                        />

                        <Input
                            label="Nama Jenis Keanggotaan"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Contoh: Anggota Biasa (Pembudidaya)"
                            required
                        />

                        <Input
                            label="Slug URL (Opsional)"
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            placeholder="anggota-biasa"
                            helperText="Otomatis dibentuk dari nama jika dikosongkan."
                        />

                        <Textarea
                            label="Deskripsi / Hak & Kewajiban Singkat"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Keterangan jenis keanggotaan ini..."
                            rows={2}
                        />

                        <Textarea
                            label="Aturan AD/ART Spesifik (Opsional)"
                            value={adArtRules}
                            onChange={(e) => setAdArtRules(e.target.value)}
                            placeholder="Pasal atau ketentuan AD/ART yang relevan..."
                            rows={3}
                        />

                        <div className="flex items-center gap-2 pt-2">
                            <input
                                type="checkbox"
                                id="type_is_active"
                                checked={isActive}
                                onChange={(e) => setIsActive(e.target.checked)}
                                className="rounded border-sand text-ocean focus:ring-ocean"
                            />
                            <label htmlFor="type_is_active" className="text-sm font-medium text-navy cursor-pointer">
                                Status Aktif (Dapat dipilih calon anggota)
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
                                {editingType ? 'Simpan Perubahan' : 'Tambahkan Jenis'}
                            </Button>
                        </div>
                    </form>
                </Modal>
            </div>
        </AdminLayout>
    );
}
