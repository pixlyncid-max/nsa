import Container from '@/Components/layout/Container';
import ContourPattern from '@/Components/motion/ContourPattern';
import CoastlineSection from '@/Components/sections/design/CoastlineSection';
import FeedbackSection from '@/Components/sections/design/FeedbackSection';
import FormsSection from '@/Components/sections/design/FormsSection';
import FoundationsSection from '@/Components/sections/design/FoundationsSection';
import MotionSection from '@/Components/sections/design/MotionSection';
import PublicLayout from '@/Layouts/PublicLayout';
import { Head } from '@inertiajs/react';

const anchors = [
    { href: '#garis-pantai', label: 'Garis Pantai' },
    { href: '#dasar', label: 'Dasar' },
    { href: '#formulir', label: 'Formulir' },
    { href: '#umpan-balik', label: 'Umpan balik' },
    { href: '#gerak', label: 'Gerak' },
];

/** Galeri komponen untuk pengecekan visual. Hanya aktif di lingkungan lokal. */
export default function Gallery() {
    return (
        <PublicLayout>
            <Head title="Galeri Desain" />
            <header className="relative overflow-hidden bg-mist py-14 md:py-20">
                <div className="absolute inset-0">
                    <ContourPattern tone="sky" opacity={0.35} />
                </div>
                <Container className="relative">
                    <p className="t-eyebrow">Hanya mode lokal</p>
                    <h1 className="t-h1 mt-2">Galeri desain NSA</h1>
                    <p className="measure mt-3 text-slate">
                        Semua komponen dengan state-nya. Termasuk sistem tata letak Garis Pantai baru. Ubah ukuran jendela ke
                        360, 768, dan 1280px untuk memeriksa responsivitas.
                    </p>
                    <nav
                        aria-label="Loncat ke bagian"
                        className="mt-6 flex flex-wrap gap-2"
                    >
                        {anchors.map((anchor) => (
                            <a
                                key={anchor.href}
                                href={anchor.href}
                                className="rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-ocean hover:text-ocean"
                            >
                                {anchor.label}
                            </a>
                        ))}
                    </nav>
                </Container>
            </header>
            <Container className="py-12">
                <CoastlineSection />
            </Container>
            <FoundationsSection />
            <FormsSection />
            <FeedbackSection />
            <MotionSection />
        </PublicLayout>
    );
}
