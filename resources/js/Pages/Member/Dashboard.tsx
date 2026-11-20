import React from 'react';
import PortalLayout, { defaultMemberMenuItems } from '@/Layouts/PortalLayout';
import PageBanner from '@/Components/layout/PageBanner';
import Card from '@/Components/ui/Card';
import Button from '@/Components/ui/Button';
import { StatusBadge } from '@/Components/ui/Badge';
import { Link } from '@inertiajs/react';
import {
    Award,
    Calendar,
    CheckCircle2,
    Clock,
    Compass,
    CreditCard,
    ExternalLink,
    FileText,
    IdCard,
    Layers,
    Newspaper,
    Receipt,
    ShieldCheck,
    Store,
    Users,
} from 'lucide-react';

interface SummaryData {
    name: string;
    email: string;
    phone?: string;
    member_number?: string;
    membership_status: string;
    status_label: string;
    membership_type: string;
    approved_at: string;
    valid_until: string;
    enrolled_programs_count: number;
    enrolled_programs: Array<{
        id: number;
        program_id: number;
        title: string;
        slug: string;
        category: string;
        status: string;
        registered_at: string;
    }>;
    unpaid_invoices_count: number;
    unpaid_invoices_total: number;
    business_name?: string;
    province_name?: string;
    announcements: Array<{
        id: number;
        title: string;
        slug: string;
        excerpt?: string;
        cover_image?: string;
        date: string;
    }>;
}

interface MemberDashboardProps {
    summary: SummaryData;
    brand: {
        short_name: string;
        name: string;
    };
}

