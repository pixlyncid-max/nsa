import type { CopyParams } from '@/hooks/useCopy';
import type { User, MembershipPromoData } from '@/types';

export type CopyTranslator = (key: string, params?: CopyParams) => string;

export interface MembershipPromoConfig {
    status: string;
    text: string;
    mobileText: string;
    buttonText: string;
    href: string;
    icon: 'Sparkles' | 'Clock' | 'AlertTriangle' | 'CreditCard' | 'AlertCircle' | 'BadgeCheck';
    variant: 'default' | 'info' | 'warning' | 'danger';
    isImportant: boolean;
    badgeLabel?: string;
}

export const PROMO_CONFIG_TEMPLATES: Record<
    string,
    {
        getText: (data: MembershipPromoData, brandName: string, t?: CopyTranslator) => string;
        getMobileText: (data: MembershipPromoData, brandName: string, t?: CopyTranslator) => string;
        getButtonText: (t?: CopyTranslator) => string;
        getBadgeLabel?: (t?: CopyTranslator) => string;
        buttonText: string;
        href: string;
        icon: MembershipPromoConfig['icon'];
        variant: MembershipPromoConfig['variant'];
        isImportant: boolean;
        badgeLabel?: string;
    }
> = {
    non_member: {
        getText: (_d, brand, t) =>
            t
                ? t('global.promo.non_member.text', { brand })
                : `Gabung jadi anggota ${brand} dan nikmati manfaatnya.`,
        getMobileText: (_d, brand, t) =>
            t
                ? t('global.promo.non_member.mobile', { brand })
                : `Gabung jadi anggota ${brand}.`,
        getButtonText: (t) => (t ? t('global.promo.non_member.button') : 'Daftar Sekarang'),
        buttonText: 'Daftar Sekarang',
        href: '/akun/keanggotaan/daftar',
        icon: 'Sparkles',
        variant: 'default',
        isImportant: false,
    },
    draft: {
        getText: (d, _brand, t) =>
            t
                ? t('global.promo.draft.text', {
                      step: d.currentStep,
                      total: d.totalSteps || 9,
                  })
                : `Pendaftaran Anda belum selesai (langkah ${d.currentStep} dari ${d.totalSteps || 9}).`,
        getMobileText: (d, _brand, t) =>
            t
                ? t('global.promo.draft.mobile', {
                      step: d.currentStep,
                      total: d.totalSteps || 9,
                  })
                : `Langkah ${d.currentStep} dari ${d.totalSteps || 9}.`,
        getButtonText: (t) => (t ? t('global.promo.draft.button') : 'Lanjutkan'),
        buttonText: 'Lanjutkan',
        href: '/akun/keanggotaan/daftar',
        icon: 'Clock',
        variant: 'info',
        isImportant: false,
    },
    pending_review: {
        getText: (_d, _brand, t) =>
            t ? t('global.promo.pending_review.text') : 'Pendaftaran sedang diverifikasi admin.',
        getMobileText: (_d, _brand, t) =>
            t ? t('global.promo.pending_review.mobile') : 'Verifikasi berkas admin.',
        getButtonText: (t) => (t ? t('global.promo.pending_review.button') : 'Lihat Status'),
        buttonText: 'Lihat Status',
        href: '/akun/keanggotaan/status',
        icon: 'Clock',
        variant: 'info',
        isImportant: false,
    },
    pending: {
        getText: (_d, _brand, t) =>
            t ? t('global.promo.pending_review.text') : 'Pendaftaran sedang diverifikasi admin.',
        getMobileText: (_d, _brand, t) =>
            t ? t('global.promo.pending_review.mobile') : 'Verifikasi berkas admin.',
        getButtonText: (t) => (t ? t('global.promo.pending_review.button') : 'Lihat Status'),
        buttonText: 'Lihat Status',
        href: '/akun/keanggotaan/status',
        icon: 'Clock',
        variant: 'info',
        isImportant: false,
    },
    revision: {
        getText: (_d, _brand, t) =>
            t ? t('global.promo.revision.text') : 'Ada data yang perlu diperbaiki.',
        getMobileText: (_d, _brand, t) =>
            t ? t('global.promo.revision.mobile') : 'Perlu perbaikan berkas.',
        getButtonText: (t) => (t ? t('global.promo.revision.button') : 'Perbaiki Data'),
        getBadgeLabel: (t) => (t ? t('global.promo.revision.badge') : 'Perlu Perbaikan'),
        buttonText: 'Perbaiki Data',
        href: '/akun/keanggotaan/status',
        icon: 'AlertTriangle',
        variant: 'warning',
        isImportant: true,
        badgeLabel: 'Perlu Perbaikan',
    },
    awaiting_payment: {
        getText: (_d, _brand, t) =>
            t
                ? t('global.promo.awaiting_payment.text')
                : 'Pendaftaran lolos verifikasi. Selesaikan pembayaran.',
        getMobileText: (_d, _brand, t) =>
            t
                ? t('global.promo.awaiting_payment.mobile')
                : 'Lolos verifikasi. Bayar sekarang.',
        getButtonText: (t) => (t ? t('global.promo.awaiting_payment.button') : 'Bayar Sekarang'),
        getBadgeLabel: (t) => (t ? t('global.promo.awaiting_payment.badge') : 'Menunggu Pembayaran'),
        buttonText: 'Bayar Sekarang',
        href: '/akun/keanggotaan/status',
        icon: 'CreditCard',
        variant: 'warning',
        isImportant: true,
        badgeLabel: 'Menunggu Pembayaran',
    },
    pending_approval: {
        getText: (_d, _brand, t) =>
            t
                ? t('global.promo.pending_approval.text')
                : 'Pembayaran diterima, menunggu persetujuan admin.',
        getMobileText: (_d, _brand, t) =>
            t
                ? t('global.promo.pending_approval.mobile')
                : 'Menunggu persetujuan admin.',
        getButtonText: (t) => (t ? t('global.promo.pending_review.button') : 'Lihat Status'),
        buttonText: 'Lihat Status',
        href: '/akun/keanggotaan/status',
        icon: 'Clock',
        variant: 'info',
        isImportant: false,
    },
    rejected: {
        getText: (_d, _brand, t) =>
            t ? t('global.promo.rejected.text') : 'Pendaftaran belum dapat disetujui.',
        getMobileText: (_d, _brand, t) =>
            t ? t('global.promo.rejected.mobile') : 'Pendaftaran belum disetujui.',
        getButtonText: (t) => (t ? t('global.promo.rejected.button') : 'Lihat Alasan'),
        getBadgeLabel: (t) => (t ? t('global.promo.rejected.badge') : 'Ditolak'),
        buttonText: 'Lihat Alasan',
        href: '/akun/keanggotaan/status',
        icon: 'AlertCircle',
        variant: 'danger',
        isImportant: true,
        badgeLabel: 'Ditolak',
    },
};

