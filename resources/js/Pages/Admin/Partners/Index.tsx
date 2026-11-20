import AdminLayout from '@/Layouts/AdminLayout';
import Card from '@/Components/ui/Card';
import Button from '@/Components/ui/Button';
import Input from '@/Components/ui/Input';
import Modal from '@/Components/ui/Modal';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, Edit, Trash2, Handshake, ExternalLink, UploadCloud } from 'lucide-react';

interface PartnerItem {
    id: number;
    name: string;
    type: string | null;
    url: string | null;
    order: number;
    logo_url: string | null;
}

interface PartnersProps {
    partners: PartnerItem[];
    types: Array<{ value: string; label: string }>;
}

export default function PartnersIndex({ partners, types }: PartnersProps) {
    const [modalOpen, setModalOpen] = useState(false);
    const [editingPartner, setEditingPartner] = useState<PartnerItem | null>(null);

    const [name, setName] = useState('');
    const [type, setType] = useState('instansi');
    const [url, setUrl] = useState('');
    const [order, setOrder] = useState(0);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    const openCreate = () => {
        setEditingPartner(null);
        setName('');
        setType('instansi');
        setUrl('');
        setOrder(partners.length);
        setLogoFile(null);
        setLogoPreview(null);
        setModalOpen(true);
    };

    const openEdit = (p: PartnerItem) => {
        setEditingPartner(p);
        setName(p.name);
        setType(p.type || 'instansi');
        setUrl(p.url || '');
        setOrder(p.order);
        setLogoFile(null);
        setLogoPreview(p.logo_url);
        setModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', name);
        formData.append('type', type);
        if (url) formData.append('url', url);
        formData.append('order', String(order));
        if (logoFile) formData.append('logo', logoFile);

        if (editingPartner) {
            formData.append('_method', 'PUT');
            router.post(`/admin/mitra/${editingPartner.id}`, formData, {
                onSuccess: () => setModalOpen(false),
            });
        } else {
            router.post('/admin/mitra', formData, {
                onSuccess: () => setModalOpen(false),
            });
        }
    };

    const handleDelete = (id: number, partnerName: string) => {
        if (confirm(`Hapus mitra "${partnerName}"?`)) {
            router.delete(`/admin/mitra/${id}`);
        }
    };

    return (
        <AdminLayout title="Mitra & Kolaborasi NSA">
            <div className="space-y-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h2 className="font-display text-xl font-bold text-navy">
                            Kelola Mitra Kerja Sama
                        </h2>
                        <p className="text-sm text-slate">
                            Logo instansi kementerian, korporasi swasta, asosiasi, dan perguruan tinggi yang ditampilkan di Beranda & Kemitraan
                        </p>
                    </div>
                    <Button variant="primary" size="md" onClick={openCreate}>
                        <Plus className="mr-1.5 h-4 w-4" />
                        Tambah Mitra
                    </Button>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    {partners.map((p) => (
                        <Card key={p.id} className="p-4 flex flex-col items-center text-center justify-between">
                            <div className="w-full flex justify-end">
                                <span className="font-mono text-xs text-slate">#{p.order}</span>
                            </div>

                            <div className="my-3 grid h-20 w-full place-items-center rounded-lg bg-mist p-2">
                                {p.logo_url ? (
                                    <img
                                        src={p.logo_url}
                                        alt={p.name}
                                        className="max-h-16 max-w-full object-contain"
                                    />
                                ) : (
                                    <Handshake className="h-8 w-8 text-slate" />
                                )}
                            </div>

                            <div className="w-full">
                                <h4 className="font-semibold text-sm text-ink truncate">{p.name}</h4>
                                <span className="text-xs text-slate capitalize">{p.type}</span>
                            </div>

                            <div className="mt-4 pt-3 border-t border-line w-full flex items-center justify-between">
                                {p.url ? (
                                    <a
                                        href={p.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-xs text-ocean hover:underline flex items-center gap-1"
                                    >
                                        <ExternalLink className="h-3 w-3" /> Web
                                    </a>
                                ) : (
                                    <span />
                                )}
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => openEdit(p)}
                                        className="p-1 text-slate hover:text-ocean transition"
                                    >
                                        <Edit className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(p.id, p.name)}
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
                title={editingPartner ? 'Edit Data Mitra' : 'Tambah Mitra Baru'}
                size="md"
            >
                <form onSubmit={handleSubmit} className="p-1">
                    <div className="space-y-4">
                        <Input
                            label="Nama Mitra / Lembaga"
                            placeholder="Contoh: Kementerian Kelautan dan Perikanan RI"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />

                        <div>
                            <label className="mb-1 block text-xs font-semibold text-ink">
                                Jenis Mitra
                            </label>
                            <select
                                className="h-11 w-full rounded-control border border-line bg-white px-3 text-sm text-ink focus:border-ocean focus:outline-none focus:ring-2 focus:ring-ocean/15"
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                            >
                                {types.map((t) => (
                                    <option key={t.value} value={t.value}>
                                        {t.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <Input
                            label="Tautan Website (URL)"
                            placeholder="https://..."
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                        />

                        <Input
                            label="Nomor Urutan Tampil"
                            type="number"
                            min={0}
                            value={order}
                            onChange={(e) => setOrder(Number(e.target.value))}
                        />

                        <div>
                            <label className="mb-1 block text-xs font-semibold text-ink">
                                Berkas Logo Mitra {!editingPartner && <span className="text-danger">*</span>}
                            </label>
                            {logoPreview && (
                                <img
                                    src={logoPreview}
                                    alt="Logo"
                                    className="mb-2 h-16 w-32 object-contain bg-mist p-2 rounded-lg border border-line"
                                />
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                        setLogoFile(e.target.files[0]);
                                        setLogoPreview(URL.createObjectURL(e.target.files[0]));
                                    }
                                }}
                                className="block w-full text-xs text-slate file:mr-3 file:rounded-lg file:border-0 file:bg-mist file:px-3 file:py-2 file:text-xs file:font-semibold file:text-navy hover:file:bg-line"
                                required={!editingPartner}
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
                            Simpan Mitra
                        </Button>
                    </div>
                </form>
            </Modal>
        </AdminLayout>
    );
}
