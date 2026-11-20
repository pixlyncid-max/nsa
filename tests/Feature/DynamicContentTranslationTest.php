<?php

namespace Tests\Feature;

use App\Enums\PostType;
use App\Enums\ProductType;
use App\Enums\Role;
use App\Models\BusinessField;
use App\Models\ContentTranslation;
use App\Models\Dpc;
use App\Models\DpcMember;
use App\Models\DppMember;
use App\Models\Dpw;
use App\Models\DpwMember;
use App\Models\FishCategory;
use App\Models\MembershipCategory;
use App\Models\MembershipFeeItem;
use App\Models\MembershipType;
use App\Models\Partner;
use App\Models\Post;
use App\Models\PostCategory;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\Province;
use App\Models\Regency;
use App\Models\User;
use App\Services\StatisticService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class DynamicContentTranslationTest extends TestCase
{
    use RefreshDatabase;

    public function test_article_lifecycle_creates_updates_and_deletes_translations(): void
    {
        $author = User::factory()->create(['role' => Role::Admin]);
        $category = PostCategory::create([
            'name' => 'Budidaya Air Tawar',
            'slug' => 'budidaya-air-tawar',
        ]);

        // 1. Artikel baru → terjemahan otomatis dibuat
        $post = Post::create([
            'type' => PostType::Article,
            'category_id' => $category->id,
            'author_id' => $author->id,
            'title' => 'Panduan Bioflok Nila',
            'slug' => 'panduan-bioflok-nila',
            'excerpt' => 'Ringkasan teknik bioflok nila.',
            'body' => '<p>Isi panduan lengkap budidaya nila.</p>',
            'status' => 'published',
            'published_at' => now()->subDay(),
        ]);

        $this->assertDatabaseHas('content_translations', [
            'translatable_type' => $post->getMorphClass(),
            'translatable_id' => $post->id,
            'field' => 'title',
            'locale' => 'en',
            'value' => '[EN] Panduan Bioflok Nila',
            'status' => ContentTranslation::STATUS_DONE,
        ]);

        // 2. Ubah judul → diterjemahkan ulang
        $post->update(['title' => 'Panduan Bioflok Nila Modern']);

        $this->assertDatabaseHas('content_translations', [
            'translatable_type' => $post->getMorphClass(),
            'translatable_id' => $post->id,
            'field' => 'title',
            'locale' => 'en',
            'value' => '[EN] Panduan Bioflok Nila Modern',
            'status' => ContentTranslation::STATUS_DONE,
        ]);

        // 3. Kosongkan excerpt → terjemahan excerpt terhapus
        $post->update(['excerpt' => null]);

        $this->assertDatabaseMissing('content_translations', [
            'translatable_type' => $post->getMorphClass(),
            'translatable_id' => $post->id,
            'field' => 'excerpt',
            'locale' => 'en',
        ]);
    }

    public function test_en_routes_render_english_translations_and_fallback_when_not_ready(): void
    {
        $author = User::factory()->create(['role' => Role::Admin]);
        $category = PostCategory::create([
            'name' => 'Teknologi Kolam',
            'slug' => 'teknologi-kolam',
        ]);

        $post = Post::create([
            'type' => PostType::Article,
            'category_id' => $category->id,
            'author_id' => $author->id,
            'title' => 'Sensor Kualitas Air',
            'slug' => 'sensor-kualitas-air',
            'excerpt' => 'Memantau oksigen terlarut.',
            'body' => '<p>Detail sensor kualitas air.</p>',
            'status' => 'published',
            'published_at' => now()->subDay(),
        ]);

        // /en/artikel menampilkan terjemahan Inggris
        $this->get('/en/artikel')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('posts.data.0.title', '[EN] Sensor Kualitas Air')
                ->where('posts.data.0.category.name', '[EN] Teknologi Kolam')
            );

        // /en/artikel/{slug} menampilkan terjemahan Inggris
        $this->get('/en/artikel/sensor-kualitas-air')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('post.title', '[EN] Sensor Kualitas Air')
            );

        // Bila terjemahan belum selesai (status pending) → fallback ke Indonesia
        ContentTranslation::query()
            ->where('translatable_type', $post->getMorphClass())
            ->where('translatable_id', $post->id)
            ->where('field', 'title')
            ->update(['status' => ContentTranslation::STATUS_PENDING]);

        $this->get('/en/artikel/sensor-kualitas-air')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('post.title', 'Sensor Kualitas Air')
            );
    }

    public function test_bilingual_search_on_en_matches_english_and_indonesian_and_keeps_slug_filter(): void
    {
        $category = ProductCategory::create([
            'name' => 'Pakan Ikan',
            'slug' => 'pakan-ikan',
            'group' => 'freshwater',
        ]);

        $product = Product::create([
            'category_id' => $category->id,
            'type' => ProductType::Physical,
            'name' => 'Pelet Apung Premium',
            'slug' => 'pelet-apung-premium',
            'description' => 'Pakan ikan bergizi tinggi.',
            'price' => 125000,
            'stock' => 20,
            'weight' => 1000,
            'is_active' => true,
        ]);

        // Set terjemahan Inggris khusus untuk uji pencarian bahasa Inggris
        ContentTranslation::query()
            ->where('translatable_type', $product->getMorphClass())
            ->where('translatable_id', $product->id)
            ->where('field', 'name')
            ->update(['value' => 'Floating Fish Pellets', 'is_manual' => true]);

        // Cari kata Inggris di /en/produk
        $this->get('/en/produk?search=Floating&category=pakan-ikan')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->has('products.data', 1)
                ->where('products.data.0.name', 'Floating Fish Pellets')
                ->where('products.data.0.category_slug', 'pakan-ikan')
            );

        // Cari kata Indonesia di /en/produk juga tetap menemukan produk
        $this->get('/en/produk?search=Pelet')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->has('products.data', 1)
                ->where('products.data.0.name', 'Floating Fish Pellets')
            );
    }

    public function test_organization_and_partner_translate_role_and_type_but_preserve_names(): void
    {
        $dppMember = DppMember::create([
            'name' => 'Dr. Hendra Wijaya',
            'position' => 'Ketua Umum',
            'order' => 1,
            'period' => '2024-2029',
            'bio' => 'Pakar budidaya perikanan.',
        ]);

        $province = Province::create(['id' => 32, 'name' => 'Jawa Barat', 'slug' => 'jawa-barat']);
        $dpw = Dpw::create(['province_id' => $province->id, 'name' => 'DPW Jawa Barat']);
        DpwMember::create([
            'dpw_id' => $dpw->id,
            'name' => 'Siti Rahmawati',
            'position' => 'Sekretaris Wilayah',
            'order' => 1,
        ]);

        $regency = Regency::create(['id' => 3201, 'province_id' => $province->id, 'name' => 'Kabupaten Bogor', 'slug' => 'kabupaten-bogor']);
        $dpc = Dpc::create(['regency_id' => $regency->id, 'name' => 'DPC Kabupaten Bogor']);
        DpcMember::create([
            'dpc_id' => $dpc->id,
            'name' => 'Ahmad Fauzi',
            'position' => 'Bendahara Cabang',
            'order' => 1,
        ]);

        Partner::create([
            'name' => 'PT Mina Nusantara Tbk',
            'logo' => '/images/partners/mina.png',
            'type' => 'Produsen Pakan',
            'order' => 1,
        ]);

        // DPP: nama orang tetap, jabatan berubah
        $this->get('/en/organisasi/dpp')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('members.0.name', 'Dr. Hendra Wijaya')
                ->where('members.0.position', '[EN] Ketua Umum')
            );

        // DPW: nama orang & nama wilayah tetap, jabatan berubah
        $this->get('/en/organisasi/dpw?provinsi=jawa-barat')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('dpw.name', 'DPW Jawa Barat')
                ->where('dpw.members.0.name', 'Siti Rahmawati')
                ->where('dpw.members.0.position', '[EN] Sekretaris Wilayah')
            );

        // DPC: nama orang tetap, jabatan berubah
        $this->get('/en/organisasi/dpc?provinsi=jawa-barat&kota=kabupaten-bogor')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('dpc.members.0.name', 'Ahmad Fauzi')
                ->where('dpc.members.0.position', '[EN] Bendahara Cabang')
            );

        // Partner: nama mitra tetap, jenis mitra berubah
        $this->get('/en/kemitraan')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('partners.0.name', 'PT Mina Nusantara Tbk')
                ->where('partners.0.type', '[EN] Produsen Pakan')
            );

        // Pastikan tidak ada terjemahan untuk kolom name pengurus
        $this->assertDatabaseMissing('content_translations', [
            'translatable_type' => $dppMember->getMorphClass(),
            'translatable_id' => $dppMember->id,
            'field' => 'name',
        ]);
    }

    public function test_wizard_options_and_home_statistics_reflect_active_locale_and_clear_cache(): void
    {
        $cat = MembershipCategory::create([
            'name' => 'Pembudidaya Ikan',
            'slug' => 'pembudidaya-ikan',
            'description' => 'Pelaku budidaya kolam dan tambak',
            'is_active' => true,
        ]);

        MembershipType::create([
            'category_id' => $cat->id,
            'name' => 'Anggota Biasa',
            'slug' => 'anggota-biasa',
            'description' => 'Keanggotaan penuh',
            'is_active' => true,
        ]);

        BusinessField::create(['name' => 'Pembenihan', 'slug' => 'pembenihan']);
        FishCategory::create(['name' => 'Ikan Nila', 'slug' => 'ikan-nila', 'is_active' => true]);
        MembershipFeeItem::create([
            'code' => 'REG-FEE',
            'name' => 'Biaya Pendaftaran',
            'description' => 'Iuran awal',
            'amount' => 100000,
            'type' => 'required',
            'is_active' => true,
            'order' => 1,
        ]);

        // Isi cache beranda untuk en
        $statService = app(StatisticService::class);
        $enHome = $statService->getHomeData('en');
        $this->assertSame('[EN] Ikan Nila', $enHome['fishCategories'][0]['name']);
        $this->assertTrue(Cache::has($statService->cacheKey('en')));

        // Saat model baru diterjemahkan, cache beranda terhapus otomatis
        FishCategory::create(['name' => 'Ikan Lele', 'slug' => 'ikan-lele', 'is_active' => true]);
        $this->assertFalse(Cache::has($statService->cacheKey('en')));

        // Opsi wizard mengikuti locale user (en)
        $enUser = User::factory()->create(['role' => Role::User, 'locale' => 'en']);
        $this->actingAs($enUser)
            ->get('/akun/keanggotaan/daftar/identitas')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('categories.0.name', '[EN] Pembudidaya Ikan')
                ->where('membershipTypes.0.name', '[EN] Anggota Biasa')
                ->where('businessFields.0.name', '[EN] Pembenihan')
                ->where('membershipFeeItems.0.name', '[EN] Biaya Pendaftaran')
            );
    }

    public function test_no_n_plus_one_queries_on_en_post_and_product_listings(): void
    {
        $author = User::factory()->create(['role' => Role::Admin]);
        $postCategory = PostCategory::create(['name' => 'Warta', 'slug' => 'warta']);
        $productCategory = ProductCategory::create(['name' => 'Peralatan', 'slug' => 'peralatan', 'group' => 'freshwater']);

        // Buat 2 item dulu dan ukur jumlah query
        for ($i = 1; $i <= 2; $i++) {
            Post::create([
                'type' => PostType::Article,
                'category_id' => $postCategory->id,
                'author_id' => $author->id,
                'title' => "Artikel Uji {$i}",
                'slug' => "artikel-uji-{$i}",
                'excerpt' => "Ringkasan {$i}",
                'body' => "<p>Isi {$i}</p>",
                'status' => 'published',
                'published_at' => now()->subDays($i),
            ]);

            Product::create([
                'category_id' => $productCategory->id,
                'type' => ProductType::Physical,
                'name' => "Produk Uji {$i}",
                'slug' => "produk-uji-{$i}",
                'description' => "Deskripsi {$i}",
                'price' => 50000,
                'stock' => 10,
                'weight' => 500,
                'is_active' => true,
            ]);
        }

        // Hangatkan cache copy/session terlebih dahulu agar pengukuran murni mengukur query listing
        $this->get('/en/artikel')->assertOk();
        $this->get('/en/produk')->assertOk();

        DB::flushQueryLog();
        DB::enableQueryLog();
        $this->get('/en/artikel')->assertOk();
        $postQueriesSmall = count(DB::getQueryLog());

        DB::flushQueryLog();
        $this->get('/en/produk')->assertOk();
        $productQueriesSmall = count(DB::getQueryLog());

        // Tambah 6 item lagi (total 8 item)
        for ($i = 3; $i <= 8; $i++) {
            Post::create([
                'type' => PostType::Article,
                'category_id' => $postCategory->id,
                'author_id' => $author->id,
                'title' => "Artikel Uji {$i}",
                'slug' => "artikel-uji-{$i}",
                'excerpt' => "Ringkasan {$i}",
                'body' => "<p>Isi {$i}</p>",
                'status' => 'published',
                'published_at' => now()->subDays($i),
            ]);

            Product::create([
                'category_id' => $productCategory->id,
                'type' => ProductType::Physical,
                'name' => "Produk Uji {$i}",
                'slug' => "produk-uji-{$i}",
                'description' => "Deskripsi {$i}",
                'price' => 50000,
                'stock' => 10,
                'weight' => 500,
                'is_active' => true,
            ]);
        }

        DB::flushQueryLog();
        $this->get('/en/artikel')->assertOk();
        $postQueriesLarge = count(DB::getQueryLog());

        DB::flushQueryLog();
        $this->get('/en/produk')->assertOk();
        $productQueriesLarge = count(DB::getQueryLog());
        DB::disableQueryLog();

        // Jumlah query harus tetap konstan (tidak bertambah seiring jumlah item)
        $this->assertSame($postQueriesSmall, $postQueriesLarge);
        $this->assertSame($productQueriesSmall, $productQueriesLarge);
    }

    public function test_admin_cms_form_remains_indonesian_only(): void
    {
        $admin = User::factory()->create(['role' => Role::Admin, 'locale' => 'en']);

        // Area /admin selalu berbahasa Indonesia
        $this->actingAs($admin)
            ->get('/admin/artikel/create')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('locale', 'id')
            );
    }
}
