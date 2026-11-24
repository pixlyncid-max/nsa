import BrandLogo from '@/Components/layout/BrandLogo';
import ContourPattern from '@/Components/motion/ContourPattern';
import Container from '@/Components/layout/Container';
import { useCopy } from '@/hooks/useCopy';
import { copy, siteInfo } from '@/lib/copy';
import { cx } from '@/lib/cx';
import { useLocale } from '@/lib/lroute';
import { focusRing } from '@/lib/ui';
import type { PageProps } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Mail, MapPin, Phone } from 'lucide-react';

const footerLink = cx(
    'rounded-control text-xs sm:text-sm text-white/75 underline-offset-4 transition-colors hover:text-aqua hover:underline',
    focusRing
);

export default function Footer() {
    const { props } = usePage<PageProps>();
    const { t } = useCopy();
    const { lp } = useLocale();
    const brandShort = props.brand?.short_name || copy.brand.name;

    const navLinks = [
        { href: lp('/tentang-kami'), label: t('global.nav.about') },
        ...(props.features?.partnership_enabled
            ? [{ href: lp('/kemitraan'), label: t('global.nav.partnership') }]
            : []),
        { href: lp('/artikel'), label: t('global.nav.articles') },
        { href: lp('/kontak'), label: t('global.nav.contact') },
    ];

    const orgFooterLinks = [
        {
            href: lp('/organisasi/dpp'),
            label: `${t('global.nav.org_dpp_label')} (${t('global.nav.org_dpp_desc').split(' ')[0]})`,
        },
        {
            href: lp('/organisasi/dpw'),
            label: `${t('global.nav.org_dpw_label')} (${t('global.nav.org_dpw_desc').split(' ')[0]})`,
        },
        {
            href: lp('/organisasi/dpc'),
            label: `${t('global.nav.org_dpc_label')} (${t('global.nav.org_dpc_desc').split(' ')[0]})`,
        },
    ];

    return (
        <footer className="relative overflow-hidden bg-navy text-white">
            {/* Kontur Air Halus Latar Belakang */}
            <ContourPattern
                tone="white"
                opacity={0.06}
                seed={5}
                rings={14}
                animate={false}
                className="pointer-events-none absolute inset-0"
            />

            <Container className="relative pt-12 pb-10">
                {/* Tiga Kolom: Ringkas Tentang, Menu, dan Kontak */}
                <div className="grid gap-10 border-b border-white/10 pb-12 md:grid-cols-2 lg:grid-cols-12">
                    {/* Kolom 1: Ringkas Tentang */}
                    <div className="lg:col-span-5">
                        <BrandLogo variant="footer" />
                        <p className="mt-4 max-w-sm text-xs leading-relaxed text-white/80 sm:text-sm">
                            {t('global.footer.tagline')}
                        </p>
                        <p className="mt-3 max-w-sm text-xs leading-relaxed text-white/60">
                            {t('global.footer.about_body')}
                        </p>
                    </div>

                    {/* Kolom 2: Menu Lengkap */}
                    <div className="grid grid-cols-2 gap-6 lg:col-span-4">
                        <div>
                            <h4 className="t-eyebrow mb-3 text-aqua">
                                {t('global.footer.nav_heading')}
                            </h4>
                            <ul className="space-y-2">
                                <li>
                                    <Link href={lp('/')} className={footerLink}>
                                        {t('global.nav.home')}
                                    </Link>
                                </li>
                                <li>
                                    <Link href={lp('/produk')} className={footerLink}>
                                        {t('global.footer.nav_shop')}
                                    </Link>
                                </li>
                                {navLinks.map((item) => (
                                    <li key={item.href}>
                                        <Link href={item.href} className={footerLink}>
                                            {item.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h4 className="t-eyebrow mb-3 text-aqua">
                                {t('global.nav.organization')}
                            </h4>
                            <ul className="space-y-2">
                                {orgFooterLinks.map((item) => (
                                    <li key={item.href}>
                                        <Link href={item.href} className={footerLink}>
                                            {item.label}
                                        </Link>
                                    </li>
                                ))}
                                <li>
                                    <Link
                                        href={lp('/tentang-kami#program-kerja')}
                                        className={footerLink}
                                    >
                                        {t('global.footer.nav_programs')}
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Kolom 3: Kontak Sekretariat */}
                    <div className="lg:col-span-3">
                        <h4 className="t-eyebrow mb-3 text-aqua">
                            {t('global.footer.contact_heading')}
                        </h4>
                        <ul className="space-y-3 text-xs text-white/80 sm:text-sm">
                            <li className="flex items-start gap-3">
                                <MapPin
                                    className="mt-0.5 h-4 w-4 shrink-0 text-aqua"
                                    strokeWidth={1.75}
                                />
                                <span className="leading-snug">{siteInfo.address}</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone
                                    className="h-4 w-4 shrink-0 text-aqua"
                                    strokeWidth={1.75}
                                />
                                <a
                                    href={`tel:${siteInfo.phone.replace(/\s/g, '')}`}
                                    className={footerLink}
                                >
                                    {siteInfo.phone}
                                </a>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail
                                    className="h-4 w-4 shrink-0 text-aqua"
                                    strokeWidth={1.75}
                                />
                                <a
                                    href={`mailto:${siteInfo.email}`}
                                    className={footerLink}
                                >
                                    {siteInfo.email}
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Baris Bawah: Hak Cipta Kecil */}
                <div className="flex flex-col gap-4 pt-6 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between">
                    <p>
                        {t('global.footer.copyright', {
                            year: new Date().getFullYear(),
                            brand: brandShort,
                        })}
                    </p>
                    <div className="flex flex-wrap gap-x-5 gap-y-2">
                        {siteInfo.socials.map((social) => (
                            <a
                                key={social.label}
                                href={social.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={footerLink}
                            >
                                {social.label}
                            </a>
                        ))}
                    </div>
                </div>
            </Container>
        </footer>
    );
}
