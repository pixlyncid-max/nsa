import React, { useEffect, useState, useRef } from 'react';
import PortalLayout, { defaultMemberMenuItems } from '@/Layouts/PortalLayout';
import PageBanner from '@/Components/layout/PageBanner';
import Card from '@/Components/ui/Card';
import Button from '@/Components/ui/Button';
import ContourPattern from '@/Components/motion/ContourPattern';
import QRCode from 'qrcode';
import {
    Award,
    CheckCircle2,
    Download,
    ExternalLink,
    IdCard,
    Printer,
    QrCode as QrCodeIcon,
    Shield,
    ShieldCheck,
    Sparkles,
} from 'lucide-react';

interface CardProps {
    cardData: {
        name: string;
        member_number: string;
        avatar: string | null;
        membership_type: string;
        membership_category: string;
        approved_at: string;
        valid_until: string;
        verification_url: string;
        verification_token: string;
        brand_name: string;
        brand_short: string;
        brand_tagline: string;
    };
}

export default function MemberCard({ cardData }: CardProps) {
    const [qrDataUrl, setQrDataUrl] = useState<string>('');
    const cardRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (cardData.verification_url) {
            QRCode.toDataURL(cardData.verification_url, {
                width: 200,
                margin: 1,
                color: {
                    dark: '#014081',
                    light: '#FFFFFF',
                },
            }).then((url) => {
                setQrDataUrl(url);
            }).catch((err) => {
                console.error('Gagal generate QR code:', err);
            });
        }
    }, [cardData.verification_url]);

    const handlePrintOrDownload = () => {
        window.print();
    };

    return (
        <PortalLayout
            title="Kartu Anggota Digital"
            areaLabel="PORTAL ANGGOTA"
            menuItems={defaultMemberMenuItems}
        >
            <div className="space-y-8 print:m-0 print:p-0">
                {/* Banner */}
                <div className="print:hidden">
                    <PageBanner
                        eyebrow="KARTU TANDA ANGGOTA (KTA)"
                        title="Kartu Anggota Digital NSA"
                        subtitle="KTA digital resmi berhologram elektronik dan QR Code verifikasi publik yang sah diakui asosiasi."
                        action={
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="secondary"
                                    onClick={handlePrintOrDownload}
                                    className="!bg-white !text-navy hover:!bg-white/90 font-display text-xs shadow-soft"
                                >
                                    <Printer className="mr-1.5 h-4 w-4 text-ocean" />
                                    Cetak / Unduh KTA
                                </Button>
                            </div>
                        }
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Visual KTA Card (Debit Card Dimension 85.6mm x 53.98mm ratio approx 1.586) */}
                    <div className="lg:col-span-7 flex flex-col items-center">
                        <div
                            ref={cardRef}
                            className="relative w-full max-w-lg aspect-[1.586] rounded-2xl overflow-hidden p-6 text-white shadow-2xl border border-white/20 bg-gradient-to-br from-navy via-[#023366] to-ocean select-none transition-transform hover:scale-[1.01]"
                        >
                            {/* Contour background */}
                            <ContourPattern
                                tone="white"
                                opacity={0.12}
                                seed={7}
                                rings={12}
                                animate={false}
                                className="absolute inset-0 pointer-events-none"
                            />

                            {/* Decorative security foil / chip pattern */}
                            <div className="relative z-10 flex flex-col justify-between h-full">
                                {/* Header KTA: Brand Logo & Chip */}
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-10 h-10 rounded-xl bg-white p-1.5 flex items-center justify-center shadow-soft">
                                            <span className="font-display font-extrabold text-navy text-sm tracking-tighter">
                                                {cardData.brand_short}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="font-display text-sm font-extrabold tracking-wide text-white uppercase">
                                                {cardData.brand_short}
                                            </h3>
                                            <p className="text-[10px] text-aqua/90 tracking-wider font-semibold">
                                                KARTU TANDA ANGGOTA
                                            </p>
                                        </div>
                                    </div>

                                    {/* Smart Hologram Badge */}
                                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[10px] font-bold text-aqua">
                                        <ShieldCheck className="w-3.5 h-3.5 text-aqua" />
                                        <span>RESMI</span>
                                    </div>
                                </div>

                                {/* Body KTA: Photo, Name, and Member Number */}
                                <div className="flex items-center gap-4 my-auto">
                                    <div className="w-18 h-22 sm:w-20 sm:h-24 shrink-0 rounded-xl overflow-hidden border-2 border-white/40 shadow-soft bg-white/10">
                                        {cardData.avatar ? (
                                            <img
                                                src={cardData.avatar}
                                                alt={cardData.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full grid place-items-center bg-navy-900 font-display font-bold text-2xl text-white">
                                                {cardData.name.slice(0, 1).toUpperCase()}
                                            </div>
                                        )}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <p className="font-display font-bold text-lg sm:text-xl text-white truncate drop-shadow-sm">
                                            {cardData.name}
                                        </p>
                                        <p className="font-mono font-bold text-aqua text-sm sm:text-base tracking-wider mt-0.5">
                                            {cardData.member_number || 'NSA-MEMBER'}
                                        </p>
                                        <div className="mt-1 flex flex-wrap items-center gap-2">
                                            <span className="text-[11px] font-semibold text-white/90">
                                                {cardData.membership_type}
                                            </span>
                                            <span className="text-white/40">•</span>
                                            <span className="text-[11px] font-medium text-white/75 capitalize">
                                                {cardData.membership_category}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer KTA: Validity & QR Code */}
                                <div className="flex items-end justify-between pt-2 border-t border-white/15">
                                    <div className="text-[11px] text-white/80">
                                        <span className="text-[9px] uppercase tracking-wider text-white/60 block font-bold">
                                            Masa Berlaku
                                        </span>
                                        <span className="font-semibold text-white">
                                            Hingga {cardData.valid_until}
                                        </span>
                                    </div>

                                    {/* QR Code */}
                                    {qrDataUrl && (
                                        <div className="bg-white p-1 rounded-lg shadow-soft shrink-0">
                                            <img
                                                src={qrDataUrl}
                                                alt="QR Verifikasi KTA"
                                                className="w-12 h-12 object-contain"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <p className="text-xs text-slate mt-3 text-center print:hidden">
                            Pindai QR code pada kartu untuk verifikasi publik identitas keanggotaan resmi.
                        </p>
                    </div>

                    {/* Informasi Validitas & Tautan Publik */}
                    <div className="lg:col-span-5 space-y-6 print:hidden">
                        <Card className="p-6 border-line shadow-soft space-y-4">
                            <h3 className="font-display text-base font-bold text-navy flex items-center gap-2">
                                <QrCodeIcon className="w-5 h-5 text-ocean" />
                                Verifikasi Keaslian KTA
                            </h3>
                            <p className="text-xs text-slate leading-relaxed">
                                Setiap KTA digital NSA dilengkapi kode identifikasi terenkripsi yang dapat dipindai oleh mitra perbankan, dinas kelautan dan perikanan, serta asosiasi perdagangan resmi.
                            </p>

                            <div className="p-3.5 rounded-xl bg-mist/50 border border-line">
                                <span className="text-xs font-semibold text-slate block mb-1">
                                    Tautan Verifikasi Publik:
                                </span>
                                <a
                                    href={cardData.verification_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-mono text-xs text-ocean hover:text-navy underline font-bold break-all flex items-center gap-1.5"
                                >
                                    {cardData.verification_url}
                                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                                </a>
                            </div>

                            <div className="pt-2">
                                <Button
                                    variant="primary"
                                    onClick={handlePrintOrDownload}
                                    className="w-full justify-center"
                                >
                                    <Download className="mr-2 h-4 w-4" />
                                    Cetak / Simpan KTA (PDF)
                                </Button>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </PortalLayout>
    );
}
