import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { 
    UserPlus, 
    Check, 
    Headphones, 
    ChevronDown, 
    LogOut, 
    X,
    ShieldCheck
} from 'lucide-react';
import { STEPS_CONFIG } from '@/Pages/Member/Register/steps';
import LanguageSwitcher from '@/Components/layout/LanguageSwitcher';
import Logo from '@/Components/layout/Logo';
import { motion, AnimatePresence } from 'framer-motion';
import type { PageProps } from '@/types';

interface MemberRegisterLayoutProps {
    title?: string;
    currentStepSlug: string;
    completedSteps: string[];
    onStepClick: (slug: string) => void;
    supportContact?: {
        phone: string;
        email: string;
    };
    mobileDrawerOpen?: boolean;
    setMobileDrawerOpen?: (open: boolean) => void;
    children: React.ReactNode;
}

export default function MemberRegisterLayout({
    title = 'Pendaftaran Anggota Baru NSA',
    currentStepSlug,
    completedSteps,
    onStepClick,
    supportContact = {
        phone: '+62 812-3456-7890',
        email: 'info@nsa.or.id',
    },
    mobileDrawerOpen: controlledMobileDrawerOpen,
    setMobileDrawerOpen: controlledSetMobileDrawerOpen,
    children,
}: MemberRegisterLayoutProps) {
    const { props } = usePage<PageProps>();
    const user = props.auth?.user;

    const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
    const [internalMobileDrawerOpen, setInternalMobileDrawerOpen] = useState(false);

    const isDrawerOpen = controlledMobileDrawerOpen !== undefined ? controlledMobileDrawerOpen : internalMobileDrawerOpen;
    const setIsDrawerOpen = controlledSetMobileDrawerOpen || setInternalMobileDrawerOpen;

    const currentStepConfig = STEPS_CONFIG.find((s) => s.slug === currentStepSlug) || STEPS_CONFIG[0];

    // Helper untuk cek izin klik langkah
    const isStepAccessible = (slug: string): boolean => {
        if (completedSteps.includes(slug)) return true;
        const firstIncomplete = STEPS_CONFIG.find((s) => !completedSteps.includes(s.slug));
        return firstIncomplete?.slug === slug;
    };

    // Render list sidebar (dipakai di desktop dan drawer mobile)
    const renderSidebarItems = () => (
        <div className="relative">
            {/* Garis vertikal tipis menghubungkan nomor di sidebar */}
            <div className="absolute left-[19px] top-4 bottom-4 w-[1px] bg-white/20 z-0" />

            <div className="space-y-2 relative z-10">
                {STEPS_CONFIG.map((step) => {
                    const isCompleted = completedSteps.includes(step.slug);
                    const isActive = step.slug === currentStepSlug;
                    const accessible = isStepAccessible(step.slug);

                    return (
                        <button
                            key={step.id}
                            type="button"
                            disabled={!accessible}
                            onClick={() => {
                                if (accessible) {
                                    onStepClick(step.slug);
                                    setIsDrawerOpen(false);
                                }
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all text-left ${
                                isActive
                                    ? 'bg-ocean text-white shadow-soft font-bold'
                                    : accessible
                                    ? 'text-white/80 hover:bg-white/10 hover:text-white cursor-pointer'
                                    : 'text-white/40 cursor-not-allowed opacity-60'
                            }`}
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                {/* Nomor Lingkaran */}
                                <div
                                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                                        isActive
                                            ? 'bg-white text-ocean shadow-soft font-bold'
                                            : isCompleted
                                            ? 'border border-success/30 text-emerald-300 bg-success/20'
                                            : 'border border-white/30 text-white/60 bg-navy'
                                    }`}
                                >
                                    {isCompleted ? (
                                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                    ) : (
                                        <span>{step.number}</span>
                                    )}
                                </div>

                                <span className="text-xs font-medium truncate">
                                    {step.title}
                                </span>
                            </div>

                            {/* Badge centang hijau di sisi kanan jika sudah selesai */}
                            {isCompleted && !isActive && (
                                <div className="w-5 h-5 rounded-full bg-success text-white flex items-center justify-center shrink-0 shadow-soft">
                                    <Check className="w-3 h-3 stroke-[3]" />
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-mist/60 flex flex-col font-sans">
            <Head title={`${currentStepConfig.title} · ${title}`} />

            {/* Header Putih */}
            <header className="sticky top-0 z-40 h-[72px] bg-white border-b border-line shadow-soft">
                <div className="max-w-[1440px] mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                    {/* Sisi Kiri: Logo NSA */}
                    <div className="flex items-center gap-3">
                        <Logo />
                    </div>

                    {/* Sisi Kanan: Pemilih Bahasa & Menu Akun */}
                    <div className="flex items-center gap-2 sm:gap-4">
                        <LanguageSwitcher />

                        {/* Menu Akun */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => {
                                    setAccountDropdownOpen(!accountDropdownOpen);
                                }}
                                className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-control hover:bg-mist transition"
                            >
                                <div className="w-8 h-8 rounded-full bg-navy text-white flex items-center justify-center font-bold text-xs uppercase shadow-soft overflow-hidden border border-line">
                                    {user?.avatar ? (
                                        <img
                                            src={user.avatar}
                                            alt={user.name || 'Foto Profil'}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span>{user?.name ? user.name.charAt(0) : 'A'}</span>
                                    )}
                                </div>
                                <span className="text-xs font-bold text-navy hidden sm:inline">
                                    {user?.name?.split(' ')[0] || 'Akun'}
                                </span>
                                <ChevronDown className="w-3.5 h-3.5 text-slate" />
                            </button>

                            {accountDropdownOpen && (
                                <div className="absolute right-0 mt-1 w-56 bg-white border border-line rounded-card shadow-lift py-1 z-50">
                                    <div className="px-3.5 py-2.5 border-b border-line flex items-center gap-2.5">
                                        <div className="w-9 h-9 rounded-full bg-navy text-white flex items-center justify-center font-bold text-xs uppercase shrink-0 overflow-hidden border border-line shadow-soft">
                                            {user?.avatar ? (
                                                <img
                                                    src={user.avatar}
                                                    alt={user.name || 'Foto Profil'}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <span>{user?.name ? user.name.charAt(0) : 'A'}</span>
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="text-xs font-bold text-navy truncate">{user?.name}</div>
                                            <div className="text-[10px] text-slate truncate">{user?.email}</div>
                                        </div>
                                    </div>
                                    <Link
                                        href="/akun/keanggotaan"
                                        className="flex items-center gap-2 px-3.5 py-2 text-xs text-slate hover:text-navy hover:bg-mist transition"
                                    >
                                        <ShieldCheck className="w-3.5 h-3.5 text-ocean" /> Status Keanggotaan
                                    </Link>
                                    <Link
                                        href="/logout"
                                        method="post"
                                        as="button"
                                        className="w-full text-left flex items-center gap-2 px-3.5 py-2 text-xs text-danger hover:bg-mist transition"
                                    >
                                        <LogOut className="w-3.5 h-3.5 text-danger" /> Keluar
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Area Utama: Sidebar Navy + Konten Putih */}
            <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Sidebar Navy Desktop (Lebar ±260px - 280px) */}
                    <aside className="hidden lg:block lg:col-span-3 xl:col-span-3 bg-navy text-white rounded-2xl p-6 shadow-soft sticky top-24">
                        <div className="flex items-center gap-2.5 pb-5 mb-5 border-b border-white/10">
                            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-aqua shrink-0">
                                <UserPlus className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                                <h2 className="font-display font-bold text-sm text-white leading-tight">
                                    Pendaftaran Anggota
                                </h2>
                                <p className="text-[11px] text-white/60">
                                    Baru NSA (9 Langkah)
                                </p>
                            </div>
                        </div>

                        {/* Daftar 9 Langkah Vertikal */}
                        {renderSidebarItems()}

                        {/* Kotak Butuh Bantuan */}
                        <div className="mt-8 pt-6 border-t border-white/10">
                            <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white/10 text-aqua flex items-center justify-center shrink-0">
                                    <Headphones className="w-4 h-4" />
                                </div>
                                <div className="min-w-0 text-[11px]">
                                    <div className="font-bold text-white">Butuh bantuan?</div>
                                    <div className="text-white/60 mt-0.5">Hubungi kami melalui</div>
                                    <a
                                        href={`https://wa.me/${supportContact.phone.replace(/[^0-9]/g, '')}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="font-medium text-aqua hover:underline block truncate mt-1"
                                    >
                                        {supportContact.phone}
                                    </a>
                                    <a
                                        href={`mailto:${supportContact.email}`}
                                        className="font-medium text-white/80 hover:underline block truncate"
                                    >
                                        {supportContact.email}
                                    </a>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Area Konten Putih berradius besar di Kanan */}
                    <div className="lg:col-span-9 xl:col-span-9 bg-white rounded-2xl md:rounded-card border border-line p-5 sm:p-7 md:p-9 shadow-soft">
                        {children}
                    </div>

                </div>
            </main>

            {/* Drawer Sidebar Mobile */}
            <AnimatePresence>
                {isDrawerOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsDrawerOpen(false)}
                            className="fixed inset-0 bg-navy/60 backdrop-blur-xs z-50 lg:hidden"
                        />
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                            className="fixed inset-y-0 left-0 w-[280px] bg-navy text-white p-6 z-50 lg:hidden overflow-y-auto flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
                                    <div className="flex items-center gap-2">
                                        <UserPlus className="w-5 h-5 text-aqua" />
                                        <h3 className="font-display font-bold text-sm text-white">
                                            Alur Pendaftaran NSA
                                        </h3>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setIsDrawerOpen(false)}
                                        className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {renderSidebarItems()}
                            </div>

                            <div className="mt-6 pt-4 border-t border-white/10">
                                <div className="text-[11px] text-white/60">
                                    Sekretariat NSA: {supportContact.phone}
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
