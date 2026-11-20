import React, { useState, useEffect, useRef } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import Button from '@/Components/ui/Button';
import { toast } from 'sonner';
import { animate } from 'animejs';
import { 
    Clock, 
    CheckCircle2, 
    AlertCircle, 
    XCircle, 
    ShieldCheck, 
    ArrowRight, 
    Mail, 
    PhoneCall, 
    QrCode,
    FileEdit,
    FileText,
    CreditCard,
    UploadCloud,
    Loader2,
    Calendar,
    Building2,
    Receipt,
    Copy,
    Check,
    Eye,
    ExternalLink
} from 'lucide-react';

interface ReviewLogItem {
    id: number;
    action: string;
    note: string;
    admin_name: string;
    created_at: string;
}

interface InvoiceItem {
    id: number;
    name: string;
    amount: number;
    qty: number;
    size?: string | null;
    subtotal: number;
}

interface InvoiceData {
    id: number;
    number: string;
    status: string;
    total: number;
    due_at?: string | null;
    items: InvoiceItem[];
}

interface PaymentData {
    id: number;
    amount: number;
    status: string;
    proof_url?: string | null;
    sender_name?: string | null;
    sender_bank?: string | null;
    paid_at?: string | null;
    notes?: string | null;
}

interface StatusProps {
    statusData: {
        status: string;
        status_label: string;
        member_number?: string | null;
        is_submitted?: boolean;
        completed_steps_count?: number;
        total_steps?: number;
        review_note?: string | null;
        invoice?: InvoiceData | null;
        payment?: PaymentData | null;
        bank_info?: {
            bank_name: string;
            bank_account_number: string;
            bank_account_holder: string;
        };
        user: {
            name: string;
            email: string;
            phone?: string | null;
        };
        business_name?: string | null;
        regency_name?: string | null;
        province_name?: string | null;
        review_logs: ReviewLogItem[];
    };
}

