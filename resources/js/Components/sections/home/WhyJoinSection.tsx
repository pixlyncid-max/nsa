import ContourPattern from '@/Components/motion/ContourPattern';
import { RevealGroup, RevealItem, RevealSection } from '@/Components/motion/Reveal';
import Button from '@/Components/ui/Button';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export default function WhyJoinSection() {
    const benefits = [
        {
            number: '01',
            title: 'Kepastian Akses Pasar & Distribusi',
            desc: 'Terhubung langsung dengan jaringan buyer hotel, restoran, katering (Horeka), pabrik pengolahan fillet, dan pasar ekspor antar pulau.',
        },
        {
            number: '02',
            title: 'Bantuan Legalitas & Sertifikasi Resmi',
            desc: 'Pendampingan pembuatan NIB perikanan, sertifikasi Cara Budidaya Ikan yang Baik (CPIB), dan surat keterangan asal benih.',
        },
        {
            number: '03',
            title: 'Harga Khusus Sarana Produksi',
            desc: 'Potongan harga khusus anggota untuk pakan apung pabrikan, vitamin probiotik, benih bersertifikat, dan sewa alat pancing.',
        },
        {
            number: '04',
            title: 'Advokasi & Perlindungan Usaha',
            desc: 'Dukungan kelembagaan bila menghadapi kendala perizinan daerah, pencemaran air lingkungan kolam, atau sengketa batas tangkap.',
        },
    ];

    return (
        <RevealSection
            id="kenapa-bergabung"
            aria-labelledby="manfaat-title"
            className="section relative overflow-hidden bg-navy text-white"
        >
            {/* Tekstur kontur air halus di latar navy (anime.js path draw) */}
            <div className="pointer-events-none absolute inset-0 opacity-20">
                <ContourPattern tone="aqua" opacity={0.3} size="100%" />
            </div>

            <div className="container-page relative z-10">
                <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
                    <div>
                        <p className="t-eyebrow text-aqua">
                            Manfaat Keanggotaan
                        </p>
                        <h2 id="manfaat-title" className="t-h2 mt-2 text-white">
                            Mengapa Bergabung Bersama NSA?
                        </h2>
                        <p className="measure mt-2 text-sm text-mist/90">
                            Kami hadir menyelesaikan kendala nyata di lapangan:
                            biaya pakan tinggi, bibit tidak seragam, dan
                            sulitnya mencari pembeli dengan harga yang adil.
                        </p>
                    </div>

                    <Button
                        href="/daftar"
                        className="shrink-0 bg-aqua font-bold text-navy hover:bg-white"
                        icon={<ArrowRight size={18} />}
                    >
                        Daftar Anggota Sekarang
                    </Button>
                </div>

                {/* 4 Poin Bernomor Besar Editorial dengan Stagger */}
                <RevealGroup className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {benefits.map((b) => (
                        <RevealItem
                            key={b.number}
                            className="relative flex flex-col justify-between rounded-card border border-white/15 bg-white/5 p-6 transition-all duration-220 ease-brand hover:-translate-y-1 hover:border-aqua/40 hover:bg-white/10"
                        >
                            <div>
                                <span className="font-display text-4xl font-bold tracking-tight text-aqua/90">
                                    {b.number}
                                </span>
                                <h3 className="mt-4 font-display text-lg font-bold text-white">
                                    {b.title}
                                </h3>
                                <p className="mt-2 text-xs leading-relaxed text-mist/85">
                                    {b.desc}
                                </p>
                            </div>

                            <div className="mt-6 flex items-center gap-1.5 text-[11px] font-semibold text-aqua">
                                <CheckCircle2 size={14} />
                                Hak Anggota Terverifikasi
                            </div>
                        </RevealItem>
                    ))}
                </RevealGroup>
            </div>
        </RevealSection>
    );
}
