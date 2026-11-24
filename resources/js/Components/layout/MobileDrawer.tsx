import BrandLogo from '@/Components/layout/BrandLogo';
import { openOrdersDrawer } from '@/Components/layout/OrdersDrawer';
import { openProfileDrawer } from '@/Components/layout/ProfileDrawer';
import Button from '@/Components/ui/Button';
import LanguageSwitcher from '@/Components/layout/LanguageSwitcher';
import { useCopy } from '@/hooks/useCopy';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';
import { cx } from '@/lib/cx';
import { dur, ease } from '@/lib/motion';
import { productGroups } from '@/lib/navigation';
import { focusRing } from '@/lib/ui';
import type { PageProps } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    ChevronDown,
    LayoutDashboard,
    LogOut,
    ShoppingBag,
    UserPlus,
    UserRound,
    X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface MobileDrawerProps {
    open: boolean;
    onClose: () => void;
}

export default function MobileDrawer({ open, onClose }: MobileDrawerProps) {
    const { t } = useCopy();
    const reduced = usePrefersReducedMotion();
    const { auth, features } = usePage<PageProps>().props;
    const [expanded, setExpanded] = useState<string | null>(null);
    const onCloseRef = useRef(onClose);

    useEffect(() => {
        onCloseRef.current = onClose;
    });
    useEffect(() => router.on('navigate', () => onCloseRef.current()), []);

    useEffect(() => {
        if (!open) return;
        const onKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onCloseRef.current();
            }
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [open]);

    useLockBodyScroll(open);

    const toggle = (key: string) =>
        setExpanded((current) => (current === key ? null : key));

    const isStaff = auth.user?.role === 'admin' || auth.user?.role === 'superadmin';
    const isApproved = auth.user?.membership_status === 'approved';
    const dashboardHref = isStaff ? '/admin' : isApproved ? '/anggota' : '/akun';
    const dashboardLabel = isStaff
        ? t('global.user_menu.dashboard_admin')
        : t('global.user_menu.dashboard');

    const orgMenuItems = [
        {
            href: '/organisasi/dpp',
            label: t('global.nav.org_dpp_label'),
            description: t('global.nav.org_dpp_desc'),
        },
        {
            href: '/organisasi/dpw',
            label: t('global.nav.org_dpw_label'),
            description: t('global.nav.org_dpw_desc'),
        },
        {
            href: '/organisasi/dpc',
            label: t('global.nav.org_dpc_label'),
            description: t('global.nav.org_dpc_desc'),
        },
    ];

    return (
        <AnimatePresence>
            {open ? (
                <div className="fixed inset-0 z-[60] lg:hidden">
                    {/* Backdrop */}
                    <motion.div
                        className="absolute inset-0 bg-ink/60 backdrop-blur-xs"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: reduced ? 0 : dur.base }}
                        onClick={onClose}
                        aria-hidden="true"
                    />

                    {/* Drawer Layar Penuh dengan Menu Bernomor Besar */}
                    <motion.aside
                        role="dialog"
                        aria-modal="true"
                        aria-label={t('global.nav.aria_mobile')}
                        initial={{
                            x: reduced ? 0 : '100%',
                            opacity: reduced ? 0 : 1,
                        }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{
                            x: reduced ? 0 : '100%',
                            opacity: reduced ? 0 : 1,
                        }}
                        transition={{ duration: reduced ? 0 : dur.base, ease }}
                        className="absolute inset-0 flex h-full w-full flex-col bg-white overflow-hidden shadow-lift"
                    >
                        {/* Header Drawer */}
                        <div className="flex h-[72px] shrink-0 items-center justify-between gap-2 border-b border-line px-5 sm:px-6">
                            <BrandLogo variant="navbar" />
                            <div className="flex items-center gap-2">
                                <LanguageSwitcher />
                                <button
                                    type="button"
                                    onClick={onClose}
                                    aria-label={t('global.action.close_menu')}
                                    className={cx(
                                        'inline-flex h-11 w-11 items-center justify-center rounded-control text-navy hover:bg-mist',
                                        focusRing
                                    )}
                                >
                                    <X className="h-6 w-6" strokeWidth={1.75} />
                                </button>
                            </div>
                        </div>

                        {/* Menu Bernomor Besar (01 s.d. 07) */}
                        <nav
                            className="flex-1 overflow-y-auto px-5 py-6 sm:px-8 space-y-4"
                            aria-label={t('global.nav.aria_numbered')}
                        >
                            {/* 01 Beranda */}
                            <div>
                                <Link
                                    href="/"
                                    className="group flex items-baseline gap-4 py-2"
                                >
                                    <span className="font-mono text-lg sm:text-xl font-bold text-ocean/50 group-hover:text-ocean transition-colors">
                                        01
                                    </span>
                                    <span className="font-display text-2xl sm:text-3xl font-bold text-navy group-hover:text-ocean transition-colors">
                                        {t('global.nav.home')}
                                    </span>
                                </Link>
                            </div>

                            {/* 02 Organisasi */}
                            <div className="border-t border-line/60 pt-3">
                                <button
                                    type="button"
                                    onClick={() => toggle('org')}
                                    className="group flex w-full items-center justify-between py-2 text-left"
                                >
                                    <div className="flex items-baseline gap-4">
                                        <span className="font-mono text-lg sm:text-xl font-bold text-ocean/50 group-hover:text-ocean transition-colors">
                                            02
                                        </span>
                                        <span className="font-display text-2xl sm:text-3xl font-bold text-navy group-hover:text-ocean transition-colors">
                                            {t('global.nav.organization')}
                                        </span>
                                    </div>
                                    <ChevronDown
                                        className={cx(
                                            'h-5 w-5 text-slate transition-transform duration-200',
                                            expanded === 'org' && 'rotate-180'
                                        )}
                                    />
                                </button>
                                {expanded === 'org' && (
                                    <div className="ml-10 mt-2 space-y-2 pb-2">
                                        {orgMenuItems.map((org) => (
                                            <Link
                                                key={org.href}
                                                href={org.href}
                                                className="block rounded-control py-1.5 text-sm font-semibold text-ink hover:text-ocean"
                                            >
                                                {org.label}
                                                <span className="block text-xs font-normal text-slate">
                                                    {org.description}
                                                </span>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* 03 Produk */}
                            <div className="border-t border-line/60 pt-3">
                                <button
                                    type="button"
                                    onClick={() => toggle('prod')}
                                    className="group flex w-full items-center justify-between py-2 text-left"
                                >
                                    <div className="flex items-baseline gap-4">
                                        <span className="font-mono text-lg sm:text-xl font-bold text-ocean/50 group-hover:text-ocean transition-colors">
                                            03
                                        </span>
                                        <span className="font-display text-2xl sm:text-3xl font-bold text-navy group-hover:text-ocean transition-colors">
                                            {t('global.nav.products')}
                                        </span>
                                    </div>
                                    <ChevronDown
                                        className={cx(
                                            'h-5 w-5 text-slate transition-transform duration-200',
                                            expanded === 'prod' && 'rotate-180'
                                        )}
                                    />
                                </button>
                                {expanded === 'prod' && (
                                    <div className="ml-10 mt-2 space-y-3 pb-2">
                                        {productGroups.map((group) => (
                                            <div key={group.title} className="space-y-1">
                                                <Link
                                                    href={group.href}
                                                    className="block font-bold text-xs uppercase tracking-wider text-ocean"
                                                >
                                                    {group.title}
                                                </Link>
                                                {group.items.map((sub) => (
                                                    <Link
                                                        key={sub.href}
                                                        href={sub.href}
                                                        className="block py-0.5 text-xs text-ink hover:text-navy"
                                                    >
                                                        {sub.label}
                                                    </Link>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* 04 Tentang Kami */}
                            <div className="border-t border-line/60 pt-3">
                                <Link
                                    href="/tentang-kami"
                                    className="group flex items-baseline gap-4 py-2"
                                >
                                    <span className="font-mono text-lg sm:text-xl font-bold text-ocean/50 group-hover:text-ocean transition-colors">
                                        04
                                    </span>
                                    <span className="font-display text-2xl sm:text-3xl font-bold text-navy group-hover:text-ocean transition-colors">
                                        {t('global.nav.about')}
                                    </span>
                                </Link>
                            </div>

                            {/* 05 Kemitraan */}
                            {features?.partnership_enabled ? (
                                <div className="border-t border-line/60 pt-3">
                                    <Link
                                        href="/kemitraan"
                                        className="group flex items-baseline gap-4 py-2"
                                    >
                                        <span className="font-mono text-lg sm:text-xl font-bold text-ocean/50 group-hover:text-ocean transition-colors">
                                            05
                                        </span>
                                        <span className="font-display text-2xl sm:text-3xl font-bold text-navy group-hover:text-ocean transition-colors">
                                            {t('global.nav.partnership')}
                                        </span>
                                    </Link>
                                </div>
                            ) : null}

                            {/* 06 Artikel */}
                            <div className="border-t border-line/60 pt-3">
                                <Link
                                    href="/artikel"
                                    className="group flex items-baseline gap-4 py-2"
                                >
                                    <span className="font-mono text-lg sm:text-xl font-bold text-ocean/50 group-hover:text-ocean transition-colors">
                                        06
                                    </span>
                                    <span className="font-display text-2xl sm:text-3xl font-bold text-navy group-hover:text-ocean transition-colors">
                                        {t('global.nav.articles')}
                                    </span>
                                </Link>
                            </div>

                            {/* 07 Kontak */}
                            <div className="border-t border-line/60 pt-3">
                                <Link
                                    href="/kontak"
                                    className="group flex items-baseline gap-4 py-2"
                                >
                                    <span className="font-mono text-lg sm:text-xl font-bold text-ocean/50 group-hover:text-ocean transition-colors">
                                        07
                                    </span>
                                    <span className="font-display text-2xl sm:text-3xl font-bold text-navy group-hover:text-ocean transition-colors">
                                        {t('global.nav.contact')}
                                    </span>
                                </Link>
                            </div>
                        </nav>

                        {/* Footer Drawer: Akun & Tombol Aksi */}
                        <div className="shrink-0 border-t border-line bg-mist/60 p-5 sm:p-6 space-y-3">
                            {auth.user ? (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-bold text-navy">
                                                {auth.user.name}
                                            </p>
                                            {isApproved ? (
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <span className="rounded bg-ocean/10 px-1.5 py-0.5 text-[10px] font-bold text-ocean">
                                                        {t('global.user_menu.badge_member')}
                                                    </span>
                                                    {auth.user.member_number ? (
                                                        <span className="font-mono text-[11px] text-slate">
                                                            {auth.user.member_number}
                                                        </span>
                                                    ) : null}
                                                </div>
                                            ) : (
                                                <p className="truncate text-xs text-slate">
                                                    {auth.user.email}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* 4 Menu: Dashboard, Pesanan Saya, Profil, Keluar */}
                                    <div className="grid grid-cols-2 gap-2 pt-1">
                                        <Link
                                            href={dashboardHref}
                                            className="flex h-10 items-center gap-2 rounded-control bg-white px-3 text-xs font-bold text-navy border border-line shadow-xs hover:border-ocean"
                                        >
                                            <LayoutDashboard className="h-4 w-4 text-ocean" />
                                            <span className="truncate">{dashboardLabel}</span>
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                onClose();
                                                openOrdersDrawer();
                                            }}
                                            className="flex h-10 items-center gap-2 rounded-control bg-white px-3 text-xs font-semibold text-ink border border-line shadow-xs hover:border-ocean text-left"
                                        >
                                            <ShoppingBag className="h-4 w-4 text-ocean" />
                                            <span>{t('global.user_menu.orders')}</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                onClose();
                                                openProfileDrawer();
                                            }}
                                            className="flex h-10 items-center gap-2 rounded-control bg-white px-3 text-xs font-semibold text-ink border border-line shadow-xs hover:border-ocean text-left"
                                        >
                                            <UserRound className="h-4 w-4 text-ocean" />
                                            <span>{t('global.user_menu.profile')}</span>
                                        </button>
                                        <Link
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                            className="flex h-10 items-center gap-2 rounded-control bg-white px-3 text-xs font-semibold text-danger border border-line shadow-xs hover:bg-danger/10 text-left"
                                        >
                                            <LogOut className="h-4 w-4 shrink-0" />
                                            <span>{t('global.button.logout')}</span>
                                        </Link>
                                    </div>

                                    {!isApproved && (
                                        <Button
                                            href="/akun/keanggotaan/daftar"
                                            fullWidth
                                            className="mt-2"
                                        >
                                            <UserPlus className="w-4 h-4 mr-1.5" />
                                            {t('global.banner.join_cta')}
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <Button
                                        href="/register"
                                        fullWidth
                                        variant="primary"
                                    >
                                        <UserPlus className="w-4 h-4 mr-1.5" />
                                        {t('global.banner.join_cta')}
                                    </Button>
                                    <Button
                                        href="/login"
                                        fullWidth
                                        variant="secondary"
                                    >
                                        {t('global.button.login')}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </motion.aside>
                </div>
            ) : null}
        </AnimatePresence>
    );
}
