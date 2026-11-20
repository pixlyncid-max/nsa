import React, { useState } from 'react';
import PortalLayout, { defaultMemberMenuItems } from '@/Layouts/PortalLayout';
import PageBanner from '@/Components/layout/PageBanner';
import Card from '@/Components/ui/Card';
import Button from '@/Components/ui/Button';
import Input from '@/Components/ui/Input';
import Textarea from '@/Components/ui/Textarea';
import Modal from '@/Components/ui/Modal';
import { router } from '@inertiajs/react';
import {
    AlertCircle,
    Building2,
    Calendar,
    CheckCircle2,
    Clock,
    ExternalLink,
    FileCheck,
    Fish,
    HelpCircle,
    Layers,
    MapPin,
    Plus,
    Share2,
    Trash2,
    XCircle,
} from 'lucide-react';

interface LegalDoc {
    id: number;
    type: string;
    number: string;
    label: string;
    issued_at?: string;
    expires_at?: string;
    is_expiring_soon: boolean;
    is_expired: boolean;
    file_url?: string;
}

interface BusinessUnit {
    id: number;
    name: string;
    institution_name?: string;
    activity_field: string;
    scale: string;
    years_operating: number;
    province_name: string;
    regency_name: string;
    address: string;
    is_primary: boolean;
    legal_documents: LegalDoc[];
}

interface MentorshipItem {
    id: number;
    topic: string;
    description: string;
    status: string;
    status_label: string;
    business_name: string;
    admin_note?: string;
    created_at: string;
}

interface BusinessLegalProps {
    businesses: BusinessUnit[];
    legalSummary: {
        has_nib: boolean;
        has_npwp: boolean;
        has_cbib: boolean;
        total_units: number;
    };
    operationalSummary: {
        activities_count: number;
        primary_system: string;
        market_reach: string;
        partnership_needs: string;
    };
    mentorshipRequests: MentorshipItem[];
    provinces: Array<{ id: number; name: string }>;
}

