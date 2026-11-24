import { route as routeFn } from 'ziggy-js';

export interface User {
    id: number;
    name: string;
    email: string;
    phone?: string;
    role: 'superadmin' | 'admin' | 'user';
    membership_status:
        | 'non_member'
        | 'draft'
        | 'pending'
        | 'pending_review'
        | 'revision'
        | 'awaiting_payment'
        | 'pending_approval'
        | 'approved'
        | 'rejected';
    member_number?: string;
    avatar?: string;
    email_verified_at?: string;
}

export interface Brand {
    name: string;
    short_name: string;
    tagline: string;
    domain: string;
    portal_name: string;
    support_phone: string;
    support_email: string;
    address: string;
    logo_light: string | null;
    logo_dark: string | null;
    logo_footer_mode?: 'original' | 'mono-white' | 'white-badge' | null;
    social: {
        instagram?: string;
        facebook?: string;
        youtube?: string;
        linkedin?: string;
    };
}

export interface MembershipPromoData {
    status:
        | 'non_member'
        | 'draft'
        | 'pending'
        | 'pending_review'
        | 'revision'
        | 'awaiting_payment'
        | 'pending_approval'
        | 'approved'
        | 'rejected';
    currentStep: number;
    completedCount: number;
    totalSteps: number;
}

export interface JoinStripImageVariant {
    exists: boolean;
    src: string;
    avifSrcSet: string;
    webpSrcSet: string;
    width: number;
    height: number;
    objectPosition: string;
    alt: string;
}

export interface JoinStripMedia {
    hasDesktop: boolean;
    hasMobile: boolean;
    desktop: JoinStripImageVariant;
    mobile: JoinStripImageVariant;
}

export interface LocaleInfo {
    code: 'id' | 'en' | string;
    short: string;
    name: string;
    html_lang: string;
    og_locale: string;
    intl: string;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User | null;
    };
    locale?: 'id' | 'en' | string;
    availableLocales?: Record<string, LocaleInfo>;
    alternates?: Record<string, string>;
    flash?: {
        success?: string;
        error?: string;
        info?: string;
    };
    cart?: {
        count: number;
    };
    membershipPromo?: MembershipPromoData | null;
    joinStrip?: {
        visible: boolean;
        ctaLabel: string;
        ctaHref: string;
        media?: JoinStripMedia;
    };
    copy?: Record<string, string>;
    canEditCopy?: boolean;
    brand: Brand;
    siteMedia?: Record<string, string | null>;
    features?: {
        partnership_enabled: boolean;
    };
};

declare global {
    var route: typeof routeFn;
}
