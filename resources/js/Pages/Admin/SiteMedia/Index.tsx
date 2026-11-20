import Button from '@/Components/ui/Button';
import AdminLayout from '@/Layouts/AdminLayout';
import { cx } from '@/lib/cx';
import { focusRing } from '@/lib/ui';
import { router } from '@inertiajs/react';
import {
    CheckCircle2,
    Image as ImageIcon,
    Loader2,
    RotateCcw,
    Sparkles,
    Upload,
} from 'lucide-react';
import { ChangeEvent, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

interface MediaGroup {
    key: string;
    label: string;
}

interface SiteMediaItem {
    key: string;
    group: string;
    groupLabel: string;
    label: string;
    hint: string;
    recommended: string;
    aspect: string;
    darkPreview: boolean;
    uploadedUrl: string | null;
    defaultUrl: string | null;
    previewUrl: string | null;
    isCustom: boolean;
}

interface Props {
    groups: MediaGroup[];
    items: SiteMediaItem[];
}

export default function SiteMediaIndex({ groups, items }: Props) {
    const [activeGroup, setActiveGroup] = useState<string>('all');
    const [busySlot, setBusySlot] = useState<string | null>(null);
    const [failedPreview, setFailedPreview] = useState<Record<string, boolean>>(
        {}
    );
    const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

    const filteredItems = useMemo(() => {
        if (activeGroup === 'all') {
            return items;
        }
        return items.filter((item) => item.group === activeGroup);
    }, [items, activeGroup]);

    const customCount = useMemo(
        () => items.filter((item) => item.isCustom).length,
        [items]
    );

    const handlePickFile = (slotKey: string) => {
        fileInputRefs.current[slotKey]?.click();
    };

    const handleFileChange = (
        item: SiteMediaItem,
        e: ChangeEvent<HTMLInputElement>
    ) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) {
            return;
        }

        setBusySlot(item.key);
        router.post(
            `/admin/gambar-website/${item.key}`,
            { image: file },
            {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => {
                    setFailedPreview((prev) => ({ ...prev, [item.key]: false }));
                    toast.success(`"${item.label}" berhasil diperbarui.`);
                },
                onError: (errors) => {
                    toast.error(
                        errors.image ||
                            `Gagal mengunggah gambar untuk "${item.label}".`
                    );
                },
                onFinish: () => {
                    setBusySlot(null);
                },
            }
        );
    };

    const handleReset = (item: SiteMediaItem) => {
        if (
            !window.confirm(
                `Kembalikan "${item.label}" ke gambar bawaan? Gambar yang diunggah akan dihapus.`
            )
        ) {
            return;
        }

        setBusySlot(item.key);
        router.delete(`/admin/gambar-website/${item.key}`, {
            preserveScroll: true,
            onSuccess: () => {
                setFailedPreview((prev) => ({ ...prev, [item.key]: false }));
                toast.success(`"${item.label}" dikembalikan ke bawaan.`);
            },
            onError: () => {
                toast.error(`Gagal mengembalikan "${item.label}".`);
            },
            onFinish: () => {
                setBusySlot(null);
            },
        });
    };

    return (
        <AdminLayout title="Gambar Website">
            <div className="space-y-6">
                {/* Ringkasan & Keterangan */}
                <div className="rounded-card border border-line bg-white p-5 shadow-xs sm:p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="font-display text-lg font-bold text-navy">
                                Kelola Semua Gambar &amp; Foto Website
                            </h2>
                            <p className="mt-1 text-sm text-slate">
                                Unggah atau ganti logo, banner hero, strip
                                ajakan, kartu eksplorasi produk, dan foto
                                halaman Tentang Kami tanpa perlu mengubah kode.
                                Perubahan langsung tampil di website publik.
                            </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-3">
                            <div className="rounded-control border border-line bg-mist/60 px-3.5 py-2 text-right">
                                <div className="text-[11px] font-bold uppercase tracking-wider text-slate">
                                    Slot Kustom
                                </div>
                                <div className="font-display text-lg font-extrabold text-navy">
                                    {customCount} / {items.length}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tab Filter Kelompok */}
                    <div
                        role="tablist"
                        aria-label="Filter kelompok gambar"
                        className="mt-5 flex flex-wrap gap-2 border-t border-line pt-4"
                    >
                        <button
                            type="button"
                            role="tab"
                            aria-selected={activeGroup === 'all'}
                            onClick={() => setActiveGroup('all')}
                            className={cx(
                                'inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors',
                                focusRing,
                                activeGroup === 'all'
                                    ? 'bg-navy text-white shadow-xs'
                                    : 'bg-mist text-slate hover:bg-mist/80 hover:text-navy'
                            )}
                        >
                            <span>Semua</span>
                            <span
                                className={cx(
                                    'rounded-full px-1.5 py-0.5 text-[10px]',
                                    activeGroup === 'all'
                                        ? 'bg-white/20 text-white'
                                        : 'bg-white text-slate'
                                )}
                            >
                                {items.length}
                            </span>
                        </button>

                        {groups.map((group) => {
                            const count = items.filter(
                                (it) => it.group === group.key
                            ).length;
                            const isActive = activeGroup === group.key;

                            return (
                                <button
                                    key={group.key}
                                    type="button"
                                    role="tab"
                                    aria-selected={isActive}
                                    onClick={() => setActiveGroup(group.key)}
                                    className={cx(
                                        'inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors',
                                        focusRing,
                                        isActive
                                            ? 'bg-navy text-white shadow-xs'
                                            : 'bg-mist text-slate hover:bg-mist/80 hover:text-navy'
                                    )}
                                >
                                    <span>{group.label}</span>
                                    <span
                                        className={cx(
                                            'rounded-full px-1.5 py-0.5 text-[10px]',
                                            isActive
                                                ? 'bg-white/20 text-white'
                                                : 'bg-white text-slate'
                                        )}
                                    >
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Grid Kartu Slot Gambar */}
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {filteredItems.map((item) => {
                        const isLogo = item.key.startsWith('brand_logo_');
                        const isBusy = busySlot === item.key;
                        const acceptTypes = isLogo
                            ? 'image/jpeg,image/png,image/webp,image/svg+xml'
                            : 'image/jpeg,image/png,image/webp';
                        const showImage =
                            Boolean(item.previewUrl) &&
                            !failedPreview[item.key];

                        return (
                            <article
                                key={item.key}
                                className="flex flex-col overflow-hidden rounded-card border border-line bg-white shadow-xs transition-shadow hover:shadow-soft"
                            >
                                {/* Pratinjau Gambar */}
                                <div
                                    className={cx(
                                        'relative flex h-44 w-full items-center justify-center overflow-hidden border-b border-line',
                                        item.darkPreview
                                            ? 'bg-navy'
                                            : 'bg-mist/70'
                                    )}
                                >
                                    {showImage ? (
                                        <img
                                            src={item.previewUrl!}
                                            alt={item.label}
                                            onError={() =>
                                                setFailedPreview((prev) => ({
                                                    ...prev,
                                                    [item.key]: true,
                                                }))
                                            }
                                            className={cx(
                                                'h-full w-full',
                                                isLogo
                                                    ? 'object-contain p-5'
                                                    : 'object-cover'
                                            )}
                                        />
                                    ) : (
                                        <div
                                            className={cx(
                                                'flex flex-col items-center gap-2 text-center px-4',
                                                item.darkPreview
                                                    ? 'text-white/70'
                                                    : 'text-slate'
                                            )}
                                        >
                                            <ImageIcon className="h-9 w-9 opacity-60" />
                                            <span className="text-xs font-medium">
                                                Belum ada gambar
                                            </span>
                                        </div>
                                    )}

                                    {/* Badge Status */}
                                    <div className="absolute left-3 top-3 flex items-center gap-1.5">
                                        <span className="rounded-full bg-navy/85 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-xs">
                                            {item.groupLabel}
                                        </span>
                                        {item.isCustom ? (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-xs">
                                                <CheckCircle2 className="h-3 w-3" />
                                                Diunggah
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate shadow-xs">
                                                <Sparkles className="h-3 w-3 text-ocean" />
                                                Bawaan
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Detail & Aksi */}
                                <div className="flex flex-1 flex-col justify-between p-4">
                                    <div>
                                        <h3 className="font-display text-sm font-bold text-navy">
                                            {item.label}
                                        </h3>
                                        {item.hint ? (
                                            <p className="mt-1 text-xs leading-relaxed text-slate">
                                                {item.hint}
                                            </p>
                                        ) : null}
                                        {item.recommended ? (
                                            <p className="mt-2 inline-block rounded-control bg-mist px-2 py-0.5 text-[11px] font-medium text-ink">
                                                Rekomendasi: {item.recommended}
                                            </p>
                                        ) : null}
                                    </div>

                                    <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-3">
                                        <input
                                            ref={(el) => {
                                                fileInputRefs.current[
                                                    item.key
                                                ] = el;
                                            }}
                                            type="file"
                                            accept={acceptTypes}
                                            onChange={(e) =>
                                                handleFileChange(item, e)
                                            }
                                            className="sr-only"
                                            aria-label={`Unggah gambar untuk ${item.label}`}
                                        />

                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="primary"
                                            disabled={isBusy}
                                            onClick={() =>
                                                handlePickFile(item.key)
                                            }
                                            className="flex-1 justify-center gap-1.5"
                                        >
                                            {isBusy ? (
                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                            ) : (
                                                <Upload className="h-3.5 w-3.5" />
                                            )}
                                            <span>
                                                {item.isCustom
                                                    ? 'Ganti Gambar'
                                                    : 'Unggah Gambar'}
                                            </span>
                                        </Button>

                                        {item.isCustom ? (
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="secondary"
                                                disabled={isBusy}
                                                onClick={() =>
                                                    handleReset(item)
                                                }
                                                title="Kembalikan ke gambar bawaan"
                                                className="gap-1.5 text-slate hover:text-navy"
                                            >
                                                <RotateCcw className="h-3.5 w-3.5" />
                                                <span>Bawaan</span>
                                            </Button>
                                        ) : null}
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            </div>
        </AdminLayout>
    );
}
