import { cx } from '@/lib/cx';
import { focusRing } from '@/lib/ui';
import React, { useEffect, useState } from 'react';

export interface StickyIndexItem {
    id: string;
    index: string;
    label: string;
}

export interface StickyIndexProps {
    items: StickyIndexItem[];
    title?: string;
    /** Varian tampilan: sidebar desktop (default) atau bar tab horizontal mobile */
    variant?: 'sidebar' | 'mobile-bar';
    className?: string;
}

function useScrollSpy(items: StickyIndexItem[]) {
    const [activeId, setActiveId] = useState<string>(() => {
        if (typeof window !== 'undefined') {
            const hash = window.location.hash.replace(/^#/, '');
            if (hash && items.some((it) => it.id === hash)) {
                return hash;
            }
        }
        return items[0]?.id ?? '';
    });

    useEffect(() => {
        if (typeof window === 'undefined' || items.length === 0) return;

        const targets = items
            .map((item) => document.getElementById(item.id))
            .filter((el): el is HTMLElement => Boolean(el));

        if (targets.length === 0) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            {
                rootMargin: '-18% 0px -65% 0px',
                threshold: 0,
            }
        );

        targets.forEach((target) => observer.observe(target));

        return () => {
            observer.disconnect();
        };
    }, [items]);

    const scrollToId = (
        e: React.MouseEvent<HTMLAnchorElement>,
        id: string
    ) => {
        e.preventDefault();
        const element = document.getElementById(id);
        if (element) {
            const headerHeight = parseInt(
                getComputedStyle(document.documentElement).getPropertyValue(
                    '--header-h'
                ) || '72',
                10
            );
            const elementPosition =
                element.getBoundingClientRect().top + window.scrollY;
            const offsetPosition = elementPosition - (headerHeight + 56);

            window.scrollTo({
                top: Math.max(0, offsetPosition),
                behavior: 'smooth',
            });
            if (window.history?.replaceState) {
                window.history.replaceState(null, '', `#${id}`);
            }
            setActiveId(id);
        }
    };

    return { activeId, scrollToId };
}

/**
 * Primitif StickyIndex: navigasi indeks bab menempel di sisi kiri (desktop)
 * atau baris tab horizontal yang bisa digeser di bawah header (mobile),
 * lengkap dengan scrollspy (IntersectionObserver) dan kompensasi --header-h.
 */
export default function StickyIndex({
    items,
    title = 'Indeks Bab',
    variant = 'sidebar',
    className,
}: StickyIndexProps) {
    const { activeId, scrollToId } = useScrollSpy(items);

    if (variant === 'mobile-bar') {
        return (
            <nav
                aria-label="Indeks bab halaman (mobile)"
                style={{ top: 'var(--header-h, 72px)' }}
                className={cx(
                    'sticky z-30 border-b border-line bg-white/95 backdrop-blur-md lg:hidden',
                    className
                )}
            >
                <ul className="flex items-center gap-1.5 overflow-x-auto px-4 py-2.5 scrollbar-none">
                    {items.map((item) => {
                        const isActive = activeId === item.id;
                        return (
                            <li key={item.id} className="shrink-0">
                                <a
                                    href={`#${item.id}`}
                                    onClick={(e) => scrollToId(e, item.id)}
                                    aria-current={
                                        isActive ? 'location' : undefined
                                    }
                                    className={cx(
                                        'inline-flex min-h-[38px] items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors',
                                        focusRing,
                                        isActive
                                            ? 'bg-navy text-white shadow-xs'
                                            : 'bg-mist text-slate hover:text-navy'
                                    )}
                                >
                                    <span
                                        className={cx(
                                            'font-mono text-[10px]',
                                            isActive
                                                ? 'text-aqua'
                                                : 'text-ocean'
                                        )}
                                    >
                                        {item.index}
                                    </span>
                                    <span>{item.label}</span>
                                </a>
                            </li>
                        );
                    })}
                </ul>
            </nav>
        );
    }

    return (
        <nav
            aria-label="Indeks bab halaman"
            style={{ top: 'calc(var(--header-h, 72px) + 24px)' }}
            className={cx(
                'sticky rounded-2xl border border-line bg-white/95 p-5 shadow-soft backdrop-blur-sm',
                className
            )}
        >
            <div className="mb-4 flex items-center justify-between border-b border-line pb-3">
                <span className="t-eyebrow text-slate">{title}</span>
                <span className="font-mono text-[11px] font-bold text-ocean">
                    {items.length} Bab
                </span>
            </div>

            <ul className="space-y-1">
                {items.map((item) => {
                    const isActive = activeId === item.id;
                    return (
                        <li key={item.id}>
                            <a
                                href={`#${item.id}`}
                                onClick={(e) => scrollToId(e, item.id)}
                                aria-current={
                                    isActive ? 'location' : undefined
                                }
                                className={cx(
                                    'group flex min-h-[38px] items-center justify-between gap-3 rounded-control px-3 py-2 text-xs transition-all',
                                    focusRing,
                                    isActive
                                        ? 'bg-navy font-bold text-white shadow-xs'
                                        : 'font-medium text-slate hover:bg-mist hover:text-navy'
                                )}
                            >
                                <span className="flex items-center gap-2.5 truncate">
                                    <span
                                        className={cx(
                                            'font-mono text-[11px]',
                                            isActive
                                                ? 'font-bold text-aqua'
                                                : 'text-ocean group-hover:text-navy'
                                        )}
                                    >
                                        {item.index}
                                    </span>
                                    <span className="truncate">
                                        {item.label}
                                    </span>
                                </span>
                                {isActive ? (
                                    <span
                                        aria-hidden="true"
                                        className="h-1.5 w-1.5 shrink-0 rounded-full bg-aqua"
                                    />
                                ) : null}
                            </a>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}
