<?php

namespace App\Http\Controllers\Public;

use App\Enums\PostType;
use App\Http\Controllers\Controller;
use App\Models\ContentTranslation;
use App\Models\Post;
use App\Models\PostCategory;
use App\Support\Brand;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PostController extends Controller
{
    /**
     * Tampilkan daftar postingan untuk /artikel atau /berita.
     */
    public function index(Request $request, string $type = 'article'): Response
    {
        $locale = app()->getLocale();
        $sourceLocale = (string) config('translation.source_locale', 'id');
        $postType = $type === 'news' ? PostType::News : PostType::Article;
        $typeLabel = $locale === 'en'
            ? ($postType === PostType::News ? 'News' : 'Articles')
            : ($postType === PostType::News ? 'Berita' : 'Artikel');

        $query = Post::query()
            ->where('type', $postType)
            ->visiblePublicly()
            ->withLocale($locale)
            ->with([
                'category' => fn ($q) => $q->select(['id', 'name', 'slug'])->withLocale($locale),
                'author:id,name',
            ]);

        // Filter Kategori (tetap memakai slug yang sama)
        if ($categorySlug = $request->input('category')) {
            $query->whereHas('category', function ($q) use ($categorySlug) {
                $q->where('slug', $categorySlug);
            });
        }

        // Pencarian Kata Kunci: cari pada teks Indonesia DAN terjemahan bahasa aktif
        if ($keyword = $request->input('q')) {
            $query->where(function ($q) use ($keyword, $locale, $sourceLocale) {
                $q->where('title', 'like', "%{$keyword}%")
                    ->orWhere('excerpt', 'like', "%{$keyword}%")
                    ->orWhere('body', 'like', "%{$keyword}%");

                if ($locale !== $sourceLocale) {
                    $q->orWhereHas('translations', function ($tr) use ($keyword, $locale) {
                        $tr->where('locale', $locale)
                            ->whereIn('status', [
                                ContentTranslation::STATUS_DONE,
                                ContentTranslation::STATUS_MANUAL,
                            ])
                            ->where('value', 'like', "%{$keyword}%");
                    });
                }
            });
        }

        $posts = $query->latest('published_at')->paginate(9)->withQueryString();

        // Transformasi field terlokalisasi + estimasi waktu baca
        $posts->getCollection()->transform(function (Post $post) use ($locale) {
            $localizedBody = (string) ($post->tr('body', $locale) ?? '');
            $wordCount = str_word_count(strip_tags($localizedBody));

            return [
                'id' => $post->id,
                'type' => $post->type?->value ?? (string) $post->type,
                'title' => $post->tr('title', $locale),
                'slug' => $post->slug,
                'excerpt' => $post->tr('excerpt', $locale),
                'body' => $localizedBody,
                'cover' => $post->coverUrl(),
                'status' => $post->status,
                'published_at' => $post->published_at,
                'reading_time' => max(1, (int) ceil($wordCount / 200)),
                'category' => $post->category ? [
                    'id' => $post->category->id,
                    'name' => $post->category->tr('name', $locale),
                    'slug' => $post->category->slug,
                ] : null,
                'author' => $post->publisher_name ? [
                    'id' => 0,
                    'name' => $post->publisher_name,
                ] : null,
            ];
        });

        $categories = PostCategory::whereHas('posts', function ($q) use ($postType) {
            $q->where('type', $postType)
                ->visiblePublicly();
        })
            ->withLocale($locale)
            ->get(['id', 'name', 'slug'])
            ->map(fn (PostCategory $cat) => [
                'id' => $cat->id,
                'name' => $cat->tr('name', $locale),
                'slug' => $cat->slug,
            ]);

        return Inertia::render('Public/Post/Index', [
            'type' => $type,
            'typeLabel' => $typeLabel,
            'posts' => $posts,
            'categories' => $categories,
            'filters' => [
                'category' => $request->input('category', ''),
                'q' => $request->input('q', ''),
            ],
        ]);
    }

    /**
     * Tampilkan detail artikel atau berita berdasarkan slug.
     */
    public function show(Request $request, string $slug, string $type = 'article'): Response
    {
        $locale = app()->getLocale();
        $postType = $type === 'news' ? PostType::News : PostType::Article;

        $postQuery = Post::query()
            ->where('slug', $slug)
            ->where('type', $postType)
            ->withLocale($locale)
            ->with([
                'category' => fn ($q) => $q->select(['id', 'name', 'slug'])->withLocale($locale),
                'author:id,name',
            ]);

        // Jika bukan admin/staff, hanya postingan published yang bisa dibuka
        $user = $request->user();
        if (! $user || ! $user->isStaff()) {
            $postQuery->visiblePublicly();
        }

        $post = $postQuery->firstOrFail();

        $localizedBody = (string) ($post->tr('body', $locale) ?? '');
        $wordCount = str_word_count(strip_tags($localizedBody));
        $readingTime = max(1, (int) ceil($wordCount / 200));

        // Artikel / Berita Terkait (kategori sama, maks 3 item)
        $relatedPosts = Post::query()
            ->where('type', $postType)
            ->visiblePublicly()
            ->where('id', '!=', $post->id)
            ->when($post->category_id, fn ($q) => $q->where('category_id', $post->category_id))
            ->latest('published_at')
            ->take(3)
            ->withLocale($locale)
            ->with([
                'category' => fn ($q) => $q->select(['id', 'name', 'slug'])->withLocale($locale),
                'author:id,name',
            ])
            ->get()
            ->map(fn (Post $rel) => [
                'id' => $rel->id,
                'title' => $rel->tr('title', $locale),
                'slug' => $rel->slug,
                'excerpt' => $rel->tr('excerpt', $locale),
                'cover' => $rel->coverUrl(),
                'published_at' => $rel->published_at,
                'category' => $rel->category ? [
                    'id' => $rel->category->id,
                    'name' => $rel->category->tr('name', $locale),
                    'slug' => $rel->category->slug,
                ] : null,
                'author' => $rel->publisher_name ? [
                    'id' => 0,
                    'name' => $rel->publisher_name,
                ] : null,
            ]);

        $localizedTitle = (string) ($post->tr('title', $locale) ?? $post->title);
        $localizedExcerpt = (string) ($post->tr('excerpt', $locale) ?? '');
        $seoDescription = Str::limit(
            trim((string) preg_replace('/\s+/', ' ', html_entity_decode(strip_tags($localizedExcerpt !== '' ? $localizedExcerpt : $localizedBody), ENT_QUOTES | ENT_HTML5, 'UTF-8'))),
            160
        );

        $plainArticleBody = trim((string) preg_replace('/\s+/', ' ', html_entity_decode(strip_tags($localizedBody), ENT_QUOTES | ENT_HTML5, 'UTF-8')));
        $absoluteCover = $post->coverUrl()
            ? (preg_match('/^https?:\/\//i', (string) $post->coverUrl())
                ? $post->coverUrl()
                : rtrim(request()->getSchemeAndHttpHost(), '/').'/'.ltrim((string) $post->coverUrl(), '/'))
            : null;
        $brandName = Brand::name();
        $siteOrigin = rtrim(request()->getSchemeAndHttpHost(), '/');
        $authorName = $post->publisher_name ?: $brandName;

        $articleSchema = array_filter([
            '@context' => 'https://schema.org',
            '@type' => $postType === PostType::News ? 'NewsArticle' : 'Article',
            'headline' => $localizedTitle,
            'description' => $seoDescription,
            'image' => $absoluteCover ? [$absoluteCover] : null,
            'datePublished' => ($post->published_at ?? $post->created_at)?->toAtomString(),
            'dateModified' => $post->updated_at?->toAtomString(),
            'author' => [
                '@type' => $post->publisher_name ? 'Person' : 'Organization',
                'name' => $authorName,
            ],
            'publisher' => [
                '@type' => 'Organization',
                'name' => $brandName,
                'url' => $siteOrigin,
                'logo' => [
                    '@type' => 'ImageObject',
                    'url' => $siteOrigin.'/images/brand/logo-navbar@3x.png',
                ],
            ],
            'mainEntityOfPage' => [
                '@type' => 'WebPage',
                '@id' => url()->current(),
            ],
            'articleBody' => Str::limit($plainArticleBody, 5000),
        ], fn ($v) => $v !== null);

        return Inertia::render('Public/Post/Show', [
            'type' => $type,
            'typeLabel' => $locale === 'en'
                ? ($postType === PostType::News ? 'News' : 'Article')
                : ($postType === PostType::News ? 'Berita' : 'Artikel'),
            'post' => [
                'id' => $post->id,
                'title' => $localizedTitle,
                'slug' => $post->slug,
                'excerpt' => $localizedExcerpt,
                'body' => $localizedBody,
                'cover' => $post->coverUrl(),
                'published_at' => $post->published_at?->translatedFormat('d F Y') ?? '',
                'category' => $post->category ? [
                    'id' => $post->category->id,
                    'name' => $post->category->tr('name', $locale),
                    'slug' => $post->category->slug,
                ] : null,
                'author' => $post->publisher_name ? [
                    'id' => 0,
                    'name' => $post->publisher_name,
                ] : null,
                'reading_time' => $readingTime,
            ],
            'relatedPosts' => $relatedPosts,
        ])->withViewData('seo', [
            'type' => 'article',
            'title' => $localizedTitle.' | '.Brand::shortName(),
            'description' => $seoDescription,
            'image' => $post->coverUrl(),
            'url' => url()->current(),
            'schema' => $articleSchema,
            'noscript' => [
                'title' => $localizedTitle,
                'date' => $post->published_at?->translatedFormat('d F Y') ?? '',
                'author' => $post->publisher_name,
                'excerpt' => $localizedExcerpt,
                'body' => $plainArticleBody,
            ],
        ]);
    }
}
