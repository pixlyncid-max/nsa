import Button from '@/Components/ui/Button';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';
import { focusRing } from '@/lib/ui';
import { AnimatePresence, motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, Lock, User, UserRound, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

export interface ProfileData {
    name: string;
    email: string;
    phone: string;
    membership_status: string;
    member_number: string | null;
}

export function openProfileDrawer() {
    window.dispatchEvent(new CustomEvent('nsa:open-profile-drawer'));
}

export default function ProfileDrawer() {
    const reduced = usePrefersReducedMotion();
    const [open, setOpen] = useState(false);
    const [profile, setProfile] = useState<ProfileData>({
        name: '',
        email: '',
        phone: '',
        membership_status: 'non_member',
        member_number: null,
    });
    const [loading, setLoading] = useState(false);
    const [savingProfile, setSavingProfile] = useState(false);

    // Password state
    const [currentPassword, setCurrentPassword] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);

    useEffect(() => {
        const handleOpen = () => setOpen(true);
        window.addEventListener('nsa:open-profile-drawer', handleOpen);
        return () => window.removeEventListener('nsa:open-profile-drawer', handleOpen);
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && open) {
                setOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [open]);

    useEffect(() => {
        if (!open) return;
        let isMounted = true;
        (async () => {
            await Promise.resolve();
            if (!isMounted) return;
            setLoading(true);
            try {
                const res = await fetch('/akun/api/profil', {
                    headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                });
                if (isMounted && res.ok) {
                    const data = await res.json();
                    if (isMounted) setProfile(data);
                }
            } catch {
                if (isMounted) toast.error('Gagal memuat profil');
            } finally {
                if (isMounted) setLoading(false);
            }
        })();

        return () => {
            isMounted = false;
        };
    }, [open]);

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setSavingProfile(true);
        try {
            const token =
                document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
            const res = await fetch('/akun/api/profil', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': token,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({
                    name: profile.name,
                    email: profile.email,
                    phone: profile.phone,
                }),
            });

            const result = await res.json();
            if (res.ok) {
                toast.success(result.message || 'Profil berhasil diperbarui');
            } else {
                toast.error(result.message || 'Gagal memperbarui profil');
            }
        } catch {
            toast.error('Terjadi kendala saat memperbarui profil');
        } finally {
            setSavingProfile(false);
        }
    };

    const handleSavePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== passwordConfirmation) {
            toast.error('Konfirmasi kata sandi tidak cocok');
            return;
        }

        setSavingPassword(true);
        try {
            const token =
                document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
            const res = await fetch('/akun/api/password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': token,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({
                    current_password: currentPassword,
                    password: password,
                    password_confirmation: passwordConfirmation,
                }),
            });

            const result = await res.json();
            if (res.ok) {
                toast.success(result.message || 'Kata sandi berhasil diperbarui');
                setCurrentPassword('');
                setPassword('');
                setPasswordConfirmation('');
            } else {
                toast.error(result.message || 'Gagal memperbarui kata sandi');
            }
        } catch {
            toast.error('Terjadi kesalahan saat memperbarui kata sandi');
        } finally {
            setSavingPassword(false);
        }
    };

    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-[60] overflow-hidden font-sans">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: reduced ? 0 : 0.2 }}
                        onClick={() => setOpen(false)}
                        className="fixed inset-0 bg-ink/40 backdrop-blur-sm"
                        aria-hidden="true"
                    />

                    {/* Drawer Slide-over Panel */}
                    <div className="fixed inset-y-0 right-0 flex max-w-full pl-6 sm:pl-10">
                        <motion.aside
                            initial={{ x: reduced ? 0 : '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: reduced ? 0 : '100%' }}
                            transition={{
                                type: 'spring',
                                damping: 28,
                                stiffness: 300,
                            }}
                            className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-line"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="profile-drawer-title"
                        >
                            {/* Header Mandiri */}
                            <div className="p-5 border-b border-line bg-white flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-navy/5 text-navy flex items-center justify-center font-display font-bold">
                                        <UserRound className="w-5 h-5 text-ocean" />
                                    </div>
                                    <div>
                                        <h2
                                            id="profile-drawer-title"
                                            className="font-display font-bold text-lg text-navy tracking-tight leading-none"
                                        >
                                            Profil & Kata Sandi
                                        </h2>
                                        <p className="text-xs text-slate-500 mt-1">
                                            Perbarui informasi diri dan keamanan akun Anda
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setOpen(false)}
                                    className={`p-2 text-slate-400 hover:text-navy hover:bg-mist rounded-control transition-colors ${focusRing}`}
                                    aria-label="Tutup panel"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Body Form */}
                            <div className="flex-1 overflow-y-auto p-5">
                                {loading ? (
                                    <div className="py-20 flex flex-col items-center justify-center text-slate-500">
                                        <Loader2 className="w-8 h-8 animate-spin text-ocean mb-2" />
                                        <p className="text-sm">Memuat profil...</p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {/* Form Informasi Pribadi */}
                                        <form onSubmit={handleSaveProfile} className="space-y-3.5">
                                            <div className="flex items-center gap-2 pb-2 border-b border-line">
                                                <User className="w-4 h-4 text-ocean" />
                                                <h3 className="font-display font-bold text-sm text-navy">
                                                    Informasi Pribadi
                                                </h3>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1">
                                                    Nama Lengkap
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={profile.name}
                                                    onChange={(e) =>
                                                        setProfile({ ...profile, name: e.target.value })
                                                    }
                                                    className={`w-full rounded-control border border-line bg-white px-3.5 py-2 text-sm text-ink ${focusRing}`}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1">
                                                    Alamat Email
                                                </label>
                                                <input
                                                    type="email"
                                                    required
                                                    value={profile.email}
                                                    onChange={(e) =>
                                                        setProfile({ ...profile, email: e.target.value })
                                                    }
                                                    className={`w-full rounded-control border border-line bg-white px-3.5 py-2 text-sm text-ink ${focusRing}`}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1">
                                                    Nomor Telepon / WhatsApp
                                                </label>
                                                <input
                                                    type="tel"
                                                    value={profile.phone}
                                                    onChange={(e) =>
                                                        setProfile({ ...profile, phone: e.target.value })
                                                    }
                                                    placeholder="081234567890"
                                                    className={`w-full rounded-control border border-line bg-white px-3.5 py-2 text-sm text-ink ${focusRing}`}
                                                />
                                            </div>

                                            <Button
                                                type="submit"
                                                variant="primary"
                                                size="sm"
                                                disabled={savingProfile}
                                                className="w-full"
                                            >
                                                {savingProfile ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                        Menyimpan Profil...
                                                    </>
                                                ) : (
                                                    'Simpan Perubahan Profil'
                                                )}
                                            </Button>
                                        </form>

                                        {/* Pemisah Garis Halus */}
                                        <div className="relative py-2">
                                            <div className="absolute inset-0 flex items-center">
                                                <div className="w-full border-t border-line" />
                                            </div>
                                        </div>

                                        {/* Form Ubah Kata Sandi */}
                                        <form onSubmit={handleSavePassword} className="space-y-3.5">
                                            <div className="flex items-center gap-2 pb-2 border-b border-line">
                                                <Lock className="w-4 h-4 text-ocean" />
                                                <h3 className="font-display font-bold text-sm text-navy">
                                                    Ubah Kata Sandi
                                                </h3>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1">
                                                    Kata Sandi Saat Ini
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type={showPassword ? 'text' : 'password'}
                                                        required
                                                        value={currentPassword}
                                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                                        placeholder="••••••••"
                                                        className={`w-full rounded-control border border-line bg-white px-3.5 py-2 pr-10 text-sm text-ink ${focusRing}`}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-navy"
                                                    >
                                                        {showPassword ? (
                                                            <EyeOff className="w-4 h-4" />
                                                        ) : (
                                                            <Eye className="w-4 h-4" />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1">
                                                    Kata Sandi Baru
                                                </label>
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    required
                                                    minLength={8}
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    placeholder="Minimal 8 karakter"
                                                    className={`w-full rounded-control border border-line bg-white px-3.5 py-2 text-sm text-ink ${focusRing}`}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1">
                                                    Ulangi Kata Sandi Baru
                                                </label>
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    required
                                                    minLength={8}
                                                    value={passwordConfirmation}
                                                    onChange={(e) =>
                                                        setPasswordConfirmation(e.target.value)
                                                    }
                                                    placeholder="Ulangi kata sandi baru"
                                                    className={`w-full rounded-control border border-line bg-white px-3.5 py-2 text-sm text-ink ${focusRing}`}
                                                />
                                            </div>

                                            <Button
                                                type="submit"
                                                variant="secondary"
                                                size="sm"
                                                disabled={savingPassword}
                                                className="w-full"
                                            >
                                                {savingPassword ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                        Memperbarui Sandi...
                                                    </>
                                                ) : (
                                                    'Perbarui Kata Sandi'
                                                )}
                                            </Button>
                                        </form>
                                    </div>
                                )}
                            </div>
                        </motion.aside>
                    </div>
                </div>
            )}
        </AnimatePresence>
    );
}
