import React from 'react';
import StepPlaceholder from './Placeholders/StepPlaceholder';
import Step1Identity from './Steps/Step1Identity';
import Step2Category from './Steps/Step2Category';
import Step3BusinessProfile from './Steps/Step3BusinessProfile';
import Step4FishActivities from './Steps/Step4FishActivities';
import Step5NetworkProfile from './Steps/Step5NetworkProfile';
import Step6ProgramInterests from './Steps/Step6ProgramInterests';
import Step7LocationDocuments from './Steps/Step7LocationDocuments';
import Step8Administration from './Steps/Step8Administration';
import Step9Review from './Steps/Step9Review';

export interface StepConfig {
    id: number;
    slug: string;
    number: number;
    title: string;
    subtitle: string;
    component: React.ComponentType<any>;
}

export const createStepComponent = (step: Omit<StepConfig, 'component'>): React.FC<any> => {
    const StepComponent: React.FC<any> = (props: any) => {
        return React.createElement(StepPlaceholder, {
            slug: step.slug,
            number: step.number,
            title: step.title,
            subtitle: step.subtitle,
            ...props,
        });
    };
    StepComponent.displayName = `Step${step.number}${step.title.replace(/\s+/g, '')}`;
    return StepComponent;
};

export const STEPS_CONFIG: StepConfig[] = [
    {
        id: 1,
        slug: 'identitas',
        number: 1,
        title: 'Identitas Calon Anggota',
        subtitle: 'Isi sesuai dokumen identitas Anda.',
        component: Step1Identity,
    },
    {
        id: 2,
        slug: 'kategori-keanggotaan',
        number: 2,
        title: 'Kategori & Jenis',
        subtitle: 'Pilih kategori kegiatan dan jenis keanggotaan.',
        component: Step2Category,
    },
    {
        id: 3,
        slug: 'profil-usaha',
        number: 3,
        title: 'Profil Pekerjaan atau Usaha',
        subtitle: 'Informasi bidang usaha dan perizinan legalitas.',
        component: Step3BusinessProfile,
    },
    {
        id: 4,
        slug: 'aktivitas-perikanan',
        number: 4,
        title: 'Aktivitas Perikanan',
        subtitle: 'Komoditas budidaya, kapasitas, dan kebutuhan sarana.',
        component: Step4FishActivities,
    },
    {
        id: 5,
        slug: 'jaringan-bisnis',
        number: 5,
        title: 'Jaringan Bisnis',
        subtitle: 'Pemasaran, distribusi, dan rencana kemitraan.',
        component: Step5NetworkProfile,
    },
    {
        id: 6,
        slug: 'minat-program',
        number: 6,
        title: 'Minat Program',
        subtitle: 'Pilih program kerja asosiasi yang ingin Anda ikuti.',
        component: Step6ProgramInterests,
    },
    {
        id: 7,
        slug: 'lokasi-dokumen',
        number: 7,
        title: 'Lokasi & Dokumen',
        subtitle: 'Titik koordinat dan berkas perizinan legalitas.',
        component: Step7LocationDocuments,
    },
    {
        id: 8,
        slug: 'paket-administrasi',
        number: 8,
        title: 'Paket & Administrasi',
        subtitle: 'Pilih paket keanggotaan dan rincian iuran tahunan.',
        component: Step8Administration,
    },
    {
        id: 9,
        slug: 'pemeriksaan',
        number: 9,
        title: 'Pemeriksaan Akhir',
        subtitle: 'Tinjau seluruh data dan kirim pengajuan keanggotaan.',
        component: Step9Review,
    },
];

export const getStepBySlug = (slug: string): StepConfig | undefined => {
    return STEPS_CONFIG.find((s) => s.slug === slug);
};

export const getStepByNumber = (number: number): StepConfig | undefined => {
    return STEPS_CONFIG.find((s) => s.number === number);
};
