import React from 'react';
import PortalLayout, { defaultMemberMenuItems } from '@/Layouts/PortalLayout';
import PageBanner from '@/Components/layout/PageBanner';
import Card from '@/Components/ui/Card';
import Button from '@/Components/ui/Button';
import { router, Link } from '@inertiajs/react';
import {
    Calendar,
    CheckCircle2,
    Compass,
    Sparkles,
    Tag,
    XCircle,
} from 'lucide-react';

interface ProgramItem {
    id: number;
    title: string;
    slug: string;
    category: string;
    category_label: string;
    summary: string | null;
    cover_url: string | null;
    starts_at: string | null;
    ends_at: string | null;
    is_enrolled: boolean;
    registration_status: string | null;
    matches_interest: boolean;
}

interface RegistrationItem {
    id: number;
    program_id: number;
    title: string;
    slug: string;
    category: string;
    status: string;
    note: string | null;
    registered_at: string;
}

interface ProgramProps {
    programs: ProgramItem[];
    myRegistrations: RegistrationItem[];
    userInterests: string[];
    selectedCategory: string;
    categories: Array<{ value: string; label: string }>;
}

export default function MemberPrograms({
    programs,
    myRegistrations,
    userInterests,
    selectedCategory,
    categories,
}: ProgramProps) {
    const handleFilterCategory = (categoryVal: string) => {
        router.get(
            '/anggota/program',
            { category: categoryVal || undefined },
            { preserveState: true }
        );
    };

    const handleRegister = (id: number) => {
        router.post(`/anggota/program/${id}/daftar`);
    };

    const handleCancel = (id: number, title: string) => {
        if (confirm(`Yakin ingin membatalkan keikutsertaan dalam program "${title}"?`)) {
            router.delete(`/anggota/program/${id}/batal`);
        }
    };

    return (
        <PortalLayout
            title="Program NSA"
            areaLabel="PORTAL ANGGOTA"
            menuItems={defaultMemberMenuItems}
        >
            <div className="space-y-8">
                {/* Banner */}
                <PageBanner
                    eyebrow="PROGRAM KERJA NSA"
                    title="Program Pendampingan, Pelatihan & Kemitraan"
                    subtitle="Pilih dan ikuti program resmi organisasi yang dirancang untuk meningkatkan produktivitas, standar budidaya, dan daya saing usaha akuakultur Anda."
                />

                {/* Riwayat Program yang Sedang Diikuti */}
                {myRegistrations && myRegistrations.length > 0 && (
                    <Card className="p-6 border-ocean/30 bg-ocean/5 shadow-soft">
                        <div className="flex items-center gap-2.5 pb-3 mb-3 border-b border-ocean/20">
                            <CheckCircle2 className="w-5 h-5 text-ocean" />
                            <h3 className="font-display text-base font-bold text-navy">
                                Program yang Anda Ikuti ({myRegistrations.length})
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {myRegistrations.map((reg) => (
                                <div key={reg.id} className="p-4 rounded-xl bg-white border border-line shadow-xs flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-ocean">
                                                {reg.category}
                                            </span>
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 capitalize">
                                                {reg.status}
                                            </span>
                                        </div>
                                        <h4 className="font-bold text-navy text-sm">
                                            {reg.title}
                                        </h4>
                                        <span className="text-[11px] text-slate block mt-1">
                                            Terdaftar sejak: {reg.registered_at}
                                        </span>
                                    </div>

                                    <div className="mt-3 pt-2 border-t border-line/60 flex items-center justify-between">
                                        <Link
                                            href={`/program/${reg.slug}`}
                                            className="text-xs font-semibold text-ocean hover:text-navy"
                                        >
                                            Detail Program →
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() => handleCancel(reg.program_id, reg.title)}
                                            className="text-xs text-slate hover:text-danger"
                                        >
                                            Batal
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}

                {/* Filter Kategori Program */}
                <div className="flex flex-wrap items-center gap-2 border-b border-line pb-4">
                    <button
                        type="button"
                        onClick={() => handleFilterCategory('')}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                            !selectedCategory
                                ? 'bg-navy text-white shadow-soft'
                                : 'bg-white text-slate hover:text-navy border border-line'
                        }`}
                    >
                        Semua Kategori
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat.value}
                            type="button"
                            onClick={() => handleFilterCategory(cat.value)}
                            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                                selectedCategory === cat.value
                                    ? 'bg-navy text-white shadow-soft'
                                    : 'bg-white text-slate hover:text-navy border border-line'
                            }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* Grid Daftar Program */}
                {programs && programs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {programs.map((program) => (
                            <Card
                                key={program.id}
                                className={`flex flex-col justify-between overflow-hidden border transition-all hover:shadow-soft ${
                                    program.matches_interest
                                        ? 'border-ocean ring-2 ring-ocean/20'
                                        : 'border-line'
                                }`}
                            >
                                <div>
                                    {/* Cover image or placeholder */}
                                    <div className="h-44 bg-mist/60 relative overflow-hidden">
                                        {program.cover_url ? (
                                            <img
                                                src={program.cover_url}
                                                alt={program.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full grid place-items-center bg-gradient-to-br from-navy/10 to-ocean/20 text-ocean">
                                                <Compass className="w-12 h-12" />
                                            </div>
                                        )}

                                        {/* Match interest badge */}
                                        {program.matches_interest && (
                                            <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-navy/90 backdrop-blur-sm text-white text-[11px] font-bold shadow-soft">
                                                <Sparkles className="w-3.5 h-3.5 text-aqua" />
                                                Sesuai Minat Anda
                                            </div>
                                        )}

                                        <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-xs text-[10px] font-bold uppercase tracking-wider text-navy">
                                            {program.category_label}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-5">
                                        <h3 className="font-display font-bold text-navy text-base leading-snug">
                                            {program.title}
                                        </h3>
                                        {program.starts_at && (
                                            <p className="text-xs text-slate mt-1.5 flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5 text-ocean" />
                                                Pelaksanaan: {program.starts_at} {program.ends_at ? `– ${program.ends_at}` : ''}
                                            </p>
                                        )}
                                        <p className="text-xs text-slate mt-2 line-clamp-3 leading-relaxed">
                                            {program.summary || 'Program pembinaan resmi bagi anggota terdaftar Nusantara Sustainable Aquatic.'}
                                        </p>
                                    </div>
                                </div>

                                {/* Card Footer Actions */}
                                <div className="p-5 pt-0 border-t border-line/40 flex items-center justify-between mt-auto">
                                    <Link
                                        href={`/program/${program.slug}`}
                                        className="text-xs font-semibold text-ocean hover:text-navy transition"
                                    >
                                        Lihat Detail
                                    </Link>

                                    {program.is_enrolled ? (
                                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                                            ✓ Terdaftar
                                        </span>
                                    ) : (
                                        <Button
                                            size="sm"
                                            variant="primary"
                                            onClick={() => handleRegister(program.id)}
                                        >
                                            Daftar Program
                                        </Button>
                                    )}
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="p-12 text-center bg-white rounded-2xl border border-line">
                        <Compass className="w-12 h-12 text-slate/40 mx-auto mb-3" />
                        <h4 className="font-display font-bold text-navy text-base">Tidak Ada Program Ditemukan</h4>
                        <p className="text-xs text-slate mt-1 max-w-sm mx-auto">
                            Belum ada program kerja yang tersedia untuk kategori yang dipilih saat ini.
                        </p>
                    </div>
                )}
            </div>
        </PortalLayout>
    );
}
