import { spring } from '@/animations/variants';
import ArchImage from '@/Components/layout/ArchImage';
import Container from '@/Components/layout/Container';
import PageHeader from '@/Components/layout/PageHeader';
import Button from '@/Components/ui/Button';
import EmptyState from '@/Components/ui/EmptyState';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';
import PublicLayout from '@/Layouts/PublicLayout';
import { cx } from '@/lib/cx';
import { focusRing } from '@/lib/ui';
import { Head, Link, router } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    ArrowRight,
    BookOpen,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Clock,
    Newspaper,
    Search,
    Sparkles,
    X,
} from 'lucide-react';
import React, { useState } from 'react';

interface CategoryItem {
    id: number;
    name: string;
    slug: string;
}

interface PostItem {
    id: number;
    title: string;
    slug: string;
    excerpt?: string;
    cover?: string | null;
    published_at: string;
    reading_time: number;
    category?: {
        id: number;
        name: string;
        slug: string;
    };
    author?: {
        name: string;
    };
}

interface PostIndexProps {
    type: 'article' | 'news' | string;
    typeLabel: string;
    posts: {
        data: PostItem[];
        current_page: number;
        last_page: number;
        prev_page_url: string | null;
        next_page_url: string | null;
        total: number;
    };
    categories: CategoryItem[];
    filters: {
        category: string;
        q: string;
    };
}

