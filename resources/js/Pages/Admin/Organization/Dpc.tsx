import AdminLayout from '@/Layouts/AdminLayout';
import Card from '@/Components/ui/Card';
import Button from '@/Components/ui/Button';
import Input from '@/Components/ui/Input';
import Modal from '@/Components/ui/Modal';
import Pagination from '@/Components/ui/Pagination';
import { router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import {
    Plus,
    Edit,
    Trash2,
    MapPin,
    Search,
    Phone,
    Mail,
    Users,
} from 'lucide-react';

interface DpcMemberItem {
    id: number;
    name: string;
    position: string;
    order: number;
    photo_url: string | null;
}

interface DpcItem {
    id: number;
    name: string;
    regency_id: number;
    regency_name: string;
    province_name: string;
    address: string | null;
    phone: string | null;
    email: string | null;
    period: string | null;
    members: DpcMemberItem[];
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

interface DpcProps {
    dpcs: PaginatedData<DpcItem>;
    provinces: Array<{ id: number; name: string }>;
    filters: {
        search?: string;
        province_id?: string;
    };
}

export default function DpcIndex({ dpcs, provinces, filters }: DpcProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [filterProvinceId, setFilterProvinceId] = useState(filters.province_id || '');

    // Modal DPC
    const [dpcModalOpen, setDpcModalOpen] = useState(false);
    const [editingDpc, setEditingDpc] = useState<DpcItem | null>(null);
    const [modalProvinceId, setModalProvinceId] = useState<string>(String(provinces[0]?.id ?? ''));
    const [regencies, setRegencies] = useState<Array<{ id: number; name: string }>>([]);
    const [regencyId, setRegencyId] = useState<string>('');
    const [dpcName, setDpcName] = useState('');
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [period, setPeriod] = useState('2024-2029');

    // Modal Member DPC
    const [memberModalOpen, setMemberModalOpen] = useState(false);
    const [activeDpcId, setActiveDpcId] = useState<number | null>(null);
    const [memberName, setMemberName] = useState('');
    const [memberPosition, setMemberPosition] = useState('');
    const [memberOrder, setMemberOrder] = useState(0);

    // Fetch regencies when modal province changes
    useEffect(() => {
        if (!modalProvinceId) return;
        fetch(`/api/regions/regencies?province_id=${modalProvinceId}`)
            .then((res) => res.json())
            .then((data) => {
                setRegencies(data);
                if (data.length > 0 && !editingDpc) {
                    setRegencyId(String(data[0].id));
                }
            })
            .catch(() => {});
    }, [modalProvinceId]);

    const openCreateDpc = () => {
        setEditingDpc(null);
        const defaultProv = String(provinces[0]?.id ?? '');
        setModalProvinceId(defaultProv);
        setDpcName('');
        setAddress('');
        setPhone('');
        setEmail('');
        setPeriod('2024-2029');
        setDpcModalOpen(true);
    };

    const openEditDpc = (d: DpcItem) => {
        setEditingDpc(d);
        setDpcName(d.name);
        setAddress(d.address || '');
        setPhone(d.phone || '');
        setEmail(d.email || '');
        setPeriod(d.period || '2024-2029');
        setRegencyId(String(d.regency_id));
        setDpcModalOpen(true);
    };

    const handleDpcSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            regency_id: Number(regencyId),
            name: dpcName,
            address: address || null,
            phone: phone || null,
            email: email || null,
            period: period || null,
        };

        if (editingDpc) {
            router.put(`/admin/organisasi/dpc/${editingDpc.id}`, payload, {
                onSuccess: () => setDpcModalOpen(false),
            });
        } else {
            router.post('/admin/organisasi/dpc', payload, {
                onSuccess: () => setDpcModalOpen(false),
            });
        }
    };

    const handleDpcDelete = (id: number, name: string) => {
        if (confirm(`Hapus DPC "${name}" beserta seluruh pengurusnya?`)) {
            router.delete(`/admin/organisasi/dpc/${id}`);
        }
    };

    const openAddMember = (dpcId: number) => {
        setActiveDpcId(dpcId);
        setMemberName('');
        setMemberPosition('');
        setMemberOrder(0);
        setMemberModalOpen(true);
    };

    const handleMemberSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeDpcId) return;

        router.post(
            `/admin/organisasi/dpc/${activeDpcId}/anggota`,
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
        if (confirm('Hapus pengurus DPC ini?')) {
            router.delete(`/admin/organisasi/dpc/anggota/${memberId}`);
        }
    };

    const handleFilter = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        router.get(
            '/admin/organisasi/dpc',
            {
                search: search || undefined,
                province_id: filterProvinceId || undefined,
            },
            { preserveState: true }
        );
    };

    return (
        <AdminLayout title="DPC (Dewan Pengurus Cabang)">
            <div className="space-y-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h2 className="font-display text-xl font-bold text-navy">
                            Dewan Pengurus Cabang (DPC) Kab/Kota
                        </h2>
                        <p className="text-sm text-slate">
                            Kelola kepengurusan cabang NSA di tingkat kabupaten dan kota di seluruh Indonesia
                        </p>
                    </div>
                    <Button variant="primary" size="md" onClick={openCreateDpc}>
                        <Plus className="mr-1.5 h-4 w-4" />
                        Tambah DPC Baru
                    </Button>
                </div>

                {/* Filter */}
                <Card className="p-4">
                    <form onSubmit={handleFilter} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="sm:col-span-2">
                            <Input
                                placeholder="Cari DPC, kabupaten, kota..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                leading={<Search className="h-4 w-4 text-slate" />}
                            />
                        </div>
                        <div>
                            <select
                                className="h-11 w-full rounded-control border border-line bg-white px-3 text-sm text-ink focus:border-ocean focus:outline-none focus:ring-2 focus:ring-ocean/15"
                                value={filterProvinceId}
                                onChange={(e) => {
                                    setFilterProvinceId(e.target.value);
                                    router.get(
                                        '/admin/organisasi/dpc',
                                        {
                                            search: search || undefined,
                                            province_id: e.target.value || undefined,
                                        },
                                        { preserveState: true }
                                    );
                                }}
                            >
                                <option value="">Semua Provinsi</option>
                                {provinces.map((prov) => (
                                    <option key={prov.id} value={prov.id}>
                                        {prov.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </form>
                </Card>

                {/* Cards List */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {dpcs.data.length === 0 ? (
                        <div className="lg:col-span-2 py-12 text-center text-slate">
                            Belum ada data DPC yang terdaftar di wilayah ini.
                        </div>
                    ) : (
                        dpcs.data.map((d) => (
                            <Card key={d.id} className="p-6 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-start justify-between border-b border-line pb-4 mb-4">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="rounded bg-sky/15 px-2 py-0.5 text-xs font-bold text-navy">
                                                    {d.province_name}
                                                </span>
                                                <span className="font-semibold text-xs text-slate">
                                                    {d.regency_name}
                                                </span>
                                            </div>
                                            <h3 className="font-display text-lg font-bold text-navy mt-1">
                                                {d.name}
                                            </h3>
                                            <span className="text-xs text-slate">Periode: {d.period || '-'}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => openEditDpc(d)}
                                                className="p-1.5 text-slate hover:text-ocean transition"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDpcDelete(d.id, d.name)}
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

                {dpcs.last_page > 1 && (
                    <Pagination
                        page={dpcs.current_page}
                        lastPage={dpcs.last_page}
                        onChange={(p) => router.get('/admin/organisasi/dpc', { ...filters, page: p }, { preserveState: true })}
                    />
                )}
            </div>

            {/* Modal Tambah/Edit DPC */}
            <Modal
                open={dpcModalOpen}
                onClose={() => setDpcModalOpen(false)}
                title={editingDpc ? 'Edit Data DPC' : 'Tambah DPC Cabang Baru'}
                size="md"
            >
                <form onSubmit={handleDpcSubmit} className="space-y-4">

                    <div className="mt-4 space-y-4">
                        {!editingDpc && (
                            <div>
                                <label className="mb-1 block text-xs font-semibold text-ink">
                                    Pilih Provinsi Terlebih Dahulu
                                </label>
                                <select
                                    className="h-11 w-full rounded-control border border-line bg-white px-3 text-sm text-ink focus:border-ocean focus:outline-none focus:ring-2 focus:ring-ocean/15"
                                    value={modalProvinceId}
                                    onChange={(e) => setModalProvinceId(e.target.value)}
                                    required
                                >
                                    {provinces.map((prov) => (
                                        <option key={prov.id} value={prov.id}>
                                            {prov.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div>
                            <label className="mb-1 block text-xs font-semibold text-ink">
                                Kabupaten / Kota <span className="text-danger">*</span>
                            </label>
                            <select
                                className="h-11 w-full rounded-control border border-line bg-white px-3 text-sm text-ink focus:border-ocean focus:outline-none focus:ring-2 focus:ring-ocean/15"
                                value={regencyId}
                                onChange={(e) => setRegencyId(e.target.value)}
                                required
                            >
                                {regencies.length === 0 ? (
                                    <option value="">Memuat kabupaten/kota...</option>
                                ) : (
                                    regencies.map((reg) => (
                                        <option key={reg.id} value={reg.id}>
                                            {reg.name}
                                        </option>
                                    ))
                                )}
                            </select>
                        </div>

                        <Input
                            label="Nama DPC"
                            placeholder="Contoh: DPC NSA Kabupaten Sukabumi"
                            value={dpcName}
                            onChange={(e) => setDpcName(e.target.value)}
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
                            placeholder="+62 813-..."
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />

                        <Input
                            label="Email Sekretariat"
                            type="email"
                            placeholder="dpc.sukabumi@nsa.id"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />

                        <Input
                            label="Alamat Kantor Sekretariat"
                            placeholder="Jl. Pelabuhan II No. 12, Sukabumi"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                        />
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="secondary"
                            size="md"
                            onClick={() => setDpcModalOpen(false)}
                        >
                            Batal
                        </Button>
                        <Button type="submit" variant="primary" size="md">
                            Simpan DPC
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Modal Tambah Pengurus DPC */}
            <Modal
                open={memberModalOpen}
                onClose={() => setMemberModalOpen(false)}
                title="Tambah Pengurus DPC"
                size="sm"
            >
                <form onSubmit={handleMemberSubmit} className="space-y-4">

                    <div className="mt-4 space-y-4">
                        <Input
                            label="Nama Lengkap"
                            placeholder="Contoh: Budi Santoso"
                            value={memberName}
                            onChange={(e) => setMemberName(e.target.value)}
                            required
                        />

                        <Input
                            label="Jabatan"
                            placeholder="Contoh: Ketua DPC, Sekretaris DPC"
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
                    </div>

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
