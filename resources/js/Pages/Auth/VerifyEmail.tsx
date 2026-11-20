import PrimaryButton from '@/Components/ui/PrimaryButton';
import AuthLayout from '@/Layouts/AuthLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { LogOut, Send } from 'lucide-react';
import { FormEventHandler } from 'react';

export default function VerifyEmail({ status }: { status?: string }) {
    const { post, processing } = useForm({});

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    return (
        <AuthLayout
            title="Verifikasi Alamat Email"
            subtitle="Terima kasih telah mendaftar! Sebelum memulai, silakan klik tautan verifikasi yang baru saja kami kirimkan ke email Anda."
        >
            <Head title="Verifikasi Email" />

            {status === 'verification-link-sent' && (
                <div className="mb-6 rounded-control border border-success/30 bg-success/10 p-3.5 text-sm font-medium text-success">
                    Tautan verifikasi baru telah berhasil dikirimkan ke alamat
                    email Anda.
                </div>
            )}

            <form onSubmit={submit} className="space-y-4">
                <PrimaryButton
                    isLoading={processing}
                    icon={<Send className="h-4 w-4" />}
                >
                    Kirim Ulang Email Verifikasi
                </PrimaryButton>

                <div className="pt-4 text-center">
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate hover:text-danger focus:outline-none"
                    >
                        <LogOut className="h-4 w-4" />
                        Keluar dari Akun
                    </Link>
                </div>
            </form>
        </AuthLayout>
    );
}