/**
 * Bentuk konfigurasi promo banner yang seragam dari status pendaftaran anggota.
 */
export function getPromoBarConfig(
    promoData: MembershipPromoData | null | undefined,
    brandShortName: string = 'NSA',
    t?: CopyTranslator
): MembershipPromoConfig | null {
    if (!promoData || !promoData.status) {
        return null;
    }

    const template = PROMO_CONFIG_TEMPLATES[promoData.status];
    if (!template) {
        return null;
    }

    return {
        status: promoData.status,
        text: template.getText(promoData, brandShortName, t),
        mobileText: template.getMobileText(promoData, brandShortName, t),
        buttonText: template.getButtonText(t),
        href: template.href,
        icon: template.icon,
        variant: template.variant,
        isImportant: template.isImportant,
        badgeLabel: template.getBadgeLabel ? template.getBadgeLabel(t) : template.badgeLabel,
    };
}

/**
 * Fungsi murni untuk menentukan apakah banner ajakan membership layak ditampilkan.
 */
export function shouldShowPromoBar(options: {
    user: User | null | undefined;
    promoData: MembershipPromoData | null | undefined;
    currentPath?: string;
    isDismissed?: boolean;
}): boolean {
    const { user, promoData, currentPath = '', isDismissed = false } = options;

    // 1. Pengunjung yang belum login (guest) TIDAK melihat banner ini
    if (!user) {
        return false;
    }

    // 2. Tampil hanya bila role user dan status bukan approved
    if (user.role !== 'user' || user.membership_status === 'approved') {
        return false;
    }

    // 3. Harus memiliki data promo dengan status bukan approved
    if (!promoData || promoData.status === 'approved') {
        return false;
    }

    // 4. Tidak tampil di halaman /akun/keanggotaan/daftar dan /admin
    if (
        currentPath.startsWith('/admin') ||
        currentPath.startsWith('/akun/keanggotaan/daftar')
    ) {
        return false;
    }

    // 5. Hormati status ditutup (dismissed)
    if (isDismissed) {
        return false;
    }

    return true;
}

