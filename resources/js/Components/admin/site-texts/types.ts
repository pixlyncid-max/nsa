export type SiteTextType = 'text' | 'textarea' | 'richtext' | 'button' | 'link';

export type EnTranslationStatus = 'auto' | 'pending' | 'failed' | 'manual';

export interface SiteTextGroupSummary {
    name: string;
    label: string;
    publicUrl: string | null;
    total: number;
    customized: number;
}

export interface SiteTextItem {
    key: string;
    group: string;
    groupLabel: string;
    section: string;
    label: string;
    hint: string;
    type: SiteTextType;
    default: string;
    value: string | null;
    currentValue: string;
    isChanged: boolean;
    max: number | null;
    maxEn: number | null;
    defaultEn: string;
    enValue: string | null;
    currentEnValue: string;
    enIsChanged: boolean;
    enIsManual: boolean;
    enStatus: EnTranslationStatus;
    enError: string | null;
    placeholders: string[];
    revisionsCount: number;
    updatedAt: string | null;
    updatedByName: string | null;
    publicUrl: string | null;
}

export interface SiteTextRevisionItem {
    id: number;
    locale: 'id' | 'en' | string;
    oldValue: string | null;
    newValue: string | null;
    userName: string;
    createdAt: string | null;
    createdAtLabel: string;
}
