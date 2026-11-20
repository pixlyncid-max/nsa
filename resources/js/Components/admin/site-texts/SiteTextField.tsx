import SimpleRichTextEditor from '@/Components/admin/site-texts/SimpleRichTextEditor';
import type {
    EnTranslationStatus,
    SiteTextItem,
} from '@/Components/admin/site-texts/types';
import { sanitizeRichTextHtml } from '@/Components/ui/RichText';
import { cx } from '@/lib/cx';
import { focusRing } from '@/lib/ui';
import {
    AlertCircle,
    Check,
    History,
    Loader2,
    Lock,
    PenLine,
    RefreshCw,
    RotateCcw,
    Save,
    Unlock,
} from 'lucide-react';
import { useMemo, useState, type KeyboardEvent } from 'react';

interface SiteTextFieldProps {
    item: SiteTextItem;
    draftValue: string;
    enDraftValue: string;
    isDirty: boolean;
    isEnDirty: boolean;
    isSaving: boolean;
    isEnSaving: boolean;
    serverError?: string;
    enServerError?: string;
    onChange: (nextValue: string) => void;
    onChangeEn: (nextValue: string) => void;
    onSave: () => Promise<void>;
    onSaveEn: () => Promise<void>;
    onReset: () => Promise<void>;
    onRetranslateEn: () => Promise<void>;
    onRevertEnToAuto: () => Promise<void>;
    onOpenHistory: () => void;
}

function getEffectiveLength(type: SiteTextItem['type'], value: string): number {
    if (type === 'richtext') {
        return value.replace(/<[^>]*>/g, '').trim().length;
    }
    return value.length;
}

function isHeadingKey(item: SiteTextItem): boolean {
    return (
        item.key.includes('.title') ||
        item.key.includes('.heading') ||
        item.label.toLowerCase().includes('judul')
    );
}

function EnStatusBadge({ status }: { status: EnTranslationStatus }) {
    if (status === 'manual') {
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-navy/10 px-2 py-0.5 text-[11px] font-semibold text-navy">
                <Lock className="h-3 w-3" />
                Manual (terkunci)
            </span>
        );
    }

    if (status === 'pending') {
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800 border border-amber-200">
                <Loader2 className="h-3 w-3 animate-spin" />
                Menerjemahkan
            </span>
        );
    }

    if (status === 'failed') {
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-danger border border-danger/25">
                <AlertCircle className="h-3 w-3" />
                Gagal
            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
            <Check className="h-3 w-3" />
            Otomatis
        </span>
    );
}

