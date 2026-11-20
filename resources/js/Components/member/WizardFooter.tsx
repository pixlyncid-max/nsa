import React from 'react';
import Button from '@/Components/ui/Button';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';

interface WizardFooterProps {
    currentStepNumber: number;
    isSaving?: boolean;
    isSubmitting?: boolean;
    onPrev: () => void;
    onNext: () => void;
    onSubmit: () => void;
    onSkip?: () => void;
    canSkip?: boolean;
    submitLabel?: string;
}

export default function WizardFooter({
    currentStepNumber,
    isSaving = false,
    isSubmitting = false,
    onPrev,
    onNext,
    onSubmit,
    onSkip,
    canSkip = false,
    submitLabel,
}: WizardFooterProps) {
    const isFirstStep = currentStepNumber === 1;
    const isLastStep = currentStepNumber === 9;
    const isBusy = isSaving || isSubmitting;

    return (
        <div className="mt-8 pt-6 border-t border-line">
            {/* Wrapper Responsif: Di desktop normal, di mobile menempel di bawah layar */}
            <div className="fixed md:static bottom-0 left-0 right-0 p-4 md:p-0 bg-white md:bg-transparent border-t md:border-t-0 border-line shadow-lift md:shadow-none z-30 flex items-center justify-between gap-4">
                {/* Tombol Kiri: Kembali (Disembunyikan pada Langkah 1) */}
                <div>
                    {!isFirstStep ? (
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={onPrev}
                            disabled={isBusy}
                            iconLeft={<ArrowLeft className="w-4 h-4" />}
                            className="text-xs sm:text-sm"
                        >
                            Kembali
                        </Button>
                    ) : (
                        <div />
                    )}
                </div>

                {/* Tombol Kanan: Selanjutnya atau Kirim Pendaftaran */}
                <div className="flex items-center gap-3">
                    {canSkip && onSkip && (
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={onSkip}
                            disabled={isBusy}
                            className="text-xs sm:text-sm text-slate-600 hover:text-navy border-slate-300"
                        >
                            Lewati langkah ini
                        </Button>
                    )}

                    {isLastStep ? (
                        <Button
                            type="button"
                            variant="primary"
                            onClick={onSubmit}
                            loading={isSubmitting}
                            disabled={isBusy}
                            icon={<CheckCircle2 className="w-4 h-4" />}
                            className="bg-success hover:bg-success text-white text-xs sm:text-sm"
                        >
                            {submitLabel || 'Kirim Pendaftaran'}
                        </Button>
                    ) : (
                        <Button
                            type="button"
                            variant="primary"
                            onClick={onNext}
                            loading={isSaving}
                            disabled={isBusy}
                            icon={<ArrowRight className="w-4 h-4" />}
                            className="bg-ocean hover:bg-navy text-white text-xs sm:text-sm"
                        >
                            Selanjutnya
                        </Button>
                    )}
                </div>
            </div>
            
            {/* Spacer untuk mobile agar konten paling bawah tidak tertutup footer fixed */}
            <div className="h-16 md:hidden" />
        </div>
    );
}
