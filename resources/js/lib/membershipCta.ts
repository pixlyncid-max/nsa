import { getPromoBarConfig, type CopyTranslator } from '@/lib/membershipPromo';
import type { MembershipPromoData, User } from '@/types';

export interface MembershipCta {
    title: string;
    description: string;
    primaryLabel: string;
    primaryHref: string;
}

export interface ResolveMembershipCtaOptions {
    defaultPrimaryLabel?: string;
}

function resolveProcessTitle(
    status: MembershipPromoData['status'],
    t?: CopyTranslator
): string | undefined {
    switch (status) {
        case 'draft':
            return t ? t('global.cta.process.draft') : 'Lanjutkan pendaftaran anggota Anda';
        case 'revision':
            return t ? t('global.cta.process.revision') : 'Ada berkas yang perlu Anda perbaiki';
        case 'awaiting_payment':
            return t ? t('global.cta.process.awaiting_payment') : 'Tinggal satu langkah: pembayaran';
        case 'pending_review':
        case 'pending':
            return t ? t('global.cta.process.pending_review') : 'Pendaftaran Anda sedang diperiksa';
        case 'pending_approval':
            return t
                ? t('global.cta.process.pending_approval')
                : 'Pembayaran diterima, menunggu persetujuan';
        case 'rejected':
            return t ? t('global.cta.process.rejected') : 'Pendaftaran Anda belum disetujui';
        default:
            return undefined;
    }
}

/**
 * Satu sumber kebenaran untuk label & tautan ajakan keanggotaan pada
 * Hero, Navbar, Banner, dan Strip Ajakan di atas Footer.
 */
export function resolveMembershipCta(
    user: User | null | undefined,
    promo: MembershipPromoData | null | undefined,
    brandShort: string,
    t?: CopyTranslator,
    options?: ResolveMembershipCtaOptions
): MembershipCta {
    if (user && (user.role === 'admin' || user.role === 'superadmin')) {
        return {
            title: t ? t('global.cta.admin.title', { brand: brandShort }) : `Kelola data ${brandShort} dari CMS`,
            description: t
                ? t('global.cta.admin.desc')
                : 'Verifikasi pendaftar, program, produk, dan artikel ada di panel admin.',
            primaryLabel: t ? t('global.cta.admin.button') : 'Buka CMS Admin',
            primaryHref: '/admin',
        };
    }

    if (user?.membership_status === 'approved') {
        return {
            title: t
                ? t('global.cta.member.title', { brand: brandShort })
                : `Kartu dan layanan anggota ${brandShort} ada di portal`,
            description: t
                ? t('global.cta.member.desc')
                : 'Kartu anggota digital, usaha dan legalitas, program, serta iuran Anda dikelola di Portal Anggota.',
            primaryLabel: t ? t('global.cta.member.button') : 'Buka Portal Anggota',
            primaryHref: '/anggota',
        };
    }

    const status = promo?.status ?? user?.membership_status;
    const promoConfig = promo ? getPromoBarConfig(promo, brandShort, t) : null;

    if (user && status === 'draft') {
        return {
            title: resolveProcessTitle('draft', t) ?? 'Lanjutkan pendaftaran anggota Anda',
            description: promoConfig?.text ?? 'Pendaftaran Anda belum selesai.',
            primaryLabel: 'Lanjutkan Pendaftaran',
            primaryHref: '/akun/keanggotaan/daftar',
        };
    }

    if (
        user &&
        status &&
        status !== 'non_member' &&
        status !== 'approved'
    ) {
        return {
            title: resolveProcessTitle(status, t) ?? promoConfig?.text ?? 'Pendaftaran Anda sedang diperiksa',
            description: promoConfig?.text ?? 'Lihat perkembangan status pendaftaran anggota Anda.',
            primaryLabel: promoConfig?.buttonText ?? 'Lihat Status',
            primaryHref: promoConfig?.href ?? '/akun/keanggotaan/status',
        };
    }

    const fallbackPrimaryLabel =
        options?.defaultPrimaryLabel ??
        (t ? t('global.button.register_member') : 'Daftar Anggota');

    return {
        title: t ? t('global.cta.guest.title', { brand: brandShort }) : `Gabung jadi anggota ${brandShort}`,
        description: t
            ? t('global.cta.guest.desc')
            : 'Pendaftaran 9 langkah tersimpan otomatis, jadi bisa Anda lanjutkan kapan saja. Setelah disetujui, kartu anggota digital langsung terbit.',
        primaryLabel: fallbackPrimaryLabel,
        primaryHref: user
            ? '/akun/keanggotaan/daftar'
            : '/register?intended=/akun/keanggotaan/daftar',
    };
}
