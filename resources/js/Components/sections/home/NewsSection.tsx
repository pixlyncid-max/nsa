import { hoverLift } from '@/animations/variants';
import { RevealGroup, RevealItem, RevealSection } from '@/Components/motion/Reveal';
import Carousel from '@/Components/ui/Carousel';
import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, Newspaper } from 'lucide-react';

interface PostItem {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    cover: string | null;
    category: string;
    published_at: string | null;
}

interface NewsSectionProps {
    posts: PostItem[];
}

export default function NewsSection({ posts }: NewsSectionProps) {
    if (!posts || posts.length === 0) return null;

    const mainPost = posts[0];
    const sidePosts = posts.slice(1, 5);

    return (
        <RevealSection
            id="berita-terkini"
            aria-labelledby="berita-title"
            className="section border-b border-line bg-white"
        >
            <div className="container-page">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                    <div>
                        <p className="t-eyebrow text-ocean">
                            Kabar &amp; Informasi Asosiasi
                        </p>
                        <h2 id="berita-title" className="t-h2 mt-2">
                            Warta Perikanan Terkini
                        </h2>
                        <p className="measure mt-2 text-sm text-slate">
                            Kebijakan nasional, agenda kegiatan cabang, dan
                            perkembangan teknologi budidaya.
                        </p>
                    </div>

                    <Link
                        href="/artikel"
                        className="group inline-flex items-center gap-1.5 text-sm font-semibold text-ocean transition-colors hover:text-navy"
                    >
                        Lihat Semua Berita
                        <ArrowRight size={16} className="transition-transform duration-150 group-hover:translate-x-1" />
                    </Link>
                </div>

                {/* Mobile View: Carousel ringan (swipe + keyboard) */}
                <div className="mt-8 block md:hidden">
                    <Carousel label="Warta perikanan terkini" perView={{ base: 1 }} gap={16}>
                        {posts.map((post) => (
                            <Link
                                key={post.id}
                                href={`/artikel/${post.slug}`}
                                className="flex h-full flex-col overflow-hidden rounded-card border border-line bg-white shadow-soft"
                            >
                                <div className="flex aspect-[16/9] w-full items-center justify-center overflow-hidden bg-mist text-slate">
                                    {post.cover ? (
                                        <img
                                            src={post.cover}
                                            alt={post.title}
                                            loading="lazy"
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <Newspaper size={32} className="text-sky" strokeWidth={1.75} />
                                    )}
                                </div>
                                <div className="flex flex-1 flex-col justify-between p-5">
                                    <div>
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-ocean">
                                            {post.category}
                                        </span>
                                        <h3 className="mt-1 line-clamp-2 text-sm font-bold text-navy">
                                            {post.title}
                                        </h3>
                                        <p className="mt-2 line-clamp-2 text-xs text-slate">
                                            {post.excerpt}
                                        </p>
                                    </div>
                                    <p className="mt-4 flex items-center gap-1.5 text-[11px] text-slate">
                                        <Calendar size={12} />
                                        {post.published_at}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </Carousel>
                </div>

                {/* Desktop View: 1 Besar di Kiri + 4 di Kanan dengan stagger */}
                <div className="mt-10 hidden grid-cols-12 gap-8 md:grid">
                    {/* Berita Utama Besar (7 Kolom) */}
                    <motion.article
                        {...hoverLift}
                        className="group relative flex flex-col justify-between overflow-hidden rounded-card border border-line bg-white shadow-soft transition-shadow duration-220 hover:border-ocean/30 hover:shadow-lift md:col-span-7"
                    >
                        <Link href={`/artikel/${mainPost.slug}`} className="relative flex aspect-[16/9] w-full items-end overflow-hidden bg-gradient-to-br from-navy to-ocean p-6 text-white">
                            {mainPost.cover ? (
                                <img
                                    src={mainPost.cover}
                                    alt={mainPost.title}
                                    loading="lazy"
                                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 ease-brand group-hover:scale-[1.04]"
                                />
                            ) : null}
                            <div className="absolute inset-0 bg-gradient-to-t from-navy/70 via-navy/25 to-transparent" />
                            <div className="relative z-10">
                                <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
                                    {mainPost.category}
                                </span>
                            </div>
                        </Link>

                        <div className="flex flex-1 flex-col justify-between p-6">
                            <div>
                                <p className="flex items-center gap-1.5 text-xs text-slate">
                                    <Calendar size={13} />
                                    {mainPost.published_at}
                                </p>
                                <Link href={`/artikel/${mainPost.slug}`}>
                                    <h3 className="t-h3 mt-2 line-clamp-2 font-bold transition-colors group-hover:text-ocean">
                                        {mainPost.title}
                                    </h3>
                                </Link>
                                <p className="measure mt-3 line-clamp-3 text-sm leading-relaxed text-slate">
                                    {mainPost.excerpt}
                                </p>
                            </div>

                            <div className="mt-6 border-t border-line pt-4">
                                <Link
                                    href={`/artikel/${mainPost.slug}`}
                                    className="inline-flex items-center gap-1.5 text-xs font-bold text-navy transition-colors group-hover:text-ocean"
                                >
                                    Baca Selengkapnya <ArrowRight size={14} className="transition-transform duration-150 group-hover:translate-x-1" />
                                </Link>
                            </div>
                        </div>
                    </motion.article>

                    {/* 4 Berita Kecil di Kanan (5 Kolom) */}
                    <RevealGroup className="flex flex-col gap-4 md:col-span-5">
                        {sidePosts.map((post) => (
                            <RevealItem key={post.id}>
                                <Link
                                    href={`/artikel/${post.slug}`}
                                    className="group flex items-start gap-4 rounded-card border border-line bg-white p-4 shadow-soft transition-all duration-220 ease-brand hover:-translate-y-0.5 hover:border-ocean/40 hover:shadow-lift"
                                >
                                    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-control bg-mist text-ocean">
                                        {post.cover ? (
                                            <img
                                                src={post.cover}
                                                alt={post.title}
                                                loading="lazy"
                                                className="h-full w-full object-cover transition-transform duration-220 group-hover:scale-[1.04]"
                                            />
                                        ) : (
                                            <Newspaper size={22} strokeWidth={1.75} />
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between gap-2 text-[11px] text-slate">
                                            <span className="truncate font-bold uppercase tracking-wider text-ocean">
                                                {post.category}
                                            </span>
                                            <span className="shrink-0">{post.published_at}</span>
                                        </div>
                                        <h4 className="mt-1 line-clamp-2 text-sm font-semibold text-ink transition-colors group-hover:text-ocean">
                                            {post.title}
                                        </h4>
                                        <p className="mt-1 line-clamp-1 text-xs text-slate">
                                            {post.excerpt}
                                        </p>
                                    </div>
                                </Link>
                            </RevealItem>
                        ))}
                    </RevealGroup>
                </div>
            </div>
        </RevealSection>
    );
}
