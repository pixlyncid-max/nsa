import LanguageSwitcher from '@/Components/layout/LanguageSwitcher';
import Logo from '@/Components/layout/Logo';
import ContourPattern from '@/Components/motion/ContourPattern';
import AppToaster from '@/Components/ui/AppToaster';
import { useFlashToast } from '@/hooks/useFlashToast';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';
import { cx } from '@/lib/cx';
import { isActivePath } from '@/lib/navigation';
import { focusRing } from '@/lib/ui';
import type { PageProps } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Building2,
    Compass,
    CreditCard,
    Home,
    LayoutDashboard,
    LogOut,
    Menu,
    Package,
    Receipt,
    Settings,
    ShoppingBag,
    UserRound,
    X,
    type LucideIcon,
} from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';

export interface PortalMenuItem {
    label: string;
    href: string;
    icon: LucideIcon;
    exact?: boolean;
    badge?: number | string;
}

export interface PortalLayoutProps {
    title: string;
    areaLabel?: string;
    menuItems?: PortalMenuItem[];
    children: ReactNode;
}

/** 4 Menu default untuk pengguna biasa non-membership */
export const defaultAccountMenuItems: PortalMenuItem[] = [
    {
        label: 'Dashboard',
        href: '/akun',
        icon: LayoutDashboard,
        exact: true,
    },
    {
        label: 'Pesanan Saya',
        href: '/akun/pesanan',
        icon: ShoppingBag,
    },
    {
        label: 'Profil',
        href: '/akun/profil',
        icon: UserRound,
    },
    {
        label: 'Pengaturan',
        href: '/akun/pengaturan',
        icon: Settings,
    },
];

/** Menu lengkap untuk Anggota Resmi NSA (/anggota) */
export const defaultMemberMenuItems: PortalMenuItem[] = [
    {
        label: 'Dashboard',
        href: '/anggota',
        icon: LayoutDashboard,
        exact: true,
    },
    {
        label: 'Profil & Verifikasi',
        href: '/anggota/profil',
        icon: UserRound,
    },
    {
        label: 'Kartu Anggota',
        href: '/anggota/kartu',
        icon: CreditCard,
    },
    {
        label: 'Usaha & Legalitas',
        href: '/anggota/usaha',
        icon: Building2,
    },
    {
        label: 'Program NSA',
        href: '/anggota/program',
        icon: Compass,
    },
    {
        label: 'Iuran & Administrasi',
        href: '/anggota/iuran',
        icon: Receipt,
    },
    {
        label: 'Pesanan Saya',
        href: '/akun/pesanan',
        icon: ShoppingBag,
    },
    {
        label: 'Pengaturan',
        href: '/anggota/pengaturan',
        icon: Settings,
    },
];

/**
 * Tentukan label dan badge status profil di sidebar:
 * Status dalam proses (pending_review, awaiting_payment, pending_approval, revision)
 * berlabel "Calon Anggota".
 */
function getProfileStatusBadge(status?: string): {
    label: string;
    badgeClass: string;
} {
    switch (status) {
        case 'pending_review':
        case 'awaiting_payment':
        case 'pending_approval':
        case 'revision':
        case 'pending':
            return {
                label: 'Calon Anggota',
                badgeClass:
                    'bg-amber-400/20 text-amber-200 border border-amber-300/30',
            };
        case 'approved':
            return {
                label: 'Anggota',
                badgeClass:
                    'bg-emerald-400/20 text-emerald-200 border border-emerald-300/30',
            };
        case 'draft':
            return {
                label: 'Draf Pendaftaran',
                badgeClass: 'bg-sky/20 text-sky border border-sky/30',
            };
        case 'rejected':
            return {
                label: 'Ditolak',
                badgeClass:
                    'bg-rose-400/20 text-rose-200 border border-rose-300/30',
            };
        case 'non_member':
        default:
            return {
                label: 'Bukan Anggota',
                badgeClass: 'bg-white/10 text-white/75 border border-white/20',
            };
    }
}

/**
 * Layout terpadu Portal Anggota & Dasbor Akun NSA.
 * Menghadirkan White Header terpadu, sidebar profil navy pekat,
 * dan area konten kanan yang menampung PageBanner dan Content Cards.
 */
