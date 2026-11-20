import ImportSiteTextsModal from '@/Components/admin/site-texts/ImportSiteTextsModal';
import RevisionDrawer from '@/Components/admin/site-texts/RevisionDrawer';
import SiteTextField from '@/Components/admin/site-texts/SiteTextField';
import type {
    SiteTextGroupSummary,
    SiteTextItem,
} from '@/Components/admin/site-texts/types';
import AdminLayout from '@/Layouts/AdminLayout';
import { cx } from '@/lib/cx';
import { focusRing } from '@/lib/ui';
import type { PageProps } from '@/types';
import { router } from '@inertiajs/react';
import axios from 'axios';
import {
    AlertCircle,
    Download,
    ExternalLink,
    Loader2,
    Save,
    Search,
    Upload,
    X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

type SiteTextsIndexProps = PageProps<{
    groups: SiteTextGroupSummary[];
    activeGroup: string;
    items: SiteTextItem[];
    totalKeys: number;
    filters: {
        search: string;
        filter: 'all' | 'changed';
    };
}>;

const SECTION_LABELS: Record<string, string> = {
    nav: 'Navigasi',
    megamenu: 'Mega-Menu Produk',
    user_menu: 'Menu Akun Pengguna',
    button: 'Tombol Umum',
    action: 'Aksi & Aksesibilitas',
    banner: 'Banner & Ajakan',
    promo: 'Banner Promo Keanggotaan',
    cta: 'Ajakan Keanggotaan Dinamis',
    footer: 'Footer',
    toast: 'Notifikasi Toast',
    hero: 'Hero',
    map: 'Peta Sebaran',
    news: 'Berita Terkini',
    header: 'Header Halaman',
    dpp: 'DPP',
    dpw: 'DPW',
    dpc: 'DPC',
    card: 'Kartu Produk',
    drawer: 'Drawer Keranjang',
    empty: 'Keadaan Kosong',
    checkout: 'Checkout',
    vision: 'Visi & Misi',
    programs: 'Program Kerja',
    form: 'Formulir',
    search: 'Pencarian',
    detail: 'Detail Artikel',
    faq: 'FAQ',
    login: 'Masuk',
    register: 'Daftar',
    dashboard: 'Dasbor',
    profile: 'Profil',
    orders: 'Pesanan',
    invoices: 'Iuran & Administrasi',
    wizard: 'Wizard Pendaftaran',
    progress: 'Progres Langkah',
    submit: 'Pengiriman',
    welcome: 'Email Selamat Datang',
};

function formatSectionLabel(section: string): string {
    if (SECTION_LABELS[section]) {
        return SECTION_LABELS[section];
    }
    return section
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function Index({
    groups,
    activeGroup,
    items,
    filters,
}: SiteTextsIndexProps) {
    const [searchInput, setSearchInput] = useState(filters.search);
    const [activeFilter, setActiveFilter] = useState<'all' | 'changed'>(filters.filter);
    const [isNavigating, setIsNavigating] = useState(false);

    const [drafts, setDrafts] = useState<Record<string, string>>({});
    const [enDrafts, setEnDrafts] = useState<Record<string, string>>({});
    const [savingKeys, setSavingKeys] = useState<Record<string, boolean>>({});
    const [savingEnKeys, setSavingEnKeys] = useState<Record<string, boolean>>({});
    const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
    const [enServerErrors, setEnServerErrors] = useState<Record<string, string>>({});
    const [isBulkSaving, setIsBulkSaving] = useState(false);
    const [globalError, setGlobalError] = useState<string | null>(null);

    const [historyTarget, setHistoryTarget] = useState<{
        key: string;
        label: string;
    } | null>(null);
    const [importOpen, setImportOpen] = useState(false);

    const searchTimerRef = useRef<number | null>(null);

    // Hitung daftar key yang sedang diubah namun belum disimpan
    const dirtyItems = useMemo(() => {
        return items.filter((item) => {
            if (!Object.prototype.hasOwnProperty.call(drafts, item.key)) {
                return false;
            }
            return drafts[item.key] !== item.currentValue;
        });
    }, [items, drafts]);

    const hasUnsavedChanges = dirtyItems.length > 0;

    // Peringatan keluar halaman jika masih ada perubahan belum disimpan
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (!hasUnsavedChanges) return;
            e.preventDefault();
            e.returnValue = '';
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [hasUnsavedChanges]);

    useEffect(() => {
        const removeListener = router.on('before', (event) => {
            if (!hasUnsavedChanges) return true;
            if (event.detail.visit.method !== 'get') return true;
            return window.confirm(
                'Masih ada perubahan teks yang belum disimpan. Yakin ingin meninggalkan halaman ini?'
            );
        });

        return () => {
            removeListener();
        };
    }, [hasUnsavedChanges]);

    const visitGroup = (
        groupName: string,
        nextSearch: string,
        nextFilter: 'all' | 'changed'
    ) => {
        setIsNavigating(true);
        const query: Record<string, string> = {};
        if (nextSearch.trim() !== '') query.search = nextSearch.trim();
        if (nextFilter !== 'all') query.filter = nextFilter;

        router.get(`/admin/teks-website/${groupName}`, query, {
            preserveState: true,
            preserveScroll: false,
            replace: true,
            onFinish: () => setIsNavigating(false),
        });
    };

    const handleSearchChange = (value: string) => {
        setSearchInput(value);
        if (searchTimerRef.current) {
            window.clearTimeout(searchTimerRef.current);
        }
        searchTimerRef.current = window.setTimeout(() => {
            visitGroup(activeGroup, value, activeFilter);
        }, 300);
    };

    const handleFilterChange = (nextFilter: 'all' | 'changed') => {
        setActiveFilter(nextFilter);
        visitGroup(activeGroup, searchInput, nextFilter);
    };

    const handleGroupChange = (groupName: string) => {
        setSearchInput('');
        visitGroup(groupName, '', activeFilter);
    };

    const handleDraftChange = (key: string, nextValue: string) => {
        setDrafts((prev) => ({ ...prev, [key]: nextValue }));
        setServerErrors((prev) => {
            if (!prev[key]) return prev;
            const clone = { ...prev };
            delete clone[key];
            return clone;
        });
    };

    const handleEnDraftChange = (key: string, nextValue: string) => {
        setEnDrafts((prev) => ({ ...prev, [key]: nextValue }));
        setEnServerErrors((prev) => {
            if (!prev[key]) return prev;
            const clone = { ...prev };
            delete clone[key];
            return clone;
        });
    };

    const handleSaveSingleEn = async (item: SiteTextItem) => {
        const valueToSave = enDrafts[item.key] ?? item.currentEnValue;
        setSavingEnKeys((prev) => ({ ...prev, [item.key]: true }));
        setGlobalError(null);

        try {
            const res = await axios.put(
                `/admin/teks-website/${encodeURIComponent(item.key)}`,
                { value: valueToSave, locale: 'en' },
                { headers: { Accept: 'application/json' } }
            );
            toast.success(res.data.message || 'Teks Inggris disimpan dan dikunci manual.');

            setEnDrafts((prev) => {
                const clone = { ...prev };
                delete clone[item.key];
                return clone;
            });

            router.reload({ only: ['groups', 'items'] });
        } catch (err: unknown) {
            let message = 'Gagal menyimpan teks Inggris.';
            if (axios.isAxiosError(err)) {
                const errors = err.response?.data?.errors;
                const firstError =
                    errors?.value?.[0] ||
                    errors?.key?.[0] ||
                    err.response?.data?.message;
                if (typeof firstError === 'string' && firstError.trim() !== '') {
                    message = firstError;
                }
            }
            setEnServerErrors((prev) => ({ ...prev, [item.key]: message }));
            toast.error(message);
        } finally {
            setSavingEnKeys((prev) => {
                const clone = { ...prev };
                delete clone[item.key];
                return clone;
            });
        }
    };

    const handleRetranslateEn = async (item: SiteTextItem) => {
        setSavingEnKeys((prev) => ({ ...prev, [item.key]: true }));
        setGlobalError(null);

        try {
            const res = await axios.post(
                `/admin/teks-website/${encodeURIComponent(item.key)}/terjemahkan-ulang`,
                {},
                { headers: { Accept: 'application/json' } }
            );
            toast.success(res.data.message || 'Terjemahan Inggris sedang diproses ulang.');
            router.reload({ only: ['groups', 'items'] });
        } catch {
            toast.error('Gagal memicu terjemahan ulang.');
        } finally {
            setSavingEnKeys((prev) => {
                const clone = { ...prev };
                delete clone[item.key];
                return clone;
            });
        }
    };

    const handleRevertEnToAuto = async (item: SiteTextItem) => {
        setSavingEnKeys((prev) => ({ ...prev, [item.key]: true }));
        setGlobalError(null);

        try {
            const res = await axios.post(
                `/admin/teks-website/${encodeURIComponent(item.key)}/otomatis`,
                {},
                { headers: { Accept: 'application/json' } }
            );
            toast.success(res.data.message || 'Versi Inggris dikembalikan ke mode otomatis.');
            setEnDrafts((prev) => {
                const clone = { ...prev };
                delete clone[item.key];
                return clone;
            });
            router.reload({ only: ['groups', 'items'] });
        } catch {
            toast.error('Gagal mengembalikan ke mode otomatis.');
        } finally {
            setSavingEnKeys((prev) => {
                const clone = { ...prev };
                delete clone[item.key];
                return clone;
            });
        }
    };

    const handleSaveSingle = async (item: SiteTextItem) => {
        const valueToSave = drafts[item.key] ?? item.currentValue;
        setSavingKeys((prev) => ({ ...prev, [item.key]: true }));
        setGlobalError(null);

        try {
            const res = await axios.put(
                `/admin/teks-website/${encodeURIComponent(item.key)}`,
                { value: valueToSave },
                { headers: { Accept: 'application/json' } }
            );
            toast.success(res.data.message || 'Teks berhasil disimpan.');

            setDrafts((prev) => {
                const clone = { ...prev };
                delete clone[item.key];
                return clone;
            });

            router.reload({ only: ['groups', 'items'] });
        } catch (err: unknown) {
            let message = 'Gagal menyimpan teks.';
            if (axios.isAxiosError(err)) {
                const errors = err.response?.data?.errors;
                const firstError =
                    errors?.value?.[0] ||
                    errors?.key?.[0] ||
                    err.response?.data?.message;
                if (typeof firstError === 'string' && firstError.trim() !== '') {
                    message = firstError;
                }
            }
            setServerErrors((prev) => ({ ...prev, [item.key]: message }));
            toast.error(message);
        } finally {
            setSavingKeys((prev) => {
                const clone = { ...prev };
                delete clone[item.key];
                return clone;
            });
        }
    };

    const handleResetSingle = async (item: SiteTextItem) => {
        setSavingKeys((prev) => ({ ...prev, [item.key]: true }));
        setGlobalError(null);

        try {
            const res = await axios.post(
                `/admin/teks-website/${encodeURIComponent(item.key)}/reset`,
                {},
                { headers: { Accept: 'application/json' } }
            );
            toast.success(res.data.message || 'Teks dikembalikan ke nilai bawaan.');

            setDrafts((prev) => {
                const clone = { ...prev };
                delete clone[item.key];
                return clone;
            });

            router.reload({ only: ['groups', 'items'] });
        } catch {
            toast.error('Gagal mengembalikan teks ke nilai bawaan.');
        } finally {
            setSavingKeys((prev) => {
                const clone = { ...prev };
                delete clone[item.key];
                return clone;
            });
        }
    };

    const handleSaveAll = async () => {
        if (dirtyItems.length === 0) return;
        setIsBulkSaving(true);
        setGlobalError(null);

        try {
            const payload = dirtyItems.map((item) => ({
                key: item.key,
                value: drafts[item.key] ?? item.currentValue,
            }));

            const res = await axios.put(
                '/admin/teks-website/simpan-banyak',
                { items: payload },
                { headers: { Accept: 'application/json' } }
            );

            toast.success(res.data.message || 'Semua perubahan teks berhasil disimpan.');

            setDrafts((prev) => {
                const clone = { ...prev };
                for (const item of dirtyItems) {
                    delete clone[item.key];
                }
                return clone;
            });

            router.reload({ only: ['groups', 'items'] });
        } catch (err: unknown) {
            let message = 'Sebagian perubahan gagal disimpan. Periksa kembali kolom yang bermasalah.';
            if (axios.isAxiosError(err)) {
                const errors = err.response?.data?.errors;
                if (errors && typeof errors === 'object') {
                    const firstVal = Object.values(errors).flat()[0];
                    if (typeof firstVal === 'string') {
                        message = firstVal;
                    }
                } else if (typeof err.response?.data?.message === 'string') {
                    message = err.response.data.message;
                }
            }
            setGlobalError(message);
            toast.error(message);
        } finally {
            setIsBulkSaving(false);
        }
    };

    const activeGroupObj = useMemo(
        () => groups.find((g) => g.name === activeGroup) ?? groups[0],
        [groups, activeGroup]
    );

    // Kelompokkan item per bagian (mis. Beranda -> Hero, Peta, Berita)
    const groupedSections = useMemo(() => {
        const map = new Map<
            string,
            {
                id: string;
                title: string;
                publicUrl: string | null;
                items: SiteTextItem[];
            }
        >();

        for (const item of items) {
            const sectionId = `${item.group}.${item.section}`;
            if (!map.has(sectionId)) {
                map.set(sectionId, {
                    id: sectionId,
                    title: `${item.groupLabel} → ${formatSectionLabel(item.section)}`,
                    publicUrl: item.publicUrl,
                    items: [],
                });
            }
            map.get(sectionId)!.items.push(item);
        }

        return Array.from(map.values());
    }, [items]);

    return (
        <AdminLayout title="Teks Website">
            <div className="space-y-6">
                {/* Bar Atas: Pencarian Global, Filter, & Simpan Semua */}
                <div className="rounded-card border border-line bg-white p-4 sm:p-5 space-y-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        {/* Pencarian Global */}
                        <div className="relative flex-1 max-w-xl">
                            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" />
                            <input
                                type="search"
                                value={searchInput}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                placeholder="Cari key, label, atau isi teks di seluruh website..."
                                aria-label="Cari teks website"
                                className={cx(
                                    'block h-10 w-full rounded-control border border-line bg-white pl-10 pr-9 text-sm text-ink placeholder:text-slate focus:border-ocean focus:outline-none focus:ring-2 focus:ring-ocean/15'
                                )}
                            />
                            {searchInput ? (
                                <button
                                    type="button"
                                    onClick={() => handleSearchChange('')}
                                    aria-label="Hapus pencarian"
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-slate hover:text-navy"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            ) : null}
                        </div>

                        {/* Filter + Tombol Simpan Semua */}
                        <div className="flex flex-wrap items-center gap-2.5">
                            <div
                                className="inline-flex rounded-control border border-line bg-mist/60 p-1"
                                role="group"
                                aria-label="Filter status teks"
                            >
                                <button
                                    type="button"
                                    onClick={() => handleFilterChange('all')}
                                    className={cx(
                                        'rounded px-3 py-1.5 text-xs font-semibold transition-colors',
                                        activeFilter === 'all'
                                            ? 'bg-navy text-white'
                                            : 'text-slate hover:text-navy'
                                    )}
                                >
                                    Semua
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleFilterChange('changed')}
                                    className={cx(
                                        'rounded px-3 py-1.5 text-xs font-semibold transition-colors',
                                        activeFilter === 'changed'
                                            ? 'bg-navy text-white'
                                            : 'text-slate hover:text-navy'
                                    )}
                                >
                                    Hanya yang diubah
                                </button>
                            </div>

                            <a
                                href="/admin/teks-website/ekspor"
                                className={cx(
                                    'inline-flex h-10 items-center gap-1.5 rounded-control border border-line bg-white px-3.5 text-xs font-semibold text-navy transition-colors hover:border-ocean hover:bg-mist',
                                    focusRing
                                )}
                            >
                                <Download className="h-3.5 w-3.5 text-ocean" />
                                <span>Ekspor</span>
                            </a>

                            <button
                                type="button"
                                onClick={() => setImportOpen(true)}
                                className={cx(
                                    'inline-flex h-10 items-center gap-1.5 rounded-control border border-line bg-white px-3.5 text-xs font-semibold text-navy transition-colors hover:border-ocean hover:bg-mist',
                                    focusRing
                                )}
                            >
                                <Upload className="h-3.5 w-3.5 text-ocean" />
                                <span>Impor</span>
                            </button>

                            <button
                                type="button"
                                disabled={!hasUnsavedChanges || isBulkSaving}
                                onClick={() => void handleSaveAll()}
                                className={cx(
                                    'inline-flex h-10 items-center gap-2 rounded-control bg-ocean px-4 text-xs font-bold text-white transition-colors hover:bg-navy disabled:cursor-not-allowed disabled:opacity-45',
                                    focusRing
                                )}
                            >
                                {isBulkSaving ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Save className="h-4 w-4" />
                                )}
                                <span>
                                    Simpan Semua
                                    {hasUnsavedChanges ? ` (${dirtyItems.length})` : ''}
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Dropdown Kelompok untuk Mobile */}
                    <div className="lg:hidden">
                        <label
                            htmlFor="mobile-copy-group"
                            className="block text-xs font-bold text-navy mb-1.5"
                        >
                            Kelompok Teks
                        </label>
                        <select
                            id="mobile-copy-group"
                            value={activeGroup}
                            onChange={(e) => handleGroupChange(e.target.value)}
                            className="block h-10 w-full rounded-control border border-line bg-white px-3 text-sm font-medium text-navy focus:border-ocean focus:outline-none focus:ring-2 focus:ring-ocean/15"
                        >
                            {groups.map((g) => (
                                <option key={g.name} value={g.name}>
                                    {g.label} ({g.total}
                                    {g.customized > 0 ? ` · ${g.customized} diubah` : ''})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {globalError ? (
                    <div
                        role="alert"
                        className="flex items-start gap-2.5 rounded-card border border-danger/30 bg-rose-50/70 px-4 py-3 text-sm text-danger"
                    >
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>{globalError}</span>
                    </div>
                ) : null}

                {/* Tata Letak Dua Kolom */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
                    {/* Kiri: Sidebar Kelompok (Desktop) */}
                    <aside
                        aria-label="Daftar kelompok teks"
                        className="hidden lg:block lg:col-span-3 sticky top-6 rounded-card border border-line bg-white p-2.5"
                    >
                        <p className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate">
                            Kelompok Teks
                        </p>
                        <nav className="space-y-0.5">
                            {groups.map((group) => {
                                const isActive =
                                    searchInput.trim() === '' && group.name === activeGroup;
                                return (
                                    <button
                                        key={group.name}
                                        type="button"
                                        onClick={() => handleGroupChange(group.name)}
                                        className={cx(
                                            'flex w-full items-center justify-between gap-2 rounded-control px-3 py-2 text-left text-xs font-semibold transition-colors',
                                            focusRing,
                                            isActive
                                                ? 'bg-navy text-white'
                                                : 'text-ink hover:bg-mist hover:text-navy'
                                        )}
                                    >
                                        <span className="truncate">{group.label}</span>
                                        <span className="flex shrink-0 items-center gap-1.5">
                                            {group.customized > 0 ? (
                                                <span
                                                    className={cx(
                                                        'rounded-full px-1.5 py-0.5 text-[10px] font-bold',
                                                        isActive
                                                            ? 'bg-aqua/20 text-aqua'
                                                            : 'bg-ocean/10 text-ocean'
                                                    )}
                                                >
                                                    {group.customized} diubah
                                                </span>
                                            ) : null}
                                            <span
                                                className={cx(
                                                    'font-mono text-[11px]',
                                                    isActive ? 'text-white/75' : 'text-slate'
                                                )}
                                            >
                                                {group.total}
                                            </span>
                                        </span>
                                    </button>
                                );
                            })}
                        </nav>
                    </aside>

                    {/* Kanan: Daftar Kolom Teks */}
                    <div className="lg:col-span-9 space-y-6">
                        {/* Header Kelompok Aktif */}
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
                            <div>
                                <h2 className="font-display text-lg font-bold text-navy">
                                    {searchInput.trim() !== ''
                                        ? `Hasil Pencarian: "${searchInput.trim()}"`
                                        : activeGroupObj?.label ?? 'Teks Website'}
                                </h2>
                                <p className="text-xs text-slate">
                                    Menampilkan {items.length} teks
                                    {activeFilter === 'changed' ? ' (hanya yang diubah)' : ''}.
                                    Tekan Enter atau klik di luar kolom untuk menyimpan otomatis.
                                </p>
                            </div>

                            {searchInput.trim() === '' && activeGroupObj?.publicUrl ? (
                                <a
                                    href={activeGroupObj.publicUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={cx(
                                        'inline-flex h-9 items-center gap-1.5 rounded-control border border-line bg-white px-3.5 text-xs font-semibold text-navy transition-colors hover:border-ocean hover:bg-mist',
                                        focusRing
                                    )}
                                >
                                    <span>Buka Halaman</span>
                                    <ExternalLink className="h-3.5 w-3.5 text-ocean" />
                                </a>
                            ) : null}
                        </div>

                        {/* Loading Skeleton */}
                        {isNavigating ? (
                            <div className="space-y-4" aria-busy="true">
                                {[1, 2, 3].map((idx) => (
                                    <div
                                        key={idx}
                                        className="animate-pulse rounded-card border border-line bg-white p-5 space-y-3"
                                    >
                                        <div className="h-4 w-48 rounded bg-mist" />
                                        <div className="h-3 w-72 rounded bg-mist" />
                                        <div className="h-10 w-full rounded bg-mist" />
                                    </div>
                                ))}
                            </div>
                        ) : groupedSections.length === 0 ? (
                            /* Keadaan Kosong */
                            <div className="rounded-card border border-dashed border-line bg-mist/40 px-6 py-12 text-center">
                                <p className="font-display text-base font-bold text-navy">
                                    Tidak ada teks yang cocok
                                </p>
                                <p className="mt-1 text-xs text-slate">
                                    {activeFilter === 'changed'
                                        ? 'Belum ada teks yang diubah dari nilai bawaan pada filter ini.'
                                        : 'Coba kata kunci pencarian lain atau pilih kelompok teks berbeda.'}
                                </p>
                                {(searchInput !== '' || activeFilter === 'changed') ? (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearchInput('');
                                            setActiveFilter('all');
                                            visitGroup(activeGroup, '', 'all');
                                        }}
                                        className={cx(
                                            'mt-4 inline-flex h-9 items-center rounded-control bg-navy px-4 text-xs font-semibold text-white hover:bg-ocean',
                                            focusRing
                                        )}
                                    >
                                        Reset Pencarian &amp; Filter
                                    </button>
                                ) : null}
                            </div>
                        ) : (
                            /* Daftar Bagian & Kolom Teks */
                            <div className="space-y-8">
                                {groupedSections.map((section) => (
                                    <section key={section.id} className="space-y-3.5">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className="h-4 w-1 rounded-full bg-aqua"
                                                    aria-hidden="true"
                                                />
                                                <h3 className="font-display text-sm font-bold text-navy">
                                                    {section.title}
                                                </h3>
                                                <span className="rounded-full bg-mist px-2 py-0.5 font-mono text-[11px] text-slate">
                                                    {section.items.length}
                                                </span>
                                            </div>

                                            {section.publicUrl ? (
                                                <a
                                                    href={section.publicUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={cx(
                                                        'inline-flex items-center gap-1 text-xs font-semibold text-ocean hover:text-navy',
                                                        focusRing
                                                    )}
                                                >
                                                    <span>Buka Halaman</span>
                                                    <ExternalLink className="h-3 w-3" />
                                                </a>
                                            ) : null}
                                        </div>

                                        <div className="space-y-3.5">
                                            {section.items.map((item) => {
                                                const draftValue =
                                                    drafts[item.key] ?? item.currentValue;
                                                const isDirty = draftValue !== item.currentValue;
                                                const enDraftValue =
                                                    enDrafts[item.key] ?? item.currentEnValue;
                                                const isEnDirty =
                                                    enDraftValue !== item.currentEnValue;

                                                return (
                                                    <SiteTextField
                                                        key={item.key}
                                                        item={item}
                                                        draftValue={draftValue}
                                                        enDraftValue={enDraftValue}
                                                        isDirty={isDirty}
                                                        isEnDirty={isEnDirty}
                                                        isSaving={Boolean(savingKeys[item.key])}
                                                        isEnSaving={Boolean(savingEnKeys[item.key])}
                                                        serverError={serverErrors[item.key]}
                                                        enServerError={enServerErrors[item.key]}
                                                        onChange={(val) =>
                                                            handleDraftChange(item.key, val)
                                                        }
                                                        onChangeEn={(val) =>
                                                            handleEnDraftChange(item.key, val)
                                                        }
                                                        onSave={() => handleSaveSingle(item)}
                                                        onSaveEn={() => handleSaveSingleEn(item)}
                                                        onReset={() => handleResetSingle(item)}
                                                        onRetranslateEn={() =>
                                                            handleRetranslateEn(item)
                                                        }
                                                        onRevertEnToAuto={() =>
                                                            handleRevertEnToAuto(item)
                                                        }
                                                        onOpenHistory={() =>
                                                            setHistoryTarget({
                                                                key: item.key,
                                                                label: item.label,
                                                            })
                                                        }
                                                    />
                                                );
                                            })}
                                        </div>
                                    </section>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Laci Riwayat Perubahan */}
            <RevisionDrawer
                activeKey={historyTarget?.key ?? null}
                activeLabel={historyTarget?.label ?? ''}
                onClose={() => setHistoryTarget(null)}
                onRestored={(key) => {
                    setDrafts((prev) => {
                        const clone = { ...prev };
                        delete clone[key];
                        return clone;
                    });
                    router.reload({ only: ['groups', 'items'] });
                }}
            />

            {/* Dialog Impor JSON */}
            <ImportSiteTextsModal
                open={importOpen}
                onClose={() => setImportOpen(false)}
                onApplied={() => router.reload({ only: ['groups', 'items'] })}
            />
        </AdminLayout>
    );
}
