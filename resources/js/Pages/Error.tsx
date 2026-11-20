import ContourPattern from '@/Components/motion/ContourPattern';
import Parallax from '@/Components/motion/Parallax';
import Reveal from '@/Components/motion/Reveal';
import SplitText from '@/Components/motion/SplitText';
import Button from '@/Components/ui/Button';
import PublicLayout from '@/Layouts/PublicLayout';
import { Head } from '@inertiajs/react';
import { Home, LifeBuoy } from 'lucide-react';

interface ErrorProps {
    status: number;
    message?: string;
}

const errorDetails: Record<number, { title: string; desc: string }> = {
    403: {
        title: 'Akses Dibatasi',
        desc: 'Mohon maaf, Anda tidak memiliki izin untuk membuka halaman atau berkas ini. Silakan masuk dengan akun yang berwenang.',
    },
    404: {
        title: 'Halaman Tidak Ditemukan',
        desc: 'Halaman yang Anda cari mungkin telah dipindahkan, dihapus, atau alamat URL yang Anda masukkan kurang tepat.',
    },
    500: {
        title: 'Terjadi Kendala pada Sistem',
        desc: 'Server kami sedang mengalami gangguan sesaat. Tim teknis NSA telah diberi tahu dan sedang melakukan perbaikan.',
    },
    503: {
        title: 'Sedang dalam Pemeliharaan',
        desc: 'Layanan portal NSA sedang dalam pembaruan berkala untuk meningkatkan kenyamanan Anda. Kami akan segera kembali.',
    },
};

export default function ErrorPage({ status = 404, message }: ErrorProps) {
    const detail = errorDetails[status] || {
        title: 'Terjadi Kesalahan',
        desc: message || 'Terjadi kendala yang tidak terduga saat memproses permintaan Anda.',
    };

    return (
        <PublicLayout>
            <Head title={`${status}: ${detail.title} | NSA Indonesia`} />

            <section className="section relative flex min-h-[70vh] items-center justify-center overflow-hidden bg-white">
                <div className="pointer-events-none absolute inset-0 opacity-30">
                    <ContourPattern tone="ocean" opacity={0.3} />
                </div>

                <div className="container-page relative z-10">
                    <div className="mx-auto max-w-md text-center">
                        <Parallax offset={18}>
                            <span
                                aria-hidden="true"
                                className="block select-none font-display text-8xl font-bold tracking-tighter text-ocean/20 sm:text-9xl"
                            >
                                {status}
                            </span>
                        </Parallax>

                        <h1 className="t-h2 -mt-6 text-navy">
                            <SplitText text={detail.title} />
                        </h1>

                        <Reveal delay={0.12}>
                            <p className="mt-3 text-sm leading-relaxed text-slate">
                                {detail.desc}
                            </p>

                            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                                <Button
                                    href="/"
                                    iconLeft={<Home className="h-4 w-4" />}
                                    className="w-full sm:w-auto"
                                >
                                    Kembali ke Beranda
                                </Button>
                                <Button
                                    href="/kontak"
                                    variant="secondary"
                                    iconLeft={<LifeBuoy className="h-4 w-4" />}
                                    className="w-full sm:w-auto"
                                >
                                    Hubungi Sekretariat
                                </Button>
                            </div>
                        </Reveal>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}
