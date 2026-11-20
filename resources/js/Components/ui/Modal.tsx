import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';
import { cx } from '@/lib/cx';
import { focusRing } from '@/lib/ui';
import { dur, ease } from '@/lib/motion';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

type ModalSize = 'sm' | 'md' | 'lg';

interface ModalProps {
    open?: boolean;
    isOpen?: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    children?: ReactNode;
    footer?: ReactNode;
    size?: ModalSize;
}

const sizes: Record<ModalSize, string> = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
};

const FOCUSABLE =
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function Modal({
    open,
    isOpen,
    onClose,
    title,
    description,
    children,
    footer,
    size = 'md',
}: ModalProps) {
    const modalOpen = open ?? isOpen ?? false;
    const reduced = usePrefersReducedMotion();
    const titleId = useId();
    const descriptionId = useId();
    const panel = useRef<HTMLDivElement>(null);
    const onCloseRef = useRef(onClose);

    useEffect(() => {
        onCloseRef.current = onClose;
    });

    useLockBodyScroll(modalOpen);

    useEffect(() => {
        if (!modalOpen) {
            return;
        }
        const previouslyFocused = document.activeElement as HTMLElement | null;
        panel.current?.focus();

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onCloseRef.current();
                return;
            }
            if (event.key !== 'Tab' || !panel.current) {
                return;
            }
            const nodes =
                panel.current.querySelectorAll<HTMLElement>(FOCUSABLE);
            if (nodes.length === 0) {
                event.preventDefault();
                return;
            }
            const first = nodes[0];
            const last = nodes[nodes.length - 1];
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        };

        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('keydown', onKeyDown);
            previouslyFocused?.focus();
        };
    }, [modalOpen]);

    return createPortal(
        <AnimatePresence>
            {modalOpen ? (
                <div className="fixed inset-0 z-[60] flex items-end justify-center p-0 sm:items-center sm:p-6">
                    <motion.div
                        className="absolute inset-0 bg-ink/50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: reduced ? 0 : dur.base }}
                        onClick={onClose}
                        aria-hidden="true"
                    />
                    <motion.div
                        ref={panel}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby={titleId}
                        aria-describedby={
                            description ? descriptionId : undefined
                        }
                        tabIndex={-1}
                        initial={{ opacity: 0, y: reduced ? 0 : 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: reduced ? 0 : 12 }}
                        transition={{
                            duration: reduced ? 0 : dur.base,
                            ease,
                        }}
                        className={cx(
                            'relative max-h-[90vh] w-full overflow-y-auto rounded-t-card bg-white p-6 shadow-lift sm:rounded-card sm:p-8',
                            sizes[size],
                            focusRing
                        )}
                    >
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Tutup jendela"
                            className={cx(
                                'absolute right-3 top-3 inline-flex h-11 w-11 items-center justify-center rounded-control text-slate transition-colors hover:bg-mist hover:text-navy',
                                focusRing
                            )}
                        >
                            <X className="h-5 w-5" strokeWidth={1.75} />
                        </button>
                        <h2 id={titleId} className="t-h3 pr-10">
                            {title}
                        </h2>
                        {description ? (
                            <p
                                id={descriptionId}
                                className="mt-2 text-sm text-slate"
                            >
                                {description}
                            </p>
                        ) : null}
                        {children ? (
                            <div className="mt-5">{children}</div>
                        ) : null}
                        {footer ? (
                            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                                {footer}
                            </div>
                        ) : null}
                    </motion.div>
                </div>
            ) : null}
        </AnimatePresence>,
        document.body
    );
}
