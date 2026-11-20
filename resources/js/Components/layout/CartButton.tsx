import { useCopy } from '@/hooks/useCopy';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';
import { cx } from '@/lib/cx';
import { focusRing } from '@/lib/ui';
import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { useEffect, useState } from 'react';

/**
 * Ikon keranjang + badge jumlah.
 * Berdenyut saat jumlah berubah atau saat produk cepat ditambahkan ke keranjang.
 */
export default function CartButton({
    count,
    onOpenDrawer,
}: {
    count: number;
    onOpenDrawer?: () => void;
}) {
    const { t } = useCopy();
    const reduced = usePrefersReducedMotion();
    const [pulseTick, setPulseTick] = useState(0);

    useEffect(() => {
        const handlePulse = () => setPulseTick((tick) => tick + 1);
        window.addEventListener('nsa:open-cart-drawer', handlePulse);
        window.addEventListener('nsa:cart-pulse', handlePulse);
        return () => {
            window.removeEventListener('nsa:open-cart-drawer', handlePulse);
            window.removeEventListener('nsa:cart-pulse', handlePulse);
        };
    }, []);

    const label =
        count > 0
            ? t('global.action.cart_with_count', { count })
            : t('global.action.cart');

    return (
        <Link
            href="/keranjang"
            onClick={(e) => {
                if (onOpenDrawer) {
                    e.preventDefault();
                    onOpenDrawer();
                }
            }}
            aria-label={label}
            className={cx(
                'relative inline-flex h-11 w-11 items-center justify-center rounded-control text-navy transition-colors hover:bg-mist',
                focusRing
            )}
        >
            <motion.span
                key={`icon-${count}-${pulseTick}`}
                initial={reduced || pulseTick === 0 ? false : { scale: 1.28 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 420, damping: 15 }}
                className="inline-flex items-center justify-center"
            >
                <ShoppingCart className="h-[22px] w-[22px]" strokeWidth={1.75} />
            </motion.span>

            {count > 0 ? (
                <motion.span
                    key={`badge-${count}-${pulseTick}`}
                    initial={reduced ? false : { scale: 1.45 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 420, damping: 16 }}
                    className="absolute right-0.5 top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-ocean px-1 text-[11px] font-bold leading-none text-white"
                >
                    {count > 99 ? '99+' : count}
                </motion.span>
            ) : null}
        </Link>
    );
}