export default function BusinessLegal({
    businesses,
    legalSummary,
    operationalSummary,
    mentorshipRequests,
    provinces,
}: BusinessLegalProps) {
    // Modal Tambah Unit Usaha
    const [addUnitModalOpen, setAddUnitModalOpen] = useState(false);
    const [unitName, setUnitName] = useState('');
    const [unitActivity, setUnitActivity] = useState('');
    const [unitScale, setUnitScale] = useState('Kecil');
    const [unitYears, setUnitYears] = useState(1);
    const [unitAddress, setUnitAddress] = useState('');
    const [unitProvinceId, setUnitProvinceId] = useState('');
    const [isSavingUnit, setIsSavingUnit] = useState(false);

    // Modal Tambah Izin Legalitas
    const [addDocModalOpen, setAddDocModalOpen] = useState(false);
    const [targetBusinessId, setTargetBusinessId] = useState<number | null>(null);
    const [docType, setDocType] = useState('nib');
    const [docNumber, setDocNumber] = useState('');
    const [docLabel, setDocLabel] = useState('');
    const [docExpiresAt, setDocExpiresAt] = useState('');
    const [docFile, setDocFile] = useState<File | null>(null);
    const [isSavingDoc, setIsSavingDoc] = useState(false);

    // Form Permintaan Pendampingan
    const [mentorTopic, setMentorTopic] = useState('');
    const [mentorDesc, setMentorDesc] = useState('');
    const [mentorBusinessId, setMentorBusinessId] = useState('');
    const [isSubmittingMentorship, setIsSubmittingMentorship] = useState(false);

    const handleCreateUnit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingUnit(true);
        router.post(
            '/anggota/usaha/unit',
            {
                name: unitName,
                activity_field: unitActivity,
                scale: unitScale,
                years_operating: unitYears,
                province_id: unitProvinceId || undefined,
                address: unitAddress,
            },
            {
                onSuccess: () => {
                    setAddUnitModalOpen(false);
                    setUnitName('');
                    setUnitActivity('');
                    setUnitAddress('');
                },
                onFinish: () => setIsSavingUnit(false),
            }
        );
    };

    const handleDeleteUnit = (id: number, name: string) => {
        if (confirm(`Yakin ingin menghapus unit usaha "${name}"?`)) {
            router.delete(`/anggota/usaha/unit/${id}`);
        }
    };

    const handleOpenAddDoc = (businessId: number) => {
        setTargetBusinessId(businessId);
        setDocType('nib');
        setDocNumber('');
        setDocLabel('');
        setDocExpiresAt('');
        setDocFile(null);
        setAddDocModalOpen(true);
    };

    const handleSaveDoc = (e: React.FormEvent) => {
        e.preventDefault();
        if (!targetBusinessId) return;

        const formData = new FormData();
        formData.append('business_id', targetBusinessId.toString());
        formData.append('type', docType);
        formData.append('number', docNumber);
        if (docLabel) formData.append('label', docLabel);
        if (docExpiresAt) formData.append('expires_at', docExpiresAt);
        if (docFile) formData.append('file', docFile);

        setIsSavingDoc(true);
        router.post('/anggota/usaha/izin', formData, {
            onSuccess: () => setAddDocModalOpen(false),
            onFinish: () => setIsSavingDoc(false),
        });
    };

    const handleDeleteDoc = (id: number) => {
        if (confirm('Yakin ingin menghapus berkas dokumen perizinan ini?')) {
            router.delete(`/anggota/usaha/izin/${id}`);
        }
    };

    const handleMentorshipSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmittingMentorship(true);
        router.post(
            '/anggota/usaha/pendampingan',
            {
                topic: mentorTopic,
                description: mentorDesc,
                business_id: mentorBusinessId || undefined,
            },
            {
                onSuccess: () => {
                    setMentorTopic('');
                    setMentorDesc('');
                    setMentorBusinessId('');
                },
                onFinish: () => setIsSubmittingMentorship(false),
            }
        );
    };

    return (
        <PortalLayout
            title="Usaha & Legalitas"
            areaLabel="PORTAL ANGGOTA"
            menuItems={defaultMemberMenuItems}
        >
            <div className="space-y-8">
                {/* Banner */}
                <PageBanner
                    eyebrow="USAHA & LEGALITAS"
                    title="Profil Usaha dan Perizinan"
                    subtitle="Kelola data unit usaha perikanan, status perizinan resmi (NIB, NPWP, CBIB), dan ajukan pendampingan teknis."
                    action={
                        <Button
                            variant="secondary"
                            onClick={() => setAddUnitModalOpen(true)}
                            className="!bg-white !text-navy hover:!bg-white/90 font-display text-xs shadow-soft"
                        >
                            <Plus className="mr-1.5 h-4 w-4 text-ocean" />
                            Tambah Unit Usaha
                        </Button>
                    }
                />

                {/* 1. Ringkasan Profil Usaha & Operasional */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Status Kelengkapan Izin Utama */}
                    <Card className="p-6 border-line shadow-soft">
                        <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-line">
                            <div className="w-8 h-8 rounded-lg bg-ocean/10 text-ocean flex items-center justify-center">
                                <FileCheck className="w-4 h-4" />
                            </div>
                            <div>
                                <h3 className="font-display text-base font-bold text-navy">
                                    Status Perizinan Berusaha
                                </h3>
                                <p className="text-xs text-slate">
                                    Dokumen legalitas penunjang kepatuhan usaha akuakultur.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <div className={`p-3.5 rounded-xl border text-center ${
                                legalSummary.has_nib ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-line'
                            }`}>
                                <span className="text-xs font-bold block text-navy">NIB OSS</span>
                                <span className={`text-[11px] font-semibold block mt-1 ${
                                    legalSummary.has_nib ? 'text-emerald-700' : 'text-slate'
                                }`}>
                                    {legalSummary.has_nib ? '✓ Terdata' : 'Belum Ada'}
                                </span>
                            </div>

                            <div className={`p-3.5 rounded-xl border text-center ${
                                legalSummary.has_npwp ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-line'
                            }`}>
                                <span className="text-xs font-bold block text-navy">NPWP</span>
                                <span className={`text-[11px] font-semibold block mt-1 ${
                                    legalSummary.has_npwp ? 'text-emerald-700' : 'text-slate'
                                }`}>
                                    {legalSummary.has_npwp ? '✓ Terdata' : 'Belum Ada'}
                                </span>
                            </div>

                            <div className={`p-3.5 rounded-xl border text-center ${
                                legalSummary.has_cbib ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-line'
                            }`}>
                                <span className="text-xs font-bold block text-navy">CBIB / CPIB</span>
                                <span className={`text-[11px] font-semibold block mt-1 ${
                                    legalSummary.has_cbib ? 'text-emerald-700' : 'text-slate'
                                }`}>
                                    {legalSummary.has_cbib ? '✓ Tersertifikasi' : 'Belum Ada'}
                                </span>
                            </div>
                        </div>
                    </Card>

                    {/* Ringkasan Operasional & Pemasaran (Langkah 4-5) */}
                    <Card className="p-6 border-line shadow-soft">
                        <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-line">
                            <div className="w-8 h-8 rounded-lg bg-ocean/10 text-ocean flex items-center justify-center">
                                <Fish className="w-4 h-4" />
                            </div>
                            <div>
                                <h3 className="font-display text-base font-bold text-navy">
                                    Operasional & Pemasaran
                                </h3>
                                <p className="text-xs text-slate">
                                    Rangkuman sistem produksi dan jangkauan distribusi.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-xs">
                            <div className="p-3 rounded-lg bg-mist/40 border border-line">
                                <span className="text-slate block">Sistem Budidaya:</span>
                                <strong className="text-navy text-sm block mt-0.5">
                                    {operationalSummary.primary_system}
                                </strong>
                            </div>
                            <div className="p-3 rounded-lg bg-mist/40 border border-line">
                                <span className="text-slate block">Jangkauan Pasar:</span>
                                <strong className="text-navy text-sm block mt-0.5 capitalize">
                                    {operationalSummary.market_reach}
                                </strong>
                            </div>
                            <div className="col-span-2 p-3 rounded-lg bg-mist/40 border border-line">
                                <span className="text-slate block">Kemitraan yang Dibutuhkan:</span>
                                <strong className="text-navy block mt-0.5">
                                    {operationalSummary.partnership_needs}
                                </strong>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* 2. Daftar Multi-Unit Usaha */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-display text-lg font-bold text-navy flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-ocean" />
                            Unit Usaha Terdaftar ({businesses.length})
                        </h3>
                    </div>

                    <div className="space-y-6">
                        {businesses.map((unit) => (
                            <Card key={unit.id} className="p-6 border-line shadow-soft">
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-line">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-display text-lg font-bold text-navy">
                                                {unit.name}
                                            </h4>
                                            {unit.is_primary && (
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-ocean/10 text-ocean border border-ocean/20">
                                                    Unit Utama
                                                </span>
                                            )}
                                        </div>
                                        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate">
                                            <span>Bidang: <strong className="text-navy">{unit.activity_field}</strong></span>
                                            <span>•</span>
                                            <span>Skala: <strong className="text-navy">{unit.scale}</strong></span>
                                            <span>•</span>
                                            <span>Beroperasi: <strong className="text-navy">{unit.years_operating} Tahun</strong></span>
                                            <span>•</span>
                                            <span>Wilayah: <strong className="text-navy">{unit.regency_name}, {unit.province_name}</strong></span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            onClick={() => handleOpenAddDoc(unit.id)}
                                            className="text-xs"
                                        >
                                            <Plus className="w-3.5 h-3.5 mr-1 text-ocean" />
                                            Tambah Izin
                                        </Button>
                                        {!unit.is_primary && (
                                            <Button
                                                size="sm"
                                                variant="danger"
                                                onClick={() => handleDeleteUnit(unit.id, unit.name)}
                                                className="text-xs !bg-rose-50 !text-danger hover:!bg-danger hover:!text-white border border-rose-200"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                {/* Daftar Izin Dokumen per Unit */}
                                <div className="mt-4">
                                    <span className="text-xs font-bold uppercase tracking-wider text-slate block mb-2">
                                        Dokumen Perizinan & Sertifikasi
                                    </span>

                                    {unit.legal_documents && unit.legal_documents.length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {unit.legal_documents.map((doc) => (
                                                <div
                                                    key={doc.id}
                                                    className={`p-3.5 rounded-xl border flex flex-col justify-between ${
                                                        doc.is_expired
                                                            ? 'bg-rose-50/60 border-rose-200'
                                                            : doc.is_expiring_soon
                                                            ? 'bg-amber-50/60 border-amber-200'
                                                            : 'bg-white border-line'
                                                    }`}
                                                >
                                                    <div>
                                                        <div className="flex items-start justify-between gap-1">
                                                            <span className="text-xs font-bold text-navy uppercase">
                                                                {doc.label}
                                                            </span>
                                                            {doc.is_expired ? (
                                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                                                                    Kadaluarsa
                                                                </span>
                                                            ) : doc.is_expiring_soon ? (
                                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                                                                    Segera Berakhir
                                                                </span>
                                                            ) : null}
                                                        </div>

                                                        <p className="font-mono text-xs text-ocean font-bold mt-1">
                                                            {doc.number}
                                                        </p>

                                                        {doc.expires_at && (
                                                            <p className="text-[11px] text-slate mt-1 flex items-center gap-1">
                                                                <Clock className="w-3 h-3" />
                                                                Berlaku: {doc.expires_at}
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div className="mt-3 pt-2 border-t border-line/50 flex items-center justify-between">
                                                        {doc.file_url ? (
                                                            <a
                                                                href={doc.file_url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-xs font-semibold text-ocean hover:text-navy inline-flex items-center gap-1"
                                                            >
                                                                <ExternalLink className="w-3 h-3" />
                                                                Lihat Berkas
                                                            </a>
                                                        ) : (
                                                            <span className="text-[11px] text-slate italic">Tanpa lampiran</span>
                                                        )}

                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteDoc(doc.id)}
                                                            className="text-slate hover:text-danger text-xs p-1"
                                                            title="Hapus izin"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-slate italic py-2">
                                            Belum ada dokumen izin yang ditambahkan untuk unit ini.
                                        </p>
                                    )}
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* 3. Permintaan Pendampingan Usaha & Sertifikasi */}
                <Card className="p-6 border-line shadow-soft">
                    <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-line">
                        <div className="w-8 h-8 rounded-lg bg-ocean/10 text-ocean flex items-center justify-center">
                            <HelpCircle className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="font-display text-base font-bold text-navy">
                                Permintaan Pendampingan NSA
                            </h3>
                            <p className="text-xs text-slate">
                                Ajukan fasilitasi legalitas, konsultasi budidaya, atau permohonan sertifikasi resmi ke pengurus asosiasi.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                        {/* Form Pendampingan */}
                        <form onSubmit={handleMentorshipSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate mb-1">
                                    Unit Usaha Terkait
                                </label>
                                <select
                                    className="h-11 w-full rounded-control border border-line bg-white px-3 text-sm text-ink focus:border-ocean focus:outline-none focus:ring-2 focus:ring-ocean/15"
                                    value={mentorBusinessId}
                                    onChange={(e) => setMentorBusinessId(e.target.value)}
                                >
                                    <option value="">Semua / Umum</option>
                                    {businesses.map((b) => (
                                        <option key={b.id} value={b.id}>
                                            {b.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate mb-1">
                                    Topik Pendampingan
                                </label>
                                <Input
                                    placeholder="Contoh: Pengurusan CBIB, Akses Permodalan, Masalah Penyakit Udang..."
                                    value={mentorTopic}
                                    onChange={(e) => setMentorTopic(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate mb-1">
                                    Uraian Kebutuhan Pendampingan (Wajib)
                                </label>
                                <Textarea
                                    placeholder="Jelaskan kendala usaha atau kebutuhan pendampingan teknis secara rinci..."
                                    value={mentorDesc}
                                    onChange={(e) => setMentorDesc(e.target.value)}
                                    rows={4}
                                    required
                                />
                            </div>

                            <Button
                                type="submit"
                                variant="primary"
                                disabled={isSubmittingMentorship}
                            >
                                {isSubmittingMentorship ? 'Mengirim...' : 'Kirim Permintaan Pendampingan'}
                            </Button>
                        </form>

                        {/* Riwayat Permintaan Pendampingan */}
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate mb-3">
                                Status Permintaan Terkirim
                            </h4>

                            {mentorshipRequests && mentorshipRequests.length > 0 ? (
                                <div className="space-y-3">
                                    {mentorshipRequests.map((req) => (
                                        <div key={req.id} className="p-3.5 rounded-xl border border-line bg-white shadow-xs">
                                            <div className="flex items-center justify-between">
                                                <h5 className="font-bold text-navy text-sm">
                                                    {req.topic}
                                                </h5>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                                    req.status === 'completed'
                                                        ? 'bg-emerald-100 text-emerald-800'
                                                        : req.status === 'in_progress'
                                                        ? 'bg-blue-100 text-blue-800'
                                                        : 'bg-amber-100 text-amber-800'
                                                }`}>
                                                    {req.status_label}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate mt-1 line-clamp-2">
                                                {req.description}
                                            </p>
                                            {req.admin_note && (
                                                <p className="text-xs text-ocean mt-1.5 p-2 rounded bg-ocean/5 border border-ocean/15">
                                                    Tanggapan Pengurus: {req.admin_note}
                                                </p>
                                            )}
                                            <span className="text-[10px] text-slate mt-2 block font-mono">
                                                {req.created_at} • {req.business_name}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-6 text-center bg-mist/30 rounded-xl border border-line/60">
                                    <HelpCircle className="w-8 h-8 text-slate/40 mx-auto mb-2" />
                                    <p className="text-xs text-slate">Belum ada permohonan pendampingan yang diajukan.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </Card>

                {/* Modal Tambah Unit Usaha */}
                <Modal
                    open={addUnitModalOpen}
                    onClose={() => setAddUnitModalOpen(false)}
                    title="Tambah Unit Usaha Baru"
                >
                    <form onSubmit={handleCreateUnit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate mb-1">
                                Nama Usaha / Merek
                            </label>
                            <Input
                                placeholder="Contoh: Tambak Vannamei Jaya 2"
                                value={unitName}
                                onChange={(e) => setUnitName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate mb-1">
                                    Bidang Kegiatan
                                </label>
                                <Input
                                    placeholder="Contoh: Pembudidaya Air Payau"
                                    value={unitActivity}
                                    onChange={(e) => setUnitActivity(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate mb-1">
                                    Skala Usaha
                                </label>
                                <select
                                    className="h-11 w-full rounded-control border border-line bg-white px-3 text-sm text-ink focus:border-ocean focus:outline-none focus:ring-2 focus:ring-ocean/15"
                                    value={unitScale}
                                    onChange={(e) => setUnitScale(e.target.value)}
                                >
                                    <option value="Mikro">Mikro</option>
                                    <option value="Kecil">Kecil</option>
                                    <option value="Menengah">Menengah</option>
                                    <option value="Besar">Besar</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate mb-1">
                                    Lama Beroperasi (Tahun)
                                </label>
                                <Input
                                    type="number"
                                    min="0"
                                    value={unitYears}
                                    onChange={(e) => setUnitYears(parseInt(e.target.value) || 0)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate mb-1">
                                    Provinsi
                                </label>
                                <select
                                    className="h-11 w-full rounded-control border border-line bg-white px-3 text-sm text-ink focus:border-ocean focus:outline-none focus:ring-2 focus:ring-ocean/15"
                                    value={unitProvinceId}
                                    onChange={(e) => setUnitProvinceId(e.target.value)}
                                >
                                    <option value="">Pilih Provinsi</option>
                                    {provinces.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate mb-1">
                                Alamat Fasilitas Usaha
                            </label>
                            <Textarea
                                placeholder="Alamat lengkap lokasi operasional tambak/kolam/kantor..."
                                value={unitAddress}
                                onChange={(e) => setUnitAddress(e.target.value)}
                                rows={2}
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setAddUnitModalOpen(false)}
                                disabled={isSavingUnit}
                            >
                                Batal
                            </Button>
                            <Button type="submit" variant="primary" disabled={isSavingUnit}>
                                {isSavingUnit ? 'Menyimpan...' : 'Simpan Unit Usaha'}
                            </Button>
                        </div>
                    </form>
                </Modal>

                {/* Modal Tambah Izin Legalitas */}
                <Modal
                    open={addDocModalOpen}
                    onClose={() => setAddDocModalOpen(false)}
                    title="Tambah Dokumen Perizinan"
                >
                    <form onSubmit={handleSaveDoc} className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate mb-1">
                                    Jenis Izin
                                </label>
                                <select
                                    className="h-11 w-full rounded-control border border-line bg-white px-3 text-sm text-ink focus:border-ocean focus:outline-none focus:ring-2 focus:ring-ocean/15"
                                    value={docType}
                                    onChange={(e) => setDocType(e.target.value)}
                                >
                                    <option value="nib">NIB (Nomor Induk Berusaha)</option>
                                    <option value="npwp">NPWP Badan / Pemilik</option>
                                    <option value="cbib">Sertifikat CBIB</option>
                                    <option value="cpib">Sertifikat CPIB</option>
                                    <option value="siup">Izin Usaha / SIUP</option>
                                    <option value="other">Izin Lainnya</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate mb-1">
                                    Nomor Surat / Izin
                                </label>
                                <Input
                                    placeholder="Nomor dokumen resmi..."
                                    value={docNumber}
                                    onChange={(e) => setDocNumber(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {docType === 'other' && (
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate mb-1">
                                    Nama Dokumen / Izin
                                </label>
                                <Input
                                    placeholder="Contoh: Izin Pemanfaatan Ruang Laut..."
                                    value={docLabel}
                                    onChange={(e) => setDocLabel(e.target.value)}
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate mb-1">
                                Masa Berlaku Hingga (Opsional)
                            </label>
                            <Input
                                type="date"
                                value={docExpiresAt}
                                onChange={(e) => setDocExpiresAt(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate mb-1">
                                Berkas Pindaian / Foto (JPG, PNG, PDF maks 3 MB)
                            </label>
                            <input
                                type="file"
                                accept=".jpg,.jpeg,.png,.pdf"
                                onChange={(e) => setDocFile(e.target.files?.[0] || null)}
                                className="block w-full text-xs text-slate file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-ocean/10 file:text-ocean hover:file:bg-ocean/20"
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setAddDocModalOpen(false)}
                                disabled={isSavingDoc}
                            >
                                Batal
                            </Button>
                            <Button type="submit" variant="primary" disabled={isSavingDoc}>
                                {isSavingDoc ? 'Mengunggah...' : 'Simpan Dokumen Izin'}
                            </Button>
                        </div>
                    </form>
                </Modal>
            </div>
        </PortalLayout>
    );
}
