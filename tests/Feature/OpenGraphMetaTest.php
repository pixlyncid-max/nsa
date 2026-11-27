<?php

namespace Tests\Feature;

use App\Enums\PostType;
use App\Enums\ProductType;
use App\Models\Post;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\ProductImage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OpenGraphMetaTest extends TestCase
{
    use RefreshDatabase;

    public function test_article_detail_renders_server_side_open_graph_meta_tags_with_absolute_cover_image(): void
    {
        $author = User::factory()->create();
        $post = Post::create([
            'type' => PostType::Article,
            'author_id' => $author->id,
            'publisher_name' => 'Tim Redaksi NSA',
            'title' => 'Mengenal Budidaya Ikan Air Tawar Nusantara',
            'slug' => 'mengenal-budidaya-ikan-air-tawar-nusantara',
            'excerpt' => 'Panduan lengkap potensi nila, mas, lele, dan patin untuk perikanan berkelanjutan.',
            'body' => '<p>Isi lengkap artikel budidaya ikan air tawar.</p>',
            'cover' => 'posts/cover-sample.jpg',
            'status' => 'published',
            'published_at' => now(),
        ]);

        $response = $this->withoutVite()->get('/artikel/'.$post->slug);

        $response->assertOk();
        $response->assertSee('<meta property="og:type" content="article">', false);
        $response->assertSee('<meta property="og:title" content="Mengenal Budidaya Ikan Air Tawar Nusantara | NSA">', false);
        $response->assertSee('<meta property="og:description" content="Panduan lengkap potensi nila, mas, lele, dan patin untuk perikanan berkelanjutan.">', false);
        $response->assertSee('/storage/posts/cover-sample.jpg">', false);
        $response->assertSee('<meta property="og:image" content="http', false);
        $response->assertSee('<meta property="og:image:type" content="image/jpeg">', false);
        $response->assertSee('<meta property="og:image:width" content="', false);
        $response->assertSee('<meta property="og:image:height" content="', false);
        $response->assertSee('<meta name="twitter:card" content="summary_large_image">', false);
        $response->assertSee('"@type":"Article"', false);
        $response->assertSee('"@type":"Organization"', false);
        $response->assertSee('<h1>Mengenal Budidaya Ikan Air Tawar Nusantara</h1>', false);
    }

    public function test_sitemap_index_and_sub_sitemaps_return_valid_xml_for_google_search_console(): void
    {
        $author = User::factory()->create();
        $news = Post::create([
            'type' => PostType::News,
            'author_id' => $author->id,
            'title' => 'Audiensi Perikanan Samarinda',
            'slug' => 'audiensi-perikanan-samarinda',
            'body' => '<p>Berita kegiatan NSA di Samarinda.</p>',
            'status' => 'published',
            'published_at' => now(),
        ]);

        $this->get('/sitemap_index.xml')
            ->assertOk()
            ->assertHeader('Content-Type', 'application/xml; charset=UTF-8')
            ->assertSee('<sitemapindex', false)
            ->assertSee('/sitemap-pages.xml', false)
            ->assertSee('/sitemap-posts.xml', false)
            ->assertSee('/sitemap-products.xml', false);

        $this->get('/sitemap.xml')
            ->assertOk()
            ->assertSee('<urlset', false)
            ->assertSee('/berita/'.$news->slug, false);

        $this->get('/sitemap-posts.xml')
            ->assertOk()
            ->assertSee('/berita/'.$news->slug, false);

        $this->get('/sitemap-pages.xml')->assertOk()->assertSee('<urlset', false);
        $this->get('/sitemap-products.xml')->assertOk()->assertSee('<urlset', false);

        $this->get('/berita/'.$news->slug)
            ->assertOk()
            ->assertSee('"@type":"NewsArticle"', false);
    }

    public function test_product_detail_renders_server_side_open_graph_meta_tags_with_product_image(): void
    {
        $category = ProductCategory::create([
            'name' => 'Pakan Ikan',
            'slug' => 'pakan-ikan',
            'group' => 'freshwater',
        ]);

        $product = Product::create([
            'category_id' => $category->id,
            'name' => 'Pakan Ikan Min -4',
            'slug' => 'pakan-ikan-min-4',
            'type' => ProductType::Physical,
            'description' => 'Pakan apung protein tinggi untuk pembesaran ikan air tawar.',
            'price' => 331000,
            'member_price' => 311000,
            'stock' => 25,
            'is_active' => true,
        ]);

        ProductImage::create([
            'product_id' => $product->id,
            'path' => 'products/pakan-min-4.jpg',
            'order' => 0,
        ]);

        $response = $this->withoutVite()->get('/produk/detail/'.$product->slug);

        $response->assertOk();
        $response->assertSee('<meta property="og:title" content="Pakan Ikan Min -4">', false);
        $response->assertSee('/storage/products/pakan-min-4.jpg">', false);
    }
}
