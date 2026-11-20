import AdminLayout from '@/Layouts/AdminLayout';
import { cx } from '@/lib/cx';
import { focusRing } from '@/lib/ui';
import type { PageProps } from '@/types';
import { router } from '@inertiajs/react';
import axios from 'axios';
import {
    AlertCircle,
    BookOpen,
    Check,
    CheckCircle2,
    Clock,
    Download,
    Eye,
    FileText,
    Languages,
    Loader2,
    Lock,
    PenLine,
    Plus,
    RefreshCw,
    Save,
    Search,
    Settings,
    Trash2,
    Unlock,
    Upload,
    Wifi,
    X,
} from 'lucide-react';
import { useRef, useState, type FormEvent } from 'react';
import { toast } from 'sonner';

type TabKey = 'summary' | 'content' | 'glossary' | 'settings';

interface DriverStatus {
    active: string;
    configured: boolean;
    model: string | null;
}

interface SummaryData {
    done: number;
    pending: number;
    failed: number;
    manual: number;
    dailyChars: number;
    monthlyChars: number;
    dailyLimit: number;
    driver: DriverStatus;
}

interface ContentTranslationRow {
    id: number;
    type: string;
    typeLabel: string;
    modelId: number;
    sourceTitle: string;
    field: string;
    locale: string;
    sourceText: string;
    translatedText: string | null;
    status: 'done' | 'pending' | 'failed' | 'manual' | string;
    isManual: boolean;
    provider: string | null;
    error: string | null;
    updatedAt: string;
}

interface PaginatedTranslations {
    data: ContentTranslationRow[];
    current_page: number;
    last_page: number;
    total: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
}

interface GlossaryItem {
    id: number;
    source: string;
    target: string;
    locale: string;
    note: string | null;
    caseSensitive: boolean;
    isActive: boolean;
}

interface SettingsData {
    daily_char_limit: number;
    batch_size: number;
    failed_alert_threshold: number;
    driver: DriverStatus;
}

type TranslationCenterProps = PageProps<{
    activeTab: TabKey;
    summary: SummaryData;
    translations: PaginatedTranslations;
    modelOptions: Array<{ value: string; label: string }>;
    filters: {
        type: string;
        status: string;
        search: string;
        glossary_search: string;
    };
    glossary: GlossaryItem[];
    settings: SettingsData;
}>;

function StatusBadge({ status }: { status: string }) {
    if (status === 'manual') {
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-navy/10 px-2.5 py-0.5 text-[11px] font-semibold text-navy">
                <Lock className="h-3 w-3" />
                Manual
            </span>
        );
    }
    if (status === 'pending') {
        return (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800">
                <Clock className="h-3 w-3" />
                Menerjemahkan
            </span>
        );
    }
    if (status === 'failed') {
        return (
            <span className="inline-flex items-center gap-1 rounded-full border border-danger/25 bg-rose-50 px-2.5 py-0.5 text-[11px] font-semibold text-danger">
                <AlertCircle className="h-3 w-3" />
                Gagal
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
            <CheckCircle2 className="h-3 w-3" />
            Selesai
        </span>
    );
}

