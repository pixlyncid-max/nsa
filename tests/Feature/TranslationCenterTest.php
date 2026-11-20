<?php

namespace Tests\Feature;

use App\Contracts\Translator;
use App\Enums\PostType;
use App\Enums\Role;
use App\Jobs\TranslateModelJob;
use App\Models\ContentTranslation;
use App\Models\Post;
use App\Models\PostCategory;
use App\Models\Setting;
use App\Models\User;
use App\Services\Translation\Drivers\FakeTranslator;
use App\Services\Translation\TranslationValidator;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use RuntimeException;
use Tests\TestCase;

class TranslationCenterTest extends TestCase
{
    use RefreshDatabase;

    public function test_only_superadmin_can_access_translation_center_and_actions(): void
    {
        $user = User::factory()->create(['role' => Role::User]);
        $admin = User::factory()->create(['role' => Role::Admin]);
        $superadmin = User::factory()->create(['role' => Role::Superadmin]);

        $this->actingAs($user)->get('/admin/terjemahan')->assertForbidden();
        $this->actingAs($admin)->get('/admin/terjemahan')->assertForbidden();
        $this->actingAs($admin)->postJson('/admin/terjemahan/uji-koneksi')->assertForbidden();
        $this->actingAs($admin)->putJson('/admin/terjemahan/pengaturan', [
            'daily_char_limit' => 50000,
            'batch_size' => 10,
            'failed_alert_threshold' => 5,
        ])->assertForbidden();

        // Superadmin dapat mengakses dan kunci API tidak pernah dibocorkan
        config(['translation.drivers.claude.api_key' => 'sk-ant-secret-key-do-not-leak']);

        $response = $this->actingAs($superadmin)
            ->get('/admin/terjemahan')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Translations/Index')
                ->has('summary')
                ->has('translations')
                ->has('glossary')
                ->has('settings')
            );

