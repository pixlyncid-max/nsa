import Section from '@/Components/layout/Section';
import SectionHeading from '@/Components/layout/SectionHeading';
import { useLocale } from '@/lib/lroute';
import { Link } from '@inertiajs/react';
import { ArrowRight, Award, Calendar, ChevronRight, Layers, TrendingUp } from 'lucide-react';

interface ProgramTeaserItem {
    id: number | string;
    index: string;
    title: string;
    category: string;
    summary: string;
    schedule: string;
    icon: typeof Award;
}

export default function ProgramsTeaserSection() {
    const { isEn, lp } = useLocale();

    const defaultPrograms: ProgramTeaserItem[] = isEn
        ? [
              {
                  id: 1,
                  index: '01',
                  title: 'Quality Certification & Independent CBIB Standardization',
                  category: 'Standardization & Certification',
                  summary:
                      'Intensive technical coaching and pre-assessment audits for Good Aquaculture Practices (CBIB) so member ponds meet formal market quality standards.',
                  schedule: 'Continuous Cycle 2025/2026',
                  icon: Award,
              },
              {
                  id: 2,
                  index: '02',
                  title: 'Collective Feed & Certified Seed Procurement',
                  category: 'Input Efficiency',
                  summary:
                      'Collective purchasing directly from feed manufacturers and certified hatcheries to cut middleman margins by double digits each harvest cycle.',
                  schedule: 'Monthly Collective Orders',
                  icon: Layers,
              },
              {
                  id: 3,
                  index: '03',
                  title: 'Fisheries Export Incubation & National Horeca Contracts',
                  category: 'Market Development',
                  summary:
                      'Facilitating recurring supply contracts with major hotel, restaurant, and catering (Horeca) networks along with export documentation support.',
                  schedule: 'Quarterly Business Matching',
                  icon: TrendingUp,
              },
          ]
        : [
              {
                  id: 1,
                  index: '01',
                  title: 'Sertifikasi Mutu & Standardisasi CPIB Mandiri',
                  category: 'Standardisasi & Sertifikasi',
                  summary:
                      'Bimbingan teknis intensif dan audit pra-penilaian Cara Budidaya Ikan yang Baik (CPIB) bagi kolam dan tambak anggota agar memenuhi kualifikasi mutu pasar resmi.',
                  schedule: 'Siklus Berkelanjutan 2025/2026',
                  icon: Award,
              },
              {
                  id: 2,
                  index: '02',
                  title: 'Konsolidasi Pasokan Pakan Pabrikan & Benih Unggul',
                  category: 'Efisiensi Sarana Produksi',
                  summary:
                      'Pengadaan kolektif langsung dari produsen pakan dan balai pembenihan bersertifikat untuk memangkas margin perantara hingga belasan persen per siklus panen.',
                  schedule: 'Pemesanan Kolektif Tiap Awal Bulan',
                  icon: Layers,
              },
              {
                  id: 3,
                  index: '03',
                  title: 'Inkubasi Ekspor Perikanan & Kontrak Horeka Nasional',
                  category: 'Pengembangan Pasar',
                  summary:
                      'Fasilitasi kontrak pasokan rutin dengan jaringan hotel, restoran, dan katering (Horeka) kota besar serta pendampingan kelengkapan dokumen ekspor komoditas laut.',
                  schedule: 'Temu Bisnis Triwulanan',
                  icon: TrendingUp,
              },
          ];

    return (
        <Section
            id="program-kerja"
            index="06"
            label={isEn ? 'Work Programs' : 'Program Kerja'}
            tone="white"
            bleed={false}
            className="border-b border-line"
        >
            <SectionHeading
                eyebrow={isEn ? 'Association Action Agenda' : 'Agenda Nyata Asosiasi'}
                title={isEn ? 'Flagship Work Programs' : 'Program Kerja Unggulan'}
                description={
                    isEn
                        ? 'Strategic initiatives to strengthen seed quality standards, feed operational efficiency, and farmers\' bargaining power in open markets.'
                        : 'Inisiatif strategis asosiasi untuk memperkuat standardisasi mutu benih, efisiensi operasional pakan, dan daya tawar petambak di pasar terbuka.'
                }
                align="split"
                actions={
                    <Link
                        href={lp('/tentang-kami#program-kerja')}
                        className="group inline-flex items-center gap-2 text-sm font-semibold text-ocean transition-colors hover:text-navy"
                    >
                        {isEn ? 'View All Programs' : 'Lihat Semua Program Kerja'}
                        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </Link>
                }
            />

            {/* Tiga Program Kerja dalam Baris Horizontal Bernomor */}
            <div className="mt-12 divide-y divide-line rounded-card border border-line bg-white shadow-soft overflow-hidden">
                {defaultPrograms.map((prog) => {
                    const Icon = prog.icon;
                    return (
                        <div
                            key={prog.id}
                            className="group relative flex flex-col gap-6 p-6 transition-all duration-200 hover:bg-mist/40 sm:flex-row sm:items-center sm:justify-between sm:p-8"
                        >
                            <div className="flex items-start gap-6">
                                {/* Nomor Indeks Besar */}
                                <span className="font-mono text-3xl sm:text-4xl font-extrabold tracking-tight text-ocean/80 shrink-0">
                                    {prog.index}
                                </span>

                                <div className="space-y-2">
                                    <div className="flex flex-wrap items-center gap-2.5">
                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-ocean/10 px-3 py-0.5 text-xs font-semibold text-ocean">
                                            <Icon className="h-3 w-3" />
                                            {prog.category}
                                        </span>
                                        <span className="inline-flex items-center gap-1.5 text-xs text-slate font-medium">
                                            <Calendar className="h-3.5 w-3.5 text-ocean" />
                                            {prog.schedule}
                                        </span>
                                    </div>

                                    <h3 className="font-display text-lg sm:text-xl font-bold text-navy transition-colors group-hover:text-ocean">
                                        <Link href={lp('/tentang-kami#program-kerja')}>
                                            {prog.title}
                                        </Link>
                                    </h3>

                                    <p className="measure text-xs sm:text-sm text-slate leading-relaxed">
                                        {prog.summary}
                                    </p>
                                </div>
                            </div>

                            <div className="shrink-0 self-end sm:self-center">
                                <Link
                                    href={lp('/tentang-kami#program-kerja')}
                                    className="inline-flex items-center gap-1.5 rounded-control border border-line bg-white px-4 py-2 text-xs font-semibold text-navy transition-colors group-hover:border-ocean group-hover:bg-ocean group-hover:text-white shadow-xs"
                                >
                                    {isEn ? 'Program Details' : 'Rincian Program'}
                                    <ChevronRight className="h-3.5 w-3.5" />
                                </Link>
                            </div>
                        </div>
                    );
                })}
            </div>
        </Section>
    );
}
