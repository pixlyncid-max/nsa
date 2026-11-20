import FooterShell from '@/Components/layout/FooterShell';
import Navbar from '@/Components/layout/Navbar';
import MembershipPromoBar from '@/Components/layout/MembershipPromoBar';
import AppToaster from '@/Components/ui/AppToaster';
import { OrganizationSchema } from '@/Components/ui/StructuredData';
import { useCopy } from '@/hooks/useCopy';
import { useDismissUntilNavigation } from '@/hooks/useDismissUntilNavigation';
import { useFlashToast } from '@/hooks/useFlashToast';
import { useScrolled } from '@/hooks/useScrolled';
import { cx } from '@/lib/cx';
import { clearLegacyPromoDismissStorage } from '@/lib/membershipPromo';
import type { PageProps } from '@/types';
import { usePage } from '@inertiajs/react';
import { lazy, Suspense, useEffect, useRef, type ReactNode } from 'react';

const InlineCopyEditor = lazy(
    () => import('@/Components/admin/site-texts/InlineCopyEditor')
);

export default function PublicLayout({ children }: { children: ReactNode }) {
    useFlashToast();
    const { t } = useCopy();
    const pageProps = usePage<PageProps>().props;
    const canEditCopy = pageProps.canEditCopy === true;
    const { dismissed: promoDismissed, dismiss: dismissPromoBanner } =
        useDismissUntilNavigation(pageProps.membershipPromo?.status ?? null);
    const scrolled = useScrolled(20);
    const headerRef = useRef<HTMLElement>(null);

    useEffect(() => {
        clearLegacyPromoDismissStorage();
    }, []);

    useEffect(() => {
        const el = headerRef.current;
        if (!el) return;

        const updateHeight = () => {
            const h = el.getBoundingClientRect().height;
            document.documentElement.style.setProperty('--header-h', `${Math.round(h)}px`);
        };

        // Segera hitung tinggi aktual pada mount
        updateHeight();

        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const height = entry.borderBoxSize?.[0]?.blockSize ?? entry.target.getBoundingClientRect().height;
                document.documentElement.style.setProperty('--header-h', `${Math.round(height)}px`);
            }
        });

        observer.observe(el);

        return () => {
            observer.disconnect();
        };
    }, []);

    return (
        <div className="flex min-h-screen flex-col bg-white">
            <OrganizationSchema />
            <a
                href="#konten"
                className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:rounded-control focus:bg-navy focus:px-4 focus:py-3 focus:text-sm focus:font-semibold focus:text-white"
            >
                {t('global.action.skip_to_content')}
            </a>

            {/* Wadah Header Gabungan Sticky (Navbar + MembershipPromoBar) */}
            <header
                ref={headerRef}
                className={cx(
                    'sticky top-0 z-50 w-full bg-white transition-shadow duration-200',
                    scrolled ? 'shadow-soft' : ''
                )}
            >
                <Navbar scrolled={scrolled} />
                <MembershipPromoBar
                    dismissed={promoDismissed}
                    onDismiss={dismissPromoBanner}
                />
            </header>

            <main id="konten" tabIndex={-1} className="flex-1 focus:outline-none">
                {children}
            </main>
            <FooterShell />
            <AppToaster />
            {canEditCopy ? (
                <Suspense fallback={null}>
                    <InlineCopyEditor />
                </Suspense>
            ) : null}
        </div>
    );
}
