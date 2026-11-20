import Container from '@/Components/layout/Container';
import ArchImage from '@/Components/layout/ArchImage';
import { useCopy } from '@/hooks/useCopy';
import { useSiteMedia } from '@/hooks/useSiteMedia';
import { productGroups } from '@/lib/navigation';
import { focusRing } from '@/lib/ui';
import { cx } from '@/lib/cx';
import { Link } from '@inertiajs/react';
import { ArrowRight, Sparkles } from 'lucide-react';

/**
 * Mega-menu Produk: tiga kelompok (Air Tawar, Air Laut, Lain-lain)
 * dengan sub-kategori dan satu foto sorotan sarana budidaya.
 */
export default function ProductMegaMenu() {
    const { t } = useCopy();
    const { media } = useSiteMedia();

    return (
        <Container className="grid gap-8 py-8 lg:grid-cols-12 items-start">
            {/* 3 Kolom Kategori Produk */}
            <div className="grid gap-6 sm:grid-cols-3 lg:col-span-8">
                {productGroups.map((group) => (
                    <div
                        key={group.title}
                        className="border-l border-line pl-5 first:border-l-0 first:pl-0 sm:first:border-l sm:first:pl-5"
                    >
                        <Link
                            href={group.href}
                            className={cx(
                                'group inline-flex items-center gap-2 rounded-control font-display text-base font-bold text-navy hover:text-ocean transition-colors',
                                focusRing
                            )}
                        >
                            <group.icon
                                className="h-4 w-4 text-sky shrink-0"
                                strokeWidth={2}
                            />
                            {group.title}
                        </Link>
                        <ul className="mt-3 space-y-1">
                            {group.items.map((item) => (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        className={cx(
                                            'block rounded-control py-1 text-xs text-ink/80 transition-colors hover:text-ocean hover:font-medium',
                                            focusRing
                                        )}
                                    >
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}

                {/* Tautan Lihat Semua Produk */}
                <div className="sm:col-span-3 border-t border-line pt-3 mt-2">
                    <Link
                        href="/produk"
                        className={cx(
                            'group inline-flex items-center gap-2 rounded-control text-xs font-bold text-ocean hover:text-navy transition-colors',
                            focusRing
                        )}
                    >
                        <span>{t('global.action.view_all_products')}</span>
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>
            </div>

            {/* Satu Foto Sorotan Produk */}
            <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-line pt-6 lg:pt-0 lg:pl-8">
                <Link
                    href="/produk"
                    className={cx(
                        'group block rounded-2xl p-3 bg-mist/60 border border-line hover:border-ocean/40 transition-all shadow-xs',
                        focusRing
                    )}
                >
                    <div className="flex items-center gap-1.5 mb-2.5">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-ocean bg-ocean/10 px-2 py-0.5 rounded-full">
                            <Sparkles className="w-3 h-3" />
                            {t('global.megamenu.spotlight_badge')}
                        </span>
                    </div>

                    <ArchImage
                        src={media(
                            'megamenu_spotlight',
                            '/images/products/featured-spotlight.jpg'
                        )}
                        alt={t('global.megamenu.spotlight_alt')}
                        aspectRatio="aspect-[16/10]"
                        className="mb-3"
                    />

                    <p className="font-display text-sm font-bold text-navy group-hover:text-ocean transition-colors">
                        {t('global.megamenu.spotlight_title')}
                    </p>
                    <p className="text-xs text-slate mt-1 line-clamp-2">
                        {t('global.megamenu.spotlight_desc')}
                    </p>
                </Link>
            </div>
        </Container>
    );
}
