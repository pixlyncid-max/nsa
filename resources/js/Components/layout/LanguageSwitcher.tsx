import { cx } from '@/lib/cx';
import { focusRing } from '@/lib/ui';
import type { PageProps } from '@/types';
import { router, usePage } from '@inertiajs/react';
import axios from 'axios';
import { Check, ChevronDown, Globe } from 'lucide-react';
import {
    useCallback,
    useEffect,
    useId,
    useRef,
    useState,
    type KeyboardEvent,
} from 'react';

interface LanguageSwitcherProps {
    className?: string;
    align?: 'left' | 'right';
}

const FALLBACK_LOCALES = [
    { code: 'id', short: 'ID', name: 'Bahasa Indonesia' },
    { code: 'en', short: 'EN', name: 'English' },
];

export default function LanguageSwitcher({
    className,
    align = 'right',
}: LanguageSwitcherProps) {
    const { props } = usePage<PageProps>();
    const currentLocale = props.locale === 'en' ? 'en' : 'id';
    const alternates = props.alternates ?? {};

    const locales = props.availableLocales
        ? Object.values(props.availableLocales)
        : FALLBACK_LOCALES;

    const activeMeta =
        locales.find((item) => item.code === currentLocale) ?? locales[0];

    const [open, setOpen] = useState(false);
    const [switching, setSwitching] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const menuId = useId();

    const close = useCallback(() => setOpen(false), []);

    useEffect(() => {
        if (!open) return;
        const handleClickOutside = (e: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(e.target as Node)
            ) {
                close();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [open, close]);

    const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Escape' && open) {
            e.preventDefault();
            close();
            buttonRef.current?.focus();
        }
    };

    const handleSelect = async (nextLocale: string) => {
        close();
        if (nextLocale === currentLocale || switching) return;

        setSwitching(true);

        try {
            await axios.post(
                '/locale',
                { locale: nextLocale },
                { headers: { Accept: 'application/json' } }
            );
        } catch {
            // Fallback tetap lanjut ke navigasi agar pengalaman tidak buntu
        } finally {
            setSwitching(false);
        }

        const hash = typeof window !== 'undefined' ? window.location.hash : '';
        const targetUrl = alternates[nextLocale];

        if (targetUrl) {
            const fullTarget = `${targetUrl}${hash}`;
            if (typeof window !== 'undefined') {
                // Gunakan navigasi penuh bila origin sama agar <html lang>, hreflang, dan canonical ikut diperbarui
                window.location.assign(fullTarget);
                return;
            }
        }

        router.reload();
    };

    return (
        <div
            ref={containerRef}
            onKeyDown={handleKeyDown}
            className={cx('relative inline-flex shrink-0', className)}
        >
            <button
                ref={buttonRef}
                type="button"
                disabled={switching}
                onClick={() => setOpen((prev) => !prev)}
                aria-expanded={open}
                aria-haspopup="menu"
                aria-controls={menuId}
                aria-label={`Pilih bahasa (${activeMeta?.name ?? currentLocale.toUpperCase()})`}
                className={cx(
                    'inline-flex h-10 shrink-0 flex-nowrap items-center justify-center gap-1.5 whitespace-nowrap rounded-control border border-line bg-white px-2.5 text-xs font-semibold leading-none text-navy transition-colors hover:border-ocean/40 hover:bg-mist disabled:opacity-60',
                    focusRing
                )}
            >
                <Globe className="h-4 w-4 shrink-0 text-ocean" strokeWidth={1.85} />
                <span>{activeMeta?.short ?? currentLocale.toUpperCase()}</span>
                <ChevronDown
                    className={cx(
                        'h-3.5 w-3.5 shrink-0 text-slate transition-transform duration-150',
                        open && 'rotate-180'
                    )}
                    strokeWidth={2}
                />
            </button>

            {open ? (
                <div
                    id={menuId}
                    role="menu"
                    aria-label="Pilihan bahasa"
                    className={cx(
                        'absolute top-full z-50 mt-1.5 w-48 rounded-card border border-line bg-white p-1.5 shadow-lift',
                        align === 'right' ? 'right-0' : 'left-0'
                    )}
                >
                    {locales.map((item) => {
                        const isActive = item.code === currentLocale;
                        return (
                            <button
                                key={item.code}
                                type="button"
                                role="menuitemradio"
                                aria-checked={isActive}
                                onClick={() => void handleSelect(item.code)}
                                className={cx(
                                    'flex w-full items-center justify-between gap-2 whitespace-nowrap rounded-control px-3 py-2 text-left text-xs font-semibold transition-colors',
                                    focusRing,
                                    isActive
                                        ? 'bg-mist text-ocean'
                                        : 'text-ink hover:bg-mist hover:text-navy'
                                )}
                            >
                                <span>{item.name}</span>
                                {isActive ? (
                                    <Check
                                        className="h-3.5 w-3.5 shrink-0 text-ocean"
                                        strokeWidth={2.25}
                                    />
                                ) : null}
                            </button>
                        );
                    })}
                </div>
            ) : null}
        </div>
    );
}
