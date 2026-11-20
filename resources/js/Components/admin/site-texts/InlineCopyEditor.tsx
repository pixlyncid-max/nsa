import SimpleRichTextEditor from '@/Components/admin/site-texts/SimpleRichTextEditor';
import type { SiteTextType } from '@/Components/admin/site-texts/types';
import { setCopyEditMode, useCopyEditMode } from '@/lib/copyEditMode';
import { cx } from '@/lib/cx';
import { focusRing } from '@/lib/ui';
import type { PageProps } from '@/types';
import { router, usePage } from '@inertiajs/react';
import axios from 'axios';
import {
    AlertCircle,
    ExternalLink,
    Loader2,
    PenLine,
    RotateCcw,
    Save,
    X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

interface InlineCopyMeta {
    key: string;
    locale: 'id' | 'en';
    group: string;
    groupLabel: string;
    label: string;
    hint: string;
    type: SiteTextType;
    default: string;
    value: string | null;
    currentValue: string;
    isChanged: boolean;
    isManual?: boolean;
    max: number | null;
    placeholders: string[];
}

function getEffectiveLength(type: SiteTextType, value: string): number {
    if (type === 'richtext') {
        return value.replace(/<[^>]*>/g, '').trim().length;
    }
    return value.length;
}

export default function InlineCopyEditor() {
    const pageProps = usePage<PageProps>().props;
    const pageCopy = pageProps.copy;
    const activeLocale: 'id' | 'en' =
        pageProps.locale === 'en' ||
        (typeof window !== 'undefined' &&
            (window.location.pathname === '/en' ||
                window.location.pathname.startsWith('/en/')))
            ? 'en'
            : 'id';
    const isEditMode = useCopyEditMode();

    const [activeMeta, setActiveMeta] = useState<InlineCopyMeta | null>(null);
    const [loadingKey, setLoadingKey] = useState<string | null>(null);
    const [draftValue, setDraftValue] = useState('');
    const [saving, setSaving] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);

    const triggerElRef = useRef<HTMLElement | null>(null);
    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

    const closePopover = useCallback(() => {
        setActiveMeta(null);
        setLoadingKey(null);
        setServerError(null);
        const trigger = triggerElRef.current;
        triggerElRef.current = null;
        if (trigger && document.contains(trigger)) {
            requestAnimationFrame(() => trigger.focus());
        }
    }, []);

    // Bersihkan mode edit saat unmount
    useEffect(() => {
        return () => {
            setCopyEditMode(false);
        };
    }, []);

    // Tambahkan / bersihkan atribut data-copy-key pada elemen teks di halaman saat mode edit aktif
    useEffect(() => {
        const taggedElements: HTMLElement[] = [];

        if (!isEditMode || !pageCopy) {
            return;
        }

        const valueToKey = new Map<string, string>();
        for (const [key, val] of Object.entries(pageCopy)) {
            const trimmed = val.trim();
            if (trimmed !== '' && !valueToKey.has(trimmed)) {
                valueToKey.set(trimmed, key);
            }
        }

        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            null
        );

        let currentNode: Node | null = walker.nextNode();
        while (currentNode) {
            const text = currentNode.textContent?.trim() ?? '';
            const parent = currentNode.parentElement;

            if (
                text !== '' &&
                parent &&
                !parent.closest('[data-inline-copy-ui="true"]') &&
                !parent.hasAttribute('data-copy-key') &&
                !['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(parent.tagName)
            ) {
                const matchedKey = valueToKey.get(text);
                if (matchedKey) {
                    parent.setAttribute('data-copy-key', matchedKey);
                    parent.setAttribute('data-copy-auto', 'true');
                    taggedElements.push(parent);
                }
            }

            currentNode = walker.nextNode();
        }

        return () => {
            for (const el of taggedElements) {
                if (el.getAttribute('data-copy-auto') === 'true') {
                    el.removeAttribute('data-copy-key');
                    el.removeAttribute('data-copy-auto');
                }
            }
        };
    }, [isEditMode, pageCopy]);

    // Tangani klik pada elemen [data-copy-key] saat mode edit aktif + tombol Escape
    useEffect(() => {
        if (!isEditMode) return;

        const handleClickCapture = (e: MouseEvent) => {
            const target = e.target as HTMLElement | null;
            if (!target || target.closest('[data-inline-copy-ui="true"]')) {
                return;
            }

            const copyTarget = target.closest('[data-copy-key]') as HTMLElement | null;
            if (!copyTarget) {
                return;
            }

            const key = copyTarget.getAttribute('data-copy-key');
            if (!key) return;

            e.preventDefault();
            e.stopPropagation();

            triggerElRef.current = copyTarget;
            setLoadingKey(key);
            setServerError(null);

            axios
                .get(
                    `/admin/teks-website/${encodeURIComponent(key)}/meta?locale=${activeLocale}`,
                    {
                        headers: { Accept: 'application/json' },
                    }
                )
                .then((res) => {
                    const meta = res.data as InlineCopyMeta;
                    setActiveMeta(meta);
                    setDraftValue(meta.currentValue);
                    setLoadingKey(null);
                    requestAnimationFrame(() => inputRef.current?.focus());
                })
                .catch(() => {
                    setLoadingKey(null);
                    toast.error('Gagal memuat detail teks.');
                });
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key !== 'Escape') return;
            if (activeMeta || loadingKey) {
                e.preventDefault();
                closePopover();
            } else {
                setCopyEditMode(false);
            }
        };

        document.addEventListener('click', handleClickCapture, true);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('click', handleClickCapture, true);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isEditMode, activeMeta, loadingKey, closePopover, activeLocale]);

    const charCount = useMemo(
        () => (activeMeta ? getEffectiveLength(activeMeta.type, draftValue) : 0),
        [activeMeta, draftValue]
    );
    const isOverMax =
        activeMeta !== null && activeMeta.max !== null && charCount > activeMeta.max;
    const missingPlaceholders = useMemo(
        () =>
            activeMeta
                ? activeMeta.placeholders.filter((p) => !draftValue.includes(`{${p}}`))
                : [],
        [activeMeta, draftValue]
    );
    const validationError = useMemo(() => {
        if (!activeMeta) return null;
        if (draftValue.trim() === '') return 'Nilai teks tidak boleh kosong.';
        if (isOverMax) return `Melebihi batas maksimal ${activeMeta.max} karakter.`;
        if (missingPlaceholders.length > 0) {
            return `Placeholder wajib hilang: ${missingPlaceholders.map((p) => `{${p}}`).join(', ')}.`;
        }
        return serverError;
    }, [activeMeta, draftValue, isOverMax, missingPlaceholders, serverError]);

    const handleSave = async () => {
        if (!activeMeta || validationError || saving) return;
        setSaving(true);
        setServerError(null);

        try {
            const res = await axios.put(
                `/admin/teks-website/${encodeURIComponent(activeMeta.key)}`,
                { value: draftValue, locale: activeMeta.locale ?? activeLocale },
                { headers: { Accept: 'application/json' } }
            );
            toast.success(res.data.message || 'Teks berhasil disimpan.');
            router.reload({ only: ['copy'] });
            closePopover();
        } catch (err: unknown) {
            let msg = 'Gagal menyimpan teks.';
            if (axios.isAxiosError(err)) {
                const firstErr =
                    err.response?.data?.errors?.value?.[0] || err.response?.data?.message;
                if (typeof firstErr === 'string') msg = firstErr;
            }
            setServerError(msg);
            toast.error(msg);
        } finally {
            setSaving(false);
        }
    };

    const handleReset = async () => {
        if (!activeMeta || saving) return;
        setSaving(true);
        setServerError(null);

        try {
            const res = await axios.post(
                `/admin/teks-website/${encodeURIComponent(activeMeta.key)}/reset`,
                { locale: activeMeta.locale ?? activeLocale },
                { headers: { Accept: 'application/json' } }
            );
            toast.success(res.data.message || 'Teks dikembalikan ke nilai bawaan.');
            router.reload({ only: ['copy'] });
            closePopover();
        } catch {
            toast.error('Gagal mereset teks.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div data-inline-copy-ui="true">
            {isEditMode ? (
                <style>{`
                    [data-copy-key]:hover {
                        outline: 1.5px dashed #056ED4;
                        outline-offset: 2px;
                        cursor: pointer;
                    }
                `}</style>
            ) : null}

            {/* Tombol Melayang Pojok Kiri Bawah */}
            <div className="fixed bottom-4 left-4 z-[70] flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => {
                        if (isEditMode) {
                            closePopover();
                            setCopyEditMode(false);
                        } else {
                            setCopyEditMode(true);
                        }
                    }}
                    aria-pressed={isEditMode}
                    className={cx(
                        'inline-flex h-10 items-center gap-2 rounded-full border px-4 text-xs font-bold shadow-lift transition-colors',
                        focusRing,
                        isEditMode
                            ? 'border-aqua bg-navy text-white hover:bg-ocean'
                            : 'border-line bg-white text-navy hover:border-ocean hover:bg-mist'
                    )}
                >
                    <PenLine className="h-3.5 w-3.5 text-aqua" />
                    <span>{isEditMode ? 'Matikan Edit Teks (Esc)' : 'Edit Teks'}</span>
                </button>
            </div>

            {/* Popover Edit Teks */}
            {(loadingKey || activeMeta) ? (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-label={activeMeta ? `Edit ${activeMeta.label}` : 'Memuat editor teks'}
                    className="fixed bottom-16 left-4 z-[75] w-[calc(100vw-2rem)] max-w-md rounded-card border border-line bg-white p-4 shadow-lift"
                >
                    {loadingKey && !activeMeta ? (
                        <div className="flex items-center gap-2 py-4 text-xs font-medium text-slate">
                            <Loader2 className="h-4 w-4 animate-spin text-ocean" />
                            <span>Memuat detail teks...</span>
                        </div>
                    ) : activeMeta ? (
                        <div className="space-y-3">
                            <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-1.5">
                                        <p className="text-sm font-bold text-navy truncate">
                                            {activeMeta.label}
                                        </p>
                                        <span
                                            className={cx(
                                                'rounded px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase',
                                                (activeMeta.locale ?? activeLocale) === 'en'
                                                    ? 'bg-ocean/10 text-ocean'
                                                    : 'bg-navy/10 text-navy'
                                            )}
                                        >
                                            {(activeMeta.locale ?? activeLocale) === 'en'
                                                ? 'EN · Manual'
                                                : 'ID'}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate truncate">
                                        {activeMeta.hint || activeMeta.key}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={closePopover}
                                    aria-label="Tutup editor"
                                    className={cx(
                                        'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded text-slate hover:bg-mist hover:text-navy',
                                        focusRing
                                    )}
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            {activeMeta.type === 'richtext' ? (
                                <SimpleRichTextEditor
                                    id="inline-copy-input"
                                    value={draftValue}
                                    onChange={setDraftValue}
                                    disabled={saving}
                                    hasError={Boolean(validationError)}
                                />
                            ) : activeMeta.type === 'textarea' ? (
                                <textarea
                                    ref={(el) => {
                                        inputRef.current = el;
                                    }}
                                    rows={3}
                                    value={draftValue}
                                    disabled={saving}
                                    onChange={(e) => setDraftValue(e.target.value)}
                                    className="block w-full rounded-control border border-line px-3 py-2 text-sm text-ink focus:border-ocean focus:outline-none focus:ring-2 focus:ring-ocean/15"
                                />
                            ) : (
                                <input
                                    ref={(el) => {
                                        inputRef.current = el;
                                    }}
                                    type="text"
                                    value={draftValue}
                                    disabled={saving}
                                    onChange={(e) => setDraftValue(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            void handleSave();
                                        }
                                    }}
                                    className="block w-full rounded-control border border-line px-3 py-2 text-sm text-ink focus:border-ocean focus:outline-none focus:ring-2 focus:ring-ocean/15"
                                />
                            )}

                            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                                <div className="flex flex-wrap gap-1">
                                    {activeMeta.placeholders.map((p) => (
                                        <span
                                            key={p}
                                            className={cx(
                                                'rounded-full px-2 py-0.5 font-mono font-semibold',
                                                draftValue.includes(`{${p}}`)
                                                    ? 'bg-emerald-50 text-emerald-700'
                                                    : 'bg-rose-50 text-danger'
                                            )}
                                        >
                                            {`{${p}}`}
                                        </span>
                                    ))}
                                </div>
                                {activeMeta.max !== null ? (
                                    <span
                                        className={cx(
                                            'font-mono',
                                            isOverMax ? 'font-bold text-danger' : 'text-slate'
                                        )}
                                    >
                                        {charCount} / {activeMeta.max}
                                    </span>
                                ) : null}
                            </div>

                            {validationError ? (
                                <div
                                    role="alert"
                                    className="flex items-start gap-1.5 rounded bg-rose-50 px-2.5 py-1.5 text-xs text-danger"
                                >
                                    <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                                    <span>{validationError}</span>
                                </div>
                            ) : null}

                            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-2.5">
                                <div className="flex items-center gap-1.5">
                                    <button
                                        type="button"
                                        disabled={saving || Boolean(validationError)}
                                        onClick={() => void handleSave()}
                                        className={cx(
                                            'inline-flex h-8 items-center gap-1.5 rounded-control bg-ocean px-3 text-xs font-semibold text-white hover:bg-navy disabled:opacity-45',
                                            focusRing
                                        )}
                                    >
                                        {saving ? (
                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        ) : (
                                            <Save className="h-3.5 w-3.5" />
                                        )}
                                        <span>Simpan</span>
                                    </button>
                                    {activeMeta.isChanged ? (
                                        <button
                                            type="button"
                                            disabled={saving}
                                            onClick={() => void handleReset()}
                                            className={cx(
                                                'inline-flex h-8 items-center gap-1 rounded-control border border-line px-2.5 text-xs font-semibold text-slate hover:border-danger/40 hover:text-danger',
                                                focusRing
                                            )}
                                        >
                                            <RotateCcw className="h-3.5 w-3.5" />
                                            <span>Reset</span>
                                        </button>
                                    ) : null}
                                </div>

                                <a
                                    href={`/admin/teks-website/${activeMeta.group}?search=${encodeURIComponent(activeMeta.key)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={cx(
                                        'inline-flex items-center gap-1 text-xs font-semibold text-ocean hover:text-navy',
                                        focusRing
                                    )}
                                >
                                    <span>Buka di pengelola</span>
                                    <ExternalLink className="h-3 w-3" />
                                </a>
                            </div>
                        </div>
                    ) : null}
                </div>
            ) : null}
        </div>
    );
}
