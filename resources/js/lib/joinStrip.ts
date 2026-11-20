import type { User } from '@/types';

export const DEFAULT_VISIBLE_STATUSES = ['guest', 'non_member', 'draft'] as const;

export interface ShouldShowJoinStripOptions {
    user: User | null | undefined;
    currentPath?: string;
    visibleStatuses?: readonly string[];
    exceptPaths?: readonly string[];
}

/**
 * Fungsi murni untuk menentukan apakah strip ajakan gabung di atas footer
 * boleh ditampilkan pada konteks pengguna dan path tertentu.
 */
export function shouldShowJoinStrip({
    user,
    currentPath = '/',
    visibleStatuses = DEFAULT_VISIBLE_STATUSES,
    exceptPaths = [],
}: ShouldShowJoinStripOptions): boolean {
    const cleanPath = currentPath.split('?')[0] || '/';

    const nonPublicPrefixes = [
        '/admin',
        '/akun',
        '/anggota',
        '/login',
        '/register',
        '/forgot-password',
        '/reset-password',
    ];

    if (
        nonPublicPrefixes.some(
            (prefix) => cleanPath === prefix || cleanPath.startsWith(`${prefix}/`)
        )
    ) {
        return false;
    }

    if (
        exceptPaths.some(
            (prefix) => cleanPath === prefix || cleanPath.startsWith(`${prefix}/`)
        )
    ) {
        return false;
    }

    if (!user) {
        return visibleStatuses.includes('guest');
    }

    if (user.role !== 'user') {
        return false;
    }

    return visibleStatuses.includes(user.membership_status);
}
