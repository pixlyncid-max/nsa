import React, { useState, useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import Card from '@/Components/ui/Card';
import Button from '@/Components/ui/Button';
import Input from '@/Components/ui/Input';
import { StatusBadge } from '@/Components/ui/Badge';
import Pagination from '@/Components/ui/Pagination';
import { Link, router } from '@inertiajs/react';
import {
    Download,
    Search,
    Filter,
    CheckSquare,
    Eye,
    SlidersHorizontal,
    FileSpreadsheet,
    Users,
    RotateCcw,
    Calendar,
    Building2,
    MapPin,
    Tag,
} from 'lucide-react';

interface MemberItem {
    id: number;
    name: string;
    email: string;
    phone: string;
    membership_status: string;
    member_number: string | null;
    business_name: string;
    nib: string;
    province: string;
    regency: string;
    membership_type: string;
    created_at: string;
    submitted_at: string;
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

interface IndexProps {
    members: PaginatedData<MemberItem>;
    tabCounts?: {
        verifikasi_awal: number;
        menunggu_pembayaran: number;
        menunggu_persetujuan: number;
        disetujui: number;
        ditolak: number;
    };
    activeTab?: string;
    filters: {
        tab?: string;
        search?: string;
        status?: string;
        province_id?: string;
        regency_id?: string;
        membership_type?: string;
        date_from?: string;
        date_to?: string;
        sort?: string;
    };
    provinces: Array<{ id: number; name: string }>;
    regencies: Array<{ id: number; name: string }>;
    membershipPlans: Array<{ id: number; name: string; slug: string }>;
    statusOptions: Array<{ value: string; label: string }>;
}

export default function MembersIndex({
    members,
    tabCounts,
    activeTab: initialActiveTab,
    filters,
    provinces = [],
    regencies: initialRegencies = [],
    membershipPlans = [],
    statusOptions = [],
}: IndexProps) {
    const safeFilters = Array.isArray(filters) || !filters ? {} : filters;
    const currentTab = safeFilters.tab || initialActiveTab || '';
    const [search, setSearch] = useState(safeFilters.search || '');
    const [status, setStatus] = useState(safeFilters.status || '');
    const [provinceId, setProvinceId] = useState(safeFilters.province_id || '');
    const [regencyId, setRegencyId] = useState(safeFilters.regency_id || '');
    const [membershipType, setMembershipType] = useState(safeFilters.membership_type || '');
    const [dateFrom, setDateFrom] = useState(safeFilters.date_from || '');
    const [dateTo, setDateTo] = useState(safeFilters.date_to || '');
    const [sort, setSort] = useState(
        typeof safeFilters.sort === 'string' ? safeFilters.sort : 'newest'
    );
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [regencyList, setRegencyList] = useState<Array<{ id: number; name: string }>>(initialRegencies);
    const [loadingRegencies, setLoadingRegencies] = useState(false);

    // Fetch regencies dynamically when provinceId changes
    useEffect(() => {
        let isMounted = true;
        (async () => {
            await Promise.resolve();
            if (!isMounted) return;
            if (!provinceId) {
                setRegencyList([]);
                setRegencyId('');
                return;
            }

            setLoadingRegencies(true);
            try {
                const res = await fetch(`/api/regions/regencies?province_id=${provinceId}`);
                const data = await res.json();
                if (isMounted) {
                    setRegencyList(data);
                }
            } catch {
                if (isMounted) setRegencyList(initialRegencies);
            } finally {
                if (isMounted) setLoadingRegencies(false);
            }
        })();

        return () => {
            isMounted = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [provinceId]);

    const handleFilter = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        router.get(
            '/admin/anggota',
            {
                tab: currentTab || undefined,
                search: search || undefined,
                status: status || undefined,
                province_id: provinceId || undefined,
                regency_id: regencyId || undefined,
                membership_type: membershipType || undefined,
                date_from: dateFrom || undefined,
                date_to: dateTo || undefined,
                sort: sort || undefined,
            },
            { preserveState: true }
        );
    };

    const handleTabClick = (tabKey: string) => {
        router.get(
            '/admin/anggota',
            {
                tab: tabKey || undefined,
                search: search || undefined,
            },
            { preserveState: true }
        );
    };

    const handleReset = () => {
        setSearch('');
        setStatus('');
        setProvinceId('');
        setRegencyId('');
        setMembershipType('');
        setDateFrom('');
        setDateTo('');
        setSort('newest');
        router.get('/admin/anggota', {}, { preserveState: false });
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(members.data.map((m) => m.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleToggleSelect = (id: number) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter((item) => item !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleBulkApprove = () => {
        if (selectedIds.length === 0) return;
        if (confirm(`Setujui ${selectedIds.length} anggota terpilih sekaligus?`)) {
            router.post(
                '/admin/anggota/aksi-massal',
                {
                    action: 'approve',
                    ids: selectedIds,
                },
                {
                    onSuccess: () => setSelectedIds([]),
                }
            );
        }
    };

    const exportCsvUrl = `/admin/anggota/ekspor-csv?${new URLSearchParams({
        status: status || 'approved',
        search: search || '',
        province_id: provinceId || '',
        regency_id: regencyId || '',
    }).toString()}`;

    return (
        <AdminLayout title="Verifikasi & Kelola Anggota">
            <div className="space-y-6">
                {/* Header Action */}
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-ocean">
                            Manajemen CMS NSA
                        </span>
                        <h2 className="font-display text-2xl font-bold text-navy">
                            Verifikasi Pendaftaran Anggota
                        </h2>
                        <p className="text-sm text-slate mt-0.5">
                            Kelola alur verifikasi berkas 9 langkah, perubahan status keanggotaan, dan ekspor data resmi asosiasi.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <a
                            href={exportCsvUrl}
                            className="inline-flex h-10 items-center gap-2 rounded-lg border border-line bg-white px-4 text-xs font-semibold text-navy transition hover:bg-mist shadow-soft"
                            title="Unduh daftar anggota approved dalam format CSV UTF-8"
                        >
                            <FileSpreadsheet className="h-4 w-4 text-success" />
                            Ekspor CSV (Anggota Disetujui)
                        </a>
                    </div>
                </div>

                {/* Queue Tabs Antrean Verifikasi */}
                <div className="flex flex-wrap items-center gap-2 border-b border-line pb-3">
                    {[
                        { key: '', label: 'Semua Data', count: (tabCounts?.verifikasi_awal ?? 0) + (tabCounts?.menunggu_pembayaran ?? 0) + (tabCounts?.menunggu_persetujuan ?? 0) + (tabCounts?.disetujui ?? 0) + (tabCounts?.ditolak ?? 0) },
                        { key: 'verifikasi_awal', label: '1. Verifikasi Awal', count: tabCounts?.verifikasi_awal ?? 0, badgeClass: 'bg-amber-100 text-amber-800' },
                        { key: 'menunggu_pembayaran', label: '2. Menunggu Pembayaran', count: tabCounts?.menunggu_pembayaran ?? 0, badgeClass: 'bg-blue-100 text-blue-800' },
                        { key: 'menunggu_persetujuan', label: '3. Menunggu Persetujuan', count: tabCounts?.menunggu_persetujuan ?? 0, badgeClass: 'bg-purple-100 text-purple-800' },
                        { key: 'disetujui', label: '4. Disetujui', count: tabCounts?.disetujui ?? 0, badgeClass: 'bg-emerald-100 text-emerald-800' },
                        { key: 'ditolak', label: '5. Ditolak / Revisi', count: tabCounts?.ditolak ?? 0, badgeClass: 'bg-rose-100 text-rose-800' },
                    ].map((tab) => {
                        const isSelected = (!currentTab && !tab.key) || currentTab === tab.key;
                        return (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => handleTabClick(tab.key)}
                                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
                                    isSelected
                                        ? 'bg-navy text-white shadow-soft ring-2 ring-navy/20'
                                        : 'bg-white text-slate hover:bg-mist hover:text-navy border border-line'
                                }`}
                            >
                                <span>{tab.label}</span>
                                <span
                                    className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                                        isSelected
                                            ? 'bg-white/20 text-white'
                                            : tab.badgeClass || 'bg-slate/10 text-slate'
                                    }`}
                                >
                                    {tab.count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Filter Box Berfitur Lengkap */}
                <Card className="p-5 border-line shadow-soft">
                    <form onSubmit={handleFilter} className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {/* Input Pencarian Lengkap: nama, email, NTA, usaha, NIB */}
                            <div className="lg:col-span-2">
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate mb-1">
                                    Pencarian
                                </label>
                                <Input
                                    placeholder="Cari nama pemohon, email, NTA, usaha, NIB..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    leading={<Search className="h-4 w-4 text-slate" />}
                                />
                            </div>

                            {/* Filter Status Keanggotaan */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate mb-1">
                                    Status Pendaftaran
                                </label>
                                <select
                                    className="h-11 w-full rounded-control border border-line bg-white px-3 text-sm text-ink focus:border-ocean focus:outline-none focus:ring-2 focus:ring-ocean/15"
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                >
                                    <option value="">Semua Status</option>
                                    {statusOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Filter Jenis Keanggotaan */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate mb-1">
                                    Jenis Keanggotaan
                                </label>
                                <select
                                    className="h-11 w-full rounded-control border border-line bg-white px-3 text-sm text-ink focus:border-ocean focus:outline-none focus:ring-2 focus:ring-ocean/15"
                                    value={membershipType}
                                    onChange={(e) => setMembershipType(e.target.value)}
                                >
                                    <option value="">Semua Jenis Paket</option>
                                    {membershipPlans.map((plan) => (
                                        <option key={plan.id} value={plan.id}>
                                            {plan.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Baris Kedua: Wilayah & Rentang Tanggal */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 pt-1 border-t border-line/60">
                            {/* Filter Provinsi */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate mb-1">
                                    Provinsi
                                </label>
                                <select
                                    className="h-11 w-full rounded-control border border-line bg-white px-3 text-sm text-ink focus:border-ocean focus:outline-none focus:ring-2 focus:ring-ocean/15"
                                    value={provinceId}
                                    onChange={(e) => {
                                        setProvinceId(e.target.value);
                                        setRegencyId('');
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

                            {/* Filter Kabupaten/Kota */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate mb-1">
                                    Kabupaten / Kota
                                </label>
                                <select
                                    className="h-11 w-full rounded-control border border-line bg-white px-3 text-sm text-ink focus:border-ocean focus:outline-none focus:ring-2 focus:ring-ocean/15 disabled:bg-slate-50 disabled:text-slate-400"
                                    value={regencyId}
                                    onChange={(e) => setRegencyId(e.target.value)}
                                    disabled={!provinceId || loadingRegencies}
                                >
                                    <option value="">
                                        {loadingRegencies ? 'Memuat wilayah...' : provinceId ? 'Semua Kab/Kota' : 'Pilih Provinsi Dahulu'}
                                    </option>
                                    {regencyList.map((reg) => (
                                        <option key={reg.id} value={reg.id}>
                                            {reg.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Tanggal Dari */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate mb-1">
                                    Tanggal Daftar Dari
                                </label>
                                <Input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                />
                            </div>

                            {/* Tanggal Sampai */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate mb-1">
                                    Tanggal Daftar Sampai
                                </label>
                                <Input
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Baris Tombol Aksi Filter */}
                        <div className="flex items-center justify-between pt-2">
                            <span className="text-xs text-slate">
                                Menampilkan total <span className="font-semibold text-navy">{members.total}</span> pendaftar
                            </span>
                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    onClick={handleReset}
                                    className="border-line text-slate hover:text-navy"
                                >
                                    <RotateCcw className="w-3.5 h-3.5 mr-1" />
                                    Reset
                                </Button>
                                <Button type="submit" variant="primary" size="sm" className="font-display">
                                    <Filter className="w-3.5 h-3.5 mr-1" />
                                    Terapkan Filter
                                </Button>
                            </div>
                        </div>
                    </form>
                </Card>

                {/* Bulk Action Bar */}
                {selectedIds.length > 0 && (
                    <div className="flex items-center justify-between rounded-lg border border-ocean/30 bg-ocean/5 p-3 px-4">
                        <span className="text-sm font-medium text-navy">
                            {selectedIds.length} pendaftar dipilih
                        </span>
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={handleBulkApprove}
                            className="!bg-success hover:!bg-success font-display"
                        >
                            Setujui Pendaftaran Massal
                        </Button>
                    </div>
                )}

                {/* Data Table */}
                <Card className="overflow-hidden border-line shadow-soft">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-ink">
                            <thead className="border-b border-line bg-mist/60 font-display text-xs font-semibold text-navy uppercase tracking-wider">
                                <tr>
                                    <th className="w-10 px-4 py-3.5">
                                        <input
                                            type="checkbox"
                                            className="rounded border-line text-royal-blue focus:ring-ocean"
                                            onChange={handleSelectAll}
                                            checked={
                                                members.data.length > 0 &&
                                                selectedIds.length === members.data.length
                                            }
                                        />
                                    </th>
                                    <th className="px-4 py-3.5">Pemohon</th>
                                    <th className="px-4 py-3.5">Usaha & NIB</th>
                                    <th className="px-4 py-3.5">Jenis Keanggotaan</th>
                                    <th className="px-4 py-3.5">Lokasi Usaha</th>
                                    <th className="px-4 py-3.5">Status & NTA</th>
                                    <th className="px-4 py-3.5">Tgl Daftar</th>
                                    <th className="px-4 py-3.5 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-line">
                                {members.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="py-12 text-center text-slate">
                                            <Users className="mx-auto mb-2 h-8 w-8 text-slate/40" />
                                            <p className="font-medium text-navy">Tidak ada data anggota ditemukan</p>
                                            <p className="text-xs text-slate">Coba sesuaikan kata kunci pencarian atau bersihkan filter di atas.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    members.data.map((m) => (
                                        <tr key={m.id} className="transition hover:bg-mist/30">
                                            <td className="px-4 py-3.5">
                                                <input
                                                    type="checkbox"
                                                    className="rounded border-line text-royal-blue focus:ring-ocean"
                                                    checked={selectedIds.includes(m.id)}
                                                    onChange={() => handleToggleSelect(m.id)}
                                                />
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <div className="font-semibold text-navy">
                                                    {m.name}
                                                </div>
                                                <div className="text-xs text-slate">{m.email}</div>
                                                {m.phone && <div className="text-xs text-slate/80">{m.phone}</div>}
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <div className="font-medium text-navy">{m.business_name}</div>
                                                <div className="text-xs font-mono text-slate">
                                                    NIB: {m.nib !== '-' ? m.nib : 'Belum diisi'}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <span className="inline-flex items-center gap-1 text-xs font-medium text-navy bg-light-blue/15 px-2 py-0.5 rounded-md border border-light-blue/30">
                                                    <Tag className="w-3 h-3 text-ocean" />
                                                    {m.membership_type}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5 text-xs text-slate">
                                                <div className="font-medium text-navy">{m.regency}</div>
                                                <div>{m.province}</div>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <div className="mb-1">
                                                    <StatusBadge status={m.membership_status} />
                                                </div>
                                                {m.member_number ? (
                                                    <div className="font-mono text-xs font-bold text-navy">
                                                        {m.member_number}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-slate/60">-</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3.5 text-xs text-slate whitespace-nowrap">
                                                {m.submitted_at || m.created_at}
                                            </td>
                                            <td className="px-4 py-3.5 text-right whitespace-nowrap">
                                                <Link
                                                    href={`/admin/anggota/${m.id}`}
                                                    className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-semibold text-navy transition hover:bg-mist hover:text-royal-blue shadow-soft"
                                                >
                                                    <Eye className="h-3.5 w-3.5 text-ocean" />
                                                    Verifikasi
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {members.links && members.links.length > 3 && (
                        <div className="border-t border-line p-4">
                            <Pagination links={members.links} />
                        </div>
                    )}
                </Card>
            </div>
        </AdminLayout>
    );
}