export default function SiteTextField({
    item,
    draftValue,
    enDraftValue,
    isDirty,
    isEnDirty,
    isSaving,
    isEnSaving,
    serverError,
    enServerError,
    onChange,
    onChangeEn,
    onSave,
    onSaveEn,
    onReset,
    onRetranslateEn,
    onRevertEnToAuto,
    onOpenHistory,
}: SiteTextFieldProps) {
    const [activeTab, setActiveTab] = useState<'id' | 'en'>('id');
    const [confirmReset, setConfirmReset] = useState(false);
    const [editingEnManual, setEditingEnManual] = useState(false);

    // Validasi ID
    const charCount = useMemo(
        () => getEffectiveLength(item.type, draftValue),
        [item.type, draftValue]
    );
    const isOverMax = item.max !== null && charCount > item.max;
    const isEmpty = draftValue.trim() === '';
    const missingPlaceholders = useMemo(
        () =>
            item.placeholders.filter(
                (placeholder) => !draftValue.includes(`{${placeholder}}`)
            ),
        [item.placeholders, draftValue]
    );

    const urlError = useMemo(() => {
        if (item.type !== 'link') return null;
        const lower = draftValue.trim().toLowerCase();
        if (
            lower.startsWith('javascript:') ||
            lower.startsWith('vbscript:') ||
            lower.startsWith('data:')
        ) {
            return 'URL tautan tidak aman.';
        }
        const defaultLooksLikeUrl = /^(https?:\/\/|\/|#|mailto:|tel:)/i.test(
            item.default
        );
        if (
            defaultLooksLikeUrl &&
            draftValue.trim() !== '' &&
            !/^(https?:\/\/|\/|#|mailto:|tel:)/i.test(draftValue.trim())
        ) {
            return 'Format URL harus diawali https://, http://, /, #, mailto:, atau tel:.';
        }
        return null;
    }, [item.type, item.default, draftValue]);

    const validationError = useMemo(() => {
        if (isEmpty) {
            return 'Nilai teks tidak boleh kosong. Gunakan Reset ke default untuk mengembalikan bawaan.';
        }
        if (isOverMax) {
            return `Panjang teks (${charCount}) melebihi batas maksimal ${item.max} karakter.`;
        }
        if (missingPlaceholders.length > 0) {
            return `Placeholder wajib belum ada: ${missingPlaceholders.map((p) => `{${p}}`).join(', ')}.`;
        }
        if (urlError) {
            return urlError;
        }
        return serverError ?? null;
    }, [isEmpty, isOverMax, charCount, item.max, missingPlaceholders, urlError, serverError]);

    // Validasi EN
    const enCharCount = useMemo(
        () => getEffectiveLength(item.type, enDraftValue),
        [item.type, enDraftValue]
    );
    const isEnOverMax = item.maxEn !== null && enCharCount > item.maxEn;
    const isEnEmpty = enDraftValue.trim() === '';
    const missingEnPlaceholders = useMemo(
        () =>
            item.placeholders.filter(
                (placeholder) => !enDraftValue.includes(`{${placeholder}}`)
            ),
        [item.placeholders, enDraftValue]
    );

    const enValidationError = useMemo(() => {
        if (isEnEmpty) {
            return 'Nilai teks Inggris tidak boleh kosong.';
        }
        if (isEnOverMax) {
            return `Panjang teks Inggris (${enCharCount}) melebihi batas maksimal ${item.maxEn} karakter.`;
        }
        if (missingEnPlaceholders.length > 0) {
            return `Placeholder wajib belum ada pada versi Inggris: ${missingEnPlaceholders.map((p) => `{${p}}`).join(', ')}.`;
        }
        return enServerError ?? null;
    }, [isEnEmpty, isEnOverMax, enCharCount, item.maxEn, missingEnPlaceholders, enServerError]);

    const canSave = isDirty && !isSaving && !validationError;
    const canSaveEn = (isEnDirty || editingEnManual) && !isEnSaving && !enValidationError;

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (item.type !== 'textarea' && e.key === 'Enter') {
            e.preventDefault();
            if (canSave) {
                void onSave();
            }
        } else if (item.type === 'textarea' && e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            if (canSave) {
                void onSave();
            }
        }
    };

    const handleBlur = () => {
        if (canSave) {
            void onSave();
        }
    };

    const inputId = `site-text-${item.key.replace(/\./g, '-')}`;
    const enInputId = `site-text-en-${item.key.replace(/\./g, '-')}`;

    return (
        <div
            className={cx(
                'rounded-card border bg-white p-5 transition-colors',
                validationError || enValidationError
                    ? 'border-danger/60'
                    : isDirty || isEnDirty
                    ? 'border-amber-400/80'
                    : 'border-line'
            )}
        >
            {/* Header Baris: Label, Lencana Diubah, Tab ID | EN, Status */}
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <label
                            htmlFor={activeTab === 'id' ? inputId : enInputId}
                            className="text-sm font-bold text-navy"
                        >
                            {item.label}
                        </label>
                        {item.isChanged ? (
                            <span className="inline-flex items-center rounded-full bg-ocean/10 px-2 py-0.5 text-[11px] font-semibold text-ocean">
                                Diubah
                            </span>
                        ) : null}
                        <EnStatusBadge status={item.enStatus} />
                        <span className="rounded bg-mist px-1.5 py-0.5 font-mono text-[11px] text-slate">
                            {item.type}
                        </span>
                    </div>
                    <p className="mt-1 text-xs text-slate">
                        {item.hint || item.key}
                    </p>
                    <p className="mt-0.5 font-mono text-[11px] text-slate/75">
                        {item.key}
                    </p>
                </div>

                {/* Tab Bahasa ID | EN + Indikator Simpan */}
                <div className="flex shrink-0 flex-wrap items-center gap-2.5 text-xs">
                    <div
                        role="tablist"
                        aria-label={`Pilih bahasa untuk ${item.label}`}
                        className="inline-flex rounded-control border border-line bg-mist/60 p-0.5"
                    >
                        <button
                            type="button"
                            role="tab"
                            aria-selected={activeTab === 'id'}
                            onClick={() => setActiveTab('id')}
                            className={cx(
                                'rounded px-2.5 py-1 text-[11px] font-bold transition-colors',
                                focusRing,
                                activeTab === 'id'
                                    ? 'bg-navy text-white'
                                    : 'text-slate hover:text-navy'
                            )}
                        >
                            ID
                        </button>
                        <button
                            type="button"
                            role="tab"
                            aria-selected={activeTab === 'en'}
                            onClick={() => setActiveTab('en')}
                            className={cx(
                                'rounded px-2.5 py-1 text-[11px] font-bold transition-colors',
                                focusRing,
                                activeTab === 'en'
                                    ? 'bg-navy text-white'
                                    : 'text-slate hover:text-navy'
                            )}
                        >
                            EN
                        </button>
                    </div>

                    {isSaving || isEnSaving ? (
                        <span className="inline-flex items-center gap-1.5 font-medium text-ocean">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Menyimpan...
                        </span>
                    ) : isDirty || isEnDirty ? (
                        <span className="inline-flex items-center gap-1.5 font-medium text-amber-700">
                            <span
                                className="h-2 w-2 rounded-full bg-amber-500"
                                aria-hidden="true"
                            />
                            Belum disimpan
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1 font-medium text-emerald-700">
                            <Check className="h-3.5 w-3.5" />
                            Tersimpan
                        </span>
                    )}
                </div>
            </div>

            {/* Panel Tab ID */}
            {activeTab === 'id' ? (
                <>
                    <div className="mt-3.5">
                        {item.type === 'richtext' ? (
                            <SimpleRichTextEditor
                                id={inputId}
                                value={draftValue}
                                onChange={onChange}
                                onBlur={handleBlur}
                                disabled={isSaving}
                                hasError={Boolean(validationError)}
                            />
                        ) : item.type === 'textarea' ? (
                            <textarea
                                id={inputId}
                                rows={3}
                                value={draftValue}
                                disabled={isSaving}
                                onChange={(e) => onChange(e.target.value)}
                                onBlur={handleBlur}
                                onKeyDown={handleKeyDown}
                                className={cx(
                                    'block w-full rounded-control border bg-white px-3.5 py-2.5 text-sm text-ink transition-colors focus:outline-none focus:ring-2',
                                    validationError
                                        ? 'border-danger focus:border-danger focus:ring-danger/20'
                                        : 'border-line focus:border-ocean focus:ring-ocean/15'
                                )}
                            />
                        ) : (
                            <input
                                id={inputId}
                                type="text"
                                value={draftValue}
                                disabled={isSaving}
                                onChange={(e) => onChange(e.target.value)}
                                onBlur={handleBlur}
                                onKeyDown={handleKeyDown}
                                className={cx(
                                    'block w-full rounded-control border bg-white px-3.5 py-2.5 text-sm text-ink transition-colors focus:outline-none focus:ring-2',
                                    validationError
                                        ? 'border-danger focus:border-danger focus:ring-danger/20'
                                        : 'border-line focus:border-ocean focus:ring-ocean/15'
                                )}
                            />
                        )}
                    </div>

                    {/* Meta ID */}
                    <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex flex-wrap items-center gap-1.5">
                            {item.placeholders.length > 0 ? (
                                <>
                                    <span className="text-[11px] font-medium text-slate">
                                        Placeholder wajib:
                                    </span>
                                    {item.placeholders.map((placeholder) => {
                                        const present = draftValue.includes(`{${placeholder}}`);
                                        return (
                                            <span
                                                key={placeholder}
                                                className={cx(
                                                    'inline-flex items-center rounded-full px-2 py-0.5 font-mono text-[11px] font-semibold',
                                                    present
                                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                        : 'bg-rose-50 text-danger border border-danger/30'
                                                )}
                                            >
                                                {`{${placeholder}}`}
                                            </span>
                                        );
                                    })}
                                </>
                            ) : null}
                        </div>

                        {item.max !== null ? (
                            <span
                                className={cx(
                                    'font-mono text-[11px] font-medium',
                                    isOverMax ? 'text-danger font-bold' : 'text-slate'
                                )}
                            >
                                {charCount} / {item.max} karakter
                            </span>
                        ) : null}
                    </div>

                    {validationError ? (
                        <div
                            role="alert"
                            className="mt-2.5 flex items-start gap-2 rounded-control border border-danger/25 bg-rose-50/70 px-3 py-2 text-xs text-danger"
                        >
                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                            <span>{validationError}</span>
                        </div>
                    ) : null}

                    {item.isChanged ? (
                        <p className="mt-2.5 text-xs text-slate">
                            <span className="font-semibold text-navy/80">Default ID:</span>{' '}
                            <span className="break-words">{item.default}</span>
                        </p>
                    ) : null}

                    {/* Pratinjau Tipografi */}
                    <div className="mt-3 rounded-control border border-line/80 bg-mist/40 px-3.5 py-2.5">
                        <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate">
                            Pratinjau (ID)
                        </p>
                        {item.type === 'richtext' ? (
                            <div
                                className="prose prose-sm max-w-none text-ink prose-strong:text-navy prose-a:text-ocean"
                                dangerouslySetInnerHTML={{
                                    __html: sanitizeRichTextHtml(draftValue),
                                }}
                            />
                        ) : item.type === 'button' ? (
                            <span className="inline-flex items-center rounded-control bg-ocean px-3.5 py-1.5 text-xs font-semibold text-white">
                                {draftValue || item.default}
                            </span>
                        ) : item.type === 'link' ? (
                            <span className="text-sm font-semibold text-ocean underline underline-offset-4">
                                {draftValue || item.default}
                            </span>
                        ) : isHeadingKey(item) ? (
                            <p className="font-display text-lg font-bold leading-snug text-navy">
                                {draftValue || item.default}
                            </p>
                        ) : (
                            <p className="font-sans text-sm leading-relaxed text-ink">
                                {draftValue || item.default}
                            </p>
                        )}
                    </div>

                    {/* Baris Aksi ID */}
                    <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 border-t border-line/70 pt-3">
                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                type="button"
                                disabled={!canSave}
                                onClick={() => void onSave()}
                                className={cx(
                                    'inline-flex h-8 items-center gap-1.5 rounded-control bg-ocean px-3 text-xs font-semibold text-white transition-colors hover:bg-navy disabled:cursor-not-allowed disabled:opacity-45',
                                    focusRing
                                )}
                            >
                                <Save className="h-3.5 w-3.5" />
                                <span>Simpan ID</span>
                            </button>

                            <button
                                type="button"
                                onClick={onOpenHistory}
                                className={cx(
                                    'inline-flex h-8 items-center gap-1.5 rounded-control border border-line bg-white px-3 text-xs font-semibold text-navy transition-colors hover:bg-mist',
                                    focusRing
                                )}
                            >
                                <History className="h-3.5 w-3.5 text-ocean" />
                                <span>
                                    Riwayat
                                    {item.revisionsCount > 0 ? ` (${item.revisionsCount})` : ''}
                                </span>
                            </button>
                        </div>

                        {item.isChanged ? (
                            confirmReset ? (
                                <div className="flex items-center gap-1.5">
                                    <span className="text-xs text-slate">Yakin reset?</span>
                                    <button
                                        type="button"
                                        disabled={isSaving}
                                        onClick={async () => {
                                            setConfirmReset(false);
                                            await onReset();
                                        }}
                                        className={cx(
                                            'inline-flex h-8 items-center rounded-control bg-danger px-2.5 text-xs font-semibold text-white hover:bg-danger/90 disabled:opacity-50',
                                            focusRing
                                        )}
                                    >
                                        Ya, Reset
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setConfirmReset(false)}
                                        className={cx(
                                            'inline-flex h-8 items-center rounded-control border border-line bg-white px-2.5 text-xs font-semibold text-slate hover:text-navy',
                                            focusRing
                                        )}
                                    >
                                        Batal
                                    </button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    disabled={isSaving}
                                    onClick={() => setConfirmReset(true)}
                                    className={cx(
                                        'inline-flex h-8 items-center gap-1.5 rounded-control border border-line bg-white px-3 text-xs font-semibold text-slate transition-colors hover:border-danger/40 hover:text-danger disabled:opacity-50',
                                        focusRing
                                    )}
                                >
                                    <RotateCcw className="h-3.5 w-3.5" />
                                    <span>Reset ke default</span>
                                </button>
                            )
                        ) : null}
                    </div>
                </>
            ) : (
                /* Panel Tab EN */
                <div className="mt-3.5 space-y-3">
                    {item.enStatus === 'failed' && item.enError ? (
                        <div
                            role="alert"
                            className="flex items-start gap-2 rounded-control border border-danger/25 bg-rose-50/70 px-3 py-2 text-xs text-danger"
                        >
                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                            <span>Terjemahan otomatis gagal: {item.enError}</span>
                        </div>
                    ) : null}

                    {editingEnManual ? (
                        <>
                            {item.type === 'richtext' ? (
                                <SimpleRichTextEditor
                                    id={enInputId}
                                    value={enDraftValue}
                                    onChange={onChangeEn}
                                    disabled={isEnSaving}
                                    hasError={Boolean(enValidationError)}
                                />
                            ) : item.type === 'textarea' ? (
                                <textarea
                                    id={enInputId}
                                    rows={3}
                                    value={enDraftValue}
                                    disabled={isEnSaving}
                                    onChange={(e) => onChangeEn(e.target.value)}
                                    className={cx(
                                        'block w-full rounded-control border bg-white px-3.5 py-2.5 text-sm text-ink transition-colors focus:outline-none focus:ring-2',
                                        enValidationError
                                            ? 'border-danger focus:border-danger focus:ring-danger/20'
                                            : 'border-line focus:border-ocean focus:ring-ocean/15'
                                    )}
                                />
                            ) : (
                                <input
                                    id={enInputId}
                                    type="text"
                                    value={enDraftValue}
                                    disabled={isEnSaving}
                                    onChange={(e) => onChangeEn(e.target.value)}
                                    className={cx(
                                        'block w-full rounded-control border bg-white px-3.5 py-2.5 text-sm text-ink transition-colors focus:outline-none focus:ring-2',
                                        enValidationError
                                            ? 'border-danger focus:border-danger focus:ring-danger/20'
                                            : 'border-line focus:border-ocean focus:ring-ocean/15'
                                    )}
                                />
                            )}

                            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                                <div className="flex flex-wrap items-center gap-1.5">
                                    {item.placeholders.map((placeholder) => {
                                        const present = enDraftValue.includes(`{${placeholder}}`);
                                        return (
                                            <span
                                                key={placeholder}
                                                className={cx(
                                                    'inline-flex items-center rounded-full px-2 py-0.5 font-mono text-[11px] font-semibold',
                                                    present
                                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                        : 'bg-rose-50 text-danger border border-danger/30'
                                                )}
                                            >
                                                {`{${placeholder}}`}
                                            </span>
                                        );
                                    })}
                                </div>
                                {item.maxEn !== null ? (
                                    <span
                                        className={cx(
                                            'font-mono text-[11px] font-medium',
                                            isEnOverMax ? 'font-bold text-danger' : 'text-slate'
                                        )}
                                    >
                                        {enCharCount} / {item.maxEn} karakter (EN)
                                    </span>
                                ) : null}
                            </div>

                            {enValidationError ? (
                                <div
                                    role="alert"
                                    className="flex items-start gap-2 rounded-control border border-danger/25 bg-rose-50/70 px-3 py-2 text-xs text-danger"
                                >
                                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                                    <span>{enValidationError}</span>
                                </div>
                            ) : null}
                        </>
                    ) : (
                        <div className="rounded-control border border-line bg-mist/40 px-3.5 py-3">
                            <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate">
                                Teks Bahasa Inggris (EN)
                            </p>
                            {item.type === 'richtext' ? (
                                <div
                                    className="prose prose-sm max-w-none text-ink prose-strong:text-navy prose-a:text-ocean"
                                    dangerouslySetInnerHTML={{
                                        __html: sanitizeRichTextHtml(item.currentEnValue),
                                    }}
                                />
                            ) : (
                                <p className="text-sm leading-relaxed text-ink break-words">
                                    {item.currentEnValue}
                                </p>
                            )}
                            <p className="mt-2 text-[11px] text-slate">
                                {item.enIsManual
                                    ? 'Dikunci manual — tidak akan ditimpa saat teks Indonesia diubah.'
                                    : 'Otomatis diperbarui saat teks Indonesia diubah.'}
                            </p>
                        </div>
                    )}

                    {/* Baris Aksi EN */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line/70 pt-3">
                        <div className="flex flex-wrap items-center gap-2">
                            {editingEnManual ? (
                                <>
                                    <button
                                        type="button"
                                        disabled={!canSaveEn}
                                        onClick={async () => {
                                            await onSaveEn();
                                            setEditingEnManual(false);
                                        }}
                                        className={cx(
                                            'inline-flex h-8 items-center gap-1.5 rounded-control bg-ocean px-3 text-xs font-semibold text-white transition-colors hover:bg-navy disabled:cursor-not-allowed disabled:opacity-45',
                                            focusRing
                                        )}
                                    >
                                        <Lock className="h-3.5 w-3.5" />
                                        <span>Simpan EN (Kunci Manual)</span>
                                    </button>
                                    <button
                                        type="button"
                                        disabled={isEnSaving}
                                        onClick={() => {
                                            onChangeEn(item.currentEnValue);
                                            setEditingEnManual(false);
                                        }}
                                        className={cx(
                                            'inline-flex h-8 items-center rounded-control border border-line bg-white px-3 text-xs font-semibold text-slate hover:text-navy',
                                            focusRing
                                        )}
                                    >
                                        Batal
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        type="button"
                                        disabled={isEnSaving}
                                        onClick={() => void onRetranslateEn()}
                                        className={cx(
                                            'inline-flex h-8 items-center gap-1.5 rounded-control border border-line bg-white px-3 text-xs font-semibold text-navy transition-colors hover:border-ocean hover:bg-mist disabled:opacity-50',
                                            focusRing
                                        )}
                                    >
                                        <RefreshCw className={cx('h-3.5 w-3.5 text-ocean', isEnSaving && 'animate-spin')} />
                                        <span>Terjemahkan ulang</span>
                                    </button>

                                    <button
                                        type="button"
                                        disabled={isEnSaving}
                                        onClick={() => setEditingEnManual(true)}
                                        className={cx(
                                            'inline-flex h-8 items-center gap-1.5 rounded-control border border-line bg-white px-3 text-xs font-semibold text-navy transition-colors hover:border-ocean hover:bg-mist disabled:opacity-50',
                                            focusRing
                                        )}
                                    >
                                        <PenLine className="h-3.5 w-3.5 text-ocean" />
                                        <span>Edit EN manual</span>
                                    </button>

                                    {item.enIsManual ? (
                                        <button
                                            type="button"
                                            disabled={isEnSaving}
                                            onClick={() => void onRevertEnToAuto()}
                                            className={cx(
                                                'inline-flex h-8 items-center gap-1.5 rounded-control border border-line bg-white px-3 text-xs font-semibold text-slate transition-colors hover:border-ocean hover:text-navy disabled:opacity-50',
                                                focusRing
                                            )}
                                        >
                                            <Unlock className="h-3.5 w-3.5" />
                                            <span>Kembalikan ke otomatis</span>
                                        </button>
                                    ) : null}
                                </>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={onOpenHistory}
                            className={cx(
                                'inline-flex h-8 items-center gap-1.5 rounded-control border border-line bg-white px-3 text-xs font-semibold text-navy transition-colors hover:bg-mist',
                                focusRing
                            )}
                        >
                            <History className="h-3.5 w-3.5 text-ocean" />
                            <span>
                                Riwayat
                                {item.revisionsCount > 0 ? ` (${item.revisionsCount})` : ''}
                            </span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
