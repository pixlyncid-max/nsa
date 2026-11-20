import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Network, 
    Share2, 
    MapPin, 
    Package, 
    Handshake, 
    Briefcase, 
    X, 
    Plus, 
    CheckSquare, 
    Square 
} from 'lucide-react';

interface Step5Props {
    data: {
        marketing_info?: string;
        distribution_areas?: string[];
        supply_needs?: string;
        cooperation_types?: string[];
        cooperation_types_custom?: string;
        professional_activities?: string;
        [key: string]: any;
    };
    onChange: (data: any) => void;
    provinces?: Array<{ id: number; name: string }>;
    errors?: Record<string, string>;
    [key: string]: any;
}

const COOPERATION_OPTIONS = [
    { id: 'pasokan', label: 'Pasokan Komoditas / Bahan Baku', desc: 'Mencari atau menawarkan pasokan hasil panen reguler' },
    { id: 'distribusi', label: 'Distribusi & Logistik Pemasaran', desc: 'Jaringan agen, reseller, atau pengiriman hasil laut' },
    { id: 'investasi', label: 'Investasi & Permodalan Usaha', desc: 'Kemitraan bagi hasil atau permodalan fasilitas farm' },
    { id: 'teknologi', label: 'Adopsi Teknologi & Alat Budidaya', desc: 'Penerapan alat ukur IoT, bioflok, atau formulasi pakan' },
    { id: 'penelitian', label: 'Penelitian & Uji Coba Lapangan', desc: 'Kolaborasi riset akademik, uji coba strain atau pakan' },
    { id: 'lainnya', label: 'Bentuk Kerja Sama Lainnya', desc: 'Kemitraan di luar kategori di atas' },
];

