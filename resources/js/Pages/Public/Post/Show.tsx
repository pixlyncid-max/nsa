import Container from '@/Components/layout/Container';
import Button from '@/Components/ui/Button';
import RichText, {
    prepareRichTextWithHeadings,
} from '@/Components/ui/RichText';
import { ArticleSchema } from '@/Components/ui/StructuredData';
import PublicLayout from '@/Layouts/PublicLayout';
import { cx } from '@/lib/cx';
import { resolveMembershipCta } from '@/lib/membershipCta';
import { focusRing } from '@/lib/ui';
import type { PageProps } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    BookOpen,
    Calendar,
    Check,
    Clock,
    Copy,
    Share2,
} from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

interface PostDetailProps {
    type: 'article' | 'news' | string;
    typeLabel: string;
    post: {
        id: number;
        title: string;
        slug: string;
        excerpt?: string;
        body: string;
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
    };
    relatedPosts: Array<{
        id: number;
        title: string;
        slug: string;
        excerpt?: string;
        cover?: string | null;
        published_at?: string;
        category?: { name: string };
    }>;
}

function formatRelatedDate(dateStr?: string): string {
    if (!dateStr) return 'Terbaru';
    if (!dateStr.includes('T') && !/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
        return dateStr;
    }
    try {
        return new Date(dateStr).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    } catch {
        return dateStr;
    }
}

