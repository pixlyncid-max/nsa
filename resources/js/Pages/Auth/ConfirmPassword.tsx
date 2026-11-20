import InputError from '@/Components/ui/InputError';
import InputLabel from '@/Components/ui/InputLabel';
import PrimaryButton from '@/Components/ui/PrimaryButton';
import TextInput from '@/Components/ui/TextInput';
import AuthLayout from '@/Layouts/AuthLayout';
import { Head, useForm } from '@inertiajs/react';
import { Lock, ShieldCheck } from 'lucide-react';
import { FormEventHandler } from 'react';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.confirm'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthLayout
            title="Konfirmasi Kata Sandi"
            subtitle="Ini adalah area sensitif aplikasi. Harap masukkan kembali kata sandi Anda sebelum melanjutkan."
        >
            <Head title="Konfirmasi Kata Sandi" />

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <InputLabel
                        htmlFor="password"
                        value="Kata Sandi Anda"
                        required
                    />
                    <div className="relative">
                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            placeholder="••••••••"
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

                <div className="pt-2">
                    <PrimaryButton
                        isLoading={processing}
                        icon={<ShieldCheck className="h-4 w-4" />}
                    >
                        Konfirmasi Akses
                    </PrimaryButton>
                </div>
            </form>
        </AuthLayout>
    );
}
