import Button from '@/Components/ui/Button';
import { ArrowRight, HelpCircle } from 'lucide-react';

interface OrganizationEmptyStateProps {
    type: 'DPW' | 'DPC';
    regionName: string;
}

export default function OrganizationEmptyState({
    type,
    regionName,
}: OrganizationEmptyStateProps) {
    const fullType =
        type === 'DPW'
            ? 'Dewan Pengurus Wilayah (DPW)'
            : 'Dewan Pengurus Cabang (DPC)';

    return (
        <div className="flex flex-col items-center rounded-card border border-dashed border-line bg-white px-6 py-14 text-center shadow-soft">
            {/* Ilustrasi Garis Ombak & Pin Sederhana */}
            <svg
                viewBox="0 0 160 120"
                className="h-28 w-36 text-sky"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
            >
                <path
                    className="text-line"
                    d="M10 95c10-6 20-6 30 0s20 6 30 0 20-6 30 0 20 6 30 0 15-4 25-4"
                />
                <path
                    className="text-line"
                    d="M20 108c10-6 20-6 30 0s20 6 30 0 20-6 30 0 20 6 30 0"
                />
                {/* Simbol Pin / Gedung Belum Terbentuk */}
                <circle
                    cx="80"
                    cy="50"
                    r="22"
                    stroke="currentColor"
                    strokeDasharray="4 4"
                />
                <path d="M80 38v24M68 50h24" stroke="currentColor" />
                <circle cx="80" cy="50" r="3" fill="currentColor" />
            </svg>

            <span className="mt-4 rounded-full bg-warning/10 px-3 py-1 text-xs font-bold text-warning">
                Kepengurusan Belum Terbentuk
            </span>

            <h3 className="t-h2 mt-3 text-navy">
                {type} NSA {regionName} Belum Terbentuk
            </h3>

            <p className="measure mt-2 text-sm text-slate">
                Saat ini {fullType} di wilayah <strong>{regionName}</strong>{' '}
                sedang dalam tahap perintisan. Apakah Anda pembudidaya,
                petambak, atau pelaku usaha perikanan di wilayah ini? Mari
                berkolaborasi membentuk kepengurusan resmi untuk memajukan
                sektor bahari lokal.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Button href="/kemitraan" icon={<ArrowRight size={18} />}>
                    Ajukan Pembentukan Cabang
                </Button>
                <Button
                    href="/kontak"
                    variant="secondary"
                    iconLeft={<HelpCircle size={18} />}
                >
                    Hubungi Sekretariat Pusat
                </Button>
            </div>
        </div>
    );
}
