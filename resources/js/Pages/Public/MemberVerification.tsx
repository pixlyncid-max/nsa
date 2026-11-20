import React from 'react';
import PublicLayout from '@/Layouts/PublicLayout';
import Card from '@/Components/ui/Card';
import ContourPattern from '@/Components/motion/ContourPattern';
import {
    CheckCircle2,
    ShieldAlert,
    ShieldCheck,
} from 'lucide-react';
import { Head, Link } from '@inertiajs/react';

interface VerificationProps {
    isValid: boolean;
    token: string;
    member: {
        name: string;
        member_number: string;
        membership_type: string;
        status: string;
        status_label: string;
        valid_until: string;
    } | null;
    brand: {
        name: string;
        short_name: string;
        tagline?: string;
    };
}

export default function MemberVerification({
    isValid,
    token,
    member,
    brand,
}: VerificationProps) {
    return (
        <PublicLayout>
            <Head title={`Verifikasi Anggota Resmi — ${brand.short_name}`} />

            <section className="py-16 md:py-24 bg-mist/40 min-h-[75vh] flex items-center justify-center">
                <div className="container max-w-xl mx-auto px-4">
                    {isValid && member ? (
                        <Card className="overflow-hidden border-ocean/30 shadow-lift bg-white rounded-2xl">
                            {/* Header Verifikasi Sukses */}
                            <div className="relative bg-navy p-6 sm:p-8 text-white text-center">
                                <ContourPattern
                                    tone="aqua"
                                    opacity={0.18}
                                    seed={4}
                                    rings={10}
                                    animate={false}
                                    className="absolute inset-0 pointer-events-none"
                                />

                                <div className="relative z-10 flex flex-col items-center">
                                    <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 grid place-items-center mb-3">
                                        <ShieldCheck className="w-9 h-9 text-aqua" />
                                    </div>
                                    <span className="text-xs uppercase tracking-widest font-extrabold text-aqua">
                                        VERIFIKASI RESMI {brand.short_name}
                                    </span>
                                    <h1 className="font-display text-2xl font-bold text-white mt-1">
                                        Anggota Sah Terverifikasi
                                    </h1>
                                    <p className="text-xs text-white/80 mt-1 max-w-sm">
                                        Identitas keanggotaan ini terdaftar aktif dan diakui secara sah dalam database {brand.name}.
                                    </p>
                                </div>
                            </div>

                            {/* Data Publik Anggota (Tanpa Data Pribadi: NIK/Email/HP Dilarang Tampil) */}
                            <div className="p-6 sm:p-8 space-y-4">
                                <div className="p-4 rounded-xl bg-mist/40 border border-line flex items-center justify-between">
                                    <span className="text-xs font-semibold text-slate uppercase tracking-wider">
                                        Status Keanggotaan
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        {member.status} ({member.status_label})
                                    </span>
                                </div>

                                <div className="space-y-3 divide-y divide-line text-sm">
                                    <div className="pt-2 flex justify-between items-center">
                                        <span className="text-xs text-slate">Nama Anggota</span>
                                        <span className="font-display font-bold text-navy text-base">
                                            {member.name}
                                        </span>
                                    </div>
                                    <div className="pt-3 flex justify-between items-center">
                                        <span className="text-xs text-slate">Nomor Tanda Anggota (NTA)</span>
                                        <span className="font-mono font-bold text-ocean text-base">
                                            {member.member_number}
                                        </span>
                                    </div>
                                    <div className="pt-3 flex justify-between items-center">
                                        <span className="text-xs text-slate">Jenis Keanggotaan</span>
                                        <span className="font-semibold text-navy">
                                            {member.membership_type}
                                        </span>
                                    </div>
                                    <div className="pt-3 flex justify-between items-center">
                                        <span className="text-xs text-slate">Masa Berlaku KTA</span>
                                        <span className="font-semibold text-navy">
                                            Hingga {member.valid_until}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-6 pt-4 border-t border-line text-center">
                                    <p className="text-[11px] text-slate">
                                        Dokumen verifikasi ini diterbitkan secara otomatis oleh sistem informasi {brand.name}.
                                    </p>
                                </div>
                            </div>
                        </Card>
                    ) : (
                        <Card className="p-8 border-rose-200 bg-white text-center shadow-xl rounded-2xl">
                            <div className="w-16 h-16 rounded-2xl bg-rose-50 text-danger grid place-items-center mx-auto mb-4 border border-rose-100">
                                <ShieldAlert className="w-9 h-9" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider text-danger">
                                VERIFIKASI TIDAK DITEMUKAN
                            </span>
                            <h2 className="font-display text-xl font-bold text-navy mt-1">
                                Identitas Anggota Tidak Valid
                            </h2>
                            <p className="text-xs text-slate mt-2 max-w-sm mx-auto leading-relaxed">
                                Kode verifikasi atau nomor anggota <code className="font-mono text-ink bg-mist px-1.5 py-0.5 rounded">{token}</code> tidak terdaftar atau belum disetujui dalam basis data {brand.name}.
                            </p>
                            <div className="mt-6">
                                <Link
                                    href="/"
                                    className="inline-flex items-center gap-2 text-xs font-bold text-ocean hover:text-navy underline"
                                >
                                    Kembali ke Beranda Utama
                                </Link>
                            </div>
                        </Card>
                    )}
                </div>
            </section>
        </PublicLayout>
    );
}
