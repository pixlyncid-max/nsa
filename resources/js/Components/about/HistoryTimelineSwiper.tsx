import ArchImage from '@/Components/layout/ArchImage';
import type { Swiper as SwiperType } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';

export interface TimelineMilestone {
    year: string;
    title: string;
    desc: string;
    image?: string;
    alt: string;
}

interface HistoryTimelineSwiperProps {
    milestones: TimelineMilestone[];
    onSwiper: (swiper: SwiperType) => void;
}

export default function HistoryTimelineSwiper({
    milestones,
    onSwiper,
}: HistoryTimelineSwiperProps) {
    return (
        <Swiper
            onSwiper={onSwiper}
            spaceBetween={20}
            slidesPerView={1.15}
            grabCursor={true}
            breakpoints={{
                640: { slidesPerView: 1.8 },
                1024: { slidesPerView: 2.35 },
            }}
            className="!pb-2"
        >
            {milestones.map((ms) => (
                <SwiperSlide key={ms.year} className="h-auto">
                    <article className="flex h-full flex-col justify-between rounded-card border border-line bg-mist/45 p-5 transition-colors hover:border-ocean/40 hover:bg-white">
                        <div>
                            <div className="flex items-baseline justify-between gap-4 border-b border-line pb-3">
                                <span className="font-display text-4xl font-extrabold tracking-tight text-ocean sm:text-5xl">
                                    {ms.year}
                                </span>
                                <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate">
                                    Tonggak NSA
                                </span>
                            </div>

                            <div className="my-4 w-36">
                                <ArchImage
                                    src={ms.image}
                                    alt={ms.alt}
                                    aspectRatio="aspect-[4/5]"
                                />
                            </div>

                            <h3 className="font-display text-lg font-bold leading-snug text-navy">
                                {ms.title}
                            </h3>
                            <p className="mt-2 text-xs leading-relaxed text-slate sm:text-sm">
                                {ms.desc}
                            </p>
                        </div>
                    </article>
                </SwiperSlide>
            ))}
        </Swiper>
    );
}
