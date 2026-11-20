import React, { useState } from 'react';
import PortalLayout, { defaultMemberMenuItems } from '@/Layouts/PortalLayout';
import PageBanner from '@/Components/layout/PageBanner';
import Card from '@/Components/ui/Card';
import Button from '@/Components/ui/Button';
import Input from '@/Components/ui/Input';
import { router } from '@inertiajs/react';
import { Bell, KeyRound, Lock, LogOut, Shield } from 'lucide-react';

interface SettingProps {
    user: {
        name: string;
        email: string;
    };
}

export default function MemberSettings({ user }: SettingProps) {
    // Password state
    const [currentPassword, setCurrentPassword] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

    // Logout other devices
    const [logoutPassword, setLogoutPassword] = useState('');
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    // Notification toggles
    const [notifyEmail, setNotifyEmail] = useState(true);
    const [notifyPrograms, setNotifyPrograms] = useState(true);

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdatingPassword(true);
        router.post(
            '/anggota/pengaturan/password',
            {
                current_password: currentPassword,
                password,
                password_confirmation: passwordConfirmation,
            },
            {
                onSuccess: () => {
                    setCurrentPassword('');
                    setPassword('');
                    setPasswordConfirmation('');
                },
                onFinish: () => setIsUpdatingPassword(false),
            }
        );
    };

    const handleLogoutOtherDevices = (e: React.FormEvent) => {
        e.preventDefault();
        if (!logoutPassword) {
            alert('Masukkan kata sandi saat ini untuk konfirmasi.');
            return;
        }

        setIsLoggingOut(true);
        router.post(
            '/anggota/pengaturan/logout-other',
            { password: logoutPassword },
            {
                onSuccess: () => setLogoutPassword(''),
                onFinish: () => setIsLoggingOut(false),
            }
        );
    };

    return (
        <PortalLayout
            title="Pengaturan Akun"
            areaLabel="PORTAL ANGGOTA"
            menuItems={defaultMemberMenuItems}
        >
            <div className="space-y-8">
                {/* Banner */}
                <PageBanner
                    eyebrow="PENGATURAN"
                    title="Pengaturan Akun & Keamanan"
                    subtitle="Kelola kata sandi akun, preferensi notifikasi warta organisasi, dan sesi login perangkat Anda."
                />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    {/* 1. Ganti Kata Sandi */}
                    <Card className="p-6 border-line shadow-soft">
                        <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-line">
                            <div className="w-8 h-8 rounded-lg bg-ocean/10 text-ocean flex items-center justify-center">
                                <KeyRound className="w-4 h-4" />
                            </div>
                            <div>
                                <h3 className="font-display text-base font-bold text-navy">
                                    Perbarui Kata Sandi
                                </h3>
                                <p className="text-xs text-slate">
                                    Pastikan kata sandi Anda kuat untuk mengamankan data keanggotaan.
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handlePasswordSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate mb-1">
                                    Kata Sandi Saat Ini
                                </label>
                                <Input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate mb-1">
                                    Kata Sandi Baru
                                </label>
                                <Input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate mb-1">
                                    Konfirmasi Kata Sandi Baru
                                </label>
                                <Input
                                    type="password"
                                    value={passwordConfirmation}
                                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="pt-2">
                                <Button
                                    type="submit"
                                    variant="primary"
                                    disabled={isUpdatingPassword}
                                >
                                    {isUpdatingPassword ? 'Memperbarui...' : 'Simpan Kata Sandi Baru'}
                                </Button>
                            </div>
                        </form>
                    </Card>

                    {/* 2. Preferensi Notifikasi & Logout Sesi */}
                    <div className="space-y-6">
                        {/* Preferensi Notifikasi */}
                        <Card className="p-6 border-line shadow-soft">
                            <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-line">
                                <div className="w-8 h-8 rounded-lg bg-ocean/10 text-ocean flex items-center justify-center">
                                    <Bell className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="font-display text-base font-bold text-navy">
                                        Preferensi Notifikasi
                                    </h3>
                                    <p className="text-xs text-slate">
                                        Pemberitahuan resmi yang dikirimkan ke email {user.email}.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="flex items-center justify-between p-3 rounded-xl border border-line bg-mist/30 cursor-pointer">
                                    <div>
                                        <span className="text-xs font-bold text-navy block">
                                            Pengumuman & Warta Asosiasi
                                        </span>
                                        <span className="text-[11px] text-slate">
                                            Kabar berita, regulasi perikanan, dan informasi resmi.
                                        </span>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={notifyEmail}
                                        onChange={(e) => setNotifyEmail(e.target.checked)}
                                        className="rounded text-ocean focus:ring-ocean"
                                    />
                                </label>

                                <label className="flex items-center justify-between p-3 rounded-xl border border-line bg-mist/30 cursor-pointer">
                                    <div>
                                        <span className="text-xs font-bold text-navy block">
                                            Undangan Program & Pelatihan
                                        </span>
                                        <span className="text-[11px] text-slate">
                                            Pemberitahuan pembukaan pendaftaran program baru.
                                        </span>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={notifyPrograms}
                                        onChange={(e) => setNotifyPrograms(e.target.checked)}
                                        className="rounded text-ocean focus:ring-ocean"
                                    />
                                </label>
                            </div>
                        </Card>

                        {/* Keluar dari Semua Perangkat Lain */}
                        <Card className="p-6 border-line shadow-soft">
                            <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-line">
                                <div className="w-8 h-8 rounded-lg bg-rose-50 text-danger flex items-center justify-center">
                                    <LogOut className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="font-display text-base font-bold text-navy">
                                        Sesi Login Perangkat
                                    </h3>
                                    <p className="text-xs text-slate">
                                        Keluar dari akun Anda di semua peramban dan perangkat lain.
                                    </p>
                                </div>
                            </div>

                            <form onSubmit={handleLogoutOtherDevices} className="space-y-3">
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate mb-1">
                                        Konfirmasi Kata Sandi Anda
                                    </label>
                                    <Input
                                        type="password"
                                        placeholder="Ketik kata sandi untuk verifikasi..."
                                        value={logoutPassword}
                                        onChange={(e) => setLogoutPassword(e.target.value)}
                                        required
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    variant="danger"
                                    size="sm"
                                    disabled={isLoggingOut}
                                    className="!bg-rose-50 !text-danger hover:!bg-danger hover:!text-white border border-rose-200"
                                >
                                    {isLoggingOut ? 'Memproses...' : 'Keluar Dari Semua Perangkat Lain'}
                                </Button>
                            </form>
                        </Card>
                    </div>
                </div>
            </div>
        </PortalLayout>
    );
}
