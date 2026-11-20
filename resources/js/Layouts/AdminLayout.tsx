import DashboardShell from '@/Components/layout/DashboardShell';
import type { SidebarSection } from '@/Components/layout/Sidebar';
import type { PageProps } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import {
    Activity,
    Building2,
    Calendar,
    ChartColumn,
    CreditCard,
    FileText,
    Fish,
    FolderTree,
    Handshake,
    Inbox,
    Languages,
    Layers,
    LayoutDashboard,
    MapPin,
    Newspaper,
    Package,
    PenLine,
    Settings,
    ShieldAlert,
    ShoppingBag,
    Users,
} from 'lucide-react';
import type { ReactNode } from 'react';

const mainSections: SidebarSection[] = [
    {
        heading: 'Menu Utama',
        items: [
            {
                label: 'Dasbor',
                href: '/admin',
                icon: LayoutDashboard,
                exact: true,
            },
            {
                label: 'Verifikasi Anggota',
                href: '/admin/anggota',
                icon: Users,
            },
            {
                label: 'Katalog Produk',
                href: '/admin/produk',
                icon: Package,
            },
            {
                label: 'Kategori Produk',
                href: '/admin/kategori-produk',
                icon: FolderTree,
            },
            {
                label: 'Pesanan Masuk',
                href: '/admin/pesanan',
                icon: ShoppingBag,
            },
        ],
    },
    {
        heading: 'Organisasi (Struktur)',
        items: [
            {
                label: 'Pengurus DPP',
                href: '/admin/organisasi/dpp',
                icon: Building2,
            },
            {
                label: 'DPW Provinsi',
                href: '/admin/organisasi/dpw',
                icon: Layers,
            },
            {
                label: 'DPC Kab/Kota',
                href: '/admin/organisasi/dpc',
                icon: MapPin,
            },
        ],
    },
    {
        heading: 'Konten & Statistik',
        items: [
            {
                label: 'Berita & Artikel',
                href: '/admin/pos',
                icon: Newspaper,
            },
            {
                label: 'Program Kerja',
                href: '/admin/programs',
                icon: Calendar,
            },
            {
                label: 'Statistik Budidaya',
                href: '/admin/statistik',
                icon: ChartColumn,
            },
            {
                label: 'Kategori Ikan',
                href: '/admin/kategori-ikan',
                icon: Fish,
            },
            {
                label: 'Halaman Statis',
                href: '/admin/halaman',
                icon: FileText,
            },
            {
                label: 'Mitra NSA',
                href: '/admin/mitra',
                icon: Handshake,
            },
            {
                label: 'Pesan Kontak',
                href: '/admin/pesan',
                icon: Inbox,
            },
        ],
    },
];

/** Khusus superadmin (prd.md bagian 6). */
const superadminSection: SidebarSection = {
    heading: 'Khusus Superadmin',
    items: [
        {
            label: 'Kelola Akun Admin',
            href: '/admin/kelola-admin',
            icon: ShieldAlert,
        },
        {
            label: 'Pengaturan Situs',
            href: '/admin/pengaturan',
            icon: Settings,
        },
        {
            label: 'Teks Website',
            href: '/admin/teks-website',
            icon: PenLine,
        },
        {
            label: 'Terjemahan',
            href: '/admin/terjemahan',
            icon: Languages,
        },
        {
            label: 'Log Aktivitas',
            href: '/admin/log-aktivitas',
            icon: Activity,
        },
    ],
};

export default function AdminLayout({
    title,
    children,
}: {
    title: string;
    children: ReactNode;
}) {
    const role = usePage<PageProps>().props.auth.user?.role;
    const isSuperadmin = role === 'superadmin';

    const masterSection: SidebarSection = {
        heading: 'Master Keanggotaan',
        items: [
            {
                label: 'Kategori Anggota',
                href: '/admin/master-keanggotaan/kategori',
                icon: FolderTree,
            },
            {
                label: 'Jenis Keanggotaan',
                href: '/admin/master-keanggotaan/jenis',
                icon: Users,
            },
            ...(isSuperadmin
                ? [
                      {
                          label: 'Biaya & Iuran',
                          href: '/admin/master-keanggotaan/biaya',
                          icon: CreditCard,
                      },
                  ]
                : []),
            {
                label: 'Program Kerja',
                href: '/admin/programs',
                icon: Calendar,
            },
        ],
    };

    const sections = [
        mainSections[0],
        masterSection,
        mainSections[1],
        mainSections[2],
        ...(isSuperadmin ? [superadminSection] : []),
    ];

    return (
        <>
            <Head title={title} />
            <DashboardShell
                areaLabel="Panel CMS NSA"
                sections={sections}
                title={title}
                backToWebsite={true}
            >
                {children}
            </DashboardShell>
        </>
    );
}
