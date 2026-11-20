import Container from '@/Components/layout/Container';
import DpwMiniMap, {
    type DpwProvinceOption,
} from '@/Components/sections/organization/DpwMiniMap';
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
import { Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';

interface DpwData {
    id: number;
    name: string;
    address: string;
    phone: string;
    email: string;
    period: string;
    province: DpwProvinceOption;
    members: OrgMemberItem[];
}

interface DpwProps {
    provinces: DpwProvinceOption[];
    selectedProvince: DpwProvinceOption | null;
    dpw: DpwData | null;
}

export default function Dpw({ provinces, selectedProvince, dpw }: DpwProps) {
    const reduced = usePrefersReducedMotion();
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const activeDpwCount = useMemo(
        () => provinces.filter((p) => p.has_dpw).length,
        [provinces]
    );

    const filteredProvinces = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return provinces;
        return provinces.filter((p) => p.name.toLowerCase().includes(q));
    }, [provinces, search]);

    const handleSelectProvince = (slug: string) => {
        if (slug === selectedProvince?.slug) return;
        router.get(
            '/organisasi/dpw',
            { provinsi: slug },
            {
                preserveState: true,
                preserveScroll: true,
                onStart: () => setIsLoading(true),
                onFinish: () => setIsLoading(false),
            }
        );
    };

    return (
        <OrganizationLayout
            current="dpw"
            title="Dewan Pengurus Wilayah (DPW)"
            description="Koordinator tingkat provinsi yang membina keanggotaan, bermitra dengan dinas kelautan dan perikanan daerah, serta memfasilitasi pembudidaya lokal."
            barMeta={
                <span>
                    <strong className="text-navy">{activeDpwCount}</strong> DPW
                    Aktif · Terpilih:{' '}
                    <strong className="text-ocean">
                        {selectedProvince?.name ?? 'Belum dipilih'}
                    </strong>
                </span>
            }
        >
            <Head>
                <title>
                    {selectedProvince
                        ? `DPW ${selectedProvince.name} · Organisasi NSA`
                        : 'Dewan Pengurus Wilayah (DPW) · Organisasi NSA'}
                </title>
                <meta
                    name="description"
                    content="Susunan Dewan Pengurus Wilayah (DPW) tingkat provinsi NSA (Nusantara Sustainable Aquatic)."
                />
            </Head>

            <section className="bg-mist/40 py-10 sm:py-14">
                <Container>
                    <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
                        {/* Kolom Kiri (4 kolom): Peta Kecil + Daftar Provinsi Berpencarian (Sticky di Desktop) */}
                        <aside
                            className="space-y-4 lg:sticky lg:col-span-4"
                            style={{
                                top: 'calc(var(--header-h, 72px) + 74px)',
                            }}
                        >
                            <DpwMiniMap
                                provinces={provinces}
                                selectedSlug={selectedProvince?.slug}
                                onSelectProvince={handleSelectProvince}
                            />

                            {/* Daftar Provinsi dengan Pencarian */}
                            <div className="overflow-hidden rounded-card border border-line bg-white shadow-soft">
                                <div className="border-b border-line p-3.5">
                                    <label
                                        htmlFor="dpw-province-search"
                                        className="sr-only"
                                    >
                                        Cari provinsi
                                    </label>
                                    <div className="relative">
                                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" />
                                        <input
                                            id="dpw-province-search"
                                            type="text"
                                            value={search}
                                            onChange={(e) =>
                                                setSearch(e.target.value)
                                            }
                                            placeholder="Cari provinsi..."
                                            className={cx(
                                                'h-10 w-full rounded-control border border-line bg-mist/60 pl-9 pr-8 text-xs font-medium text-ink placeholder:text-slate focus:border-ocean focus:bg-white',
                                                focusRing
                                            )}
                                        />
                                        {search ? (
                                            <button
                                                type="button"
                                                onClick={() => setSearch('')}
                                                aria-label="Hapus pencarian provinsi"
                                                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate hover:text-navy"
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </button>
                                        ) : null}
                                    </div>
                                </div>

                                <ul
                                    aria-label="Daftar provinsi DPW"
                                    className="max-h-[340px] divide-y divide-line/60 overflow-y-auto p-1.5"
                                >
                                    {filteredProvinces.length > 0 ? (
                                        filteredProvinces.map((prov) => {
                                            const isSelected =
                                                prov.slug ===
                                                selectedProvince?.slug;
                                            return (
                                                <li key={prov.id}>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleSelectProvince(
                                                                prov.slug
                                                            )
                                                        }
                                                        aria-pressed={
                                                            isSelected
                                                        }
                                                        className={cx(
                                                            'flex min-h-[42px] w-full items-center justify-between gap-2 rounded-control px-3 py-2 text-left text-xs font-semibold transition-colors',
                                                            focusRing,
                                                            isSelected
                                                                ? 'bg-navy text-white'
                                                                : 'text-ink hover:bg-mist hover:text-ocean'
                                                        )}
                                                    >
                                                        <span className="truncate">
                                                            {prov.name}
                                                        </span>
                                                        {prov.has_dpw ? (
                                                            <span
                                                                title="DPW Aktif"
                                                                className={cx(
                                                                    'h-2 w-2 shrink-0 rounded-full',
                                                                    isSelected
                                                                        ? 'bg-aqua'
                                                                        : 'bg-ocean'
                                                                )}
                                                            />
                                                        ) : null}
                                                    </button>
                                                </li>
                                            );
                                        })
                                    ) : (
                                        <li className="px-3 py-6 text-center text-xs text-slate">
                                            Provinsi &ldquo;{search}&rdquo;
                                            tidak ditemukan.
                                        </li>
                                    )}
                                </ul>
                            </div>
                        </aside>

                        {/* Kolom Kanan (8 kolom): Hasil Kepengurusan DPW dengan Transisi Geser */}
                        <div className="min-w-0 lg:col-span-8">
                            {isLoading ? (
                                <OrganizationSkeleton />
                            ) : (
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={selectedProvince?.slug ?? 'empty'}
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
                                        {dpw ? (
                                            <RegionLeadershipView
                                                level="DPW"
                                                regionName={
                                                    selectedProvince?.name ??
                                                    dpw.province.name
                                                }
                                                data={dpw}
                                            />
                                        ) : (
                                            <OrganizationEmptyState
                                                type="DPW"
                                                regionName={
                                                    selectedProvince?.name ??
                                                    'Provinsi Ini'
                                                }
                                            />
                                        )}
                                    </motion.div>
                                </AnimatePresence>
                            )}
                        </div>
                    </div>
                </Container>
            </section>
        </OrganizationLayout>
    );
}