export default function MemberDashboard({ summary, brand }: MemberDashboardProps) {
    return (
        <PortalLayout
            title="Dashboard Anggota"
            areaLabel="PORTAL ANGGOTA"
            menuItems={defaultMemberMenuItems}
        >
            <div className="space-y-8">
                {/* 1. PageBanner */}
                <PageBanner
                    eyebrow="PORTAL ANGGOTA RESMI"
                    title={`Halo, ${summary.name}`}
                    subtitle={`Selamat datang di area khusus anggota resmi ${brand.name}. Akses dokumen legalitas, program kemitraan, kartu anggota, dan riwayat iuran Anda.`}
                    action={
                        <Link href="/anggota/kartu">
                            <Button
                                variant="secondary"
                                className="!bg-white !text-navy hover:!bg-white/90 font-display text-xs shadow-soft"
                            >
                                <IdCard className="mr-2 h-4 w-4 text-ocean" />
                                Buka KTA Digital
                            </Button>
                        </Link>
                    }
                />

                {/* 2. Empat Kartu Ringkasan (Summary Row) */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Status Keanggotaan */}
                    <Card className="p-5 border-line shadow-soft hover:border-ocean/40 transition-colors">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate">
                                Status Anggota
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Aktif
                            </span>
                        </div>
                        <p className="mt-3 text-lg font-display font-bold text-navy truncate">
                            {summary.membership_type}
                        </p>
                        <p className="text-xs font-mono text-ocean mt-0.5 font-semibold">
                            {summary.member_number || 'NSA-MEMBER'}
                        </p>
                    </Card>

                    {/* Masa Berlaku */}
                    <Card className="p-5 border-line shadow-soft hover:border-ocean/40 transition-colors">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate">
                                Masa Berlaku
                            </span>
                            <Calendar className="h-4 w-4 text-ocean" />
                        </div>
                        <p className="mt-3 text-lg font-display font-bold text-navy">
                            {summary.valid_until}
                        </p>
                        <p className="text-xs text-slate mt-0.5">
                            Sejak {summary.approved_at}
                        </p>
                    </Card>

                    {/* Program Diikuti */}
                    <Link href="/anggota/program" className="block group">
                        <Card className="p-5 border-line shadow-soft group-hover:border-ocean/40 transition-colors h-full">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold uppercase tracking-wider text-slate">
                                    Program NSA
                                </span>
                                <Compass className="h-4 w-4 text-ocean group-hover:rotate-45 transition-transform" />
                            </div>
                            <p className="mt-3 text-lg font-display font-bold text-navy">
                                {summary.enrolled_programs_count} Program
                            </p>
                            <p className="text-xs text-ocean font-medium mt-0.5">
                                Lihat daftar program →
                            </p>
                        </Card>
                    </Link>

                    {/* Tagihan Belum Dibayar */}
                    <Link href="/anggota/iuran" className="block group">
                        <Card className="p-5 border-line shadow-soft group-hover:border-ocean/40 transition-colors h-full">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold uppercase tracking-wider text-slate">
                                    Iuran & Tagihan
                                </span>
                                <Receipt className="h-4 w-4 text-ocean" />
                            </div>
                            <p className="mt-3 text-lg font-display font-bold text-navy">
                                {summary.unpaid_invoices_count > 0 ? (
                                    <span className="text-rose-600">
                                        Rp {summary.unpaid_invoices_total.toLocaleString('id-ID')}
                                    </span>
                                ) : (
                                    <span className="text-emerald-600">Lunas</span>
                                )}
                            </p>
                            <p className="text-xs text-slate mt-0.5">
                                {summary.unpaid_invoices_count > 0
                                    ? `${summary.unpaid_invoices_count} tagihan menunggu bayar`
                                    : 'Tidak ada tagihan tertunggak'}
                            </p>
                        </Card>
                    </Link>
                </div>

                {/* 3. Program yang Sedang Diikuti & Pengumuman Terbaru */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Program yang Diikuti */}
                    <Card className="p-6 border-line shadow-soft flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between pb-4 mb-4 border-b border-line">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-ocean/10 text-ocean flex items-center justify-center">
                                        <Compass className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h3 className="font-display text-base font-bold text-navy">
                                            Program yang Diikuti
                                        </h3>
                                        <p className="text-xs text-slate">
                                            Kegiatan pembinaan, sertifikasi, dan kemitraan aktif Anda.
                                        </p>
                                    </div>
                                </div>
                                <Link
                                    href="/anggota/program"
                                    className="text-xs font-semibold text-ocean hover:text-navy transition"
                                >
                                    Semua Program →
                                </Link>
                            </div>

                            {summary.enrolled_programs && summary.enrolled_programs.length > 0 ? (
                                <div className="space-y-3">
                                    {summary.enrolled_programs.map((prog) => (
                                        <div
                                            key={prog.id}
                                            className="p-3.5 rounded-xl border border-line bg-mist/30 flex items-center justify-between"
                                        >
                                            <div className="min-w-0 pr-3">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-ocean block mb-0.5">
                                                    {prog.category}
                                                </span>
                                                <h4 className="font-bold text-navy text-sm truncate">
                                                    {prog.title}
                                                </h4>
                                                <span className="text-[11px] text-slate">
                                                    Terdaftar sejak: {prog.registered_at}
                                                </span>
                                            </div>
                                            <span className="shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 capitalize">
                                                {prog.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <Compass className="h-10 w-10 text-slate/40 mx-auto mb-2" />
                                    <p className="text-sm font-semibold text-navy">Belum Mengikuti Program</p>
                                    <p className="text-xs text-slate mt-1 max-w-sm mx-auto">
                                        Ikuti berbagai pelatihan budidaya, sertifikasi mutu, dan perluasan jaringan pasar bersama NSA.
                                    </p>
                                    <Link href="/anggota/program" className="inline-block mt-4">
                                        <Button size="sm" variant="primary">
                                            Jelajahi Program NSA
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Pengumuman & Berita Terbaru Anggota */}
                    <Card className="p-6 border-line shadow-soft flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between pb-4 mb-4 border-b border-line">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-ocean/10 text-ocean flex items-center justify-center">
                                        <Newspaper className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h3 className="font-display text-base font-bold text-navy">
                                            Pengumuman & Warta NSA
                                        </h3>
                                        <p className="text-xs text-slate">
                                            Informasi resmi dan kabar terbaru perikanan akuakultur.
                                        </p>
                                    </div>
                                </div>
                                <Link
                                    href="/berita"
                                    className="text-xs font-semibold text-ocean hover:text-navy transition"
                                >
                                    Lihat Berita →
                                </Link>
                            </div>

                            {summary.announcements && summary.announcements.length > 0 ? (
                                <div className="space-y-3">
                                    {summary.announcements.map((post) => (
                                        <Link
                                            key={post.id}
                                            href={`/berita/${post.slug}`}
                                            className="p-3 rounded-xl border border-line bg-white hover:bg-mist/50 transition flex items-center gap-3 block"
                                        >
                                            <div className="min-w-0 flex-1">
                                                <h4 className="font-bold text-navy text-sm truncate hover:text-ocean transition">
                                                    {post.title}
                                                </h4>
                                                <span className="text-[11px] text-slate mt-0.5 block">
                                                    {post.date}
                                                </span>
                                            </div>
                                            <ExternalLink className="h-4 w-4 text-slate shrink-0" />
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <Newspaper className="h-10 w-10 text-slate/40 mx-auto mb-2" />
                                    <p className="text-sm font-semibold text-navy">Belum Ada Pengumuman Baru</p>
                                    <p className="text-xs text-slate mt-1">
                                        Pemberitahuan resmi asosiasi akan ditampilkan di sini.
                                    </p>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </PortalLayout>
    );
}
