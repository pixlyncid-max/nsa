import InputError from '@/Components/ui/InputError';
import InputLabel from '@/Components/ui/InputLabel';
import PrimaryButton from '@/Components/ui/PrimaryButton';
import TextInput from '@/Components/ui/TextInput';
import AuthLayout from '@/Layouts/AuthLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowRight, Lock, Mail, Phone, User as UserIcon } from 'lucide-react';
import { FormEventHandler } from 'react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthLayout
            title="Daftar Akun NSA"
            subtitle="Buat akun dasar untuk mulai berbelanja produk perikanan dan mengajukan keanggotaan resmi."
        >
            <Head title="Daftar Akun" />

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <InputLabel htmlFor="name" value="Nama Lengkap" required />
                    <div className="relative">
                        <TextInput
                            id="name"
                            name="name"
                            value={data.name}
                            placeholder="Contoh: Budi Pratama"
                            autoComplete="name"
                            autoFocus
                            isError={!!errors.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                        />
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate/50">
                            <UserIcon className="h-4 w-4" />
                        </div>
                    </div>
                    <InputError message={errors.name} />
                </div>

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
                    <InputLabel htmlFor="phone" value="Nomor WhatsApp / HP" />
                    <div className="relative">
                        <TextInput
                            id="phone"
                            type="tel"
                            name="phone"
                            value={data.phone}
                            placeholder="081234567890"
                            autoComplete="tel"
                            isError={!!errors.phone}
                            onChange={(e) => setData('phone', e.target.value)}
                        />
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate/50">
                            <Phone className="h-4 w-4" />
                        </div>
                    </div>
                    <InputError message={errors.phone} />
                </div>

                <div>
                    <InputLabel
                        htmlFor="password"
                        value="Kata Sandi"
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
                        value="Ulangi Kata Sandi"
                        required
                    />
                    <div className="relative">
                        <TextInput
                            id="password_confirmation"
                            type="password"
                            name="password_confirmation"
                            value={data.password_confirmation}
                            placeholder="Ketik ulang kata sandi"
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
                        icon={<ArrowRight className="h-4 w-4" />}
                    >
                        Buat Akun Saya
                    </PrimaryButton>
                </div>

                <div className="border-t border-line pt-4 text-center text-sm text-slate">
                    Sudah memiliki akun?{' '}
                    <Link
                        href={route('login')}
                        className="font-semibold text-ocean hover:underline"
                    >
                        Masuk di sini
                    </Link>
                </div>
            </form>
        </AuthLayout>
    );
}
