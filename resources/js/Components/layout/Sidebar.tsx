import Logo from '@/Components/layout/Logo';
import ContourPattern from '@/Components/motion/ContourPattern';
import Button from '@/Components/ui/Button';
import { copy } from '@/lib/copy';
import { cx } from '@/lib/cx';
import { isActivePath } from '@/lib/navigation';
import { focusRing } from '@/lib/ui';
import type { PageProps } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Globe, LifeBuoy, LogOut, type LucideIcon } from 'lucide-react';

export interface SidebarItem {
    label: string;
    href: string;
    icon: LucideIcon;
    exact?: boolean;
    badge?: number;
}

export interface SidebarSection {
    heading?: string;
    items: SidebarItem[];
}

interface SidebarProps {
    areaLabel: string;
    sections: SidebarSection[];
    backToWebsite?: boolean;
}

/** Sidebar navy: menu aktif berupa pil `ocean`, kotak bantuan di bawah atau tombol kembali ke web. */
export default function Sidebar({
    areaLabel,
    sections,
    backToWebsite = false,
}: SidebarProps) {
    const { url, props } = usePage<PageProps>();
    const user = props.auth.user;

    return (
        <div className="relative flex h-full flex-col overflow-hidden bg-navy text-white">
            <ContourPattern
                tone="white"
                opacity={0.06}
                seed={5}
                rings={11}
                animate={false}
                className="absolute inset-0"
            />

            <div className="relative px-6 pb-5 pt-7">
                <Logo tone="light" />
                <p className="t-eyebrow mt-3 text-aqua">{areaLabel}</p>
            </div>

            <nav
                className="relative flex-1 space-y-6 overflow-y-auto px-4 pb-4"
                aria-label={areaLabel}
            >
                {sections.map((section, index) => (
                    <div key={section.heading ?? index}>
                        {section.heading ? (
                            <p className="t-eyebrow mb-2 px-4 text-white/60">
                                {section.heading}
                            </p>
                        ) : null}
                        <ul className="space-y-1">
                            {section.items.map((item) => {
                                const active = isActivePath(
                                    url,
                                    item.href,
                                    item.exact
                                );
                                return (
                                    <li key={item.href}>
                                        <Link
                                            href={item.href}
                                            aria-current={
                                                active ? 'page' : undefined
                                            }
                                            className={cx(
                                                'flex h-11 items-center gap-3 rounded-full px-4 text-sm font-semibold transition-colors',
                                                focusRing,
                                                active
                                                    ? 'bg-ocean text-white shadow-soft'
                                                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                                            )}
                                        >
                                            <item.icon
                                                className="h-5 w-5 shrink-0"
                                                strokeWidth={1.75}
                                            />
                                            <span className="flex-1 truncate">
                                                {item.label}
                                            </span>
                                            {item.badge ? (
                                                <span className="rounded-full bg-aqua px-2 py-0.5 text-xs font-bold text-navy">
                                                    {item.badge}
                                                </span>
                                            ) : null}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </nav>

            <div className="relative space-y-4 p-4">
                {backToWebsite ? (
                    <Link
                        href="/"
                        className={cx(
                            'flex h-11 items-center justify-center gap-2.5 rounded-control border border-white/20 bg-white/10 px-4 text-sm font-semibold text-white transition-colors hover:border-aqua hover:bg-white/15',
                            focusRing
                        )}
                    >
                        <Globe className="h-4 w-4 text-aqua" strokeWidth={1.75} />
                        <span>{copy.actions.backToWebsite}</span>
                    </Link>
                ) : (
                    <div className="rounded-card bg-navy-900 p-4">
                        <div className="flex items-center gap-2 text-aqua">
                            <LifeBuoy className="h-5 w-5" strokeWidth={1.75} />
                            <p className="font-display text-base font-semibold text-white">
                                {copy.help.title}
                            </p>
                        </div>
                        <p className="mt-2 text-[13px] leading-relaxed text-white/75">
                            {copy.help.body}
                        </p>
                        <Button
                            href="/kontak"
                            variant="secondary"
                            size="sm"
                            fullWidth
                            className="mt-3 !border-white/60 !bg-transparent !text-white hover:!bg-white/10"
                        >
                            {copy.help.action}
                        </Button>
                    </div>
                )}

                {user ? (
                    <div className="flex items-center gap-3 border-t border-white/15 pt-4">
                        <span
                            aria-hidden="true"
                            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white font-display text-sm font-bold text-navy"
                        >
                            {user.name.slice(0, 1).toUpperCase()}
                        </span>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold">
                                {user.name}
                            </p>
                            <p className="truncate text-xs text-white/70">
                                {user.email}
                            </p>
                        </div>
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            aria-label={copy.actions.logout}
                            className={cx(
                                'inline-flex h-11 w-11 items-center justify-center rounded-control text-white/80 transition-colors hover:bg-white/10 hover:text-white',
                                focusRing
                            )}
                        >
                            <LogOut className="h-5 w-5" strokeWidth={1.75} />
                        </Link>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
