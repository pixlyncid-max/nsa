import Container from '@/Components/layout/Container';
import type { OrgMemberItem } from '@/Components/sections/organization/MemberCard';
import OrganizationEmptyState from '@/Components/sections/organization/OrganizationEmptyState';
import OrganizationLayout from '@/Components/sections/organization/OrganizationLayout';
import OrganizationSkeleton from '@/Components/sections/organization/OrganizationSkeleton';
import RegionLeadershipView from '@/Components/sections/organization/RegionLeadershipView';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';
import { cx } from '@/lib/cx';
import { focusRing } from '@/lib/ui';
import { Head, router } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRight, MapPin, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';

interface ProvinceOption {
    id: number;
    name: string;
    slug: string;
    dpc_count?: number;
}

interface RegencyOption {
    id: number;
    name: string;
    slug: string;
    has_dpc?: boolean;
}

interface DpcData {
    id: number;
    name: string;
    address: string;
    phone: string;
    email: string;
    period: string;
    regency: RegencyOption;
    members: OrgMemberItem[];
}

interface DpcProps {
    provinces: ProvinceOption[];
    regencies: RegencyOption[];
    selectedProvince: ProvinceOption | null;
    selectedRegency: RegencyOption | null;
    dpc: DpcData | null;
}

type ActiveStep = 'province' | 'regency' | 'result';

