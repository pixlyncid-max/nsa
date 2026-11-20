import PageBanner from '@/Components/layout/PageBanner';
import Badge, { StatusBadge } from '@/Components/ui/Badge';
import Button from '@/Components/ui/Button';
import Card from '@/Components/ui/Card';
import PortalLayout from '@/Layouts/PortalLayout';
import type { PageProps } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowRight,
    CheckCircle2,
    Clock,
    CreditCard,
    ExternalLink,
    FileEdit,
    HelpCircle,
    IdCard,
    Mail,
    Package,
    Phone,
    ShieldAlert,
    ShoppingBag,
    ShoppingCart,
    Sparkles,
} from 'lucide-react';

interface RecentOrderItem {
    id: number;
    code: string;
    status: string;
    status_label: string;
    total: number;
    items_count: number;
    first_item_name: string;
    created_at: string;
    payment_status: string;
}

interface MembershipData {
    status: string;
    status_label: string;
    status_color: string;
    member_number?: string | null;
    completed_steps_count: number;
    total_steps: number;
    review_note?: string | null;
    submitted_at?: string | null;
}

interface BrandSupportData {
    phone: string;
    email: string;
    name: string;
    short_name: string;
}

interface DashboardProps {
    membership: MembershipData;
    recentOrders: RecentOrderItem[];
    cartCount: number;
    brandSupport: BrandSupportData;
}

