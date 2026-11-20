import React, { useState } from 'react';
import PortalLayout, { defaultMemberMenuItems } from '@/Layouts/PortalLayout';
import PageBanner from '@/Components/layout/PageBanner';
import Card from '@/Components/ui/Card';
import Button from '@/Components/ui/Button';
import Input from '@/Components/ui/Input';
import Textarea from '@/Components/ui/Textarea';
import Modal from '@/Components/ui/Modal';
import { StatusBadge } from '@/Components/ui/Badge';
import { router } from '@inertiajs/react';
import {
    AlertCircle,
    CheckCircle2,
    Clock,
    ExternalLink,
    FileCheck,
    History,
    Info,
    Lock,
    PenTool,
    RotateCcw,
    Shield,
    ShieldCheck,
    User,
    XCircle,
} from 'lucide-react';

interface DocumentItem {
    id: number;
    type: string;
    original_name: string;
    status: string;
    signed_url: string;
    formatted_size: string;
    uploaded_at: string;
}

interface ReviewLogItem {
    id: number;
    action: string;
    note: string;
    admin_name: string;
    created_at: string;
}

interface ChangeRequestItem {
    id: number;
    field: string;
    field_label: string;
    old_value: string;
    new_value: string;
    reason: string;
    status: string;
    admin_note: string | null;
    created_at: string;
}

interface ProfileProps {
    memberData: {
        name: string;
        email: string;
        phone: string;
        member_number: string;
        nationality: string;
        masked_nik: string;
        masked_passport: string;
        gender: string;
        birth_place: string;
        birth_date: string;
        address: string;
        category_name: string;
        membership_type: string;
        documents: DocumentItem[];
        review_logs: ReviewLogItem[];
        change_requests: ChangeRequestItem[];
    };
}