export default function Index({
    type,
    typeLabel,
    posts,
    categories = [],
    filters,
}: PostIndexProps) {
    const reduced = usePrefersReducedMotion();
    const [searchKeyword, setSearchKeyword] = useState(filters.q || '');
    const currentCategory = filters.category || '';
    const basePath = type === 'news' ? '/berita' : '/artikel';

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            basePath,
            {
                ...filters,
                q: searchKeyword,
            },
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    const handleSelectCategory = (catSlug: string) => {
        router.get(
            basePath,
            {
                ...filters,
                category: catSlug === currentCategory ? '' : catSlug,
            },
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    const showLeadPost =
        posts.current_page === 1 &&
        !filters.q &&
        !currentCategory &&
        posts.data.length > 0;

    const leadPost = showLeadPost ? posts.data[0] : null;
    const listPosts = showLeadPost ? posts.data.slice(1) : posts.data;

    return (
        <PublicLayout>
            <Head title={`${typeLabel} Perikanan & Akuakultur · NSA Indonesia`}>
                <meta
                    name="description"
                    content={`Kumpulan ${typeLabel.toLowerCase()} terkini seputar inovasi budidaya air tawar, marikultur, regulasi pemerintah, dan teknologi perikanan Indonesia.`}
                />
            </Head>

            <PageHeader
                breadcrumbs={[
                    { label: 'Beranda', href: '/' },
                    { label: typeLabel },
                ]}
                eyebrow="Warta & Literasi Akuakultur"
                title={`${typeLabel} & Analisis Industri Bahari`}
                description="Panduan teknis budidaya, pembaruan regulasi nasional, serta dinamika pasar perikanan langsung dari lapangan."
            >
                {/* Switcher Artikel / Berita */}
                <div className="flex flex-wrap items-center gap-2">
                    {(
                        [
                            ['article', '/artikel', 'Artikel & Panduan', BookOpen],
                            ['news', '/berita', 'Berita Organisasi', Newspaper],
                        ] as const
                    ).map(([id, href, label, Icon]) => {
                        const active = type === id;
                        return (
                            <Link
                                key={id}
                                href={href}
                                className={cx(
                                    'relative inline-flex min-h-[40px] items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold transition-colors',
                                    focusRing,
                                    active
                                        ? 'text-white'
                                        : 'border border-line bg-white text-slate hover:border-ocean hover:text-navy'
                                )}
                            >
                                {active ? (
                                    <motion.span
                                        layoutId="post-type-pill"
                                        transition={spring}
                                        className="absolute inset-0 rounded-full bg-navy shadow-soft"
                                    />
                                ) : null}
                                <Icon className="relative z-10 h-3.5 w-3.5" />
                                <span className="relative z-10">{label}</span>
                            </Link>
                        );
                    })}
                </div>
            </PageHeader>

            {/* Filter Bar: Chip Kategori Geser (Kiri) + Kolom Cari (Kanan) */}
            <div className="border-b border-line bg-mist/45 py-4">
                <Container className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    {/* Chip Kategori yang Bisa Digeser */}
                    <div
                        role="tablist"
                        aria-label="Filter kategori"
                        className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none"
                    >
                        {[
                            { id: 0, name: 'Semua Topik', slug: '' },
                            ...categories,
                        ].map((cat) => {
                            const active =
                                (!currentCategory && !cat.slug) ||
                                currentCategory === cat.slug;
                            return (
                                <button
                                    key={cat.slug || 'all'}
                                    type="button"
                                    role="tab"
                                    aria-selected={active}
                                    onClick={() =>
                                        handleSelectCategory(cat.slug)
                                    }
                                    className={cx(
                                        'relative shrink-0 rounded-full px-4 py-2 text-xs transition-colors',
                                        focusRing,
                                        active
                                            ? 'bg-ocean font-bold text-white shadow-xs'
                                            : 'border border-line bg-white font-semibold text-slate hover:border-ocean hover:text-navy'
                                    )}
                                >
                                    {cat.name}
                                </button>
                            );
                        })}
                    </div>

                    {/* Kolom Cari di Sisi Kanan */}
                    <form
                        onSubmit={handleSearch}
                        className="flex w-full shrink-0 items-center gap-2 md:w-80"
                    >
                        <div className="relative flex-1">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" />
                            <input
                                type="text"
                                value={searchKeyword}
                                onChange={(e) =>
                                    setSearchKeyword(e.target.value)
                                }
                                placeholder={`Cari ${typeLabel.toLowerCase()}...`}
                                aria-label={`Cari ${typeLabel.toLowerCase()}`}
                                className={cx(
                                    'h-10 w-full rounded-control border border-line bg-white pl-9 pr-8 text-xs font-medium text-ink placeholder:text-slate focus:border-ocean',
                                    focusRing
                                )}
                            />
                            {searchKeyword ? (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearchKeyword('');
                                        router.get(
                                            basePath,
                                            { category: currentCategory },
                                            { preserveState: true }
                                        );
                                    }}
                                    aria-label="Hapus pencarian"
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate hover:text-navy"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            ) : null}
                        </div>
                        <Button type="submit" size="sm" className="h-10 px-4">
                            Cari
                        </Button>
                    </form>
                </Container>
            </div>

            <Container className="py-10 sm:py-14">
                {posts.data.length === 0 ? (
                    <div className="mx-auto max-w-md py-10">
                        <EmptyState
                            title={`Belum Ada ${typeLabel} Ditemukan`}
                            description={
                                filters.q
                                    ? `Tidak ada hasil untuk kata kunci "${filters.q}".`
                                    : 'Belum ada tulisan yang dipublikasikan pada kategori ini.'
                            }
                            action={
                                filters.q || currentCategory ? (
                                    <Button
                                        href={basePath}
                                        variant="secondary"
                                        size="sm"
                                    >
                                        Reset Filter
                                    </Button>
                                ) : undefined
                            }
                        />
                    </div>
                ) : (
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={`${type}-${currentCategory}-${filters.q}-${posts.current_page}`}
                            initial={
                                reduced ? undefined : { opacity: 0, y: 12 }
                            }
                            animate={{ opacity: 1, y: 0 }}
                            exit={reduced ? undefined : { opacity: 0, y: -12 }}
                            transition={{ duration: 0.25 }}
                            className="space-y-12"
                        >
                            {/* Artikel Utama Besar di Atas */}
                            {leadPost ? (
                                <article className="group grid grid-cols-1 items-center gap-8 border-b border-line pb-12 lg:grid-cols-12 lg:gap-12">
                                    <div className="lg:col-span-7">
                                        <Link
                                            href={`${basePath}/${leadPost.slug}`}
                                            className="block"
                                        >
                                            <ArchImage
                                                src={leadPost.cover}
                                                alt={leadPost.title}
                                                aspectRatio="aspect-[16/10]"
                                                priority
                                                className="shadow-soft"
                                            />
                                        </Link>
                                    </div>

                                    <div className="lg:col-span-5">
                                        <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate">
                                            {leadPost.category ? (
                                                <span className="rounded-full bg-ocean/10 px-3 py-1 font-bold text-ocean">
                                                    {leadPost.category.name}
                                                </span>
                                            ) : null}
                                            <span className="inline-flex items-center gap-1 font-medium">
                                                <Clock className="h-3.5 w-3.5 text-ocean" />
                                                {leadPost.reading_time} menit
                                                baca
                                            </span>
                                        </div>

                                        <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-navy transition-colors group-hover:text-ocean sm:text-4xl leading-[1.12]">
                                            <Link
                                                href={`${basePath}/${leadPost.slug}`}
                                            >
                                                {leadPost.title}
                                            </Link>
                                        </h2>

                                        {leadPost.excerpt ? (
                                            <p className="measure mt-4 text-sm leading-relaxed text-slate sm:text-base">
                                                {leadPost.excerpt}
                                            </p>
                                        ) : null}

                                        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-4">
                                            <div className="text-xs text-slate">
                                                <span className="font-bold text-navy">
                                                    {leadPost.author?.name ||
                                                        'Redaksi NSA'}
                                                </span>{' '}
                                                · {leadPost.published_at}
                                            </div>
                                            <Link
                                                href={`${basePath}/${leadPost.slug}`}
                                                className="inline-flex items-center gap-1.5 text-sm font-bold text-ocean hover:text-navy"
                                            >
                                                Baca Artikel Utama
                                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                            </Link>
                                        </div>
                                    </div>
                                </article>
                            ) : null}

                            {/* Daftar Bergaya Baris Editorial dengan Sorotan Berkala */}
                            {listPosts.length > 0 ? (
                                <div className="divide-y divide-line border-b border-line">
                                    {listPosts.map((post, idx) => {
                                        // Setiap beberapa baris (indeks 3, 7, ...) sisipkan sorotan berukuran besar
                                        const isSpotlight = idx % 4 === 3;

                                        if (isSpotlight) {
                                            return (
                                                <article
                                                    key={post.id}
                                                    className="group my-6 grid grid-cols-1 items-center gap-6 rounded-2xl bg-mist/60 p-6 sm:p-8 lg:grid-cols-12 lg:gap-10"
                                                >
                                                    <div className="lg:col-span-7">
                                                        <div className="flex flex-wrap items-center gap-2.5 text-xs">
                                                            <span className="inline-flex items-center gap-1 rounded-full bg-navy px-3 py-0.5 font-bold text-aqua">
                                                                <Sparkles className="h-3 w-3" />
                                                                Sorotan Redaksi
                                                            </span>
                                                            {post.category ? (
                                                                <span className="font-bold text-ocean">
                                                                    {
                                                                        post
                                                                            .category
                                                                            .name
                                                                    }
                                                                </span>
                                                            ) : null}
                                                            <span className="text-slate">
                                                                ·{' '}
                                                                {
                                                                    post.published_at
                                                                }
                                                            </span>
                                                        </div>

                                                        <h3 className="mt-3 font-display text-2xl font-extrabold text-navy transition-colors group-hover:text-ocean sm:text-3xl leading-snug">
                                                            <Link
                                                                href={`${basePath}/${post.slug}`}
                                                            >
                                                                {post.title}
                                                            </Link>
                                                        </h3>

                                                        {post.excerpt ? (
                                                            <p className="measure mt-3 text-sm leading-relaxed text-slate">
                                                                {post.excerpt}
                                                            </p>
                                                        ) : null}

                                                        <div className="mt-4 flex items-center gap-4 text-xs text-slate">
                                                            <span className="inline-flex items-center gap-1 font-semibold text-navy">
                                                                <Clock className="h-3.5 w-3.5 text-ocean" />
                                                                {
                                                                    post.reading_time
                                                                }{' '}
                                                                menit baca
                                                            </span>
                                                            <Link
                                                                href={`${basePath}/${post.slug}`}
                                                                className="inline-flex items-center gap-1 font-bold text-ocean hover:text-navy"
                                                            >
                                                                Baca
                                                                Selengkapnya
                                                                <ArrowRight className="h-3.5 w-3.5" />
                                                            </Link>
                                                        </div>
                                                    </div>

                                                    <div className="lg:col-span-5">
                                                        <Link
                                                            href={`${basePath}/${post.slug}`}
                                                            className="block aspect-[4/3] overflow-hidden rounded-card border border-line bg-white"
                                                        >
                                                            {post.cover ? (
                                                                <img
                                                                    src={
                                                                        post.cover
                                                                    }
                                                                    alt={
                                                                        post.title
                                                                    }
                                                                    loading="lazy"
                                                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                                />
                                                            ) : (
                                                                <div className="flex h-full w-full items-center justify-center text-ocean/40">
                                                                    <BookOpen className="h-10 w-10" />
                                                                </div>
                                                            )}
                                                        </Link>
                                                    </div>
                                                </article>
                                            );
                                        }

                                        return (
                                            <article
                                                key={post.id}
                                                className="group grid grid-cols-1 items-center gap-5 py-7 transition-colors hover:bg-mist/25 md:grid-cols-12 md:gap-8"
                                            >
                                                {/* Rel Tanggal di Kiri (2 kolom) */}
                                                <div className="flex items-center gap-3 md:col-span-2 md:flex-col md:items-start md:gap-1">
                                                    <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-ocean">
                                                        <Calendar className="h-3.5 w-3.5" />
                                                        {post.published_at}
                                                    </span>
                                                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate">
                                                        <Clock className="h-3 w-3" />
                                                        {post.reading_time}{' '}
                                                        menit
                                                    </span>
                                                </div>

                                                {/* Judul Besar + Ringkasan di Tengah (7 kolom) */}
                                                <div className="md:col-span-7">
                                                    {post.category ? (
                                                        <span className="text-[11px] font-bold uppercase tracking-wider text-ocean">
                                                            {post.category.name}
                                                        </span>
                                                    ) : null}

                                                    <h3 className="mt-1 font-display text-xl font-bold leading-snug text-navy transition-colors group-hover:text-ocean sm:text-2xl">
                                                        <Link
                                                            href={`${basePath}/${post.slug}`}
                                                        >
                                                            {post.title}
                                                        </Link>
                                                    </h3>

                                                    {post.excerpt ? (
                                                        <p className="measure mt-2 line-clamp-2 text-xs leading-relaxed text-slate sm:text-sm">
                                                            {post.excerpt}
                                                        </p>
                                                    ) : null}

                                                    <div className="mt-2.5 text-xs text-slate">
                                                        Oleh{' '}
                                                        <span className="font-semibold text-ink">
                                                            {post.author
                                                                ?.name ||
                                                                'Redaksi NSA'}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Foto Kecil di Kanan (3 kolom) */}
                                                <div className="md:col-span-3">
                                                    <Link
                                                        href={`${basePath}/${post.slug}`}
                                                        className="block aspect-[4/3] w-full overflow-hidden rounded-control border border-line bg-mist"
                                                    >
                                                        {post.cover ? (
                                                            <img
                                                                src={post.cover}
                                                                alt={post.title}
                                                                loading="lazy"
                                                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                            />
                                                        ) : (
                                                            <div className="flex h-full w-full items-center justify-center text-ocean/35">
                                                                <BookOpen className="h-8 w-8" />
                                                            </div>
                                                        )}
                                                    </Link>
                                                </div>
                                            </article>
                                        );
                                    })}
                                </div>
                            ) : null}

                            {/* Paginasi */}
                            {posts.last_page > 1 ? (
                                <div className="flex items-center justify-center gap-3 pt-4">
                                    {posts.prev_page_url ? (
                                        <Link
                                            href={posts.prev_page_url}
                                            preserveScroll
                                        >
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                            >
                                                <ChevronLeft className="mr-1 h-4 w-4" />
                                                Sebelumnya
                                            </Button>
                                        </Link>
                                    ) : (
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            disabled
                                            className="opacity-50"
                                        >
                                            <ChevronLeft className="mr-1 h-4 w-4" />
                                            Sebelumnya
                                        </Button>
                                    )}

                                    <span className="px-3 font-mono text-xs font-bold text-slate">
                                        Halaman {posts.current_page} /{' '}
                                        {posts.last_page}
                                    </span>

                                    {posts.next_page_url ? (
                                        <Link
                                            href={posts.next_page_url}
                                            preserveScroll
                                        >
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                            >
                                                Selanjutnya
                                                <ChevronRight className="ml-1 h-4 w-4" />
                                            </Button>
                                        </Link>
                                    ) : (
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            disabled
                                            className="opacity-50"
                                        >
                                            Selanjutnya
                                            <ChevronRight className="ml-1 h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            ) : null}
                        </motion.div>
                    </AnimatePresence>
                )}
            </Container>
        </PublicLayout>
    );
}