function formatRupiah(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

export default function AccountDashboard({
    membership,
    recentOrders = [],
    cartCount = 0,
    brandSupport,
}: DashboardProps) {
    const user = usePage<PageProps>().props.auth.user;
    const status = membership?.status || user?.membership_status || 'non_member';
    const totalSteps = membership?.total_steps || 9;
    const completedCount = membership?.completed_steps_count || 0;
    const progressPercent = Math.min(
        100,
        Math.round((completedCount / totalSteps) * 100)
    );

    // Subtitle banner dinamis
    const getBannerSubtitle = () => {
        switch (status) {
            case 'approved':
                return 'Keanggotaan Anda telah aktif. Akses direktori jaringan, program kerja, dan layanan resmi organisasi NSA.';
            case 'draft':
                return 'Lanjutkan formulir pendaftaran keanggotaan Anda untuk menyelesaikan proses registrasi resmi.';
            case 'pending_review':
            case 'pending_approval':
                return 'Pengajuan keanggotaan Anda sedang dalam proses peninjauan pengurus. Pantau tahapan administrasi di sini.';
            case 'awaiting_payment':
                return 'Verifikasi awal telah disetujui. Selesaikan pembayaran biaya keanggotaan Anda untuk aktivasi.';
            case 'revision':
                return 'Pengurus meminta perbaikan data atau berkas pendaftaran. Silakan periksa catatan dan perbarui.';
            case 'rejected':
                return 'Pengajuan keanggotaan Anda belum dapat disetujui. Silakan hubungi layanan bantuan kami.';
            default:
                return 'Kelola akun pengguna, pantau transaksi pesanan belanja kebutuhan akuakultur, dan bergabunglah menjadi anggota resmi NSA.';
        }
    };

    return (
        <PortalLayout title="Dashboard Akun">
            {/* 1. Banner Judul Bergradien Biru Tua */}
            <PageBanner
                eyebrow="AREA AKUN PENGGUNA"
                title={`Selamat datang, ${user?.name || 'Pengguna'}`}
                subtitle={getBannerSubtitle()}
                action={
                    status === 'approved' ? (
                        <Button
                            href="/anggota"
                            size="md"
                            className="!bg-aqua !text-navy hover:!bg-white font-semibold shadow-soft"
                        >
                            Buka Portal Anggota
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    ) : status === 'non_member' ? (
                        <Button
                            href="/akun/keanggotaan/daftar"
                            size="md"
                            className="!bg-aqua !text-navy hover:!bg-white font-semibold shadow-soft"
                        >
                            Gabung Jadi Anggota
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    ) : null
                }
            />

            {/* 2. Kartu Status Keanggotaan Sesuai MembershipStatus */}
            <Card className="p-5 md:p-7 border-line shadow-soft">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-4">
                    <div className="flex items-center gap-2.5">
                        <div className="grid h-9 w-9 place-items-center rounded-control bg-ocean/10 text-ocean">
                            <IdCard className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="font-display text-lg font-bold text-navy">
                                Status Keanggotaan
                            </h2>
                            <p className="text-xs text-slate">
                                Program Keanggotaan Resmi Nusantara Sustainable Aquatic
                            </p>
                        </div>
                    </div>
                    <div>
                        <StatusBadge status={status} />
                    </div>
                </div>

                <div className="mt-5">
                    {/* KASUS A: NON-MEMBER */}
                    {status === 'non_member' && (
                        <div className="space-y-4">
                            <div className="rounded-control bg-mist/60 border border-line p-4 md:p-5">
                                <h3 className="font-display text-base font-bold text-navy">
                                    Belum Terdaftar Sebagai Anggota NSA
                                </h3>
                                <p className="mt-1.5 text-xs md:text-sm text-slate leading-relaxed">
                                    Daftarkan diri atau badan usaha Anda untuk bergabung bersama ribuan pembudidaya, pembenih, dan pelaku usaha perikanan di seluruh Nusantara. Dapatkan akses program pelatihan, sertifikasi budidaya, konsultasi legalitas usaha, dan direktori kemitraan strategis.
                                </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 pt-1">
                                <Button
                                    href="/akun/keanggotaan/daftar"
                                    size="md"
                                >
                                    Gabung Jadi Anggota
                                    <ArrowRight className="h-4 w-4 ml-1.5" />
                                </Button>
                                <Button
                                    href="/tentang-kami"
                                    variant="secondary"
                                    size="md"
                                >
                                    Pelajari Manfaat Anggota
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* KASUS B: DRAFT */}
                    {status === 'draft' && (
                        <div className="space-y-4">
                            <div className="rounded-control bg-sky/10 border border-sky/30 p-4 md:p-5">
                                <div className="flex items-center justify-between gap-2">
                                    <h3 className="font-display text-base font-bold text-navy">
                                        Pendaftaran Belum Selesai
                                    </h3>
                                    <span className="text-xs font-bold text-ocean">
                                        {completedCount} dari {totalSteps} langkah ({progressPercent}%)
                                    </span>
                                </div>
                                <p className="mt-1.5 text-xs md:text-sm text-slate leading-relaxed">
                                    Formulir pendaftaran keanggotaan Anda tersimpan sebagai draf. Lanjutkan pengisian data identitas, usaha perikanan, dan dokumen pendukung untuk menyelesaikan pendaftaran.
                                </p>

                                {/* Progress Bar */}
                                <div className="mt-4">
                                    <div className="h-2.5 w-full rounded-full bg-slate-200/80 overflow-hidden">
                                        <div
                                            className="h-full bg-ocean rounded-full transition-all duration-500 ease-out"
                                            style={{ width: `${Math.max(5, progressPercent)}%` }}
                                        />
                                    </div>
                                    <p className="mt-1.5 text-[11px] text-slate font-medium">
                                        Langkah terselesaikan: {completedCount} dari {totalSteps} langkah
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 pt-1">
                                <Button
                                    href="/akun/keanggotaan/daftar"
                                    size="md"
                                >
                                    Lanjutkan Pendaftaran
                                    <ArrowRight className="h-4 w-4 ml-1.5" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* KASUS C: PENDING_REVIEW (Menunggu Verifikasi Awal) */}
                    {(status === 'pending_review' || status === 'pending') && (
                        <div className="space-y-4">
                            <div className="rounded-control bg-warning/10 border border-warning/30 p-4 md:p-5">
                                <div className="flex items-center gap-2 text-warning">
                                    <Clock className="h-5 w-5 shrink-0" />
                                    <h3 className="font-display text-base font-bold text-ink">
                                        Berkas Sedang Diverifikasi Pengurus
                                    </h3>
                                </div>
                                <p className="mt-2 text-xs md:text-sm text-slate leading-relaxed">
                                    Formulir pendaftaran Anda telah berhasil diajukan{membership.submitted_at ? ` pada ${membership.submitted_at}` : ''}. Saat ini tim verifikasi NSA sedang memeriksa keabsahan data dan berkas administrasi Anda.
                                </p>

                                {/* Garis Waktu Singkat 4 Langkah */}
                                <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-warning/20">
                                    <div className="flex flex-col gap-1 text-center sm:text-left">
                                        <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-bold text-success">
                                            <CheckCircle2 className="h-4 w-4" /> 1. Pengajuan
                                        </div>
                                        <span className="text-[11px] text-slate">Selesai terkirim</span>
                                    </div>
                                    <div className="flex flex-col gap-1 text-center sm:text-left">
                                        <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-bold text-warning">
                                            <Clock className="h-4 w-4 animate-spin" /> 2. Verifikasi Awal
                                        </div>
                                        <span className="text-[11px] text-slate font-semibold">Sedang berjalan</span>
                                    </div>
                                    <div className="flex flex-col gap-1 text-center sm:text-left opacity-50">
                                        <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-semibold text-slate">
                                            3. Pembayaran
                                        </div>
                                        <span className="text-[11px] text-slate">Menunggu</span>
                                    </div>
                                    <div className="flex flex-col gap-1 text-center sm:text-left opacity-50">
                                        <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-semibold text-slate">
                                            4. Persetujuan
                                        </div>
                                        <span className="text-[11px] text-slate">Menunggu</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 pt-1">
                                <Button
                                    href="/akun/keanggotaan/status"
                                    variant="secondary"
                                    size="md"
                                >
                                    Lihat Detail Pengajuan
                                    <ArrowRight className="h-4 w-4 ml-1.5" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* KASUS D: AWAITING_PAYMENT (Menunggu Pembayaran) */}
                    {status === 'awaiting_payment' && (
                        <div className="space-y-4">
                            <div className="rounded-control bg-warning/10 border border-warning/40 p-4 md:p-5">
                                <div className="flex items-center gap-2 text-warning">
                                    <CreditCard className="h-5 w-5 shrink-0" />
                                    <h3 className="font-display text-base font-bold text-ink">
                                        Verifikasi Awal Disetujui — Silakan Bayar Iuran
                                    </h3>
                                </div>
                                <p className="mt-2 text-xs md:text-sm text-slate leading-relaxed">
                                    Selamat! Berkas administrasi pendaftaran Anda telah disetujui dalam tahap verifikasi awal. Silakan lakukan pembayaran biaya keanggotaan dan konfirmasi bukti transfer agar nomor anggota resmi dapat diterbitkan.
                                </p>

                                {/* Garis Waktu Singkat 4 Langkah */}
                                <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-warning/20">
                                    <div className="flex flex-col gap-1 text-center sm:text-left">
                                        <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-bold text-success">
                                            <CheckCircle2 className="h-4 w-4" /> 1. Pengajuan
                                        </div>
                                        <span className="text-[11px] text-slate">Selesai</span>
                                    </div>
                                    <div className="flex flex-col gap-1 text-center sm:text-left">
                                        <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-bold text-success">
                                            <CheckCircle2 className="h-4 w-4" /> 2. Verifikasi Awal
                                        </div>
                                        <span className="text-[11px] text-slate">Disetujui</span>
                                    </div>
                                    <div className="flex flex-col gap-1 text-center sm:text-left">
                                        <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-bold text-warning">
                                            <CreditCard className="h-4 w-4" /> 3. Pembayaran
                                        </div>
                                        <span className="text-[11px] text-slate font-semibold">Bayar sekarang</span>
                                    </div>
                                    <div className="flex flex-col gap-1 text-center sm:text-left opacity-50">
                                        <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-semibold text-slate">
                                            4. Persetujuan
                                        </div>
                                        <span className="text-[11px] text-slate">Menunggu</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 pt-1">
                                <Button
                                    href="/akun/keanggotaan/status"
                                    size="md"
                                    className="!bg-warning !text-navy hover:!bg-warning/90 font-semibold"
                                >
                                    Bayar Sekarang
                                    <ArrowRight className="h-4 w-4 ml-1.5" />
                                </Button>
                                <Button
                                    href="/akun/keanggotaan/status"
                                    variant="secondary"
                                    size="md"
                                >
                                    Rincian Tagihan
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* KASUS E: PENDING_APPROVAL (Menunggu Persetujuan Akhir) */}
                    {status === 'pending_approval' && (
                        <div className="space-y-4">
                            <div className="rounded-control bg-ocean/10 border border-ocean/30 p-4 md:p-5">
                                <div className="flex items-center gap-2 text-ocean">
                                    <Clock className="h-5 w-5 shrink-0" />
                                    <h3 className="font-display text-base font-bold text-navy">
                                        Pembayaran Diterima — Menunggu Persetujuan Akhir
                                    </h3>
                                </div>
                                <p className="mt-2 text-xs md:text-sm text-slate leading-relaxed">
                                    Bukti pembayaran iuran keanggotaan Anda telah berhasil dikonfirmasi. Saat ini pendaftaran Anda menunggu persetujuan dan pengesahan akhir oleh Ketua Umum dan Sekretariat Jenderal NSA.
                                </p>

                                {/* Garis Waktu Singkat 4 Langkah */}
                                <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-ocean/20">
                                    <div className="flex flex-col gap-1 text-center sm:text-left">
                                        <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-bold text-success">
                                            <CheckCircle2 className="h-4 w-4" /> 1. Pengajuan
                                        </div>
                                        <span className="text-[11px] text-slate">Selesai</span>
                                    </div>
                                    <div className="flex flex-col gap-1 text-center sm:text-left">
                                        <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-bold text-success">
                                            <CheckCircle2 className="h-4 w-4" /> 2. Verifikasi Awal
                                        </div>
                                        <span className="text-[11px] text-slate">Disetujui</span>
                                    </div>
                                    <div className="flex flex-col gap-1 text-center sm:text-left">
                                        <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-bold text-success">
                                            <CheckCircle2 className="h-4 w-4" /> 3. Pembayaran
                                        </div>
                                        <span className="text-[11px] text-slate">Dikonfirmasi</span>
                                    </div>
                                    <div className="flex flex-col gap-1 text-center sm:text-left">
                                        <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-bold text-ocean">
                                            <Clock className="h-4 w-4 animate-spin" /> 4. Persetujuan
                                        </div>
                                        <span className="text-[11px] text-slate font-semibold">Proses akhir</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 pt-1">
                                <Button
                                    href="/akun/keanggotaan/status"
                                    variant="secondary"
                                    size="md"
                                >
                                    Pantau Status Pendaftaran
                                    <ArrowRight className="h-4 w-4 ml-1.5" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* KASUS F: REVISION (Perlu Perbaikan Data) */}
                    {status === 'revision' && (
                        <div className="space-y-4">
                            <div className="rounded-control bg-amber-500/10 border border-amber-500/40 p-4 md:p-5">
                                <div className="flex items-center gap-2 text-amber-700">
                                    <AlertCircle className="h-5 w-5 shrink-0" />
                                    <h3 className="font-display text-base font-bold text-ink">
                                        Perlu Perbaikan Data Pendaftaran
                                    </h3>
                                </div>
                                <p className="mt-2 text-xs md:text-sm text-slate leading-relaxed">
                                    Tim verifikasi pengurus NSA menemukan data atau dokumen yang belum sesuai. Mohon periksa catatan koreksi di bawah ini dan perbarui data Anda sesegera mungkin.
                                </p>

                                {membership.review_note ? (
                                    <div className="mt-3 rounded-control bg-white p-3.5 border border-amber-200 text-xs md:text-sm text-ink font-medium">
                                        <span className="font-bold text-amber-800 block mb-1">
                                            Catatan Pengurus:
                                        </span>
                                        {membership.review_note}
                                    </div>
                                ) : null}
                            </div>

                            <div className="flex flex-wrap items-center gap-3 pt-1">
                                <Button
                                    href="/akun/keanggotaan/status"
                                    size="md"
                                    className="!bg-warning !text-navy hover:!bg-warning/90 font-semibold"
                                >
                                    Perbaiki Data
                                    <ArrowRight className="h-4 w-4 ml-1.5" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* KASUS G: REJECTED (Ditolak) */}
                    {status === 'rejected' && (
                        <div className="space-y-4">
                            <div className="rounded-control bg-danger/10 border border-danger/30 p-4 md:p-5">
                                <div className="flex items-center gap-2 text-danger">
                                    <ShieldAlert className="h-5 w-5 shrink-0" />
                                    <h3 className="font-display text-base font-bold text-ink">
                                        Pengajuan Keanggotaan Ditolak
                                    </h3>
                                </div>
                                <p className="mt-2 text-xs md:text-sm text-slate leading-relaxed">
                                    Mohon maaf, pengajuan pendaftaran keanggotaan Anda belum dapat disetujui oleh pengurus NSA. Anda dapat membaca rincian alasan penolakan atau menghubungi tim sekretariat kami.
                                </p>

                                {membership.review_note ? (
                                    <div className="mt-3 rounded-control bg-white p-3.5 border border-danger/20 text-xs md:text-sm text-ink">
                                        <span className="font-bold text-danger block mb-1">
                                            Alasan Penolakan:
                                        </span>
                                        {membership.review_note}
                                    </div>
                                ) : null}
                            </div>

                            <div className="flex flex-wrap items-center gap-3 pt-1">
                                <Button
                                    href="/kontak"
                                    variant="secondary"
                                    size="md"
                                >
                                    Hubungi Sekretariat NSA
                                    <ExternalLink className="h-4 w-4 ml-1.5" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* KASUS H: APPROVED (Disetujui) */}
                    {status === 'approved' && (
                        <div className="space-y-4">
                            <div className="rounded-control bg-success/10 border border-success/30 p-4 md:p-5">
                                <div className="flex items-center gap-2 text-success">
                                    <CheckCircle2 className="h-5 w-5 shrink-0" />
                                    <h3 className="font-display text-base font-bold text-navy">
                                        Selamat! Anda Adalah Anggota Resmi NSA
                                    </h3>
                                </div>
                                <p className="mt-2 text-xs md:text-sm text-slate leading-relaxed">
                                    Keanggotaan Anda telah disahkan. Anda berhak mendapatkan akses penuh ke Portal Anggota resmi, direktori anggota nasional, forum jejaring, dan program pembinaan.
                                </p>

                                {membership.member_number ? (
                                    <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 border border-success/30 text-xs font-bold text-navy shadow-2xs">
                                        <span>Nomor Anggota (NTA):</span>
                                        <span className="font-mono text-ocean">
                                            {membership.member_number}
                                        </span>
                                    </div>
                                ) : null}
                            </div>

                            <div className="flex flex-wrap items-center gap-3 pt-1">
                                <Button
                                    href="/anggota"
                                    size="md"
                                    className="!bg-ocean !text-white hover:!bg-navy font-semibold"
                                >
                                    Buka Portal Anggota
                                    <ArrowRight className="h-4 w-4 ml-1.5" />
                                </Button>
                                <Button
                                    href="/akun/keanggotaan/status"
                                    variant="secondary"
                                    size="md"
                                >
                                    Lihat Arsip Berkas
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </Card>

            {/* Baris Kolom Bawah: Pesanan Terakhir & Kartu Butuh Bantuan */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* 3. Kartu Pesanan Terakhir (2 Kolom di Desktop) */}
                <Card className="p-5 md:p-6 lg:col-span-2 border-line shadow-soft flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between border-b border-line pb-4">
                            <div className="flex items-center gap-2.5">
                                <div className="grid h-9 w-9 place-items-center rounded-control bg-ocean/10 text-ocean">
                                    <Package className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-display text-base font-bold text-navy">
                                        Pesanan Terakhir
                                    </h3>
                                    <p className="text-xs text-slate">
                                        Riwayat transaksi belanja produk toko NSA Anda
                                    </p>
                                </div>
                            </div>

                            <Link
                                href="/akun/pesanan"
                                className="text-xs font-semibold text-ocean hover:text-navy hover:underline inline-flex items-center gap-1"
                            >
                                Lihat Semua
                                <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                        </div>

                        {/* Callout Ringkasan Keranjang */}
                        {cartCount > 0 ? (
                            <div className="mt-4 flex items-center justify-between rounded-control bg-aqua/15 border border-aqua/30 p-3 text-xs md:text-sm">
                                <div className="flex items-center gap-2 text-navy font-medium">
                                    <ShoppingCart className="h-4 w-4 text-ocean shrink-0" />
                                    <span>
                                        Ada <strong>{cartCount} produk</strong> tersimpan di keranjang belanja Anda.
                                    </span>
                                </div>
                                <Link
                                    href="/keranjang"
                                    className="font-bold text-ocean hover:underline shrink-0 text-xs"
                                >
                                    Buka Keranjang &rarr;
                                </Link>
                            </div>
                        ) : null}

                        {/* Daftar 3 Pesanan Terbaru */}
                        <div className="mt-4">
                            {recentOrders.length > 0 ? (
                                <div className="divide-y divide-line">
                                    {recentOrders.map((order) => (
                                        <div
                                            key={order.id}
                                            className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                                        >
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-xs font-bold text-navy">
                                                        {order.code}
                                                    </span>
                                                    <StatusBadge status={order.status} />
                                                </div>
                                                <p className="mt-1 text-xs text-slate truncate">
                                                    {order.first_item_name}
                                                    {order.items_count > 1 ? ` (+${order.items_count - 1} produk lainnya)` : ''}
                                                </p>
                                                <span className="text-[11px] text-slate/75">
                                                    {order.created_at}
                                                </span>
                                            </div>

                                            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1 shrink-0">
                                                <span className="font-display text-sm font-bold text-navy">
                                                    {formatRupiah(order.total)}
                                                </span>
                                                <Link
                                                    href={`/akun/pesanan/${order.code}`}
                                                    className="text-xs font-semibold text-ocean hover:underline inline-flex items-center gap-1"
                                                >
                                                    Detail Pesanan
                                                    <ArrowRight className="h-3 w-3" />
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                /* Keadaan Kosong (Empty State) */
                                <div className="py-8 text-center">
                                    <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-mist text-slate">
                                        <ShoppingBag className="h-6 w-6" />
                                    </div>
                                    <h4 className="mt-3 font-display text-sm font-bold text-navy">
                                        Belum Ada Riwayat Pesanan
                                    </h4>
                                    <p className="mt-1 text-xs text-slate max-w-sm mx-auto leading-relaxed">
                                        Anda belum pernah melakukan pembelian produk budidaya atau sarana akuakultur di toko NSA.
                                    </p>
                                    <div className="mt-4">
                                        <Button href="/produk" size="sm">
                                            <ShoppingBag className="h-3.5 w-3.5 mr-1.5" />
                                            Jelajahi Produk Toko
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {recentOrders.length > 0 ? (
                        <div className="mt-4 pt-3 border-t border-line text-right">
                            <Button
                                href="/produk"
                                variant="secondary"
                                size="sm"
                            >
                                <ShoppingBag className="h-3.5 w-3.5 mr-1.5" />
                                Belanja Produk Baru
                            </Button>
                        </div>
                    ) : null}
                </Card>

                {/* 4. Kartu "Butuh Bantuan?" Memakai Kontak dari Brand */}
                <Card className="p-5 md:p-6 border-line shadow-soft flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2.5 border-b border-line pb-4">
                            <div className="grid h-9 w-9 place-items-center rounded-control bg-aqua/20 text-ocean">
                                <HelpCircle className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-display text-base font-bold text-navy">
                                    Butuh Bantuan?
                                </h3>
                                <p className="text-xs text-slate">
                                    Layanan Sekretariat & Dukungan
                                </p>
                            </div>
                        </div>

                        <p className="mt-4 text-xs md:text-sm text-slate leading-relaxed">
                            Punya pertanyaan seputar verifikasi keanggotaan, status pengiriman pesanan, atau aktivasi akun? Tim sekretariat {brandSupport?.short_name || 'NSA'} siap membantu Anda.
                        </p>

                        <div className="mt-5 space-y-3">
                            {brandSupport?.phone ? (
                                <a
                                    href={`https://wa.me/${brandSupport.phone.replace(/[^0-9]/g, '')}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-3 rounded-control border border-line p-3 hover:border-ocean hover:bg-mist/50 transition-colors group"
                                >
                                    <div className="grid h-8 w-8 place-items-center rounded-full bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 transition-colors shrink-0">
                                        <Phone className="h-4 w-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[11px] text-slate font-medium">
                                            WhatsApp / Telepon
                                        </p>
                                        <p className="text-xs font-bold text-navy group-hover:text-ocean transition-colors truncate">
                                            {brandSupport.phone}
                                        </p>
                                    </div>
                                </a>
                            ) : null}

                            {brandSupport?.email ? (
                                <a
                                    href={`mailto:${brandSupport.email}`}
                                    className="flex items-center gap-3 rounded-control border border-line p-3 hover:border-ocean hover:bg-mist/50 transition-colors group"
                                >
                                    <div className="grid h-8 w-8 place-items-center rounded-full bg-sky/15 text-ocean group-hover:bg-sky/25 transition-colors shrink-0">
                                        <Mail className="h-4 w-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[11px] text-slate font-medium">
                                            Email Bantuan
                                        </p>
                                        <p className="text-xs font-bold text-navy group-hover:text-ocean transition-colors truncate">
                                            {brandSupport.email}
                                        </p>
                                    </div>
                                </a>
                            ) : null}
                        </div>
                    </div>

                    <div className="mt-6 pt-3 border-t border-line">
                        <Button
                            href="/kontak"
                            variant="secondary"
                            size="sm"
                            fullWidth
                        >
                            Kunjungi Halaman Kontak
                            <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
                        </Button>
                    </div>
                </Card>
            </div>
        </PortalLayout>
    );
}
