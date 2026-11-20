import PageBanner from '@/Components/layout/PageBanner';
import Button from '@/Components/ui/Button';
import Card from '@/Components/ui/Card';
import Checkbox from '@/Components/ui/Checkbox';
import PortalLayout from '@/Layouts/PortalLayout';
import { useForm } from '@inertiajs/react';
import { Bell, Check, Info, ShieldCheck, UserCog } from 'lucide-react';
import type { FormEvent } from 'react';

interface PreferencesData {
    notify_orders: boolean;
    notify_membership: boolean;
    notify_programs: boolean;
}

interface SettingsProps {
    preferences: PreferencesData;
}

export default function AccountSettings({ preferences }: SettingsProps) {
    const form = useForm({
        notify_orders: preferences?.notify_orders ?? true,
        notify_membership: preferences?.notify_membership ?? true,
        notify_programs: preferences?.notify_programs ?? true,
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        form.post('/akun/pengaturan', {
            preserveScroll: true,
        });
    };

    return (
        <PortalLayout title="Pengaturan Akun">
            <PageBanner
                eyebrow="PREFERENSI SISTEM"
                title="Pengaturan & Notifikasi"
                subtitle="Sesuaikan preferensi pemberitahuan email dan informasi aktivitas akun portal Anda."
            />

            <div className="grid gap-6 lg:grid-cols-3">
                {/* 1. Pengaturan Notifikasi Email (2 Kolom) */}
                <Card className="p-6 md:p-7 border-line shadow-soft lg:col-span-2">
                    <div className="flex items-center gap-2.5 border-b border-line pb-4">
                        <div className="grid h-9 w-9 place-items-center rounded-control bg-ocean/10 text-ocean">
                            <Bell className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="font-display text-base font-bold text-navy">
                                Pemberitahuan Email
                            </h2>
                            <p className="text-xs text-slate">
                                Tentukan pesan dan informasi apa saja yang dikirim ke email Anda
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                        <div className="divide-y divide-line">
                            <Checkbox
                                label="Notifikasi Transaksi & Pesanan"
                                description="Terima tanda terima pembayaran, status pengiriman produk, dan update transaksi toko."
                                checked={form.data.notify_orders}
                                onChange={(e) =>
                                    form.setData(
                                        'notify_orders',
                                        e.target.checked
                                    )
                                }
                            />

                            <Checkbox
                                label="Update Status Keanggotaan"
                                description="Dapatkan kabar perkembangan verifikasi berkas, persetujuan admin, dan penerbitan nomor anggota resmi."
                                checked={form.data.notify_membership}
                                onChange={(e) =>
                                    form.setData(
                                        'notify_membership',
                                        e.target.checked
                                    )
                                }
                            />

                            <Checkbox
                                label="Buletin & Info Program Kerja NSA"
                                description="Kabar terbaru mengenai program pelatihan budidaya, forum kemitraan pasar, dan agenda organisasi."
                                checked={form.data.notify_programs}
                                onChange={(e) =>
                                    form.setData(
                                        'notify_programs',
                                        e.target.checked
                                    )
                                }
                            />
                        </div>

                        <div className="pt-3 text-right border-t border-line">
                            <Button
                                type="submit"
                                size="md"
                                loading={form.processing}
                                disabled={form.processing}
                            >
                                <Check className="h-4 w-4 mr-1.5" />
                                Simpan Pengaturan
                            </Button>
                        </div>
                    </form>
                </Card>

                {/* 2. Informasi Keamanan & Privasi (1 Kolom) */}
                <Card className="p-6 md:p-7 border-line shadow-soft flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2.5 border-b border-line pb-4">
                            <div className="grid h-9 w-9 place-items-center rounded-control bg-aqua/20 text-ocean">
                                <ShieldCheck className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-display text-base font-bold text-navy">
                                    Privasi & Data
                                </h3>
                                <p className="text-xs text-slate">
                                    Keamanan akun pengguna
                                </p>
                            </div>
                        </div>

                        <div className="mt-5 space-y-4 text-xs md:text-sm text-slate leading-relaxed">
                            <div className="rounded-control bg-mist/60 border border-line p-3.5">
                                <div className="flex items-start gap-2 text-navy font-semibold text-xs mb-1">
                                    <Info className="h-4 w-4 text-ocean shrink-0 mt-0.5" />
                                    <span>Enkripsi Data Pribadi</span>
                                </div>
                                <p className="text-[11px] text-slate leading-normal">
                                    Nomor identitas (NIK / Paspor) yang Anda daftarkan dienkripsi dengan standar AES-256 dan hanya dapat diakses oleh petugas verifikasi resmi.
                                </p>
                            </div>

                            <div className="rounded-control bg-mist/60 border border-line p-3.5">
                                <div className="flex items-start gap-2 text-navy font-semibold text-xs mb-1">
                                    <UserCog className="h-4 w-4 text-ocean shrink-0 mt-0.5" />
                                    <span>Pengelolaan Akun</span>
                                </div>
                                <p className="text-[11px] text-slate leading-normal">
                                    Untuk permintaan penghapusan akun atau koreksi data keanggotaan terverifikasi, silakan hubungi tim sekretariat NSA via halaman kontak.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 pt-3 border-t border-line">
                        <Button
                            href="/kontak"
                            variant="secondary"
                            size="sm"
                            fullWidth
                        >
                            Bantuan Sekretariat
                        </Button>
                    </div>
                </Card>
            </div>
        </PortalLayout>
    );
}
