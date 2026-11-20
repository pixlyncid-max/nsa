import type { PageProps } from '@/types';
import { usePage } from '@inertiajs/react';
import { useCallback } from 'react';

export function useSiteMedia() {
    const siteMedia = usePage<PageProps>().props.siteMedia;

    const media = useCallback(
        (key: string, fallback = ''): string => {
            const url = siteMedia?.[key];
            return typeof url === 'string' && url.trim() !== '' ? url : fallback;
        },
        [siteMedia]
    );

    return { siteMedia: siteMedia ?? {}, media };
}
