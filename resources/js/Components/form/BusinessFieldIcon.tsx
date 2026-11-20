import React from 'react';
import {
    Anchor,
    Building2,
    Factory,
    Fish,
    FishSymbol,
    Handshake,
    Layers,
    MoreHorizontal,
    Package,
    Snowflake,
    Sprout,
    Truck,
    Waves,
    Wheat,
} from 'lucide-react';

interface BusinessFieldIconProps {
    name: string;
    slug?: string;
    className?: string;
}

export default function BusinessFieldIcon({
    name,
    slug = '',
    className = 'h-5 w-5',
}: BusinessFieldIconProps) {
    const normalized = (name || slug).toLowerCase();

    // 1. Udang (Shrimp)
    if (normalized.includes('udang')) {
        return (
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={className}
            >
                <path d="M19 8c1.5-1.5 2-4 2-5-1 0-3.5.5-5 2" />
                <path d="M16 6c1 1.5 1.5 3.5 1 5-1 2.5-3.5 4-6 4-2 0-3.5-.8-4.5-2" />
                <path d="M6.5 13C5 14 4 16 4 18c0 2 2 3 4 3 2.5 0 5-1.5 6-3.5" />
                <path d="M4 18l-2 3" />
                <path d="M14 17.5l2 2.5" />
                <circle cx="15" cy="8" r="0.8" fill="currentColor" />
            </svg>
        );
    }

    // 2. Kepiting (Crab)
    if (normalized.includes('kepiting')) {
        return (
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={className}
            >
                <ellipse cx="12" cy="14" rx="6" ry="4" />
                <path d="M12 10v-3" />
                <path d="M6 13C4 11 3 8 4 6c1.5 0 3 1.5 4 3.5" />
                <path d="M18 13c2-2 3-5 2-7-1.5 0-3 1.5-4 3.5" />
                <path d="M6 15l-3 2" />
                <path d="M6 17l-2 3" />
                <path d="M18 15l3 2" />
                <path d="M18 17l2 3" />
            </svg>
        );
    }

    // 3. Lobster
    if (normalized.includes('lobster')) {
        return (
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={className}
            >
                <path d="M12 2v4" />
                <ellipse cx="12" cy="11" rx="4" ry="5" />
                <path d="M10 16v5l2 1 2-1v-5" />
                <path d="M8 9C5.5 7 4 4 5 3c1.5 0 3 2 4 4" />
                <path d="M16 9c2.5-2 4-5 3-6-1.5 0-3 2-4 4" />
                <path d="M8 12H5" />
                <path d="M16 12h3" />
            </svg>
        );
    }

    // 4. Rajungan (Swimming Crab)
    if (normalized.includes('rajungan')) {
        return (
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={className}
            >
                <ellipse cx="12" cy="13" rx="7" ry="4" />
                <path d="M5 13L2 11" />
                <path d="M19 13l3-2" />
                <path d="M6 9C5 6 3 4 5 3c2 1 3 3 3.5 5" />
                <path d="M18 9c1-3 3-5 1-6-2 1-3 3-3.5 5" />
                <path d="M6 16l-3 4" />
                <path d="M18 16l3 4" />
            </svg>
        );
    }

    // 5. Rumput Laut (Seaweed)
    if (normalized.includes('rumput')) {
        return (
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={className}
            >
                <path d="M6 22c1-4-1-8 1-12s-1-6 0-8" />
                <path d="M12 22c1.5-3-1-6 1-10s0-7 1-9" />
                <path d="M18 22c-1-4 1-7-1-11s1-6 0-8" />
            </svg>
        );
    }

    // 6. Ikan Air Tawar
    if (normalized.includes('tawar')) {
        return <Fish className={className} strokeWidth={1.75} />;
    }

    // 7. Ikan Laut
    if (normalized.includes('laut') && normalized.includes('ikan')) {
        return <FishSymbol className={className} strokeWidth={1.75} />;
    }

    // 8. Pakan (Feed)
    if (normalized.includes('pakan')) {
        return <Wheat className={className} strokeWidth={1.75} />;
    }

    // 9. Cold Storage
    if (normalized.includes('cold') || normalized.includes('storage')) {
        return <Snowflake className={className} strokeWidth={1.75} />;
    }

    // 10. Logistik
    if (normalized.includes('logistik')) {
        return <Truck className={className} strokeWidth={1.75} />;
    }

    // 11. Pengolahan
    if (normalized.includes('pengolahan')) {
        return <Factory className={className} strokeWidth={1.75} />;
    }

    // 12. Ekspor
    if (normalized.includes('ekspor')) {
        return (
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={className}
            >
                <path d="M2 21h20" />
                <path d="M5 21l3-10h8l3 10" />
                <path d="M12 11V3m0 0l-3 3m3-3l3 3" />
            </svg>
        );
    }

    // 13. Impor
    if (normalized.includes('impor')) {
        return (
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={className}
            >
                <path d="M2 21h20" />
                <path d="M5 21l3-10h8l3 10" />
                <path d="M12 3v8m0 0l-3-3m3 3l3-3" />
            </svg>
        );
    }

    // 14. Hatchery (Pembenihan)
    if (normalized.includes('hatchery')) {
        return (
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={className}
            >
                <path d="M12 3C8 3 5 7 5 13c0 4 3 8 7 8s7-4 7-8c0-6-3-10-7-10Z" />
                <path d="M5 13l3-2 3 3 3-2 2 3" />
            </svg>
        );
    }

    // 15. Tambak
    if (normalized.includes('tambak')) {
        return <Waves className={className} strokeWidth={1.75} />;
    }

    // 16. Budidaya
    if (normalized.includes('budidaya')) {
        return <Sprout className={className} strokeWidth={1.75} />;
    }

    // 17. Alat Perikanan
    if (normalized.includes('alat')) {
        return <Anchor className={className} strokeWidth={1.75} />;
    }

    // 18. Industri Hilir
    if (normalized.includes('hilir') || normalized.includes('industri')) {
        return <Layers className={className} strokeWidth={1.75} />;
    }

    // 19. Jasa Pendukung
    if (normalized.includes('jasa') || normalized.includes('pendukung')) {
        return <Handshake className={className} strokeWidth={1.75} />;
    }

    // 20. Lainnya / Default
    if (normalized.includes('lainnya')) {
        return <MoreHorizontal className={className} strokeWidth={1.75} />;
    }

    return <Fish className={className} strokeWidth={1.75} />;
}