export default function Show({
    type,
    typeLabel,
    post,
    relatedPosts = [],
}: PostDetailProps) {
    const { props } = usePage<PageProps>();
    const user = props.auth?.user;
    const promo = props.membershipPromo;
    const brandShort = props.brand?.short_name || 'NSA';
    const cta = resolveMembershipCta(user, promo, brandShort);

    const [copied, setCopied] = useState(false);
    const [readProgress, setReadProgress] = useState(0);
    const [activeHeadingId, setActiveHeadingId] = useState<string>('');
    const articleRef = useRef<HTMLElement>(null);

    const basePath = type === 'news' ? '/berita' : '/artikel';
    const currentUrl =
        typeof window !== 'undefined'
            ? window.location.href
            : `https://nsa.or.id${basePath}/${post.slug}`;

    // Ekstrak Daftar Isi otomatis dari heading h2/h3 dalam body artikel
    const { headings } = useMemo(
        () => prepareRichTextWithHeadings(post.body),
        [post.body]
    );

    // Bilah progres baca tipis di bawah header
    useEffect(() => {
        const handleScroll = () => {
            const el = articleRef.current;
            if (!el) return;
            const rect = el.getBoundingClientRect();
            const totalScrollable = el.offsetHeight - window.innerHeight * 0.6;
            if (totalScrollable <= 0) {
                setReadProgress(100);
                return;
            }
            const passed = Math.max(0, -rect.top);
            const pct = Math.min(100, Math.round((passed / totalScrollable) * 100));
            setReadProgress(pct);
        };

        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Scrollspy Daftar Isi (TOC) otomatis
    const currentHeadingId = activeHeadingId || headings[0]?.id || '';

    useEffect(() => {
        if (headings.length === 0) return;

        const targets = headings
            .map((h) => document.getElementById(h.id))
            .filter((el): el is HTMLElement => Boolean(el));

        if (targets.length === 0) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveHeadingId(entry.target.id);
                    }
                });
            },
            {
                rootMargin: '-18% 0px -65% 0px',
                threshold: 0,
            }
        );

        targets.forEach((t) => observer.observe(t));
        return () => observer.disconnect();
    }, [headings]);

    const handleScrollToHeading = (
        e: React.MouseEvent<HTMLAnchorElement>,
        id: string
    ) => {
        e.preventDefault();
        const el = document.getElementById(id);
        if (el) {
            const headerHeight = parseInt(
                getComputedStyle(document.documentElement).getPropertyValue(
                    '--header-h'
                ) || '72',
                10
            );
            const y =
                el.getBoundingClientRect().top +
                window.scrollY -
                (headerHeight + 28);
            window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
            setActiveHeadingId(id);
        }
    };

    const handleCopyLink = () => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(currentUrl);
            setCopied(true);
            toast.success('Tautan berhasil disalin ke clipboard!');
            setTimeout(() => setCopied(false), 2500);
        }
    };

    const shareToWhatsApp = () => {
        window.open(
            `https://api.whatsapp.com/send?text=${encodeURIComponent(
                `${post.title} - ${currentUrl}`
            )}`,
            '_blank',
            'noopener,noreferrer'
        );
    };

    return (
        <PublicLayout>
            <ArticleSchema
                type={type === 'news' ? 'NewsArticle' : 'Article'}
                title={post.title}
                description={post.excerpt || post.title}
                url={currentUrl}
                datePublished={post.published_at}
                authorName={post.author?.name || 'Redaksi NSA'}
                imageUrl={post.cover ?? undefined}
            />
            <Head title={`${post.title} | ${typeLabel} NSA`}>
                <meta name="description" content={post.excerpt || post.title} />
                <link rel="canonical" href={currentUrl} />

                <meta property="og:type" content="article" />
                <meta
                    property="og:title"
                    content={`${post.title} | ${typeLabel} NSA`}
                />
                <meta
                    property="og:description"
                    content={post.excerpt || post.title}
                />
                <meta property="og:url" content={currentUrl} />
                {post.cover ? (
                    <meta property="og:image" content={post.cover} />
                ) : null}
                <meta property="og:site_name" content="NSA Indonesia" />

                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={post.title} />
                <meta
                    name="twitter:description"
                    content={post.excerpt || post.title}
                />
                {post.cover ? (
                    <meta name="twitter:image" content={post.cover} />
                ) : null}
            </Head>

            {/* Bilah Progres Baca Tipis di Bawah Header */}
            <div
                aria-hidden="true"
                style={{ top: 'var(--header-h, 72px)' }}
                className="fixed inset-x-0 z-30 h-1 bg-line/60"
            >
                <div
                    className="h-full bg-ocean transition-[width] duration-150 ease-out"
                    style={{ width: `${readProgress}%` }}
                />
            </div>

            <article ref={articleRef} className="bg-white pb-20 pt-8 sm:pt-12">
                {/* Header Artikel */}
                <Container className={headings.length > 0 ? 'max-w-7xl' : 'max-w-4xl'}>
                    <div
                        className={
                            headings.length > 0
                                ? 'grid grid-cols-1 items-start gap-10 lg:grid-cols-12'
                                : ''
                        }
                    >
                        {/* Sidebar Kiri: Daftar Isi Menempel (Sticky) */}
                        {headings.length > 0 ? (
                            <aside
                                className="hidden lg:sticky lg:col-span-3 lg:block"
                                style={{
                                    top: 'calc(var(--header-h, 72px) + 28px)',
                                }}
                            >
                                <nav
                                    aria-label="Daftar isi artikel"
                                    className="max-h-[calc(100vh-120px)] overflow-y-auto rounded-card border border-line bg-mist/45 p-5"
                                >
                                    <p className="t-eyebrow border-b border-line pb-2.5 text-slate">
                                        Daftar Isi
                                    </p>
                                    <ul className="mt-3 space-y-1.5">
                                        {headings.map((h) => {
                                            const isActive =
                                                currentHeadingId === h.id;
                                            return (
                                                <li
                                                    key={h.id}
                                                    className={
                                                        h.level === 3
                                                            ? 'pl-3'
                                                            : ''
                                                    }
                                                >
                                                    <a
                                                        href={`#${h.id}`}
                                                        onClick={(e) =>
                                                            handleScrollToHeading(
                                                                e,
                                                                h.id
                                                            )
                                                        }
                                                        aria-current={
                                                            isActive
                                                                ? 'location'
                                                                : undefined
                                                        }
                                                        className={cx(
                                                            'block rounded-control border-l-2 px-2.5 py-1.5 text-xs leading-snug transition-colors',
                                                            focusRing,
                                                            isActive
                                                                ? 'border-ocean bg-white font-bold text-ocean shadow-xs'
                                                                : 'border-transparent font-medium text-slate hover:border-line hover:text-navy'
                                                        )}
                                                    >
                                                        {h.text}
                                                    </a>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </nav>
                            </aside>
                        ) : null}

                        {/* Kolom Utama: Foto, Judul, Penerbit, dan Isi Teks rata ujung gambar */}
                        <div className={headings.length > 0 ? 'lg:col-span-9' : ''}>
                            <div className="mb-6">
                                <Link
                                    href={basePath}
                                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate transition-colors hover:text-navy"
                                >
                                    <ArrowLeft className="h-3.5 w-3.5" />
                                    Kembali ke Indeks {typeLabel}
                                </Link>
                            </div>

                            {/* Foto Sampul Artikel di Atas Judul — sejajar penuh dengan judul & isi teks */}
                            {post.cover ? (
                                <div className="aspect-[16/9] max-h-[500px] w-full overflow-hidden rounded-card border border-line bg-mist shadow-soft">
                                    <img
                                        src={post.cover}
                                        alt={post.title}
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                            ) : null}

                            <div
                                className={cx(
                                    'flex flex-wrap items-center gap-3 text-xs text-slate',
                                    post.cover ? 'mt-8' : ''
                                )}
                            >
                                {post.category ? (
                                    <Link
                                        href={`${basePath}?category=${post.category.slug}`}
                                        className="rounded-full border border-ocean/25 bg-ocean/10 px-3 py-1 font-bold text-ocean hover:bg-ocean hover:text-white transition-colors"
                                    >
                                        {post.category.name}
                                    </Link>
                                ) : null}
                                <span className="inline-flex items-center gap-1.5">
                                    <Calendar className="h-3.5 w-3.5 text-ocean" />
                                    {post.published_at}
                                </span>
                                <span>·</span>
                                <span className="inline-flex items-center gap-1.5">
                                    <Clock className="h-3.5 w-3.5 text-ocean" />
                                    {post.reading_time} menit waktu baca
                                </span>
                            </div>

                            <h1 className="mt-4 w-full font-display text-3xl font-extrabold leading-[1.15] tracking-tight text-navy sm:text-4xl lg:text-5xl">
                                {post.title}
                            </h1>

                            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-y border-line py-4">
                                {post.author?.name ? (
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-mist font-display text-sm font-bold text-ocean">
                                            {post.author.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="text-sm font-bold text-navy">
                                            {post.author.name}
                                        </div>
                                    </div>
                                ) : (
                                    <div />
                                )}

                                {/* Tombol Bagikan */}
                                <div className="flex items-center gap-2">
                                    <span className="hidden items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate sm:inline-flex mr-1">
                                        <Share2 className="h-3.5 w-3.5 text-ocean" />
                                        Bagikan
                                    </span>
                                    <button
                                        type="button"
                                        onClick={shareToWhatsApp}
                                        className={cx(
                                            'inline-flex min-h-[36px] items-center rounded-control border border-line bg-mist px-3 text-xs font-bold text-navy transition-colors hover:border-emerald-500 hover:text-emerald-700',
                                            focusRing
                                        )}
                                    >
                                        WhatsApp
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCopyLink}
                                        className={cx(
                                            'inline-flex min-h-[36px] items-center gap-1.5 rounded-control border border-line bg-white px-3 text-xs font-bold text-navy transition-colors hover:border-ocean hover:text-ocean',
                                            focusRing
                                        )}
                                    >
                                        {copied ? (
                                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                                        ) : (
                                            <Copy className="h-3.5 w-3.5 text-ocean" />
                                        )}
                                        <span>{copied ? 'Tersalin' : 'Salin Tautan'}</span>
                                    </button>
                                </div>
                            </div>

                            {/* Isi Artikel: selebar gambar & rata kiri-kanan */}
                            <div className="mt-8 w-full sm:mt-10">
                                {post.excerpt ? (
                                    <blockquote className="mb-8 rounded-r-control border-l-4 border-aqua bg-mist/45 px-5 py-4 text-justify font-sans text-base font-medium italic leading-relaxed text-navy sm:text-lg">
                                        &ldquo;{post.excerpt}&rdquo;
                                    </blockquote>
                                ) : null}

                                <RichText content={post.body} />
                            </div>
                        </div>
                    </div>
                </Container>
            </article>

            {/* Akhir Artikel: Artikel Terkait (Tiga Baris Editorial) + Ajakan Keanggotaan */}
            <section className="border-t border-line bg-mist/50 py-14 sm:py-16">
                <Container className="space-y-14">
                    {relatedPosts.length > 0 ? (
                        <div>
                            <div className="mb-6 flex items-end justify-between gap-4">
                                <div>
                                    <span className="t-eyebrow text-ocean">
                                        Bacaan Lanjutan
                                    </span>
                                    <h2 className="mt-1 font-display text-2xl font-bold text-navy sm:text-3xl">
                                        {typeLabel} Terkait Lainnya
                                    </h2>
                                </div>
                                <Link
                                    href={basePath}
                                    className="text-xs font-bold text-ocean hover:text-navy"
                                >
                                    Lihat Semua →
                                </Link>
                            </div>

                            {/* Tiga Baris Editorial */}
                            <div className="divide-y divide-line border-y border-line bg-white/70 px-4 sm:px-6 rounded-card">
                                {relatedPosts.slice(0, 3).map((item) => (
                                    <article
                                        key={item.id}
                                        className="group grid grid-cols-1 items-center gap-4 py-5 md:grid-cols-12 md:gap-6"
                                    >
                                        <div className="font-mono text-xs font-bold text-ocean md:col-span-2">
                                            {formatRelatedDate(
                                                item.published_at
                                            )}
                                        </div>

                                        <div className="md:col-span-7">
                                            {item.category ? (
                                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate">
                                                    {item.category.name}
                                                </span>
                                            ) : null}
                                            <h3 className="mt-0.5 font-display text-lg font-bold text-navy transition-colors group-hover:text-ocean">
                                                <Link
                                                    href={`${basePath}/${item.slug}`}
                                                >
                                                    {item.title}
                                                </Link>
                                            </h3>
                                            {item.excerpt ? (
                                                <p className="mt-1 line-clamp-1 text-xs text-slate">
                                                    {item.excerpt}
                                                </p>
                                            ) : null}
                                        </div>

                                        <div className="md:col-span-3">
                                            <Link
                                                href={`${basePath}/${item.slug}`}
                                                className="block aspect-[16/10] overflow-hidden rounded-control border border-line bg-mist"
                                            >
                                                {item.cover ? (
                                                    <img
                                                        src={item.cover}
                                                        alt={item.title}
                                                        loading="lazy"
                                                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center text-ocean/35">
                                                        <BookOpen className="h-6 w-6" />
                                                    </div>
                                                )}
                                            </Link>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </div>
                    ) : null}

                    {/* Ajakan Keanggotaan Sesuai Status User */}
                    <div className="rounded-2xl border border-line bg-navy p-8 text-white shadow-soft sm:p-10">
                        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
                            <div className="max-w-xl">
                                <span className="t-eyebrow text-aqua">
                                    Komunitas Resmi {brandShort}
                                </span>
                                <h2 className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">
                                    {cta.title}
                                </h2>
                                <p className="mt-2 text-sm leading-relaxed text-mist/85">
                                    {cta.description}
                                </p>
                            </div>
                            <Button
                                href={cta.primaryHref}
                                size="lg"
                                className="shrink-0 !bg-aqua !text-navy hover:!bg-white font-bold"
                                icon={<ArrowRight className="h-4 w-4" />}
                            >
                                {cta.primaryLabel}
                            </Button>
                        </div>
                    </div>
                </Container>
            </section>
        </PublicLayout>
    );
}
