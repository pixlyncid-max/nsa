import AdminLayout from '@/Layouts/AdminLayout';
import Card from '@/Components/ui/Card';
import Button from '@/Components/ui/Button';
import Input from '@/Components/ui/Input';
import Textarea from '@/Components/ui/Textarea';
import Modal from '@/Components/ui/Modal';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, Edit, Trash2, Building2, User, UploadCloud } from 'lucide-react';

interface DppMemberItem {
    id: number;
    name: string;
    position: string;
    period: string;
    bio: string | null;
    order: number;
    photo_url: string | null;
}

interface DppProps {
    members: DppMemberItem[];
}

export default function DppIndex({ members }: DppProps) {
    const [modalOpen, setModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<DppMemberItem | null>(null);

    const [name, setName] = useState('');
    const [position, setPosition] = useState('');
    const [period, setPeriod] = useState('2024-2029');
    const [order, setOrder] = useState(0);
    const [bio, setBio] = useState('');
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    const openCreateModal = () => {
        setEditingMember(null);
        setName('');
        setPosition('');
        setPeriod('2024-2029');
        setOrder(members.length);
        setBio('');
        setPhotoFile(null);
        setPhotoPreview(null);
        setModalOpen(true);
    };

    const openEditModal = (m: DppMemberItem) => {
        setEditingMember(m);
        setName(m.name);
        setPosition(m.position);
        setPeriod(m.period);
        setOrder(m.order);
        setBio(m.bio || '');
        setPhotoFile(null);
        setPhotoPreview(m.photo_url);
        setModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', name);
        formData.append('position', position);
        formData.append('period', period);
        formData.append('order', String(order));
        if (bio) formData.append('bio', bio);
        if (photoFile) formData.append('photo', photoFile);

        if (editingMember) {
            formData.append('_method', 'PUT');
            router.post(`/admin/organisasi/dpp/${editingMember.id}`, formData, {
                onSuccess: () => setModalOpen(false),
            });
        } else {
            router.post('/admin/organisasi/dpp', formData, {
                onSuccess: () => setModalOpen(false),
            });
        }
    };

    const handleDelete = (id: number, memberName: string) => {
        if (confirm(`Hapus pengurus DPP "${memberName}"?`)) {
            router.delete(`/admin/organisasi/dpp/${id}`);
        }
    };

    return (
        <AdminLayout title="Pengurus DPP (Dewan Pengurus Pusat)">
            <div className="space-y-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h2 className="font-display text-xl font-bold text-navy">
                            Dewan Pengurus Pusat (DPP) NSA
                        </h2>
                        <p className="text-sm text-slate">
                            Kelola susunan pengurus harian, ketua umum, sekjen, dan bidang-bidang nasional
                        </p>
                    </div>
                    <Button variant="primary" size="md" onClick={openCreateModal}>
                        <Plus className="mr-1.5 h-4 w-4" />
                        Tambah Pengurus DPP
                    </Button>
                </div>

                <Card className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-line bg-mist text-xs font-semibold uppercase text-slate">
                                <tr>
                                    <th className="px-4 py-3.5">Urutan</th>
                                    <th className="px-4 py-3.5">Nama & Foto</th>
                                    <th className="px-4 py-3.5">Jabatan</th>
                                    <th className="px-4 py-3.5">Periode</th>
                                    <th className="px-4 py-3.5 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-line">
                                {members.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-12 text-center text-slate">
                                            Belum ada data pengurus DPP yang ditambahkan.
                                        </td>
                                    </tr>
                                ) : (
                                    members.map((m) => (
                                        <tr key={m.id} className="h-16 transition hover:bg-mist/70">
                                            <td className="px-4 py-3 font-mono font-bold text-slate">
                                                #{m.order}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    {m.photo_url ? (
                                                        <img
                                                            src={m.photo_url}
                                                            alt={m.name}
                                                            className="h-11 w-11 rounded-full object-cover border border-line"
                                                        />
                                                    ) : (
                                                        <div className="grid h-11 w-11 place-items-center rounded-full bg-mist border border-line text-slate">
                                                            <User className="h-5 w-5" />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-semibold text-ink">{m.name}</p>
                                                        {m.bio && (
                                                            <p className="text-xs text-slate line-clamp-1">{m.bio}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 font-medium text-navy">
                                                {m.position}
                                            </td>
                                            <td className="px-4 py-3 text-xs text-slate">
                                                {m.period}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        onClick={() => openEditModal(m)}
                                                        className="inline-flex h-8 items-center gap-1 rounded-lg border border-line px-2.5 text-xs font-semibold text-ink hover:bg-mist"
                                                    >
                                                        <Edit className="h-3.5 w-3.5" /> Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(m.id, m.name)}
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
                </Card>
            </div>

            <Modal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editingMember ? 'Edit Pengurus DPP' : 'Tambah Pengurus DPP Baru'}
                size="md"
            >
                <form onSubmit={handleSubmit} className="space-y-4">

                    <div className="mt-4 space-y-4">
                        <Input
                            label="Nama Lengkap & Gelar"
                            placeholder="Contoh: Dr. Ir. Budi Santoso, M.Si"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />

                        <Input
                            label="Jabatan"
                            placeholder="Contoh: Ketua Umum, Sekretaris Jenderal"
                            value={position}
                            onChange={(e) => setPosition(e.target.value)}
                            required
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Periode Jabatan"
                                placeholder="2024-2029"
                                value={period}
                                onChange={(e) => setPeriod(e.target.value)}
                            />

                            <Input
                                label="Nomor Urutan Tampil"
                                type="number"
                                min={0}
                                value={order}
                                onChange={(e) => setOrder(Number(e.target.value))}
                            />
                        </div>

                        <Textarea
                            label="Bio Singkat (Opsional)"
                            placeholder="Profil singkat pengalaman atau latar belakang..."
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            rows={2}
                        />

                        <div>
                            <label className="mb-1 block text-xs font-semibold text-ink">
                                Foto Pengurus (1:1 Disarankan)
                            </label>
                            {photoPreview && (
                                <img
                                    src={photoPreview}
                                    alt="Foto"
                                    className="mb-2 h-20 w-20 rounded-full object-cover border border-line"
                                />
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                        setPhotoFile(e.target.files[0]);
                                        setPhotoPreview(URL.createObjectURL(e.target.files[0]));
                                    }
                                }}
                                className="block w-full text-xs text-slate file:mr-3 file:rounded-lg file:border-0 file:bg-mist file:px-3 file:py-2 file:text-xs file:font-semibold file:text-navy hover:file:bg-line"
                            />
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
                            Simpan Pengurus
                        </Button>
                    </div>
                </form>
            </Modal>
        </AdminLayout>
    );
}
