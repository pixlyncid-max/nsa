import Logo from '@/Components/layout/Logo';
import Sidebar, { type SidebarSection } from '@/Components/layout/Sidebar';
import { ContentTransition } from '@/Components/motion/PageTransition';
import AppToaster from '@/Components/ui/AppToaster';
import { useFlashToast } from '@/hooks/useFlashToast';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';
import { copy } from '@/lib/copy';
import { cx } from '@/lib/cx';
import { dur, ease } from '@/lib/motion';
import { focusRing } from '@/lib/ui';
import type { PageProps } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { ExternalLink, Globe, Home, Menu, X } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';

interface DashboardShellProps {
    areaLabel: string;
    sections: SidebarSection[];
    title: string;
    children: ReactNode;
    backToWebsite?: boolean;
}

export default function DashboardShell({
    areaLabel,
    sections,
    title,
    children,
    backToWebsite = false,
}: DashboardShellProps) {
    const reduced = usePrefersReducedMotion();
    const user = usePage<PageProps>().props.auth.user;
    const [drawerOpen, setDrawerOpen] = useState(false);
    const closeRef = useRef(() => setDrawerOpen(false));

    useFlashToast();
    useLockBodyScroll(drawerOpen);
    useEffect(() => router.on('navigate', () => closeRef.current()), []);

    return (
        <div className="min-h-screen bg-white lg:flex">
            <aside className="sticky top-0 hidden h-screen w-72 shrink-0 lg:block">
                <Sidebar
                    areaLabel={areaLabel}
                    sections={sections}
                    backToWebsite={backToWebsite}
                />
            </aside>

            <div className="flex min-w-0 flex-1 flex-col">
                <div className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line bg-white px-4 lg:hidden">
                    <Logo />
                    <button
                        type="button"
                        onClick={() => setDrawerOpen(true)}
                        aria-label={copy.actions.openMenu}
                        className={cx(
                            'inline-flex h-11 w-11 items-center justify-center rounded-control text-navy hover:bg-mist',
                            focusRing
                        )}
                    >
                        <Menu className="h-6 w-6" strokeWidth={1.75} />
                    </button>
                </div>

                <header className="flex items-center justify-between gap-4 border-b border-line px-6 py-5 md:px-10">
                    <h1 className="t-h3 md:text-[28px]">{title}</h1>
                    <div className="flex items-center gap-3">
                        {backToWebsite ? (
                            <Link
                                href="/"
                                className={cx(
                                    'inline-flex items-center gap-1.5 rounded-control border border-line bg-white px-3 py-1.5 text-xs font-semibold text-navy transition-colors hover:border-ocean hover:bg-mist',
                                    focusRing
                                )}
                            >
                                <Home
                                    className="h-3.5 w-3.5 text-ocean"
                                    strokeWidth={2}
                                />
                                <span>Ke Web Utama</span>
                            </Link>
                        ) : null}
                        {user ? (
                            <span className="hidden items-center gap-3 text-sm sm:flex">
                                <span className="text-right">
                                    <span className="block font-semibold text-ink">
                                        {user.name}
                                    </span>
                                    <span className="block text-xs text-slate">
                                        {areaLabel}
                                    </span>
                                </span>
                                <span
                                    aria-hidden="true"
                                    className="grid h-10 w-10 place-items-center rounded-full bg-navy font-display text-sm font-bold text-white"
                                >
                                    {user.name.slice(0, 1).toUpperCase()}
                                </span>
                            </span>
                        ) : null}
                    </div>
                </header>

                <main className="flex-1 px-6 py-8 md:px-10">
                    <ContentTransition>{children}</ContentTransition>
                </main>
            </div>

            <AnimatePresence>
                {drawerOpen ? (
                    <div className="fixed inset-0 z-50 lg:hidden">
                        <motion.div
                            className="absolute inset-0 bg-ink/50"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: reduced ? 0 : dur.base }}
                            onClick={() => setDrawerOpen(false)}
                            aria-hidden="true"
                        />
                        <motion.div
                            role="dialog"
                            aria-modal="true"
                            aria-label="Menu"
                            initial={{ x: reduced ? 0 : '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: reduced ? 0 : '-100%' }}
                            transition={{
                                duration: reduced ? 0 : dur.base,
                                ease,
                            }}
                            className="absolute inset-y-0 left-0 w-[min(300px,86vw)]"
                        >
                            <Sidebar
                                areaLabel={areaLabel}
                                sections={sections}
                                backToWebsite={backToWebsite}
                            />
                            <button
                                type="button"
                                onClick={() => setDrawerOpen(false)}
                                aria-label={copy.actions.closeMenu}
                                className={cx(
                                    'absolute right-3 top-5 inline-flex h-11 w-11 items-center justify-center rounded-control text-white hover:bg-white/10',
                                    focusRing
                                )}
                            >
                                <X className="h-6 w-6" strokeWidth={1.75} />
                            </button>
                        </motion.div>
                    </div>
                ) : null}
            </AnimatePresence>

            <AppToaster />
        </div>
    );
}
