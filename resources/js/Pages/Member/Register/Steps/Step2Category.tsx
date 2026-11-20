import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    CheckCircle2, 
    Briefcase, 
    Building2, 
    User, 
    Award, 
    BookOpen, 
    FileCheck2, 
    Layers, 
    HelpCircle 
} from 'lucide-react';

interface CategoryItem {
    id: number;
    name: string;
    slug: string;
    description?: string;
}

interface MembershipTypeItem {
    id: number;
    name: string;
    slug: string;
    description?: string;
    ad_art_rules?: string;
    category_id?: number;
}

interface Step2Props {
    data: {
        membership_category?: string;
        membership_category_custom?: string;
        applicant_type?: 'individual' | 'institution' | string;
        institution_name?: string;
        applicant_position?: string;
        membership_type_id?: number | string | null;
        [key: string]: any;
    };
    onChange: (data: any) => void;
    categories?: CategoryItem[];
    membershipTypes?: MembershipTypeItem[];
    errors?: Record<string, string>;
    [key: string]: any;
}

// Kategori default jika database belum memuat
const DEFAULT_CATEGORIES = [
    { id: 1, name: 'Pembudidaya', slug: 'pembudidaya', description: 'Pelaku usaha budidaya ikan/udang tawar, payau, atau laut.' },
    { id: 2, name: 'Pembenih', slug: 'pembenih', description: 'Produsen benih, larva, dan indukan perikanan bersertifikat.' },
    { id: 3, name: 'Pakan & Sarana', slug: 'pakan-sarana', description: 'Produsen & distributor pakan, obat ikan, pupuk, dan peralatan.' },
    { id: 4, name: 'Pengolah & Hasil Laut', slug: 'pengolah', description: 'Unit pengolahan ikan, cold storage, dan produk olahan hasil laut.' },
    { id: 5, name: 'Buyer & Eksportir', slug: 'buyer-eksportir', description: 'Pengepul, distributor komoditas perikanan, eksportir dan importir.' },
    { id: 6, name: 'Akademisi & Peneliti', slug: 'akademisi', description: 'Dosen, peneliti, mahasiswa riset perikanan dan kelautan.' },
    { id: 7, name: 'Konsultan & Profesional', slug: 'konsultan', description: 'Konsultan teknis akuakultur, analis lingkungan, dokter hewan perikanan.' },
    { id: 8, name: 'Lainnya', slug: 'lainnya', description: 'Aktivitas atau profesi lain di luar bidang di atas.' },
];

