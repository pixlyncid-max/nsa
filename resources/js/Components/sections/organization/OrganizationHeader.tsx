import { spring } from '@/animations/variants';
import ContourPattern from '@/Components/motion/ContourPattern';
import SplitText from '@/Components/motion/SplitText';
import Breadcrumb from '@/Components/ui/Breadcrumb';
import { cx } from '@/lib/cx';
import { focusRing } from '@/lib/ui';
import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';

interface OrganizationHeaderProps {
    current: 'dpp' | 'dpw' | 'dpc';
    title?: string;
    description?: string;
}

export default function OrganizationHeader({
    current,
    title = 'Struktur Organisasi NSA',
    description = 'Susunan kelembagaan dari tingkat pusat hingga cabang kabupaten dan kota di seluruh Indonesia.',
}: OrganizationHeaderProps) {
    const tabs = [
        {
            id: 'dpp',
            label: 'Dewan Pengurus Pusat (DPP)',
            shortLabel: 'DPP Pusat',
            href: '/organisasi/dpp',
        },
        {
            id: 'dpw',
            label: 'Dewan Pengurus Wilayah (DPW)',
            shortLabel: 'DPW Provinsi',
            href: '/organisasi/dpw',
        },
        {
            id: 'dpc',
            label: 'Dewan Pengurus Cabang (DPC)',
            shortLabel: 'DPC Kabupaten/Kota',
            href: '/organisasi/dpc',
        },
    ];

    const currentTab = tabs.find((t) => t.id === current) ?? tabs[0];

    return (
        <header className="relative overflow-hidden border-b border-line bg-mist py-12 md:py-16">
            {/* Latar garis kontur air halus (anime.js path draw) */}
            <div className="pointer-events-none absolute inset-0 opacity-30">
                <ContourPattern tone="sky" opacity={0.3} size="100%" />
            </div>

            <div className="container-page relative z-10">
                <Breadcrumb
                    items={[
                        { label: 'Beranda', href: '/' },
                        { label: 'Organisasi', href: '/organisasi/dpp' },
                        { label: currentTab.shortLabel },
                    ]}
                />

                <div className="mt-4">
                    <span className="t-eyebrow text-ocean">
                        Kelembagaan Asosiasi
                    </span>
                    <h1 className="t-h1 mt-2 text-navy">
                        <SplitText text={title} />
                    </h1>
                    <p className="measure mt-3 text-sm leading-relaxed text-slate md:text-base">
                        {description}
                    </p>
                </div>

                {/* Tab Navigasi 3 Cabang Organisasi (Framer layoutId) */}
                <nav
                    aria-label="Pilihan Tingkat Organisasi"
                    className="mt-8 flex flex-wrap gap-2"
                >
                    {tabs.map((tab) => {
                        const isActive = tab.id === current;
                        return (
                            <Link
                                key={tab.id}
                                href={tab.href}
                                className={cx(
                                    'relative inline-flex h-11 items-center rounded-control px-4 text-xs font-bold transition-colors',
                                    focusRing,
                                    isActive
                                        ? 'text-white'
                                        : 'border border-line bg-white text-ink hover:border-ocean hover:text-ocean'
                                )}
                            >
                                {isActive ? (
                                    <motion.span
                                        layoutId="org-level-pill"
                                        transition={spring}
                                        className="absolute inset-0 rounded-control bg-navy shadow-soft"
                                    />
                                ) : null}
                                <span className="relative z-10 hidden sm:inline">
                                    {tab.label}
                                </span>
                                <span className="relative z-10 sm:hidden">
                                    {tab.shortLabel}
                                </span>
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </header>
    );
}
