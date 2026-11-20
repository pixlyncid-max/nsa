import PortalLayout, { defaultAccountMenuItems } from '@/Layouts/PortalLayout';
import type { ReactNode } from 'react';

/**
 * AccountLayout delegating directly to PortalLayout with default account menus.
 */
export default function AccountLayout({
    title,
    children,
}: {
    title: string;
    children: ReactNode;
}) {
    return (
        <PortalLayout
            title={title}
            areaLabel="AREA AKUN"
            menuItems={defaultAccountMenuItems}
        >
            {children}
        </PortalLayout>
    );
}
