import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';
import { cx } from '@/lib/cx';
import { focusRing } from '@/lib/ui';
import { motion } from 'framer-motion';
import {
    useId,
    useRef,
    useState,
    type KeyboardEvent,
    type ReactNode,
} from 'react';

export interface TabItem {
    id: string;
    label: string;
    count?: number;
    disabled?: boolean;
    content?: ReactNode;
}

interface TabsProps {
    items: TabItem[];
    ariaLabel: string;
    value?: string;
    defaultValue?: string;
    onChange?: (id: string) => void;
    className?: string;
}

export default function Tabs({
    items,
    ariaLabel,
    value,
    defaultValue,
    onChange,
    className,
}: TabsProps) {
    const uid = useId();
    const reduced = usePrefersReducedMotion();
    const buttons = useRef<Record<string, HTMLButtonElement | null>>({});
    const [inner, setInner] = useState(defaultValue ?? items[0]?.id);
    const active = value ?? inner;
    const enabled = items.filter((item) => !item.disabled);

    const select = (id: string) => {
        setInner(id);
        onChange?.(id);
    };

    const onKeyDown = (event: KeyboardEvent) => {
        const index = enabled.findIndex((item) => item.id === active);
        let next: number | null = null;

        if (event.key === 'ArrowRight') next = (index + 1) % enabled.length;
        if (event.key === 'ArrowLeft')
            next = (index - 1 + enabled.length) % enabled.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = enabled.length - 1;
        if (next === null) return;

        event.preventDefault();
        const target = enabled[next];
        select(target.id);
        buttons.current[target.id]?.focus();
    };

    const activeItem = items.find((item) => item.id === active);

    return (
        <div className={className}>
            <div
                role="tablist"
                aria-label={ariaLabel}
                onKeyDown={onKeyDown}
                className="flex gap-1 overflow-x-auto border-b border-line"
            >
                {items.map((item) => {
                    const isActive = item.id === active;

                    return (
                        <button
                            key={item.id}
                            ref={(element) => {
                                buttons.current[item.id] = element;
                            }}
                            id={`${uid}-tab-${item.id}`}
                            type="button"
                            role="tab"
                            aria-selected={isActive}
                            aria-controls={`${uid}-panel-${item.id}`}
                            tabIndex={isActive ? 0 : -1}
                            disabled={item.disabled}
                            onClick={() => select(item.id)}
                            className={cx(
                                'relative inline-flex h-12 shrink-0 items-center gap-2 px-4 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50',
                                focusRing,
                                'rounded-t-control',
                                isActive
                                    ? 'text-navy'
                                    : 'text-slate hover:text-navy'
                            )}
                        >
                            {item.label}
                            {item.count !== undefined ? (
                                <span className="rounded-full bg-mist px-2 py-0.5 text-xs tabular-nums text-slate">
                                    {item.count}
                                </span>
                            ) : null}
                            {isActive ? (
                                <motion.span
                                    layoutId={`${uid}-indicator`}
                                    transition={
                                        reduced
                                            ? { duration: 0 }
                                            : { duration: 0.25 }
                                    }
                                    className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-ocean"
                                />
                            ) : null}
                        </button>
                    );
                })}
            </div>
            {activeItem?.content ? (
                <div
                    role="tabpanel"
                    id={`${uid}-panel-${activeItem.id}`}
                    aria-labelledby={`${uid}-tab-${activeItem.id}`}
                    tabIndex={0}
                    className={cx('pt-6', focusRing, 'rounded-control')}
                >
                    {activeItem.content}
                </div>
            ) : null}
        </div>
    );
}
