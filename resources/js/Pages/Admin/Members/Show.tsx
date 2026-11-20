import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import Card from '@/Components/ui/Card';
import Button from '@/Components/ui/Button';
import Modal from '@/Components/ui/Modal';
import Textarea from '@/Components/ui/Textarea';
import { StatusBadge } from '@/Components/ui/Badge';
import { usePage, router, Link } from '@inertiajs/react';
import type { PageProps } from '@/types';
import {
    ArrowLeft,
    CheckCircle2,
    RotateCcw,
    XCircle,
    Building2,
    User as UserIcon,
    Fish,
    Trash2,
    MapPin,
    AlertCircle,
    History,
    Check,
    Briefcase,
    FileCheck,
    Layers,
    Info,
    CreditCard,
    Phone,
    Mail,
    Share2,
    Compass,
    Image as ImageIcon,
    Receipt,
    ExternalLink,
    Clock,
    FileText,
} from 'lucide-react';

interface MemberDetailProps {
    member: {
        id: number;
        name: string;
        email: string;
        phone: string;
        membership_status: string;
        member_number: string | null;
        avatar: string | null;
        created_at: string;
        profile: any;
        business: any;
        business_fields: string[];
        documents: Array<{
            id: number;
            type: string;
            original_name: string;
            file_size: number;
            file_size_formatted: string;
            preview_url: string;
        }>;
        social_links: any[];
        commodities: any[];
        application: {
            id: number;
            status: string;
            current_step: string;
            review_note: string | null;
            membership_category: string | null;
            membership_category_custom: string | null;
            applicant_type: string | null;
            institution_name: string | null;
            applicant_position: string | null;
            membership_type: string | null;
            identity: {
                full_name: string;
                nationality: string;
                nik: string | null;
                passport_number: string | null;
                origin_country: string | null;
                years_in_indonesia: number | null;
                gender: string;
                birth_place: string;
                birth_date: string;
                phone: string;
                email: string;
                ktp_address: any;
            } | null;
            businesses: Array<{
                id: number;
                name: string;
                activity_field: string;
                scale: string;
                years_operating: number;
                has_no_business: boolean;
                main_job: string | null;
                legal_documents: Array<{
                    type: string;
                    number: string;
                    label: string;
                }>;
            }>;
            fish_activities: Array<{
                farming_system: string | null;
                pond_count: number | null;
                production_amount: number | null;
                production_unit: string | null;
                period: string | null;
                seed_need: number | null;
                feed_need: number | null;
                purchase_capacity: number | null;
                notes: string | null;
            }>;
            network_profile: any;
            program_interests: Array<{
                category: string;
                note: string | null;
            }>;
            locations: Array<{
                kind: string;
                province: string | null;
                regency: string | null;
                address: string | null;
                latitude: number | null;
                longitude: number | null;
            }>;
            photos: Array<{
                id: number;
                url: string;
                caption: string | null;
            }>;
            invoices: Array<{
                id: number;
                number: string;
                status: string;
                total: number;
                due_at: string | null;
                items: Array<{
                    id: number;
                    name: string;
                    amount: number;
                    qty: number;
                    size: string | null;
                    subtotal: number;
                }>;
                latest_payment: {
                    id: number;
                    amount: number;
                    status: string;
                    proof_url: string | null;
                    sender_name: string | null;
                    sender_bank: string | null;
                    paid_at: string | null;
                    notes: string | null;
                } | null;
            }>;
            submitted_at: string | null;
            approved_at: string | null;
            previous_organization: string | null;
            recommender_name: string | null;
            plan?: any;
            dpc?: any;
        } | null;
        statement?: any;
        review_logs: Array<{
            id: number;
            action: string;
            note: string;
            admin_name: string;
            created_at: string;
        }>;
    };
}

