import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCopy } from '@/hooks/useCopy';
import { useDismissUntilNavigation } from '@/hooks/useDismissUntilNavigation';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';
import {
    Sparkles,
    Clock,
    AlertTriangle,
    CreditCard,
    AlertCircle,
    X,
    ArrowRight,
} from 'lucide-react';
import {
    DISMISS_SCOPE,
    getPromoBarConfig,
    shouldShowPromoBar,
    isPromoDismissed,
    dismissPromo,
} from '@/lib/membershipPromo';
import { cx } from '@/lib/cx';
import type { PageProps } from '@/types';

interface MembershipPromoBarProps {
    dismissed?: boolean;
    onDismiss?: () => void;
}

export default function MembershipPromoBar({
    dismissed: controlledDismissed,
    onDismiss: controlledOnDismiss,
}: MembershipPromoBarProps = {}) {
    const { url, props } = usePage<PageProps>();
    const { t } = useCopy();
    const user = props.auth.user;
    const promoData = props.membershipPromo;
    const brandShortName = props.brand?.short_name || 'NSA';
    const prefersReducedMotion = usePrefersReducedMotion();

    const internal = useDismissUntilNavigation(promoData?.status ?? null);
    const memoryDismissed =
        controlledDismissed !== undefined ? controlledDismissed : internal.dismissed;

    const isDismissed =
        !promoData?.status ||
        memoryDismissed ||
        (DISMISS_SCOPE !== 'navigation' &&
            typeof window !== 'undefined' &&
            isPromoDismissed(promoData.status));

    const isVisible = shouldShowPromoBar({
        user,
        promoData,
        currentPath: url,
        isDismissed,
    });

    const config = promoData ? getPromoBarConfig(promoData, brandShortName, t) : null;

    if (!config) {
        return null;
    }

    const handleDismiss = () => {
        if (promoData?.status && DISMISS_SCOPE !== 'navigation') {
            dismissPromo(promoData.status);
        }

        if (controlledOnDismiss) {
            controlledOnDismiss();
        } else {
            internal.dismiss();
        }

        // Kembalikan fokus keyboard ke elemen logis (awal konten) setelah banner ditutup
        if (typeof document !== 'undefined') {
            requestAnimationFrame(() => {
                const mainEl = document.getElementById('konten');
                mainEl?.focus();
            });
        }
    };

    const renderIcon = () => {
        const iconClasses = config.isImportant
            ? config.variant === 'danger'
                ? 'text-danger'
                : 'text-amber-600'
            : 'text-ocean';

        switch (config.icon) {
            case 'Sparkles':
                return <Sparkles className={`w-4 h-4 shrink-0 ${iconClasses}`} />;
            case 'Clock':
                return <Clock className={`w-4 h-4 shrink-0 ${iconClasses}`} />;
            case 'AlertTriangle':
                return <AlertTriangle className={`w-4 h-4 shrink-0 ${iconClasses}`} />;
            case 'CreditCard':
                return <CreditCard className={`w-4 h-4 shrink-0 ${iconClasses}`} />;
            case 'AlertCircle':
                return <AlertCircle className={`w-4 h-4 shrink-0 ${iconClasses}`} />;
            default:
                return <Sparkles className={`w-4 h-4 shrink-0 ${iconClasses}`} />;
        }
    };

    return (
        <AnimatePresence initial={false}>
            {isVisible && (
                <motion.div
                    key={`promo-bar-${promoData?.status}`}
                    initial={prefersReducedMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
                    animate={prefersReducedMotion ? { opacity: 1 } : { height: 'auto', opacity: 1 }}
                    exit={prefersReducedMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
                    transition={{ duration: prefersReducedMotion ? 0 : 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden border-b border-line bg-mist"
                    role="region"
                    aria-label={t('global.promo.aria_region')}
                >
                    <div className="container-page py-1.5 sm:py-2">
                        <div className="flex items-center justify-between gap-2 sm:gap-3 text-xs sm:text-sm">
                            {/* Pesan & Ikon Status */}
                            <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-2.5">
                                {renderIcon()}

                                {config.isImportant && (
                                    <span
                                        className={cx(
                                            'hidden sm:inline-flex shrink-0 items-center px-1.5 py-0.5 rounded text-[10px] sm:text-[11px] font-bold tracking-wide uppercase',
                                            config.variant === 'danger'
                                                ? 'bg-rose-100 text-rose-800'
                                                : 'bg-amber-100 text-amber-800'
                                        )}
                                    >
                                        {config.badgeLabel}
                                    </span>
                                )}

                                <p className="line-clamp-2 text-navy font-medium text-[13px] sm:text-sm leading-snug sm:leading-normal">
                                    <span className="hidden sm:inline">{config.text}</span>
                                    <span className="inline sm:hidden">{config.mobileText}</span>
                                </p>
                            </div>

                            {/* Tombol Aksi & Tombol Tutup */}
                            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                                <Link
                                    href={config.href}
                                    className={cx(
                                        'inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-control px-2.5 sm:px-3.5 text-xs font-semibold shadow-xs transition-all h-[34px] sm:h-[36px]',
                                        config.variant === 'danger'
                                            ? 'bg-danger text-white hover:bg-danger/90'
                                            : 'bg-ocean text-white hover:bg-navy'
                                    )}
                                >
                                    <span>{config.buttonText}</span>
                                    <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                                </Link>

                                <button
                                    type="button"
                                    onClick={handleDismiss}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Escape') {
                                            handleDismiss();
                                        }
                                    }}
                                    className="inline-flex h-11 w-11 items-center justify-center rounded-control text-slate hover:bg-sand/40 hover:text-navy transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean"
                                    aria-label={t('global.promo.close_label')}
                                    title={t('global.promo.close_label')}
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
