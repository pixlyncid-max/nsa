import { usePage } from '@inertiajs/react';
import type { PageProps, Brand } from '@/types';
import { copy, siteInfo } from '@/lib/copy';

export function useBrand(): Brand {
    const page = usePage<PageProps>();
    const brand = page.props?.brand;

    return {
        name: brand?.name || copy.brand.fullName,
        short_name: brand?.short_name || copy.brand.name,
        tagline: brand?.tagline || copy.brand.tagline,
        domain: brand?.domain || 'nsa.or.id',
        portal_name: brand?.portal_name || 'Portal Anggota',
        support_phone: brand?.support_phone || siteInfo.phone,
        support_email: brand?.support_email || siteInfo.email,
        address: brand?.address || siteInfo.address,
        logo_light: brand?.logo_light || null,
        logo_dark: brand?.logo_dark || null,
        logo_footer_mode: brand?.logo_footer_mode || null,
        social: brand?.social || {
            instagram: 'https://instagram.com/nsa_indonesia',
            facebook: 'https://facebook.com/nsaofficial',
            youtube: 'https://youtube.com/@nsa_indonesia',
        },
    };
}