export default function MemberShow({ member }: MemberDetailProps) {
    const { auth } = usePage<PageProps>().props;
    const isSuperadmin = auth.user?.role === 'superadmin';

    const [activeTab, setActiveTab] = useState<number>(1);

    // Modals
    const [passInitialModalOpen, setPassInitialModalOpen] = useState(false);
    const [approveModalOpen, setApproveModalOpen] = useState(false);
    const [rejectPaymentModalOpen, setRejectPaymentModalOpen] = useState(false);
    const [revisionModalOpen, setRevisionModalOpen] = useState(false);
    const [rejectModalOpen, setRejectModalOpen] = useState(false);

    // Form states
    const [passInitialNote, setPassInitialNote] = useState('');
    const [approveNote, setApproveNote] = useState('');
    const [rejectPaymentReason, setRejectPaymentReason] = useState('');
    const [revisionSelectedSections, setRevisionSelectedSections] = useState<string[]>([]);
    const [revisionNote, setRevisionNote] = useState('');
    const [rejectReason, setRejectReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const stepSections = [
        { id: 1, title: 'Identitas Calon Anggota', short: 'Identitas', icon: UserIcon },
        { id: 2, title: 'Kategori Keanggotaan', short: 'Kategori', icon: Layers },
        { id: 3, title: 'Profil Usaha & Legalitas', short: 'Usaha', icon: Building2 },
        { id: 4, title: 'Aktivitas Perikanan', short: 'Aktivitas', icon: Fish },
        { id: 5, title: 'Jaringan Bisnis', short: 'Jaringan', icon: Share2 },
        { id: 6, title: 'Minat Program NSA', short: 'Minat', icon: Compass },
        { id: 7, title: 'Lokasi, Foto & Dokumen', short: 'Lokasi & Dokumen', icon: FileCheck },
        { id: 8, title: 'Paket & Administrasi', short: 'Paket & Biaya', icon: Receipt },
        { id: 9, title: 'Pemeriksaan & Riwayat', short: 'Pemeriksaan', icon: History },
    ];

    const latestInvoice = member.application?.invoices?.[0];
    const latestPayment = latestInvoice?.latest_payment;

    const toggleRevisionSection = (sectionName: string) => {
        if (revisionSelectedSections.includes(sectionName)) {
            setRevisionSelectedSections(revisionSelectedSections.filter((s) => s !== sectionName));
        } else {
            setRevisionSelectedSections([...revisionSelectedSections, sectionName]);
        }
    };

    const handlePassInitial = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        router.post(
            `/admin/anggota/${member.id}/lolos-awal`,
            { note: passInitialNote || undefined },
            {
                onSuccess: () => {
                    setPassInitialModalOpen(false);
                    setPassInitialNote('');
                },
                onFinish: () => setIsSubmitting(false),
            }
        );
    };

    const handleApprove = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        router.post(
            `/admin/anggota/${member.id}/setujui`,
            { note: approveNote || undefined },
            {
                onSuccess: () => setApproveModalOpen(false),
                onFinish: () => setIsSubmitting(false),
            }
        );
    };

    const handleRejectPayment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!rejectPaymentReason || rejectPaymentReason.trim().length < 5) {
            alert('Alasan penolakan bukti pembayaran wajib diisi minimal 5 karakter.');
            return;
        }
        setIsSubmitting(true);
        router.post(
            `/admin/anggota/${member.id}/tolak-bukti-bayar`,
            { reason: rejectPaymentReason },
            {
                onSuccess: () => {
                    setRejectPaymentModalOpen(false);
                    setRejectPaymentReason('');
                },
                onFinish: () => setIsSubmitting(false),
            }
        );
    };

    const handleRevision = (e: React.FormEvent) => {
        e.preventDefault();
        if (revisionSelectedSections.length === 0 && !revisionNote.trim()) {
            alert('Pilih setidaknya satu bagian yang perlu diperbaiki atau tulis catatan perbaikan.');
            return;
        }

        setIsSubmitting(true);
        router.post(
            `/admin/anggota/${member.id}/minta-revisi`,
            {
                sections: revisionSelectedSections,
                note: revisionNote,
            },
            {
                onSuccess: () => {
                    setRevisionModalOpen(false);
                    setRevisionSelectedSections([]);
                    setRevisionNote('');
                },
                onFinish: () => setIsSubmitting(false),
            }
        );
    };

    const handleReject = (e: React.FormEvent) => {
        e.preventDefault();
        if (!rejectReason || rejectReason.trim().length < 5) {
            alert('Alasan penolakan wajib diisi minimal 5 karakter.');
            return;
        }

        setIsSubmitting(true);
        router.post(
            `/admin/anggota/${member.id}/tolak`,
            { reason: rejectReason },
            {
                onSuccess: () => {
                    setRejectModalOpen(false);
                    setRejectReason('');
                },
                onFinish: () => setIsSubmitting(false),
            }
        );
    };

    const handleDeletePermanent = () => {
        if (
            confirm(
                `Yakin ingin MENGHAPUS PERMANEN akun dan seluruh data pendaftaran milik ${member.name}? Tindakan ini tidak dapat dibatalkan.`
            )
        ) {
            router.delete(`/admin/anggota/${member.id}`);
        }
    };

    const identity = member.application?.identity;
    const business = member.application?.businesses?.[0];

    return (
        <AdminLayout title={`Verifikasi Pendaftaran: ${member.name}`}>
            <div className="space-y-6">
                {/* Header Back & Action Buttons */}
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <Link
                        href="/admin/anggota"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-slate hover:text-navy transition"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Kembali ke Antrean Pendaftaran
                    </Link>

                    {/* Action Bar based on Status */}
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Tahap 1: Pending Review (Verifikasi Awal) */}
                        {member.membership_status === 'pending_review' && (
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={() => setPassInitialModalOpen(true)}
                                className="!bg-ocean hover:!bg-navy text-white font-display shadow-soft"
                            >
                                <CheckCircle2 className="mr-1.5 h-4 w-4" />
                                Loloskan Verifikasi Awal
                            </Button>
                        )}

                        {/* Tahap 3: Pending Approval (Sudah Bayar, Menunggu Persetujuan Akhir) */}
                        {member.membership_status === 'pending_approval' && (
                            <>
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => setApproveModalOpen(true)}
                                    className="!bg-success hover:!bg-emerald-700 text-white font-display shadow-soft"
                                >
                                    <CheckCircle2 className="mr-1.5 h-4 w-4" />
                                    Konfirmasi Pembayaran & Setujui
                                </Button>
                                <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => setRejectPaymentModalOpen(true)}
                                    className="!bg-rose-50 !text-danger hover:!bg-danger hover:!text-white border border-danger/30 font-display"
                                >
                                    <XCircle className="mr-1.5 h-4 w-4" />
                                    Tolak Bukti Bayar
                                </Button>
                            </>
                        )}

                        {/* Approved Direct Button for other statuses if needed */}
                        {member.membership_status !== 'approved' &&
                            member.membership_status !== 'pending_approval' &&
                            member.membership_status !== 'pending_review' && (
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => setApproveModalOpen(true)}
                                    className="!bg-success hover:!bg-emerald-700 text-white font-display shadow-soft"
                                >
                                    <CheckCircle2 className="mr-1.5 h-4 w-4" />
                                    Setujui Keanggotaan
                                </Button>
                            )}

                        {/* Permintaan Revisi */}
                        {member.membership_status !== 'approved' && (
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setRevisionModalOpen(true)}
                                className="border-warning/30 text-warning hover:bg-warning/10 font-display"
                            >
                                <RotateCcw className="mr-1.5 h-4 w-4 text-warning" />
                                Minta Revisi
                            </Button>
                        )}

                        {/* Tolak Pendaftaran */}
                        {member.membership_status !== 'rejected' && (
                            <Button
                                variant="danger"
                                size="sm"
                                onClick={() => setRejectModalOpen(true)}
                                className="font-display"
                            >
                                <XCircle className="mr-1.5 h-4 w-4" />
                                Tolak
                            </Button>
                        )}

                        {isSuperadmin && (
                            <Button
                                variant="danger"
                                size="sm"
                                onClick={handleDeletePermanent}
                                className="!bg-danger/10 !text-danger hover:!bg-danger hover:!text-white border border-danger/30"
                                title="Khusus Superadmin: Hapus permanen seluruh data pendaftar"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>

                {/* Profile Card Summary Banner */}
                <Card className="p-6 border-line shadow-soft">
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-4">
                            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-ocean/10 font-display text-2xl font-bold text-navy border border-ocean/20">
                                {member.avatar ? (
                                    <img
                                        src={member.avatar}
                                        alt={member.name}
                                        className="h-full w-full rounded-2xl object-cover"
                                    />
                                ) : (
                                    <span>{member.name.slice(0, 2).toUpperCase()}</span>
                                )}
                            </div>
                            <div>
                                <div className="flex flex-wrap items-center gap-3">
                                    <h2 className="font-display text-xl font-bold text-navy">
                                        {identity?.full_name || member.name}
                                    </h2>
                                    <StatusBadge status={member.membership_status} />
                                </div>
                                <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate">
                                    <span className="flex items-center gap-1">
                                        <Mail className="w-3.5 h-3.5 text-ocean" />
                                        {member.email}
                                    </span>
                                    {member.phone && (
                                        <span className="flex items-center gap-1">
                                            <Phone className="w-3.5 h-3.5 text-ocean" />
                                            {member.phone}
                                        </span>
                                    )}
                                    {business?.name && (
                                        <span className="flex items-center gap-1 font-medium text-navy">
                                            <Building2 className="w-3.5 h-3.5 text-ocean" />
                                            {business.name}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* NTA Box */}
                        <div className="rounded-xl border border-line bg-mist/60 p-4 text-left sm:text-right min-w-[200px]">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate">
                                Nomor Tanda Anggota (NTA)
                            </span>
                            <div className="font-mono text-lg font-bold text-navy mt-0.5">
                                {member.member_number ? (
                                    <span className="text-ocean">{member.member_number}</span>
                                ) : (
                                    <span className="text-slate-400 font-normal italic text-sm">
                                        Belum Diterbitkan
                                    </span>
                                )}
                            </div>
                            <span className="text-xs text-slate block mt-1">
                                Terdaftar: {member.created_at}
                            </span>
                        </div>
                    </div>
                </Card>

                {/* Bukti Pembayaran Card (Highlighted if awaiting approval or payment uploaded) */}
                {latestPayment && (
                    <Card className="p-6 border-ocean/30 bg-ocean/5 shadow-soft">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-ocean/20">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-ocean text-white">
                                    <CreditCard className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-display text-base font-bold text-navy">
                                        Bukti Pembayaran Pendaftaran
                                    </h3>
                                    <p className="text-xs text-slate">
                                        Tagihan #{latestInvoice?.number} • Total: Rp{' '}
                                        {Number(latestInvoice?.total ?? 0).toLocaleString('id-ID')}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                                    latestPayment.status === 'confirmed'
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : latestPayment.status === 'rejected'
                                        ? 'bg-rose-100 text-rose-800'
                                        : 'bg-amber-100 text-amber-800'
                                }`}>
                                    Status Bukti: {latestPayment.status.toUpperCase()}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 text-sm">
                            <div className="p-3.5 rounded-xl bg-white border border-line">
                                <span className="text-xs text-slate font-medium">Pengirim & Bank</span>
                                <p className="font-bold text-navy mt-1">
                                    {latestPayment.sender_name || '-'}
                                </p>
                                <p className="text-xs text-slate">
                                    Bank: {latestPayment.sender_bank || '-'}
                                </p>
                            </div>
                            <div className="p-3.5 rounded-xl bg-white border border-line">
                                <span className="text-xs text-slate font-medium">Tanggal Transfer</span>
                                <p className="font-bold text-navy mt-1">
                                    {latestPayment.paid_at || '-'}
                                </p>
                                <p className="text-xs text-slate">
                                    Jumlah: Rp {Number(latestPayment.amount).toLocaleString('id-ID')}
                                </p>
                            </div>
                            <div className="p-3.5 rounded-xl bg-white border border-line flex flex-col justify-between">
                                <span className="text-xs text-slate font-medium">Berkas Bukti Transfer</span>
                                {latestPayment.proof_url ? (
                                    <a
                                        href={latestPayment.proof_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-ocean hover:text-navy"
                                    >
                                        <ExternalLink className="w-3.5 h-3.5" />
                                        Lihat / Unduh Bukti Pembayaran
                                    </a>
                                ) : (
                                    <span className="text-xs text-slate italic mt-2">Tidak ada berkas</span>
                                )}
                            </div>
                        </div>
                    </Card>
                )}

                {/* 9 Steps Navigation Tabs */}
                <div className="flex overflow-x-auto gap-1 border-b border-line pb-2 scrollbar-none">
                    {stepSections.map((step) => {
                        const Icon = step.icon;
                        const isActive = activeTab === step.id;
                        return (
                            <button
                                key={step.id}
                                onClick={() => setActiveTab(step.id)}
                                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                                    isActive
                                        ? 'bg-navy text-white shadow-soft'
                                        : 'bg-white text-slate hover:text-navy hover:bg-mist/80 border border-line/60'
                                }`}
                            >
                                <span
                                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                        isActive ? 'bg-sky text-navy' : 'bg-slate-100 text-slate-700'
                                    }`}
                                >
                                    {step.id}
                                </span>
                                <span>{step.title}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Tab Contents: Step 1 to 9 */}
                <div className="space-y-6">
                    {/* LANGKAH 1: IDENTITAS */}
                    {activeTab === 1 && (
                        <Card className="p-6 border-line shadow-soft">
                            <div className="flex items-center justify-between pb-4 mb-4 border-b border-line">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-ocean/10 text-ocean flex items-center justify-center">
                                        <UserIcon className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h3 className="font-display text-base font-bold text-navy">
                                            Langkah 1: Identitas Calon Anggota
                                        </h3>
                                        <p className="text-xs text-slate">
                                            Kewarganegaraan, data kependudukan, dan kontak pemohon.
                                        </p>
                                    </div>
                                </div>
                                <span className="text-xs font-bold font-mono text-ocean bg-ocean/10 px-2 py-1 rounded">
                                    Langkah 1/9
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div className="p-3.5 rounded-xl bg-mist/40 border border-line/70">
                                    <span className="text-xs text-slate font-medium">Kewarganegaraan</span>
                                    <p className="font-bold text-navy mt-1 text-base uppercase">
                                        {identity?.nationality || 'WNI'}
                                    </p>
                                </div>
                                <div className="p-3.5 rounded-xl bg-mist/40 border border-line/70">
                                    <span className="text-xs text-slate font-medium">Nama Lengkap</span>
                                    <p className="font-bold text-navy mt-1 text-base">
                                        {identity?.full_name || member.name}
                                    </p>
                                </div>
                                <div className="p-3.5 rounded-xl bg-mist/40 border border-line/70">
                                    <span className="text-xs text-slate font-medium">Jenis Kelamin</span>
                                    <p className="font-semibold text-navy mt-1">
                                        {identity?.gender === 'female' ? 'Perempuan' : 'Laki-laki'}
                                    </p>
                                </div>
                                <div className="p-3.5 rounded-xl bg-mist/40 border border-line/70">
                                    <span className="text-xs text-slate font-medium">Tempat, Tanggal Lahir</span>
                                    <p className="font-semibold text-navy mt-1">
                                        {identity?.birth_place || '-'}, {identity?.birth_date || '-'}
                                    </p>
                                </div>
                                <div className="p-3.5 rounded-xl bg-mist/40 border border-line/70">
                                    <span className="text-xs text-slate font-medium">Nomor Telepon</span>
                                    <p className="font-semibold text-navy mt-1">{identity?.phone || member.phone || '-'}</p>
                                </div>
                                <div className="p-3.5 rounded-xl bg-mist/40 border border-line/70">
                                    <span className="text-xs text-slate font-medium">Alamat Email</span>
                                    <p className="font-semibold text-navy mt-1">{identity?.email || member.email}</p>
                                </div>

                                {identity?.nationality === 'wna' ? (
                                    <>
                                        <div className="p-3.5 rounded-xl bg-mist/40 border border-line/70">
                                            <span className="text-xs text-slate font-medium">Nomor Paspor</span>
                                            <p className="font-mono font-bold text-navy mt-1">{identity.passport_number || '-'}</p>
                                        </div>
                                        <div className="p-3.5 rounded-xl bg-mist/40 border border-line/70">
                                            <span className="text-xs text-slate font-medium">Negara Asal</span>
                                            <p className="font-semibold text-navy mt-1">{identity.origin_country || '-'}</p>
                                        </div>
                                        <div className="p-3.5 rounded-xl bg-mist/40 border border-line/70 md:col-span-2">
                                            <span className="text-xs text-slate font-medium">Lama Tinggal di Indonesia</span>
                                            <p className="font-semibold text-navy mt-1">{identity.years_in_indonesia ? `${identity.years_in_indonesia} Tahun` : '-'}</p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="p-3.5 rounded-xl bg-mist/40 border border-line/70">
                                            <span className="text-xs text-slate font-medium">Nomor Induk Kependudukan (NIK)</span>
                                            <p className="font-mono font-bold text-navy mt-1">{identity?.nik || member.profile?.nik || '-'}</p>
                                        </div>
                                        <div className="p-3.5 rounded-xl bg-mist/40 border border-line/70">
                                            <span className="text-xs text-slate font-medium">Domisili KTP</span>
                                            <p className="font-semibold text-navy mt-1">
                                                {typeof identity?.ktp_address === 'string' ? identity.ktp_address : identity?.ktp_address?.address || member.profile?.address || '-'}
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </Card>
                    )}

                    {/* LANGKAH 2: KATEGORI KEANGGOTAAN */}
                    {activeTab === 2 && (
                        <Card className="p-6 border-line shadow-soft">
                            <div className="flex items-center justify-between pb-4 mb-4 border-b border-line">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-ocean/10 text-ocean flex items-center justify-center">
                                        <Layers className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h3 className="font-display text-base font-bold text-navy">
                                            Langkah 2: Kategori & Tipe Keanggotaan
                                        </h3>
                                        <p className="text-xs text-slate">
                                            Kategori pelaku perikanan, institusi, dan jenis keanggotaan.
                                        </p>
                                    </div>
                                </div>
                                <span className="text-xs font-bold font-mono text-ocean bg-ocean/10 px-2 py-1 rounded">
                                    Langkah 2/9
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div className="p-3.5 rounded-xl bg-mist/40 border border-line/70">
                                    <span className="text-xs text-slate font-medium">Tipe Pendaftar</span>
                                    <p className="font-bold text-navy mt-1 text-base capitalize">
                                        {member.application?.applicant_type || 'Individu'}
                                    </p>
                                </div>
                                <div className="p-3.5 rounded-xl bg-mist/40 border border-line/70">
                                    <span className="text-xs text-slate font-medium">Kategori Keanggotaan</span>
                                    <p className="font-bold text-ocean mt-1 text-base capitalize">
                                        {member.application?.membership_category_custom || member.application?.membership_category || '-'}
                                    </p>
                                </div>
                                {member.application?.applicant_type === 'institution' && (
                                    <>
                                        <div className="p-3.5 rounded-xl bg-mist/40 border border-line/70">
                                            <span className="text-xs text-slate font-medium">Nama Institusi / Lembaga</span>
                                            <p className="font-bold text-navy mt-1">{member.application.institution_name || '-'}</p>
                                        </div>
                                        <div className="p-3.5 rounded-xl bg-mist/40 border border-line/70">
                                            <span className="text-xs text-slate font-medium">Jabatan Pemohon</span>
                                            <p className="font-semibold text-navy mt-1">{member.application.applicant_position || '-'}</p>
                                        </div>
                                    </>
                                )}
                                <div className="p-3.5 rounded-xl bg-mist/40 border border-line/70 md:col-span-2">
                                    <span className="text-xs text-slate font-medium">Tipe Keanggotaan NSA</span>
                                    <p className="font-bold text-navy mt-1">{member.application?.membership_type || 'Anggota Biasa'}</p>
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* LANGKAH 3: PROFIL USAHA & LEGALITAS */}
                    {activeTab === 3 && (
                        <Card className="p-6 border-line shadow-soft">
                            <div className="flex items-center justify-between pb-4 mb-4 border-b border-line">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-ocean/10 text-ocean flex items-center justify-center">
                                        <Building2 className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h3 className="font-display text-base font-bold text-navy">
                                            Langkah 3: Profil Usaha & Legalitas
                                        </h3>
                                        <p className="text-xs text-slate">
                                            Informasi unit usaha perikanan, skala usaha, dan dokumen perizinan.
                                        </p>
                                    </div>
                                </div>
                                <span className="text-xs font-bold font-mono text-ocean bg-ocean/10 px-2 py-1 rounded">
                                    Langkah 3/9
                                </span>
                            </div>

                            {business ? (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div className="p-3.5 rounded-xl bg-mist/40 border border-line/70">
                                            <span className="text-xs text-slate font-medium">Status Usaha</span>
                                            <p className="font-bold text-navy mt-1">
                                                {business.has_no_business ? 'Belum Memiliki Usaha' : 'Memiliki Usaha Aktif'}
                                            </p>
                                        </div>
                                        {business.has_no_business ? (
                                            <div className="p-3.5 rounded-xl bg-mist/40 border border-line/70">
                                                <span className="text-xs text-slate font-medium">Pekerjaan Utama</span>
                                                <p className="font-bold text-navy mt-1">{business.main_job || '-'}</p>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="p-3.5 rounded-xl bg-mist/40 border border-line/70">
                                                    <span className="text-xs text-slate font-medium">Nama Usaha / Merek</span>
                                                    <p className="font-bold text-navy mt-1 text-base">{business.name}</p>
                                                </div>
                                                <div className="p-3.5 rounded-xl bg-mist/40 border border-line/70">
                                                    <span className="text-xs text-slate font-medium">Bidang Kegiatan</span>
                                                    <p className="font-semibold text-navy mt-1">{business.activity_field || '-'}</p>
                                                </div>
                                                <div className="p-3.5 rounded-xl bg-mist/40 border border-line/70">
                                                    <span className="text-xs text-slate font-medium">Skala Usaha</span>
                                                    <p className="font-semibold text-navy mt-1 capitalize">{business.scale || '-'}</p>
                                                </div>
                                                <div className="p-3.5 rounded-xl bg-mist/40 border border-line/70">
                                                    <span className="text-xs text-slate font-medium">Lama Beroperasi</span>
                                                    <p className="font-semibold text-navy mt-1">
                                                        {business.years_operating ? `${business.years_operating} Tahun` : '-'}
                                                    </p>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {business.legal_documents && business.legal_documents.length > 0 && (
                                        <div className="p-4 rounded-xl border border-line bg-white">
                                            <h4 className="font-display text-xs font-bold uppercase tracking-wider text-navy mb-3">
                                                Dokumen Legalitas & Perizinan (NIB, NPWP, CBIB, dll.)
                                            </h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {business.legal_documents.map((doc, idx) => (
                                                    <div key={idx} className="p-3 rounded-lg bg-mist/40 border border-line">
                                                        <span className="text-xs font-bold text-navy uppercase block">
                                                            {doc.label || doc.type}
                                                        </span>
                                                        <p className="font-mono text-sm text-ocean font-semibold mt-0.5">
                                                            {doc.number}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-xs text-slate italic py-4">Data profil usaha belum diisi.</p>
                            )}
                        </Card>
                    )}

                    {/* LANGKAH 4: AKTIVITAS PERIKANAN */}
                    {activeTab === 4 && (
                        <Card className="p-6 border-line shadow-soft">
                            <div className="flex items-center justify-between pb-4 mb-4 border-b border-line">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-ocean/10 text-ocean flex items-center justify-center">
                                        <Fish className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h3 className="font-display text-base font-bold text-navy">
                                            Langkah 4: Data Aktivitas Perikanan
                                        </h3>
                                        <p className="text-xs text-slate">
                                            Sistem budidaya, jumlah wadah/kolam, kapasitas produksi, dan kebutuhan pakan/benih.
                                        </p>
                                    </div>
                                </div>
                                <span className="text-xs font-bold font-mono text-ocean bg-ocean/10 px-2 py-1 rounded">
                                    Langkah 4/9
                                </span>
                            </div>

                            {member.application?.fish_activities && member.application.fish_activities.length > 0 ? (
                                <div className="space-y-4">
                                    {member.application.fish_activities.map((act, idx) => (
                                        <div key={idx} className="p-4 rounded-xl border border-line bg-mist/20">
                                            <h4 className="font-display text-sm font-bold text-navy mb-3">
                                                Aktivitas #{idx + 1}
                                            </h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                                                {act.farming_system && (
                                                    <div>
                                                        <span className="text-xs text-slate font-medium">Sistem Budidaya:</span>
                                                        <p className="font-semibold text-navy mt-0.5">{act.farming_system}</p>
                                                    </div>
                                                )}
                                                {act.pond_count !== null && (
                                                    <div>
                                                        <span className="text-xs text-slate font-medium">Jumlah Kolam/Wadah:</span>
                                                        <p className="font-semibold text-navy mt-0.5">{act.pond_count} Unit</p>
                                                    </div>
                                                )}
                                                {act.production_amount !== null && (
                                                    <div>
                                                        <span className="text-xs text-slate font-medium">Hasil Produksi:</span>
                                                        <p className="font-semibold text-navy mt-0.5">
                                                            {act.production_amount} {act.production_unit} / {act.period}
                                                        </p>
                                                    </div>
                                                )}
                                                {act.seed_need !== null && (
                                                    <div>
                                                        <span className="text-xs text-slate font-medium">Kebutuhan Benih:</span>
                                                        <p className="font-semibold text-navy mt-0.5">{act.seed_need} Ekor/Siklus</p>
                                                    </div>
                                                )}
                                                {act.feed_need !== null && (
                                                    <div>
                                                        <span className="text-xs text-slate font-medium">Kebutuhan Pakan:</span>
                                                        <p className="font-semibold text-navy mt-0.5">{act.feed_need} Kg/Siklus</p>
                                                    </div>
                                                )}
                                                {act.purchase_capacity !== null && (
                                                    <div>
                                                        <span className="text-xs text-slate font-medium">Kapasitas Pembelian:</span>
                                                        <p className="font-semibold text-navy mt-0.5">{act.purchase_capacity} Ton/Bulan</p>
                                                    </div>
                                                )}
                                            </div>
                                            {act.notes && (
                                                <p className="text-xs text-slate mt-2 border-t border-line/50 pt-2">
                                                    Catatan: {act.notes}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-slate italic py-4">
                                    Langkah ini dilewati atau calon anggota tidak mengisi aktivitas perikanan teknis.
                                </p>
                            )}
                        </Card>
                    )}

                    {/* LANGKAH 5: JARINGAN BISNIS */}
                    {activeTab === 5 && (
                        <Card className="p-6 border-line shadow-soft">
                            <div className="flex items-center justify-between pb-4 mb-4 border-b border-line">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-ocean/10 text-ocean flex items-center justify-center">
                                        <Share2 className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h3 className="font-display text-base font-bold text-navy">
                                            Langkah 5: Jaringan Bisnis & Distribusi
                                        </h3>
                                        <p className="text-xs text-slate">
                                            Jangkauan pasar, saluran pemasaran, dan kemitraan.
                                        </p>
                                    </div>
                                </div>
                                <span className="text-xs font-bold font-mono text-ocean bg-ocean/10 px-2 py-1 rounded">
                                    Langkah 5/9
                                </span>
                            </div>

                            {member.application?.network_profile ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div className="p-3.5 rounded-xl bg-mist/40 border border-line/70">
                                        <span className="text-xs text-slate font-medium">Jangkauan Pasar</span>
                                        <p className="font-bold text-navy mt-1 capitalize">
                                            {member.application.network_profile.market_reach || '-'}
                                        </p>
                                    </div>
                                    <div className="p-3.5 rounded-xl bg-mist/40 border border-line/70">
                                        <span className="text-xs text-slate font-medium">Saluran Distribusi</span>
                                        <p className="font-semibold text-navy mt-1">
                                            {Array.isArray(member.application.network_profile.distribution_channels)
                                                ? member.application.network_profile.distribution_channels.join(', ')
                                                : '-'}
                                        </p>
                                    </div>
                                    <div className="p-3.5 rounded-xl bg-mist/40 border border-line/70 md:col-span-2">
                                        <span className="text-xs text-slate font-medium">Kemitraan yang Dibutuhkan / Dimiliki</span>
                                        <p className="font-medium text-navy mt-1 leading-relaxed">
                                            {member.application.network_profile.partnership_needs || '-'}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-xs text-slate italic py-4">Data jaringan bisnis belum diisi.</p>
                            )}
                        </Card>
                    )}

                    {/* LANGKAH 6: MINAT PROGRAM NSA */}
                    {activeTab === 6 && (
                        <Card className="p-6 border-line shadow-soft">
                            <div className="flex items-center justify-between pb-4 mb-4 border-b border-line">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-ocean/10 text-ocean flex items-center justify-center">
                                        <Compass className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h3 className="font-display text-base font-bold text-navy">
                                            Langkah 6: Minat Program NSA
                                        </h3>
                                        <p className="text-xs text-slate">
                                            Fokus program asosiasi yang diminati oleh calon anggota.
                                        </p>
                                    </div>
                                </div>
                                <span className="text-xs font-bold font-mono text-ocean bg-ocean/10 px-2 py-1 rounded">
                                    Langkah 6/9
                                </span>
                            </div>

                            {member.application?.program_interests && member.application.program_interests.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {member.application.program_interests.map((item, idx) => (
                                        <div key={idx} className="p-3.5 rounded-xl bg-mist/40 border border-line">
                                            <span className="text-xs font-bold text-ocean uppercase block">
                                                {item.category}
                                            </span>
                                            {item.note && (
                                                <p className="text-xs text-navy mt-1">{item.note}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-slate italic py-4">Calon anggota belum memilih minat program.</p>
                            )}
                        </Card>
                    )}

                    {/* LANGKAH 7: LOKASI, FOTO & DOKUMEN */}
                    {activeTab === 7 && (
                        <div className="space-y-6">
                            {/* Lokasi */}
                            <Card className="p-6 border-line shadow-soft">
                                <h3 className="font-display text-base font-bold text-navy mb-4 flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-ocean" />
                                    Lokasi Domisili & Kegiatan Usaha
                                </h3>
                                {member.application?.locations && member.application.locations.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                        {member.application.locations.map((loc, idx) => (
                                            <div key={idx} className="p-4 rounded-xl bg-mist/40 border border-line">
                                                <span className="text-xs font-bold uppercase tracking-wider text-ocean">
                                                    Lokasi {loc.kind === 'business' ? 'Usaha' : 'Kegiatan / Tambak'}
                                                </span>
                                                <p className="font-bold text-navy mt-1">
                                                    {loc.province || '-'}, {loc.regency || '-'}
                                                </p>
                                                <p className="text-xs text-slate mt-0.5">{loc.address || '-'}</p>
                                                {loc.latitude && loc.longitude && (
                                                    <p className="font-mono text-xs text-ocean mt-2">
                                                        Koordinat: {loc.latitude}, {loc.longitude}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-slate italic">Belum ada data koordinat lokasi tersimpan.</p>
                                )}
                            </Card>

                            {/* Foto-foto Fasilitas */}
                            {member.application?.photos && member.application.photos.length > 0 && (
                                <Card className="p-6 border-line shadow-soft">
                                    <h3 className="font-display text-base font-bold text-navy mb-4 flex items-center gap-2">
                                        <ImageIcon className="w-4 h-4 text-ocean" />
                                        Foto Usaha / Fasilitas
                                    </h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        {member.application.photos.map((photo) => (
                                            <div key={photo.id} className="rounded-xl overflow-hidden border border-line bg-mist/30">
                                                <img
                                                    src={photo.url}
                                                    alt={photo.caption || 'Foto Usaha'}
                                                    className="w-full h-32 object-cover"
                                                />
                                                {photo.caption && (
                                                    <p className="p-2 text-xs text-navy font-medium truncate">
                                                        {photo.caption}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            )}

                            {/* Dokumen Pendukung */}
                            <Card className="p-6 border-line shadow-soft">
                                <h3 className="font-display text-base font-bold text-navy mb-4 flex items-center gap-2">
                                    <FileCheck className="w-4 h-4 text-ocean" />
                                    Dokumen Pendukung (Signed URL Preview)
                                </h3>
                                {member.documents && member.documents.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {member.documents.map((doc) => (
                                            <div key={doc.id} className="p-4 rounded-xl border border-line bg-white flex items-center justify-between">
                                                <div>
                                                    <span className="text-xs font-bold uppercase tracking-wider text-ocean">
                                                        {doc.type.toUpperCase()}
                                                    </span>
                                                    <p className="font-semibold text-navy text-sm mt-0.5 truncate max-w-xs">
                                                        {doc.original_name}
                                                    </p>
                                                    <span className="text-xs text-slate font-mono">
                                                        {doc.file_size_formatted}
                                                    </span>
                                                </div>
                                                <a
                                                    href={doc.preview_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-mist hover:bg-ocean hover:text-white text-navy text-xs font-semibold transition"
                                                >
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                    Buka
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-slate italic">Belum ada dokumen yang diunggah.</p>
                                )}
                            </Card>
                        </div>
                    )}

                    {/* LANGKAH 8: PAKET & ADMINISTRASI */}
                    {activeTab === 8 && (
                        <Card className="p-6 border-line shadow-soft">
                            <div className="flex items-center justify-between pb-4 mb-4 border-b border-line">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-ocean/10 text-ocean flex items-center justify-center">
                                        <Receipt className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h3 className="font-display text-base font-bold text-navy">
                                            Langkah 8: Paket Keanggotaan & Administrasi
                                        </h3>
                                        <p className="text-xs text-slate">
                                            Tagihan iuran resmi, atribut seragam, dan rincian administrasi NSA.
                                        </p>
                                    </div>
                                </div>
                                <span className="text-xs font-bold font-mono text-ocean bg-ocean/10 px-2 py-1 rounded">
                                    Langkah 8/9
                                </span>
                            </div>

                            {latestInvoice ? (
                                <div className="space-y-6">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-mist/40 border border-line">
                                        <div>
                                            <span className="text-xs text-slate">Nomor Tagihan</span>
                                            <p className="font-mono font-bold text-navy text-base mt-0.5">
                                                #{latestInvoice.number}
                                            </p>
                                        </div>
                                        <div className="mt-2 sm:mt-0 text-left sm:text-right">
                                            <span className="text-xs text-slate">Status Tagihan</span>
                                            <div className="mt-0.5">
                                                <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                                                    latestInvoice.status === 'paid'
                                                        ? 'bg-emerald-100 text-emerald-800'
                                                        : latestInvoice.status === 'waiting_confirmation'
                                                        ? 'bg-purple-100 text-purple-800'
                                                        : 'bg-amber-100 text-amber-800'
                                                }`}>
                                                    {latestInvoice.status.toUpperCase()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Items Table */}
                                    <div className="overflow-x-auto rounded-xl border border-line">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-mist text-xs uppercase tracking-wider text-slate font-semibold">
                                                <tr>
                                                    <th className="px-4 py-3">Item Biaya</th>
                                                    <th className="px-4 py-3">Ukuran</th>
                                                    <th className="px-4 py-3">Jumlah</th>
                                                    <th className="px-4 py-3">Harga</th>
                                                    <th className="px-4 py-3 text-right">Subtotal</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-line">
                                                {latestInvoice.items.map((item) => (
                                                    <tr key={item.id} className="hover:bg-mist/30">
                                                        <td className="px-4 py-3 font-semibold text-navy">
                                                            {item.name}
                                                        </td>
                                                        <td className="px-4 py-3 text-slate">
                                                            {item.size || '-'}
                                                        </td>
                                                        <td className="px-4 py-3 text-navy font-mono">
                                                            {item.qty}
                                                        </td>
                                                        <td className="px-4 py-3 text-slate">
                                                            Rp {Number(item.amount).toLocaleString('id-ID')}
                                                        </td>
                                                        <td className="px-4 py-3 text-right font-bold text-navy">
                                                            Rp {Number(item.subtotal).toLocaleString('id-ID')}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot className="bg-mist/50 border-t border-line">
                                                <tr>
                                                    <td colSpan={4} className="px-4 py-3 font-bold text-navy text-right">
                                                        Total Administrasi:
                                                    </td>
                                                    <td className="px-4 py-3 font-display font-bold text-base text-ocean text-right">
                                                        Rp {Number(latestInvoice.total).toLocaleString('id-ID')}
                                                    </td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-xs text-slate italic py-4">Belum ada data tagihan dibuat.</p>
                            )}
                        </Card>
                    )}

                    {/* LANGKAH 9: PEMERIKSAAN & RIWAYAT LOG VERIFIKASI */}
                    {activeTab === 9 && (
                        <Card className="p-6 border-line shadow-soft">
                            <div className="flex items-center justify-between pb-4 mb-4 border-b border-line">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-ocean/10 text-ocean flex items-center justify-center">
                                        <History className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h3 className="font-display text-base font-bold text-navy">
                                            Langkah 9: Pemeriksaan & Riwayat Audit Keputusan
                                        </h3>
                                        <p className="text-xs text-slate">
                                            Rekam jejak tindakan admin, pengajuan revisi, dan perubahan status.
                                        </p>
                                    </div>
                                </div>
                                <span className="text-xs font-bold font-mono text-ocean bg-ocean/10 px-2 py-1 rounded">
                                    Langkah 9/9
                                </span>
                            </div>

                            {/* Status Saat Ini */}
                            <div className="p-4 rounded-xl border border-line bg-mist/40 flex items-center justify-between">
                                <div>
                                    <span className="text-xs text-slate font-medium">Status Saat Ini:</span>
                                    <div className="mt-1">
                                        <StatusBadge status={member.membership_status} />
                                    </div>
                                </div>
                                {member.application?.review_note && (
                                    <div className="text-right max-w-md">
                                        <span className="text-xs text-slate font-medium">Catatan Terakhir:</span>
                                        <p className="text-xs font-semibold text-navy mt-0.5">
                                            "{member.application.review_note}"
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Timeline Review Logs */}
                            <div className="mt-6">
                                <h4 className="font-display text-sm font-bold text-navy mb-4">
                                    Log Tindakan Verifikasi (member_review_logs)
                                </h4>

                                {member.review_logs && member.review_logs.length > 0 ? (
                                    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-line">
                                        {member.review_logs.map((log) => {
                                            const isApproved = log.action === 'approved';
                                            const isRevision = log.action === 'revision';
                                            const isRejected = log.action === 'rejected';

                                            return (
                                                <div key={log.id} className="relative">
                                                    <div
                                                        className={`absolute -left-6 top-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold shadow-soft ${
                                                            isApproved
                                                                ? 'bg-success text-white'
                                                                : isRevision
                                                                ? 'bg-warning text-white'
                                                                : isRejected
                                                                ? 'bg-danger text-white'
                                                                : 'bg-navy text-white'
                                                        }`}
                                                    >
                                                        {isApproved ? '✓' : isRevision ? '↻' : isRejected ? '✕' : '•'}
                                                    </div>

                                                    <div className="p-4 rounded-xl border border-line bg-white shadow-soft">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <span className="text-xs font-bold uppercase tracking-wider text-navy">
                                                                {log.action === 'approved'
                                                                    ? 'Disetujui'
                                                                    : log.action === 'revision'
                                                                    ? 'Diminta Revisi'
                                                                    : log.action === 'rejected'
                                                                    ? 'Ditolak'
                                                                    : log.action}
                                                            </span>
                                                            <span className="text-[11px] text-slate font-mono">
                                                                {log.created_at}
                                                            </span>
                                                        </div>

                                                        <p className="text-xs text-ink mt-2 leading-relaxed">
                                                            {log.note || '-'}
                                                        </p>

                                                        <div className="mt-2 pt-2 border-t border-line/50 text-[11px] text-slate">
                                                            Oleh: <span className="font-semibold text-navy">{log.admin_name}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-xs text-slate italic py-4">
                                        Belum ada log keputusan verifikasi yang tercatat.
                                    </p>
                                )}
                            </div>
                        </Card>
                    )}
                </div>

                {/* MODAL: LOLOSKAN VERIFIKASI AWAL */}
                <Modal
                    open={passInitialModalOpen}
                    onClose={() => setPassInitialModalOpen(false)}
                    title="Loloskan Verifikasi Awal"
                >
                    <form onSubmit={handlePassInitial} className="space-y-4">
                        <div className="rounded-xl bg-ocean/10 border border-ocean/30 p-4 text-xs leading-relaxed text-navy">
                            <p className="font-bold flex items-center gap-1.5 text-navy mb-1">
                                <CheckCircle2 className="w-4 h-4 text-ocean" />
                                Verifikasi Awal Berkas Memenuhi Syarat
                            </p>
                            Status pendaftar akan diubah menjadi{' '}
                            <strong>Menunggu Pembayaran (Awaiting Payment)</strong>. Tagihan administrasi
                            akan diterbitkan dan email instruksi pembayaran akan otomatis dikirimkan ke{' '}
                            <strong>{member.email}</strong>.
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate mb-1">
                                Catatan Verifikator (Opsional)
                            </label>
                            <Textarea
                                placeholder="Tuliskan catatan verifikasi bila ada..."
                                value={passInitialNote}
                                onChange={(e) => setPassInitialNote(e.target.value)}
                                rows={3}
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setPassInitialModalOpen(false)}
                                disabled={isSubmitting}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={isSubmitting}
                                className="!bg-ocean hover:!bg-navy font-display text-white"
                            >
                                {isSubmitting ? 'Memproses...' : 'Loloskan & Terbitkan Tagihan'}
                            </Button>
                        </div>
                    </form>
                </Modal>

                {/* MODAL: SETUJUI & KONFIRMASI PEMBAYARAN */}
                <Modal
                    open={approveModalOpen}
                    onClose={() => setApproveModalOpen(false)}
                    title="Konfirmasi Pembayaran & Setujui Anggota"
                >
                    <form onSubmit={handleApprove} className="space-y-4">
                        <div className="rounded-xl bg-success/10 border border-success/30 p-4 text-emerald-950 text-xs leading-relaxed">
                            <p className="font-bold flex items-center gap-1.5 text-emerald-900 mb-1">
                                <CheckCircle2 className="w-4 h-4 text-success" />
                                Penerbitan Nomor Anggota Resmi (NTA)
                            </p>
                            Sistem akan secara otomatis menerbitkan Nomor Tanda Anggota unik dengan format{' '}
                            <strong className="font-mono text-emerald-900">NSA-YYYY-00001</strong>, menandai status invoice menjadi <strong>PAID</strong>, memperbarui status menjadi <strong>Disetujui (Approved)</strong>, dan mengirimkan email konfirmasi ke <strong>{member.email}</strong>.
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate mb-1">
                                Catatan Persetujuan (Opsional)
                            </label>
                            <Textarea
                                placeholder="Tuliskan ucapan selamat datang atau catatan resmi..."
                                value={approveNote}
                                onChange={(e) => setApproveNote(e.target.value)}
                                rows={3}
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setApproveModalOpen(false)}
                                disabled={isSubmitting}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={isSubmitting}
                                className="!bg-success hover:!bg-emerald-700 font-display text-white"
                            >
                                {isSubmitting ? 'Memproses...' : 'Konfirmasi & Setujui Anggota'}
                            </Button>
                        </div>
                    </form>
                </Modal>

                {/* MODAL: TOLAK BUKTI BAYAR */}
                <Modal
                    open={rejectPaymentModalOpen}
                    onClose={() => setRejectPaymentModalOpen(false)}
                    title="Tolak Bukti Pembayaran"
                >
                    <form onSubmit={handleRejectPayment} className="space-y-4">
                        <div className="rounded-xl bg-danger/10 border border-danger/30 p-4 text-rose-950 text-xs leading-relaxed">
                            <p className="font-bold flex items-center gap-1.5 text-rose-900 mb-1">
                                <AlertCircle className="w-4 h-4 text-danger" />
                                Penolakan Bukti Pembayaran
                            </p>
                            Status pendaftar akan dikembalikan ke <strong>Menunggu Pembayaran (Awaiting Payment)</strong>.
                            Pemohon akan menerima email pemberitahuan beserta alasan penolakan dan dapat mengunggah ulang bukti transfer baru di portal.
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1">
                                Alasan Penolakan Bukti Bayar (Wajib Diisi):
                            </label>
                            <Textarea
                                placeholder="Contoh: Bukti transfer buram/tidak terbaca nominalnya, atau nominal transfer kurang dari total tagihan..."
                                value={rejectPaymentReason}
                                onChange={(e) => setRejectPaymentReason(e.target.value)}
                                rows={3}
                                required
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setRejectPaymentModalOpen(false)}
                                disabled={isSubmitting}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                variant="danger"
                                disabled={isSubmitting}
                                className="font-display"
                            >
                                {isSubmitting ? 'Memproses...' : 'Tolak Bukti Bayar'}
                            </Button>
                        </div>
                    </form>
                </Modal>

                {/* MODAL: MINTA REVISI */}
                <Modal
                    open={revisionModalOpen}
                    onClose={() => setRevisionModalOpen(false)}
                    title="Minta Perbaikan / Revisi Berkas"
                >
                    <form onSubmit={handleRevision} className="space-y-4">
                        <p className="text-xs text-slate">
                            Tandai langkah yang perlu diperbaiki oleh pemohon, serta berikan instruksi perbaikan yang jelas:
                        </p>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-2">
                                Bagian yang Perlu Direvisi:
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                {[
                                    'Langkah 1: Identitas Calon Anggota',
                                    'Langkah 2: Kategori & Tipe Keanggotaan',
                                    'Langkah 3: Profil Usaha & Legalitas',
                                    'Langkah 4: Aktivitas Perikanan',
                                    'Langkah 5: Jaringan Bisnis & Distribusi',
                                    'Langkah 6: Minat Program NSA',
                                    'Langkah 7: Lokasi, Foto & Dokumen',
                                    'Langkah 8: Paket Keanggotaan & Administrasi',
                                ].map((sec) => (
                                    <label
                                        key={sec}
                                        className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition ${
                                            revisionSelectedSections.includes(sec)
                                                ? 'bg-warning/10 border-warning/30 text-amber-950 font-semibold'
                                                : 'bg-white border-line text-slate hover:bg-mist'
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            className="rounded border-line text-warning focus:ring-amber-500"
                                            checked={revisionSelectedSections.includes(sec)}
                                            onChange={() => toggleRevisionSection(sec)}
                                        />
                                        <span>{sec}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1">
                                Catatan Instruksi Perbaikan:
                            </label>
                            <Textarea
                                placeholder="Jelaskan secara rinci data atau dokumen yang harus diperbaiki..."
                                value={revisionNote}
                                onChange={(e) => setRevisionNote(e.target.value)}
                                rows={4}
                                required
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setRevisionModalOpen(false)}
                                disabled={isSubmitting}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={isSubmitting}
                                className="!bg-warning hover:!bg-amber-700 text-white font-display"
                            >
                                {isSubmitting ? 'Mengirim...' : 'Kirim Permintaan Revisi'}
                            </Button>
                        </div>
                    </form>
                </Modal>

                {/* MODAL: TOLAK PENDAFTARAN */}
                <Modal
                    open={rejectModalOpen}
                    onClose={() => setRejectModalOpen(false)}
                    title="Tolak Pendaftaran Calon Anggota"
                >
                    <form onSubmit={handleReject} className="space-y-4">
                        <div className="rounded-xl bg-danger/10 border border-danger/30 p-4 text-red-950 text-xs leading-relaxed">
                            <p className="font-bold flex items-center gap-1.5 text-red-900 mb-1">
                                <AlertCircle className="w-4 h-4 text-danger" />
                                Penolakan Pendaftaran Bersifat Definitif
                            </p>
                            Alasan penolakan wajib dicantumkan minimal 5 karakter dan akan dikirimkan langsung melalui email resmi ke <strong>{member.email}</strong>.
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1">
                                Alasan Penolakan (Wajib Diisi):
                            </label>
                            <Textarea
                                placeholder="Jelaskan alasan penolakan berkas pendaftaran..."
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                rows={4}
                                required
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setRejectModalOpen(false)}
                                disabled={isSubmitting}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                variant="danger"
                                disabled={isSubmitting}
                                className="font-display"
                            >
                                {isSubmitting ? 'Memproses...' : 'Konfirmasi Penolakan'}
                            </Button>
                        </div>
                    </form>
                </Modal>
            </div>
        </AdminLayout>
    );
}
