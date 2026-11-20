import ContourPattern from '@/Components/motion/ContourPattern';
import MagneticButton from '@/Components/motion/MagneticButton';
import Parallax from '@/Components/motion/Parallax';
import { RevealSection } from '@/Components/motion/Reveal';
import WaveDivider from '@/Components/motion/WaveDivider';
import Button from '@/Components/ui/Button';
import { getPromoBarConfig } from '@/lib/membershipPromo';
import type { PageProps } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ArrowRight, HelpCircle, ShieldCheck } from 'lucide-react';

export default function FinalCtaSection() {
    const { props } = usePage<PageProps>();
    const user = props.auth.user;
    const promoData = props.membershipPromo;
    const brandShort = props.brand?.short_name || 'NSA';

    const isApproved = user?.membership_status === 'approved';
    const promoConfig = promoData ? getPromoBarConfig(promoData, brandShort) : null;

    let title = 'Siap Mengembangkan Usaha Budidaya Anda?';
    let description =
        'Mulai proses pendaftaran 9 langkah dengan sistem simpan otomatis (draft). Verifikasi cepat oleh admin cabang untuk penerbitan kartu anggota digital resmi.';
    let buttonText = 'Daftar Jadi Anggota Sekarang';
    let buttonHref = user ? '/akun/keanggotaan/daftar' : '/daftar';

    if (isApproved) {
        title = `Selamat Datang Kembali di Portal ${brandShort}`;
        description =
            'Status keanggotaan Anda aktif. Kelola profil usaha, perizinan, program kerja, dan akses Kartu Anggota digital Anda di Portal Membership.';
        buttonText = 'Buka Portal Anggota';
        buttonHref = '/anggota';
    } else if (promoConfig) {
        description = `${promoConfig.text} Akses kemudahan pengelolaan dan jaringan perikanan berkelanjutan ${brandShort}.`;
        buttonText = promoConfig.buttonText;
        buttonHref = promoConfig.href;

        if (promoData?.status === 'draft') {
            title = 'Lanjutkan Pendaftaran Keanggotaan Anda';
        } else if (promoData?.status === 'awaiting_payment') {
            title = 'Selesaikan Pembayaran Keanggotaan';
        } else if (promoData?.status === 'revision') {
            title = 'Perbaiki Berkas Pendaftaran Anda';
        } else if (
            promoData?.status === 'pending_review' ||
            promoData?.status === 'pending_approval' ||
            promoData?.status === 'pending'
        ) {
            title = 'Pantau Status Verifikasi Pendaftaran';
        }
    }

    return (
        <RevealSection
            id="cta-akhir"
            aria-label="Ajakan Pendaftaran Anggota"
            className="section bg-white"
        >
            <div className="container-page">
                <div className="relative overflow-hidden rounded-card border border-line bg-gradient-to-br from-mist via-white to-mist p-8 shadow-lift md:p-14">
                    {/* Pembatas gelombang di atas kartu */}
                    <div className="pointer-events-none absolute -top-1 left-0 right-0">
                        <WaveDivider tone="sky" />
                    </div>

                    {/* Kontur air halus dengan parallax lembut di sisi kanan */}
                    <Parallax
                        offset={24}
                        className="pointer-events-none absolute -bottom-16 -right-16 h-80 w-80 opacity-30"
                    >
                        <ContourPattern tone="ocean" rings={7} seed={3} />
                    </Parallax>

                    <div className="relative z-10 max-w-2xl">
                        <span className="eyebrow-pill">
                            <ShieldCheck size={14} />
                            Keanggotaan Terpadu {brandShort}
                        </span>

                        <h2 className="t-h1 mt-4 text-navy">{title}</h2>

                        <p className="measure mt-4 text-base leading-relaxed text-slate">
                            {description}
                        </p>

                        <div className="mt-8 flex flex-wrap items-center gap-4">
                            <MagneticButton>
                                <Button
                                    href={buttonHref}
                                    size="lg"
                                    icon={<ArrowRight size={18} />}
                                >
                                    {buttonText}
                                </Button>
                            </MagneticButton>

                            <Link
                                href="/kontak"
                                className="inline-flex h-12 items-center gap-1.5 rounded-control px-3 text-sm font-semibold text-ocean transition-colors hover:text-navy"
                            >
                                <HelpCircle size={16} />
                                Hubungi Sekretariat {brandShort}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </RevealSection>
    );
}
