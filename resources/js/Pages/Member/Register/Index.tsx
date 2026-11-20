import React, { useState, useEffect, useRef } from 'react';
import MemberRegisterLayout from '@/Layouts/MemberRegisterLayout';
import WizardStepper from '@/Components/member/WizardStepper';
import WizardFooter from '@/Components/member/WizardFooter';
import { useRegistrationWizard, ApplicationState } from '@/hooks/useRegistrationWizard';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';
import { dur, ease } from '@/lib/motion';
import { CheckCircle2, Cloud, Sparkles } from 'lucide-react';

interface RegisterIndexProps {
    application: ApplicationState;
    currentStepSlug: string;
    draft: any;
    supportContact: {
        phone: string;
        email: string;
    };
    categories?: any[];
    membershipTypes?: any[];
    activityFormConfig?: any;
    programCategories?: any[];
    requireKtpForWni?: boolean;
    requiredLegalities?: Record<string, string[]>;
    businessFields?: any[];
    fishCategories?: any[];
    provinces?: any[];
    businessStatuses?: string[];
    businessScales?: string[];
    memberDocumentsConfig?: Record<string, any>;
    userDocuments?: any[];
    requiredDocsList?: any[];
    membershipFeeItems?: any[];
    requireInitialVerification?: boolean;
    termsModalContent?: string;
    privacyModalContent?: string;
    membershipPlans?: any[];
    suggestedDpc?: any;
    businessLocation?: any;
    cultivationTypes?: string[];
    statementTemplate?: string;
    statementCity?: string;
    statementDate?: string;
    missingItems?: Record<string, string[]>;
    stepCompleteness?: Record<string, boolean>;
    canSubmit?: boolean;
}