        $this->assertStringNotContainsString('sk-ant-secret-key-do-not-leak', $response->getContent());
    }

    public function test_superadmin_can_test_connection_edit_manual_sanitized_and_revert_to_auto(): void
    {
        $superadmin = User::factory()->create(['role' => Role::Superadmin]);
        $category = PostCategory::create(['name' => 'Berita', 'slug' => 'berita']);
        $post = Post::create([
            'type' => PostType::Article,
            'category_id' => $category->id,
            'author_id' => $superadmin->id,
            'title' => 'Artikel Akuakultur',
            'slug' => 'artikel-akuakultur',
            'excerpt' => 'Ringkasan',
            'body' => '<p>Isi artikel perikanan.</p>',
            'status' => 'published',
            'published_at' => now()->subDay(),
        ]);

        // Uji koneksi penyedia
        $this->actingAs($superadmin)
            ->postJson('/admin/terjemahan/uji-koneksi')
            ->assertOk()
            ->assertJsonPath('ok', true)
            ->assertJsonPath('driver', 'fake');

        $bodyTranslation = ContentTranslation::query()
            ->where('translatable_type', $post->getMorphClass())
            ->where('translatable_id', $post->id)
            ->where('field', 'body')
            ->firstOrFail();

        // Edit manual richtext → XSS disanitasi & dikunci manual
        $this->actingAs($superadmin)
            ->putJson("/admin/terjemahan/konten/{$bodyTranslation->id}", [
                'value' => '<p>Clean English body</p><script>alert(1)</script>',
            ])
            ->assertOk()
            ->assertJsonPath('translation.isManual', true);

        $bodyTranslation->refresh();
        $this->assertTrue($bodyTranslation->is_manual);
        $this->assertSame(ContentTranslation::STATUS_MANUAL, $bodyTranslation->status);
        $this->assertStringNotContainsString('<script>', (string) $bodyTranslation->value);
        $this->assertStringContainsString('Clean English body', (string) $bodyTranslation->value);

        // Kembalikan ke otomatis → kunci dilepas & diterjemahkan ulang
        $this->actingAs($superadmin)
            ->postJson("/admin/terjemahan/konten/{$bodyTranslation->id}/otomatis")
            ->assertOk();

        $bodyTranslation->refresh();
        $this->assertFalse($bodyTranslation->is_manual);
        $this->assertSame(ContentTranslation::STATUS_DONE, $bodyTranslation->status);

        $this->assertDatabaseHas('activity_logs', [
            'action' => 'update_content_translation_manual',
            'user_id' => $superadmin->id,
        ]);
        $this->assertDatabaseHas('activity_logs', [
            'action' => 'revert_content_translation_auto',
            'user_id' => $superadmin->id,
        ]);
    }

    public function test_glossary_crud_csv_export_import_and_apply_to_related_content(): void
    {
        $superadmin = User::factory()->create(['role' => Role::Superadmin]);
        $category = PostCategory::create(['name' => 'Budidaya', 'slug' => 'budidaya']);
        $post = Post::create([
            'type' => PostType::Article,
            'category_id' => $category->id,
            'author_id' => $superadmin->id,
            'title' => 'Tips Pembudidaya Modern',
            'slug' => 'tips-pembudidaya-modern',
            'excerpt' => 'Untuk pembudidaya pemula.',
            'body' => '<p>Panduan pembudidaya.</p>',
            'status' => 'published',
            'published_at' => now()->subDay(),
        ]);

        // Tambah glosarium
        $createRes = $this->actingAs($superadmin)
            ->postJson('/admin/terjemahan/glosarium', [
                'source' => 'Pembudidaya',
                'target' => 'Fish farmer',
                'note' => 'Istilah resmi NSA',
            ])
            ->assertCreated();

        $glossaryId = $createRes->json('glossary.id');

        // Terapkan glosarium ke konten terkait
        $this->actingAs($superadmin)
            ->postJson("/admin/terjemahan/glosarium/{$glossaryId}/terapkan")
            ->assertOk()
            ->assertJsonPath('queued', 1);

        // Ekspor CSV
        $export = $this->actingAs($superadmin)
            ->get('/admin/terjemahan/glosarium/ekspor')
            ->assertOk();
        $this->assertStringContainsString('Pembudidaya', $export->streamedContent());

        // Impor CSV
        $csvContent = "source,target,locale,note,case_sensitive,is_active\nLele,Catfish,en,Ikan air tawar,0,1\n";
        $csvFile = UploadedFile::fake()->createWithContent('glosarium.csv', $csvContent);

        $this->actingAs($superadmin)
            ->postJson('/admin/terjemahan/glosarium/impor', ['file' => $csvFile])
            ->assertOk()
            ->assertJsonPath('imported', 1);

        $this->assertDatabaseHas('translation_glossary', [
            'source' => 'Lele',
            'target' => 'Catfish',
        ]);

        // Hapus glosarium
        $this->actingAs($superadmin)
            ->deleteJson("/admin/terjemahan/glosarium/{$glossaryId}")
            ->assertOk();
        $this->assertDatabaseMissing('translation_glossary', ['id' => $glossaryId]);
    }

    public function test_settings_update_and_superadmin_dashboard_failed_alert(): void
    {
        $superadmin = User::factory()->create(['role' => Role::Superadmin]);
        $admin = User::factory()->create(['role' => Role::Admin]);

        $this->actingAs($superadmin)
            ->putJson('/admin/terjemahan/pengaturan', [
                'daily_char_limit' => 250000,
                'batch_size' => 15,
                'failed_alert_threshold' => 2,
            ])
            ->assertOk();

        $this->assertSame('250000', Setting::get('translation.daily_char_limit'));
        $this->assertSame('15', Setting::get('translation.batch_size'));

        // Buat 2 terjemahan gagal agar memicu notifikasi dasbor superadmin
        for ($i = 1; $i <= 2; $i++) {
            ContentTranslation::create([
                'translatable_type' => Post::class,
                'translatable_id' => $i,
                'field' => 'title',
                'locale' => 'en',
                'source_hash' => hash('sha256', "test-{$i}"),
                'status' => ContentTranslation::STATUS_FAILED,
                'error' => 'Simulated API error',
            ]);
        }

        // Superadmin melihat notifikasi gagal
        $this->actingAs($superadmin)
            ->get('/admin')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('translationAlert.failedCount', 2)
                ->where('translationAlert.threshold', 2)
            );

        // Admin biasa tidak melihat notifikasi terjemahan
        $this->actingAs($admin)
            ->get('/admin')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('translationAlert', null)
            );
    }

    public function test_resilience_when_provider_fails_site_falls_back_to_id_and_recovers_on_retry(): void
    {
        $superadmin = User::factory()->create(['role' => Role::Superadmin]);
        $category = PostCategory::create(['name' => 'Inovasi', 'slug' => 'inovasi']);

        // Simulasikan penyedia terjemahan mati / kunci API salah
        $failingTranslator = new class implements Translator
        {
            public function translateBatch(array $items, string $from = 'id', string $to = 'en', array $context = []): array
            {
                throw new RuntimeException('Invalid API key: sk-ant-secret');
            }

            public function driverName(): string
            {
                return 'claude';
            }
        };

        $this->app->instance(Translator::class, $failingTranslator);

        // Buat artikel tanpa mematikan alur simpan; jalankan job failed()
        $post = Post::withoutEvents(fn () => Post::create([
            'type' => PostType::Article,
            'category_id' => $category->id,
            'author_id' => $superadmin->id,
            'title' => 'Ketahanan Pangan Akuakultur',
            'slug' => 'ketahanan-pangan-akuakultur',
            'excerpt' => 'Ringkasan ketahanan pangan.',
            'body' => '<p>Isi artikel ketahanan pangan.</p>',
            'status' => 'published',
            'published_at' => now()->subDay(),
        ]));

        ContentTranslation::create([
            'translatable_type' => $post->getMorphClass(),
            'translatable_id' => $post->id,
            'field' => 'title',
            'locale' => 'en',
            'source_hash' => hash('sha256', $post->title),
            'status' => ContentTranslation::STATUS_PENDING,
        ]);

        $job = new TranslateModelJob(Post::class, $post->id, 'en');
        try {
            $job->handle($failingTranslator, app(TranslationValidator::class));
        } catch (RuntimeException $e) {
            $job->failed($e);
        }

        // Status masuk failed
        $this->assertDatabaseHas('content_translations', [
            'translatable_type' => $post->getMorphClass(),
            'translatable_id' => $post->id,
            'field' => 'title',
            'status' => ContentTranslation::STATUS_FAILED,
        ]);

        // Halaman /en tetap normal (200) dengan fallback Bahasa Indonesia
        $this->get('/en/artikel/ketahanan-pangan-akuakultur')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('post.title', 'Ketahanan Pangan Akuakultur')
            );

        // Pulihkan penyedia dan jalankan translate:retry-failed
        $this->app->instance(Translator::class, new FakeTranslator('[EN] '));
        $this->artisan('translate:retry-failed')->assertSuccessful();

        // Terjemahan pulih menjadi done dan /en kini menampilkan Bahasa Inggris
        $this->assertDatabaseHas('content_translations', [
            'translatable_type' => $post->getMorphClass(),
            'translatable_id' => $post->id,
            'field' => 'title',
            'status' => ContentTranslation::STATUS_DONE,
            'value' => '[EN] Ketahanan Pangan Akuakultur',
        ]);

        $this->get('/en/artikel/ketahanan-pangan-akuakultur')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('post.title', '[EN] Ketahanan Pangan Akuakultur')
            );
    }
}
