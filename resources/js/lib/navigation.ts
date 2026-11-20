import { Anchor, Package, Waves, type LucideIcon } from 'lucide-react';

export function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

export function isActivePath(
    url: string,
    href: string,
    exact = false
): boolean {
    const rawPath = url.split('?')[0];
    const path =
        rawPath === '/en'
            ? '/'
            : rawPath.startsWith('/en/')
            ? rawPath.slice(3)
            : rawPath;
    const normalizedHref =
        href === '/en'
            ? '/'
            : href.startsWith('/en/')
            ? href.slice(3)
            : href;

    if (exact || normalizedHref === '/') {
        return path === normalizedHref;
    }
    return path === normalizedHref || path.startsWith(`${normalizedHref}/`);
}

export interface NavLinkItem {
    label: string;
    href: string;
    description?: string;
}

export const organizationLinks: NavLinkItem[] = [
    {
        label: 'DPP',
        href: '/organisasi/dpp',
        description: 'Dewan Pengurus Pusat',
    },
    {
        label: 'DPW',
        href: '/organisasi/dpw',
        description: 'Dewan Pengurus Wilayah (provinsi)',
    },
    {
        label: 'DPC',
        href: '/organisasi/dpc',
        description: 'Dewan Pengurus Cabang (kabupaten/kota)',
    },
];

export interface ProductGroup {
    title: string;
    href: string;
    icon: LucideIcon;
    items: NavLinkItem[];
}

function subItems(groupHref: string, labels: string[]): NavLinkItem[] {
    return labels.map((label) => ({
        label,
        href: `${groupHref}/${slugify(label)}`,
    }));
}

export const productGroups: ProductGroup[] = [
    {
        title: 'Spot Air Tawar',
        href: '/produk/air-tawar',
        icon: Waves,
        items: subItems('/produk/air-tawar', [
            'Pelet Pakan Ikan',
            'Pakan Hidup',
            'Sewa Pancing',
            'Kolam Pemancingan',
            'Komunitas Air Tawar',
        ]),
    },
    {
        title: 'Spot Air Laut',
        href: '/produk/air-laut',
        icon: Anchor,
        items: subItems('/produk/air-laut', [
            'Umpan Ikan Laut',
            'Sewa Pancing Laut',
            'Sewa Kapal',
            'Komunitas Air Laut',
        ]),
    },
    {
        title: 'Lain-lain',
        href: '/produk/lain-lain',
        icon: Package,
        items: subItems('/produk/lain-lain', ['Vitamin', 'Bibit']),
    },
];

export const topLinks: NavLinkItem[] = [
    { label: 'Tentang Kami', href: '/tentang-kami' },
    { label: 'Kemitraan', href: '/kemitraan' },
    { label: 'Artikel', href: '/artikel' },
    { label: 'Kontak', href: '/kontak' },
];
