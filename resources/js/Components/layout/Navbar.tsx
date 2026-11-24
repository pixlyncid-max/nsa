import BrandLogo from '@/Components/layout/BrandLogo';
import CartButton from '@/Components/layout/CartButton';
import CartDrawer from '@/Components/layout/CartDrawer';
import Container from '@/Components/layout/Container';
import LanguageSwitcher from '@/Components/layout/LanguageSwitcher';
import MobileDrawer from '@/Components/layout/MobileDrawer';
import NavDropdown from '@/Components/layout/NavDropdown';
import ProductMegaMenu from '@/Components/layout/ProductMegaMenu';
import UserDropdown from '@/Components/layout/UserDropdown';
import Button from '@/Components/ui/Button';
import { useCopy } from '@/hooks/useCopy';
import { useScrolled } from '@/hooks/useScrolled';
import { cx } from '@/lib/cx';
import { useLocale } from '@/lib/lroute';
import { resolveMembershipCta } from '@/lib/membershipCta';
import { isActivePath } from '@/lib/navigation';
import { focusRing } from '@/lib/ui';
import type { PageProps } from '@/types';
import { spring } from '@/animations/variants';
import { Link, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Menu, UserPlus } from 'lucide-react';
import { useEffect, useState } from 'react';

function navLink(active: boolean) {
    return cx(
        'relative inline-flex h-full items-center whitespace-nowrap px-2 xl:px-3 text-xs xl:text-sm font-semibold transition-colors rounded-control',
        focusRing,
        active ? 'text-navy' : 'text-ink/85 hover:text-navy'
    );
}

function ActiveBar() {
    return (
        <motion.span
            layoutId="navbar-active-bar"
            transition={spring}
            className="absolute inset-x-2.5 xl:inset-x-3 bottom-2.5 h-0.5 rounded-full bg-ocean"
        />
    );
}

interface NavbarProps {
    scrolled?: boolean;
}

