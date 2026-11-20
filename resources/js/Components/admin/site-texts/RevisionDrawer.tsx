import type { SiteTextRevisionItem } from '@/Components/admin/site-texts/types';
import { cx } from '@/lib/cx';
import { focusRing } from '@/lib/ui';
import axios from 'axios';
import { AlertCircle, ArrowRight, History, Loader2, RotateCcw, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface RevisionDrawerProps {
    activeKey: string | null;
    activeLabel: string;
    onClose: () => void;
    onRestored: (key: string, restoredValue: string, isChanged: boolean) => void;
}

export default function RevisionDrawer({
    activeKey,
    activeLabel,
    onClose,
    onRestored,
}: RevisionDrawerProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [revisions, setRevisions] = useState<SiteTextRevisionItem[]>([]);
    const [defaultValue, setDefaultValue] = useState('');
    const [defaultEnValue, setDefaultEnValue] = useState('');
    const [restoringId, setRestoringId] = useState<number | null>(null);

    useEffect(() => {
        if (!activeKey) return;

        let cancelled = false;

        (async () => {
            await Promise.resolve();
            if (cancelled) return;
            setLoading(true);
            setError(null);

            try {
                const res = await axios.get(
                    `/admin/teks-website/${encodeURIComponent(activeKey)}/riwayat`,
                    { headers: { Accept: 'application/json' } }
                );
                if (cancelled) return;
                setRevisions(res.data.revisions ?? []);
                setDefaultValue(res.data.default ?? '');
                setDefaultEnValue(res.data.defaultEn ?? res.data.default ?? '');
            } catch {
                if (cancelled) return;
                setError('Gagal memuat riwayat perubahan. Silakan coba lagi.');
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [activeKey]);

    useEffect(() => {
        if (!activeKey) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [activeKey, onClose]);

    if (!activeKey) {
        return null;
    }

    const handleRestore = async (revisionId: number) => {
        setRestoringId(revisionId);
        try {
            const res = await axios.post(
                `/admin/teks-website/revisi/${revisionId}/pulihkan`,
                {},
                { headers: { Accept: 'application/json' } }
            );
            toast.success(res.data.message || 'Versi teks berhasil dipulihkan.');
            onRestored(activeKey, res.data.value ?? defaultValue, Boolean(res.data.isChanged));
            onClose();
        } catch {
            toast.error('Gagal memulihkan versi teks.');
        } finally {
            setRestoringId(null);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div
                className="fixed inset-0 bg-ink/40"
                onClick={onClose}
                aria-hidden="true"
            />
            <aside
                role="dialog"
                aria-modal="true"
                aria-label={`Riwayat perubahan ${activeLabel}`}
                className="relative z-10 flex h-full w-full max-w-md flex-col bg-white shadow-lift"
            >
                <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 text-navy">
                            <History className="h-4 w-4 text-ocean shrink-0" />
                            <h2 className="font-display text-base font-bold truncate">
                                Riwayat Perubahan
                            </h2>
                        </div>
                        <p className="mt-0.5 text-xs font-semibold text-ink truncate">
                            {activeLabel}
                        </p>
                        <p className="font-mono text-[11px] text-slate truncate">
                            {activeKey}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Tutup riwayat"
                        className={cx(
                            'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-control text-slate hover:bg-mist hover:text-navy',
                            focusRing
                        )}
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-5">
                    {loading ? (
                        <div className="space-y-3" aria-busy="true">
                            {[1, 2, 3].map((idx) => (
                                <div
                                    key={idx}
                                    className="animate-pulse rounded-card border border-line p-4 space-y-2"
                                >
                                    <div className="h-3.5 w-32 rounded bg-mist" />
                                    <div className="h-3 w-full rounded bg-mist" />
                                    <div className="h-3 w-3/4 rounded bg-mist" />
                                </div>
                            ))}
                        </div>
                    ) : error ? (
                        <div className="rounded-card border border-danger/25 bg-rose-50/70 p-4 text-xs text-danger flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    ) : revisions.length === 0 ? (
                        <div className="rounded-card border border-dashed border-line bg-mist/40 p-6 text-center">
                            <History className="mx-auto h-7 w-7 text-slate/60" />
                            <p className="mt-2 text-sm font-semibold text-navy">
                                Belum ada riwayat perubahan
                            </p>
                            <p className="mt-1 text-xs text-slate">
                                Teks ini masih memakai nilai bawaan dan belum pernah diubah.
                            </p>
                        </div>
                    ) : (
                        <ol className="space-y-3">
                            {revisions.map((rev) => (
                                <li
                                    key={rev.id}
                                    className="rounded-card border border-line bg-white p-4 space-y-2.5"
                                >
                                    <div className="flex items-center justify-between gap-2 text-xs">
                                        <div className="flex items-center gap-1.5">
                                            <span
                                                className={cx(
                                                    'rounded px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase',
                                                    rev.locale === 'en'
                                                        ? 'bg-ocean/10 text-ocean'
                                                        : 'bg-navy/10 text-navy'
                                                )}
                                            >
                                                {rev.locale || 'id'}
                                            </span>
                                            <span className="font-bold text-navy">
                                                {rev.userName}
                                            </span>
                                        </div>
                                        <span className="text-[11px] text-slate">
                                            {rev.createdAtLabel}
                                        </span>
                                    </div>

                                    <div className="space-y-1.5 text-xs">
                                        <div className="rounded bg-mist/60 px-2.5 py-1.5 text-slate">
                                            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate/80">
                                                Nilai Lama
                                            </span>
                                            <span className="break-words">
                                                {rev.oldValue ?? `(Default) ${rev.locale === 'en' ? defaultEnValue : defaultValue}`}
                                            </span>
                                        </div>

                                        <div className="flex justify-center text-slate/60">
                                            <ArrowRight className="h-3.5 w-3.5 rotate-90" />
                                        </div>

                                        <div className="rounded border border-ocean/20 bg-ocean/5 px-2.5 py-1.5 text-ink">
                                            <span className="block text-[10px] font-bold uppercase tracking-wider text-ocean">
                                                Nilai Baru
                                            </span>
                                            <span className="break-words">
                                                {rev.newValue ?? `(Reset ke default) ${rev.locale === 'en' ? defaultEnValue : defaultValue}`}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="pt-1">
                                        <button
                                            type="button"
                                            disabled={restoringId !== null}
                                            onClick={() => void handleRestore(rev.id)}
                                            className={cx(
                                                'inline-flex h-8 items-center gap-1.5 rounded-control border border-line bg-white px-3 text-xs font-semibold text-navy transition-colors hover:border-ocean hover:bg-mist disabled:opacity-50',
                                                focusRing
                                            )}
                                        >
                                            {restoringId === rev.id ? (
                                                <Loader2 className="h-3.5 w-3.5 animate-spin text-ocean" />
                                            ) : (
                                                <RotateCcw className="h-3.5 w-3.5 text-ocean" />
                                            )}
                                            <span>Pulihkan versi ini</span>
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    )}
                </div>
            </aside>
        </div>
    );
}
