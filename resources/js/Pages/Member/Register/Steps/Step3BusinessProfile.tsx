import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Building2, 
    Briefcase, 
    Clock, 
    FileSpreadsheet, 
    ShieldCheck, 
    HelpCircle, 
    CheckSquare, 
    Square, 
    Layers 
} from 'lucide-react';
import LegalDocumentRepeater, { LegalDocumentItem } from './LegalDocumentRepeater';

interface Step3Props {
    data: {
        has_no_business?: boolean;
        main_job?: string;
        name?: string;
        activity_field?: string;
        years_operating?: string | number;
        scale?: string;
        operational_info?: string;
        legal_documents?: LegalDocumentItem[];
        [key: string]: any;
    };
    onChange: (data: any) => void;
    errors?: Record<string, string>;
    draft?: any;
    application?: any;
    requiredLegalities?: Record<string, string[]>;
    [key: string]: any;
}

const SCALE_DESCRIPTIONS: Record<string, string> = {
    Mikro: 'Modal usaha / kekayaan bersih s.d. Rp 1 Miliar (di luar tanah & bangunan) atau hasil penjualan tahunan s.d. Rp 2 Miliar.',
    Kecil: 'Modal usaha Rp 1 Miliar - Rp 5 Miliar atau hasil penjualan tahunan Rp 2 Miliar - Rp 15 Miliar.',
    Menengah: 'Modal usaha Rp 5 Miliar - Rp 10 Miliar atau hasil penjualan tahunan Rp 15 Miliar - Rp 50 Miliar.',
    Besar: 'Modal usaha lebih dari Rp 10 Miliar atau hasil penjualan tahunan lebih dari Rp 50 Miliar.',
};

