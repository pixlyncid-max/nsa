import { RevealSection } from '@/Components/motion/Reveal';
import Marquee from '@/Components/ui/Marquee';
import { Building2 } from 'lucide-react';

interface PartnerItem {
    id: number;
    name: string;
    type: string;
    logo?: string | null;
    url?: string | null;
}

interface PartnersSectionProps {
    partners: PartnerItem[];
}

function PartnerChip({ partner }: { partner: PartnerItem }) {
    return (
        <div className="flex h-20 items-center gap-3 rounded-card border border-line bg-white px-5 shadow-soft transition-colors duration-220 hover:border-ocean/40">
            {partner.logo ? (
                <img
                    src={partner.logo}
                    alt=""
                    loading="lazy"
                    className="h-10 w-10 shrink-0 object-contain grayscale transition duration-220 hover:grayscale-0"
                />
            ) : (
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-mist text-ocean">
                    <Building2 size={20} strokeWidth={1.75} />
                </span>
            )}
            <span className="max-w-[220px]">
                <span className="block truncate text-sm font-bold text-ink">{partner.name}</span>
                <span className="block truncate text-xs text-slate">{partner.type}</span>
            </span>
        </div>
    );
}

export default function PartnersSection({ partners }: PartnersSectionProps) {
    if (!partners || partners.length === 0) return null;

    const reversed = [...partners].reverse();

    return (
        <RevealSection
            id="mitra"
            aria-labelledby="mitra-title"
            className="section overflow-hidden border-b border-line bg-mist"
        >
            <div className="container-page">
                <div className="section-head items-center text-center">
                    <p className="t-eyebrow text-slate">Kolaborasi Strategis</p>
                    <h2 id="mitra-title" className="t-h3 text-navy">
                        Mitra Pembina, Riset &amp; Asosiasi
                    </h2>
                    <p className="measure text-sm text-slate">
                        Bekerja bersama regulator pemerintah, perguruan tinggi,
                        dan balai riset perikanan budidaya nasional.
                    </p>
                </div>
            </div>

            {/* Logo berjalan: dua baris berlawanan arah */}
            <div className="mt-12 flex flex-col gap-4">
                <Marquee label="Daftar mitra NSA" duration={45}>
                    {partners.map((partner) => (
                        <PartnerChip key={partner.id} partner={partner} />
                    ))}
                </Marquee>
                {partners.length > 1 ? (
                    <Marquee label="Daftar mitra NSA (baris kedua)" duration={55} reverse>
                        {reversed.map((partner) => (
                            <PartnerChip key={partner.id} partner={partner} />
                        ))}
                    </Marquee>
                ) : null}
            </div>
        </RevealSection>
    );
}