export default function ProfileVerification({ memberData }: ProfileProps) {
    // Basic data form state
    const [phone, setPhone] = useState(memberData.phone || '');
    const [birthPlace, setBirthPlace] = useState(memberData.birth_place || '');
    const [birthDate, setBirthDate] = useState('');
    const [gender, setGender] = useState(memberData.gender || 'male');
    const [address, setAddress] = useState(memberData.address || '');
    const [isUpdatingBasic, setIsUpdatingBasic] = useState(false);

    // Critical data change request modal state
    const [changeModalOpen, setChangeModalOpen] = useState(false);
    const [changeField, setChangeField] = useState('name');
    const [newValue, setNewValue] = useState('');
    const [changeReason, setChangeReason] = useState('');
    const [isSubmittingChange, setIsSubmittingChange] = useState(false);

    const handleBasicUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdatingBasic(true);
        router.post(
            '/anggota/profil',
            {
                phone,
                birth_place: birthPlace,
                birth_date: birthDate || undefined,
                gender,
                address,
            },
            {
                onFinish: () => setIsUpdatingBasic(false),
            }
        );
    };

    const handleCriticalChangeSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newValue.trim() || !changeReason.trim()) {
            alert('Nilai data baru dan alasan permohonan wajib diisi.');
            return;
        }

        setIsSubmittingChange(true);
        router.post(
            '/anggota/profil/permohonan-perubahan',
            {
                field: changeField,
                new_value: newValue,
                reason: changeReason,
            },
            {
                onSuccess: () => {
                    setChangeModalOpen(false);
                    setNewValue('');
                    setChangeReason('');
                },
                onFinish: () => setIsSubmittingChange(false),
            }
        );
    };

    return (
        <PortalLayout
            title="Profil & Verifikasi"
            areaLabel="PORTAL ANGGOTA"
            menuItems={defaultMemberMenuItems}
        >
            <div className="space-y-8">
                {/* Banner */}
                <PageBanner
                    eyebrow="PROFIL & VERIFIKASI"
                    title="Data Identitas & Verifikasi Berkas"
                    subtitle="Kelola data kependudukan, status dokumen resmi, dan ajukan permohonan pembaruan data anggota."
                    action={
                        <Button
                            variant="secondary"
                            onClick={() => setChangeModalOpen(true)}
                            className="!bg-white !text-navy hover:!bg-white/90 font-display text-xs shadow-soft"
                        >
                            <Lock className="mr-1.5 h-4 w-4 text-warning" />
                            Ubah Data Penting (Admin Approval)
                        </Button>
                    }
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Kolom Kiri: Informasi Identitas Terkunci & Form Ubah Data Dasar */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Data Identitas Resmi (Masked) */}
                        <Card className="p-6 border-line shadow-soft">
                            <div className="flex items-center justify-between pb-4 mb-4 border-b border-line">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-ocean/10 text-ocean flex items-center justify-center">
                                        <ShieldCheck className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h3 className="font-display text-base font-bold text-navy">
                                            Data Identitas Resmi
                                        </h3>
                                        <p className="text-xs text-slate">
                                            Data kependudukan terverifikasi. Nomor identitas disamarkan demi privasi.
                                        </p>
                                    </div>
                                </div>
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    Terverifikasi
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                <div className="p-3.5 rounded-xl bg-mist/30 border border-line">
                                    <span className="text-xs text-slate font-medium">Nama Lengkap</span>
                                    <p className="font-bold text-navy mt-1 text-base">{memberData.name}</p>
                                </div>
                                <div className="p-3.5 rounded-xl bg-mist/30 border border-line">
                                    <span className="text-xs text-slate font-medium">Nomor Tanda Anggota (NTA)</span>
                                    <p className="font-mono font-bold text-ocean mt-1 text-base">
                                        {memberData.member_number || '-'}
                                    </p>
                                </div>
                                <div className="p-3.5 rounded-xl bg-mist/30 border border-line">
                                    <span className="text-xs text-slate font-medium">Kewarganegaraan</span>
                                    <p className="font-bold text-navy mt-1 uppercase">{memberData.nationality}</p>
                                </div>
                                <div className="p-3.5 rounded-xl bg-mist/30 border border-line">
                                    <span className="text-xs text-slate font-medium">
                                        {memberData.nationality === 'wna' ? 'Nomor Paspor' : 'NIK KTP'} (Dimasker)
                                    </span>
                                    <p className="font-mono font-bold text-navy mt-1">
                                        {memberData.nationality === 'wna' ? memberData.masked_passport : memberData.masked_nik}
                                    </p>
                                </div>
                                <div className="p-3.5 rounded-xl bg-mist/30 border border-line">
                                    <span className="text-xs text-slate font-medium">Kategori Keanggotaan</span>
                                    <p className="font-bold text-navy mt-1 capitalize">{memberData.category_name}</p>
                                </div>
                                <div className="p-3.5 rounded-xl bg-mist/30 border border-line">
                                    <span className="text-xs text-slate font-medium">Jenis Paket Keanggotaan</span>
                                    <p className="font-bold text-ocean mt-1">{memberData.membership_type}</p>
                                </div>
                            </div>
                        </Card>

                        {/* Form Perubahan Data Dasar (Boleh Diubah Mandiri) */}
                        <Card className="p-6 border-line shadow-soft">
                            <div className="flex items-center justify-between pb-4 mb-4 border-b border-line">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-ocean/10 text-ocean flex items-center justify-center">
                                        <User className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h3 className="font-display text-base font-bold text-navy">
                                            Pembaruan Data Dasar
                                        </h3>
                                        <p className="text-xs text-slate">
                                            Nomor kontak, tempat tanggal lahir, dan alamat domisili dapat Anda ubah secara langsung.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleBasicUpdate} className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate mb-1">
                                            Nomor Telepon / WhatsApp
                                        </label>
                                        <Input
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate mb-1">
                                            Jenis Kelamin
                                        </label>
                                        <select
                                            className="h-11 w-full rounded-control border border-line bg-white px-3 text-sm text-ink focus:border-ocean focus:outline-none focus:ring-2 focus:ring-ocean/15"
                                            value={gender}
                                            onChange={(e) => setGender(e.target.value)}
                                        >
                                            <option value="male">Laki-laki</option>
                                            <option value="female">Perempuan</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate mb-1">
                                            Tempat Lahir
                                        </label>
                                        <Input
                                            value={birthPlace}
                                            onChange={(e) => setBirthPlace(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate mb-1">
                                            Tanggal Lahir (Kosongkan bila tidak diubah)
                                        </label>
                                        <Input
                                            type="date"
                                            value={birthDate}
                                            onChange={(e) => setBirthDate(e.target.value)}
                                        />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate mb-1">
                                            Alamat Lengkap Domisili
                                        </label>
                                        <Textarea
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                            rows={3}
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end pt-2">
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        disabled={isUpdatingBasic}
                                    >
                                        {isUpdatingBasic ? 'Menyimpan...' : 'Simpan Data Dasar'}
                                    </Button>
                                </div>
                            </form>
                        </Card>

                        {/* Riwayat Permohonan Perubahan Data Penting */}
                        {memberData.change_requests && memberData.change_requests.length > 0 && (
                            <Card className="p-6 border-line shadow-soft">
                                <h3 className="font-display text-base font-bold text-navy mb-4 flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-ocean" />
                                    Riwayat Permohonan Perubahan Data Penting
                                </h3>

                                <div className="divide-y divide-line">
                                    {memberData.change_requests.map((cr) => (
                                        <div key={cr.id} className="py-3 flex items-start justify-between gap-4">
                                            <div>
                                                <span className="text-xs font-bold text-navy block">
                                                    Perubahan {cr.field_label}
                                                </span>
                                                <p className="text-xs text-slate mt-0.5">
                                                    Nilai baru diajukan: <strong className="text-ink">{cr.new_value}</strong>
                                                </p>
                                                <p className="text-xs text-slate italic mt-0.5">
                                                    Alasan: "{cr.reason}"
                                                </p>
                                                {cr.admin_note && (
                                                    <p className="text-xs text-ocean mt-1">
                                                        Catatan Admin: {cr.admin_note}
                                                    </p>
                                                )}
                                                <span className="text-[10px] text-slate font-mono block mt-1">
                                                    Diajukan: {cr.created_at}
                                                </span>
                                            </div>
                                            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full capitalize ${
                                                cr.status === 'approved'
                                                    ? 'bg-emerald-100 text-emerald-800'
                                                    : cr.status === 'rejected'
                                                    ? 'bg-rose-100 text-rose-800'
                                                    : 'bg-amber-100 text-amber-800'
                                            }`}>
                                                {cr.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        )}
                    </div>

                    {/* Kolom Kanan: Status Dokumen & Log Keputusan */}
                    <div className="space-y-6">
                        {/* Status Verifikasi Dokumen */}
                        <Card className="p-6 border-line shadow-soft">
                            <h3 className="font-display text-base font-bold text-navy mb-4 flex items-center gap-2">
                                <FileCheck className="w-4 h-4 text-ocean" />
                                Status Dokumen Resmi
                            </h3>

                            {memberData.documents && memberData.documents.length > 0 ? (
                                <div className="space-y-3">
                                    {memberData.documents.map((doc) => (
                                        <div
                                            key={doc.id}
                                            className="p-3.5 rounded-xl border border-line bg-mist/20 flex items-center justify-between"
                                        >
                                            <div className="min-w-0 pr-2">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-ocean block">
                                                    {doc.type.toUpperCase()}
                                                </span>
                                                <p className="text-xs font-semibold text-navy truncate">
                                                    {doc.original_name}
                                                </p>
                                                <span className="text-[10px] text-slate">
                                                    {doc.formatted_size} • {doc.uploaded_at}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                                    Valid
                                                </span>
                                                <a
                                                    href={doc.signed_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-1.5 rounded-lg text-slate hover:text-ocean hover:bg-mist transition"
                                                    title="Lihat berkas"
                                                >
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-slate italic">Belum ada berkas dokumen tersimpan.</p>
                            )}
                        </Card>

                        {/* Riwayat Keputusan Verifikasi */}
                        <Card className="p-6 border-line shadow-soft">
                            <h3 className="font-display text-base font-bold text-navy mb-4 flex items-center gap-2">
                                <History className="w-4 h-4 text-ocean" />
                                Riwayat Keputusan Verifikasi
                            </h3>

                            {memberData.review_logs && memberData.review_logs.length > 0 ? (
                                <div className="space-y-4">
                                    {memberData.review_logs.map((log) => (
                                        <div key={log.id} className="p-3 rounded-xl border border-line bg-white shadow-xs">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="font-bold uppercase tracking-wider text-navy">
                                                    {log.action}
                                                </span>
                                                <span className="text-[10px] text-slate font-mono">
                                                    {log.created_at}
                                                </span>
                                            </div>
                                            <p className="text-xs text-ink mt-1.5 leading-relaxed">
                                                {log.note || 'Persetujuan resmi keanggotaan NSA.'}
                                            </p>
                                            <p className="text-[10px] text-slate mt-1 border-t border-line/40 pt-1">
                                                Oleh: <strong className="text-navy">{log.admin_name}</strong>
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-slate italic">Belum ada catatan log tersimpan.</p>
                            )}
                        </Card>
                    </div>
                </div>

                {/* Modal Permohonan Perubahan Data Penting */}
                <Modal
                    open={changeModalOpen}
                    onClose={() => setChangeModalOpen(false)}
                    title="Permohonan Perubahan Data Penting"
                >
                    <form onSubmit={handleCriticalChangeSubmit} className="space-y-4">
                        <div className="p-4 rounded-xl bg-warning/10 border border-warning/30 text-xs text-amber-950 leading-relaxed">
                            <p className="font-bold flex items-center gap-1.5 text-amber-900 mb-1">
                                <AlertCircle className="w-4 h-4 text-warning" />
                                Memerlukan Verifikasi Pengurus
                            </p>
                            Perubahan data penting seperti Nama Resmi, Kewarganegaraan, NIK/Paspor, atau Kategori Usaha memerlukan persetujuan dari tim verifikator NSA demi integritas basis data organisasi.
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1">
                                Bidang Data yang Ingin Diubah
                            </label>
                            <select
                                className="h-11 w-full rounded-control border border-line bg-white px-3 text-sm text-ink focus:border-ocean focus:outline-none focus:ring-2 focus:ring-ocean/15"
                                value={changeField}
                                onChange={(e) => setChangeField(e.target.value)}
                            >
                                <option value="name">Nama Lengkap Anggota</option>
                                <option value="nationality">Kewarganegaraan (WNI / WNA)</option>
                                <option value="membership_category">Kategori Keanggotaan</option>
                                <option value="nik">Nomor Induk Kependudukan (NIK)</option>
                                <option value="passport_number">Nomor Paspor (WNA)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1">
                                Data Baru yang Benar
                            </label>
                            <Input
                                placeholder="Masukkan nilai data baru..."
                                value={newValue}
                                onChange={(e) => setNewValue(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1">
                                Alasan Permohonan Perubahan (Wajib)
                            </label>
                            <Textarea
                                placeholder="Jelaskan alasan pembaruan data, nomor akta perbaikan, atau perubahan identitas hukum..."
                                value={changeReason}
                                onChange={(e) => setChangeReason(e.target.value)}
                                rows={3}
                                required
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setChangeModalOpen(false)}
                                disabled={isSubmittingChange}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={isSubmittingChange}
                            >
                                {isSubmittingChange ? 'Mengirim...' : 'Kirim Permohonan'}
                            </Button>
                        </div>
                    </form>
                </Modal>
            </div>
        </PortalLayout>
    );
}
