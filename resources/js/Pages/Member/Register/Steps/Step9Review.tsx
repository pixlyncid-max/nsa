import React, { useState } from 'react';
import { 
    CheckCircle2, 
    AlertTriangle, 
    Edit3, 
    User, 
    Building2, 
    FileText, 
    Fish, 
    Users, 
    MapPin, 
    Receipt, 
    Send, 
    Loader2, 
    ExternalLink, 
    ShieldCheck, 
    X,
    Eye
} from 'lucide-react';

interface Step9Props {
    draft?: any;
    onEditStep?: (slug: string) => void;
    onSubmit?: (data?: any) => void;
    isSubmitting?: boolean;
    missingItems?: Record<string, string[]>;
    canSubmit?: boolean;
    termsModalContent?: string;
    privacyModalContent?: string;
    categories?: any[];
    membershipTypes?: any[];
    membershipFeeItems?: any[];
    [key: string]: any;
}

export default function Step9Review({
    draft = {},
    onEditStep,
    onSubmit,
    isSubmitting = false,
    missingItems = {},
    canSubmit = true,
    termsModalContent = '',
    privacyModalContent = '',
    categories = [],
    membershipTypes = [],
    membershipFeeItems = [],
}: Step9Props) {
    const identitas = draft['identitas'] || {};
    const kategori = draft['kategori-keanggotaan'] || {};
    const profilUsaha = draft['profil-usaha'] || {};
    const aktivitas = draft['aktivitas-perikanan'] || {};
    const jaringan = draft['jaringan-bisnis'] || {};
    const minat = draft['minat-program'] || {};
    const lokasi = draft['lokasi-dokumen'] || {};
    const administrasi = draft['paket-administrasi'] || {};

    const [agreeTerms, setAgreeTerms] = useState(false);
    const [agreePrivacy, setAgreePrivacy] = useState(false);

    // Modal state untuk Ketentuan dan Kebijakan Privasi
    const [activeModal, setActiveModal] = useState<'terms' | 'privacy' | null>(null);

    // Masking NIK: ************1234
    const formatMaskedNik = (nik?: string): string => {
        if (!nik) return '-';
        const clean = nik.trim();
        if (clean.length < 4) return '************';
        const lastFour = clean.slice(-4);
        return `************${lastFour}`;
    };

    // Masking Paspor: ****5678
    const formatMaskedPassport = (passport?: string): string => {
        if (!passport) return '-';
        const clean = passport.trim();
        if (clean.length < 4) return '****';
        const lastFour = clean.slice(-4);
        return `****${lastFour}`;
    };

    const formatCurrency = (val: number): string => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(val);
    };

    const handleEdit = (slug: string) => {
        if (onEditStep) {
            onEditStep(slug);
        } else {
            window.location.href = `/akun/keanggotaan/daftar/${slug}`;
        }
    };

    const handleSubmitApplication = () => {
        if (!agreeTerms || !agreePrivacy) {
            return;
        }
        if (onSubmit) {
            onSubmit({
                agree_terms: true,
                agree_privacy: true,
            });
        }
    };

    const hasMissing = Object.keys(missingItems).length > 0 || !canSubmit;

    // Hitung total administrasi dari draft
    const adminTotal = (administrasi.items || []).reduce((acc: number, it: any) => {
        if (it.selected) {
            return acc + (Number(it.amount) || 0) * (Number(it.qty) || 1);
        }
        return acc;
    }, 0);

    const selectedType = membershipTypes.find((t) => t.id === kategori.membership_type_id);

    return (
        <div className="space-y-6">
            {/* Peringatan Kelengkapan Berkas (Jika Ada yang Kurang) */}
            {hasMissing ? (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 space-y-2">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div className="space-y-1.5 flex-1">
                            <h4 className="font-semibold text-amber-900 dark:text-amber-300 text-sm md:text-base">
                                Masih Ada Bagian yang Belum Lengkap
                            </h4>
                            <p className="text-xs md:text-sm text-amber-800 dark:text-amber-200">
                                Harap lengkapi beberapa data atau dokumen wajib berikut sebelum Anda dapat mengirim formulir pendaftaran:
                            </p>
                            <ul className="list-disc pl-5 space-y-1 text-xs md:text-sm text-amber-900 dark:text-amber-200">
                                {Object.entries(missingItems).map(([stepTitle, items]) => (
                                    <li key={stepTitle}>
                                        <span className="font-semibold">{stepTitle}:</span>{' '}
                                        {Array.isArray(items) ? items.join(', ') : String(items)}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 md:p-5 flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                        <h4 className="font-semibold text-emerald-950 dark:text-emerald-300 text-sm">
                            Seluruh Data Pendaftaran Telah Lengkap
                        </h4>
                        <p className="text-xs text-emerald-800 dark:text-emerald-200">
                            Silakan periksa kembali seluruh ringkasan di bawah ini sebelum membubuhkan persetujuan dan mengirim pengajuan.
                        </p>
                    </div>
                </div>
            )}

            {/* RINGKASAN DATA PER LANGKAH */}
            <div className="space-y-4">
                {/* 1. Identitas Calon Anggota */}
                <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-xs space-y-3">
                    <div className="flex items-center justify-between pb-2.5 border-b border-border/70">
                        <div className="flex items-center gap-2.5">
                            <User className="w-4 h-4 text-primary" />
                            <h4 className="font-semibold text-foreground text-sm md:text-base">
                                Langkah 1: Identitas Calon Anggota
                            </h4>
                        </div>
                        <button
                            type="button"
                            onClick={() => handleEdit('identitas')}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition"
                        >
                            <Edit3 className="w-3.5 h-3.5" />
                            Ubah
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                        <div>
                            <span className="text-muted-foreground block">Nama Lengkap:</span>
                            <span className="font-semibold text-foreground">{identitas.full_name || '-'}</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground block">Kewarganegaraan:</span>
                            <span className="font-semibold uppercase text-foreground">{identitas.nationality || 'WNI'}</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground block">
                                {identitas.nationality === 'wna' ? 'Nomor Paspor (Masker):' : 'NIK (Masker):'}
                            </span>
                            <span className="font-mono font-semibold text-foreground">
                                {identitas.nationality === 'wna'
                                    ? formatMaskedPassport(identitas.passport_number)
                                    : formatMaskedNik(identitas.nik)}
                            </span>
                        </div>
                        <div>
                            <span className="text-muted-foreground block">Tempat, Tanggal Lahir:</span>
                            <span className="font-semibold text-foreground">
                                {identitas.birth_place ? `${identitas.birth_place}, ` : ''}{identitas.birth_date || '-'}
                            </span>
                        </div>
                        <div>
                            <span className="text-muted-foreground block">No. Telepon / WhatsApp:</span>
                            <span className="font-semibold text-foreground">{identitas.phone || '-'}</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground block">Email:</span>
                            <span className="font-semibold text-foreground">{identitas.email || '-'}</span>
                        </div>
                    </div>
                </div>

                {/* 2. Kategori & Jenis Keanggotaan */}
                <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-xs space-y-3">
                    <div className="flex items-center justify-between pb-2.5 border-b border-border/70">
                        <div className="flex items-center gap-2.5">
                            <Building2 className="w-4 h-4 text-primary" />
                            <h4 className="font-semibold text-foreground text-sm md:text-base">
                                Langkah 2: Kategori & Jenis Keanggotaan
                            </h4>
                        </div>
                        <button
                            type="button"
                            onClick={() => handleEdit('kategori-keanggotaan')}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition"
                        >
                            <Edit3 className="w-3.5 h-3.5" />
                            Ubah
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                        <div>
                            <span className="text-muted-foreground block">Kategori Kegiatan:</span>
                            <span className="font-semibold text-foreground">
                                {kategori.membership_category === 'Lainnya'
                                    ? `Lainnya: ${kategori.membership_category_custom}`
                                    : (kategori.membership_category || '-')}
                            </span>
                        </div>
                        <div>
                            <span className="text-muted-foreground block">Tipe Pemohon:</span>
                            <span className="font-semibold capitalize text-foreground">{kategori.applicant_type || 'Perorangan'}</span>
                        </div>
                        {kategori.applicant_type === 'institution' && (
                            <div>
                                <span className="text-muted-foreground block">Nama Instansi / Badan:</span>
                                <span className="font-semibold text-foreground">
                                    {kategori.institution_name} ({kategori.applicant_position || 'Perwakilan'})
                                </span>
                            </div>
                        )}
                        <div>
                            <span className="text-muted-foreground block">Jenis Keanggotaan:</span>
                            <span className="font-semibold text-foreground">{selectedType?.name || '-'}</span>
                        </div>
                    </div>
                </div>

                {/* 3. Profil Pekerjaan / Usaha */}
                <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-xs space-y-3">
                    <div className="flex items-center justify-between pb-2.5 border-b border-border/70">
                        <div className="flex items-center gap-2.5">
                            <FileText className="w-4 h-4 text-primary" />
                            <h4 className="font-semibold text-foreground text-sm md:text-base">
                                Langkah 3: Profil Usaha atau Pekerjaan
                            </h4>
                        </div>
                        <button
                            type="button"
                            onClick={() => handleEdit('profil-usaha')}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition"
                        >
                            <Edit3 className="w-3.5 h-3.5" />
                            Ubah
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                        {profilUsaha.has_no_business ? (
                            <div className="col-span-full">
                                <span className="text-muted-foreground block">Status:</span>
                                <span className="font-semibold text-foreground">
                                    Tidak Memiliki Usaha Mandiri — Profesi/Pekerjaan Utama: <strong>{profilUsaha.main_job || '-'}</strong>
                                </span>
                            </div>
                        ) : (
                            <>
                                <div>
                                    <span className="text-muted-foreground block">Nama Usaha:</span>
                                    <span className="font-semibold text-foreground">{profilUsaha.name || '-'}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block">Bidang Usaha:</span>
                                    <span className="font-semibold text-foreground">{profilUsaha.activity_field || '-'}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block">Skala & Pengalaman:</span>
                                    <span className="font-semibold text-foreground">
                                        Skala {profilUsaha.scale || 'Mikro'} ({profilUsaha.years_operating ? `${profilUsaha.years_operating} tahun` : '-'})
                                    </span>
                                </div>
                                <div className="col-span-full">
                                    <span className="text-muted-foreground block">Legalitas yang Diisi:</span>
                                    <span className="font-semibold text-foreground">
                                        {profilUsaha.legal_documents && profilUsaha.legal_documents.length > 0
                                            ? profilUsaha.legal_documents.map((d: any) => `${d.label || d.type.toUpperCase()}: ${d.number}`).join(' | ')
                                            : 'Tidak ada dokumen legalitas dicantumkan'}
                                    </span>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* 4. Aktivitas Perikanan */}
                <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-xs space-y-3">
                    <div className="flex items-center justify-between pb-2.5 border-b border-border/70">
                        <div className="flex items-center gap-2.5">
                            <Fish className="w-4 h-4 text-primary" />
                            <h4 className="font-semibold text-foreground text-sm md:text-base">
                                Langkah 4: Data Aktivitas Perikanan
                            </h4>
                        </div>
                        <button
                            type="button"
                            onClick={() => handleEdit('aktivitas-perikanan')}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition"
                        >
                            <Edit3 className="w-3.5 h-3.5" />
                            Ubah
                        </button>
                    </div>

                    <div className="text-xs">
                        {aktivitas.activities && aktivitas.activities.length > 0 ? (
                            <div className="space-y-1.5">
                                {aktivitas.activities.map((act: any, idx: number) => (
                                    <div key={idx} className="p-2.5 rounded-lg bg-muted/20 border border-border/60">
                                        <span className="font-semibold text-foreground">
                                            Kegiatan #{idx + 1}: Sistem {act.farming_system || 'Umum'}
                                        </span>
                                        {act.production_amount && (
                                            <span className="text-muted-foreground ml-2">
                                                (Produksi: {act.production_amount} {act.production_unit || 'ton'} / {act.period || 'siklus'})
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <span className="text-muted-foreground italic">
                                Langkah ini dilewati atau belum ada rincian kegiatan dicatat.
                            </span>
                        )}
                    </div>
                </div>

                {/* 5. Jaringan Bisnis & 6. Minat Program */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-xs space-y-3">
                        <div className="flex items-center justify-between pb-2.5 border-b border-border/70">
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-primary" />
                                <h4 className="font-semibold text-foreground text-sm">
                                    Langkah 5: Jaringan Bisnis
                                </h4>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleEdit('jaringan-bisnis')}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition"
                            >
                                <Edit3 className="w-3.5 h-3.5" />
                                Ubah
                            </button>
                        </div>
                        <div className="text-xs space-y-1 text-muted-foreground">
                            <p><strong className="text-foreground">Pemasaran:</strong> {jaringan.marketing_info || '-'}</p>
                            <p><strong className="text-foreground">Kerja Sama:</strong> {Array.isArray(jaringan.cooperation_types) ? jaringan.cooperation_types.join(', ') : '-'}</p>
                        </div>
                    </div>

                    <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-xs space-y-3">
                        <div className="flex items-center justify-between pb-2.5 border-b border-border/70">
                            <div className="flex items-center gap-2">
                                <Fish className="w-4 h-4 text-primary" />
                                <h4 className="font-semibold text-foreground text-sm">
                                    Langkah 6: Minat Program NSA
                                </h4>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleEdit('minat-program')}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition"
                            >
                                <Edit3 className="w-3.5 h-3.5" />
                                Ubah
                            </button>
                        </div>
                        <div className="text-xs space-y-1 text-muted-foreground">
                            <p>
                                <strong className="text-foreground">Pilihan Program:</strong>{' '}
                                {Array.isArray(minat.interests) && minat.interests.length > 0
                                    ? minat.interests.map((it: string) => it.replace(/_/g, ' ')).join(', ')
                                    : '-'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* 7. Lokasi & Dokumen */}
                <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-xs space-y-3">
                    <div className="flex items-center justify-between pb-2.5 border-b border-border/70">
                        <div className="flex items-center gap-2.5">
                            <MapPin className="w-4 h-4 text-primary" />
                            <h4 className="font-semibold text-foreground text-sm md:text-base">
                                Langkah 7: Lokasi, Foto & Dokumen
                            </h4>
                        </div>
                        <button
                            type="button"
                            onClick={() => handleEdit('lokasi-dokumen')}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition"
                        >
                            <Edit3 className="w-3.5 h-3.5" />
                            Ubah
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                        <div className="col-span-full">
                            <span className="text-muted-foreground block">Alamat Domisili:</span>
                            <span className="font-semibold text-foreground">{lokasi.domicile?.address || '-'}</span>
                        </div>
                        {lokasi.is_business_address_different && (
                            <div className="col-span-full">
                                <span className="text-muted-foreground block">Alamat Usaha:</span>
                                <span className="font-semibold text-foreground">{lokasi.business_address?.address || '-'}</span>
                            </div>
                        )}
                        <div>
                            <span className="text-muted-foreground block">Titik Koordinat:</span>
                            <span className="font-semibold text-foreground">
                                {lokasi.activity_locations?.length || 0} titik kegiatan terdaftar
                            </span>
                        </div>
                        <div>
                            <span className="text-muted-foreground block">Foto Fasilitas:</span>
                            <span className="font-semibold text-foreground">
                                {lokasi.photos?.length || 0} foto terunggah
                            </span>
                        </div>
                    </div>
                </div>

                {/* 8. Paket & Administrasi */}
                <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-xs space-y-3">
                    <div className="flex items-center justify-between pb-2.5 border-b border-border/70">
                        <div className="flex items-center gap-2.5">
                            <Receipt className="w-4 h-4 text-primary" />
                            <h4 className="font-semibold text-foreground text-sm md:text-base">
                                Langkah 8: Paket Keanggotaan & Administrasi
                            </h4>
                        </div>
                        <button
                            type="button"
                            onClick={() => handleEdit('paket-administrasi')}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition"
                        >
                            <Edit3 className="w-3.5 h-3.5" />
                            Ubah
                        </button>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="space-y-1">
                            <span className="text-muted-foreground block">Item Paket Terpilih:</span>
                            <div className="flex flex-wrap gap-1.5">
                                {(administrasi.items || []).filter((it: any) => it.selected).map((it: any) => (
                                    <span key={it.fee_item_id} className="px-2 py-0.5 rounded-md bg-muted text-foreground text-[11px] font-medium">
                                        {it.name} {it.size ? `(${it.size})` : ''} x{it.qty || 1}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="text-left sm:text-right">
                            <span className="text-muted-foreground block">Total Draf Administrasi:</span>
                            <span className="text-base font-bold text-primary font-mono tabular-nums">
                                {formatCurrency(adminTotal)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* CENTANG PERSETUJUAN KETENTUAN & PRIVASI */}
            <div className="bg-card border border-border/80 rounded-2xl p-5 md:p-6 shadow-sm space-y-4">
                <h4 className="font-semibold text-foreground text-sm md:text-base flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    Persetujuan dan Pengiriman Formulir
                </h4>

                <div className="space-y-3">
                    <label className="flex items-start gap-3 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={agreeTerms}
                            onChange={(e) => setAgreeTerms(e.target.checked)}
                            className="w-4 h-4 mt-0.5 rounded border-input text-primary focus:ring-primary transition"
                        />
                        <span className="text-xs md:text-sm text-foreground leading-relaxed">
                            Saya menyatakan bahwa seluruh data yang diisi adalah benar, sah, dan saya menyetujui{' '}
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setActiveModal('terms');
                                }}
                                className="font-semibold text-primary hover:underline inline-flex items-center gap-0.5"
                            >
                                Ketentuan & AD/ART Keanggotaan NSA
                                <ExternalLink className="w-3 h-3 ml-0.5" />
                            </button>
                            . <span className="text-destructive">*</span>
                        </span>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={agreePrivacy}
                            onChange={(e) => setAgreePrivacy(e.target.checked)}
                            className="w-4 h-4 mt-0.5 rounded border-input text-primary focus:ring-primary transition"
                        />
                        <span className="text-xs md:text-sm text-foreground leading-relaxed">
                            Saya menyetujui pemrosesan data identitas dan dokumen sesuai{' '}
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setActiveModal('privacy');
                                }}
                                className="font-semibold text-primary hover:underline inline-flex items-center gap-0.5"
                            >
                                Kebijakan Privasi NSA
                                <ExternalLink className="w-3 h-3 ml-0.5" />
                            </button>
                            . <span className="text-destructive">*</span>
                        </span>
                    </label>
                </div>

                {/* Tombol Kirim Pendaftaran */}
                <div className="pt-3 border-t border-border flex justify-end">
                    <button
                        type="button"
                        onClick={handleSubmitApplication}
                        disabled={!agreeTerms || !agreePrivacy || hasMissing || isSubmitting}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Mengirim Formulir...</span>
                            </>
                        ) : (
                            <>
                                <Send className="w-4 h-4" />
                                <span>Kirim Pendaftaran</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* MODAL KETENTUAN KEANGGOTAAN / KEBIJAKAN PRIVASI */}
            {activeModal && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-card border border-border rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl">
                        <div className="flex items-center justify-between pb-3 border-b border-border">
                            <h3 className="font-semibold text-foreground text-base">
                                {activeModal === 'terms' ? 'Ketentuan & AD/ART NSA' : 'Kebijakan Privasi NSA'}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setActiveModal(null)}
                                className="p-1 rounded-lg text-muted-foreground hover:bg-muted transition"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="max-h-72 overflow-y-auto text-xs md:text-sm text-muted-foreground whitespace-pre-line leading-relaxed pr-2">
                            {activeModal === 'terms' ? termsModalContent : privacyModalContent}
                        </div>

                        <div className="pt-3 border-t border-border flex justify-end">
                            <button
                                type="button"
                                onClick={() => setActiveModal(null)}
                                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
