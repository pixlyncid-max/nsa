<?php

namespace Tests\Feature;

use App\Enums\PostType;
use App\Enums\Role;
use App\Models\Post;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MultiLanguageFoundationTest extends TestCase
{
    use RefreshDatabase;

    public function test_locale_priority_url_prefix_then_user_then_cookie_then_default(): void
    {
        // 1. Default tanpa cookie/user -> id
        $this->get('/tentang-kami')
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page->where('locale', 'id'));

        // 2. Cookie 'en' pada halaman non-root -> en
        $this->withUnencryptedCookie('locale', 'en')
            ->get('/tentang-kami')
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page->where('locale', 'en'));

        // 3. users.locale menimpa cookie
        $user = User::factory()->create([
            'role' => Role::User,
            'locale' => 'id',
        ]);
        $this->actingAs($user)
            ->withUnencryptedCookie('locale', 'en')
            ->get('/tentang-kami')
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page->where('locale', 'id'));

        // 4. Awalan URL /en menimpa users.locale ('id')
        $this->actingAs($user)
            ->get('/en/tentang-kami')
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page->where('locale', 'en'));
    }

    public function test_root_redirects_to_en_only_for_cookie_and_never_accept_language(): void
    {
        // Header Accept-Language: en-US TIDAK boleh mengalihkan "/"
        $this->withHeaders(['Accept-Language' => 'en-US,en;q=0.9'])
            ->get('/')
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page->where('locale', 'id'));

        // Cookie locale=en pada "/" mengalihkan ke /en (mempertahankan query string)
        $this->withUnencryptedCookie('locale', 'en')
            ->get('/?ref=promo')
            ->assertRedirect('/en?ref=promo');

        // /en tetap 200 tanpa loop redirect
        $this->withUnencryptedCookie('locale', 'en')
            ->get('/en')
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page->where('locale', 'en'));
    }

    public function test_admin_panel_always_uses_indonesian_locale(): void
    {
        $admin = User::factory()->create([
            'role' => Role::Admin,
            'locale' => 'en',
        ]);

        $this->actingAs($admin)
            ->withUnencryptedCookie('locale', 'en')
            ->get('/admin')
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page->where('locale', 'id'));
    }

    public function test_locale_switcher_endpoint_sets_cookie_and_updates_user_locale(): void
    {
        $user = User::factory()->create([
            'role' => Role::User,
            'locale' => 'id',
        ]);

        $this->actingAs($user)
            ->postJson('/locale', ['locale' => 'en'])
            ->assertStatus(200)
            ->assertPlainCookie('locale', 'en')
            ->assertJsonPath('locale', 'en');

        $this->assertSame('en', $user->fresh()->locale);
    }

    public function test_alternates_preserve_route_parameters_and_query_string(): void
    {
        $this->get('/produk?kategori=air-tawar&urut=termurah')
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->has('availableLocales.id')
                ->has('availableLocales.en')
                ->where('alternates.id', fn (string $url) => str_contains($url, '/produk?kategori=air-tawar&urut=termurah'))
                ->where('alternates.en', fn (string $url) => str_contains($url, '/en/produk?kategori=air-tawar&urut=termurah'))
            );
    }

    public function test_html_seo_tags_include_lang_hreflang_canonical_and_og_locale(): void
    {
        // Bahasa Indonesia
        $resId = $this->get('/tentang-kami');
        $resId->assertStatus(200);
        $resId->assertSee('<html lang="id">', false);
        $resId->assertSee('rel="canonical" href="'.url('/tentang-kami').'"', false);
        $resId->assertSee('hreflang="id" href="'.url('/tentang-kami').'"', false);
        $resId->assertSee('hreflang="en" href="'.url('/en/tentang-kami').'"', false);
        $resId->assertSee('hreflang="x-default" href="'.url('/tentang-kami').'"', false);
        $resId->assertSee('property="og:locale" content="id_ID"', false);
        $resId->assertSee('property="og:locale:alternate" content="en_US"', false);

        // Bahasa Inggris
        $resEn = $this->get('/en/tentang-kami');
        $resEn->assertStatus(200);
        $resEn->assertSee('<html lang="en">', false);
        $resEn->assertSee('rel="canonical" href="'.url('/en/tentang-kami').'"', false);
        $resEn->assertSee('property="og:locale" content="en_US"', false);
        $resEn->assertSee('property="og:locale:alternate" content="id_ID"', false);
    }

    public function test_sitemap_includes_both_indonesian_and_english_urls(): void
    {
        $author = User::factory()->create(['role' => Role::Admin]);

        Post::create([
            'author_id' => $author->id,
            'title' => 'Artikel Budidaya',
            'slug' => 'artikel-budidaya',
            'excerpt' => 'Ringkasan',
            'body' => '<p>Konten</p>',
            'type' => PostType::Article,
            'status' => 'published',
            'published_at' => now()->subDay(),
        ]);

        $category = ProductCategory::create([
            'group' => 'air-tawar',
            'name' => 'Pelet Pakan',
            'slug' => 'pelet-pakan',
        ]);

        Product::create([
            'category_id' => $category->id,
            'name' => 'Pelet Apung',
            'slug' => 'pelet-apung',
            'description' => 'Pakan ikan',
            'price' => 120000,
            'type' => 'physical',
            'stock' => 10,
            'is_active' => true,
        ]);

        $res = $this->get('/sitemap.xml');
        $res->assertStatus(200);
        $res->assertHeader('Content-Type', 'application/xml');
        $res->assertSee('/tentang-kami</loc>', false);
        $res->assertSee('/en/tentang-kami</loc>', false);
        $res->assertSee('/artikel/artikel-budidaya</loc>', false);
        $res->assertSee('/en/artikel/artikel-budidaya</loc>', false);
        $res->assertSee('/produk/detail/pelet-apung</loc>', false);
        $res->assertSee('/en/produk/detail/pelet-apung</loc>', false);
        $res->assertSee('hreflang="x-default"', false);
    }

    public function test_backend_lroute_and_format_helpers_respect_active_locale(): void
    {
        $this->assertStringEndsWith('/produk', lroute('product.index', [], false, 'id'));
        $this->assertStringEndsWith('/en/produk', lroute('product.index', [], false, 'en'));

        // Simbol "Rp" tetap dipakai di kedua bahasa, pemisah ribuan mengikuti bahasa
        $this->assertSame('Rp 120.000', format_currency(120000, 'id'));
        $this->assertSame('Rp 120,000', format_currency(120000, 'en'));
        $this->assertSame('1.250', format_number(1250, 0, 'id'));
        $this->assertSame('1,250', format_number(1250, 0, 'en'));
    }
}
