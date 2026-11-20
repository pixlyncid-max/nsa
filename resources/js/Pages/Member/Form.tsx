import React from 'react';
import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import Button from '@/Components/ui/Button';
import { 
    ArrowLeft, 
    Printer, 
    ShieldCheck, 
    User, 
    Briefcase, 
    Building2, 
    FileText, 
    MapPin, 
    Fish, 
    Award, 
    ExternalLink, 
    PenTool,
    Calendar,
    Phone,
    Mail,
    CreditCard
} from 'lucide-react';

interface DocumentItem {
    id: number;
    type: string;
    original_name: string;
    file_size_formatted: string;
    preview_url?: string | null;
}

interface CommodityItem {
    category_name: string;
    cultivation_type?: string | null;
    capacity?: number | string | null;
    unit?: string | null;
    land_area?: number | string | null;
    land_area_unit?: string | null;
    pond_count?: number | null;
}

interface FormData {
    status: string;
    status_label: string;
    member_number?: string | null;
    user: {
        name: string;
        email: string;
        phone?: string | null;
    };
    profile?: {
        nik?: string | null;
        name_ktp?: string | null;
        birth_place?: string | null;
        birth_date?: string | null;
        gender?: string | null;
        occupation?: string | null;
        province_name?: string | null;
        regency_name?: string | null;
        district_name?: string | null;
        village_name?: string | null;
        postal_code?: string | null;
        address?: string | null;
        is_domicile_same?: boolean;
        domicile_address?: string | null;
        photo_url?: string | null;
    } | null;
    business?: {
        name?: string | null;
        owner_name?: string | null;
        nib?: string | null;
        npwp?: string | null;
        founded_at?: string | null;
        employee_count?: number | null;
        annual_revenue?: string | null;
        business_status?: string | null;
        business_scale?: string | null;
        membership_type?: string | null;
        membership_type_other?: string | null;
        province_name?: string | null;
        regency_name?: string | null;
        district_name?: string | null;
        village_name?: string | null;
        postal_code?: string | null;
        address?: string | null;
        business_fields?: string[];
    } | null;
    documents?: DocumentItem[];
    social_links?: Array<{ platform: string; url: string }>;
    commodities?: CommodityItem[];
    membership_plan?: {
        name: string;
        fee?: string;
    } | null;
    dpc?: {
        name: string;
        regency_name?: string | null;
        province_name?: string | null;
    } | null;
    join_reason?: string | null;
    statement?: {
        city?: string | null;
        signed_at?: string | null;
        signature_url?: string | null;
    } | null;
}

interface FormProps {
    formData: FormData;
}

