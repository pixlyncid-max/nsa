import React from 'react';
import { motion } from 'framer-motion';
import { Check, Menu } from 'lucide-react';
import { STEPS_CONFIG } from '@/Pages/Member/Register/steps';

interface WizardStepperProps {
    currentStepNumber: number;
    currentStepSlug?: string;
    completedSteps: string[];
    onStepClick: (slug: string) => void;
    onToggleMobileSidebar?: () => void;
}

export default function WizardStepper({
    currentStepNumber,
    completedSteps,
    onStepClick,
    onToggleMobileSidebar,
}: WizardStepperProps) {
    const currentStepConfig = STEPS_CONFIG.find((s) => s.number === currentStepNumber) || STEPS_CONFIG[0];
    const progressPercent = Math.round((currentStepNumber / STEPS_CONFIG.length) * 100);

    return (
        <div className="w-full">
            {/* Tampilan Mobile (< 768px): Bar Ringkas + Tombol Buka Menu Sidebar */}
            <div className="block md:hidden bg-white border border-line rounded-xl p-3.5 mb-6 shadow-soft">
                <div className="flex items-center justify-between gap-3 mb-2.5">
                    <div className="min-w-0">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-ocean">
                            Langkah {currentStepNumber} dari 9
                        </span>
                        <h3 className="text-sm font-bold font-display text-navy truncate">
                            {currentStepConfig.title}
                        </h3>
                    </div>

                    {onToggleMobileSidebar && (
                        <button
                            type="button"
                            onClick={onToggleMobileSidebar}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-mist hover:bg-line text-navy text-xs font-semibold transition shrink-0"
                            aria-label="Buka Daftar Langkah"
                        >
                            <Menu className="w-4 h-4 text-ocean" />
                            <span>Alur</span>
                        </button>
                    )}
                </div>

                {/* Progress Bar Tipis Mobile */}
                <div className="w-full bg-line h-1.5 rounded-full overflow-hidden">
                    <motion.div
                        className="bg-ocean h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    />
                </div>
            </div>

            {/* Tampilan Desktop (>= 768px): 9 Lingkaran Bernomor + Label + Garis Animasi */}
            <div className="hidden md:block bg-white border border-line rounded-2xl p-6 mb-8 shadow-soft">
                <div className="relative flex items-center justify-between">
                    {/* Garis Penghubung Latar Belakang & Progress Bar Antar Titik */}
                    <div className="absolute top-4 left-6 right-6 h-0.5 bg-line z-0" />
                    
                    {STEPS_CONFIG.map((step) => {
                        const isCompleted = completedSteps.includes(step.slug);
                        const isCurrent = step.number === currentStepNumber;
                        const isPassed = step.number < currentStepNumber || isCompleted;
                        const isAccessible = isPassed || isCurrent;

                        return (
                            <div
                                key={step.id}
                                className="relative z-10 flex flex-col items-center flex-1 max-w-[110px]"
                            >
                                <button
                                    type="button"
                                    disabled={!isAccessible}
                                    onClick={() => isAccessible && onStepClick(step.slug)}
                                    className={`group flex flex-col items-center focus:outline-none transition ${
                                        !isAccessible ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                                    }`}
                                >
                                    {/* Lingkaran Stepper */}
                                    <div
                                        className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                                            isCompleted
                                                ? 'bg-success text-white shadow-soft'
                                                : isCurrent
                                                ? 'bg-ocean text-white ring-4 ring-ocean/20 shadow-soft scale-110'
                                                : 'bg-white border-2 border-line text-slate group-hover:border-ocean/50'
                                        }`}
                                    >
                                        {isCompleted ? (
                                            <Check className="w-4 h-4 stroke-[2.5]" />
                                        ) : (
                                            <span>{step.number}</span>
                                        )}
                                    </div>

                                    {/* Label Teks di Bawah Lingkaran */}
                                    <div className="mt-2 text-center">
                                        <span
                                            className={`block text-[11px] leading-tight font-sans transition-colors ${
                                                isCurrent
                                                    ? 'font-bold text-ocean'
                                                    : isCompleted
                                                    ? 'font-semibold text-navy'
                                                    : 'font-medium text-slate'
                                            }`}
                                        >
                                            {step.title}
                                        </span>

                                        {/* Aksen Garis Biru Halus di Bawah Teks Langkah Aktif (Sesuai Referensi) */}
                                        {isCurrent && (
                                            <motion.div
                                                layoutId="activeStepperIndicator"
                                                className="w-full h-0.5 bg-ocean rounded-full mt-1"
                                                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                                            />
                                        )}
                                    </div>
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
