import { dur, ease } from '@/lib/motion';
import { cx } from '@/lib/cx';
import { focusRing } from '@/lib/ui';
import { router } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import {
    useCallback,
    useEffect,
    useId,
    useRef,
    useState,
    type FocusEvent,
    type KeyboardEvent,
    type ReactNode,
} from 'react';

interface NavDropdownProps {
    label: string;
    active?: boolean;
    /** Panel selebar header (mega-menu) alih-alih kartu kecil. */
    mega?: boolean;
    children: ReactNode;
}

export default function NavDropdown({
    label,
    active = false,
    mega = false,
    children,
}: NavDropdownProps) {
    const panelId = useId();
    const [open, setOpen] = useState(false);
    const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    const close = useCallback(() => setOpen(false), []);

    const openNow = () => {
        clearTimeout(timer.current);
        setOpen(true);
    };
    const closeSoon = () => {
        clearTimeout(timer.current);
        timer.current = setTimeout(close, 120);
    };

    useEffect(() => router.on('navigate', close), [close]);
    useEffect(() => () => clearTimeout(timer.current), []);

    const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            close();
        }
    };
    const onBlur = (event: FocusEvent<HTMLDivElement>) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
            close();
        }
    };

    return (
        <div
            className={cx('h-full', !mega && 'relative')}
            onMouseEnter={openNow}
            onMouseLeave={closeSoon}
            onKeyDown={onKeyDown}
            onBlur={onBlur}
        >
            <button
                type="button"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpen((value) => !value)}
                className={cx(
                    'relative inline-flex h-full items-center gap-1 px-3 text-sm font-semibold transition-colors',
                    focusRing,
                    'rounded-control',
                    active || open ? 'text-navy' : 'text-ink hover:text-navy'
                )}
            >
                {label}
                <ChevronDown
                    className={cx(
                        'h-4 w-4 transition-transform duration-200',
                        open && 'rotate-180'
                    )}
                    strokeWidth={1.75}
                />
                {active ? (
                    <span className="absolute inset-x-3 bottom-3 h-0.5 rounded-full bg-ocean" />
                ) : null}
            </button>

            <AnimatePresence>
                {open ? (
                    <motion.div
                        id={panelId}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        transition={{ duration: dur.base, ease }}
                        className={cx(
                            'absolute z-50',
                            mega
                                ? 'inset-x-0 top-full border-b border-line bg-white shadow-lift'
                                : 'left-0 top-full w-72 pt-1'
                        )}
                    >
                        {mega ? (
                            children
                        ) : (
                            <div className="rounded-card border border-line bg-white p-2 shadow-lift">
                                {children}
                            </div>
                        )}
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </div>
    );
}
