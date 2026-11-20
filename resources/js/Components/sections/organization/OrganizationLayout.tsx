import { spring } from '@/animations/variants';
import Container from '@/Components/layout/Container';
import PageHeader from '@/Components/layout/PageHeader';
import PublicLayout from '@/Layouts/PublicLayout';
import { cx } from '@/lib/cx';
import { focusRing } from '@/lib/ui';
import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import React from 'react';

export type OrganizationLevel = 'dpp' | 'dpw' | 'dpc';

export interface OrganizationLayoutProps {
    current: OrganizationLevel;
    title: string;
    description: string;
    eyebrow?: string;
    /** Informasi ringkas di sisi kanan bilah segmen menempel (opsional) */
    barMeta?: React.ReactNode;
    children: React.ReactNode;
}

const SEGMENTS: Array<{
    id: OrganizationLevel;
    short: string;
    full: string;
    href: string;
}> = [
    {
        id: 'dpp',
        short: 'DPP',
        full: 'Dewan Pengurus Pusat',
        href: '/organisasi/dpp',
    },
    {
        id: 'dpw',
        short: 'DPW',
        full: 'Dewan Pengurus Wilayah',
        href: '/organisasi/dpw',
    },
    {
        id: 'dpc',
        short: 'DPC',
        full: 'Dewan Pengurus Cabang',
        href: '/organisasi/dpc',
    },
];

/**
 * Struktur bersama halaman Organisasi (DPP, DPW, DPC).
 * Memadukan PageHeader Garis Pantai dengan kontrol segmen "DPP | DPW | DPC"
 * yang menempel di bawah header utama (aktif bergaya pil navy).
 */
export default function OrganizationLayout({
    current,
    title,
    description,
    eyebrow = 'Kelembagaan Asosiasi',
    barMeta,
    children,
}: OrganizationLayoutProps) {
    const activeSegment = SEGMENTS.find((s) => s.id === current) ?? SEGMENTS[0];

    return (
        <PublicLayout>
            <PageHeader
                breadcrumbs={[
                    { label: 'Beranda', href: '/' },
                    { label: 'Organisasi', href: '/organisasi/dpp' },
                    { label: activeSegment.short },
                ]}
                eyebrow={eyebrow}
                title={title}
                description={description}
            />

            {/* Kontrol Segmen Menempel di Bawah Header Utama */}
            <div
                className="sticky z-30 border-b border-line bg-white/95 backdrop-blur-md transition-[top] duration-200"
                style={{ top: 'var(--header-h, 72px)' }}
            >
                <Container className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <nav
                        aria-label="Tingkat Kepengurusan Organisasi"
                        className="inline-flex items-center rounded-full border border-line bg-mist p-1"
                    >
                        {SEGMENTS.map((seg) => {
                            const isActive = seg.id === current;
                            return (
                                <Link
                                    key={seg.id}
                                    href={seg.href}
                                    aria-current={isActive ? 'page' : undefined}
                                    className={cx(
                                        'relative inline-flex min-h-[38px] items-center justify-center rounded-full px-5 py-1.5 text-xs font-bold tracking-wide transition-colors sm:min-h-[40px] sm:px-6 sm:text-sm',
                                        focusRing,
                                        isActive
                                            ? 'text-white'
                                            : 'text-slate hover:text-navy'
                                    )}
                                >
                                    {isActive ? (
                                        <motion.span
                                            layoutId="org-segment-pill"
                                            transition={spring}
                                            className="absolute inset-0 rounded-full bg-navy shadow-soft"
                                        />
                                    ) : null}
                                    <span className="relative z-10">
                                        {seg.short}
                                    </span>
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="hidden items-center gap-2 text-xs font-medium text-slate md:flex">
                        {barMeta ?? (
                            <span>{activeSegment.full}</span>
                        )}
                    </div>
                </Container>
            </div>

            {children}
        </PublicLayout>
    );
}