export default function Step3BusinessProfile({
    data = {},
    onChange,
    errors = {},
    draft = {},
    application = {},
    requiredLegalities = {},
}: Step3Props) {
    const [activeScaleTooltip, setActiveScaleTooltip] = useState<string | null>(null);

    const hasNoBusiness = Boolean(data.has_no_business);
    const selectedCategory = draft['kategori-keanggotaan']?.membership_category 
        || application?.membership_category 
        || '';

    const handleFieldChange = (field: string, value: any) => {
        onChange({
            ...data,
            [field]: value,
        });
    };

    const handleToggleNoBusiness = () => {
        const nextState = !hasNoBusiness;
        onChange({
            ...data,
            has_no_business: nextState,
        });
    };

    return (
        <div className="space-y-6">
            {/* Header / Subjudul */}
            <div className="border-b border-border/60 pb-3">
                <h3 className="text-base font-semibold text-foreground">Profil Pekerjaan atau Usaha</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                    Lengkapi profil usaha perikanan atau pekerjaan utama Anda beserta data perizinan legalitas.
                </p>
            </div>

            {/* Checkbox "Saya belum memiliki usaha" */}
            <div className="p-4 rounded-xl border border-border/70 bg-muted/20 flex items-start gap-3">
                <button
                    type="button"
                    onClick={handleToggleNoBusiness}
                    className="text-primary mt-0.5 focus:outline-none"
                    aria-label="Toggle belum memiliki usaha"
                >
                    {hasNoBusiness ? (
                        <CheckSquare className="w-4 h-4 text-primary" />
                    ) : (
                        <Square className="w-4 h-4 text-muted-foreground" />
                    )}
                </button>
                <div className="text-xs">
                    <button
                        type="button"
                        onClick={handleToggleNoBusiness}
                        className="font-medium text-foreground text-left hover:underline"
                    >
                        Saya belum memiliki badan usaha / usaha budidaya mandiri
                    </button>
                    <p className="text-muted-foreground mt-0.5">
                        Centang opsi ini jika Anda mendaftar sebagai perorangan, akademisi, peneliti, atau pekerja yang belum memiliki legalitas/unit usaha.
                    </p>
                </div>
            </div>

            {/* Form 2 Kolom bergaya FormCard */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                {/* Kartu 1: Profil Usaha / Pekerjaan */}
                <div className="bg-card rounded-2xl border border-border/60 p-5 space-y-4 shadow-sm">
                    <div className="flex items-center gap-2 pb-2 border-b border-border/40">
                        <Building2 className="w-4 h-4 text-primary" />
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            {hasNoBusiness ? 'Pekerjaan Utama' : 'Profil Usaha / Lembaga'}
                        </h4>
                    </div>

                    <AnimatePresence mode="wait">
                        {hasNoBusiness ? (
                            <motion.div
                                key="no-business-fields"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="space-y-4"
                            >
                                <div>
                                    <label className="block text-xs font-medium text-foreground mb-1.5">
                                        Pekerjaan / Profesi Utama <span className="text-danger">*</span>
                                    </label>
                                    <div className="relative">
                                        <Briefcase className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="text"
                                            value={data.main_job || ''}
                                            onChange={(e) => handleFieldChange('main_job', e.target.value)}
                                            placeholder="Contoh: Peneliti Akuakultur, Dosen Perikanan, Penyuluh Lapangan"
                                            className="w-full text-xs rounded-xl border border-border bg-background pl-9 pr-3 py-2.5 text-foreground placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                                        />
                                    </div>
                                    {errors.main_job && (
                                        <p className="text-xs text-danger mt-1">{errors.main_job}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-foreground mb-1.5">
                                        Informasi Singkat Aktivitas Profesional (Opsional)
                                    </label>
                                    <textarea
                                        rows={4}
                                        maxLength={500}
                                        value={data.operational_info || ''}
                                        onChange={(e) => handleFieldChange('operational_info', e.target.value)}
                                        placeholder="Ceritakan bidang riset, pengalaman teknis, atau aktivitas profesional Anda..."
                                        className="w-full text-xs rounded-xl border border-border bg-background p-3 text-foreground placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                                    />
                                    <div className="flex justify-between items-center text-[11px] text-muted-foreground mt-1">
                                        <span>Maksimum 500 karakter.</span>
                                        <span>{(data.operational_info || '').length} / 500</span>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="business-fields"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="space-y-4"
                            >
                                {/* Nama Usaha */}
                                <div>
                                    <label className="block text-xs font-medium text-foreground mb-1.5">
                                        Nama Usaha / Lembaga / Farm <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.name || ''}
                                        onChange={(e) => handleFieldChange('name', e.target.value)}
                                        placeholder="Contoh: Samudera Aquafarm Mandiri"
                                        className="w-full text-xs rounded-xl border border-border bg-background px-3 py-2.5 text-foreground placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                                    />
                                    {errors.name && (
                                        <p className="text-xs text-danger mt-1">{errors.name}</p>
                                    )}
                                </div>

                                {/* Bidang Kegiatan */}
                                <div>
                                    <label className="block text-xs font-medium text-foreground mb-1.5">
                                        Bidang Kegiatan Usaha <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.activity_field || ''}
                                        onChange={(e) => handleFieldChange('activity_field', e.target.value)}
                                        placeholder="Contoh: Pembesaran Ikan Nila & Patin, Pembenihan Udang Vaname"
                                        className="w-full text-xs rounded-xl border border-border bg-background px-3 py-2.5 text-foreground placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                                    />
                                    {errors.activity_field && (
                                        <p className="text-xs text-danger mt-1">{errors.activity_field}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Lama Berusaha */}
                                    <div>
                                        <label className="block text-xs font-medium text-foreground mb-1.5">
                                            Lama Berusaha (Tahun) <span className="text-danger">*</span>
                                        </label>
                                        <div className="relative">
                                            <Clock className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                                            <input
                                                type="number"
                                                min={0}
                                                max={99}
                                                value={data.years_operating ?? ''}
                                                onChange={(e) => handleFieldChange('years_operating', e.target.value)}
                                                placeholder="Contoh: 5"
                                                className="w-full text-xs rounded-xl border border-border bg-background pl-9 pr-3 py-2.5 text-foreground font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                                            />
                                        </div>
                                        {errors.years_operating && (
                                            <p className="text-xs text-danger mt-1">{errors.years_operating}</p>
                                        )}
                                    </div>

                                    {/* Skala Kegiatan */}
                                    <div>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <label className="block text-xs font-medium text-foreground">
                                                Skala Kegiatan <span className="text-danger">*</span>
                                            </label>
                                        </div>
                                        <select
                                            value={data.scale || 'Mikro'}
                                            onChange={(e) => handleFieldChange('scale', e.target.value)}
                                            className="w-full text-xs rounded-xl border border-border bg-background px-3 py-2.5 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                                        >
                                            <option value="Mikro">Mikro</option>
                                            <option value="Kecil">Kecil</option>
                                            <option value="Menengah">Menengah</option>
                                            <option value="Besar">Besar</option>
                                        </select>
                                        {errors.scale && (
                                            <p className="text-xs text-danger mt-1">{errors.scale}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Tooltip / Penjelasan Kriteria Skala */}
                                <div className="p-3 rounded-xl bg-muted/40 border border-border/50 text-[11px] text-muted-foreground space-y-1">
                                    <div className="flex items-center gap-1.5 font-medium text-foreground">
                                        <HelpCircle className="w-3.5 h-3.5 text-primary" />
                                        <span>Kriteria Skala ({data.scale || 'Mikro'}):</span>
                                    </div>
                                    <p className="leading-relaxed">
                                        {SCALE_DESCRIPTIONS[data.scale || 'Mikro']}
                                    </p>
                                </div>

                                {/* Informasi Dasar Operasional */}
                                <div>
                                    <label className="block text-xs font-medium text-foreground mb-1.5">
                                        Informasi Dasar Operasional
                                    </label>
                                    <textarea
                                        rows={3}
                                        maxLength={500}
                                        value={data.operational_info || ''}
                                        onChange={(e) => handleFieldChange('operational_info', e.target.value)}
                                        placeholder="Ringkasan sistem budidaya, kapasitas fasilitas, atau metode kerja..."
                                        className="w-full text-xs rounded-xl border border-border bg-background p-3 text-foreground placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                                    />
                                    <div className="flex justify-between items-center text-[11px] text-muted-foreground mt-1">
                                        <span>Maksimum 500 karakter.</span>
                                        <span>{(data.operational_info || '').length} / 500</span>
                                    </div>
                                    {errors.operational_info && (
                                        <p className="text-xs text-danger mt-1">{errors.operational_info}</p>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Kartu 2: Perizinan & Legalitas */}
                <div className="bg-card rounded-2xl border border-border/60 p-5 space-y-4 shadow-sm">
                    <div className="flex items-center justify-between pb-2 border-b border-border/40">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-primary" />
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Perizinan & Legalitas
                            </h4>
                        </div>
                        <span className="text-[11px] text-muted-foreground">
                            {hasNoBusiness ? 'Opsional' : 'Wajib diisi bila ada'}
                        </span>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed">
                        Catat izin operasional yang Anda miliki seperti NIB, NPWP Usaha, atau Sertifikat CBIB. Berkas fisik atau scan PDF akan diunggah pada <strong>Langkah 7 (Lokasi & Dokumen)</strong>.
                    </p>

                    <LegalDocumentRepeater
                        documents={data.legal_documents || []}
                        onChange={(docs) => handleFieldChange('legal_documents', docs)}
                        category={selectedCategory}
                        requiredLegalities={requiredLegalities}
                        errors={errors}
                        disabled={false}
                    />
                </div>
            </div>
        </div>
    );
}
