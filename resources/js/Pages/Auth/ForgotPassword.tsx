import InputError from '@/Components/ui/InputError';
import InputLabel from '@/Components/ui/InputLabel';
import PrimaryButton from '@/Components/ui/PrimaryButton';
import TextInput from '@/Components/ui/TextInput';
import AuthLayout from '@/Layouts/AuthLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Mail, Send } from 'lucide-react';
import { FormEventHandler } from 'react';

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <AuthLayout
            title="Lupa Kata Sandi?"
            subtitle="Ketikkan email akun Anda. Kami akan mengirimkan tautan untuk mengatur ulang kata sandi Anda."
        >
            <Head title="Lupa Kata Sandi" />

            {status && (
                <div className="mb-6 rounded-control border border-success/30 bg-success/10 p-3.5 text-sm font-medium text-success">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-5">
                <div>
                    <InputLabel
                        htmlFor="email"
                        value="Alamat Email Terdaftar"
                        required
                    />
                    <div className="relative">
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            placeholder="nama@email.com"
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

                <div className="pt-2">
                    <PrimaryButton
                        isLoading={processing}
                        icon={<Send className="h-4 w-4" />}
                    >
                        Kirim Tautan Atur Ulang
                    </PrimaryButton>
                </div>

                <div className="border-t border-line pt-4 text-center text-sm text-slate">
                    <Link
                        href={route('login')}
                        className="inline-flex items-center gap-1.5 font-semibold text-ocean hover:underline"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Kembali ke Halaman Masuk
                    </Link>
                </div>
            </form>
        </AuthLayout>
    );
}
