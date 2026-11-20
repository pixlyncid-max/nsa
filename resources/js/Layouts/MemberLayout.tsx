import DashboardShell from '@/Components/layout/DashboardShell';
import type { SidebarSection } from '@/Components/layout/Sidebar';
import { Head } from '@inertiajs/react';
import {
    CreditCard,
    FileText,
    IdCard,
    LayoutDashboard,
    Settings,
    ShieldCheck,
    Store,
} from 'lucide-react';
import type { ReactNode } from 'react';

const sections: SidebarSection[] = [
    {
        items: [
            {
                label: 'Dashboard',
                href: '/anggota',
                icon: LayoutDashboard,
                exact: true,
            },
            {
                label: 'Profil & Verifikasi',
                href: '/akun/keanggotaan/formulir',
                icon: ShieldCheck,
            },
            {
                label: 'Kartu Anggota',
                href: '/akun/keanggotaan/status',
                icon: IdCard,
            },
            {
                label: 'Usaha & Legalitas',
                href: '/akun/keanggotaan/formulir',
                icon: Store,
            },
            {
                label: 'Program NSA',
                href: '/tentang-kami',
                icon: FileText,
            },
            {
                label: 'Iuran & Administrasi',
                href: '/akun/pesanan',
                icon: CreditCard,
            },
            {
                label: 'Pengaturan',
                href: '/profile',
                icon: Settings,
            },
        ],
    },
];

export default function MemberLayout({
    title,
    children,
}: {
    title: string;
    children: ReactNode;
}) {
    return (
        <>
            <Head title={title} />
            <DashboardShell
                areaLabel="Portal Anggota"
                sections={sections}
                title={title}
                backToWebsite={true}
            >
                {children}
            </DashboardShell>
        </>
    );
}
