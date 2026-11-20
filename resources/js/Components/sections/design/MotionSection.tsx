import ContourPattern, {
    type ContourTone,
} from '@/Components/motion/ContourPattern';
import CountUp from '@/Components/motion/CountUp';
import MagneticButton from '@/Components/motion/MagneticButton';
import Reveal, { RevealGroup, RevealItem } from '@/Components/motion/Reveal';
import WaveDivider from '@/Components/motion/WaveDivider';
import DesignSection, {
    Specimen,
} from '@/Components/sections/design/DesignSection';
import Button from '@/Components/ui/Button';
import Card from '@/Components/ui/Card';

const contours: {
    tone: ContourTone;
    opacity: number;
    seed: number;
    dark?: boolean;
}[] = [
    { tone: 'line', opacity: 0.9, seed: 1 },
    { tone: 'sky', opacity: 0.5, seed: 2 },
    { tone: 'aqua', opacity: 0.45, seed: 3, dark: true },
];

export default function MotionSection() {
    return (
        <DesignSection
            id="gerak"
            eyebrow="04 · Gerak dan identitas"
            title="Kontur, gelombang, dan animasi"
            description="Semua animasi mati bila perangkat memakai prefers-reduced-motion."
        >
            <Specimen label="CountUp (anime.js)">
                <div className="flex flex-wrap gap-10">
                    <p className="t-stat">
                        <CountUp to={12840} />
                    </p>
                    <p className="t-stat">
                        <CountUp to={38} suffix=" provinsi" />
                    </p>
                </div>
            </Specimen>

            <Specimen label="ContourPattern">
                <div className="grid gap-4 md:grid-cols-3">
                    {contours.map((item) => (
                        <div
                            key={item.seed}
                            className={`relative h-44 overflow-hidden rounded-card border border-line ${item.dark ? 'bg-navy' : 'bg-white'}`}
                        >
                            <ContourPattern
                                tone={item.tone}
                                opacity={item.opacity}
                                seed={item.seed}
                            />
                        </div>
                    ))}
                </div>
            </Specimen>

            <Specimen label="WaveDivider" className="space-y-6">
                <WaveDivider tone="line" />
                <WaveDivider tone="sky" />
                <div className="overflow-hidden rounded-card border border-line">
                    <div className="h-16 bg-white" />
                    <WaveDivider tone="aqua" fill="navy" />
                    <div className="h-16 bg-navy" />
                </div>
            </Specimen>

            <Specimen label="Reveal dan stagger (gulir ke sini)">
                <Reveal>
                    <Card>Satu blok muncul saat masuk layar.</Card>
                </Reveal>
                <RevealGroup className="mt-4 grid gap-4 sm:grid-cols-3">
                    {['Satu', 'Dua', 'Tiga'].map((label) => (
                        <RevealItem key={label}>
                            <Card padding="sm">{label}</Card>
                        </RevealItem>
                    ))}
                </RevealGroup>
            </Specimen>

            <Specimen label="MagneticButton (hanya kursor halus)">
                <MagneticButton>
                    <Button size="lg">Daftar Anggota</Button>
                </MagneticButton>
            </Specimen>
        </DesignSection>
    );
}
