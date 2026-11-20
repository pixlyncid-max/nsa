import React from 'react';
import { Plus, Trash2, Fish, AlertCircle, Sparkles, Check, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface ActivityItem {
    id?: number;
    fish_category_id?: number | string;
    farming_system?: string;
    pond_count?: number | string;
    production_amount?: number | string;
    production_unit?: string;
    period?: string;
    seed_need?: string;
    feed_need?: string;
    purchase_capacity?: string;
    notes?: string;
    [key: string]: any;
}

export interface ActivityFieldConfig {
    label: string;
    type: 'select_fish' | 'select' | 'number' | 'number_unit_period' | 'text' | 'textarea';
    options?: string[];
    units?: string[];
    periods?: string[];
    default_unit?: string;
    default_period?: string;
    placeholder?: string;
    required?: boolean;
    unit?: string;
}

export interface CategoryActivityConfig {
    title?: string;
    description?: string;
    is_skippable?: boolean;
    fields?: Record<string, ActivityFieldConfig>;
}

interface DynamicActivityFormProps {
    activities: ActivityItem[];
    onChange: (activities: ActivityItem[]) => void;
    config: CategoryActivityConfig;
    fishCategories?: Array<{ id: number; name: string; slug: string }>;
    errors?: Record<string, string>;
    disabled?: boolean;
    onSkip?: () => void;
    categoryName?: string;
}

export default function DynamicActivityForm({
    activities = [],
    onChange,
    config,
    fishCategories = [],
    errors = {},
    disabled = false,
    onSkip,
    categoryName = '',
}: DynamicActivityFormProps) {
    const fields = config?.fields || {};
    const fieldKeys = Object.keys(fields);
    const isSkippable = config?.is_skippable || fieldKeys.length === 0;

    const handleAdd = () => {
        const newItem: ActivityItem = {
            fish_category_id: fishCategories[0]?.id || '',
            farming_system: fields.farming_system?.options?.[0] || '',
            pond_count: '',
            production_amount: '',
            production_unit: fields.production_amount?.default_unit || 'ton',
            period: fields.production_amount?.default_period || 'per siklus',
            seed_need: '',
            feed_need: '',
            purchase_capacity: '',
            notes: '',
        };
        onChange([...activities, newItem]);
    };

    const handleRemove = (index: number) => {
        const next = activities.filter((_, i) => i !== index);
        onChange(next);
    };

    const handleItemChange = (index: number, key: string, value: any) => {
        const next = [...activities];
        next[index] = {
            ...next[index],
            [key]: value,
        };
        onChange(next);
    };

    // Jika kategori tidak memiliki field aktivitas perikanan (mis. Akademisi, Konsultan)
    if (isSkippable && activities.length === 0) {
        return (
            <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 p-8 text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                    <Sparkles className="w-6 h-6" />
                </div>
                <div className="max-w-md mx-auto space-y-1">
                    <h4 className="text-sm font-semibold text-foreground">
                        Langkah Ini Tidak Wajib untuk Kategori Anda
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        Berdasarkan kategori yang Anda pilih ({categoryName || 'profesional/umum'}), data teknis aktivitas budidaya perikanan tidak diwajibkan dan dapat dilewati langsung.
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                    {onSkip && (
                        <button
                            type="button"
                            onClick={onSkip}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-sm"
                        >
                            <span>Lewati Langkah Ini</span>
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={handleAdd}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-medium border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Tetap Isi Data Komoditas
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {errors.activities && (
                <div className="p-3.5 rounded-xl bg-danger/10 border border-danger/20 text-xs text-danger flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errors.activities}</span>
                </div>
            )}

            <AnimatePresence initial={false}>
                {activities.map((act, index) => (
                    <motion.div
                        key={act.id ? `act-${act.id}` : `act-idx-${index}`}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                        className="p-5 rounded-2xl border border-border/70 bg-card shadow-sm space-y-4 relative group"
                    >
                        <div className="flex items-center justify-between pb-3 border-b border-border/40">
                            <div className="flex items-center gap-2.5">
                                <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                                    {index + 1}
                                </span>
                                <span className="text-xs font-semibold text-foreground">
                                    Komoditas #{index + 1}
                                </span>
                            </div>

                            {activities.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => handleRemove(index)}
                                    disabled={disabled}
                                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-danger p-1 rounded-md transition-colors"
                                    title="Hapus komoditas ini"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Hapus</span>
                                </button>
                            )}
                        </div>

                        {/* Grid Field Dinamis Berdasarkan Konfigurasi Kategori */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {fieldKeys.map((key) => {
                                const field = fields[key];
                                const errorKey = `activities.${index}.${key}`;
                                const errorMsg = errors[errorKey];

                                // 1. Select Kategori Ikan
                                if (field.type === 'select_fish') {
                                    return (
                                        <div key={key}>
                                            <label className="block text-xs font-medium text-foreground mb-1.5">
                                                {field.label} {field.required && <span className="text-danger">*</span>}
                                            </label>
                                            <select
                                                value={act.fish_category_id || ''}
                                                onChange={(e) => handleItemChange(index, key, e.target.value)}
                                                disabled={disabled}
                                                className="w-full text-xs rounded-xl border border-border bg-background px-3 py-2.5 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                                            >
                                                <option value="">Pilih Jenis Ikan / Komoditas</option>
                                                {fishCategories.map((fish) => (
                                                    <option key={fish.id} value={fish.id}>
                                                        {fish.name}
                                                    </option>
                                                ))}
                                            </select>
                                            {errorMsg && <p className="text-xs text-danger mt-1">{errorMsg}</p>}
                                        </div>
                                    );
                                }

                                // 2. Select Biasa (Sistem Budidaya, dsb)
                                if (field.type === 'select') {
                                    return (
                                        <div key={key}>
                                            <label className="block text-xs font-medium text-foreground mb-1.5">
                                                {field.label} {field.required && <span className="text-danger">*</span>}
                                            </label>
                                            <select
                                                value={act[key] || ''}
                                                onChange={(e) => handleItemChange(index, key, e.target.value)}
                                                disabled={disabled}
                                                className="w-full text-xs rounded-xl border border-border bg-background px-3 py-2.5 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                                            >
                                                <option value="">Pilih {field.label}</option>
                                                {field.options?.map((opt) => (
                                                    <option key={opt} value={opt}>
                                                        {opt}
                                                    </option>
                                                ))}
                                            </select>
                                            {errorMsg && <p className="text-xs text-danger mt-1">{errorMsg}</p>}
                                        </div>
                                    );
                                }

                                // 3. Number Biasa (Jumlah Kolam)
                                if (field.type === 'number') {
                                    return (
                                        <div key={key}>
                                            <label className="block text-xs font-medium text-foreground mb-1.5">
                                                {field.label} {field.required && <span className="text-danger">*</span>}
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    min={0}
                                                    value={act[key] ?? ''}
                                                    onChange={(e) => handleItemChange(index, key, e.target.value)}
                                                    placeholder={field.placeholder || '0'}
                                                    disabled={disabled}
                                                    className="w-full text-xs rounded-xl border border-border bg-background px-3 py-2.5 text-foreground font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                                                />
                                                {field.unit && (
                                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground pointer-events-none">
                                                        {field.unit}
                                                    </span>
                                                )}
                                            </div>
                                            {errorMsg && <p className="text-xs text-danger mt-1">{errorMsg}</p>}
                                        </div>
                                    );
                                }

                                // 4. Angka + Satuan + Periode (Produksi / Serapan Pembelian)
                                if (field.type === 'number_unit_period') {
                                    const units = field.units || ['ton', 'kg'];
                                    const periods = field.periods || ['per siklus', 'per bulan', 'per tahun'];

                                    return (
                                        <div key={key} className="md:col-span-2">
                                            <label className="block text-xs font-medium text-foreground mb-1.5">
                                                {field.label} {field.required && <span className="text-danger">*</span>}
                                            </label>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                                <div className="sm:col-span-1">
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        min={0}
                                                        value={act[key] ?? ''}
                                                        onChange={(e) => handleItemChange(index, key, e.target.value)}
                                                        placeholder="Nilai angka"
                                                        disabled={disabled}
                                                        className="w-full text-xs rounded-xl border border-border bg-background px-3 py-2.5 text-foreground font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                                                    />
                                                </div>
                                                <div>
                                                    <select
                                                        value={act.production_unit || units[0]}
                                                        onChange={(e) => handleItemChange(index, 'production_unit', e.target.value)}
                                                        disabled={disabled}
                                                        className="w-full text-xs rounded-xl border border-border bg-background px-3 py-2.5 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                                                    >
                                                        {units.map((u) => (
                                                            <option key={u} value={u}>
                                                                Satuan: {u}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <select
                                                        value={act.period || periods[0]}
                                                        onChange={(e) => handleItemChange(index, 'period', e.target.value)}
                                                        disabled={disabled}
                                                        className="w-full text-xs rounded-xl border border-border bg-background px-3 py-2.5 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                                                    >
                                                        {periods.map((p) => (
                                                            <option key={p} value={p}>
                                                                {p}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                            {errorMsg && <p className="text-xs text-danger mt-1">{errorMsg}</p>}
                                        </div>
                                    );
                                }

                                // 5. Text Input (Kebutuhan Benih, Kebutuhan Pakan, dsb)
                                if (field.type === 'text') {
                                    return (
                                        <div key={key}>
                                            <label className="block text-xs font-medium text-foreground mb-1.5">
                                                {field.label} {field.required && <span className="text-danger">*</span>}
                                            </label>
                                            <input
                                                type="text"
                                                value={act[key] || ''}
                                                onChange={(e) => handleItemChange(index, key, e.target.value)}
                                                placeholder={field.placeholder || ''}
                                                disabled={disabled}
                                                className="w-full text-xs rounded-xl border border-border bg-background px-3 py-2.5 text-foreground placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                                            />
                                            {errorMsg && <p className="text-xs text-danger mt-1">{errorMsg}</p>}
                                        </div>
                                    );
                                }

                                // 6. Textarea (Catatan)
                                if (field.type === 'textarea') {
                                    return (
                                        <div key={key} className="md:col-span-2">
                                            <label className="block text-xs font-medium text-foreground mb-1.5">
                                                {field.label} {field.required && <span className="text-danger">*</span>}
                                            </label>
                                            <textarea
                                                rows={2}
                                                maxLength={500}
                                                value={act[key] || ''}
                                                onChange={(e) => handleItemChange(index, key, e.target.value)}
                                                placeholder={field.placeholder || ''}
                                                disabled={disabled}
                                                className="w-full text-xs rounded-xl border border-border bg-background p-3 text-foreground placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                                            />
                                            {errorMsg && <p className="text-xs text-danger mt-1">{errorMsg}</p>}
                                        </div>
                                    );
                                }

                                return null;
                            })}
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>

            {/* Tombol Tambah Komoditas Lain */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <button
                    type="button"
                    onClick={handleAdd}
                    disabled={disabled}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium border border-border/80 bg-background hover:bg-muted text-foreground transition-colors shadow-sm disabled:opacity-50"
                >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Komoditas Lain</span>
                </button>

                {isSkippable && onSkip && (
                    <button
                        type="button"
                        onClick={onSkip}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Lewati langkah ini
                    </button>
                )}
            </div>
        </div>
    );
}
