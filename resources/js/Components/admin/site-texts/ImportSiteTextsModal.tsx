import { cx } from '@/lib/cx';
import { focusRing } from '@/lib/ui';
import axios from 'axios';
import {
    AlertTriangle,
    CheckCircle2,
    Loader2,
    Upload,
    X,
} from 'lucide-react';
import { useState, type ChangeEvent } from 'react';
import { toast } from 'sonner';

interface ImportPreviewItem {
    key: string;
    label: string;
    locale: string;
    oldValue: string | null;
    newValue: string | null;
    status: 'valid' | 'unchanged' | 'warning';
    warnings: string[];
}

interface ImportPreviewSummary {
    total: number;
    applicable: number;
    warnings: number;
    unchanged: number;
}

interface ImportSiteTextsModalProps {
    open: boolean;
    onClose: () => void;
    onApplied: () => void;
}

export default function ImportSiteTextsModal({
    open,
    onClose,
    onApplied,
}: ImportSiteTextsModalProps) {
    const [loadingPreview, setLoadingPreview] = useState(false);
    const [applying, setApplying] = useState(false);
    const [rawItems, setRawItems] = useState<Array<{ key: string; value: string | null; locale?: string }>>([]);
    const [previewItems, setPreviewItems] = useState<ImportPreviewItem[]>([]);
    const [summary, setSummary] = useState<ImportPreviewSummary | null>(null);
    const [error, setError] = useState<string | null>(null);

    if (!open) return null;

    const resetState = () => {
        setRawItems([]);
        setPreviewItems([]);
        setSummary(null);
        setError(null);
    };

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setError(null);
        setLoadingPreview(true);

        try {
            const text = await file.text();
            const parsed = JSON.parse(text);
            const items = Array.isArray(parsed) ? parsed : parsed?.items;
            if (!Array.isArray(items)) {
                throw new Error('Format JSON harus berupa array atau objek dengan kunci "items".');
            }

            setRawItems(items);

            const res = await axios.post(
                '/admin/teks-website/impor/pratinjau',
                { items },
                { headers: { Accept: 'application/json' } }
            );

            setPreviewItems(res.data.items ?? []);
            setSummary(res.data.summary ?? null);
        } catch (err: unknown) {
            const msg =
                err instanceof Error
                    ? err.message
                    : 'Berkas JSON tidak dapat dibaca.';
            setError(msg);
            setPreviewItems([]);
            setSummary(null);
        } finally {
            setLoadingPreview(false);
        }
    };

    const handleApply = async () => {
        if (rawItems.length === 0 || !summary || summary.applicable === 0) return;
        setApplying(true);
        setError(null);

        try {
            const res = await axios.post(
                '/admin/teks-website/impor/terapkan',
                { items: rawItems },
                { headers: { Accept: 'application/json' } }
            );
            toast.success(res.data.message || 'Impor teks berhasil diterapkan.');
            resetState();
            onApplied();
            onClose();
        } catch {
            setError('Gagal menerapkan impor teks.');
            toast.error('Gagal menerapkan impor teks.');
        } finally {
            setApplying(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="fixed inset-0 bg-ink/50"
                onClick={onClose}
                aria-hidden="true"
            />
            <div
                role="dialog"
                aria-modal="true"
                aria-label="Impor Teks Website"
                className="relative z-10 flex max-h-[88vh] w-full max-w-3xl flex-col rounded-card border border-line bg-white shadow-lift"
            >
                <div className="flex items-center justify-between border-b border-line px-5 py-4">
                    <div>
                        <h2 className="font-display text-lg font-bold text-navy">
                            Impor Teks Website (JSON)
                        </h2>
                        <p className="text-xs text-slate">
                            Unggah berkas ekspor JSON untuk melihat pratinjau perbedaan sebelum diterapkan.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => {
                            resetState();
                            onClose();
                        }}
                        aria-label="Tutup dialog impor"
                        className={cx(
                            'inline-flex h-9 w-9 items-center justify-center rounded-control text-slate hover:bg-mist hover:text-navy',
                            focusRing
                        )}
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    <label className="flex cursor-pointer flex-col items-center justify-center rounded-card border-2 border-dashed border-line bg-mist/40 px-4 py-6 text-center transition-colors hover:border-ocean">
                        <Upload className="h-6 w-6 text-ocean" />
                        <span className="mt-2 text-sm font-semibold text-navy">
                            Pilih berkas JSON hasil ekspor
                        </span>
                        <span className="mt-0.5 text-xs text-slate">
                            Format: {'{ "items": [{ "key": "...", "value": "...", "locale": "id" }] }'}
                        </span>
                        <input
                            type="file"
                            accept=".json,application/json"
                            onChange={(e) => void handleFileChange(e)}
                            className="sr-only"
                        />
                    </label>

                    {loadingPreview ? (
                        <div className="flex items-center justify-center gap-2 py-6 text-xs text-slate">
                            <Loader2 className="h-4 w-4 animate-spin text-ocean" />
                            <span>Memeriksa perbedaan teks...</span>
                        </div>
                    ) : null}

                    {error ? (
                        <div
                            role="alert"
                            className="rounded-control border border-danger/30 bg-rose-50 px-3.5 py-2.5 text-xs text-danger"
                        >
                            {error}
                        </div>
                    ) : null}

                    {summary ? (
                        <div className="space-y-3">
                            <div className="flex flex-wrap items-center gap-2 text-xs">
                                <span className="rounded-full bg-mist px-3 py-1 font-semibold text-navy">
                                    Total: {summary.total}
                                </span>
                                <span className="rounded-full bg-emerald-50 px-3 py-1 font-semibold text-emerald-700">
                                    Siap diterapkan: {summary.applicable}
                                </span>
                                <span className="rounded-full bg-slate/10 px-3 py-1 font-semibold text-slate">
                                    Tidak berubah: {summary.unchanged}
                                </span>
                                {summary.warnings > 0 ? (
                                    <span className="rounded-full bg-rose-50 px-3 py-1 font-semibold text-danger">
                                        Peringatan (dilewati): {summary.warnings}
                                    </span>
                                ) : null}
                            </div>

                            <div className="overflow-x-auto rounded-control border border-line">
                                <table className="w-full text-left text-xs">
                                    <thead className="border-b border-line bg-mist/60 text-navy">
                                        <tr>
                                            <th className="px-3 py-2 font-bold">Key</th>
                                            <th className="px-3 py-2 font-bold">Nilai Lama</th>
                                            <th className="px-3 py-2 font-bold">Nilai Baru</th>
                                            <th className="px-3 py-2 font-bold">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-line">
                                        {previewItems.map((item, idx) => (
                                            <tr key={`${item.key}-${idx}`} className="align-top">
                                                <td className="px-3 py-2 font-mono text-[11px] text-navy">
                                                    {item.key}
                                                </td>
                                                <td className="px-3 py-2 text-slate max-w-[200px] break-words">
                                                    {item.oldValue ?? '-'}
                                                </td>
                                                <td className="px-3 py-2 text-ink max-w-[200px] break-words">
                                                    {item.newValue ?? '(Reset ke default)'}
                                                </td>
                                                <td className="px-3 py-2">
                                                    {item.status === 'valid' ? (
                                                        <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                                            Siap impor
                                                        </span>
                                                    ) : item.status === 'unchanged' ? (
                                                        <span className="text-slate">Sama</span>
                                                    ) : (
                                                        <div className="space-y-0.5 text-danger">
                                                            {item.warnings.map((w, i) => (
                                                                <p
                                                                    key={i}
                                                                    className="flex items-start gap-1"
                                                                >
                                                                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                                                                    <span>{w}</span>
                                                                </p>
                                                            ))}
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : null}
                </div>

                <div className="flex items-center justify-end gap-2 border-t border-line px-5 py-3.5">
                    <button
                        type="button"
                        onClick={() => {
                            resetState();
                            onClose();
                        }}
                        className={cx(
                            'inline-flex h-9 items-center rounded-control border border-line bg-white px-4 text-xs font-semibold text-navy hover:bg-mist',
                            focusRing
                        )}
                    >
                        Batal
                    </button>
                    <button
                        type="button"
                        disabled={applying || !summary || summary.applicable === 0}
                        onClick={() => void handleApply()}
                        className={cx(
                            'inline-flex h-9 items-center gap-2 rounded-control bg-ocean px-4 text-xs font-bold text-white hover:bg-navy disabled:cursor-not-allowed disabled:opacity-45',
                            focusRing
                        )}
                    >
                        {applying ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : null}
                        <span>
                            Terapkan {summary?.applicable ?? 0} Perubahan
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
}
