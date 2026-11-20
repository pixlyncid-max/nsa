import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Phone, Mail, Calendar, MapPin, Globe, CreditCard, Shield, Clock, AlertCircle } from 'lucide-react';
import RegionSelect from '@/Components/form/RegionSelect';

interface Step1Props {
    data: {
        nationality?: 'wni' | 'wna' | string;
        full_name?: string;
        gender?: 'male' | 'female' | string;
        birth_place?: string;
        birth_date?: string;
        phone?: string;
        email?: string;
        nik?: string;
        province_id?: number | null;
        regency_id?: number | null;
        district_id?: number | null;
        village_id?: number | null;
        postal_code?: string;
        address?: string;
        passport_number?: string;
        origin_country?: string;
        years_in_indonesia?: number | string;
        [key: string]: any;
    };
    onChange: (data: any) => void;
    errors?: Record<string, string>;
    requireKtpForWni?: boolean;
    [key: string]: any;
}

const COUNTRY_OPTIONS = [
    'Australia',
    'Belanda',
    'Filipina',
    'India',
    'Inggris',
    'Jepang',
    'Jerman',
    'Korea Selatan',
    'Malaysia',
    'Norwegia',
    'Prancis',
    'Singapura',
    'Thailand',
    'Tiongkok',
    'Vietnam',
    'Lainnya',
];