export default function Dpc({
    provinces,
    regencies,
    selectedProvince,
    selectedRegency,
    dpc,
}: DpcProps) {
    const reduced = usePrefersReducedMotion();
    const [activeStep, setActiveStep] = useState<ActiveStep>(
        selectedRegency ? 'result' : selectedProvince ? 'regency' : 'province'
    );
    const [activeLetter, setActiveLetter] = useState<string>('ALL');
    const [provinceSearch, setProvinceSearch] = useState('');
    const [regencySearch, setRegencySearch] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Kumpulkan huruf awal provinsi yang tersedia secara alfabetis
    const availableLetters = useMemo(() => {
        const set = new Set<string>();
        provinces.forEach((p) => {
            const first = p.name.trim()[0]?.toUpperCase();
            if (first) set.add(first);
        });
        return Array.from(set).sort();
    }, [provinces]);

    // Filter & kelompokkan provinsi menurut abjad
    const groupedProvinces = useMemo(() => {
        const q = provinceSearch.trim().toLowerCase();
        const filtered = provinces.filter((p) => {
            const matchQuery = !q || p.name.toLowerCase().includes(q);
            const matchLetter =
                activeLetter === 'ALL' ||
                p.name.trim().toUpperCase().startsWith(activeLetter);
            return matchQuery && matchLetter;
        });

        const groups = new Map<string, ProvinceOption[]>();
        filtered.forEach((p) => {
            const letter = p.name.trim()[0]?.toUpperCase() || '#';
            const list = groups.get(letter) ?? [];
            list.push(p);
            groups.set(letter, list);
        });

        return Array.from(groups.entries()).sort(([a], [b]) =>
            a.localeCompare(b)
        );
    }, [provinces, provinceSearch, activeLetter]);

    // Filter chip kabupaten/kota
    const filteredRegencies = useMemo(() => {
        const q = regencySearch.trim().toLowerCase();
        if (!q) return regencies;
        return regencies.filter((r) => r.name.toLowerCase().includes(q));
    }, [regencies, regencySearch]);

    const handleSelectProvince = (provSlug: string) => {
        setRegencySearch('');
        router.get(
            '/organisasi/dpc',
            { provinsi: provSlug },
            {
                preserveState: true,
                preserveScroll: true,
                onStart: () => setIsLoading(true),
                onSuccess: () => setActiveStep('regency'),
                onFinish: () => setIsLoading(false),
            }
        );
    };

    const handleSelectRegency = (regSlug: string) => {
        router.get(
            '/organisasi/dpc',
            {
                provinsi: selectedProvince?.slug ?? '',
                kota: regSlug,
            },
            {
                preserveState: true,
                preserveScroll: true,
                onStart: () => setIsLoading(true),
                onSuccess: () => setActiveStep('result'),
                onFinish: () => setIsLoading(false),
            }
        );
    };

    return (
        <OrganizationLayout
            current="dpc"
            title="Dewan Pengurus Cabang (DPC)"
            description="Garda terdepan asosiasi di tingkat kabupaten dan kota yang mendampingi petambak, pembenih, dan pelaku usaha perikanan secara langsung."
            barMeta={
                <span>
                    {selectedProvince ? selectedProvince.name : 'Pilih Provinsi'}
                    {selectedRegency ? ` · ${selectedRegency.name}` : ''}
                </span>
            }
        >
            <Head>
                <title>
                    {selectedRegency
                        ? `DPC ${selectedRegency.name} · Organisasi NSA`
                        : 'Dewan Pengurus Cabang (DPC) · Organisasi NSA'}
                </title>
                <meta
                    name="description"
                    content="Susunan Dewan Pengurus Cabang (DPC) tingkat kabupaten/kota NSA (Nusantara Sustainable Aquatic)."
                />
            </Head>

            <section className="bg-mist/40 py-10 sm:py-14">
                <Container className="space-y-8">
                    {/* Breadcrumb Interaktif Bertingkat: Provinsi -> Kabupaten/Kota -> Hasil */}
                    <nav
                        aria-label="Langkah pemilihan wilayah DPC"
                        className="flex flex-wrap items-center gap-2 rounded-card border border-line bg-white p-3.5 shadow-soft sm:p-4"
                    >
                        <button
                            type="button"
                            onClick={() => setActiveStep('province')}
                            className={cx(
                                'inline-flex min-h-[40px] items-center gap-2 rounded-control px-3.5 py-1.5 text-xs font-bold transition-colors',
                                focusRing,
                                activeStep === 'province'
                                    ? 'bg-navy text-white'
                                    : 'bg-mist text-navy hover:bg-ocean/10 hover:text-ocean'
                            )}
                        >
                            <span
                                className={cx(
                                    'flex h-5 w-5 items-center justify-center rounded-full text-[10px]',
                                    activeStep === 'province'
                                        ? 'bg-aqua text-navy'
                                        : 'bg-white text-ocean'
                                )}
                            >
                                1
                            </span>
                            <span>
                                {selectedProvince
                                    ? selectedProvince.name
                                    : 'Pilih Provinsi'}
                            </span>
                        </button>

                        <ChevronRight
                            aria-hidden="true"
                            className="h-4 w-4 text-slate"
                        />

                        <button
                            type="button"
                            disabled={!selectedProvince}
                            onClick={() => setActiveStep('regency')}
                            className={cx(
                                'inline-flex min-h-[40px] items-center gap-2 rounded-control px-3.5 py-1.5 text-xs font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50',
                                focusRing,
                                activeStep === 'regency'
                                    ? 'bg-navy text-white'
                                    : 'bg-mist text-navy hover:bg-ocean/10 hover:text-ocean'
                            )}
                        >
                            <span
                                className={cx(
                                    'flex h-5 w-5 items-center justify-center rounded-full text-[10px]',
                                    activeStep === 'regency'
                                        ? 'bg-aqua text-navy'
                                        : 'bg-white text-ocean'
                                )}
                            >
                                2
                            </span>
                            <span>
                                {selectedRegency
                                    ? selectedRegency.name
                                    : 'Pilih Kabupaten / Kota'}
                            </span>
                        </button>

                        <ChevronRight
                            aria-hidden="true"
                            className="h-4 w-4 text-slate"
                        />

                        <button
                            type="button"
                            disabled={!selectedRegency}
                            onClick={() => setActiveStep('result')}
                            className={cx(
                                'inline-flex min-h-[40px] items-center gap-2 rounded-control px-3.5 py-1.5 text-xs font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50',
                                focusRing,
                                activeStep === 'result'
                                    ? 'bg-navy text-white'
                                    : 'bg-mist text-navy hover:bg-ocean/10 hover:text-ocean'
                            )}
                        >
                            <span
                                className={cx(
                                    'flex h-5 w-5 items-center justify-center rounded-full text-[10px]',
                                    activeStep === 'result'
                                        ? 'bg-aqua text-navy'
                                        : 'bg-white text-ocean'
                                )}
                            >
                                3
                            </span>
                            <span>Pengurus DPC</span>
                        </button>
                    </nav>

                    {/* Panel Langkah 1: Daftar Huruf Abjad Provinsi */}
                    {activeStep === 'province' ? (
                        <div className="rounded-card border border-line bg-white p-6 shadow-soft sm:p-8">
                            <div className="flex flex-col justify-between gap-4 border-b border-line pb-5 sm:flex-row sm:items-end">
                                <div>
                                    <span className="text-xs font-bold uppercase tracking-wider text-ocean">
                                        Langkah 1 dari 2
                                    </span>
                                    <h2 className="mt-1 font-display text-2xl font-bold text-navy">
                                        Pilih Provinsi
                                    </h2>
                                </div>

                                <div className="relative w-full sm:w-64">
                                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" />
                                    <input
                                        type="text"
                                        value={provinceSearch}
                                        onChange={(e) => {
                                            setProvinceSearch(e.target.value);
                                            setActiveLetter('ALL');
                                        }}
                                        placeholder="Cari nama provinsi..."
                                        aria-label="Cari nama provinsi"
                                        className={cx(
                                            'h-10 w-full rounded-control border border-line bg-mist/60 pl-9 pr-8 text-xs font-medium text-ink placeholder:text-slate focus:border-ocean focus:bg-white',
                                            focusRing
                                        )}
                                    />
                                    {provinceSearch ? (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setProvinceSearch('')
                                            }
                                            aria-label="Hapus pencarian provinsi"
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate hover:text-navy"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    ) : null}
                                </div>
                            </div>

                            {/* Indeks Huruf Abjad */}
                            <div
                                role="group"
                                aria-label="Filter huruf abjad provinsi"
                                className="mt-5 flex flex-wrap gap-1.5"
                            >
                                <button
                                    type="button"
                                    onClick={() => setActiveLetter('ALL')}
                                    className={cx(
                                        'inline-flex h-9 items-center justify-center rounded-control px-3 text-xs font-bold transition-colors',
                                        focusRing,
                                        activeLetter === 'ALL'
                                            ? 'bg-navy text-white'
                                            : 'border border-line bg-mist text-slate hover:border-ocean hover:text-navy'
                                    )}
                                >
                                    Semua
                                </button>
                                {availableLetters.map((letter) => (
                                    <button
                                        key={letter}
                                        type="button"
                                        onClick={() => setActiveLetter(letter)}
                                        className={cx(
                                            'inline-flex h-9 w-9 items-center justify-center rounded-control text-xs font-bold transition-colors',
                                            focusRing,
                                            activeLetter === letter
                                                ? 'bg-navy text-white'
                                                : 'border border-line bg-white text-ink hover:border-ocean hover:text-ocean'
                                        )}
                                    >
                                        {letter}
                                    </button>
                                ))}
                            </div>

                            {/* Daftar Provinsi Dikelompokkan Per Huruf */}
                            <div className="mt-6 space-y-6">
                                {groupedProvinces.length > 0 ? (
                                    groupedProvinces.map(([letter, list]) => (
                                        <div
                                            key={letter}
                                            className="grid gap-3 border-t border-line/70 pt-4 sm:grid-cols-12"
                                        >
                                            <div className="sm:col-span-1">
                                                <span className="font-display text-xl font-extrabold text-ocean">
                                                    {letter}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-2 sm:col-span-11">
                                                {list.map((prov) => {
                                                    const isSelected =
                                                        prov.slug ===
                                                        selectedProvince?.slug;
                                                    return (
                                                        <button
                                                            key={prov.id}
                                                            type="button"
                                                            onClick={() =>
                                                                handleSelectProvince(
                                                                    prov.slug
                                                                )
                                                            }
                                                            className={cx(
                                                                'inline-flex min-h-[40px] items-center gap-2 rounded-control border px-3.5 py-2 text-xs font-semibold transition-colors',
                                                                focusRing,
                                                                isSelected
                                                                    ? 'border-navy bg-navy text-white'
                                                                    : 'border-line bg-white text-ink hover:border-ocean hover:text-ocean'
                                                            )}
                                                        >
                                                            <span>
                                                                {prov.name}
                                                            </span>
                                                            {prov.dpc_count &&
                                                            prov.dpc_count >
                                                                0 ? (
                                                                <span
                                                                    className={cx(
                                                                        'rounded-full px-1.5 py-0.5 text-[10px] font-bold',
                                                                        isSelected
                                                                            ? 'bg-aqua text-navy'
                                                                            : 'bg-ocean/10 text-ocean'
                                                                    )}
                                                                >
                                                                    {
                                                                        prov.dpc_count
                                                                    }{' '}
                                                                    DPC
                                                                </span>
                                                            ) : null}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="py-8 text-center text-sm text-slate">
                                        Tidak ada provinsi yang cocok dengan
                                        pencarian.
                                    </p>
                                )}
                            </div>
                        </div>
                    ) : null}

                    {/* Panel Langkah 2: Chip Kabupaten/Kota yang Bisa Dicari */}
                    {selectedProvince && activeStep !== 'province' ? (
                        <div className="rounded-card border border-line bg-white p-6 shadow-soft sm:p-8">
                            <div className="flex flex-col justify-between gap-4 border-b border-line pb-5 md:flex-row md:items-end">
                                <div>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <span className="text-xs font-bold uppercase tracking-wider text-ocean">
                                            Kabupaten / Kota di{' '}
                                            {selectedProvince.name}
                                        </span>
                                        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate">
                                            <span className="h-2.5 w-2.5 rounded-full bg-ocean" />
                                            Sudah ada DPC
                                        </span>
                                    </div>
                                    <h2 className="mt-1 font-display text-xl font-bold text-navy sm:text-2xl">
                                        Pilih Kabupaten atau Kota
                                    </h2>
                                </div>

                                <div className="relative w-full md:w-72">
                                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" />
                                    <input
                                        type="text"
                                        value={regencySearch}
                                        onChange={(e) =>
                                            setRegencySearch(e.target.value)
                                        }
                                        placeholder="Cari kabupaten atau kota..."
                                        aria-label="Cari kabupaten atau kota"
                                        className={cx(
                                            'h-10 w-full rounded-control border border-line bg-mist/60 pl-9 pr-8 text-xs font-medium text-ink placeholder:text-slate focus:border-ocean focus:bg-white',
                                            focusRing
                                        )}
                                    />
                                    {regencySearch ? (
                                        <button
                                            type="button"
                                            onClick={() => setRegencySearch('')}
                                            aria-label="Hapus pencarian kota"
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate hover:text-navy"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    ) : null}
                                </div>
                            </div>

                            <div className="mt-5 flex flex-wrap gap-2">
                                {filteredRegencies.length > 0 ? (
                                    filteredRegencies.map((reg) => {
                                        const isSelected =
                                            reg.slug === selectedRegency?.slug;
                                        return (
                                            <button
                                                key={reg.id}
                                                type="button"
                                                onClick={() =>
                                                    handleSelectRegency(
                                                        reg.slug
                                                    )
                                                }
                                                aria-pressed={isSelected}
                                                className={cx(
                                                    'inline-flex min-h-[40px] items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors',
                                                    focusRing,
                                                    isSelected
                                                        ? 'border-navy bg-navy text-white shadow-xs'
                                                        : 'border-line bg-white text-ink hover:border-ocean hover:bg-mist/50 hover:text-ocean'
                                                )}
                                            >
                                                {reg.has_dpc ? (
                                                    <span
                                                        title="DPC Aktif"
                                                        className={cx(
                                                            'h-2 w-2 shrink-0 rounded-full',
                                                            isSelected
                                                                ? 'bg-aqua'
                                                                : 'bg-ocean'
                                                        )}
                                                    />
                                                ) : null}
                                                <span>{reg.name}</span>
                                            </button>
                                        );
                                    })
                                ) : (
                                    <p className="py-4 text-xs text-slate">
                                        Kabupaten/kota &ldquo;{regencySearch}
                                        &rdquo; tidak ditemukan di{' '}
                                        {selectedProvince.name}.
                                    </p>
                                )}
                            </div>
                        </div>
                    ) : null}

                    {/* Panel Langkah 3: Hasil Pengurus DPC (Tata Letak Sama dengan DPW) */}
                    {selectedRegency ? (
                        <div>
                            <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate">
                                <MapPin className="h-3.5 w-3.5 text-ocean" />
                                <span>
                                    Hasil Pencarian · {selectedRegency.name},{' '}
                                    {selectedProvince?.name}
                                </span>
                            </div>

                            {isLoading ? (
                                <OrganizationSkeleton />
                            ) : (
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={`${selectedProvince?.slug}-${selectedRegency.slug}`}
                                        initial={
                                            reduced
                                                ? undefined
                                                : { opacity: 0, x: 18 }
                                        }
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={
                                            reduced
                                                ? undefined
                                                : { opacity: 0, x: -18 }
                                        }
                                        transition={{
                                            duration: 0.24,
                                            ease: 'easeOut',
                                        }}
                                    >
                                        {dpc ? (
                                            <RegionLeadershipView
                                                level="DPC"
                                                regionName={
                                                    selectedRegency.name
                                                }
                                                data={dpc}
                                            />
                                        ) : (
                                            <OrganizationEmptyState
                                                type="DPC"
                                                regionName={
                                                    selectedRegency.name
                                                }
                                            />
                                        )}
                                    </motion.div>
                                </AnimatePresence>
                            )}
                        </div>
                    ) : null}
                </Container>
            </section>
        </OrganizationLayout>
    );
}
