import { useCopyEditMode } from '@/lib/copyEditMode';
import type { PageProps } from '@/types';
import { usePage } from '@inertiajs/react';
import { useCallback, useMemo } from 'react';

export type CopyParams = Record<string, string | number>;

function interpolate(template: string, params?: CopyParams): string {
    if (!params) {
        return template;
    }

    return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (match, name: string) => {
        if (Object.prototype.hasOwnProperty.call(params, name)) {
            return String(params[name]);
        }

        return match;
    });
}

export function useCopy() {
    const pageCopy = usePage<PageProps>().props.copy;
    const isEditMode = useCopyEditMode();
    const copy = useMemo(() => pageCopy ?? {}, [pageCopy]);

    const t = useCallback(
        (key: string, params?: CopyParams): string => {
            if (!Object.prototype.hasOwnProperty.call(copy, key)) {
                if (import.meta.env.DEV) {
                    console.warn(`[useCopy] Key teks tidak ditemukan: "${key}"`);
                    return key;
                }

                console.error(`[useCopy] Key teks tidak ditemukan: "${key}"`);
                return '';
            }

            return interpolate(copy[key], params);
        },
        [copy],
    );

    const has = useCallback(
        (key: string): boolean => Object.prototype.hasOwnProperty.call(copy, key),
        [copy],
    );

    const copyAttrs = useCallback(
        (key: string): Record<string, string> =>
            isEditMode ? { 'data-copy-key': key } : {},
        [isEditMode],
    );

    return { t, has, copy, isEditMode, copyAttrs };
}
