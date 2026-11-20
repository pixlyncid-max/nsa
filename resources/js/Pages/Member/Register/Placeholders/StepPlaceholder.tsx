import React from 'react';
import { 
    User, 
    FileText, 
    Building2, 
    FolderArchive, 
    Share2, 
    Fish, 
    Award, 
    FileCheck2, 
    ClipboardCheck, 
    Sparkles 
} from 'lucide-react';

interface StepPlaceholderProps {
    slug: string;
    number: number;
    title: string;
    subtitle: string;
}

const STEP_ICONS: Record<string, React.ReactNode> = {
    'informasi-akun': <User className="w-8 h-8 text-ocean" />,
    'data-pribadi': <FileText className="w-8 h-8 text-ocean" />,
    'data-usaha-perikanan': <Building2 className="w-8 h-8 text-ocean" />,
    'dokumen': <FolderArchive className="w-8 h-8 text-ocean" />,
    'media-sosial': <Share2 className="w-8 h-8 text-ocean" />,
    'data-komoditas': <Fish className="w-8 h-8 text-ocean" />,
    'keanggotaan': <Award className="w-8 h-8 text-ocean" />,
    'surat-pernyataan': <FileCheck2 className="w-8 h-8 text-ocean" />,
    'review-data': <ClipboardCheck className="w-8 h-8 text-ocean" />,
};

const STEP_DETAILS: Record<string, string[]> = {
    'informasi-akun': ['Nama Lengkap', 'Alamat Email Akun', 'Nomor WhatsApp / HP Aktif', 'Pengaturan Kata Sandi'],
    'data-pribadi': ['Nomor Induk Kependudukan (NIK 16 Digit)', 'Tempat & Tanggal Lahir', 'Jenis Kelamin', 'Alamat Lengkap KTP', 'Pas Foto Resmi'],
    'data-usaha-perikanan': ['Jenis Keanggotaan Usaha', 'Legalitas NIB 13 Digit & NPWP', 'Informasi Usaha & Tenaga Kerja', '20 Kategori Bidang Usaha', 'Wilayah & Peta Lokasi Usaha'],
    'dokumen': ['Scan/Foto KTP Asli', 'Dokumen NIB Resmi', 'NPWP Badan Usaha', 'Foto Kolam / Lokasi Usaha', 'Berkas Legalitas Tambahan'],
    'media-sosial': ['Akun Instagram Usaha', 'Halaman Facebook', 'Kanal TikTok Budidaya', 'Channel YouTube', 'Website Resmi Usaha'],
    'data-komoditas': ['Kategori Komoditas (Lele, Nila, Mas, Udang, dll)', 'Estimasi Kapasitas Produksi (Ton/Tahun)', 'Luas Lahan / Tambak Aktif'],
    'keanggotaan': ['Paket Kategori Anggota NSA', 'Penetapan Wilayah Cabang DPC', 'Rekomendasi Asosiasi'],
    'surat-pernyataan': ['Pakta Integritas Anggota NSA', 'Persetujuan Kode Etik Akuakultur', 'Pembubuhan Tanda Tangan Digital'],
    'review-data': ['Pratinjau Seluruh Isian Formulir', 'Verifikasi Keabsahan Dokumen', 'Pengiriman Final ke Verifikator Pusat'],
};

export default function StepPlaceholder({ slug, number, title, subtitle }: StepPlaceholderProps) {
    const icon = STEP_ICONS[slug] || <Sparkles className="w-8 h-8 text-ocean" />;
    const details = STEP_DETAILS[slug] || [];

    return (
        <div className="py-6">
            <div className="bg-mist/60 border border-line rounded-2xl p-6 md:p-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pb-6 border-b border-line">
                    <div className="w-16 h-16 rounded-2xl bg-white border border-line flex items-center justify-center shadow-soft shrink-0">
                        {icon}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full bg-ocean/10 text-ocean text-xs font-bold font-sans">
                                Langkah {number} dari 9
                            </span>
                            <span className="text-xs text-slate font-medium">
                                Tahap Kerangka Wizard
                            </span>
                        </div>
                        <h3 className="text-xl md:text-2xl font-bold font-display text-navy mt-1">
                            {title}
                        </h3>
                        <p className="text-sm text-slate mt-0.5">
                            {subtitle}
                        </p>
                    </div>
                </div>

                <div className="mt-6">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate mb-3">
                        Rincian Berkas & Data yang Akan Diisi:
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {details.map((item, idx) => (
                            <div
                                key={idx}
                                className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-line text-xs font-medium text-ink shadow-soft"
                            >
                                <span className="w-5 h-5 rounded-full bg-ocean/10 text-ocean flex items-center justify-center text-[10px] font-bold shrink-0">
                                    {idx + 1}
                                </span>
                                <span>{item}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-6 p-4 rounded-xl bg-white border border-dashed border-ocean/40 flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-ocean animate-ping" />
                    <p className="text-xs text-slate leading-relaxed">
                        <strong className="text-navy">Segera Hadir:</strong> Kerangka wizard pendaftaran keanggotaan aktif. Formulir interaktif lengkap untuk langkah ini akan diimplementasikan pada tahap berikutnya.
                    </p>
                </div>
            </div>
        </div>
    );
}
