import { RevealSection } from '@/Components/motion/Reveal';
import Carousel from '@/Components/ui/Carousel';
import { motion } from 'framer-motion';
import { hoverLift } from '@/animations/variants';
import { Quote, UserCheck } from 'lucide-react';

export default function MemberStoriesSection() {
    const stories = [
        {
            id: 1,
            name: 'Budi Pratama',
            business: 'Mina Sejahtera Aquaculture',
            location: 'Cijeruk, Kabupaten Bogor',
            commodity: 'Budidaya Nila & Lele Bioflok',
            quote: 'Dulu kami sering kesulitan menjual hasil panen saat harga pasar anjlok. Sejak bergabung dengan NSA, pasokan kami langsung diserap jaringan katering hotel mitra di Jakarta dengan harga kontrak yang stabil.',
        },
        {
            id: 2,
            name: 'H. Suwandi Santoso',
            business: 'Tambak Vaname Bahari',
            location: 'Sidoarjo, Jawa Timur',
            commodity: 'Petambak Udang Vaname',
            quote: 'Pendampingan teknisi NSA dalam manajemen air dan rasio pakan mandiri berhasil menekan FCR kolam kami dari 1.6 menjadi 1.25. Penghematan biaya operasional pakan terasa sangat nyata.',
        },
        {
            id: 3,
            name: 'Zulkifli Al-Habsyi',
            business: 'Bioflok Khatulistiwa Mandiri',
            location: 'Kota Pontianak, Kalimantan Barat',
            commodity: 'Pembenihan Patin & Baung',
            quote: 'Pengurusan NIB dan sertifikasi CPIB dibantu tuntas oleh pengurus cabang. Kami yang awalnya peternak rumahan kini percaya diri bermitra dengan dinas dan eksportir regional.',
        },
    ];

    return (
        <RevealSection
            id="cerita-anggota"
            aria-labelledby="cerita-title"
            className="section border-b border-line bg-white"
        >
            <div className="container-page">
                <div className="section-head items-center text-center">
                    <p className="t-eyebrow text-ocean">
                        Dari Petani Untuk Petani
                    </p>
                    <h2 id="cerita-title" className="t-h2">
                        Cerita Anggota Nusantara
                    </h2>
                    <p className="measure text-sm text-slate">
                        Pengalaman nyata pembudidaya dan petambak yang telah
                        berkembang bersama jaringan asosiasi.
                    </p>
                </div>

                <Carousel label="Cerita anggota" className="mt-12">
                    {stories.map((story) => (
                        <motion.article
                            key={story.id}
                            {...hoverLift}
                            className="flex h-full select-none flex-col justify-between rounded-card border border-line bg-mist/60 p-6 shadow-soft transition-colors duration-220 hover:border-ocean/40 hover:bg-white"
                        >
                            <div>
                                <Quote
                                    size={28}
                                    strokeWidth={1.75}
                                    className="mb-4 text-sky/60"
                                />
                                <p className="text-sm italic leading-relaxed text-ink">
                                    "{story.quote}"
                                </p>
                            </div>

                            <div className="mt-6 flex items-center gap-3 border-t border-line/60 pt-4">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ocean/10 text-ocean">
                                    <UserCheck size={20} strokeWidth={1.75} />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-sm font-bold text-navy">
                                        {story.name}
                                    </h3>
                                    <p className="text-xs font-semibold text-ocean">
                                        {story.business}
                                    </p>
                                    <p className="text-[11px] text-slate">
                                        {story.location} ·{' '}
                                        {story.commodity}
                                    </p>
                                </div>
                            </div>
                        </motion.article>
                    ))}
                </Carousel>
            </div>
        </RevealSection>
    );
}
