import ArchImage from '@/Components/layout/ArchImage';
import Section from '@/Components/layout/Section';
import SectionHeading from '@/Components/layout/SectionHeading';
import Carousel from '@/Components/ui/Carousel';
import { useLocale } from '@/lib/lroute';
import { Link } from '@inertiajs/react';
import { ArrowRight, Calendar, Clock, Newspaper } from 'lucide-react';

export interface PostItem {
    id: number;
    type?: 'article' | 'news' | string;
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

function formatDate(dateStr: string | null, isEn: boolean) {
    if (!dateStr) return { dayMonth: '--/--', full: isEn ? 'Latest' : 'Terbaru' };
    try {
        const d = new Date(dateStr);
        if (Number.isNaN(d.getTime())) {
            return { dayMonth: '--/--', full: dateStr };
        }
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        const monthNames = isEn
            ? [
                  'January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December',
              ]
            : [
                  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
              ];
        return {
            dayMonth: `${day}/${month}`,
            full: `${day} ${monthNames[d.getMonth()]} ${year}`,
        };
    } catch {
        return { dayMonth: '--/--', full: isEn ? 'Latest' : 'Terbaru' };
    }
}

export default function NewsSection({ posts = [] }: NewsSectionProps) {
    const { isEn, lp } = useLocale();
    if (!posts || posts.length === 0) return null;

    const postHref = (post: PostItem) =>
        lp(post.type === 'news' ? `/berita/${post.slug}` : `/artikel/${post.slug}`);

    const mainPost = posts[0];
    const mediumPosts = posts.slice(1, 3);

    return (
        <Section
            id="berita-terkini"
            index="03"
            label={isEn ? 'News & Updates' : 'Warta & Informasi'}
            tone="white"
            bleed={false}
            className="border-b border-line"
        >
            <SectionHeading
                eyebrow={isEn ? 'Updates & Policy' : 'Kabar & Kebijakan'}
                title={isEn ? 'Latest Fisheries News' : 'Warta Perikanan Terkini'}
                description={
                    isEn
                        ? 'Latest aquaculture regulations, regional training schedules, and sustainable fisheries technology research.'
                        : 'Regulasi budidaya terkini, agenda pelatihan cabang, dan riset teknologi perikanan berkelanjutan.'
                }
                align="split"
                actions={
                    <Link
                        href={lp('/artikel')}
                        className="group inline-flex items-center gap-2 text-sm font-semibold text-ocean transition-colors hover:text-navy"
                    >
                        {isEn ? 'View All News' : 'Lihat Semua Berita'}
                        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </Link>
                }
            />

            {/* Mobile View: Swiper / Carousel Only */}
            <div className="mt-8 block md:hidden">
                <Carousel label={isEn ? 'Latest fisheries news' : 'Warta perikanan terkini'} perView={{ base: 1 }} gap={16}>
                    {posts.slice(0, 5).map((post) => {
                        const dateInfo = formatDate(post.published_at, isEn);
                        return (
                            <article
                                key={post.id}
                                className="flex flex-col overflow-hidden rounded-card border border-line bg-white shadow-soft"
                            >
                                <div className="relative aspect-[16/10] w-full bg-mist overflow-hidden">
                                    {post.cover ? (
                                        <img
                                            src={post.cover}
                                            alt={post.title}
                                            className="h-full w-full object-cover"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-mist text-slate">
                                            <Newspaper className="h-10 w-10 text-ocean/40" />
                                        </div>
                                    )}
                                    <span className="absolute top-3 left-3 rounded-full bg-navy/90 px-2.5 py-0.5 text-[11px] font-semibold text-white">
                                        {post.category}
                                    </span>
                                </div>
                                <div className="p-5 flex-1 flex flex-col justify-between">
                                    <div>
                                        <span className="text-xs text-slate">{dateInfo.full}</span>
                                        <h3 className="mt-2 font-display text-base font-bold text-navy line-clamp-2">
                                            <Link href={postHref(post)} className="hover:text-ocean">
                                                {post.title}
                                            </Link>
                                        </h3>
                                        <p className="mt-2 text-xs text-slate line-clamp-2 leading-relaxed">
                                            {post.excerpt}
                                        </p>
                                    </div>
                                    <div className="mt-4 pt-3 border-t border-line">
                                        <Link
                                            href={postHref(post)}
                                            className="inline-flex items-center gap-1.5 text-xs font-bold text-ocean hover:text-navy"
                                        >
                                            {isEn ? 'Read More' : 'Baca Selengkapnya'}
                                            <ArrowRight className="h-3 w-3" />
                                        </Link>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </Carousel>
            </div>

            {/* Desktop Magazine Layout (Asymmetrical 5/4/3 Grid) */}
            <div className="mt-12 hidden md:grid md:grid-cols-12 gap-8 items-stretch">
                {/* 1. Berita Utama Besar (Foto Lengkung Atas ArchImage) - 5 Kolom */}
                {mainPost ? (
                    <article className="md:col-span-5 flex flex-col group">
                        <Link href={postHref(mainPost)} className="block relative overflow-hidden">
                            <ArchImage
                                src={mainPost.cover}
                                alt={mainPost.title}
                                aspectRatio="aspect-[4/5]"
                                className="transition-transform duration-500 group-hover:scale-[1.02]"
                            />
                            <div className="absolute top-4 left-4 rounded-full bg-navy px-3 py-1 text-xs font-semibold text-white shadow-xs">
                                {mainPost.category}
                            </div>
                        </Link>

                        <div className="mt-5">
                            <div className="flex items-center gap-2 text-xs text-slate">
                                <Calendar className="h-3.5 w-3.5 text-ocean" />
                                <span>{formatDate(mainPost.published_at, isEn).full}</span>
                            </div>

                            <h3 className="mt-2.5 font-display text-2xl font-bold text-navy transition-colors group-hover:text-ocean leading-snug">
                                <Link href={postHref(mainPost)}>
                                    {mainPost.title}
                                </Link>
                            </h3>

                            <p className="mt-3 text-sm text-slate leading-relaxed line-clamp-3">
                                {mainPost.excerpt}
                            </p>

                            <div className="mt-4">
                                <Link
                                    href={postHref(mainPost)}
                                    className="inline-flex items-center gap-2 text-sm font-semibold text-ocean transition-colors hover:text-navy"
                                >
                                    {isEn ? 'Read More' : 'Baca Selengkapnya'}
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                    </article>
                ) : null}

                {/* 2. Dua Berita Sedang - 4 Kolom */}
                <div className="md:col-span-4 space-y-6">
                    {mediumPosts.map((post) => {
                        const dateInfo = formatDate(post.published_at, isEn);
                        return (
                            <article
                                key={post.id}
                                className="group rounded-card border border-line bg-white p-4 shadow-soft transition-all duration-200 hover:border-ocean/40"
                            >
                                <Link href={postHref(post)} className="block relative aspect-[16/10] overflow-hidden rounded-control bg-mist">
                                    {post.cover ? (
                                        <img
                                            src={post.cover}
                                            alt={post.title}
                                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-slate">
                                            <Newspaper className="h-8 w-8 text-ocean/40" />
                                        </div>
                                    )}
                                    <span className="absolute top-2.5 left-2.5 rounded-full bg-navy/90 px-2.5 py-0.5 text-[10px] font-semibold text-white">
                                        {post.category}
                                    </span>
                                </Link>

                                <div className="mt-3.5">
                                    <span className="text-[11px] text-slate">{dateInfo.full}</span>
                                    <h4 className="mt-1 font-display text-base font-bold text-navy transition-colors group-hover:text-ocean line-clamp-2 leading-snug">
                                        <Link href={postHref(post)}>
                                            {post.title}
                                        </Link>
                                    </h4>
                                    <p className="mt-1.5 text-xs text-slate line-clamp-2 leading-relaxed">
                                        {post.excerpt}
                                    </p>
                                </div>
                            </article>
                        );
                    })}
                </div>

                {/* 3. Daftar Kilas Warta setinggi section Warta Perikanan dengan semua artikel */}
                <div className="md:col-span-3 md:relative">
                    <div className="flex h-full flex-col rounded-card border border-line bg-mist/60 p-5 shadow-xs md:absolute md:inset-0">
                        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-line pb-3">
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-ocean" />
                                <h4 className="font-display text-sm font-bold uppercase tracking-wider text-navy">
                                    {isEn ? 'News Briefs' : 'Kilas Warta'}
                                </h4>
                            </div>
                            <span className="rounded-full bg-white px-2 py-0.5 font-mono text-[10px] font-bold text-slate border border-line">
                                {posts.length}
                            </span>
                        </div>

                        <div className="mt-4 flex-1 overflow-y-auto pr-1.5">
                            <div className="relative ml-1.5 border-l-2 border-ocean/30 pl-4 space-y-5 pb-2">
                                {posts.map((post) => {
                                    const dateInfo = formatDate(post.published_at, isEn);
                                    return (
                                        <div key={post.id} className="relative group">
                                            {/* Titik rel */}
                                            <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-ocean" />

                                            <span className="font-mono text-[11px] font-bold text-ocean">
                                                {dateInfo.dayMonth}
                                            </span>

                                            <h5 className="mt-1 font-display text-xs font-bold text-navy leading-snug transition-colors group-hover:text-ocean line-clamp-2">
                                                <Link href={postHref(post)}>
                                                    {post.title}
                                                </Link>
                                            </h5>

                                            <span className="mt-1 block text-[10px] font-medium text-slate uppercase tracking-wider">
                                                {post.category}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Section>
    );
}
