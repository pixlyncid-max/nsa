import {
    INDONESIA_PROVINCES,
    type ProvinceMapItem,
} from '@/Components/sections/home/indonesiaMapData';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';
import { cx } from '@/lib/cx';
import { animate, stagger } from 'animejs';
import { useEffect, useMemo, useRef, useState } from 'react';

export interface ProvinceStatItem {
    id: number;
    name: string;
    slug: string;
    farmer_count: number;
    by_category: Record<string, number>;
}

interface IndonesiaMapProps {
    data: ProvinceStatItem[];
    activeCategory: string;
    selectedProvinceId?: number | null;
    onSelectProvince: (province: ProvinceStatItem | null) => void;
    className?: string;
}

export default function IndonesiaMap({
    data,
    activeCategory,
    selectedProvinceId,
    onSelectProvince,
    className,
}: IndonesiaMapProps) {
    const reduced = usePrefersReducedMotion();
    const svgRef = useRef<SVGSVGElement>(null);
    const [hovered, setHovered] = useState<ProvinceMapItem | null>(null);
    const [tooltipPos, setTooltipPos] = useState<{
        x: number;
        y: number;
    } | null>(null);

    // Map data by id untuk lookup cepat
    const statMap = useMemo(() => {
        const map = new Map<number, ProvinceStatItem>();
        data.forEach((item) => map.set(item.id, item));
        return map;
    }, [data]);

    // Cari nilai maksimum untuk normalisasi warna
    const maxCount = useMemo(() => {
        let max = 1;
        data.forEach((item) => {
            const count = item.by_category[activeCategory] ?? item.farmer_count;
            if (count > max) max = count;
        });
        return max;
    }, [data, activeCategory]);

    // Efek menyala berurutan dengan anime.js saat kategori berganti
    useEffect(() => {
        if (reduced || !svgRef.current) return;

        const paths = svgRef.current.querySelectorAll('.province-path');
        if (paths.length === 0) return;

        const animation = animate(paths, {
            opacity: [0.35, 1],
            scale: [0.98, 1],
            delay: stagger(25, { from: 'center' }),
            duration: 600,
            ease: 'outQuad',
        });

        return () => {
            animation.cancel();
        };
    }, [activeCategory, reduced]);

    const getFillClass = (count: number, isSelected: boolean) => {
        if (isSelected) {
            return 'fill-aqua stroke-navy stroke-[2] drop-shadow-md';
        }
        if (count === 0) {
            return 'fill-mist/80 stroke-line hover:fill-sky/30';
        }

        const ratio = count / maxCount;
        if (ratio > 0.65) {
            return 'fill-navy stroke-ocean hover:fill-ocean';
        }
        if (ratio > 0.35) {
            return 'fill-ocean stroke-sky hover:fill-sky';
        }
        if (ratio > 0.1) {
            return 'fill-sky/60 stroke-line hover:fill-ocean/80';
        }
        return 'fill-sky/30 stroke-line hover:fill-sky/70';
    };

    const handleMouseEnter = (
        prov: ProvinceMapItem,
        e: React.MouseEvent<SVGPathElement>
    ) => {
        setHovered(prov);
        const rect = svgRef.current?.getBoundingClientRect();
        if (rect) {
            setTooltipPos({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
            });
        }
    };

    const handleMouseMove = (e: React.MouseEvent<SVGPathElement>) => {
        const rect = svgRef.current?.getBoundingClientRect();
        if (rect) {
            setTooltipPos({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
            });
        }
    };

    const handleMouseLeave = () => {
        setHovered(null);
        setTooltipPos(null);
    };

    const hoveredStat = hovered ? statMap.get(hovered.id) : null;
    const hoveredCount = hoveredStat
        ? (hoveredStat.by_category[activeCategory] ?? hoveredStat.farmer_count)
        : 0;

    return (
        <div
            className={cx(
                'relative select-none overflow-hidden rounded-card border border-line bg-white p-4 shadow-soft md:p-6',
                className
            )}
        >
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-semibold text-slate">
                    Peta Interaktif Sebaran Pembudidaya
                </span>
                <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5 text-slate">
                        <span className="h-2.5 w-2.5 rounded-sm border border-line bg-mist" />
                        0
                    </span>
                    <span className="flex items-center gap-1.5 text-slate">
                        <span className="h-2.5 w-2.5 rounded-sm bg-sky/50" />
                        Sedang
                    </span>
                    <span className="flex items-center gap-1.5 text-slate">
                        <span className="h-2.5 w-2.5 rounded-sm bg-navy" />
                        Tinggi
                    </span>
                </div>
            </div>

            <div className="relative aspect-[980/400] w-full">
                <svg
                    ref={svgRef}
                    viewBox="0 0 980 400"
                    className="h-full w-full overflow-visible transition-all duration-300"
                    style={{ transformOrigin: 'center' }}
                >
                    {INDONESIA_PROVINCES.map((prov) => {
                        const stat = statMap.get(prov.id);
                        const count = stat
                            ? (stat.by_category[activeCategory] ??
                              stat.farmer_count)
                            : 0;
                        const isSelected = selectedProvinceId === prov.id;

                        return (
                            <path
                                key={prov.id}
                                d={prov.path}
                                data-id={prov.id}
                                data-name={prov.name}
                                className={cx(
                                    'province-path cursor-pointer transition-colors duration-150',
                                    getFillClass(count, isSelected)
                                )}
                                strokeWidth="1"
                                strokeLinejoin="round"
                                strokeLinecap="round"
                                onMouseEnter={(e) => handleMouseEnter(prov, e)}
                                onMouseMove={handleMouseMove}
                                onMouseLeave={handleMouseLeave}
                                onClick={() =>
                                    onSelectProvince(
                                        isSelected ? null : (stat ?? null)
                                    )
                                }
                            />
                        );
                    })}
                </svg>

                {/* Floating Tooltip */}
                {hovered && tooltipPos && (
                    <div
                        className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full rounded-control border border-line bg-navy px-3 py-2 text-white shadow-lift"
                        style={{
                            left: `${tooltipPos.x}px`,
                            top: `${tooltipPos.y - 12}px`,
                        }}
                    >
                        <p className="text-xs font-semibold text-aqua">
                            {hovered.name}
                        </p>
                        <p className="text-[11px] text-mist/90">
                            {hoveredCount.toLocaleString('id-ID')} Pembudidaya
                        </p>
                    </div>
                )}
            </div>

            <p className="mt-3 text-center text-xs text-slate">
                Klik pada provinsi untuk melihat rincian peringkat daerah dan
                komoditas.
            </p>
        </div>
    );
}
