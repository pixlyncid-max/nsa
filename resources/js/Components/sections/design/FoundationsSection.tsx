import DesignSection, {
    Specimen,
} from '@/Components/sections/design/DesignSection';
import Badge, { StatusBadge } from '@/Components/ui/Badge';
import Breadcrumb from '@/Components/ui/Breadcrumb';
import Button from '@/Components/ui/Button';
import Card, { CardHeader } from '@/Components/ui/Card';
import { ArrowRight, Download } from 'lucide-react';

const swatches = [
    { name: 'navy', hex: '#014081', box: 'bg-navy' },
    { name: 'ocean', hex: '#056ED4', box: 'bg-ocean' },
    { name: 'sky', hex: '#27AAE1', box: 'bg-sky' },
    { name: 'aqua', hex: '#3AD1F3', box: 'bg-aqua' },
    { name: 'mist', hex: 'netral', box: 'bg-mist border border-line' },
    { name: 'line', hex: 'netral', box: 'bg-line' },
    { name: 'slate', hex: 'netral', box: 'bg-slate' },
    { name: 'ink', hex: 'netral', box: 'bg-ink' },
    { name: 'success', hex: 'status', box: 'bg-success' },
    { name: 'warning', hex: 'status', box: 'bg-warning' },
    { name: 'danger', hex: 'status', box: 'bg-danger' },
];

const statuses = [
    'non_member',
    'draft',
    'pending',
    'revision',
    'approved',
    'rejected',
];

export default function FoundationsSection() {
    return (
        <DesignSection
            id="dasar"
            eyebrow="01 · Dasar"
            title="Warna, huruf, tombol, dan kartu"
            description="Hanya token dari design.md. Aqua dipakai sebagai teks hanya di atas navy."
        >
            <Specimen label="Warna">
                <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
                    {swatches.map((swatch) => (
                        <li key={swatch.name}>
                            <div
                                className={`h-16 rounded-control ${swatch.box}`}
                            />
                            <p className="mt-2 text-sm font-semibold">
                                {swatch.name}
                            </p>
                            <p className="text-xs text-slate">{swatch.hex}</p>
                        </li>
                    ))}
                </ul>
            </Specimen>

            <Specimen label="Skala huruf" className="space-y-3">
                <p className="t-display">Menyatukan pembudidaya</p>
                <p className="t-h1">Judul halaman H1</p>
                <p className="t-h2">Judul bagian H2</p>
                <p className="t-h3">Judul kartu H3</p>
                <p className="t-body-lg measure text-slate">
                    Paragraf pembuka dengan ukuran lebih besar untuk ringkasan
                    halaman.
                </p>
                <p className="t-small text-slate">
                    Teks kecil untuk keterangan.
                </p>
            </Specimen>

            <Specimen label="Tombol: 4 varian">
                <div className="flex flex-wrap items-center gap-3">
                    <Button icon={<ArrowRight size={18} />}>Primer</Button>
                    <Button variant="secondary">Sekunder</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="danger">Hapus</Button>
                </div>
            </Specimen>

            <Specimen label="Tombol: ukuran dan state">
                <div className="flex flex-wrap items-center gap-3">
                    <Button size="sm">Kecil</Button>
                    <Button size="md">Sedang</Button>
                    <Button size="lg">Besar</Button>
                    <Button loading>Menyimpan</Button>
                    <Button disabled>Nonaktif</Button>
                    <Button
                        variant="secondary"
                        iconLeft={<Download size={18} />}
                    >
                        Unduh
                    </Button>
                </div>
            </Specimen>

            <Specimen label="Badge status">
                <div className="flex flex-wrap gap-2">
                    {statuses.map((status) => (
                        <StatusBadge key={status} status={status} />
                    ))}
                    <Badge tone="info">Info</Badge>
                    <Badge tone="neutral" dot={false}>
                        Tanpa titik
                    </Badge>
                </div>
            </Specimen>

            <Specimen label="Kartu">
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader
                            title="Kartu biasa"
                            description="Border 1px, shadow soft."
                        />
                        <p className="text-sm text-slate">
                            Isi kartu untuk ringkasan data.
                        </p>
                    </Card>
                    <Card interactive>
                        <CardHeader
                            title="Kartu interaktif"
                            description="Naik 4px saat disorot."
                        />
                        <p className="text-sm text-slate">
                            Arahkan kursor untuk melihat efeknya.
                        </p>
                    </Card>
                </div>
            </Specimen>

            <Specimen label="Breadcrumb">
                <Breadcrumb
                    items={[
                        { label: 'Beranda', href: '/' },
                        { label: 'Organisasi', href: '/organisasi' },
                        { label: 'Struktur' },
                    ]}
                />
            </Specimen>
        </DesignSection>
    );
}