export default function Step1Identity({
    data = {},
    onChange,
    errors = {},
    requireKtpForWni = true,
}: Step1Props) {
    const nationality = data.nationality || 'wni';

    const handleFieldChange = (field: string, value: any) => {
        onChange({
            ...data,
            [field]: value,
        });
    };

    // Usia: tampil otomatis dari tanggal lahir (hanya baca, tanpa input)
    const calculatedAge = useMemo(() => {
        if (!data.birth_date) return null;
        const birthDate = new Date(data.birth_date);
        if (isNaN(birthDate.getTime())) return null;
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age >= 0 ? age : null;
    }, [data.birth_date]);

    return (
        <div className="space-y-6">
            {/* Header / Subjudul */}
            <div className="border-b border-border/60 pb-3">
                <h3 className="text-base font-semibold text-foreground">Identitas Calon Anggota</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                    Isi sesuai dokumen identitas Anda (KTP untuk WNI, Paspor untuk WNA).
                </p>
            </div>

            {/* Segmented Control: Kewarganegaraan */}
            <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Kewarganegaraan <span className="text-danger">*</span>
                </label>
                <div className="inline-flex p-1 rounded-xl bg-muted/60 border border-border/60 w-full sm:w-auto">
                    <button
                        type="button"
                        onClick={() => handleFieldChange('nationality', 'wni')}
                        className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-2 rounded-lg text-xs font-medium transition-all ${
                            nationality === 'wni'
                                ? 'bg-background text-foreground shadow-sm font-semibold'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <Shield className="w-3.5 h-3.5 text-primary" />
                        Warga Negara Indonesia (WNI)
                    </button>
                    <button
                        type="button"
                        onClick={() => handleFieldChange('nationality', 'wna')}
                        className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-2 rounded-lg text-xs font-medium transition-all ${
                            nationality === 'wna'
                                ? 'bg-background text-foreground shadow-sm font-semibold'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <Globe className="w-3.5 h-3.5 text-secondary" />
                        Warga Negara Asing (WNA)
                    </button>
                </div>
                {errors.nationality && (
                    <p className="text-xs text-danger mt-1.5">{errors.nationality}</p>
                )}
            </div>

            {/* Bagian Data Pribadi Umum */}
            <div className="bg-card rounded-2xl border border-border/60 p-5 space-y-4 shadow-sm">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pb-1 border-b border-border/40">
                    Data Pribadi
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Nama Lengkap */}
                    <div>
                        <label className="block text-xs font-medium text-foreground mb-1.5">
                            Nama Lengkap <span className="text-danger">*</span>
                        </label>
                        <div className="relative">
                            <User className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={data.full_name || ''}
                                onChange={(e) => handleFieldChange('full_name', e.target.value)}
                                placeholder="Nama sesuai KTP / Paspor"
                                className="w-full text-xs rounded-xl border border-border bg-background pl-9 pr-3 py-2.5 text-foreground placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                            />
                        </div>
                        {errors.full_name && (
                            <p className="text-xs text-danger mt-1">{errors.full_name}</p>
                        )}
                    </div>

                    {/* Jenis Kelamin */}
                    <div>
                        <label className="block text-xs font-medium text-foreground mb-1.5">
                            Jenis Kelamin <span className="text-danger">*</span>
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => handleFieldChange('gender', 'male')}
                                className={`px-4 py-2.5 rounded-xl border text-xs font-medium transition-colors text-center ${
                                    data.gender === 'male'
                                        ? 'border-primary bg-primary/10 text-primary font-semibold'
                                        : 'border-border bg-background text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                Laki-laki
                            </button>
                            <button
                                type="button"
                                onClick={() => handleFieldChange('gender', 'female')}
                                className={`px-4 py-2.5 rounded-xl border text-xs font-medium transition-colors text-center ${
                                    data.gender === 'female'
                                        ? 'border-primary bg-primary/10 text-primary font-semibold'
                                        : 'border-border bg-background text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                Perempuan
                            </button>
                        </div>
                        {errors.gender && (
                            <p className="text-xs text-danger mt-1">{errors.gender}</p>
                        )}
                    </div>

                    {/* Tempat Lahir */}
                    <div>
                        <label className="block text-xs font-medium text-foreground mb-1.5">
                            Tempat Lahir <span className="text-danger">*</span>
                        </label>
                        <input
                            type="text"
                            value={data.birth_place || ''}
                            onChange={(e) => handleFieldChange('birth_place', e.target.value)}
                            placeholder="Kota / Tempat Lahir"
                            className="w-full text-xs rounded-xl border border-border bg-background px-3 py-2.5 text-foreground placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                        />
                        {errors.birth_place && (
                            <p className="text-xs text-danger mt-1">{errors.birth_place}</p>
                        )}
                    </div>

                    {/* Tanggal Lahir & Usia Otomatis */}
                    <div>
                        <label className="block text-xs font-medium text-foreground mb-1.5">
                            Tanggal Lahir <span className="text-danger">*</span>
                        </label>
                        <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                                <Calendar className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <input
                                    type="date"
                                    value={data.birth_date || ''}
                                    onChange={(e) => handleFieldChange('birth_date', e.target.value)}
                                    className="w-full text-xs rounded-xl border border-border bg-background pl-9 pr-3 py-2.5 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                                />
                            </div>
                            <div
                                className="px-3 py-2.5 rounded-xl border border-border/80 bg-muted/40 text-xs text-muted-foreground whitespace-nowrap min-w-[90px] text-center"
                                title="Usia otomatis dihitung dari tanggal lahir"
                            >
                                {calculatedAge !== null ? (
                                    <span className="font-semibold text-foreground">{calculatedAge} tahun</span>
                                ) : (
                                    <span>Usia: -</span>
                                )}
                            </div>
                        </div>
                        {errors.birth_date && (
                            <p className="text-xs text-danger mt-1">{errors.birth_date}</p>
                        )}
                    </div>

                    {/* Nomor Telepon (+62) */}
                    <div>
                        <label className="block text-xs font-medium text-foreground mb-1.5">
                            Nomor Telepon / WhatsApp <span className="text-danger">*</span>
                        </label>
                        <div className="relative flex">
                            <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-border bg-muted/50 text-xs text-muted-foreground font-mono font-medium">
                                +62
                            </span>
                            <input
                                type="tel"
                                value={data.phone ? data.phone.replace(/^\+?62/, '') : ''}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/^0+/, '');
                                    handleFieldChange('phone', val ? `+62${val}` : '');
                                }}
                                placeholder="81234567890"
                                className="w-full text-xs rounded-r-xl border border-border bg-background px-3 py-2.5 text-foreground font-mono placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                            />
                        </div>
                        {errors.phone && (
                            <p className="text-xs text-danger mt-1">{errors.phone}</p>
                        )}
                    </div>

                    {/* Email (Terkunci) */}
                    <div>
                        <label className="block text-xs font-medium text-foreground mb-1.5">
                            Alamat Email (Terkunci)
                        </label>
                        <div className="relative">
                            <Mail className="w-4 h-4 text-muted-foreground/60 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="email"
                                value={data.email || ''}
                                readOnly
                                disabled
                                className="w-full text-xs rounded-xl border border-border/60 bg-muted/40 pl-9 pr-3 py-2.5 text-muted-foreground cursor-not-allowed select-none"
                            />
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1">
                            Email terhubung dengan akun login Anda.
                        </p>
                    </div>
                </div>
            </div>

            {/* Bagian Dinamis WNI vs WNA dengan Animasi Masuk/Keluar (Framer Motion) */}
            <AnimatePresence mode="wait">
                {nationality === 'wni' ? (
                    <motion.div
                        key="wni-section"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.2 }}
                        className="bg-card rounded-2xl border border-border/60 p-5 space-y-4 shadow-sm"
                    >
                        <div className="flex items-center justify-between pb-1 border-b border-border/40">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                <CreditCard className="w-3.5 h-3.5 text-primary" />
                                Data Kependudukan & Domisili (WNI)
                            </h4>
                            {requireKtpForWni ? (
                                <span className="text-[11px] text-primary bg-primary/10 px-2 py-0.5 rounded-full font-medium">
                                    Wajib diisi sesuai ketentuan
                                </span>
                            ) : (
                                <span className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full font-medium">
                                    Opsional
                                </span>
                            )}
                        </div>

                        {/* NIK */}
                        <div>
                            <label className="block text-xs font-medium text-foreground mb-1.5">
                                Nomor Induk Kependudukan (NIK 16 Digit) {requireKtpForWni && <span className="text-danger">*</span>}
                            </label>
                            <input
                                type="text"
                                maxLength={16}
                                value={data.nik || ''}
                                onChange={(e) => handleFieldChange('nik', e.target.value.replace(/\D/g, ''))}
                                placeholder="Contoh: 3201xxxxxxxxxxxx"
                                className="w-full max-w-md text-xs rounded-xl border border-border bg-background px-3 py-2.5 text-foreground font-mono placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors tracking-wider"
                            />
                            <p className="text-[11px] text-muted-foreground mt-1">
                                NIK Anda akan disimpan secara terenkripsi demi keamanan data pribadi.
                            </p>
                            {errors.nik && (
                                <p className="text-xs text-danger mt-1">{errors.nik}</p>
                            )}
                        </div>

                        {/* Domisili sesuai KTP */}
                        <div className="space-y-3 pt-2">
                            <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                                <MapPin className="w-3.5 h-3.5 text-primary" />
                                <span>Alamat Domisili KTP {requireKtpForWni && <span className="text-danger">*</span>}</span>
                            </div>

                            <RegionSelect
                                provinceId={data.province_id ? Number(data.province_id) : null}
                                regencyId={data.regency_id ? Number(data.regency_id) : null}
                                districtId={data.district_id ? Number(data.district_id) : null}
                                villageId={data.village_id ? Number(data.village_id) : null}
                                onChange={({ province_id, regency_id, district_id, village_id }) => {
                                    onChange({
                                        ...data,
                                        province_id,
                                        regency_id,
                                        district_id,
                                        village_id,
                                    });
                                }}
                                errors={errors}
                                required={requireKtpForWni}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-medium text-foreground mb-1">
                                        Alamat Jalan / RT / RW / Dusun {requireKtpForWni && <span className="text-danger">*</span>}
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={data.address || ''}
                                        onChange={(e) => handleFieldChange('address', e.target.value)}
                                        placeholder="Nama jalan, RT/RW, nomor rumah..."
                                        className="w-full text-xs rounded-xl border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                                    />
                                    {errors.address && (
                                        <p className="text-xs text-danger mt-1">{errors.address}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-foreground mb-1">
                                        Kode Pos
                                    </label>
                                    <input
                                        type="text"
                                        maxLength={5}
                                        value={data.postal_code || ''}
                                        onChange={(e) => handleFieldChange('postal_code', e.target.value.replace(/\D/g, ''))}
                                        placeholder="12345"
                                        className="w-full text-xs rounded-xl border border-border bg-background px-3 py-2 text-foreground font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                                    />
                                    {errors.postal_code && (
                                        <p className="text-xs text-danger mt-1">{errors.postal_code}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="wna-section"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.2 }}
                        className="bg-card rounded-2xl border border-border/60 p-5 space-y-4 shadow-sm"
                    >
                        <div className="flex items-center justify-between pb-1 border-b border-border/40">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                <Globe className="w-3.5 h-3.5 text-secondary" />
                                Informasi Paspor & Izin Tinggal (WNA)
                            </h4>
                            <span className="text-[11px] text-secondary bg-secondary/10 px-2 py-0.5 rounded-full font-medium">
                                Warga Negara Asing
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Nomor Paspor */}
                            <div>
                                <label className="block text-xs font-medium text-foreground mb-1.5">
                                    Nomor Paspor <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.passport_number || ''}
                                    onChange={(e) => handleFieldChange('passport_number', e.target.value.toUpperCase())}
                                    placeholder="Contoh: A12345678"
                                    className="w-full text-xs rounded-xl border border-border bg-background px-3 py-2.5 text-foreground font-mono placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors tracking-wider"
                                />
                                <p className="text-[11px] text-muted-foreground mt-1">
                                    Data paspor tersimpan secara aman & terenkripsi.
                                </p>
                                {errors.passport_number && (
                                    <p className="text-xs text-danger mt-1">{errors.passport_number}</p>
                                )}
                            </div>

                            {/* Negara Asal */}
                            <div>
                                <label className="block text-xs font-medium text-foreground mb-1.5">
                                    Negara Asal <span className="text-danger">*</span>
                                </label>
                                <select
                                    value={data.origin_country || ''}
                                    onChange={(e) => handleFieldChange('origin_country', e.target.value)}
                                    className="w-full text-xs rounded-xl border border-border bg-background px-3 py-2.5 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                                >
                                    <option value="">Pilih Negara Asal</option>
                                    {COUNTRY_OPTIONS.map((c) => (
                                        <option key={c} value={c}>
                                            {c}
                                        </option>
                                    ))}
                                </select>
                                {errors.origin_country && (
                                    <p className="text-xs text-danger mt-1">{errors.origin_country}</p>
                                )}
                            </div>

                            {/* Lama di Indonesia (Tahun) */}
                            <div>
                                <label className="block text-xs font-medium text-foreground mb-1.5">
                                    Lama Berada di Indonesia (Tahun) <span className="text-danger">*</span>
                                </label>
                                <div className="relative">
                                    <Clock className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="number"
                                        min={0}
                                        max={99}
                                        value={data.years_in_indonesia ?? ''}
                                        onChange={(e) => handleFieldChange('years_in_indonesia', e.target.value)}
                                        placeholder="Contoh: 3"
                                        className="w-full text-xs rounded-xl border border-border bg-background pl-9 pr-3 py-2.5 text-foreground font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                                    />
                                </div>
                                {errors.years_in_indonesia && (
                                    <p className="text-xs text-danger mt-1">{errors.years_in_indonesia}</p>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
