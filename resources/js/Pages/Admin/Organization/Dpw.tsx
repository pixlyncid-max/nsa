import AdminLayout from '@/Layouts/AdminLayout';
import Card from '@/Components/ui/Card';
import Button from '@/Components/ui/Button';
import Input from '@/Components/ui/Input';
import Modal from '@/Components/ui/Modal';
import Pagination from '@/Components/ui/Pagination';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import {
    Plus,
    Edit,
    Trash2,
    Layers,
    Search,
    MapPin,
    Phone,
    Mail,
    Users,
} from 'lucide-react';

interface DpwMemberItem {
    id: number;
    name: string;
    position: string;
    order: number;
    photo_url: string | null;
}

interface DpwItem {
    id: number;
    name: string;
    province_id: number;
    province_name: string;
    address: string | null;
    phone: string | null;
    email: string | null;
    period: string | null;
    members: DpwMemberItem[];
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

interface DpwProps {
    dpws: PaginatedData<DpwItem>;
    provinces: Array<{ id: number; name: string }>;
    filters: {
        search?: string;
    };
}

export default function DpwIndex({ dpws, provinces, filters }: DpwProps) {
    const [search, setSearch] = useState(filters.search || '');

    // Modal DPW
    const [dpwModalOpen, setDpwModalOpen] = useState(false);
    const [editingDpw, setEditingDpw] = useState<DpwItem | null>(null);
    const [provinceId, setProvinceId] = useState('');
    const [dpwName, setDpwName] = useState('');
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [period, setPeriod] = useState('2024-2029');

    // Modal Member DPW
    const [memberModalOpen, setMemberModalOpen] = useState(false);
    const [activeDpwId, setActiveDpwId] = useState<number | null>(null);
    const [memberName, setMemberName] = useState('');
    const [memberPosition, setMemberPosition] = useState('');
    const [memberOrder, setMemberOrder] = useState(0);

    const openCreateDpw = () => {
        setEditingDpw(null);
        setProvinceId(String(provinces[0]?.id ?? ''));
        setDpwName('');
        setAddress('');
        setPhone('');
        setEmail('');
        setPeriod('2024-2029');
        setDpwModalOpen(true);
    };

    const openEditDpw = (d: DpwItem) => {
        setEditingDpw(d);
        setProvinceId(String(d.province_id));
        setDpwName(d.name);
        setAddress(d.address || '');
        setPhone(d.phone || '');
        setEmail(d.email || '');
        setPeriod(d.period || '2024-2029');
        setDpwModalOpen(true);
    };

    const handleDpwSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            province_id: Number(provinceId),
            name: dpwName,
            address: address || null,
            phone: phone || null,
            email: email || null,
            period: period || null,
        };

