import React from 'react';
import { Plus, Trash2, ShieldCheck, AlertCircle, FileText } from 'lucide-react';

export interface LegalDocumentItem {
    id?: number;
    type: 'nib' | 'npwp' | 'cbib' | 'other' | string;
    number: string;
    label?: string;
    issued_at?: string;
    expires_at?: string;
    file_path?: string | null;
    file_url?: string | null;
}

interface LegalDocumentRepeaterProps {
    documents: LegalDocumentItem[];
    onChange: (docs: LegalDocumentItem[]) => void;
    category?: string;
    requiredLegalities?: Record<string, string[]>;
    errors?: Record<string, string>;
    disabled?: boolean;
}

const TYPE_OPTIONS = [
    { value: 'nib', label: 'NIB (Nomor Induk Berusaha)' },
    { value: 'npwp', label: 'NPWP Usaha / Badan' },
    { value: 'cbib', label: 'Sertifikat CBIB / CPIB / CDOB' },
    { value: 'other', label: 'Izin Lainnya' },
];

export default function LegalDocumentRepeater({
    documents = [],
    onChange,
    category = '',
    requiredLegalities = {},
    errors = {},
    disabled = false,
}: LegalDocumentRepeaterProps) {
    const categoryRequiredTypes = category && requiredLegalities[category]
        ? requiredLegalities[category]
        : [];

    const handleAdd = () => {
        const newDoc: LegalDocumentItem = {
            type: 'nib',
            number: '',
            label: '',
            issued_at: '',
            expires_at: '',
        };
        onChange([...documents, newDoc]);
    };

    const handleRemove = (index: number) => {
        const next = documents.filter((_, i) => i !== index);
        onChange(next);
    };

    const handleUpdate = (index: number, field: keyof LegalDocumentItem, value: any) => {
        const next = [...documents];
        next[index] = {
            ...next[index],
            [field]: value,
        };
        onChange(next);
    };

    return (
        <div className="space-y-4">
            {categoryRequiredTypes.length > 0 && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200">
                    <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                        <span className="font-semibold">Ketentuan Kategori ({category}):</span> Berdasarkan kategori kegiatan yang Anda pilih, dokumen izin <strong>{categoryRequiredTypes.map((t) => t.toUpperCase()).join(', ')}</strong> wajib diisi nomornya.
                    </div>
                </div>
            )}

            {documents.length === 0 ? (
                <div className="text-center py-6 px-4 rounded-xl border border-dashed border-border/80 bg-muted/20">
                    <FileText className="w-8 h-8 text-muted-foreground/60 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground mb-3">
                        Belum ada dokumen izin yang dicatat. Tambahkan NIB, NPWP, sertifikat CBIB, atau izin lainnya.
                    </p>
                    <button
                        type="button"
                        onClick={handleAdd}
                        disabled={disabled}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/95 transition-colors shadow-sm disabled:opacity-50"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Tambah Izin Legalitas
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {documents.map((doc, idx) => {
                        const isMandatory = categoryRequiredTypes.includes(doc.type);
                        const typeError = errors[`legal_documents.${idx}.type`];
                        const numberError = errors[`legal_documents.${idx}.number`];
                        const labelError = errors[`legal_documents.${idx}.label`];

                        return (
                            <div
                                key={idx}
                                className="p-4 rounded-xl border border-border/70 bg-card shadow-sm hover:border-border transition-colors space-y-3 relative group"
                            >
                                <div className="flex items-center justify-between pb-2 border-b border-border/40">
                                    <div className="flex items-center gap-2">
                                        <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[11px] font-bold flex items-center justify-center">
                                            {idx + 1}
                                        </span>
                                        <span className="text-xs font-semibold text-foreground">
                                            Izin #{idx + 1}
                                        </span>
                                        {isMandatory && (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 text-[10px] font-medium">
                                                <ShieldCheck className="w-3 h-3" />
                                                Wajib ({category})
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleRemove(idx)}
                                        disabled={disabled}
                                        className="text-muted-foreground hover:text-danger p-1 rounded-md transition-colors"
                                        title="Hapus izin ini"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-foreground mb-1">
                                            Jenis Dokumen Izin <span className="text-danger">*</span>
                                        </label>
                                        <select
                                            value={doc.type}
                                            onChange={(e) => handleUpdate(idx, 'type', e.target.value)}
                                            disabled={disabled}
                                            className="w-full text-xs rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                                        >
                                            {TYPE_OPTIONS.map((opt) => (
                                                <option key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                </option>
                                            ))}
                                        </select>
                                        {typeError && (
                                            <p className="text-[11px] text-danger mt-1">{typeError}</p>
                                        )}
                                    </div>

                                    {doc.type === 'other' ? (
                                        <div>
                                            <label className="block text-xs font-medium text-foreground mb-1">
                                                Nama / Label Izin <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={doc.label || ''}
                                                onChange={(e) => handleUpdate(idx, 'label', e.target.value)}
                                                placeholder="Contoh: SIUP Perikanan, Izin Lokasi Perairan"
                                                disabled={disabled}
                                                className="w-full text-xs rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                                            />
                                            {labelError && (
                                                <p className="text-[11px] text-danger mt-1">{labelError}</p>
                                            )}
                                        </div>
                                    ) : (
                                        <div>
                                            <label className="block text-xs font-medium text-foreground mb-1">
                                                Nomor Dokumen / Surat <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={doc.number || ''}
                                                onChange={(e) => handleUpdate(idx, 'number', e.target.value)}
                                                placeholder={doc.type === 'nib' ? 'Contoh: 1234567890123' : 'Nomor dokumen'}
                                                disabled={disabled}
                                                className="w-full text-xs rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors font-mono"
                                            />
                                            {numberError && (
                                                <p className="text-[11px] text-danger mt-1">{numberError}</p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {doc.type === 'other' && (
                                    <div>
                                        <label className="block text-xs font-medium text-foreground mb-1">
                                            Nomor Dokumen <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={doc.number || ''}
                                            onChange={(e) => handleUpdate(idx, 'number', e.target.value)}
                                            placeholder="Nomor dokumen izin"
                                            disabled={disabled}
                                            className="w-full text-xs rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors font-mono"
                                        />
                                        {numberError && (
                                            <p className="text-[11px] text-danger mt-1">{numberError}</p>
                                        )}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                    <div>
                                        <label className="block text-xs font-medium text-muted-foreground mb-1">
                                            Tanggal Terbit (Opsional)
                                        </label>
                                        <input
                                            type="date"
                                            value={doc.issued_at || ''}
                                            onChange={(e) => handleUpdate(idx, 'issued_at', e.target.value)}
                                            disabled={disabled}
                                            className="w-full text-xs rounded-lg border border-border bg-background px-3 py-1.5 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-muted-foreground mb-1">
                                            Berlaku Sampai (Opsional)
                                        </label>
                                        <input
                                            type="date"
                                            value={doc.expires_at || ''}
                                            onChange={(e) => handleUpdate(idx, 'expires_at', e.target.value)}
                                            disabled={disabled}
                                            className="w-full text-xs rounded-lg border border-border bg-background px-3 py-1.5 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    <div className="flex justify-between items-center pt-2">
                        <button
                            type="button"
                            onClick={handleAdd}
                            disabled={disabled}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border/80 bg-background hover:bg-muted text-foreground transition-colors shadow-sm disabled:opacity-50"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            Tambah Izin Lain
                        </button>
                        <p className="text-[11px] text-muted-foreground">
                            Berkas dokumen fisik/PDF akan diunggah pada Langkah 7.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
