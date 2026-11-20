import PageBanner from '@/Components/layout/PageBanner';
import Button from '@/Components/ui/Button';
import Card from '@/Components/ui/Card';
import Input from '@/Components/ui/Input';
import PortalLayout from '@/Layouts/PortalLayout';
import { useForm } from '@inertiajs/react';
import {
    Camera,
    Check,
    KeyRound,
    Lock,
    Mail,
    Phone,
    Shield,
    User,
    UserCheck,
} from 'lucide-react';
import { useState, type ChangeEvent, type FormEvent } from 'react';

interface ProfileData {
    name: string;
    email: string;
    phone: string;
    avatar: string | null;
    membership_status: string;
    member_number: string | null;
}

interface ProfileProps {
    profile: ProfileData;
}

export default function AccountProfile({ profile }: ProfileProps) {
    const [avatarPreview, setAvatarPreview] = useState<string | null>(
        profile.avatar
    );

    // Form 1: Informasi Profil
    const profileForm = useForm<{
        name: string;
        phone: string;
        avatar: File | null;
    }>({
        name: profile.name || '',
        phone: profile.phone || '',
        avatar: null,
    });

    const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            profileForm.setData('avatar', file);
            const objectUrl = URL.createObjectURL(file);
            setAvatarPreview(objectUrl);
        }
    };

    const handleProfileSubmit = (e: FormEvent) => {
        e.preventDefault();
        profileForm.post('/akun/profil', {
            preserveScroll: true,
            forceFormData: true,
        });
    };

    // Form 2: Ubah Kata Sandi
    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const handlePasswordSubmit = (e: FormEvent) => {
        e.preventDefault();
        passwordForm.post('/akun/profil/password', {
            preserveScroll: true,
            onSuccess: () => passwordForm.reset(),
        });
    };

    return (
        <PortalLayout title="Profil Pengguna">
            <PageBanner
                eyebrow="PENGATURAN AKUN"
                title="Profil & Keamanan Akun"
                subtitle="Perbarui data kontak, foto identitas pengguna, dan kelola kata sandi akun portal Anda."
            />

            <div className="grid gap-6 lg:grid-cols-2">
                {/* 1. Kartu Data Profil */}
                <Card className="p-6 md:p-7 border-line shadow-soft flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2.5 border-b border-line pb-4">
                            <div className="grid h-9 w-9 place-items-center rounded-control bg-ocean/10 text-ocean">
                                <User className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="font-display text-base font-bold text-navy">
                                    Informasi Profil
                                </h2>
                                <p className="text-xs text-slate">
                                    Identitas nama lengkap dan kontak utama
                                </p>
                            </div>
                        </div>

                        <form
                            onSubmit={handleProfileSubmit}
                            className="mt-6 space-y-5"
                        >
                            {/* Upload Foto / Avatar */}
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    {avatarPreview ? (
                                        <img
                                            src={avatarPreview}
                                            alt={profile.name}
                                            className="h-20 w-20 rounded-full object-cover ring-2 ring-ocean/30 shadow-xs"
                                        />
                                    ) : (
                                        <span className="grid h-20 w-20 place-items-center rounded-full bg-navy font-display text-2xl font-bold text-white shadow-soft">
                                            {profile.name
                                                .slice(0, 1)
                                                .toUpperCase()}
                                        </span>
                                    )}

                                    <label
                                        htmlFor="avatar-upload"
                                        className="absolute -bottom-1 -right-1 grid h-8 w-8 cursor-pointer place-items-center rounded-full bg-ocean text-white shadow-soft hover:bg-navy transition-colors ring-2 ring-white"
                                        title="Ubah foto profil"
                                    >
                                        <Camera className="h-4 w-4" />
                                        <input
                                            id="avatar-upload"
                                            type="file"
                                            accept="image/*"
                                            className="sr-only"
                                            onChange={handleAvatarChange}
                                        />
                                    </label>
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-semibold text-navy">
                                        Foto Profil
                                    </p>
                                    <p className="mt-0.5 text-[11px] text-slate leading-relaxed">
                                        Format JPG, PNG, atau WebP. Maksimal 2MB.
                                    </p>
                                    {profileForm.errors.avatar ? (
                                        <p className="mt-1 text-xs text-danger font-medium">
                                            {profileForm.errors.avatar}
                                        </p>
                                    ) : null}
                                </div>
                            </div>

                            {/* Nama Lengkap */}
                            <Input
                                label="Nama Lengkap"
                                required
                                value={profileForm.data.name}
                                onChange={(e) =>
                                    profileForm.setData('name', e.target.value)
                                }
                                error={profileForm.errors.name}
                                leading={<User className="h-4 w-4" />}
                                placeholder="Masukkan nama lengkap Anda"
                            />

                            {/* Email (Read Only) */}
                            <div>
                                <label className="block text-xs font-semibold text-slate mb-1">
                                    Alamat Email Terdaftar
                                </label>
                                <div className="relative">
                                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate">
                                        <Mail className="h-4 w-4" />
                                    </span>
                                    <input
                                        type="email"
                                        disabled
                                        value={profile.email}
                                        className="h-11 w-full rounded-control border border-line bg-mist/60 pl-10 pr-3 text-xs md:text-sm text-slate cursor-not-allowed font-medium"
                                    />
                                </div>
                                <p className="mt-1 text-[11px] text-slate">
                                    Email digunakan untuk autentikasi masuk dan tidak dapat diubah sembarangan.
                                </p>
                            </div>

                            {/* Nomor Telepon */}
                            <Input
                                label="Nomor Telepon / WhatsApp"
                                value={profileForm.data.phone}
                                onChange={(e) =>
                                    profileForm.setData('phone', e.target.value)
                                }
                                error={profileForm.errors.phone}
                                leading={<Phone className="h-4 w-4" />}
                                placeholder="08xxxxxxxxxx"
                                hint="Digunakan untuk konfirmasi pesanan dan koordinasi anggota."
                            />

                            <div className="pt-2 text-right">
                                <Button
                                    type="submit"
                                    size="md"
                                    loading={profileForm.processing}
                                    disabled={profileForm.processing}
                                >
                                    <Check className="h-4 w-4 mr-1.5" />
                                    Simpan Perubahan
                                </Button>
                            </div>
                        </form>
                    </div>
                </Card>

                {/* 2. Kartu Ubah Kata Sandi */}
                <Card className="p-6 md:p-7 border-line shadow-soft flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2.5 border-b border-line pb-4">
                            <div className="grid h-9 w-9 place-items-center rounded-control bg-ocean/10 text-ocean">
                                <Lock className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="font-display text-base font-bold text-navy">
                                    Keamanan Kata Sandi
                                </h2>
                                <p className="text-xs text-slate">
                                    Ganti kata sandi untuk melindungi akses akun Anda
                                </p>
                            </div>
                        </div>

                        <form
                            onSubmit={handlePasswordSubmit}
                            className="mt-6 space-y-5"
                        >
                            <Input
                                label="Kata Sandi Saat Ini"
                                type="password"
                                required
                                value={passwordForm.data.current_password}
                                onChange={(e) =>
                                    passwordForm.setData(
                                        'current_password',
                                        e.target.value
                                    )
                                }
                                error={passwordForm.errors.current_password}
                                leading={<KeyRound className="h-4 w-4" />}
                                placeholder="••••••••"
                            />

                            <Input
                                label="Kata Sandi Baru"
                                type="password"
                                required
                                value={passwordForm.data.password}
                                onChange={(e) =>
                                    passwordForm.setData(
                                        'password',
                                        e.target.value
                                    )
                                }
                                error={passwordForm.errors.password}
                                leading={<Lock className="h-4 w-4" />}
                                placeholder="Minimal 8 karakter"
                                hint="Gunakan kombinasi huruf, angka, dan simbol untuk keamanan."
                            />

                            <Input
                                label="Konfirmasi Kata Sandi Baru"
                                type="password"
                                required
                                value={passwordForm.data.password_confirmation}
                                onChange={(e) =>
                                    passwordForm.setData(
                                        'password_confirmation',
                                        e.target.value
                                    )
                                }
                                error={
                                    passwordForm.errors.password_confirmation
                                }
                                leading={<Lock className="h-4 w-4" />}
                                placeholder="Ulangi kata sandi baru"
                            />

                            <div className="pt-2 text-right">
                                <Button
                                    type="submit"
                                    size="md"
                                    loading={passwordForm.processing}
                                    disabled={passwordForm.processing}
                                >
                                    <Shield className="h-4 w-4 mr-1.5" />
                                    Perbarui Kata Sandi
                                </Button>
                            </div>
                        </form>
                    </div>
                </Card>
            </div>
        </PortalLayout>
    );
}
