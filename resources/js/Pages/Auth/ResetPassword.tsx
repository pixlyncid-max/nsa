import InputError from '@/Components/ui/InputError';
import InputLabel from '@/Components/ui/InputLabel';
import PrimaryButton from '@/Components/ui/PrimaryButton';
import TextInput from '@/Components/ui/TextInput';
import AuthLayout from '@/Layouts/AuthLayout';
import { Head, useForm } from '@inertiajs/react';
import { CheckCircle2, Lock, Mail } from 'lucide-react';
import { FormEventHandler } from 'react';

interface ResetPasswordProps {
    token: string;
    email: string;
}

export default function ResetPassword({ token, email }: ResetPasswordProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthLayout
            title="Atur Ulang Kata Sandi"
            subtitle="Buat kata sandi baru yang aman untuk akun NSA Anda."
        >
            <Head title="Atur Ulang Kata Sandi" />

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <InputLabel htmlFor="email" value="Alamat Email" required />
                    <div className="relative">
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            autoComplete="username"
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
                    <InputLabel
                        htmlFor="password"
                        value="Kata Sandi Baru"
                        required
                    />
                    <div className="relative">
                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            placeholder="Minimal 8 karakter"
                            autoComplete="new-password"
                            autoFocus
                            isError={!!errors.password}
                            onChange={(e) =>
                                setData('password', e.target.value)
                            }
                            required
                        />
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate/50">
                            <Lock className="h-4 w-4" />
                        </div>
                    </div>
                    <InputError message={errors.password} />
                </div>

                <div>
                    <InputLabel
                        htmlFor="password_confirmation"
                        value="Ulangi Kata Sandi Baru"
                        required
                    />
                    <div className="relative">
                        <TextInput
                            id="password_confirmation"
                            type="password"
                            name="password_confirmation"
                            value={data.password_confirmation}
                            placeholder="Ketik ulang kata sandi baru"
                            autoComplete="new-password"
                            isError={!!errors.password_confirmation}
                            onChange={(e) =>
                                setData('password_confirmation', e.target.value)
                            }
                            required
                        />
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate/50">
                            <Lock className="h-4 w-4" />
                        </div>
                    </div>
                    <InputError message={errors.password_confirmation} />
                </div>

                <div className="pt-3">
                    <PrimaryButton
                        isLoading={processing}
                        icon={<CheckCircle2 className="h-4 w-4" />}
                    >
                        Simpan Kata Sandi Baru
                    </PrimaryButton>
                </div>
            </form>
        </AuthLayout>
    );
}
