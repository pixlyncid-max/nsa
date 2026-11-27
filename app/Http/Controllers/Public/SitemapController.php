<?php

namespace App\Http\Controllers\Public;

use App\Enums\PostType;
use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\Product;
use App\Models\Setting;
use Illuminate\Http\Response;
use Illuminate\Support\Carbon;

class SitemapController extends Controller
{
    /**
     * Hasilkan sitemap_index.xml yang menunjuk ke sub-sitemap halaman, artikel/berita, dan produk.
     */
    public function sitemapIndex(): Response
    {
        $baseUrl = $this->resolveBaseUrl();

        $latestPostAt = Post::query()->visiblePublicly()->max('updated_at');
        $latestProductAt = Product::query()->where('is_active', true)->max('updated_at');
        $nowAtom = now()->toAtomString();

        $sitemaps = [
            [
                'loc' => $baseUrl.'/sitemap-pages.xml',
                'lastmod' => $nowAtom,
            ],
            [
                'loc' => $baseUrl.'/sitemap-posts.xml',
                'lastmod' => $latestPostAt ? Carbon::parse($latestPostAt)->toAtomString() : $nowAtom,
            ],
            [
                'loc' => $baseUrl.'/sitemap-products.xml',
                'lastmod' => $latestProductAt ? Carbon::parse($latestProductAt)->toAtomString() : $nowAtom,
            ],
        ];

        $xml = '<?xml version="1.0" encoding="UTF-8"?>';
        $xml .= '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

        foreach ($sitemaps as $item) {
            $xml .= '<sitemap>';
            $xml .= '<loc>'.htmlspecialchars($item['loc'], ENT_XML1).'</loc>';
            $xml .= '<lastmod>'.$item['lastmod'].'</lastmod>';
            $xml .= '</sitemap>';
        }

        $xml .= '</sitemapindex>';

        return response($xml, 200, [
            'Content-Type' => 'application/xml; charset=UTF-8',
        ]);
    }

    /**
     * Hasilkan XML sitemap gabungan untuk mesin pencari (memuat bahasa id & en).
     */
    public function index(): Response
    {
        $baseUrl = $this->resolveBaseUrl();

        $posts = Post::query()
            ->visiblePublicly()
            ->latest('updated_at')
            ->get(['slug', 'type', 'updated_at']);

        $products = Product::query()
            ->where('is_active', true)
            ->latest('updated_at')
            ->get(['slug', 'updated_at']);

        $xml = '<?xml version="1.0" encoding="UTF-8"?>';
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">';

        foreach ($this->staticPaths() as $item) {
            $xml .= $this->renderLocalizedPair(
                $baseUrl,
                $item['path'],
                null,
                $item['changefreq'],
                $item['priority']
            );
        }

        foreach ($posts as $post) {
            $prefix = $post->type === PostType::News ? '/berita/' : '/artikel/';
            $xml .= $this->renderLocalizedPair(
                $baseUrl,
                $prefix.$post->slug,
                $post->updated_at?->toAtomString(),
                'weekly',
                '0.8'
            );
        }

        foreach ($products as $prod) {
            $xml .= $this->renderLocalizedPair(
                $baseUrl,
                '/produk/detail/'.$prod->slug,
                $prod->updated_at?->toAtomString(),
                'weekly',
                '0.7'
            );
        }

        $xml .= '</urlset>';

        return response($xml, 200, [
            'Content-Type' => 'application/xml; charset=UTF-8',
        ]);
    }

    /**
     * Sub-sitemap khusus halaman statis utama.
     */
    public function pages(): Response
    {
        $baseUrl = $this->resolveBaseUrl();

        $xml = '<?xml version="1.0" encoding="UTF-8"?>';
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">';

        foreach ($this->staticPaths() as $item) {
            $xml .= $this->renderLocalizedPair(
                $baseUrl,
                $item['path'],
                null,
                $item['changefreq'],
                $item['priority']
            );
        }

        $xml .= '</urlset>';

        return response($xml, 200, [
            'Content-Type' => 'application/xml; charset=UTF-8',
        ]);
    }