        if (editingDpw) {
            router.put(`/admin/organisasi/dpw/${editingDpw.id}`, payload, {
                onSuccess: () => setDpwModalOpen(false),
            });
        } else {
            router.post('/admin/organisasi/dpw', payload, {
                onSuccess: () => setDpwModalOpen(false),
            });
        }
    };

    const handleDpwDelete = (id: number, name: string) => {
        if (confirm(`Hapus DPW "${name}" dan seluruh susunan pengurusnya?`)) {
            router.delete(`/admin/organisasi/dpw/${id}`);
        }
    };

    const openAddMember = (dpwId: number) => {
        setActiveDpwId(dpwId);
        setMemberName('');
        setMemberPosition('');
        setMemberOrder(0);
        setMemberModalOpen(true);
    };

    const handleMemberSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeDpwId) return;

        router.post(
            `/admin/organisasi/dpw/${activeDpwId}/anggota`,
            {
                name: memberName,
                position: memberPosition,
                order: memberOrder,
            },
            {
                onSuccess: () => setMemberModalOpen(false),
            }
        );
    };

    const handleMemberDelete = (memberId: number) => {
        if (confirm('Hapus pengurus DPW ini?')) {
            router.delete(`/admin/organisasi/dpw/anggota/${memberId}`);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/admin/organisasi/dpw', { search: search || undefined }, { preserveState: true });
    };

    return (
        <AdminLayout title="DPW (Dewan Pengurus Wilayah)">
            <div className="space-y-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h2 className="font-display text-xl font-bold text-navy">
                            Dewan Pengurus Wilayah (DPW) Provinsi
                        </h2>
                        <p className="text-sm text-slate">
                            Kelola kepengurusan organisasi NSA di tingkat provinsi
                        </p>
                    </div>
                    <Button variant="primary" size="md" onClick={openCreateDpw}>
                        <Plus className="mr-1.5 h-4 w-4" />
                        Tambah DPW Provinsi
                    </Button>
                </div>

                {/* Search */}
                <Card className="p-4">
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <Input
                            placeholder="Cari DPW atau nama provinsi..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            leading={<Search className="h-4 w-4 text-slate" />}
                            className="max-w-md"
                        />
                        <Button type="submit" variant="secondary" size="md">
                            Cari
                        </Button>
                    </form>
                </Card>

                {/* Cards List */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {dpws.data.length === 0 ? (
                        <div className="lg:col-span-2 py-12 text-center text-slate">
                            Belum ada data DPW yang terdaftar.
                        </div>
                    ) : (
                        dpws.data.map((d) => (
                            <Card key={d.id} className="p-6 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-start justify-between border-b border-line pb-4 mb-4">
                                        <div>
                                            <span className="rounded bg-ocean/10 px-2 py-0.5 text-xs font-bold text-ocean">
                                                {d.province_name}
                                            </span>
                                            <h3 className="font-display text-lg font-bold text-navy mt-1">
                                                {d.name}
                                            </h3>
                                            <span className="text-xs text-slate">Periode: {d.period || '-'}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => openEditDpw(d)}
                                                className="p-1.5 text-slate hover:text-ocean transition"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDpwDelete(d.id, d.name)}
                                                className="p-1.5 text-slate hover:text-danger transition"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="text-xs text-slate space-y-1 mb-4">
                                        {d.address && <p className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 shrink-0" /> {d.address}</p>}
                                        {d.phone && <p className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 shrink-0" /> {d.phone}</p>}
                                        {d.email && <p className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 shrink-0" /> {d.email}</p>}
                                    </div>

                                    {/* Members list */}
                                    <div className="border-t border-line pt-3">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-bold text-navy uppercase tracking-wider">
                                                Susunan Pengurus ({d.members.length})
                                            </span>
                                            <button
                                                onClick={() => openAddMember(d.id)}
                                                className="inline-flex items-center gap-1 text-xs font-semibold text-ocean hover:underline"
                                            >
                                                <Plus className="h-3 w-3" /> Tambah Pengurus
                                            </button>
                                        </div>

                                        {d.members.length === 0 ? (
                                            <p className="text-xs text-slate py-2">Belum ada pengurus ditambahkan.</p>
                                        ) : (
                                            <div className="divide-y divide-line text-xs">
                                                {d.members.map((m) => (
                                                    <div key={m.id} className="py-1.5 flex items-center justify-between">
                                                        <div>
                                                            <span className="font-semibold text-ink">{m.name}</span>
                                                            <span className="text-slate ml-2">({m.position})</span>
                                                        </div>
                                                        <button
                                                            onClick={() => handleMemberDelete(m.id)}
                                                            className="text-slate hover:text-danger p-0.5"
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        ))
                    )}
                </div>

                {dpws.last_page > 1 && (
                    <Pagination
                        page={dpws.current_page}
                        lastPage={dpws.last_page}
                        onChange={(p) => router.get('/admin/organisasi/dpw', { ...filters, page: p }, { preserveState: true })}
                    />
                )}
            </div>

            {/* Modal Tambah/Edit DPW */}
            <Modal
                open={dpwModalOpen}
                onClose={() => setDpwModalOpen(false)}
                title={editingDpw ? 'Edit Data DPW' : 'Tambah DPW Provinsi Baru'}
                size="md"
            >
                <form onSubmit={handleDpwSubmit} className="space-y-4">
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
                                {provinces.map((prov) => (
                                    <option key={prov.id} value={prov.id}>
                                        {prov.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <Input
                            label="Nama DPW"
                            placeholder="Contoh: DPW NSA Jawa Barat"
                            value={dpwName}
                            onChange={(e) => setDpwName(e.target.value)}
                            required
                        />

                        <Input
                            label="Periode Kepengurusan"
                            placeholder="2024-2029"
                            value={period}
                            onChange={(e) => setPeriod(e.target.value)}
                        />

                        <Input
                            label="Nomor Telepon / WhatsApp Sekretariat"
                            placeholder="+62 812-..."
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />

                        <Input
                            label="Email Sekretariat"
                            type="email"
                            placeholder="dpw.jabar@nsa.id"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />

                        <Input
                            label="Alamat Kantor Sekretariat"
                            placeholder="Jl. Sukajadi No. 45, Bandung"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                        />

                    <div className="mt-6 flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="secondary"
                            size="md"
                            onClick={() => setDpwModalOpen(false)}
                        >
                            Batal
                        </Button>
                        <Button type="submit" variant="primary" size="md">
                            Simpan DPW
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Modal Tambah Pengurus DPW */}
            <Modal
                open={memberModalOpen}
                onClose={() => setMemberModalOpen(false)}
                title="Tambah Pengurus DPW"
                size="sm"
            >
                <form onSubmit={handleMemberSubmit} className="space-y-4">
                    <Input
                        label="Nama Lengkap"
                        placeholder="Contoh: H. Ahmad Subarjo"
                        value={memberName}
                        onChange={(e) => setMemberName(e.target.value)}
                        required
                    />

                    <Input
                        label="Jabatan"
                        placeholder="Contoh: Ketua DPW, Sekretaris DPW"
                        value={memberPosition}
                        onChange={(e) => setMemberPosition(e.target.value)}
                        required
                    />

                    <Input
                        label="Urutan Tampil"
                        type="number"
                        min={0}
                        value={memberOrder}
                        onChange={(e) => setMemberOrder(Number(e.target.value))}
                    />

                    <div className="mt-6 flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="secondary"
                            size="md"
                            onClick={() => setMemberModalOpen(false)}
                        >
                            Batal
                        </Button>
                        <Button type="submit" variant="primary" size="md">
                            Tambah
                        </Button>
                    </div>
                </form>
            </Modal>
        </AdminLayout>
    );
}