export default function Index({
    activeTab,
    summary,
    translations,
    modelOptions,
    filters,
    glossary,
    settings,
}: TranslationCenterProps) {
    const [tab, setTab] = useState<TabKey>(activeTab);

    // Tab 1: Uji koneksi
    const [testingConnection, setTestingConnection] = useState(false);
    const [connectionResult, setConnectionResult] = useState<{
        ok: boolean;
        message: string;
        sample?: string;
        latencyMs?: number;
    } | null>(null);

    // Tab 2: Konten & modal edit
    const [typeFilter, setTypeFilter] = useState(filters.type);
    const [statusFilter, setStatusFilter] = useState(filters.status);
    const [searchInput, setSearchInput] = useState(filters.search);
    const [bulkBusy, setBulkBusy] = useState<string | null>(null);
    const [rowBusyId, setRowBusyId] = useState<number | null>(null);
    const [inspectRow, setInspectRow] = useState<ContentTranslationRow | null>(null);
    const [manualDraft, setManualDraft] = useState('');
    const [savingManual, setSavingManual] = useState(false);

    // Tab 3: Glosarium
    const [glossarySearch, setGlossarySearch] = useState(filters.glossary_search);
    const [glossaryForm, setGlossaryForm] = useState<{
        id: number | null;
        source: string;
        target: string;
        note: string;
        case_sensitive: boolean;
    }>({ id: null, source: '', target: '', note: '', case_sensitive: false });
    const [savingGlossary, setSavingGlossary] = useState(false);
    const [applyingGlossaryId, setApplyingGlossaryId] = useState<number | null>(null);
    const csvInputRef = useRef<HTMLInputElement>(null);

    // Tab 4: Pengaturan
    const [dailyLimit, setDailyLimit] = useState(settings.daily_char_limit);
    const [batchSize, setBatchSize] = useState(settings.batch_size);
    const [failedThreshold, setFailedThreshold] = useState(settings.failed_alert_threshold);
    const [savingSettings, setSavingSettings] = useState(false);

    const switchTab = (nextTab: TabKey) => {
        setTab(nextTab);
        router.get(
            '/admin/terjemahan',
            {
                tab: nextTab,
                ...(typeFilter ? { type: typeFilter } : {}),
                ...(statusFilter ? { status: statusFilter } : {}),
                ...(searchInput ? { search: searchInput } : {}),
                ...(glossarySearch ? { glossary_search: glossarySearch } : {}),
            },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    };

    const applyContentFilters = (next: { type?: string; status?: string; search?: string }) => {
        const nextType = next.type !== undefined ? next.type : typeFilter;
        const nextStatus = next.status !== undefined ? next.status : statusFilter;
        const nextSearch = next.search !== undefined ? next.search : searchInput;

        router.get(
            '/admin/terjemahan',
            {
                tab: 'content',
                ...(nextType ? { type: nextType } : {}),
                ...(nextStatus ? { status: nextStatus } : {}),
                ...(nextSearch.trim() ? { search: nextSearch.trim() } : {}),
            },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    };

    const handleTestConnection = async () => {
        setTestingConnection(true);
        setConnectionResult(null);
        try {
            const res = await axios.post(
                '/admin/terjemahan/uji-koneksi',
                {},
                { headers: { Accept: 'application/json' } }
            );
            setConnectionResult({
                ok: true,
                message: res.data.message,
                sample: res.data.sample,
                latencyMs: res.data.latencyMs,
            });
            toast.success(res.data.message);
        } catch (err: unknown) {
            const msg = axios.isAxiosError(err)
                ? (err.response?.data?.message ?? 'Gagal menguji koneksi.')
                : 'Gagal menguji koneksi.';
            setConnectionResult({ ok: false, message: msg });
            toast.error(msg);
        } finally {
            setTestingConnection(false);
        }
    };

    const handleSaveManual = async () => {
        if (!inspectRow || manualDraft.trim() === '') return;
        setSavingManual(true);
        try {
            const res = await axios.put(
                `/admin/terjemahan/konten/${inspectRow.id}`,
                { value: manualDraft },
                { headers: { Accept: 'application/json' } }
            );
            toast.success(res.data.message || 'Terjemahan disimpan dan dikunci manual.');
            setInspectRow(null);
            router.reload({ only: ['summary', 'translations'] });
        } catch {
            toast.error('Gagal menyimpan terjemahan manual.');
        } finally {
            setSavingManual(false);
        }
    };

    const handleRetranslateRow = async (row: ContentTranslationRow) => {
        setRowBusyId(row.id);
        try {
            const res = await axios.post(
                `/admin/terjemahan/konten/${row.id}/terjemahkan-ulang`,
                {},
                { headers: { Accept: 'application/json' } }
            );
            toast.success(res.data.message || 'Masuk antrean terjemahan ulang.');
            router.reload({ only: ['summary', 'translations'] });
        } catch {
            toast.error('Gagal memicu terjemahan ulang.');
        } finally {
            setRowBusyId(null);
        }
    };

    const handleRevertAutoRow = async (row: ContentTranslationRow) => {
        setRowBusyId(row.id);
        try {
            const res = await axios.post(
                `/admin/terjemahan/konten/${row.id}/otomatis`,
                {},
                { headers: { Accept: 'application/json' } }
            );
            toast.success(res.data.message || 'Dikembalikan ke mode otomatis.');
            router.reload({ only: ['summary', 'translations'] });
        } catch {
            toast.error('Gagal mengembalikan ke otomatis.');
        } finally {
            setRowBusyId(null);
        }
    };

    const handleBulkAction = async (kind: 'failed' | 'missing') => {
        setBulkBusy(kind);
        const url =
            kind === 'failed'
                ? '/admin/terjemahan/konten/ulang-gagal'
                : '/admin/terjemahan/konten/terjemahkan-semua';
        try {
            const res = await axios.post(url, {}, { headers: { Accept: 'application/json' } });
            toast.success(res.data.message);
            router.reload({ only: ['summary', 'translations'] });
        } catch {
            toast.error('Gagal menjalankan aksi massal terjemahan.');
        } finally {
            setBulkBusy(null);
        }
    };

    const handleGlossarySubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!glossaryForm.source.trim() || !glossaryForm.target.trim()) return;
        setSavingGlossary(true);
        try {
            if (glossaryForm.id) {
                const res = await axios.put(
                    `/admin/terjemahan/glosarium/${glossaryForm.id}`,
                    glossaryForm,
                    { headers: { Accept: 'application/json' } }
                );
                toast.success(res.data.message || 'Istilah diperbarui.');
            } else {
                const res = await axios.post('/admin/terjemahan/glosarium', glossaryForm, {
                    headers: { Accept: 'application/json' },
                });
                toast.success(res.data.message || 'Istilah ditambahkan.');
            }
            setGlossaryForm({ id: null, source: '', target: '', note: '', case_sensitive: false });
            router.reload({ only: ['glossary'] });
        } catch {
            toast.error('Gagal menyimpan istilah glosarium.');
        } finally {
            setSavingGlossary(false);
        }
    };

    const handleDeleteGlossary = async (item: GlossaryItem) => {
        if (!window.confirm(`Hapus istilah "${item.source}" dari glosarium?`)) return;
        try {
            await axios.delete(`/admin/terjemahan/glosarium/${item.id}`, {
                headers: { Accept: 'application/json' },
            });
            toast.success('Istilah glosarium dihapus.');
            router.reload({ only: ['glossary'] });
        } catch {
            toast.error('Gagal menghapus istilah glosarium.');
        }
    };

    const handleApplyGlossary = async (item: GlossaryItem) => {
        setApplyingGlossaryId(item.id);
        try {
            const res = await axios.post(
                `/admin/terjemahan/glosarium/${item.id}/terapkan`,
                {},
                { headers: { Accept: 'application/json' } }
            );
            toast.success(res.data.message);
            router.reload({ only: ['summary', 'translations'] });
        } catch {
            toast.error('Gagal menerapkan glosarium ke konten.');
        } finally {
            setApplyingGlossaryId(null);
        }
    };

    const handleImportCsv = async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        try {
            const res = await axios.post('/admin/terjemahan/glosarium/impor', formData, {
                headers: { Accept: 'application/json', 'Content-Type': 'multipart/form-data' },
            });
            toast.success(res.data.message);
            router.reload({ only: ['glossary'] });
        } catch {
            toast.error('Gagal mengimpor berkas CSV glosarium.');
        } finally {
            if (csvInputRef.current) {
                csvInputRef.current.value = '';
            }
        }
    };

    const handleSaveSettings = async (e: FormEvent) => {
        e.preventDefault();
        setSavingSettings(true);
        try {
            const res = await axios.put(
                '/admin/terjemahan/pengaturan',
                {
                    daily_char_limit: dailyLimit,
                    batch_size: batchSize,
                    failed_alert_threshold: failedThreshold,
                },
                { headers: { Accept: 'application/json' } }
            );
            toast.success(res.data.message || 'Pengaturan disimpan.');
            router.reload({ only: ['summary', 'settings'] });
        } catch {
            toast.error('Gagal menyimpan pengaturan terjemahan.');
        } finally {
            setSavingSettings(false);
        }
    };

    const dailyPercent = Math.min(
        100,
        summary.dailyLimit > 0 ? Math.round((summary.dailyChars / summary.dailyLimit) * 100) : 0
    );

    const tabs: Array<{ key: TabKey; label: string; icon: typeof Languages }> = [
        { key: 'summary', label: 'Ringkasan', icon: Languages },
        { key: 'content', label: 'Konten', icon: FileText },
        { key: 'glossary', label: 'Glosarium', icon: BookOpen },
        { key: 'settings', label: 'Pengaturan', icon: Settings },
    ];

    return (
        <AdminLayout title="Pusat Terjemahan">
            <div className="space-y-6">
                {/* Navigasi 4 Tab */}
                <div
                    role="tablist"
                    aria-label="Navigasi Pusat Terjemahan"
                    className="flex flex-wrap gap-2 border-b border-line pb-3"
                >
                    {tabs.map((item) => {
                        const Icon = item.icon;
                        const active = tab === item.key;
                        return (
                            <button
                                key={item.key}
                                type="button"
                                role="tab"
                                aria-selected={active}
                                onClick={() => switchTab(item.key)}
                                className={cx(
                                    'inline-flex h-10 items-center gap-2 rounded-control px-4 text-xs font-bold transition-colors',
                                    focusRing,
                                    active
                                        ? 'bg-navy text-white'
                                        : 'border border-line bg-white text-ink hover:border-ocean hover:bg-mist'
                                )}
                            >
                                <Icon className="h-4 w-4 shrink-0" />
                                <span>{item.label}</span>
                                {item.key === 'content' && summary.failed > 0 ? (
                                    <span className="rounded-full bg-danger px-1.5 py-0.5 text-[10px] font-bold text-white">
                                        {summary.failed}
                                    </span>
                                ) : null}
                            </button>
                        );
                    })}
                </div>

                {/* TAB 1: RINGKASAN */}
                {tab === 'summary' ? (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="rounded-card border border-line bg-white p-5">
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate">
                                    Selesai (Otomatis)
                                </p>
                                <p className="mt-2 font-display text-3xl font-bold tabular-nums text-emerald-700">
                                    {summary.done.toLocaleString('id-ID')}
                                </p>
                            </div>
                            <div className="rounded-card border border-line bg-white p-5">
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate">
                                    Menerjemahkan
                                </p>
                                <p className="mt-2 font-display text-3xl font-bold tabular-nums text-amber-700">
                                    {summary.pending.toLocaleString('id-ID')}
                                </p>
                            </div>
                            <div className="rounded-card border border-line bg-white p-5">
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate">
                                    Gagal
                                </p>
                                <p className="mt-2 font-display text-3xl font-bold tabular-nums text-danger">
                                    {summary.failed.toLocaleString('id-ID')}
                                </p>
                            </div>
                            <div className="rounded-card border border-line bg-white p-5">
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate">
                                    Manual (Terkunci)
                                </p>
                                <p className="mt-2 font-display text-3xl font-bold tabular-nums text-navy">
                                    {summary.manual.toLocaleString('id-ID')}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                            {/* Pemakaian Karakter */}
                            <div className="rounded-card border border-line bg-white p-5 space-y-4">
                                <h2 className="font-display text-base font-bold text-navy">
                                    Pemakaian Karakter Terjemahan
                                </h2>
                                <div>
                                    <div className="flex items-center justify-between text-xs font-semibold text-ink">
                                        <span>Hari Ini</span>
                                        <span className="font-mono">
                                            {summary.dailyChars.toLocaleString('id-ID')} /{' '}
                                            {summary.dailyLimit.toLocaleString('id-ID')} karakter ({dailyPercent}%)
                                        </span>
                                    </div>
                                    <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-mist">
                                        <div
                                            className={cx(
                                                'h-full rounded-full transition-all',
                                                dailyPercent >= 90 ? 'bg-danger' : 'bg-ocean'
                                            )}
                                            style={{ width: `${dailyPercent}%` }}
                                        />
                                    </div>
                                </div>
                                <p className="text-xs text-slate">
                                    Total bulan ini:{' '}
                                    <strong className="font-mono text-navy">
                                        {summary.monthlyChars.toLocaleString('id-ID')} karakter
                                    </strong>
                                </p>
                            </div>

                            {/* Driver Aktif & Uji Koneksi */}
                            <div className="rounded-card border border-line bg-white p-5 space-y-4">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div>
                                        <h2 className="font-display text-base font-bold text-navy">
                                            Penyedia Terjemahan Aktif
                                        </h2>
                                        <p className="mt-1 text-xs text-slate">
                                            Driver:{' '}
                                            <strong className="font-mono uppercase text-navy">
                                                {summary.driver.active}
                                            </strong>
                                            {summary.driver.model ? ` (${summary.driver.model})` : ''} ·{' '}
                                            <span
                                                className={
                                                    summary.driver.configured
                                                        ? 'font-semibold text-emerald-700'
                                                        : 'font-semibold text-danger'
                                                }
                                            >
                                                {summary.driver.configured
                                                    ? 'Terkonfigurasi'
                                                    : 'Kunci API belum diatur di .env'}
                                            </span>
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        disabled={testingConnection}
                                        onClick={() => void handleTestConnection()}
                                        className={cx(
                                            'inline-flex h-10 shrink-0 items-center gap-2 rounded-control bg-ocean px-4 text-xs font-bold text-white hover:bg-navy disabled:opacity-50',
                                            focusRing
                                        )}
                                    >
                                        {testingConnection ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Wifi className="h-4 w-4" />
                                        )}
                                        <span>Uji koneksi</span>
                                    </button>
                                </div>

                                {connectionResult ? (
                                    <div
                                        className={cx(
                                            'rounded-control border px-3.5 py-2.5 text-xs',
                                            connectionResult.ok
                                                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                                                : 'border-danger/30 bg-rose-50 text-danger'
                                        )}
                                    >
                                        <p className="font-semibold">{connectionResult.message}</p>
                                        {connectionResult.sample ? (
                                            <p className="mt-1 font-mono text-[11px]">
                                                Contoh hasil: "{connectionResult.sample}" ({connectionResult.latencyMs} ms)
                                            </p>
                                        ) : null}
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    </div>
                ) : null}

                {/* TAB 2: KONTEN */}
                {tab === 'content' ? (
                    <div className="space-y-4">
                        <div className="rounded-card border border-line bg-white p-4 space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="flex flex-wrap items-center gap-2.5">
                                    <select
                                        value={typeFilter}
                                        onChange={(e) => {
                                            setTypeFilter(e.target.value);
                                            applyContentFilters({ type: e.target.value });
                                        }}
                                        aria-label="Filter jenis konten"
                                        className="h-10 rounded-control border border-line bg-white px-3 text-xs font-semibold text-navy focus:border-ocean focus:outline-none"
                                    >
                                        <option value="">Semua Jenis</option>
                                        {modelOptions.map((opt) => (
                                            <option key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>

                                    <select
                                        value={statusFilter}
                                        onChange={(e) => {
                                            setStatusFilter(e.target.value);
                                            applyContentFilters({ status: e.target.value });
                                        }}
                                        aria-label="Filter status terjemahan"
                                        className="h-10 rounded-control border border-line bg-white px-3 text-xs font-semibold text-navy focus:border-ocean focus:outline-none"
                                    >
                                        <option value="">Semua Status</option>
                                        <option value="done">Selesai</option>
                                        <option value="pending">Menerjemahkan</option>
                                        <option value="failed">Gagal</option>
                                        <option value="manual">Manual</option>
                                    </select>

                                    <div className="relative">
                                        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate" />
                                        <input
                                            type="search"
                                            value={searchInput}
                                            onChange={(e) => setSearchInput(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    applyContentFilters({ search: searchInput });
                                                }
                                            }}
                                            placeholder="Cari field atau hasil..."
                                            className="h-10 rounded-control border border-line bg-white pl-9 pr-3 text-xs text-ink focus:border-ocean focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    <button
                                        type="button"
                                        disabled={bulkBusy !== null}
                                        onClick={() => void handleBulkAction('failed')}
                                        className={cx(
                                            'inline-flex h-10 items-center gap-1.5 rounded-control border border-line bg-white px-3.5 text-xs font-semibold text-navy hover:border-ocean hover:bg-mist disabled:opacity-50',
                                            focusRing
                                        )}
                                    >
                                        <RefreshCw
                                            className={cx(
                                                'h-3.5 w-3.5 text-ocean',
                                                bulkBusy === 'failed' && 'animate-spin'
                                            )}
                                        />
                                        <span>Terjemahkan ulang yang gagal</span>
                                    </button>
                                    <button
                                        type="button"
                                        disabled={bulkBusy !== null}
                                        onClick={() => void handleBulkAction('missing')}
                                        className={cx(
                                            'inline-flex h-10 items-center gap-1.5 rounded-control bg-ocean px-3.5 text-xs font-semibold text-white hover:bg-navy disabled:opacity-50',
                                            focusRing
                                        )}
                                    >
                                        {bulkBusy === 'missing' ? (
                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        ) : (
                                            <Languages className="h-3.5 w-3.5" />
                                        )}
                                        <span>Terjemahkan semua yang belum</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto rounded-card border border-line bg-white">
                            <table className="w-full text-left text-xs">
                                <thead className="border-b border-line bg-mist/60 text-[11px] font-bold uppercase tracking-wider text-slate">
                                    <tr>
                                        <th className="px-4 py-3">Jenis</th>
                                        <th className="px-4 py-3">Konten &amp; Field</th>
                                        <th className="px-4 py-3">Bahasa</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3">Diperbarui</th>
                                        <th className="px-4 py-3 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-line">
                                    {translations.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-10 text-center text-slate">
                                                Belum ada data terjemahan untuk filter ini.
                                            </td>
                                        </tr>
                                    ) : (
                                        translations.data.map((row) => (
                                            <tr key={row.id} className="hover:bg-mist/30">
                                                <td className="px-4 py-3 font-semibold text-navy whitespace-nowrap">
                                                    {row.typeLabel}
                                                </td>
                                                <td className="px-4 py-3 max-w-xs">
                                                    <p className="font-semibold text-ink truncate">
                                                        {row.sourceTitle}
                                                    </p>
                                                    <p className="font-mono text-[11px] text-slate truncate">
                                                        {row.field}
                                                    </p>
                                                    {row.error ? (
                                                        <p className="mt-0.5 text-[11px] text-danger truncate">
                                                            {row.error}
                                                        </p>
                                                    ) : null}
                                                </td>
                                                <td className="px-4 py-3 font-mono uppercase text-slate">
                                                    {row.locale}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <StatusBadge status={row.status} />
                                                </td>
                                                <td className="px-4 py-3 text-slate whitespace-nowrap">
                                                    {row.updatedAt}
                                                </td>
                                                <td className="px-4 py-3 text-right whitespace-nowrap">
                                                    <div className="inline-flex items-center gap-1.5">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setInspectRow(row);
                                                                setManualDraft(row.translatedText ?? '');
                                                            }}
                                                            className={cx(
                                                                'inline-flex h-8 items-center gap-1 rounded-control border border-line bg-white px-2.5 text-[11px] font-semibold text-navy hover:border-ocean hover:bg-mist',
                                                                focusRing
                                                            )}
                                                        >
                                                            <Eye className="h-3.5 w-3.5 text-ocean" />
                                                            <span>Edit manual</span>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            disabled={rowBusyId === row.id}
                                                            onClick={() => void handleRetranslateRow(row)}
                                                            className={cx(
                                                                'inline-flex h-8 items-center gap-1 rounded-control border border-line bg-white px-2.5 text-[11px] font-semibold text-navy hover:border-ocean hover:bg-mist disabled:opacity-50',
                                                                focusRing
                                                            )}
                                                        >
                                                            <RefreshCw
                                                                className={cx(
                                                                    'h-3.5 w-3.5 text-ocean',
                                                                    rowBusyId === row.id && 'animate-spin'
                                                                )}
                                                            />
                                                            <span>Terjemahkan ulang</span>
                                                        </button>
                                                        {row.isManual ? (
                                                            <button
                                                                type="button"
                                                                disabled={rowBusyId === row.id}
                                                                onClick={() => void handleRevertAutoRow(row)}
                                                                className={cx(
                                                                    'inline-flex h-8 items-center gap-1 rounded-control border border-line bg-white px-2.5 text-[11px] font-semibold text-slate hover:border-ocean hover:text-navy disabled:opacity-50',
                                                                    focusRing
                                                                )}
                                                            >
                                                                <Unlock className="h-3.5 w-3.5" />
                                                                <span>Otomatis</span>
                                                            </button>
                                                        ) : null}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : null}

                {/* TAB 3: GLOSARIUM */}
                {tab === 'glossary' ? (
                    <div className="space-y-5">
                        {/* Form Tambah / Ubah Glosarium */}
                        <form
                            onSubmit={(e) => void handleGlossarySubmit(e)}
                            className="rounded-card border border-line bg-white p-5 space-y-4"
                        >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <h2 className="font-display text-base font-bold text-navy">
                                    {glossaryForm.id ? 'Ubah Istilah Glosarium' : 'Tambah Istilah Glosarium'}
                                </h2>
                                <div className="flex items-center gap-2">
                                    <a
                                        href="/admin/terjemahan/glosarium/ekspor"
                                        className={cx(
                                            'inline-flex h-9 items-center gap-1.5 rounded-control border border-line bg-white px-3 text-xs font-semibold text-navy hover:border-ocean hover:bg-mist',
                                            focusRing
                                        )}
                                    >
                                        <Download className="h-3.5 w-3.5 text-ocean" />
                                        <span>Ekspor CSV</span>
                                    </a>
                                    <input
                                        ref={csvInputRef}
                                        type="file"
                                        accept=".csv,text/csv"
                                        className="hidden"
                                        onChange={(e) => {
                                            const f = e.target.files?.[0];
                                            if (f) void handleImportCsv(f);
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => csvInputRef.current?.click()}
                                        className={cx(
                                            'inline-flex h-9 items-center gap-1.5 rounded-control border border-line bg-white px-3 text-xs font-semibold text-navy hover:border-ocean hover:bg-mist',
                                            focusRing
                                        )}
                                    >
                                        <Upload className="h-3.5 w-3.5 text-ocean" />
                                        <span>Impor CSV</span>
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                                <input
                                    type="text"
                                    required
                                    value={glossaryForm.source}
                                    onChange={(e) =>
                                        setGlossaryForm((p) => ({ ...p, source: e.target.value }))
                                    }
                                    placeholder="Istilah Sumber (ID), mis. Pembudidaya"
                                    className="h-10 rounded-control border border-line px-3 text-sm text-ink focus:border-ocean focus:outline-none"
                                />
                                <input
                                    type="text"
                                    required
                                    value={glossaryForm.target}
                                    onChange={(e) =>
                                        setGlossaryForm((p) => ({ ...p, target: e.target.value }))
                                    }
                                    placeholder="Terjemahan (EN), mis. Fish farmer"
                                    className="h-10 rounded-control border border-line px-3 text-sm text-ink focus:border-ocean focus:outline-none"
                                />
                                <input
                                    type="text"
                                    value={glossaryForm.note}
                                    onChange={(e) =>
                                        setGlossaryForm((p) => ({ ...p, note: e.target.value }))
                                    }
                                    placeholder="Catatan opsional"
                                    className="h-10 rounded-control border border-line px-3 text-sm text-ink focus:border-ocean focus:outline-none"
                                />
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <label className="inline-flex items-center gap-2 text-xs text-slate cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={glossaryForm.case_sensitive}
                                        onChange={(e) =>
                                            setGlossaryForm((p) => ({
                                                ...p,
                                                case_sensitive: e.target.checked,
                                            }))
                                        }
                                        className="rounded border-line text-ocean"
                                    />
                                    <span>Peka huruf besar/kecil (case-sensitive)</span>
                                </label>
                                <div className="flex items-center gap-2">
                                    {glossaryForm.id ? (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setGlossaryForm({
                                                    id: null,
                                                    source: '',
                                                    target: '',
                                                    note: '',
                                                    case_sensitive: false,
                                                })
                                            }
                                            className="inline-flex h-9 items-center rounded-control border border-line px-3 text-xs font-semibold text-slate hover:text-navy"
                                        >
                                            Batal
                                        </button>
                                    ) : null}
                                    <button
                                        type="submit"
                                        disabled={savingGlossary}
                                        className={cx(
                                            'inline-flex h-9 items-center gap-1.5 rounded-control bg-ocean px-4 text-xs font-bold text-white hover:bg-navy disabled:opacity-50',
                                            focusRing
                                        )}
                                    >
                                        <Plus className="h-3.5 w-3.5" />
                                        <span>{glossaryForm.id ? 'Simpan Perubahan' : 'Tambah Istilah'}</span>
                                    </button>
                                </div>
                            </div>
                        </form>

                        {/* Pencarian & Tabel Glosarium */}
                        <div className="rounded-card border border-line bg-white overflow-hidden">
                            <div className="flex items-center justify-between gap-2 border-b border-line p-4">
                                <div className="relative max-w-sm flex-1">
                                    <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate" />
                                    <input
                                        type="search"
                                        value={glossarySearch}
                                        onChange={(e) => setGlossarySearch(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                router.get(
                                                    '/admin/terjemahan',
                                                    { tab: 'glossary', glossary_search: glossarySearch },
                                                    { preserveState: true, replace: true }
                                                );
                                            }
                                        }}
                                        placeholder="Cari istilah glosarium..."
                                        className="h-9 w-full rounded-control border border-line pl-9 pr-3 text-xs focus:border-ocean focus:outline-none"
                                    />
                                </div>
                                <span className="text-xs text-slate">
                                    {glossary.length} istilah
                                </span>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead className="border-b border-line bg-mist/60 text-[11px] font-bold uppercase tracking-wider text-slate">
                                        <tr>
                                            <th className="px-4 py-3">Sumber (ID)</th>
                                            <th className="px-4 py-3">Terjemahan (EN)</th>
                                            <th className="px-4 py-3">Catatan</th>
                                            <th className="px-4 py-3 text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-line">
                                        {glossary.map((item) => (
                                            <tr key={item.id} className="hover:bg-mist/30">
                                                <td className="px-4 py-3 font-semibold text-navy">
                                                    {item.source}
                                                </td>
                                                <td className="px-4 py-3 text-ink">{item.target}</td>
                                                <td className="px-4 py-3 text-slate">
                                                    {item.note || '-'}
                                                </td>
                                                <td className="px-4 py-3 text-right whitespace-nowrap">
                                                    <div className="inline-flex items-center gap-1.5">
                                                        <button
                                                            type="button"
                                                            disabled={applyingGlossaryId === item.id}
                                                            onClick={() => void handleApplyGlossary(item)}
                                                            className={cx(
                                                                'inline-flex h-8 items-center gap-1 rounded-control border border-line bg-white px-2.5 text-[11px] font-semibold text-ocean hover:border-ocean hover:bg-mist disabled:opacity-50',
                                                                focusRing
                                                            )}
                                                        >
                                                            <Check className="h-3.5 w-3.5" />
                                                            <span>Terapkan ke konten terkait</span>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setGlossaryForm({
                                                                    id: item.id,
                                                                    source: item.source,
                                                                    target: item.target,
                                                                    note: item.note ?? '',
                                                                    case_sensitive: item.caseSensitive,
                                                                })
                                                            }
                                                            aria-label={`Ubah ${item.source}`}
                                                            className="inline-flex h-8 w-8 items-center justify-center rounded-control border border-line text-slate hover:border-ocean hover:text-navy"
                                                        >
                                                            <PenLine className="h-3.5 w-3.5" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => void handleDeleteGlossary(item)}
                                                            aria-label={`Hapus ${item.source}`}
                                                            className="inline-flex h-8 w-8 items-center justify-center rounded-control border border-line text-slate hover:border-danger hover:text-danger"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                ) : null}

                {/* TAB 4: PENGATURAN */}
                {tab === 'settings' ? (
                    <form
                        onSubmit={(e) => void handleSaveSettings(e)}
                        className="max-w-xl rounded-card border border-line bg-white p-6 space-y-5"
                    >
                        <div>
                            <h2 className="font-display text-base font-bold text-navy">
                                Pengaturan Mesin Terjemahan
                            </h2>
                            <p className="mt-1 text-xs text-slate">
                                Kunci API hanya disimpan di variabel lingkungan server (.env) dan tidak pernah ditampilkan di antarmuka ini.
                            </p>
                        </div>

                        <div className="rounded-control border border-line bg-mist/50 p-3.5 text-xs">
                            <p className="font-semibold text-navy">
                                Driver Aktif:{' '}
                                <span className="font-mono uppercase">{settings.driver.active}</span>
                            </p>
                            <p className="mt-0.5 text-slate">
                                Status kredensial:{' '}
                                <strong
                                    className={
                                        settings.driver.configured
                                            ? 'text-emerald-700'
                                            : 'text-danger'
                                    }
                                >
                                    {settings.driver.configured ? 'Terkonfigurasi' : 'Belum diisi'}
                                </strong>
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label
                                    htmlFor="daily_char_limit"
                                    className="block text-xs font-bold text-navy"
                                >
                                    Batas Karakter Harian
                                </label>
                                <input
                                    id="daily_char_limit"
                                    type="number"
                                    min={1000}
                                    max={10000000}
                                    value={dailyLimit}
                                    onChange={(e) => setDailyLimit(Number(e.target.value))}
                                    className="mt-1.5 h-10 w-full rounded-control border border-line px-3 text-sm text-ink focus:border-ocean focus:outline-none"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="batch_size"
                                    className="block text-xs font-bold text-navy"
                                >
                                    Ukuran Batch per Permintaan
                                </label>
                                <input
                                    id="batch_size"
                                    type="number"
                                    min={1}
                                    max={100}
                                    value={batchSize}
                                    onChange={(e) => setBatchSize(Number(e.target.value))}
                                    className="mt-1.5 h-10 w-full rounded-control border border-line px-3 text-sm text-ink focus:border-ocean focus:outline-none"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="failed_alert_threshold"
                                    className="block text-xs font-bold text-navy"
                                >
                                    Ambang Notifikasi Gagal di Dasbor Superadmin
                                </label>
                                <input
                                    id="failed_alert_threshold"
                                    type="number"
                                    min={1}
                                    max={500}
                                    value={failedThreshold}
                                    onChange={(e) => setFailedThreshold(Number(e.target.value))}
                                    className="mt-1.5 h-10 w-full rounded-control border border-line px-3 text-sm text-ink focus:border-ocean focus:outline-none"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={savingSettings}
                            className={cx(
                                'inline-flex h-10 items-center gap-2 rounded-control bg-ocean px-4 text-xs font-bold text-white hover:bg-navy disabled:opacity-50',
                                focusRing
                            )}
                        >
                            {savingSettings ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Save className="h-4 w-4" />
                            )}
                            <span>Simpan Pengaturan</span>
                        </button>
                    </form>
                ) : null}
            </div>

            {/* Modal Lihat & Edit Manual Berdampingan (ID | EN) */}
            {inspectRow ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="fixed inset-0 bg-ink/50"
                        onClick={() => setInspectRow(null)}
                        aria-hidden="true"
                    />
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-label="Edit Manual Terjemahan"
                        className="relative z-10 w-full max-w-3xl rounded-card border border-line bg-white p-6 shadow-lift space-y-4"
                    >
                        <div className="flex items-start justify-between gap-3 border-b border-line pb-3">
                            <div>
                                <h3 className="font-display text-base font-bold text-navy">
                                    {inspectRow.sourceTitle}
                                </h3>
                                <p className="font-mono text-xs text-slate">
                                    {inspectRow.typeLabel} · {inspectRow.field} ({inspectRow.locale.toUpperCase()})
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setInspectRow(null)}
                                aria-label="Tutup dialog"
                                className="inline-flex h-8 w-8 items-center justify-center rounded-control text-slate hover:bg-mist hover:text-navy"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <p className="mb-1.5 text-xs font-bold text-navy">
                                    Sumber (Bahasa Indonesia)
                                </p>
                                <div className="max-h-64 overflow-y-auto rounded-control border border-line bg-mist/40 p-3 text-sm text-ink whitespace-pre-wrap break-words">
                                    {inspectRow.sourceText || '-'}
                                </div>
                            </div>
                            <div>
                                <label
                                    htmlFor="manual-translation-textarea"
                                    className="mb-1.5 block text-xs font-bold text-navy"
                                >
                                    Terjemahan ({inspectRow.locale.toUpperCase()}) — Edit Manual
                                </label>
                                <textarea
                                    id="manual-translation-textarea"
                                    rows={8}
                                    value={manualDraft}
                                    onChange={(e) => setManualDraft(e.target.value)}
                                    className="block w-full rounded-control border border-line p-3 text-sm text-ink focus:border-ocean focus:outline-none focus:ring-2 focus:ring-ocean/15"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 border-t border-line pt-3">
                            <button
                                type="button"
                                onClick={() => setInspectRow(null)}
                                className="inline-flex h-9 items-center rounded-control border border-line px-4 text-xs font-semibold text-slate hover:text-navy"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                disabled={savingManual || manualDraft.trim() === ''}
                                onClick={() => void handleSaveManual()}
                                className={cx(
                                    'inline-flex h-9 items-center gap-1.5 rounded-control bg-ocean px-4 text-xs font-bold text-white hover:bg-navy disabled:opacity-50',
                                    focusRing
                                )}
                            >
                                {savingManual ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                    <Lock className="h-3.5 w-3.5" />
                                )}
                                <span>Simpan &amp; Kunci Manual</span>
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}
        </AdminLayout>
    );
}