export default function Index({
    application: initialApplication,
    currentStepSlug,
    draft: initialDraft,
    supportContact,
    categories = [],
    membershipTypes = [],
    activityFormConfig,
    programCategories = [],
    requireKtpForWni = true,
    requiredLegalities = {},
    businessFields = [],
    fishCategories = [],
    provinces = [],
    businessStatuses = [],
    businessScales = [],
    memberDocumentsConfig = {},
    userDocuments = [],
    requiredDocsList = [],
    membershipFeeItems = [],
    requireInitialVerification = true,
    termsModalContent = '',
    privacyModalContent = '',
    membershipPlans = [],
    suggestedDpc = null,
    businessLocation = {},
    cultivationTypes = [],
    statementTemplate = '',
    statementCity = '',
    statementDate = '',
    missingItems = {},
    stepCompleteness = {},
    canSubmit = true,
}: RegisterIndexProps) {
    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
    const formContainerRef = useRef<HTMLDivElement | null>(null);
    const prefersReducedMotion = usePrefersReducedMotion();

    const {
        application,
        currentSlug,
        currentStepConfig,
        currentStepNumber,
        completedSteps,
        draft,
        errors,
        isSaving,
        isSubmitting,
        autoSavedText,
        direction,
        goTo,
        goNext,
        goBack,
        submit,
        updateDraft,
    } = useRegistrationWizard({
        initialApplication,
        currentSlug: currentStepSlug,
        initialDraft,
    });

    const StepComponent = currentStepConfig.component;

    let draftKey = currentSlug;
    if (draft && draft[currentSlug]) {
        draftKey = currentSlug;
    } else if (currentSlug === 'informasi-akun') draftKey = 'step1';
    else if (currentSlug === 'data-pribadi') draftKey = 'step2';
    else if (currentSlug === 'data-usaha' || currentSlug === 'data-usaha-perikanan') draftKey = 'step3';
    else if (currentSlug === 'dokumen') draftKey = 'step4';
    else if (currentSlug === 'media-sosial') draftKey = 'step5';
    else if (currentSlug === 'data-komoditas') draftKey = 'step6';
    else if (currentSlug === 'keanggotaan') draftKey = 'step7';
    else if (currentSlug === 'surat-pernyataan') draftKey = 'step8';
    else if (currentSlug === 'review-data') draftKey = 'step9';

    // 1. Fokus otomatis pertama ke input yang error saat validasi gagal
    useEffect(() => {
        const errorKeys = Object.keys(errors);
        if (errorKeys.length > 0) {
            const firstKey = errorKeys[0];
            const cleanKey = firstKey.replace(/\./g, '_');

            // Cari elemen input yang bersesuaian dengan id atau name
            let targetEl: HTMLElement | null =
                document.getElementById(firstKey) ||
                document.getElementById(cleanKey) ||
                document.querySelector(`[name="${firstKey}"]`) ||
                document.querySelector(`[name="${cleanKey}"]`) ||
                document.querySelector(`[data-field="${firstKey}"]`);

            // Fallback cari elemen yang memiliki border merah / invalid
            if (!targetEl) {
                targetEl =
                    document.querySelector('.border-danger') ||
                    document.querySelector('[aria-invalid="true"]');
            }

            if (targetEl && 'focus' in targetEl) {
                setTimeout(() => {
                    targetEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    targetEl?.focus();
                }, 120);
            }
        }
    }, [errors]);

    // 2. Tab/Enter berpindah antar input dengan wajar
    const handleFormKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        const target = e.target as HTMLElement;

        // Tangani tombol Enter pada input teks/angka/tanggal (bukan textarea, button, checkbox, radio)
        if (
            e.key === 'Enter' &&
            target.tagName === 'INPUT' &&
            !['submit', 'button', 'reset', 'checkbox', 'radio'].includes((target as HTMLInputElement).type) &&
            !e.shiftKey &&
            !e.ctrlKey &&
            !e.altKey &&
            !e.metaKey
        ) {
            e.preventDefault();

            if (!formContainerRef.current) return;

            // Kumpulkan seluruh form control yang dapat difokuskan dalam langkah aktif
            const formElements = Array.from(
                formContainerRef.current.querySelectorAll<HTMLElement>(
                    'input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled])'
                )
            );

            const currentIndex = formElements.indexOf(target);
            if (currentIndex >= 0 && currentIndex < formElements.length - 1) {
                const nextInput = formElements[currentIndex + 1];
                if (nextInput) {
                    nextInput.focus();
                    if ('select' in nextInput && typeof (nextInput as HTMLInputElement).select === 'function') {
                        (nextInput as HTMLInputElement).select();
                    }
                    return;
                }
            }

            // Jika berada pada input terakhir, jalankan penyimpanan langkah selanjutnya
            goNext();
        }
    };

    // 4. Varian Gerak: Transisi geser horizontal halus antar langkah (Framer Motion)
    const stepMotionVariants: Variants = prefersReducedMotion
        ? {
              enter: { opacity: 0 },
              center: { opacity: 1, transition: { duration: 0.15 } },
              exit: { opacity: 0, transition: { duration: 0.1 } },
          }
        : {
              enter: (dir: number) => ({
                  opacity: 0,
                  x: dir > 0 ? 36 : -36,
              }),
              center: {
                  opacity: 1,
                  x: 0,
                  transition: {
                      x: { duration: dur.base, ease },
                      opacity: { duration: dur.fast, ease: [0, 0, 0.2, 1] },
                  },
              },
              exit: (dir: number) => ({
                  opacity: 0,
                  x: dir > 0 ? -36 : 36,
                  transition: {
                      x: { duration: dur.fast, ease },
                      opacity: { duration: 0.12, ease: [0.4, 0, 1, 1] },
                  },
              }),
          };

    return (
        <MemberRegisterLayout
            title={`Pendaftaran Anggota - ${currentStepConfig.title}`}
            currentStepSlug={currentSlug}
            completedSteps={completedSteps}
            onStepClick={goTo}
            supportContact={supportContact}
            mobileDrawerOpen={mobileDrawerOpen}
            setMobileDrawerOpen={setMobileDrawerOpen}
        >
            {/* Stepper Wizard Horizontal */}
            <WizardStepper
                currentStepNumber={currentStepNumber}
                currentStepSlug={currentSlug}
                completedSteps={completedSteps}
                onStepClick={(slug) => {
                    goTo(slug);
                    setMobileDrawerOpen(false);
                }}
                onToggleMobileSidebar={() => setMobileDrawerOpen(true)}
            />

            {/* Status Penyimpanan Draft Otomatis */}
            <div className="flex items-center justify-between py-2 text-xs text-muted-foreground border-b border-border/40 mb-6">
                <div className="flex items-center gap-1.5">
                    <Cloud className="w-3.5 h-3.5 text-muted-foreground/70" />
                    <span>Langkah {currentStepNumber} dari 9: <strong className="text-foreground">{currentStepConfig.title}</strong></span>
                </div>
                <div
                    className="flex items-center gap-1.5"
                    aria-live="polite"
                    aria-atomic="true"
                >
                    <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                            isSaving
                                ? 'bg-amber-400 animate-pulse'
                                : 'bg-success'
                        }`}
                    />
                    <span className="tabular-nums font-sans">{autoSavedText}</span>
                </div>
            </div>

            {/* Komponen Form Langkah dengan Transisi Geser Horizontal Halus */}
            <div
                ref={formContainerRef}
                onKeyDown={handleFormKeyDown}
                className="min-h-[280px] relative overflow-hidden"
            >
                <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                        key={currentSlug}
                        custom={direction}
                        variants={stepMotionVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        className="w-full focus:outline-none"
                    >
                        <StepComponent
                            data={draft[draftKey] || draft[currentSlug] || {}}
                            onChange={(val: any) => updateDraft(draftKey, val)}
                            errors={errors}
                            application={application}
                            categories={categories}
                            membershipTypes={membershipTypes}
                            activityFormConfig={activityFormConfig}
                            programCategories={programCategories}
                            requireKtpForWni={requireKtpForWni}
                            requiredLegalities={requiredLegalities}
                            businessFields={businessFields}
                            fishCategories={fishCategories}
                            provinces={provinces}
                            businessStatuses={businessStatuses}
                            businessScales={businessScales}
                            memberDocumentsConfig={memberDocumentsConfig}
                            userDocuments={userDocuments}
                            requiredDocsList={requiredDocsList}
                            membershipFeeItems={membershipFeeItems}
                            requireInitialVerification={requireInitialVerification}
                            termsModalContent={termsModalContent}
                            privacyModalContent={privacyModalContent}
                            membershipPlans={membershipPlans}
                            suggestedDpc={suggestedDpc}
                            businessLocation={businessLocation}
                            cultivationTypes={cultivationTypes}
                            statementTemplate={statementTemplate}
                            statementCity={statementCity}
                            statementDate={statementDate}
                            missingItems={missingItems}
                            stepCompleteness={stepCompleteness}
                            canSubmit={canSubmit}
                            draft={draft}
                            onEditStep={goTo}
                            onSubmit={submit}
                            isSubmitting={isSubmitting}
                        />
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Navigasi Footer Bawah (Responsif Fixed di Mobile, Normal di Desktop) */}
            <WizardFooter
                currentStepNumber={currentStepNumber}
                isSaving={isSaving}
                isSubmitting={isSubmitting}
                canSkip={false}
                onSkip={() => goNext({})}
                onPrev={goBack}
                onNext={() => goNext()}
                onSubmit={submit}
                submitLabel={
                    (application?.status || initialApplication?.status) === 'approved'
                        ? 'Simpan Pembaruan Data'
                        : 'Kirim Pendaftaran'
                }
            />
        </MemberRegisterLayout>
    );
}
