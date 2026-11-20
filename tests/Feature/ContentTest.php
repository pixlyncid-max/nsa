<?php

namespace Tests\Feature;

use App\Enums\PostType;
use App\Enums\Role;
use App\Mail\ContactMessageReceived;
use App\Models\Page;
use App\Models\Partner;
use App\Models\Post;
use App\Models\PostCategory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class ContentTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected User $regularUser;

    protected PostCategory $category;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create([
            'role' => Role::Admin,
        ]);

        $this->regularUser = User::factory()->create([
            'role' => Role::User,
        ]);

        $this->category = PostCategory::create([
            'name' => 'Budidaya Air Tawar',
            'slug' => 'budidaya-air-tawar',
        ]);
    }

    public function test_about_page_renders_successfully(): void
    {
        Page::create([
            'slug' => 'tentang-kami',
            'title' => 'Tentang NSA Indonesia',
            'body' => [
                'history' => 'Sejarah panjang pendirian NSA sejak 2018.',
                'vision' => 'Visi kedaulatan maritim dan pangan nasional.',
                'missions' => ['Misi 1', 'Misi 2'],
                'values' => [['title' => 'Integritas', 'desc' => 'Deskripsi']],
                'legalities' => [['label' => 'SK Kemenkumham', 'value' => 'AHU-123']],
            ],
        ]);

        $response = $this->get('/tentang-kami');
        $response->assertStatus(200);
    }

    public function test_about_page_renders_with_complete_schema_even_when_page_record_has_partial_data(): void
    {
        // Simulasikan halaman yang disimpan dengan konten parsial (misal tanpa values atau legalities)
        Page::create([
            'slug' => 'tentang-kami',
            'title' => 'Tentang NSA Indonesia',
            'body' => [
                'history' => 'Hanya ada data sejarah yang disunting.',
            ],
        ]);

        $response = $this->get('/tentang-kami');
        $response->assertStatus(200);
        $response->assertInertia(fn (AssertableInertia $page) => $page
            ->component('Public/About')
            ->where('content.history', 'Hanya ada data sejarah yang disunting.')
            ->has('content.vision')
            ->has('content.missions')
            ->has('content.values')
            ->has('content.legalities')
            ->whereNot('content.missions', null)
        );
    }

    public function test_about_page_renders_default_schema_when_no_page_record_exists(): void
    {
        // Pastikan tidak ada halaman tentang-kami di DB
        Page::where('slug', 'tentang-kami')->delete();

        $response = $this->get('/tentang-kami');
        $response->assertStatus(200);
        $response->assertInertia(fn (AssertableInertia $page) => $page
            ->component('Public/About')
            ->has('content.history')
            ->has('content.vision')
            ->has('content.missions')
            ->has('content.values')
            ->has('content.legalities')
            ->whereNot('content.values', null)
            ->whereNot('content.legalities', null)
            ->whereNot('content.missions', null)
        );
    }

    public function test_partnership_page_renders_and_submission_stores_message(): void
    {
        Mail::fake();

        Partner::create([
            'name' => 'Kementerian Kelautan dan Perikanan',
            'logo' => '/images/kkp.png',
            'type' => 'Pemerintah',
            'order' => 1,
        ]);

        $response = $this->get('/kemitraan');
        $response->assertStatus(200);

        // Submit ajuan kemitraan
        $postResponse = $this->post('/kemitraan', [
            'name' => 'Budi Santoso',
            'institution' => 'PT Feed Indonesia',
            'email' => 'budi@feed.co.id',
            'phone' => '081234567890',
            'partnership_scheme' => 'Rantai Pasok Pakan & Bibit Unggul',
            'message' => 'Kami bermaksud menjalin kemitraan pasokan pakan apung mandiri.',
        ]);

        $postResponse->assertSessionHasNoErrors();
        $postResponse->assertStatus(302);

        $this->assertDatabaseHas('contact_messages', [
            'email' => 'budi@feed.co.id',
            'topic' => 'kemitraan',
        ]);

        Mail::assertSent(ContactMessageReceived::class);
    }

    public function test_partnership_submission_rejected_by_honeypot(): void
    {
        // Spam bot mengisi field tersembunyi fax_number
        $response = $this->post('/kemitraan', [
            'name' => 'Spam Bot',
            'institution' => 'Spam Corp',
            'email' => 'bot@spam.com',
            'phone' => '0800000',
            'partnership_scheme' => 'Rantai Pasok Pakan & Bibit Unggul',
            'message' => 'Spam link http://spam.com',
            'fax_number' => '123456', // Harusnya kosong!
        ]);

        $response->assertSessionHasErrors(['fax_number']);
        $this->assertDatabaseMissing('contact_messages', [
            'email' => 'bot@spam.com',
        ]);
    }

    public function test_article_and_news_list_only_published_posts(): void
    {
        // 1 Post Published
        $publishedArticle = Post::create([
            'type' => PostType::Article,
            'category_id' => $this->category->id,
            'author_id' => $this->admin->id,
            'title' => 'Inovasi Bioflok Masa Depan',
            'slug' => 'inovasi-bioflok-masa-depan',
            'excerpt' => 'Teknologi bioflok hemat air.',
            'body' => 'Isi artikel lengkap tentang bioflok.',
            'status' => 'published',
            'published_at' => now()->subDay(),
        ]);

        // 1 Post Draft (tidak boleh tampil)
        $draftArticle = Post::create([
            'type' => PostType::Article,
            'category_id' => $this->category->id,
            'author_id' => $this->admin->id,
            'title' => 'Draft Rahasia Belum Rilis',
            'slug' => 'draft-rahasia-belum-rilis',
            'excerpt' => 'Draft yang belum siap.',
            'body' => 'Isi draf rahasia.',
            'status' => 'draft',
            'published_at' => null,
        ]);

        $response = $this->get('/artikel');
        $response->assertStatus(200);

        // Akses detail post published -> 200
        $showResponse = $this->get('/artikel/inovasi-bioflok-masa-depan');
        $showResponse->assertStatus(200);

        // Akses detail post draft oleh publik (guest) -> 404
        $draftShowResponse = $this->get('/artikel/draft-rahasia-belum-rilis');
        $draftShowResponse->assertStatus(404);
    }

    public function test_contact_form_stores_message_and_sends_email(): void
    {
        Mail::fake();

        $response = $this->get('/kontak');
        $response->assertStatus(200);

        $postResponse = $this->post('/kontak', [
            'name' => 'Siti Rahma',
            'email' => 'siti@petambak.id',
            'topic' => 'Konsultasi Perizinan & NIB Budidaya',
            'message' => 'Mohon petunjuk pendampingan NIB untuk tambak air tawar kami di Subang.',
        ]);

        $postResponse->assertSessionHasNoErrors();
        $postResponse->assertStatus(302);

        $this->assertDatabaseHas('contact_messages', [
            'name' => 'Siti Rahma',
            'email' => 'siti@petambak.id',
            'topic' => 'Konsultasi Perizinan & NIB Budidaya',
        ]);

        Mail::assertSent(ContactMessageReceived::class);
    }

    public function test_contact_form_honeypot_rejects_spam_bot(): void
    {
        $response = $this->post('/kontak', [
            'name' => 'Spammer',
            'email' => 'spammer@fake.com',
            'topic' => 'Pertanyaan Umum',
            'message' => 'Check this out http://fake.com',
            'fax_number' => 'gotcha', // Terisi honeypot
        ]);

        $response->assertSessionHasErrors(['fax_number']);
        $this->assertDatabaseMissing('contact_messages', [
            'email' => 'spammer@fake.com',
        ]);
    }

    public function test_contact_form_rate_limiting(): void
    {
        Mail::fake();

        // Kirim 5 kali (batas limit 5 per menit)
        for ($i = 0; $i < 5; $i++) {
            $response = $this->post('/kontak', [
                'name' => "User {$i}",
                'email' => "user{$i}@test.com",
                'topic' => 'Pertanyaan Umum & Informasi Asosiasi',
                'message' => 'Pesan ke-'.$i,
            ]);
            $response->assertStatus(302);
        }

        // Request ke-6 harus terkena rate limit (HTTP 429 Too Many Requests)
        $rateLimitedResponse = $this->post('/kontak', [
            'name' => 'User Terlalu Cepat',
            'email' => 'overlimit@test.com',
            'topic' => 'Pertanyaan Umum & Informasi Asosiasi',
            'message' => 'Pesan melebihi batas rate limit',
        ]);

        $rateLimitedResponse->assertStatus(429);
    }

    public function test_contact_page_renders_default_and_cms_faqs(): void
    {
        Page::where('slug', 'kontak')->delete();

        $defaultResponse = $this->get('/kontak');
        $defaultResponse->assertStatus(200);
        $defaultResponse->assertInertia(fn (AssertableInertia $page) => $page
            ->component('Public/Contact')
            ->has('contactInfo')
            ->has('faqs', 5)
        );

        Page::create([
            'slug' => 'kontak',
            'title' => 'Kontak NSA',
            'body' => [
                'faqs' => [
                    [
                        'question' => 'Pertanyaan Kustom CMS 1',
                        'answer' => 'Jawaban kustom dari CMS halaman.',
                    ],
                ],
            ],
        ]);

        $cmsResponse = $this->get('/kontak');
        $cmsResponse->assertStatus(200);
        $cmsResponse->assertInertia(fn (AssertableInertia $page) => $page
            ->component('Public/Contact')
            ->has('faqs', 1)
            ->where('faqs.0.question', 'Pertanyaan Kustom CMS 1')
        );
    }

    public function test_sitemap_xml_renders_valid_xml(): void
    {
        Post::create([
            'type' => PostType::Article,
            'category_id' => $this->category->id,
            'author_id' => $this->admin->id,
            'title' => 'Panduan Pakan Mandiri',
            'slug' => 'panduan-pakan-mandiri',
            'body' => 'Panduan pakan mandiri ikan air tawar.',
            'status' => 'published',
            'published_at' => now(),
        ]);

        $response = $this->get('/sitemap.xml');
        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'application/xml');
        $this->assertStringContainsString('panduan-pakan-mandiri', $response->getContent());
        $this->assertStringContainsString('tentang-kami', $response->getContent());
    }
}
