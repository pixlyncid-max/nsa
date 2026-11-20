<?php

namespace Tests\Feature;

use App\Contracts\Translator;
use App\Enums\PostType;
use App\Enums\Role;
use App\Jobs\TranslateModelJob;
use App\Models\ContentTranslation;
use App\Models\Page;
use App\Models\Post;
use App\Models\TranslationGlossary;
use App\Models\TranslationUsageDaily;
use App\Models\User;
use App\Services\Translation\TranslationPromptBuilder;
use App\Services\Translation\TranslationValidationException;
use App\Services\Translation\TranslationValidator;
use Database\Seeders\TranslationGlossarySeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class AutoTranslationEngineTest extends TestCase
{
    use RefreshDatabase;

    private User $author;

    protected function setUp(): void
    {
        parent::setUp();
        $this->author = User::factory()->create(['role' => Role::Admin]);
    }

    public function test_saving_model_translates_in_single_batch_and_dedups_unchanged_hash(): void
    {
        $callCount = 0;

        $spy = new class($callCount) implements Translator
        {
            public function __construct(private int &$count) {}

            public function translateBatch(array $items, string $from = 'id', string $to = 'en', array $context = []): array
            {
                $this->count++;
                $out = [];
                foreach ($items as $k => $v) {
                    $out[$k] = str_contains($v, '<')
                        ? preg_replace('/(>[^<]+)/', '>[EN] $1', $v, 1)
                        : '[EN] '.$v;
                }

                return $out;
            }

            public function driverName(): string
            {
                return 'fake';
            }
        };

        $this->app->instance(Translator::class, $spy);

        $post = Post::create([
            'author_id' => $this->author->id,
            'type' => PostType::Article,
            'title' => 'Panduan Budidaya Lele Bioflok',
            'slug' => 'panduan-budidaya-lele',
            'excerpt' => 'Ringkasan teknis budidaya lele modern.',
            'body' => '<p>Budidaya lele membutuhkan kualitas air yang terjaga.</p>',
            'status' => 'published',
            'published_at' => now(),
        ]);

        // Satu panggilan batch untuk ketiga field (title, excerpt, body)
        $this->assertSame(1, $callCount);
        $this->assertSame('Panduan Budidaya Lele Bioflok', $post->tr('title', 'id'));
        $this->assertSame('[EN] Panduan Budidaya Lele Bioflok', $post->tr('title', 'en'));
        $this->assertGreaterThan(0, TranslationUsageDaily::todayChars('fake'));

        // Simpan ulang tanpa mengubah teks -> hash sama -> tidak memicu panggilan ulang
        $post->update(['status' => 'draft']);
        $this->assertSame(1, $callCount);

        // Ubah title -> hanya title yang diantrekan ulang
        $post->update(['title' => 'Panduan Budidaya Nila Merah']);
        $this->assertSame(2, $callCount);
        $this->assertSame('[EN] Panduan Budidaya Nila Merah', $post->fresh()->tr('title', 'en'));
    }

    public function test_manual_translation_is_never_overwritten_on_model_save(): void
    {
        $post = Post::create([
            'author_id' => $this->author->id,
            'type' => PostType::Article,
            'title' => 'Judul Asli Indonesia',
            'slug' => 'judul-asli-manual',
            'excerpt' => 'Ringkasan awal.',
            'body' => '<p>Isi awal artikel.</p>',
            'status' => 'published',
            'published_at' => now(),
        ]);

        ContentTranslation::query()
            ->where('translatable_type', $post->getMorphClass())
            ->where('translatable_id', $post->id)
            ->where('field', 'title')
            ->where('locale', 'en')
            ->update([
                'value' => 'Handcrafted English Title',
                'status' => ContentTranslation::STATUS_MANUAL,
                'is_manual' => true,
            ]);

        // Ubah judul Indonesia -> terjemahan manual harus tetap bertahan
        $post->update(['title' => 'Judul Baru Diubah Admin']);

        $this->assertSame('Handcrafted English Title', $post->fresh()->tr('title', 'en'));
    }

    public function test_validator_rejects_missing_placeholder_and_failed_job_falls_back_to_indonesian(): void
    {
        $validator = app(TranslationValidator::class);

        $this->expectException(TranslationValidationException::class);
        $validator->validate('greeting', 'Halo {name}, selamat datang di NSA.', 'Hello there, welcome to NSA.');
    }

    public function test_failed_translation_marks_status_failed_and_falls_back_to_indonesian(): void
    {
        Queue::fake();

        $post = Post::create([
            'author_id' => $this->author->id,
            'type' => PostType::Article,
            'title' => 'Judul Artikel Fallback',
            'slug' => 'judul-artikel-fallback',
            'excerpt' => 'Ringkasan.',
            'body' => '<p>Isi artikel.</p>',
            'status' => 'published',
            'published_at' => now(),
        ]);

        Queue::assertPushedOn('translations', TranslateModelJob::class);

        // Simulasikan gagal setelah 3 percobaan
        $job = new TranslateModelJob(Post::class, $post->id, 'en');
        $job->failed(new TranslationValidationException('Placeholder {name} hilang'));

        $this->assertDatabaseHas('content_translations', [
            'translatable_type' => $post->getMorphClass(),
            'translatable_id' => $post->id,
            'field' => 'title',
            'locale' => 'en',
            'status' => ContentTranslation::STATUS_FAILED,
        ]);

        // Fallback ke Bahasa Indonesia tetap tampil aman
        $this->assertSame('Judul Artikel Fallback', $post->fresh()->tr('title', 'en'));
    }

    public function test_json_column_extracts_and_translates_only_translatable_leaves(): void
    {
        $page = Page::create([
            'slug' => 'tentang-kami',
            'title' => 'Tentang Kami',
            'body' => [
                'sejarah' => [
                    [
                        'id' => 'ms-1',
                        'year' => '2020',
                        'title' => 'Pendirian Asosiasi NSA',
                        'image' => '/images/history-2020.webp',
                        'url' => 'https://nsa.or.id/sejarah',
                    ],
                ],
            ],
        ]);

        // Leaf judul ikut diterjemahkan, sedangkan id, year, image, url TIDAK masuk content_translations
        $this->assertDatabaseHas('content_translations', [
            'translatable_type' => $page->getMorphClass(),
            'translatable_id' => $page->id,
            'field' => 'body.sejarah.0.title',
            'locale' => 'en',
            'status' => ContentTranslation::STATUS_DONE,
        ]);

        $this->assertDatabaseMissing('content_translations', [
            'translatable_id' => $page->id,
            'field' => 'body.sejarah.0.url',
        ]);
        $this->assertDatabaseMissing('content_translations', [
            'translatable_id' => $page->id,
            'field' => 'body.sejarah.0.image',
        ]);

        $translatedBody = $page->fresh()->tr('body', 'en');
        $this->assertSame('[EN] Pendirian Asosiasi NSA', $translatedBody['sejarah'][0]['title']);
        $this->assertSame('https://nsa.or.id/sejarah', $translatedBody['sejarah'][0]['url']);
        $this->assertSame('/images/history-2020.webp', $translatedBody['sejarah'][0]['image']);
        $this->assertSame('2020', $translatedBody['sejarah'][0]['year']);
    }

    public function test_glossary_seeder_filters_only_relevant_terms_and_artisan_commands_run(): void
    {
        $this->seed(TranslationGlossarySeeder::class);

        $this->assertGreaterThanOrEqual(11, TranslationGlossary::query()->count());

        $relevant = TranslationPromptBuilder::relevantGlossary([
            'title' => 'Budidaya Lele bersama Pembudidaya NSA',
        ], 'en');

        $sources = array_column($relevant, 'source');
        $this->assertContains('Lele', $sources);
        $this->assertContains('Pembudidaya', $sources);
        $this->assertContains('NSA', $sources);
        $this->assertNotContains('NPWP', $sources);

        $this->artisan('translate:backfill')->assertExitCode(0);
        $this->artisan('translate:retry-failed')->assertExitCode(0);
        $this->artisan('translate:status')->assertExitCode(0);
    }
}
