import { openOrdersDrawer } from '@/Components/layout/OrdersDrawer';
import { openProfileDrawer } from '@/Components/layout/ProfileDrawer';
import { useCopy } from '@/hooks/useCopy';
import { cx } from '@/lib/cx';
import { focusRing } from '@/lib/ui';
import { dur, ease } from '@/lib/motion';
import type { User } from '@/types';
import { Link, router } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    ChevronDown,
    LayoutDashboard,
    LogOut,
    ShoppingBag,
    UserRound,
} from 'lucide-react';
import {
    useCallback,
    useEffect,
    useId,
    useRef,
    useState,
    type KeyboardEvent,
} from 'react';

interface UserDropdownProps {
    user: User;
}

type DrawerType = 'orders' | 'profile';

interface MenuItemDef {
    label: string;
    icon: typeof LayoutDashboard;
    href?: string;
    drawerType?: DrawerType;
    badge?: string;
}

export default function UserDropdown({ user }: UserDropdownProps) {
    const { t } = useCopy();
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const menuId = useId();

    const close = useCallback(() => setOpen(false), []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                close();
            }
        };

        if (open) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [open, close]);

    useEffect(() => router.on('navigate', close), [close]);

    const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            close();
        }
    };

    const isStaff = user.role === 'admin' || user.role === 'superadmin';
    const isApprovedMember = user.membership_status === 'approved';

    const dashboardHref = isStaff ? '/admin' : isApprovedMember ? '/anggota' : '/akun';
    const dashboardLabel = isStaff
        ? t('global.user_menu.dashboard_admin')
        : t('global.user_menu.dashboard');

    const menuItems: MenuItemDef[] = [
        {
            label: dashboardLabel,
            href: dashboardHref,
            icon: LayoutDashboard,
            badge: isStaff
                ? t('global.user_menu.badge_staff')
                : isApprovedMember
                ? t('global.user_menu.badge_member')
                : undefined,
        },
        {
            label: t('global.user_menu.orders'),
            drawerType: 'orders',
            icon: ShoppingBag,
        },
        {
            label: t('global.user_menu.profile'),
            drawerType: 'profile',
            icon: UserRound,
        },
    ];

    const handleOpenDrawer = (type: DrawerType) => {
        close();
        if (type === 'orders') openOrdersDrawer();
        else if (type === 'profile') openProfileDrawer();
    };

    return (
        <div ref={dropdownRef} className="relative" onKeyDown={onKeyDown}>
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                aria-expanded={open}
                aria-haspopup="true"
                aria-controls={menuId}
                className={cx(
                    'inline-flex h-10 items-center gap-2.5 rounded-full border border-line bg-white pl-2 pr-3.5 text-xs font-semibold text-navy transition-all hover:border-ocean/40 hover:bg-mist shadow-soft',
                    focusRing,
                    open && 'border-ocean ring-2 ring-ocean/15'
                )}
            >
                <span
                    aria-hidden="true"
                    className="grid h-6 w-6 place-items-center rounded-full bg-navy font-display text-xs font-bold text-white shadow-soft overflow-hidden shrink-0"
                >
                    {user.avatar ? (
                        <img
                            src={user.avatar}
                            alt={user.name}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        user.name.slice(0, 1).toUpperCase()
                    )}
                </span>
                <span className="max-w-[130px] truncate text-ink">
                    {user.name}
                </span>
                <ChevronDown
                    className={cx(
                        'h-3.5 w-3.5 text-slate transition-transform duration-200',
                        open && 'rotate-180'
                    )}
                    strokeWidth={2}
                />
            </button>

            <AnimatePresence>
                {open ? (
                    <motion.div
                        id={menuId}
                        role="menu"
                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.98 }}
                        transition={{ duration: dur.fast, ease }}
                        className="absolute right-0 top-full z-50 mt-2 w-64 rounded-card border border-line bg-white p-2 shadow-soft"
                    >
                        {/* Header Profil Singkat */}
                        <div className="border-b border-line px-3 py-2.5 flex items-center gap-2.5">
                            <div className="grid h-9 w-9 place-items-center rounded-full bg-navy font-display text-xs font-bold text-white shadow-soft overflow-hidden shrink-0 border border-line">
                                {user.avatar ? (
                                    <img
                                        src={user.avatar}
                                        alt={user.name}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    user.name.slice(0, 1).toUpperCase()
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-bold text-navy">
                                    {user.name}
                                </p>
                                {isApprovedMember ? (
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <span className="inline-flex items-center rounded bg-ocean/10 px-1.5 py-0.5 text-[10px] font-bold text-ocean">
                                            {t('global.user_menu.badge_member')}
                                        </span>
                                        {user.member_number ? (
                                            <span className="font-mono text-[11px] text-slate truncate">
                                                {user.member_number}
                                            </span>
                                        ) : null}
                                    </div>
                                ) : (
                                    <p className="truncate text-xs text-slate">
                                        {user.email}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Daftar Menu Dropdown: Dashboard, Pesanan Saya, Profil */}
                        <div className="py-1">
                            {menuItems.map((item) =>
                                item.drawerType ? (
                                    <button
                                        key={item.label}
                                        type="button"
                                        role="menuitem"
                                        onClick={() => handleOpenDrawer(item.drawerType!)}
                                        className={cx(
                                            'flex w-full items-center gap-3 rounded-control px-3 py-2 text-xs font-semibold text-ink transition-colors hover:bg-mist hover:text-navy text-left',
                                            focusRing
                                        )}
                                    >
                                        <item.icon
                                            className="h-4 w-4 text-ocean shrink-0"
                                            strokeWidth={1.75}
                                        />
                                        <span className="flex-1 truncate">
                                            {item.label}
                                        </span>
                                        {item.badge ? (
                                            <span className="rounded bg-navy/10 px-1.5 py-0.5 text-[10px] font-bold text-navy">
                                                {item.badge}
                                            </span>
                                        ) : null}
                                    </button>
                                ) : (
                                    <Link
                                        key={item.label}
                                        href={item.href!}
                                        role="menuitem"
                                        onClick={close}
                                        className={cx(
                                            'flex items-center gap-3 rounded-control px-3 py-2 text-xs font-semibold text-ink transition-colors hover:bg-mist hover:text-navy',
                                            focusRing
                                        )}
                                    >
                                        <item.icon
                                            className="h-4 w-4 text-ocean shrink-0"
                                            strokeWidth={1.75}
                                        />
                                        <span className="flex-1 truncate">
                                            {item.label}
                                        </span>
                                        {item.badge ? (
                                            <span className="rounded bg-navy/10 px-1.5 py-0.5 text-[10px] font-bold text-navy">
                                                {item.badge}
                                            </span>
                                        ) : null}
                                    </Link>
                                )
                            )}
                        </div>

                        {/* Tombol Logout: Keluar */}
                        <div className="border-t border-line pt-1">
                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                role="menuitem"
                                className={cx(
                                    'flex w-full items-center gap-3 rounded-control px-3 py-2 text-xs font-semibold text-danger transition-colors hover:bg-danger/10',
                                    focusRing
                                )}
                            >
                                <LogOut className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                                <span>{t('global.button.logout')}</span>
                            </Link>
                        </div>
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </div>
    );
}