export default function Navbar({ scrolled: parentScrolled }: NavbarProps = {}) {
    const { url, props } = usePage<PageProps>();
    const { t } = useCopy();
    const { lp } = useLocale();
    const internalScrolled = useScrolled(20);
    const scrolled = parentScrolled !== undefined ? parentScrolled : internalScrolled;
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
    const user = props.auth.user;
    const isApproved = user?.membership_status === 'approved';
    const isStaff = user?.role === 'admin' || user?.role === 'superadmin';
    const brandShort = props.brand?.short_name || 'NSA';
    const cta = resolveMembershipCta(user, props.membershipPromo, brandShort, t);

    const orgMenuItems = [
        {
            href: lp('/organisasi/dpp'),
            label: t('global.nav.org_dpp_label'),
            description: t('global.nav.org_dpp_desc'),
        },
        {
            href: lp('/organisasi/dpw'),
            label: t('global.nav.org_dpw_label'),
            description: t('global.nav.org_dpw_desc'),
        },
        {
            href: lp('/organisasi/dpc'),
            label: t('global.nav.org_dpc_label'),
            description: t('global.nav.org_dpc_desc'),
        },
    ];

    useEffect(() => {
        const handleOpenCart = () => setCartDrawerOpen(true);
        window.addEventListener('nsa:open-cart-drawer', handleOpenCart);
        return () => window.removeEventListener('nsa:open-cart-drawer', handleOpenCart);
    }, []);

    return (
        <div
            className={cx(
                'w-full border-b border-line bg-white transition-[height,box-shadow] duration-200',
                scrolled
                    ? 'h-[60px] shadow-soft'
                    : 'h-[64px] sm:h-[72px]'
            )}
        >
            <Container className="flex h-full items-center justify-between gap-2 lg:gap-3 xl:gap-6">
                {/* Kiri: Logo NSA */}
                <BrandLogo variant="navbar" scrolled={scrolled} />

                {/* Tengah: Menu Utama (Beranda, Organisasi, Produk, Tentang Kami, Kemitraan, Artikel, Kontak) */}
                <nav
                    className="hidden h-full items-center lg:flex"
                    aria-label={t('global.nav.aria_main')}
                >
                    <Link href={lp('/')} className={navLink(isActivePath(url, '/'))}>
                        {t('global.nav.home')}
                        {isActivePath(url, '/') ? <ActiveBar /> : null}
                    </Link>

                    {/* Dropdown Organisasi: DPP, DPW, DPC dengan satu kalimat penjelas */}
                    <NavDropdown
                        label={t('global.nav.organization')}
                        active={isActivePath(url, '/organisasi')}
                    >
                        <ul className="w-72 p-1.5">
                            {orgMenuItems.map((item) => (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        className={cx(
                                            'block rounded-control px-3 py-2.5 transition-colors hover:bg-mist',
                                            focusRing
                                        )}
                                    >
                                        <span className="block text-sm font-bold text-navy">
                                            {item.label}
                                        </span>
                                        <span className="block text-xs text-slate mt-0.5 leading-snug">
                                            {item.description}
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </NavDropdown>

                    {/* Mega-menu Produk: 3 kelompok + 1 foto sorotan */}
                    <NavDropdown
                        label={t('global.nav.products')}
                        mega
                        active={isActivePath(url, '/produk')}
                    >
                        <ProductMegaMenu />
                    </NavDropdown>

                    <Link
                        href={lp('/tentang-kami')}
                        className={navLink(isActivePath(url, '/tentang-kami'))}
                    >
                        {t('global.nav.about')}
                        {isActivePath(url, '/tentang-kami') ? <ActiveBar /> : null}
                    </Link>

                    {props.features?.partnership_enabled ? (
                        <Link
                            href={lp('/kemitraan')}
                            className={navLink(isActivePath(url, '/kemitraan'))}
                        >
                            {t('global.nav.partnership')}
                            {isActivePath(url, '/kemitraan') ? <ActiveBar /> : null}
                        </Link>
                    ) : null}

                    <Link
                        href={lp('/artikel')}
                        className={navLink(isActivePath(url, '/artikel'))}
                    >
                        {t('global.nav.articles')}
                        {isActivePath(url, '/artikel') ? <ActiveBar /> : null}
                    </Link>

                    <Link
                        href={lp('/kontak')}
                        className={navLink(isActivePath(url, '/kontak'))}
                    >
                        {t('global.nav.contact')}
                        {isActivePath(url, '/kontak') ? <ActiveBar /> : null}
                    </Link>
                </nav>

                {/* Kanan: Bahasa + Keranjang + Akun/Masuk + Tombol "Daftar Anggota" */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                    <LanguageSwitcher className="hidden sm:inline-flex" />
                    <CartButton
                        count={props.cart?.count ?? 0}
                        onOpenDrawer={() => setCartDrawerOpen(true)}
                    />

                    <div className="hidden shrink-0 items-center gap-2 lg:flex">
                        {user ? (
                            <>
                                <UserDropdown user={user} />
                                {!isApproved && !isStaff && (
                                    <Button
                                        href={cta.primaryHref}
                                        size="sm"
                                        variant="secondary"
                                        className="px-3 text-xs font-bold"
                                        iconLeft={<UserPlus className="hidden xl:block" />}
                                    >
                                        {cta.primaryLabel}
                                    </Button>
                                )}
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className={cx(
                                        'inline-flex h-10 shrink-0 items-center justify-center whitespace-nowrap rounded-control px-3 text-xs font-semibold text-navy hover:text-ocean transition-colors',
                                        focusRing
                                    )}
                                >
                                    {t('global.button.login')}
                                </Link>
                                <Button
                                    href={cta.primaryHref}
                                    size="sm"
                                    variant="primary"
                                    className="px-3.5 text-xs font-bold shadow-xs"
                                    iconLeft={<UserPlus className="hidden xl:block" />}
                                >
                                    {cta.primaryLabel}
                                </Button>
                            </>
                        )}
                    </div>

                    {/* Tombol Menu Mobile */}
                    <button
                        type="button"
                        onClick={() => setDrawerOpen(true)}
                        aria-label={t('global.action.open_menu')}
                        aria-expanded={drawerOpen}
                        className={cx(
                            'inline-flex h-11 w-11 items-center justify-center rounded-control text-navy hover:bg-mist lg:hidden',
                            focusRing
                        )}
                    >
                        <Menu className="h-6 w-6" strokeWidth={1.75} />
                    </button>
                </div>
            </Container>

            {/* Mobile Drawer Layar Penuh dengan Menu Bernomor Besar */}
            <MobileDrawer
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
            />

            <CartDrawer
                open={cartDrawerOpen}
                onClose={() => setCartDrawerOpen(false)}
            />
        </div>
    );
}
