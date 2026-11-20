import {
    INDONESIA_PROVINCES,
    type ProvinceMapItem,
} from '@/Components/sections/home/indonesiaMapData';
import { cx } from '@/lib/cx';
import { useMemo, useState } from 'react';

export interface DpwProvinceOption {
    id: number;
    name: string;
    slug: string;
    has_dpw?: boolean;
}

interface DpwMiniMapProps {
    provinces: DpwProvinceOption[];
    selectedSlug?: string | null;
    onSelectProvince: (slug: string) => void;
    className?: string;
}

/**
 * Peta Indonesia ringkas untuk kolom pemilih DPW.
 * Provinsi dengan DPW aktif ditandai biru ocean, provinsi terpilih navy.
 */
export default function DpwMiniMap({
    provinces,
    selectedSlug,
    onSelectProvince,
    className,
}: DpwMiniMapProps) {
    const [hovered, setHovered] = useState<ProvinceMapItem | null>(null);

    const provinceById = useMemo(() => {
        const map = new Map<number, DpwProvinceOption>();
        provinces.forEach((p) => map.set(p.id, p));
        return map;
    }, [provinces]);

    const hoveredProvince = hovered ? provinceById.get(hovered.id) : null;

    return (
        <div
            className={cx(
                'relative overflow-hidden rounded-card border border-line bg-white p-4 shadow-soft',
                className
            )}
        >
            <div className="mb-2 flex items-center justify-between gap-2 text-[11px]">
                <span className="font-bold uppercase tracking-wider text-navy">
                    Peta Wilayah DPW
                </span>
                <span className="truncate font-medium text-ocean">
                    {hoveredProvince ? hoveredProvince.name : 'Klik provinsi'}
                </span>
            </div>

            <div className="relative aspect-[980/400] w-full">
                <svg
                    viewBox="0 0 980 400"
                    className="h-full w-full"
                    role="img"
                    aria-label="Peta interaktif pemilihan provinsi DPW Indonesia"
                >
                    {INDONESIA_PROVINCES.map((prov) => {
                        const match = provinceById.get(prov.id);
                        const isSelected = Boolean(
                            match && selectedSlug && match.slug === selectedSlug
                        );
                        const hasDpw = Boolean(match?.has_dpw);

                        const fillClass = isSelected
                            ? 'fill-navy stroke-aqua stroke-[2.2]'
                            : hasDpw
                            ? 'fill-ocean/75 stroke-white stroke-[1.1] hover:fill-ocean'
                            : 'fill-mist stroke-line stroke-[1] hover:fill-sky/40';

                        return (
                            <path
                                key={prov.id}
                                d={prov.path}
                                tabIndex={match ? 0 : -1}
                                role="button"
                                aria-label={
                                    match
                                        ? `${match.name}${hasDpw ? ' (DPW Aktif)' : ' (Belum terbentuk)'}`
                                        : prov.name
                                }
                                onMouseEnter={() => setHovered(prov)}
                                onMouseLeave={() => setHovered(null)}
                                onClick={() => {
                                    if (match) onSelectProvince(match.slug);
                                }}
                                onKeyDown={(e) => {
                                    if (
                                        match &&
                                        (e.key === 'Enter' || e.key === ' ')
                                    ) {
                                        e.preventDefault();
                                        onSelectProvince(match.slug);
                                    }
                                }}
                                className={cx(
                                    'cursor-pointer transition-colors duration-150 focus:outline-none',
                                    fillClass
                                )}
                            />
                        );
                    })}
                </svg>
            </div>

            {/* Legenda Peta Ringkas */}
            <div className="mt-2.5 flex flex-wrap items-center gap-3 border-t border-line/70 pt-2.5 text-[11px] text-slate">
                <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-navy ring-1 ring-aqua" />
                    Dipilih
                </span>
                <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-ocean/80" />
                    DPW Aktif
                </span>
                <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full border border-line bg-mist" />
                    Belum Terbentuk
                </span>
            </div>
        </div>
    );
}