export default function PortalLayout({
    title,
    areaLabel = 'AREA AKUN',
    menuItems = defaultAccountMenuItems,
    children,
}: PortalLayoutProps) {
    const { url, props } = usePage<PageProps>();
    const user = props.auth.user;
    const [drawerOpen, setDrawerOpen] = useState(false);
    const closeRef = useRef(() => setDrawerOpen(false));

    useFlashToast();
    useLockBodyScroll(drawerOpen);
    useEffect(() => router.on('navigate', () => closeRef.current()), []);

    const statusBadge = getProfileStatusBadge(user?.membership_status);

    const sidebarContent = (
        <div className="relative flex h-full flex-col justify-between overflow-y-auto p-4 text-white">
            <ContourPattern
                tone="white"
                opacity={0.06}
                seed={5}
                rings={11}
                animate={false}
                className="pointer-events-none absolute inset-0"
            />

            <div className="relative space-y-6">
                {/* Kartu Profil Pengguna */}
                <div className="rounded-card border border-white/10 bg-navy-900/70 p-4 shadow-soft backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                        {user?.avatar ? (
                            <img
                                src={user.avatar}
                                alt={user.name}
                                className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-white/20"
                            />
                        ) : (
                            <span
                                aria-hidden="true"
                                className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white font-display text-base font-bold text-navy shadow-xs"
                            >
                                {user?.name?.slice(0, 1).toUpperCase() || 'U'}
                            </span>
                        )}

                        <div className="min-w-0 flex-1">
                            <p
                                className="truncate font-display text-sm font-bold text-white"
                                title={user?.name}
                            >
                                {user?.name || 'Pengguna'}
                            </p>
                            <p className="truncate text-xs text-white/60">
                                {user?.email}
                            </p>
                            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                                <span
                                    className={cx(
                                        'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold leading-tight',
                                        statusBadge.badgeClass
                                    )}
                                >
                                    {statusBadge.label}
                                </span>
                                {user?.member_number && (
                                    <span className="font-mono text-[10px] text-aqua/90 font-medium tracking-tight">
                                        {user.member_number}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigasi Menu */}
                <nav aria-label={areaLabel}>
                    <p className="t-eyebrow mb-2.5 px-3 text-xs font-bold uppercase tracking-wider text-aqua">
                        {areaLabel}
                    </p>
                    <ul className="space-y-1">
                        {menuItems.map((item) => {
                            const active = isActivePath(
                                url,
                                item.href,
                                item.exact
                            );
                            return (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        aria-current={
                                            active ? 'page' : undefined
                                        }
                                        className={cx(
                                            'flex h-11 items-center gap-3 rounded-xl px-3.5 text-sm font-semibold transition-all',
                                            focusRing,
                                            active
                                                ? 'border-l-4 border-aqua bg-white/15 text-white shadow-soft backdrop-blur-xs'
                                                : 'text-white/80 hover:bg-white/10 hover:text-white'
                                        )}
                                    >
                                        <item.icon
                                            className={cx(
                                                'h-5 w-5 shrink-0 transition-colors',
                                                active
                                                    ? 'text-aqua'
                                                    : 'text-white/70'
                                            )}
                                            strokeWidth={1.75}
                                        />
                                        <span className="flex-1 truncate">
                                            {item.label}
                                        </span>
                                        {item.badge ? (
                                            <span className="rounded-full bg-aqua px-2 py-0.5 text-xs font-bold text-navy">
                                                {item.badge}
                                            </span>
                                        ) : null}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
            </div>

            {/* Bawah Sidebar: Tombol Keluar & Ke Web Utama di Mobile */}
            <div className="relative mt-6 space-y-2 border-t border-white/10 pt-4">
                <Link
                    href="/"
                    className={cx(
                        'flex h-10 w-full items-center justify-center gap-2 rounded-control border border-white/20 bg-white/10 px-3 text-xs font-semibold text-white transition-colors hover:border-aqua hover:bg-white/15 lg:hidden',
                        focusRing
                    )}
                >
                    <Home className="h-4 w-4 text-aqua" strokeWidth={1.75} />
                    <span>Ke Web Utama</span>
                </Link>

                <Link
                    href={route('logout')}
                    method="post"
                    as="button"
                    className={cx(
                        'flex h-10 w-full items-center justify-center gap-2 rounded-control text-xs font-semibold text-white/75 transition-colors hover:bg-white/10 hover:text-white',
                        focusRing
                    )}
                >
                    <LogOut className="h-4 w-4" strokeWidth={1.75} />
                    <span>Keluar dari Akun</span>
                </Link>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 text-ink">
            <Head title={title} />
            <AppToaster />

            {/* Header Putih (White Header) Bersama */}
            <header className="sticky top-0 z-30 flex h-18 items-center justify-between border-b border-line bg-white px-4 md:px-8 shadow-xs">
                {/* Bagian Kiri: Drawer Toggle (Mobile) + Logo + Teks "Portal Anggota" */}
                <div className="flex items-center gap-3 md:gap-4">
                    <button
                        type="button"
                        onClick={() => setDrawerOpen(true)}
                        aria-label="Buka menu navigasi"
                        className={cx(
                            'inline-flex h-10 w-10 items-center justify-center rounded-control text-navy hover:bg-mist lg:hidden',
                            focusRing
                        )}
                    >
                        <Menu className="h-5 w-5" strokeWidth={2} />
                    </button>

                    <Logo tone="dark" />

                    <span
                        className="hidden h-5 w-px bg-line sm:inline-block"
                        aria-hidden="true"
                    />

                    <span className="hidden font-display text-sm font-semibold tracking-tight text-navy sm:inline-block md:text-base">
                        Portal Anggota
                    </span>
                </div>

                {/* Bagian Kanan: Pemilih Bahasa + Tombol "Ke Web Utama" + Info Pengguna Ringkas */}
                <div className="flex items-center gap-2.5 sm:gap-3">
                    <LanguageSwitcher />
                    <Link
                        href="/"
                        className={cx(
                            'inline-flex items-center gap-1.5 rounded-control border border-line bg-white px-3.5 py-2 text-xs font-semibold text-navy shadow-xs transition-colors hover:border-ocean hover:bg-mist md:text-sm',
                            focusRing
                        )}
                    >
                        <Home className="h-4 w-4 text-ocean" strokeWidth={2} />
                        <span>Ke Web Utama</span>
                    </Link>

                    {user ? (
                        <div className="hidden items-center gap-2.5 border-l border-line pl-3 md:flex">
                            {user.avatar ? (
                                <img
                                    src={user.avatar}
                                    alt={user.name}
                                    className="h-8 w-8 rounded-full object-cover ring-1 ring-line"
                                />
                            ) : (
                                <span
                                    aria-hidden="true"
                                    className="grid h-8 w-8 place-items-center rounded-full bg-navy font-display text-xs font-bold text-white"
                                >
                                    {user.name.slice(0, 1).toUpperCase()}
                                </span>
                            )}
                            <span className="max-w-[120px] truncate text-xs font-semibold text-navy">
                                {user.name}
                            </span>
                        </div>
                    ) : null}
                </div>
            </header>

            {/* Wadah Dua Kolom: Sidebar Kiri & Konten Kanan */}
            <div className="flex min-h-[calc(100vh-72px)]">
                {/* Sidebar Desktop */}
                <aside className="sticky top-18 hidden h-[calc(100vh-72px)] w-72 shrink-0 bg-navy lg:block">
                    {sidebarContent}
                </aside>

                {/* Drawer Mobile */}
                <AnimatePresence>
                    {drawerOpen ? (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                onClick={() => setDrawerOpen(false)}
                                className="fixed inset-0 z-40 bg-navy/60 backdrop-blur-xs lg:hidden"
                                aria-hidden="true"
                            />
                            <motion.div
                                initial={{ x: '-100%' }}
                                animate={{ x: 0 }}
                                exit={{ x: '-100%' }}
                                transition={{
                                    type: 'spring',
                                    damping: 25,
                                    stiffness: 250,
                                }}
                                className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col bg-navy lg:hidden shadow-xl"
                            >
                                <div className="flex items-center justify-between border-b border-white/10 px-4 py-3.5 text-white">
                                    <span className="font-display text-sm font-bold text-aqua">
                                        Menu Navigasi
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setDrawerOpen(false)}
                                        aria-label="Tutup menu"
                                        className={cx(
                                            'grid h-9 w-9 place-items-center rounded-control text-white/80 hover:bg-white/10 hover:text-white',
                                            focusRing
                                        )}
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                                <div className="flex-1 overflow-y-auto">
                                    {sidebarContent}
                                </div>
                            </motion.div>
                        </>
                    ) : null}
                </AnimatePresence>

                {/* Konten Kanan */}
                <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
                    <div className="mx-auto max-w-7xl space-y-6">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
