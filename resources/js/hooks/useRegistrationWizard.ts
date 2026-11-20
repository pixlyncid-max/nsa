import { useState, useEffect, useRef, useCallback } from 'react';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import axios from 'axios';
import { STEPS_CONFIG, StepConfig, getStepBySlug } from '@/Pages/Member/Register/steps';

export interface ApplicationState {
    id?: number;
    status: string;
    current_step: string;
    completed_steps: string[];
    updated_at?: string;
}

interface UseRegistrationWizardOptions {
    initialApplication: ApplicationState;
    currentSlug: string;
    initialDraft?: any;
}

/**
 * Format selisih waktu dalam Bahasa Indonesia yang ramah dan alami.
 */
function formatIndonesianTimeAgo(date: Date): string {
    const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diffSec < 20) return 'Tersimpan otomatis · baru saja';
    if (diffSec < 60) return 'Tersimpan otomatis · kurang dari 1 menit lalu';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin === 1) return 'Tersimpan otomatis · 1 menit lalu';
    if (diffMin < 60) return `Tersimpan otomatis · ${diffMin} menit lalu`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours === 1) return 'Tersimpan otomatis · 1 jam lalu';
    return `Tersimpan otomatis · ${diffHours} jam lalu`;
}

export function useRegistrationWizard({
    initialApplication,
    currentSlug,
    initialDraft = {},
}: UseRegistrationWizardOptions) {
    const [application, setApplication] = useState<ApplicationState>(initialApplication);
    const [draft, setDraft] = useState<any>(initialDraft);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [lastSavedAt, setLastSavedAt] = useState<Date>(() => new Date());
    const [autoSavedText, setAutoSavedText] = useState<string>('Tersimpan otomatis · baru saja');
    const [direction, setDirection] = useState<number>(1);

    const isNavigatingRef = useRef(false);
    const prevStepNumberRef = useRef(
        getStepBySlug(currentSlug)?.number || 1
    );

    const currentStepConfig: StepConfig = getStepBySlug(currentSlug) || STEPS_CONFIG[0];
    const completedSteps = application.completed_steps || [];

    // Perbarui label waktu tersimpan secara berkala setiap 15 detik
    useEffect(() => {
        const updateText = () => {
            if (isSaving) {
                setAutoSavedText('Menyimpan draf...');
            } else {
                setAutoSavedText(formatIndonesianTimeAgo(lastSavedAt));
            }
        };

        updateText();
        const interval = setInterval(updateText, 15000);
        return () => clearInterval(interval);
    }, [lastSavedAt, isSaving]);

    // Peringatan bila meninggalkan halaman dengan perubahan yang belum disimpan (Browser BeforeUnload)
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty && !isNavigatingRef.current) {
                e.preventDefault();
                e.returnValue = '';
                return '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isDirty]);

    // Peringatan bila berpindah halaman Inertia saat ada perubahan yang belum disimpan
    useEffect(() => {
        const removeListener = router.on('before', (event) => {
            if (isDirty && !isNavigatingRef.current) {
                const confirmed = window.confirm(
                    'Ada perubahan formulir yang belum disimpan. Yakin ingin meninggalkan halaman ini?'
                );
                if (!confirmed) {
                    event.preventDefault();
                }
            }
        });

        return () => removeListener();
    }, [isDirty]);

    // Cek apakah suatu langkah boleh dibuka
    const canAccessStep = (slug: string): boolean => {
        if (completedSteps.includes(slug)) return true;

        // Langkah pertama yang belum selesai (langkah aktif yang sah)
        const firstIncomplete = STEPS_CONFIG.find((s) => !completedSteps.includes(s.slug));
        if (firstIncomplete && firstIncomplete.slug === slug) return true;

        return false;
    };

    // Navigasi ke langkah tertentu
    const goTo = (slug: string) => {
        if (!canAccessStep(slug)) {
            toast.error('Selesaikan tahapan formulir sebelumnya terlebih dahulu.');
            return;
        }

        if (isDirty && !isNavigatingRef.current) {
            const confirmed = window.confirm(
                'Ada perubahan formulir pada langkah ini yang belum disimpan. Pindah ke langkah lain?'
            );
            if (!confirmed) return;
        }

        const targetStep = getStepBySlug(slug);
        if (targetStep) {
            setDirection(targetStep.number >= currentStepConfig.number ? 1 : -1);
            prevStepNumberRef.current = targetStep.number;
        }

        isNavigatingRef.current = true;
        setErrors({});
        setIsDirty(false);

        router.visit(`/akun/keanggotaan/daftar/${slug}`, {
            preserveScroll: true,
            preserveState: true,
            onFinish: () => {
                isNavigatingRef.current = false;
            },
        });
    };

    // Navigasi langkah sebelumnya
    const goBack = () => {
        const currentIndex = STEPS_CONFIG.findIndex((s) => s.slug === currentSlug);
        if (currentIndex > 0) {
            const prevSlug = STEPS_CONFIG[currentIndex - 1].slug;
            setDirection(-1);
            goTo(prevSlug);
        }
    };

    // Helper untuk mengambil payload draf langkah saat ini
    const getPayloadForCurrentStep = (stepPayload?: any) => {
        let payloadKey = currentSlug;
        if (currentSlug === 'informasi-akun') payloadKey = 'step1';
        else if (currentSlug === 'data-pribadi') payloadKey = 'step2';
        else if (currentSlug === 'data-usaha' || currentSlug === 'data-usaha-perikanan') payloadKey = 'step3';
        else if (currentSlug === 'dokumen') payloadKey = 'step4';
        else if (currentSlug === 'media-sosial') payloadKey = 'step5';
        else if (currentSlug === 'data-komoditas') payloadKey = 'step6';
        else if (currentSlug === 'keanggotaan') payloadKey = 'step7';
        else if (currentSlug === 'surat-pernyataan') payloadKey = 'step8';
        else if (currentSlug === 'review-data') payloadKey = 'step9';

        return stepPayload !== undefined
            ? stepPayload
            : (draft[payloadKey] || draft[currentSlug] || {});
    };

    // Simpan draf langkah saat ini dan lanjutkan ke langkah berikutnya
    const goNext = async (stepPayload?: any) => {
        setIsSaving(true);
        setErrors({});

        const rawData = getPayloadForCurrentStep(stepPayload);

        // Cek apakah data mengandung file (mis. photo KTP)
        const hasFile = Object.values(rawData).some((val) => val instanceof File);
        let requestData: any = rawData;
        let headers: Record<string, string> = {};

        if (hasFile) {
            const formData = new FormData();
            formData.append('_method', 'PATCH');
            Object.entries(rawData).forEach(([key, val]) => {
                if (val !== null && val !== undefined) {
                    if (val instanceof File) {
                        formData.append(key, val);
                    } else if (Array.isArray(val)) {
                        val.forEach((item) => formData.append(`${key}[]`, String(item)));
                    } else if (typeof val === 'boolean') {
                        formData.append(key, val ? '1' : '0');
                    } else {
                        formData.append(key, String(val));
                    }
                }
            });
            requestData = formData;
            headers = { 'Content-Type': 'multipart/form-data' };
        }

        try {
            const response = await axios.post(`/akun/keanggotaan/daftar/${currentSlug}`, requestData, {
                headers,
            });

            if (response.data?.application) {
                setApplication(response.data.application);
            }

            // Reset status dirty dan catat timestamp tersimpan
            setIsDirty(false);
            setLastSavedAt(new Date());

            const nextSlug = response.data?.next_step;
            if (nextSlug) {
                setDirection(1);
                isNavigatingRef.current = true;
                router.visit(`/akun/keanggotaan/daftar/${nextSlug}`, {
                    preserveScroll: false,
                    preserveState: false,
                    onFinish: () => {
                        isNavigatingRef.current = false;
                    },
                });
            } else {
                toast.success('Draf langkah berhasil disimpan.');
            }
        } catch (error: any) {
            const errData = error.response?.data;
            if (errData?.errors) {
                const formatted: Record<string, string> = {};
                Object.keys(errData.errors).forEach((k) => {
                    formatted[k] = errData.errors[k][0];
                });
                setErrors(formatted);
                const firstKey = Object.keys(formatted)[0];
                toast.error(formatted[firstKey]);
            } else {
                toast.error(errData?.message || 'Gagal menyimpan langkah. Silakan periksa kembali isian Anda.');
            }
        } finally {
            setIsSaving(false);
        }
    };

    // Submit final formulir pendaftaran
    const submit = () => {
        setIsSubmitting(true);
        isNavigatingRef.current = true;

        router.post('/akun/keanggotaan/daftar/kirim', {}, {
            preserveScroll: true,
            onError: (errors) => {
                setIsSubmitting(false);
                isNavigatingRef.current = false;
                const firstKey = Object.keys(errors)[0];
                toast.error(errors[firstKey] || 'Pengajuan gagal dikirim. Periksa kelengkapan data.');
            },
            onSuccess: () => {
                setIsDirty(false);
                setIsSubmitting(false);
                toast.success('Pendaftaran keanggotaan berhasil diajukan!');
            },
            onFinish: () => {
                setIsSubmitting(false);
                isNavigatingRef.current = false;
            },
        });
    };

    const markCompleted = (slug: string) => {
        setApplication((prev) => ({
            ...prev,
            completed_steps: Array.from(new Set([...(prev.completed_steps || []), slug])),
        }));
    };

    const updateDraft = (section: string, data: any) => {
        setIsDirty(true);
        setDraft((prev: any) => ({
            ...prev,
            [section]: { ...(prev[section] || {}), ...data },
        }));
    };

    return {
        application,
        currentSlug,
        currentStepConfig,
        currentStepNumber: currentStepConfig.number,
        completedSteps,
        draft,
        errors,
        setErrors,
        isSaving,
        isSubmitting,
        isDirty,
        setIsDirty,
        lastSavedAt,
        autoSavedText,
        direction,
        canAccessStep,
        goTo,
        goNext,
        goBack,
        submit,
        markCompleted,
        updateDraft,
    };
}
