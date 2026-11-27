import InputError from '@/Components/ui/InputError';
import InputLabel from '@/Components/ui/InputLabel';
import PrimaryButton from '@/Components/ui/PrimaryButton';
import TextInput from '@/Components/ui/TextInput';
import AuthLayout from '@/Layouts/AuthLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowRight, Eye, EyeOff, Mail } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

interface LoginProps {
    status?: string;
    canResetPassword?: boolean;
}

export default function Login({ status, canResetPassword = true }: LoginProps) {
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthLayout
            title="Masuk ke Akun Anda"
            subtitle="Gunakan akun terdaftar untuk mengakses dasbor keanggotaan dan toko NSA."
        >
            <Head title="Masuk" />

            {status && (
                <div className="mb-6 rounded-control border border-success/30 bg-success/10 p-3.5 text-sm font-medium text-success">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-5">
                <div>
                    <InputLabel htmlFor="email" value="Alamat Email" required />
                    <div className="relative">
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            placeholder="nama@email.com"
                            autoComplete="username"
                            autoFocus
                            isError={!!errors.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                        />
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate/50">
                            <Mail className="h-4 w-4" />
                        </div>
                    </div>
                    <InputError message={errors.email} />
                </div>

                <div>
                    <div className="mb-1.5 flex items-center justify-between">
                        <InputLabel
                            htmlFor="password"
                            value="Kata Sandi"
                            required
                            className="mb-0"
                        />
                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="text-xs font-semibold text-ocean hover:underline focus:outline-none"
                            >
                                Lupa kata sandi?
                            </Link>
                        )}
                    </div>
                    <div className="relative">
                        <TextInput
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={data.password}
                            placeholder="••••••••"
                            autoComplete="current-password"
                            className="pr-11"
                            isError={!!errors.password}
                            onChange={(e) =>
                                setData('password', e.target.value)
                            }
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            aria-label={
                                showPassword
                                    ? 'Sembunyikan kata sandi'
                                    : 'Lihat kata sandi'
                            }
                            aria-pressed={showPassword}
                            title={
                                showPassword
                                    ? 'Sembunyikan kata sandi'
                                    : 'Lihat kata sandi'
                            }
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate/70 transition-colors hover:text-navy focus:outline-none focus-visible:text-ocean"
                        >
                            {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                            ) : (
                                <Eye className="h-4 w-4" />
                            )}
                        </button>
                    </div>
                    <InputError message={errors.password} />
                </div>

                <div className="flex items-center justify-between">
                    <label className="flex cursor-pointer select-none items-center">
                        <input
                            type="checkbox"
                            name="remember"
                            checked={data.remember}
                            onChange={(e) =>
                                setData('remember', e.target.checked)
                            }
                            className="h-4 w-4 rounded border-line text-navy focus:ring-ocean/30"
                        />
                        <span className="ml-2 text-sm text-slate">
                            Ingat saya di perangkat ini
                        </span>
                    </label>
                </div>

                <div className="pt-2">
                    <PrimaryButton
                        isLoading={processing}
                        icon={<ArrowRight className="h-4 w-4" />}
                    >
                        Masuk ke Akun
                    </PrimaryButton>
                </div>

                <div className="border-t border-line pt-4 text-center text-sm text-slate">
                    Belum memiliki akun?{' '}
                    <Link
                        href={route('register')}
                        className="font-semibold text-ocean hover:underline"
                    >
                        Daftar akun sekarang
                    </Link>
                </div>
            </form>
        </AuthLayout>
    );
}