export default function Form({ formData }: FormProps) {
    const {
        member_number,
        user,
        profile,
        business,
        documents = [],
        social_links = [],
        commodities = [],
        membership_plan,
        dpc,
        join_reason,
        statement,
    } = formData;

    const formatMaskedNik = (nik?: string | null): string => {
        if (!nik) return '-';
        const clean = nik.trim();
        if (clean.length < 4) return '************';
        return `************${clean.slice(-4)}`;
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <PublicLayout>
            <Head title="Salinan Formulir Pendaftaran Anggota - NSA" />

            <div className="bg-white min-h-screen py-8 md:py-12 print:py-0">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    {/* Bar Aksi Atas (Sembunyi saat cetak) */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 print:hidden">
                        <Link
                            href="/akun/keanggotaan"
                            className="inline-flex items-center gap-2 text-sm font-semibold text-slate hover:text-navy transition"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Kembali ke Status Keanggotaan</span>
                        </Link>

                        <div className="flex items-center gap-3">
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={handlePrint}
                                iconLeft={<Printer className="w-4 h-4 text-ocean" />}
                                className="font-display"
                            >
                                Cetak Formulir
                            </Button>
                        </div>
                    </div>

                    {/* Lembar Dokumen Formulir */}
                    <div className="bg-white rounded-2xl border border-line p-6 md:p-10 shadow-soft print:border-none print:shadow-none print:p-0">
                        
                        {/* Kop Dokumen */}
                        <div className="border-b border-line pb-6 mb-8">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <span className="text-xs font-bold uppercase tracking-widest text-ocean">
                                        NSA (Nusantara Sustainable Aquatic)
                                    </span>
                                    <h1 className="text-2xl md:text-3xl font-bold font-display text-navy mt-1">
                                        Salinan Formulir Pendaftaran Anggota
                                    </h1>
                                    <p className="text-xs text-slate mt-1">
                                        Dokumen arsip resmi pendaftaran keanggotaan terverifikasi NSA.
                                    </p>
                                </div>

                                <div className="text-left sm:text-right shrink-0">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-success/10 text-success border border-success/30">
                                        <ShieldCheck className="w-3.5 h-3.5" /> Terverifikasi & Disetujui
                                    </span>
                                    {member_number && (
                                        <p className="text-xs font-mono font-bold text-navy mt-2">
                                            No. Anggota: <span className="text-ocean">{member_number}</span>
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8">
                            
                            {/* Bagian 1: Akun Pengguna */}
                            <section>
                                <h3 className="text-sm font-bold font-display uppercase tracking-wider text-navy flex items-center gap-2 pb-2 border-b border-line mb-4">
                                    <User className="w-4 h-4 text-ocean" /> 1. Informasi Akun
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                                    <div className="bg-mist/50 p-3.5 rounded-xl border border-line/60">
                                        <span className="text-slate block text-[11px] mb-1">Nama Lengkap</span>
                                        <span className="font-semibold text-navy text-sm">{user.name}</span>
                                    </div>
                                    <div className="bg-mist/50 p-3.5 rounded-xl border border-line/60">
                                        <span className="text-slate block text-[11px] mb-1">Alamat Email</span>
                                        <span className="font-medium text-navy text-sm break-all">{user.email}</span>
                                    </div>
                                    <div className="bg-mist/50 p-3.5 rounded-xl border border-line/60">
                                        <span className="text-slate block text-[11px] mb-1">Nomor WhatsApp / HP</span>
                                        <span className="font-medium text-navy text-sm">{user.phone || '-'}</span>
                                    </div>
                                </div>
                            </section>

                            {/* Bagian 2: Data Pribadi Sesuai KTP */}
                            <section>
                                <h3 className="text-sm font-bold font-display uppercase tracking-wider text-navy flex items-center gap-2 pb-2 border-b border-line mb-4">
                                    <CreditCard className="w-4 h-4 text-ocean" /> 2. Data Pribadi Sesuai KTP
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                                    <div className="bg-mist/50 p-3.5 rounded-xl border border-line/60">
                                        <span className="text-slate block text-[11px] mb-1">NIK (Nomor Induk Kependudukan)</span>
                                        <span className="font-mono font-semibold text-navy">{formatMaskedNik(profile?.nik)}</span>
                                    </div>
                                    <div className="bg-mist/50 p-3.5 rounded-xl border border-line/60">
                                        <span className="text-slate block text-[11px] mb-1">Nama Sesuai KTP</span>
                                        <span className="font-semibold text-navy">{profile?.name_ktp || user.name}</span>
                                    </div>
                                    <div className="bg-mist/50 p-3.5 rounded-xl border border-line/60">
                                        <span className="text-slate block text-[11px] mb-1">Tempat & Tanggal Lahir</span>
                                        <span className="font-medium text-navy">{profile?.birth_place || '-'}, {profile?.birth_date || '-'}</span>
                                    </div>
                                    <div className="bg-mist/50 p-3.5 rounded-xl border border-line/60">
                                        <span className="text-slate block text-[11px] mb-1">Jenis Kelamin</span>
                                        <span className="font-medium text-navy">{profile?.gender || '-'}</span>
                                    </div>
                                    <div className="bg-mist/50 p-3.5 rounded-xl border border-line/60">
                                        <span className="text-slate block text-[11px] mb-1">Pekerjaan Utama</span>
                                        <span className="font-medium text-navy">{profile?.occupation || '-'}</span>
                                    </div>
                                    <div className="bg-mist/50 p-3.5 rounded-xl border border-line/60">
                                        <span className="text-slate block text-[11px] mb-1">Kode Pos</span>
                                        <span className="font-mono font-medium text-navy">{profile?.postal_code || '-'}</span>
                                    </div>
                                    <div className="sm:col-span-2 md:col-span-3 bg-mist/50 p-3.5 rounded-xl border border-line/60">
                                        <span className="text-slate block text-[11px] mb-1">Alamat Lengkap KTP</span>
                                        <p className="font-medium text-navy leading-relaxed">
                                            {profile?.address || '-'}
                                            {profile?.village_name && `, Kel. ${profile.village_name}`}
                                            {profile?.district_name && `, Kec. ${profile.district_name}`}
                                            {profile?.regency_name && `, ${profile.regency_name}`}
                                            {profile?.province_name && `, ${profile.province_name}`}
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* Bagian 3: Data Usaha Perikanan */}
                            <section>
                                <h3 className="text-sm font-bold font-display uppercase tracking-wider text-navy flex items-center gap-2 pb-2 border-b border-line mb-4">
                                    <Building2 className="w-4 h-4 text-ocean" /> 3. Data Usaha Perikanan
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                                    <div className="bg-mist/50 p-3.5 rounded-xl border border-line/60">
                                        <span className="text-slate block text-[11px] mb-1">Nama Usaha / Tambak</span>
                                        <span className="font-semibold text-navy text-sm">{business?.name || '-'}</span>
                                    </div>
                                    <div className="bg-mist/50 p-3.5 rounded-xl border border-line/60">
                                        <span className="text-slate block text-[11px] mb-1">Nama Pemilik / Penanggung Jawab</span>
                                        <span className="font-medium text-navy">{business?.owner_name || user.name}</span>
                                    </div>
                                    <div className="bg-mist/50 p-3.5 rounded-xl border border-line/60">
                                        <span className="text-slate block text-[11px] mb-1">Nomor Induk Berusaha (NIB)</span>
                                        <span className="font-mono font-semibold text-navy">{business?.nib || '-'}</span>
                                    </div>
                                    <div className="bg-mist/50 p-3.5 rounded-xl border border-line/60">
                                        <span className="text-slate block text-[11px] mb-1">Status Badan Usaha</span>
                                        <span className="font-medium text-navy">{business?.business_status || '-'}</span>
                                    </div>
                                    <div className="bg-mist/50 p-3.5 rounded-xl border border-line/60">
                                        <span className="text-slate block text-[11px] mb-1">Skala Usaha</span>
                                        <span className="font-medium text-navy">{business?.business_scale || '-'}</span>
                                    </div>
                                    <div className="bg-mist/50 p-3.5 rounded-xl border border-line/60">
                                        <span className="text-slate block text-[11px] mb-1">Jumlah Tenaga Kerja</span>
                                        <span className="font-medium text-navy">{business?.employee_count ? `${business.employee_count} Orang` : '-'}</span>
                                    </div>
                                    <div className="bg-mist/50 p-3.5 rounded-xl border border-line/60">
                                        <span className="text-slate block text-[11px] mb-1">Estimasi Omzet Tahunan</span>
                                        <span className="font-medium text-navy">{business?.annual_revenue ? `Rp ${business.annual_revenue}` : '-'}</span>
                                    </div>
                                    <div className="bg-mist/50 p-3.5 rounded-xl border border-line/60 sm:col-span-2">
                                        <span className="text-slate block text-[11px] mb-1">Bidang Usaha Terdaftar</span>
                                        <div className="flex flex-wrap gap-1.5 mt-1">
                                            {business?.business_fields && business.business_fields.length > 0 ? (
                                                business.business_fields.map((f, i) => (
                                                    <span key={i} className="px-2 py-0.5 rounded text-[11px] font-medium bg-ocean/10 text-ocean border border-ocean/20">
                                                        {f}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-slate">-</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="sm:col-span-2 md:col-span-3 bg-mist/50 p-3.5 rounded-xl border border-line/60">
                                        <span className="text-slate block text-[11px] mb-1">Alamat Lengkap Lokasi Usaha</span>
                                        <p className="font-medium text-navy leading-relaxed">
                                            {business?.address || '-'}
                                            {business?.village_name && `, Kel. ${business.village_name}`}
                                            {business?.district_name && `, Kec. ${business.district_name}`}
                                            {business?.regency_name && `, ${business.regency_name}`}
                                            {business?.province_name && `, ${business.province_name}`}
                                            {business?.postal_code && ` ${business.postal_code}`}
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* Bagian 4: Data Komoditas Budidaya */}
                            {commodities.length > 0 && (
                                <section>
                                    <h3 className="text-sm font-bold font-display uppercase tracking-wider text-navy flex items-center gap-2 pb-2 border-b border-line mb-4">
                                        <Fish className="w-4 h-4 text-ocean" /> 4. Komoditas Perikanan
                                    </h3>
                                    <div className="overflow-x-auto rounded-xl border border-line">
                                        <table className="w-full text-left text-xs text-ink">
                                            <thead className="bg-mist text-slate font-bold uppercase text-[10px] tracking-wider border-b border-line">
                                                <tr>
                                                    <th className="px-4 py-2.5">Komoditas</th>
                                                    <th className="px-4 py-2.5">Sistem Budidaya</th>
                                                    <th className="px-4 py-2.5">Kapasitas Produksi</th>
                                                    <th className="px-4 py-2.5">Luas Lahan</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-line">
                                                {commodities.map((com, idx) => (
                                                    <tr key={idx} className="hover:bg-mist/30">
                                                        <td className="px-4 py-2.5 font-semibold text-navy">{com.category_name}</td>
                                                        <td className="px-4 py-2.5 text-slate">{com.cultivation_type || '-'}</td>
                                                        <td className="px-4 py-2.5 font-mono">{com.capacity} {com.unit}</td>
                                                        <td className="px-4 py-2.5 font-mono">{com.land_area} {com.land_area_unit}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </section>
                            )}

                            {/* Bagian 5: Keanggotaan & DPC */}
                            <section>
                                <h3 className="text-sm font-bold font-display uppercase tracking-wider text-navy flex items-center gap-2 pb-2 border-b border-line mb-4">
                                    <Award className="w-4 h-4 text-ocean" /> 5. Paket Keanggotaan & DPC Wilayah
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                    <div className="bg-mist/50 p-3.5 rounded-xl border border-line/60">
                                        <span className="text-slate block text-[11px] mb-1">Paket Keanggotaan</span>
                                        <span className="font-semibold text-navy text-sm">{membership_plan?.name || business?.membership_type || 'Anggota NSA'}</span>
                                    </div>
                                    <div className="bg-mist/50 p-3.5 rounded-xl border border-line/60">
                                        <span className="text-slate block text-[11px] mb-1">DPC Wilayah Binaan</span>
                                        <span className="font-semibold text-navy text-sm">{dpc?.name || `DPC ${business?.regency_name || 'Daerah'}`}</span>
                                    </div>
                                    {join_reason && (
                                        <div className="sm:col-span-2 bg-mist/50 p-3.5 rounded-xl border border-line/60">
                                            <span className="text-slate block text-[11px] mb-1">Alasan Bergabung Asosiasi</span>
                                            <p className="text-slate leading-relaxed italic font-medium">"{join_reason}"</p>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* Bagian 6: Pernyataan & Pengesahan */}
                            <section className="pt-4 border-t border-line">
                                <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
                                    <div className="text-xs text-slate space-y-1">
                                        <span className="font-bold text-navy uppercase tracking-wide text-[11px] block">
                                            Ketentuan AD/ART NSA
                                        </span>
                                        <p>Dokumen ini disahkan secara digital dalam basis data keanggotaan NSA.</p>
                                        <p className="text-[11px]">Diterbitkan resmi oleh Pengurus Pusat Nusantara Sustainable Aquatic.</p>
                                    </div>

                                    <div className="text-center sm:text-right shrink-0">
                                        <p className="text-xs text-slate">
                                            {statement?.city || business?.regency_name || 'Jakarta'}, {statement?.signed_at || 'Terverifikasi'}
                                        </p>
                                        <p className="text-xs font-semibold text-navy mt-1">Pemohon / Penanggung Jawab,</p>
                                        
                                        {statement?.signature_url ? (
                                            <div className="my-2 flex justify-center sm:justify-end">
                                                <img 
                                                    src={statement.signature_url} 
                                                    alt="Tanda Tangan Digital" 
                                                    className="h-14 object-contain"
                                                />
                                            </div>
                                        ) : (
                                            <div className="h-12 flex items-center justify-center sm:justify-end text-[11px] font-mono text-success italic">
                                                [Tanda Tangan Digital Sah]
                                            </div>
                                        )}

                                        <p className="text-xs font-bold font-display text-navy border-t border-line pt-1 mt-1">
                                            {profile?.name_ktp || business?.owner_name || user.name}
                                        </p>
                                    </div>
                                </div>
                            </section>

                        </div>

                    </div>

                </div>
            </div>
        </PublicLayout>
    );
}