    /**
     * Sub-sitemap khusus artikel & berita organisasi.
     */
    public function posts(): Response
    {
        $baseUrl = $this->resolveBaseUrl();

        $posts = Post::query()
            ->visiblePublicly()
            ->latest('updated_at')
            ->get(['slug', 'type', 'updated_at']);

        $xml = '<?xml version="1.0" encoding="UTF-8"?>';
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">';

        foreach ($posts as $post) {
            $prefix = $post->type === PostType::News ? '/berita/' : '/artikel/';
            $xml .= $this->renderLocalizedPair(
                $baseUrl,
                $prefix.$post->slug,
                $post->updated_at?->toAtomString(),
                'weekly',
                '0.8'
            );
        }

        $xml .= '</urlset>';

        return response($xml, 200, [
            'Content-Type' => 'application/xml; charset=UTF-8',
        ]);
    }

    /**
     * Sub-sitemap khusus produk aktif.
     */
    public function products(): Response
    {
        $baseUrl = $this->resolveBaseUrl();

        $products = Product::query()
            ->where('is_active', true)
            ->latest('updated_at')
            ->get(['slug', 'updated_at']);

        $xml = '<?xml version="1.0" encoding="UTF-8"?>';
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">';

        foreach ($products as $prod) {
            $xml .= $this->renderLocalizedPair(
                $baseUrl,
                '/produk/detail/'.$prod->slug,
                $prod->updated_at?->toAtomString(),
                'weekly',
                '0.7'
            );
        }

        $xml .= '</urlset>';

        return response($xml, 200, [
            'Content-Type' => 'application/xml; charset=UTF-8',
        ]);
    }

    /**
     * @return list<array{path: string, priority: string, changefreq: string}>
     */
    private function staticPaths(): array
    {
        return [
            ['path' => '/', 'priority' => '1.0', 'changefreq' => 'daily'],
            ['path' => '/tentang-kami', 'priority' => '0.8', 'changefreq' => 'monthly'],
            ['path' => '/organisasi/dpp', 'priority' => '0.8', 'changefreq' => 'monthly'],
            ['path' => '/organisasi/dpw', 'priority' => '0.8', 'changefreq' => 'monthly'],
            ['path' => '/organisasi/dpc', 'priority' => '0.8', 'changefreq' => 'monthly'],
            ['path' => '/produk', 'priority' => '0.9', 'changefreq' => 'daily'],
            ...(filter_var(Setting::get('partnership_page_enabled', '0'), FILTER_VALIDATE_BOOLEAN)
                ? [['path' => '/kemitraan', 'priority' => '0.8', 'changefreq' => 'monthly']]
                : []),
            ['path' => '/artikel', 'priority' => '0.8', 'changefreq' => 'daily'],
            ['path' => '/berita', 'priority' => '0.8', 'changefreq' => 'daily'],
            ['path' => '/kontak', 'priority' => '0.7', 'changefreq' => 'monthly'],
        ];
    }

    private function resolveBaseUrl(): string
    {
        $hostUrl = request()->getSchemeAndHttpHost();
        if (is_string($hostUrl) && $hostUrl !== '' && ! str_contains($hostUrl, 'localhost')) {
            return rtrim($hostUrl, '/');
        }

        return rtrim((string) config('app.url', url('/')), '/');
    }

    private function renderLocalizedPair(
        string $baseUrl,
        string $path,
        ?string $lastmod,
        string $changefreq,
        string $priority
    ): string {
        $idUrl = $path === '/' ? $baseUrl.'/' : $baseUrl.$path;
        $enUrl = $path === '/' ? $baseUrl.'/en' : $baseUrl.'/en'.$path;

        $links = '<xhtml:link rel="alternate" hreflang="id" href="'.htmlspecialchars($idUrl, ENT_XML1).'" />'
            .'<xhtml:link rel="alternate" hreflang="en" href="'.htmlspecialchars($enUrl, ENT_XML1).'" />'
            .'<xhtml:link rel="alternate" hreflang="x-default" href="'.htmlspecialchars($idUrl, ENT_XML1).'" />';

        $lastmodTag = $lastmod ? '<lastmod>'.$lastmod.'</lastmod>' : '';

        $out = '';
        foreach ([$idUrl, $enUrl] as $loc) {
            $out .= '<url>';
            $out .= '<loc>'.htmlspecialchars($loc, ENT_XML1).'</loc>';
            $out .= $lastmodTag;
            $out .= '<changefreq>'.$changefreq.'</changefreq>';
            $out .= '<priority>'.$priority.'</priority>';
            $out .= $links;
            $out .= '</url>';
        }

        return $out;
    }
}
