<?php

namespace App\Http\Controllers\Public;

use App\Enums\PostType;
use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\Product;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    /**
     * Hasilkan XML sitemap dinamis untuk mesin pencari (memuat bahasa id & en).
     */
    public function index(): Response
    {
        $baseUrl = rtrim((string) config('app.url', url('/')), '/');

        // 1. Halaman Statis Utama
        $staticPaths = [
            ['path' => '/', 'priority' => '1.0', 'changefreq' => 'daily'],
            ['path' => '/tentang-kami', 'priority' => '0.8', 'changefreq' => 'monthly'],
            ['path' => '/organisasi/dpp', 'priority' => '0.8', 'changefreq' => 'monthly'],
            ['path' => '/organisasi/dpw', 'priority' => '0.8', 'changefreq' => 'monthly'],
            ['path' => '/organisasi/dpc', 'priority' => '0.8', 'changefreq' => 'monthly'],
            ['path' => '/produk', 'priority' => '0.9', 'changefreq' => 'daily'],
            ['path' => '/kemitraan', 'priority' => '0.8', 'changefreq' => 'monthly'],
            ['path' => '/artikel', 'priority' => '0.8', 'changefreq' => 'daily'],
            ['path' => '/berita', 'priority' => '0.8', 'changefreq' => 'daily'],
            ['path' => '/kontak', 'priority' => '0.7', 'changefreq' => 'monthly'],
        ];

        // 2. Artikel & Berita Published
        $posts = Post::query()
            ->visiblePublicly()
            ->get(['slug', 'type', 'updated_at']);

        // 3. Produk Aktif
        $products = Product::query()
            ->where('is_active', true)
            ->get(['slug', 'updated_at']);

        $xml = '<?xml version="1.0" encoding="UTF-8"?>';
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">';

        foreach ($staticPaths as $item) {
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
            'Content-Type' => 'application/xml',
        ]);
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

        $links = '<xhtml:link rel="alternate" hreflang="id" href="'.htmlspecialchars($idUrl).'" />'
            .'<xhtml:link rel="alternate" hreflang="en" href="'.htmlspecialchars($enUrl).'" />'
            .'<xhtml:link rel="alternate" hreflang="x-default" href="'.htmlspecialchars($idUrl).'" />';

        $lastmodTag = $lastmod ? '<lastmod>'.$lastmod.'</lastmod>' : '';

        $out = '';
        foreach ([$idUrl, $enUrl] as $loc) {
            $out .= '<url>';
            $out .= '<loc>'.htmlspecialchars($loc).'</loc>';
            $out .= $lastmodTag;
            $out .= '<changefreq>'.$changefreq.'</changefreq>';
            $out .= '<priority>'.$priority.'</priority>';
            $out .= $links;
            $out .= '</url>';
        }

        return $out;
    }
}
