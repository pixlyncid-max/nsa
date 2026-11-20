import PageHeader from '@/Components/layout/PageHeader';
import Section from '@/Components/layout/Section';
import Button from '@/Components/ui/Button';
import Card from '@/Components/ui/Card';
import RichText from '@/Components/ui/RichText';
import PublicLayout from '@/Layouts/PublicLayout';
import { Head, useForm } from '@inertiajs/react';
import { Calendar, CheckCircle2, Lock, Tag } from 'lucide-react';
import type { FormEvent } from 'react';

interface ProgramDetail {
    id: number;
    title: string;
    slug: string;
    category: string;
    category_label: string;
    summary: string | null;
    body: string | null;
    cover_url: string | null;
    is_public: boolean;
    status: string;
    schedule: string | null;
    starts_at: string | null;
    ends_at: string | null;
}

interface ProgramShowProps {
    program: ProgramDetail;
    isRegistered: boolean;
    canRegister: boolean;
}

export default function ProgramShow({
    program,
    isRegistered,
    canRegister,
}: ProgramShowProps) {
    const registerForm = useForm();

    const handleRegister = (e: FormEvent) => {
        e.preventDefault();
        registerForm.post(`/program/${program.slug}/daftar`, {
            preserveScroll: true,
        });
    };

    return (
        <PublicLayout>
            <Head title={`${program.title} · Program NSA`}>
                <meta
                    name="description"
                    content={
                        program.summary ||
                        `Program kerja resmi NSA: ${program.title}. Kategori ${program.category_label}.`
                    }
                />
            </Head>

            <PageHeader
                breadcrumbs={[
                    { label: 'Beranda', href: '/' },
                    { label: 'Tentang Kami', href: '/tentang-kami' },
                    { label: 'Program Kerja', href: '/tentang-kami#program-kerja' },
                    { label: program.title },
                ]}
                eyebrow={program.category_label}
                title={program.title}
                description={program.summary ?? undefined}
                variant={program.cover_url ? 'with-image' : 'default'}
                imageSrc={program.cover_url ?? undefined}
                imageAlt={program.title}
            >
                <div className="flex flex-wrap items-center gap-2.5">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-ocean/10 px-3 py-1 text-xs font-bold text-ocean">
                        <Tag className="h-3.5 w-3.5" />
                        {program.category_label}
                    </span>

                    {program.is_public ? (
                        <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                            Terbuka untuk Umum
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                            <Lock className="h-3 w-3" />
                            Khusus Anggota NSA
                        </span>
                    )}

                    {program.schedule ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1 text-xs font-medium text-slate">
                            <Calendar className="h-3.5 w-3.5 text-ocean" />
                            {program.schedule}
                        </span>
                    ) : null}
                </div>
            </PageHeader>

            <Section index="01" label="Pelaksanaan Program" tone="white">
                <div className="grid gap-8 lg:grid-cols-12">
                    {/* Kolom Kiri: Deskripsi Program (8 Kolom) */}
                    <div className="space-y-6 lg:col-span-8">
                        <Card className="border-line bg-white p-6 shadow-soft sm:p-8">
                            <h2 className="border-b border-line pb-3 font-display text-lg font-bold text-navy">
                                Deskripsi &amp; Pelaksanaan Program
                            </h2>

                            {program.body ? (
                                <div className="pt-5">
                                    <RichText content={program.body} />
                                </div>
                            ) : (
                                <p className="pt-4 text-sm leading-relaxed text-slate">
                                    Informasi rincian teknis, silabus, dan jadwal pelaksanaan kegiatan ini akan diumumkan lebih lanjut oleh sekretariat NSA.
                                </p>
                            )}
                        </Card>

                        <Card className="border-line bg-mist/40 p-6 shadow-soft">
                            <h3 className="mb-3 font-display text-sm font-bold uppercase tracking-wider text-navy">
                                Manfaat Mengikuti Program NSA
                            </h3>
                            <ul className="space-y-2.5 text-xs text-ink sm:text-sm">
                                <li className="flex items-start gap-2.5">
                                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                                    <span>
                                        Bimbingan teknis langsung dari pakar dan praktisi akuakultur teruji.
                                    </span>
                                </li>
                                <li className="flex items-start gap-2.5">
                                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                                    <span>
                                        Sertifikat keikutsertaan resmi yang diakui jaringan asosiasi nasional.
                                    </span>
                                </li>
                                <li className="flex items-start gap-2.5">
                                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                                    <span>
                                        Akses jejaring kemitraan offtaker, perbankan, dan sesama pembudidaya.
                                    </span>
                                </li>
                            </ul>
                        </Card>
                    </div>

                    {/* Kolom Kanan: Pendaftaran & Ringkasan (4 Kolom) */}
                    <aside
                        className="space-y-6 lg:sticky lg:col-span-4"
                        style={{ top: 'calc(var(--header-h, 72px) + 20px)' }}
                    >
                        <Card className="border-line bg-white p-6 shadow-soft">
                            <h3 className="mb-3 font-display text-base font-bold text-navy">
                                Pendaftaran Program
                            </h3>

                            {isRegistered ? (
                                <div className="rounded-control border border-success/30 bg-success/10 p-4 text-center">
                                    <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-success" />
                                    <p className="text-sm font-bold text-navy">
                                        Anda Telah Terdaftar
                                    </p>
                                    <p className="mt-1 text-xs leading-relaxed text-slate">
                                        Pendaftaran Anda telah tercatat. Tim pengurus NSA akan menghubungi Anda mengenai konfirmasi teknis pelaksanaan.
                                    </p>
                                </div>
                            ) : canRegister ? (
                                <div className="space-y-4">
                                    <p className="text-xs leading-relaxed text-slate">
                                        Sebagai anggota resmi NSA yang terverifikasi, Anda berhak mendaftar kegiatan ini secara langsung.
                                    </p>
                                    <form onSubmit={handleRegister}>
                                        <Button
                                            type="submit"
                                            size="md"
                                            fullWidth
                                            loading={registerForm.processing}
                                            disabled={registerForm.processing}
                                            className="font-semibold"
                                        >
                                            Daftar Program Sekarang
                                        </Button>
                                    </form>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <p className="text-xs leading-relaxed text-slate">
                                        Pendaftaran program kerja diutamakan bagi anggota resmi Nusantara Sustainable Aquatic.
                                    </p>
                                    <Button
                                        href="/akun/keanggotaan/daftar"
                                        size="sm"
                                        fullWidth
                                    >
                                        Gabung Jadi Anggota
                                    </Button>
                                    <Button
                                        href="/login"
                                        variant="secondary"
                                        size="sm"
                                        fullWidth
                                    >
                                        Masuk ke Akun
                                    </Button>
                                </div>
                            )}
                        </Card>

                        <Card className="space-y-3 border-line bg-white p-5 text-xs shadow-soft">
                            <h4 className="text-[11px] font-bold uppercase tracking-wider text-navy">
                                Ringkasan Jadwal &amp; Kategori
                            </h4>
                            <div className="divide-y divide-line pt-1">
                                <div className="flex justify-between py-2">
                                    <span className="text-slate">Kategori</span>
                                    <span className="font-semibold text-navy">
                                        {program.category_label}
                                    </span>
                                </div>
                                <div className="flex justify-between py-2">
                                    <span className="text-slate">Target Akses</span>
                                    <span className="font-semibold text-navy">
                                        {program.is_public ? 'Umum & Anggota' : 'Khusus Anggota'}
                                    </span>
                                </div>
                                {program.starts_at ? (
                                    <div className="flex justify-between py-2">
                                        <span className="text-slate">Mulai</span>
                                        <span className="font-semibold text-navy">
                                            {program.starts_at}
                                        </span>
                                    </div>
                                ) : null}
                            </div>
                        </Card>
                    </aside>
                </div>
            </Section>
        </PublicLayout>
    );
}