export default function Status({ statusData }: StatusProps) {
    const {
        status,
        status_label,
        member_number,
        is_submitted,
        completed_steps_count,
        total_steps,
        review_note,
        invoice,
        payment,
        bank_info,
        user,
        business_name,
        regency_name,
        province_name,
        review_logs,
    } = statusData;

    const { flash } = usePage().props as any;

    const isPendingReview = status === 'pending_review' || status === 'pending';
    const isAwaitingPayment = status === 'awaiting_payment';
    const isPendingApproval = status === 'pending_approval';
    const isApproved = status === 'approved';
    const isRevision = status === 'revision';
    const isRejected = status === 'rejected';
    const isDraft = status === 'draft';
    const isNonMember = status === 'non_member';

    // Form unggah bukti bayar state
    const [proofFile, setProofFile] = useState<File | null>(null);
    const [senderName, setSenderName] = useState(user.name || '');
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
    const [senderBank, setSenderBank] = useState('');
    const [paymentNotes, setPaymentNotes] = useState('');
    const [isUploadingProof, setIsUploadingProof] = useState(false);
    const [copiedAccount, setCopiedAccount] = useState(false);

    const checkmarkSvgRef = useRef<SVGSVGElement | null>(null);

    // Animasi sukses halus anime.js: garis centang tergambar
    useEffect(() => {
        if (checkmarkSvgRef.current) {
            const circlePath = checkmarkSvgRef.current.querySelector('.check-circle') as SVGPathElement;
            const checkPath = checkmarkSvgRef.current.querySelector('.check-path') as SVGPathElement;

            if (circlePath && checkPath) {
                const circleLength = circlePath.getTotalLength();
                const checkLength = checkPath.getTotalLength();

                circlePath.style.strokeDasharray = `${circleLength}`;
                circlePath.style.strokeDashoffset = `${circleLength}`;
                checkPath.style.strokeDasharray = `${checkLength}`;
                checkPath.style.strokeDashoffset = `${checkLength}`;

                try {
                    animate(circlePath, {
                        strokeDashoffset: [circleLength, 0],
                        duration: 800,
                        ease: 'outQuart',
                    });

                    animate(checkPath, {
                        strokeDashoffset: [checkLength, 0],
                        duration: 600,
                        delay: 400,
                        ease: 'outQuart',
                    });
                } catch {
                    circlePath.style.strokeDashoffset = '0';
                    checkPath.style.strokeDashoffset = '0';
                }
            }
        }
    }, [isPendingReview, isApproved]);

    // Toast Sonner saat ada pesan flash sukses
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        } else if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    const formatCurrency = (val: number): string => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(val);
    };

    const handleCopyAccount = () => {
        if (bank_info?.bank_account_number) {
            navigator.clipboard.writeText(bank_info.bank_account_number.replace(/\D/g, ''));
            setCopiedAccount(true);
            toast.success('Nomor rekening berhasil disalin!');
            setTimeout(() => setCopiedAccount(false), 2000);
        }
    };

    const handleProofSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!proofFile) {
            toast.error('Harap pilih berkas bukti transfer terlebih dahulu.');
            return;
        }

        if (!senderName.trim()) {
            toast.error('Nama pemilik rekening pengirim wajib diisi.');
            return;
        }

        const formData = new FormData();
        formData.append('proof', proofFile);
        formData.append('sender_name', senderName);
        formData.append('payment_date', paymentDate);
        if (senderBank) formData.append('sender_bank', senderBank);
        if (paymentNotes) formData.append('notes', paymentNotes);

        setIsUploadingProof(true);

        router.post('/akun/keanggotaan/bukti-bayar', formData, {
            onSuccess: () => {
                toast.success('Bukti pembayaran berhasil diunggah.');
                setProofFile(null);
            },
            onError: (errs) => {
                const msg = Object.values(errs)[0] || 'Gagal mengunggah bukti pembayaran.';
                toast.error(String(msg));
            },
            onFinish: () => setIsUploadingProof(false),
        });
    };

    // 5 Tahap Garis Waktu
    const timelineStages = [
        {
            id: 1,
            title: '1. Pendaftaran Diajukan',
            desc: 'Formulir 9 langkah dan berkas persyaratan telah dikirim.',
            status: isDraft ? 'progress' : (is_submitted || !isNonMember ? 'completed' : 'waiting'),
        },
        {
            id: 2,
            title: '2. Verifikasi Awal',
            desc: 'Penelaahan identitas, perizinan, dan aktivitas perikanan.',
            status: isPendingReview
                ? 'current'
                : isRevision
                ? 'revision'
                : (isAwaitingPayment || isPendingApproval || isApproved ? 'completed' : 'waiting'),
        },
        {
            id: 3,
            title: '3. Pembayaran Administrasi',
            desc: 'Penyelesaian tagihan pendaftaran dan iuran tahunan NSA.',
            status: isAwaitingPayment
                ? 'current'
                : (isPendingApproval || isApproved ? 'completed' : 'waiting'),
        },
        {
            id: 4,
            title: '4. Persetujuan Akhir',
            desc: 'Konfirmasi bukti transfer dan penerbitan nomor keanggotaan.',
            status: isPendingApproval
                ? 'current'
                : isApproved
                ? 'completed'
                : 'waiting',
        },
        {
            id: 5,
            title: '5. Anggota Resmi NSA',
            desc: 'Keanggotaan aktif dan hak penuh fasilitas asosiasi.',
            status: isApproved ? 'completed' : (isRejected ? 'rejected' : 'waiting'),
        },
    ];

    return (
        <PublicLayout>
            <Head title="Status Pengajuan Keanggotaan - NSA" />

            <div className="bg-background min-h-screen py-10 md:py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                    
                    {/* Header */}
                    <div className="text-center">
                        <span className="text-xs font-bold uppercase tracking-widest text-primary font-mono">
                            PORTAL KEANGGOTAAN NSA
                        </span>
                        <h1 className="text-2xl md:text-3xl font-extrabold text-foreground mt-1">
                            Status Pengajuan Keanggotaan
                        </h1>
                        <p className="text-xs md:text-sm text-muted-foreground mt-1 max-w-xl mx-auto">
                            Pantau tahapan verifikasi berkas, penyelesaian administrasi, dan penerbitan nomor anggota resmi asosiasi NSA.
                        </p>
                    </div>

                    {/* Banner Status Utama */}
                    <div className="bg-card rounded-2xl border border-border/80 p-6 md:p-8 shadow-xs">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border">
                            <div className="flex items-start gap-4">
                                {isPendingReview || isApproved ? (
                                    <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20 shadow-xs">
                                        <svg
                                            ref={checkmarkSvgRef}
                                            viewBox="0 0 52 52"
                                            className="w-10 h-10 text-primary"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <circle
                                                className="check-circle"
                                                cx="26"
                                                cy="26"
                                                r="24"
                                                stroke="currentColor"
                                                strokeWidth="3.5"
                                                strokeLinecap="round"
                                            />
                                            <path
                                                className="check-path"
                                                d="M14 27L22 35L38 19"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    </div>
                                ) : (
                                    <div
                                        className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 border shadow-xs ${
                                            isAwaitingPayment
                                                ? 'bg-primary/10 text-primary border-primary/30'
                                                : isPendingApproval
                                                ? 'bg-accent/20 text-accent-foreground border-accent'
                                                : isRevision
                                                ? 'bg-warning/10 text-warning border-warning/30'
                                                : isRejected
                                                ? 'bg-destructive/10 text-destructive border-destructive/30'
                                                : 'bg-muted text-muted-foreground border-border'
                                        }`}
                                    >
                                        {isAwaitingPayment && <CreditCard className="w-8 h-8" />}
                                        {isPendingApproval && <Clock className="w-8 h-8 text-primary animate-pulse" />}
                                        {isRevision && <AlertCircle className="w-8 h-8" />}
                                        {isRejected && <XCircle className="w-8 h-8" />}
                                        {isDraft && <FileEdit className="w-8 h-8 text-primary" />}
                                        {isNonMember && <Clock className="w-8 h-8 text-muted-foreground" />}
                                    </div>
                                )}

                                <div>
                                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                        Status Keanggotaan Saat Ini
                                    </span>
                                    <h2 className="text-xl font-bold text-foreground">
                                        {status_label || status}
                                    </h2>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Calon Anggota: <span className="font-semibold text-foreground">{user.name}</span>
                                        {business_name && <span> &bull; {business_name}</span>}
                                        {province_name && <span> ({regency_name ? `${regency_name}, ` : ''}{province_name})</span>}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                {isApproved && (
                                    <Link href="/anggota">
                                        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold flex items-center gap-2">
                                            Buka Dashboard Anggota <ArrowRight className="w-4 h-4" />
                                        </Button>
                                    </Link>
                                )}

                                {isRevision && (
                                    <Link href="/akun/keanggotaan/daftar">
                                        <Button className="bg-warning hover:bg-amber-700 text-white flex items-center gap-2">
                                            Perbaiki Data Sekarang <ArrowRight className="w-4 h-4" />
                                        </Button>
                                    </Link>
                                )}

                                {isDraft && (
                                    <Link href="/akun/keanggotaan/daftar">
                                        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2">
                                            Lanjutkan Formulir <ArrowRight className="w-4 h-4" />
                                        </Button>
                                    </Link>
                                )}

                                {isNonMember && (
                                    <Link href="/akun/keanggotaan/daftar">
                                        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2">
                                            Mulai Pendaftaran <ArrowRight className="w-4 h-4" />
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </div>

                        {/* Catatan Revisi Khusus jika Status Revision */}
                        {isRevision && (
                            <div className="mt-6 p-4 rounded-xl bg-warning/10 border border-warning/30">
                                <h4 className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5 uppercase tracking-wide">
                                    <AlertCircle className="w-4 h-4 text-warning" /> Catatan Perbaikan dari Tim Verifikator NSA:
                                </h4>
                                <p className="text-sm text-amber-900 dark:text-amber-200 mt-1 font-medium leading-relaxed">
                                    "{review_note || 'Mohon periksa kembali data atau berkas dokumen yang ditandai.'}"
                                </p>
                                <div className="mt-3">
                                    <Link
                                        href="/akun/keanggotaan/daftar"
                                        className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-300 hover:underline"
                                    >
                                        Buka Formulir Pendaftaran dan Simpan Perbaikan &rarr;
                                    </Link>
                                </div>
                            </div>
                        )}

                        {/* Alasan Penolakan jika Status Rejected */}
                        {isRejected && (
                            <div className="mt-6 p-4 rounded-xl bg-destructive/10 border border-destructive/30">
                                <h4 className="text-xs font-bold text-destructive flex items-center gap-1.5 uppercase tracking-wide">
                                    <XCircle className="w-4 h-4 text-destructive" /> Alasan Penolakan Pengajuan:
                                </h4>
                                <p className="text-sm text-destructive mt-1 font-medium leading-relaxed">
                                    "{review_note || 'Pengajuan keanggotaan belum dapat disetujui sesuai keputusan AD/ART asosiasi.'}"
                                </p>
                            </div>
                        )}

                        {/* 5 TAHAP GARIS WAKTU */}
                        <div className="mt-8">
                            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">
                                Garis Waktu Alur Keanggotaan (5 Tahap)
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                                {timelineStages.map((stage) => {
                                    const isCurrent = stage.status === 'current';
                                    const isDone = stage.status === 'completed';
                                    const isRev = stage.status === 'revision';
                                    const isRej = stage.status === 'rejected';

                                    return (
                                        <div
                                            key={stage.id}
                                            className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                                                isCurrent
                                                    ? 'border-primary bg-primary/5 shadow-xs ring-2 ring-primary/20'
                                                    : isDone
                                                    ? 'border-emerald-500/30 bg-emerald-500/5'
                                                    : isRev
                                                    ? 'border-warning/40 bg-warning/5'
                                                    : isRej
                                                    ? 'border-destructive/40 bg-destructive/5'
                                                    : 'border-border/60 bg-muted/20 opacity-70'
                                            }`}
                                        >
                                            <div>
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <h4 className={`font-bold text-xs ${isCurrent ? 'text-primary' : 'text-foreground'}`}>
                                                        {stage.title}
                                                    </h4>
                                                    {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                                                    {isCurrent && <Clock className="w-3.5 h-3.5 text-primary shrink-0 animate-spin" />}
                                                    {isRev && <AlertCircle className="w-3.5 h-3.5 text-warning shrink-0" />}
                                                </div>
                                                <p className="text-[11px] text-muted-foreground leading-relaxed">
                                                    {stage.desc}
                                                </p>
                                            </div>

                                            <div className="mt-3 pt-2 border-t border-border/50">
                                                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                                    isDone
                                                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                                                        : isCurrent
                                                        ? 'bg-primary/10 text-primary'
                                                        : isRev
                                                        ? 'bg-warning/10 text-warning'
                                                        : isRej
                                                        ? 'bg-destructive/10 text-destructive'
                                                        : 'bg-muted text-muted-foreground'
                                                }`}>
                                                    {isDone
                                                        ? 'Selesai'
                                                        : isCurrent
                                                        ? 'Sedang Berjalan'
                                                        : isRev
                                                        ? 'Perbaikan'
                                                        : isRej
                                                        ? 'Ditolak'
                                                        : 'Menunggu'}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* SAAT AWAITING_PAYMENT: RINCIAN TAGIHAN & FORM UNGGAH BUKTI BAYAR */}
                    {isAwaitingPayment && invoice && (
                        <div className="space-y-6">
                            {/* Kartu Rincian Tagihan & Rekening Pembayaran */}
                            <div className="bg-card rounded-2xl border border-primary/20 p-6 md:p-8 shadow-xs space-y-6">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                            <Receipt className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground font-mono">
                                                INVOICE RESMI NSA
                                            </span>
                                            <h3 className="font-bold text-foreground text-base md:text-lg">
                                                Tagihan Administrasi Keanggotaan #{invoice.number}
                                            </h3>
                                        </div>
                                    </div>

                                    {invoice.due_at && (
                                        <div className="text-left sm:text-right">
                                            <span className="text-xs text-muted-foreground block">Batas Waktu Pembayaran:</span>
                                            <span className="text-xs font-semibold text-destructive flex items-center gap-1 sm:justify-end">
                                                <Calendar className="w-3.5 h-3.5" /> {invoice.due_at}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Tabel Rincian Biaya */}
                                <div className="space-y-2.5">
                                    <div className="divide-y divide-border/60">
                                        {invoice.items.map((item) => (
                                            <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                                                <div className="space-y-0.5">
                                                    <span className="font-semibold text-foreground">
                                                        {item.name} {item.size ? `(${item.size})` : ''}
                                                    </span>
                                                    <span className="text-muted-foreground block">
                                                        {item.qty} x {formatCurrency(item.amount)}
                                                    </span>
                                                </div>
                                                <span className="font-mono font-bold text-foreground">
                                                    {formatCurrency(item.subtotal)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="pt-3 border-t-2 border-border flex items-center justify-between">
                                        <span className="text-sm font-bold text-foreground uppercase tracking-wide">
                                            Total Tagihan
                                        </span>
                                        <span className="text-xl md:text-2xl font-extrabold text-primary font-mono tabular-nums">
                                            {formatCurrency(invoice.total)}
                                        </span>
                                    </div>
                                </div>

                                {/* Rekening Tujuan Transfer */}
                                <div className="p-4 md:p-5 rounded-xl bg-primary/5 border border-primary/20 space-y-3">
                                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                                        <Building2 className="w-4 h-4 text-primary" />
                                        Rekening Resmi Tujuan Pembayaran
                                    </h4>
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div>
                                            <div className="text-xs text-muted-foreground">{bank_info?.bank_name || 'Bank Mandiri'}</div>
                                            <div className="font-mono text-xl md:text-2xl font-black text-foreground tracking-wider flex items-center gap-2">
                                                {bank_info?.bank_account_number || '123-00-9876543-2'}
                                                <button
                                                    type="button"
                                                    onClick={handleCopyAccount}
                                                    className="p-1 rounded-md text-muted-foreground hover:text-primary transition"
                                                    title="Salin Nomor Rekening"
                                                >
                                                    {copiedAccount ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                                                </button>
                                            </div>
                                            <div className="text-xs font-medium text-muted-foreground mt-0.5">
                                                Atas Nama: <strong className="text-foreground">{bank_info?.bank_account_holder || 'Perkumpulan NSA Indonesia'}</strong>
                                            </div>
                                        </div>

                                        <div className="text-xs text-muted-foreground sm:max-w-xs leading-relaxed bg-card p-3 rounded-lg border border-border/80">
                                            Harap transfer sesuai dengan nominal total di atas. Cantumkan nomor invoice <strong>{invoice.number}</strong> pada berita transfer.
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Form Unggah Bukti Transfer */}
                            <form
                                onSubmit={handleProofSubmit}
                                className="bg-card rounded-2xl border border-border/80 p-6 md:p-8 shadow-xs space-y-5"
                            >
                                <div className="flex items-center gap-3 pb-3 border-b border-border">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                        <UploadCloud className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-foreground text-base">
                                            Unggah Bukti Transfer Pembayaran
                                        </h3>
                                        <p className="text-xs text-muted-foreground">
                                            Kirimkan foto atau berkas PDF struk transfer bank Anda untuk diverifikasi oleh bendahara NSA.
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-semibold text-foreground">
                                            Nama Pemilik Rekening / Pengirim <span className="text-destructive">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={senderName}
                                            onChange={(e) => setSenderName(e.target.value)}
                                            placeholder="Nama lengkap sesuai buku tabungan"
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-semibold text-foreground">
                                            Tanggal Transfer <span className="text-destructive">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            required
                                            value={paymentDate}
                                            onChange={(e) => setPaymentDate(e.target.value)}
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-semibold text-foreground">
                                            Bank Asal Pengirim <span className="text-muted-foreground font-normal">(Opsional)</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={senderBank}
                                            onChange={(e) => setSenderBank(e.target.value)}
                                            placeholder="Misal: BCA, BRI, Mandiri, BNI, dll"
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-semibold text-foreground">
                                            Catatan Tambahan <span className="text-muted-foreground font-normal">(Opsional)</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={paymentNotes}
                                            onChange={(e) => setPaymentNotes(e.target.value)}
                                            placeholder="Nomor referensi atau catatan struk"
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5 pt-2">
                                    <label className="block text-xs font-semibold text-foreground">
                                        Berkas Bukti Transfer (JPG, PNG, atau PDF, maks 3 MB) <span className="text-destructive">*</span>
                                    </label>
                                    <input
                                        type="file"
                                        required
                                        accept="image/jpeg,image/png,image/webp,application/pdf"
                                        onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                                        className="w-full px-3 py-2 border border-input rounded-xl text-xs text-muted-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 transition"
                                    />
                                </div>

                                <div className="pt-3 border-t border-border flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={isUploadingProof || !proofFile}
                                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 disabled:opacity-50 transition"
                                    >
                                        {isUploadingProof ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                <span>Mengunggah Bukti...</span>
                                            </>
                                        ) : (
                                            <>
                                                <CreditCard className="w-4 h-4" />
                                                <span>Kirim Bukti Pembayaran</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* SAAT PENDING_APPROVAL: INFORMASI BUKTI BAYAR SEDANG DIVERIFIKASI */}
                    {isPendingApproval && (
                        <div className="bg-card rounded-2xl border border-border/80 p-6 md:p-8 shadow-xs space-y-4">
                            <div className="flex items-start gap-3">
                                <Clock className="w-5 h-5 text-primary shrink-0 mt-0.5 animate-spin" />
                                <div className="space-y-1 flex-1">
                                    <h4 className="font-semibold text-foreground text-base">
                                        Bukti Pembayaran Sedang Diverifikasi oleh Pengurus NSA
                                    </h4>
                                    <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                                        Terima kasih. Anda telah mengunggah bukti pembayaran tagihan administrasi. Pengurus NSA sedang memeriksa kesesuaian mutasi rekening Anda. Penerbitan Nomor Anggota resmi akan dilakukan segera setelah konfirmasi selesai.
                                    </p>
                                </div>
                            </div>

                            {payment && (
                                <div className="p-4 rounded-xl bg-muted/30 border border-border/60 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                                    <div>
                                        <span className="text-muted-foreground block">Nama Pengirim:</span>
                                        <span className="font-semibold text-foreground">{payment.sender_name || user.name}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground block">Tanggal Bayar:</span>
                                        <span className="font-semibold text-foreground">{payment.paid_at || '-'}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground block">Berkas Bukti:</span>
                                        {payment.proof_url ? (
                                            <a
                                                href={payment.proof_url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                                            >
                                                <Eye className="w-3.5 h-3.5" /> Lihat Bukti Transfer
                                            </a>
                                        ) : (
                                            <span className="font-semibold text-foreground">Tersimpan</span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Jika status APPROVED: Nomor Anggota + Kartu Tanda Anggota (KTA) Digital */}
                    {isApproved && (
                        <div className="bg-card rounded-2xl border border-border/80 p-6 md:p-8 shadow-xs space-y-4">
                            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-emerald-600" /> Kartu Tanda Anggota (KTA) Digital NSA
                            </h3>

                            <div className="max-w-md mx-auto bg-primary text-primary-foreground rounded-2xl p-6 shadow-xl relative overflow-hidden border border-primary/30">
                                <div className="flex items-center justify-between pb-4 border-b border-white/20">
                                    <div>
                                        <div className="text-[10px] font-bold uppercase tracking-widest text-primary-foreground/70">NSA Member Card</div>
                                        <div className="font-bold text-lg tracking-wider text-white">NSA Indonesia</div>
                                    </div>
                                    <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                                        <QrCode className="w-6 h-6 text-white" />
                                    </div>
                                </div>

                                <div className="mt-6 space-y-3">
                                    <div>
                                        <div className="text-[10px] text-white/60 uppercase">Nomor Anggota Resmi (NTA)</div>
                                        <div className="font-mono text-base font-bold tracking-widest text-white">
                                            {member_number || 'NSA-ID-000000'}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-white/60 uppercase">Nama Anggota</div>
                                        <div className="font-bold text-sm text-white">{user.name}</div>
                                    </div>
                                    <div className="flex justify-between items-end pt-2 text-[10px] text-white/70">
                                        <div>
                                            <span>Status Keanggotaan:</span>
                                            <div className="font-semibold text-white">Aktif</div>
                                        </div>
                                        <div className="text-right">
                                            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-white font-bold uppercase text-[9px] border border-emerald-400/40">
                                                Resmi & Terverifikasi
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Informasi Bantuan & Kontak Admin */}
                    <div className="bg-card rounded-2xl border border-border/80 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h4 className="font-bold text-foreground text-sm">Ada Pertanyaan seputar Pendaftaran & Pembayaran?</h4>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Tim sekretariat NSA siap membantu kendala teknis dan administrasi Anda.
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <a
                                href="https://wa.me/6281234567890"
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-semibold text-xs transition"
                            >
                                <PhoneCall className="w-3.5 h-3.5 text-primary" /> WhatsApp Sekretariat
                            </a>
                            <a
                                href="mailto:info@nsa.or.id"
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-semibold text-xs transition"
                            >
                                <Mail className="w-3.5 h-3.5 text-primary" /> info@nsa.or.id
                            </a>
                        </div>
                    </div>

                </div>
            </div>
        </PublicLayout>
    );
}