export default function Step2Category({
    data = {},
    onChange,
    categories = [],
    membershipTypes = [],
    errors = {},
}: Step2Props) {
    const activeCategories = categories.length > 0 ? categories : DEFAULT_CATEGORIES;
    const applicantType = data.applicant_type || 'individual';
    const isCustomCategory = data.membership_category === 'Lainnya';

    const handleFieldChange = (field: string, value: any) => {
        onChange({
            ...data,
            [field]: value,
        });
    };

    return (
        <div className="space-y-6">
            {/* Header / Subjudul */}
            <div className="border-b border-border/60 pb-3">
                <h3 className="text-base font-semibold text-foreground">Kategori dan Jenis Keanggotaan</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                    Tentukan bidang fokus kegiatan Anda dan status pendaftaran keanggotaan.
                </p>
            </div>

            {/* Bagian 1: Kategori Kegiatan (Kartu Pilihan) */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Kategori Kegiatan Utama <span className="text-danger">*</span>
                    </label>
                    <span className="text-[11px] text-muted-foreground">
                        Pilih 1 bidang yang paling mewakili aktivitas Anda
                    </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {activeCategories.map((cat) => {
                        const isSelected = data.membership_category === cat.name;
                        return (
                            <button
                                key={cat.id || cat.name}
                                type="button"
                                onClick={() => handleFieldChange('membership_category', cat.name)}
                                className={`text-left p-3.5 rounded-2xl border transition-all relative flex flex-col justify-between ${
                                    isSelected
                                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm'
                                        : 'border-border/70 bg-card hover:border-border hover:bg-muted/30'
                                }`}
                            >
                                <div>
                                    <div className="flex items-start justify-between gap-2 mb-1.5">
                                        <span className="text-xs font-semibold text-foreground">
                                            {cat.name}
                                        </span>
                                        {isSelected && (
                                            <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                                        )}
                                    </div>
                                    {cat.description && (
                                        <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                                            {cat.description}
                                        </p>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
                {errors.membership_category && (
                    <p className="text-xs text-danger mt-1">{errors.membership_category}</p>
                )}

                {/* Input Isian jika Kategori 'Lainnya' dipilih */}
                <AnimatePresence>
                    {isCustomCategory && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="pt-2 overflow-hidden"
                        >
                            <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 max-w-lg">
                                <label className="block text-xs font-medium text-foreground mb-1.5">
                                    Sebutkan Kategori / Bidang Kegiatan Anda <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.membership_category_custom || ''}
                                    onChange={(e) => handleFieldChange('membership_category_custom', e.target.value)}
                                    placeholder="Contoh: Logistik Rantai Dingin, Eksportir Pakan Alami, dll."
                                    className="w-full text-xs rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                                />
                                {errors.membership_category_custom && (
                                    <p className="text-xs text-danger mt-1">{errors.membership_category_custom}</p>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Bagian 2: Status Pendaftar (Individu vs Perwakilan Lembaga) */}
            <div className="bg-card rounded-2xl border border-border/60 p-5 space-y-4 shadow-sm">
                <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                        Status Pendaftar <span className="text-danger">*</span>
                    </label>
                    <p className="text-xs text-muted-foreground">
                        Apakah Anda mendaftar atas nama pribadi atau mewakili badan usaha/organisasi?
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
                    <button
                        type="button"
                        onClick={() => handleFieldChange('applicant_type', 'individual')}
                        className={`text-left p-4 rounded-xl border transition-all flex items-start gap-3 ${
                            applicantType === 'individual'
                                ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                                : 'border-border/70 bg-background hover:bg-muted/40'
                        }`}
                    >
                        <User className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <div>
                            <span className="block text-xs font-semibold text-foreground">
                                Individu / Perorangan
                            </span>
                            <span className="text-[11px] text-muted-foreground">
                                Pembudidaya mandiri, profesional, praktisi, atau akademisi perikanan.
                            </span>
                        </div>
                    </button>

                    <button
                        type="button"
                        onClick={() => handleFieldChange('applicant_type', 'institution')}
                        className={`text-left p-4 rounded-xl border transition-all flex items-start gap-3 ${
                            applicantType === 'institution'
                                ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                                : 'border-border/70 bg-background hover:bg-muted/40'
                        }`}
                    >
                        <Building2 className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                        <div>
                            <span className="block text-xs font-semibold text-foreground">
                                Perwakilan Lembaga / Badan Usaha
                            </span>
                            <span className="text-[11px] text-muted-foreground">
                                Mewakili PT, CV, Koperasi, Kelompok Pembudidaya (Pokdakan), atau institusi.
                            </span>
                        </div>
                    </button>
                </div>
                {errors.applicant_type && (
                    <p className="text-xs text-danger mt-1">{errors.applicant_type}</p>
                )}

                {/* Form Tambahan jika Lembaga / Badan Usaha */}
                <AnimatePresence>
                    {applicantType === 'institution' && (
                        <motion.div
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            className="pt-2 border-t border-border/40 grid grid-cols-1 md:grid-cols-2 gap-4"
                        >
                            <div>
                                <label className="block text-xs font-medium text-foreground mb-1.5">
                                    Nama Lembaga / Badan Usaha <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.institution_name || ''}
                                    onChange={(e) => handleFieldChange('institution_name', e.target.value)}
                                    placeholder="Contoh: PT Samudera Aquafarm, Koperasi Mina Makmur"
                                    className="w-full text-xs rounded-xl border border-border bg-background px-3 py-2.5 text-foreground placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                                />
                                {errors.institution_name && (
                                    <p className="text-xs text-danger mt-1">{errors.institution_name}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-foreground mb-1.5">
                                    Jabatan Pendaftar di Lembaga <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.applicant_position || ''}
                                    onChange={(e) => handleFieldChange('applicant_position', e.target.value)}
                                    placeholder="Contoh: Direktur Utama, Manajer Farm, Ketua Koperasi"
                                    className="w-full text-xs rounded-xl border border-border bg-background px-3 py-2.5 text-foreground placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                                />
                                {errors.applicant_position && (
                                    <p className="text-xs text-danger mt-1">{errors.applicant_position}</p>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Bagian 3: Jenis Keanggotaan (Dari membership_types / AD/ART) */}
            {membershipTypes.length > 0 && (
                <div className="space-y-3">
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                            Jenis Keanggotaan Sesuai AD/ART <span className="text-danger">*</span>
                        </label>
                        <p className="text-xs text-muted-foreground">
                            Pilih klasifikasi hak dan kewajiban keanggotaan dalam organisasi.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {membershipTypes.map((type) => {
                            const isSelected = Number(data.membership_type_id) === Number(type.id);
                            return (
                                <button
                                    key={type.id}
                                    type="button"
                                    onClick={() => handleFieldChange('membership_type_id', type.id)}
                                    className={`text-left p-4 rounded-2xl border transition-all relative flex flex-col justify-between ${
                                        isSelected
                                            ? 'border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm'
                                            : 'border-border/70 bg-card hover:border-border hover:bg-muted/30'
                                    }`}
                                >
                                    <div>
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                                <Award className="w-3.5 h-3.5 text-primary shrink-0" />
                                                {type.name}
                                            </span>
                                            {isSelected && (
                                                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                                            )}
                                        </div>
                                        {type.description && (
                                            <p className="text-[11px] text-muted-foreground mb-2 leading-relaxed">
                                                {type.description}
                                            </p>
                                        )}
                                    </div>

                                    {type.ad_art_rules && (
                                        <div className="pt-2 border-t border-border/40 text-[10px] text-muted-foreground/90 bg-muted/30 p-2 rounded-lg">
                                            <span className="font-medium text-foreground">Ketentuan AD/ART:</span> {type.ad_art_rules}
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                    {errors.membership_type_id && (
                        <p className="text-xs text-danger mt-1">{errors.membership_type_id}</p>
                    )}
                </div>
            )}
        </div>
    );
}