export default function Step5NetworkProfile({
    data = {},
    onChange,
    provinces = [],
    errors = {},
}: Step5Props) {
    const [selectedProvinceId, setSelectedProvinceId] = useState<string>('');

    const distributionAreas = Array.isArray(data.distribution_areas) ? data.distribution_areas : [];
    const cooperationTypes = Array.isArray(data.cooperation_types) ? data.cooperation_types : [];
    const isOtherCooperation = cooperationTypes.includes('lainnya');

    const handleFieldChange = (field: string, value: any) => {
        onChange({
            ...data,
            [field]: value,
        });
    };

    const handleAddProvince = (provName: string) => {
        if (!provName || distributionAreas.includes(provName)) return;
        handleFieldChange('distribution_areas', [...distributionAreas, provName]);
        setSelectedProvinceId('');
    };

    const handleRemoveProvince = (provName: string) => {
        handleFieldChange('distribution_areas', distributionAreas.filter((p) => p !== provName));
    };

    const handleToggleCooperation = (typeId: string) => {
        if (cooperationTypes.includes(typeId)) {
            handleFieldChange('cooperation_types', cooperationTypes.filter((t) => t !== typeId));
        } else {
            handleFieldChange('cooperation_types', [...cooperationTypes, typeId]);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header / Subjudul */}
            <div className="border-b border-border/60 pb-3 flex items-start justify-between gap-4">
                <div>
                    <h3 className="text-base font-semibold text-foreground">Jaringan dan Aktivitas Bisnis</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Lengkapi informasi pemasaran, wilayah distribusi, dan jenis kemitraan yang Anda harapkan. Seluruh kolom bersifat opsional.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                {/* Kartu 1: Pemasaran & Wilayah Distribusi */}
                <div className="bg-card rounded-2xl border border-border/60 p-5 space-y-4 shadow-sm">
                    <div className="flex items-center gap-2 pb-2 border-b border-border/40">
                        <Share2 className="w-4 h-4 text-primary" />
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Pemasaran & Wilayah Distribusi
                        </h4>
                    </div>

                    {/* Informasi Pemasaran */}
                    <div>
                        <label className="block text-xs font-medium text-foreground mb-1.5">
                            Saluran & Cara Pemasaran
                        </label>
                        <textarea
                            rows={3}
                            maxLength={2000}
                            value={data.marketing_info || ''}
                            onChange={(e) => handleFieldChange('marketing_info', e.target.value)}
                            placeholder="Contoh: Menjual langsung ke pasar induk, agen pengepul lokal, restoran seafood, atau ekspor melalui perantara..."
                            className="w-full text-xs rounded-xl border border-border bg-background p-3 text-foreground placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                        />
                        {errors.marketing_info && (
                            <p className="text-xs text-danger mt-1">{errors.marketing_info}</p>
                        )}
                    </div>

                    {/* Wilayah Distribusi (Multi-Select Provinsi dengan Chip) */}
                    <div>
                        <label className="block text-xs font-medium text-foreground mb-1.5">
                            Wilayah Jangkauan / Distribusi (Provinsi)
                        </label>

                        <div className="flex gap-2 mb-2">
                            <select
                                value={selectedProvinceId}
                                onChange={(e) => {
                                    const prov = provinces.find((p) => String(p.id) === e.target.value);
                                    if (prov) {
                                        handleAddProvince(prov.name);
                                    }
                                }}
                                className="w-full text-xs rounded-xl border border-border bg-background px-3 py-2 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                            >
                                <option value="">+ Pilih Provinsi Distribusi</option>
                                {provinces
                                    .filter((p) => !distributionAreas.includes(p.name))
                                    .map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.name}
                                        </option>
                                    ))}
                            </select>
                        </div>

                        {/* Chip Daftar Provinsi Terpilih */}
                        {distributionAreas.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                                {distributionAreas.map((provName) => (
                                    <span
                                        key={provName}
                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-medium border border-primary/20"
                                    >
                                        <MapPin className="w-3 h-3" />
                                        <span>{provName}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveProvince(provName)}
                                            className="hover:text-danger p-0.5 rounded transition-colors"
                                            title={`Hapus ${provName}`}
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-[11px] text-muted-foreground italic">
                                Belum ada wilayah distribusi yang dipilih. Pilih provinsi dari dropdown di atas.
                            </p>
                        )}
                    </div>

                    {/* Kebutuhan Pasokan */}
                    <div>
                        <label className="block text-xs font-medium text-foreground mb-1.5">
                            Kebutuhan Pasokan Bahan Baku / Sarana (Opsional)
                        </label>
                        <textarea
                            rows={2}
                            maxLength={2000}
                            value={data.supply_needs || ''}
                            onChange={(e) => handleFieldChange('supply_needs', e.target.value)}
                            placeholder="Contoh: Membutuhkan suplai rutin benih ikan nila 5-7 cm bersertifikat 30.000 ekor per bulan..."
                            className="w-full text-xs rounded-xl border border-border bg-background p-3 text-foreground placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                        />
                        {errors.supply_needs && (
                            <p className="text-xs text-danger mt-1">{errors.supply_needs}</p>
                        )}
                    </div>
                </div>

                {/* Kartu 2: Peluang Kerja Sama & Kegiatan Profesional */}
                <div className="bg-card rounded-2xl border border-border/60 p-5 space-y-4 shadow-sm">
                    <div className="flex items-center gap-2 pb-2 border-b border-border/40">
                        <Handshake className="w-4 h-4 text-primary" />
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Peluang Kerja Sama & Aktivitas
                        </h4>
                    </div>

                    {/* Checkbox Jenis Kerja Sama */}
                    <div>
                        <label className="block text-xs font-medium text-foreground mb-2">
                            Jenis Kerja Sama yang Diminati
                        </label>

                        <div className="space-y-2">
                            {COOPERATION_OPTIONS.map((item) => {
                                const isChecked = cooperationTypes.includes(item.id);
                                return (
                                    <div
                                        key={item.id}
                                        onClick={() => handleToggleCooperation(item.id)}
                                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                                            isChecked
                                                ? 'border-primary/50 bg-primary/5 shadow-2xs'
                                                : 'border-border/60 bg-background hover:bg-muted/30'
                                        }`}
                                    >
                                        <div className="mt-0.5 shrink-0 text-primary">
                                            {isChecked ? (
                                                <CheckSquare className="w-4 h-4 text-primary" />
                                            ) : (
                                                <Square className="w-4 h-4 text-muted-foreground" />
                                            )}
                                        </div>
                                        <div>
                                            <span className="block text-xs font-semibold text-foreground">
                                                {item.label}
                                            </span>
                                            <span className="text-[11px] text-muted-foreground">
                                                {item.desc}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Input Isian jika Kerja Sama Lainnya */}
                    <AnimatePresence>
                        {isOtherCooperation && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden pt-1"
                            >
                                <label className="block text-xs font-medium text-foreground mb-1">
                                    Sebutkan Bentuk Kerja Sama Lainnya
                                </label>
                                <input
                                    type="text"
                                    value={data.cooperation_types_custom || ''}
                                    onChange={(e) => handleFieldChange('cooperation_types_custom', e.target.value)}
                                    placeholder="Contoh: Penyerapan limbah perikanan, sewa cold storage..."
                                    className="w-full text-xs rounded-xl border border-border bg-background px-3 py-2 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Kegiatan Profesional */}
                    <div>
                        <label className="block text-xs font-medium text-foreground mb-1.5">
                            Kegiatan Profesional / Komunitas yang Dijalankan
                        </label>
                        <textarea
                            rows={3}
                            maxLength={2000}
                            value={data.professional_activities || ''}
                            onChange={(e) => handleFieldChange('professional_activities', e.target.value)}
                            placeholder="Contoh: Aktif di kelompok pembudidaya ikan daerah, pembicara seminar budidaya air tawar..."
                            className="w-full text-xs rounded-xl border border-border bg-background p-3 text-foreground placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                        />
                        {errors.professional_activities && (
                            <p className="text-xs text-danger mt-1">{errors.professional_activities}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