const NON_MEMBER_DISMISS_KEY = 'nsa_promo_dismissed_until';
const SESSION_DISMISS_KEY_PREFIX = 'nsa_promo_dismissed_';

export type PromoDismissScope = 'navigation' | 'session' | 'days:7';

/**
 * Cakupan penutupan banner membership:
 * - 'navigation' (aktif): hanya hilang di halaman saat ini, muncul lagi saat pindah path.
 * - 'session': tersembunyi selama sesi tab (opsi cadangan, tidak aktif).
 * - 'days:7': tersembunyi 7 hari di browser (opsi cadangan, tidak aktif).
 */
export const DISMISS_SCOPE: PromoDismissScope = 'navigation';

let legacyCleaned = false;

/**
 * Pembersihan sekali jalan untuk kunci penyimpanan lama (localStorage, cookie, sessionStorage)
 * agar tidak ada sisa penutupan lama yang tertinggal di browser pengguna.
 */
export function clearLegacyPromoDismissStorage(): void {
    if (legacyCleaned || typeof window === 'undefined') {
        return;
    }
    legacyCleaned = true;

    try {
        localStorage.removeItem(NON_MEMBER_DISMISS_KEY);
    } catch {
        // Abaikan bila localStorage diblokir
    }

    try {
        document.cookie = `${NON_MEMBER_DISMISS_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
    } catch {
        // Abaikan bila cookie diblokir
    }

    try {
        const keysToRemove: string[] = [];
        for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            if (key && key.startsWith(SESSION_DISMISS_KEY_PREFIX)) {
                keysToRemove.push(key);
            }
        }
        for (const key of keysToRemove) {
            sessionStorage.removeItem(key);
        }
    } catch {
        // Abaikan bila sessionStorage diblokir
    }
}

/**
 * Periksa apakah banner ditutup berdasarkan DISMISS_SCOPE.
 * Pada mode default 'navigation', selalu mengembalikan false (penutupan dikelola di memori).
 */
export function isPromoDismissed(
    status: string,
    scope: PromoDismissScope = DISMISS_SCOPE
): boolean {
    if (scope === 'navigation' || typeof window === 'undefined') {
        return false;
    }

    try {
        if (scope === 'days:7' && status === 'non_member') {
            const stored = localStorage.getItem(NON_MEMBER_DISMISS_KEY);
            if (stored) {
                const expiry = parseInt(stored, 10);
                if (!isNaN(expiry) && expiry > Date.now()) {
                    return true;
                }
            }
            return false;
        }

        if (scope === 'session') {
            return sessionStorage.getItem(`${SESSION_DISMISS_KEY_PREFIX}${status}`) === 'true';
        }

        return false;
    } catch {
        return false;
    }
}

/**
 * Simpan penutupan banner bila DISMISS_SCOPE bukan 'navigation'.
 * Pada mode default 'navigation', TIDAK menulis apa pun ke storage/cookie.
 */
export function dismissPromo(
    status: string,
    scope: PromoDismissScope = DISMISS_SCOPE
): void {
    if (scope === 'navigation' || typeof window === 'undefined') {
        return;
    }

    try {
        if (scope === 'days:7' && status === 'non_member') {
            const sevenDays = Date.now() + 7 * 24 * 60 * 60 * 1000;
            localStorage.setItem(NON_MEMBER_DISMISS_KEY, String(sevenDays));
        } else if (scope === 'session') {
            sessionStorage.setItem(`${SESSION_DISMISS_KEY_PREFIX}${status}`, 'true');
        }
    } catch {
        // Abaikan bila storage diblokir browser
    }
}
