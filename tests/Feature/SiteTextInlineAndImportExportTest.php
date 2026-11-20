<?php

namespace Tests\Feature;

use App\Enums\Role;
use App\Models\SiteText;
use App\Models\SiteTextRevision;
use App\Models\User;
use App\Services\CopyService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class SiteTextInlineAndImportExportTest extends TestCase
{
    use RefreshDatabase;

    private User $superadmin;

    private User $admin;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();

        Cache::flush();

        $this->superadmin = User::factory()->create(['role' => Role::Superadmin]);
        $this->admin = User::factory()->create(['role' => Role::Admin]);
        $this->user = User::factory()->create(['role' => Role::User]);
    }

    public function test_can_edit_copy_prop_is_only_sent_to_superadmin(): void
    {
        // Guest tidak menerima canEditCopy
        $this->get('/')
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page->missing('canEditCopy'));

        // User biasa tidak menerima canEditCopy
        $this->actingAs($this->user)
            ->get('/')
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page->missing('canEditCopy'));

        // Admin biasa tidak menerima canEditCopy
        $this->actingAs($this->admin)
            ->get('/')
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page->missing('canEditCopy'));

        // Superadmin menerima canEditCopy = true
        $this->actingAs($this->superadmin)
            ->get('/')
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page->where('canEditCopy', true));
    }

    public function test_inline_meta_and_export_import_endpoints_are_superadmin_only(): void
    {
        // Guest diarahkan ke login
        $this->get('/admin/teks-website/home.hero.title/meta')->assertRedirect('/login');
        $this->get('/admin/teks-website/ekspor')->assertRedirect('/login');
        $this->post('/admin/teks-website/impor/pratinjau', ['items' => []])->assertRedirect('/login');
        $this->post('/admin/teks-website/impor/terapkan', ['items' => []])->assertRedirect('/login');

        // Admin biasa dan user biasa mendapat 403
        foreach ([$this->admin, $this->user] as $actor) {
            $this->actingAs($actor)->getJson('/admin/teks-website/home.hero.title/meta')->assertStatus(403);
            $this->actingAs($actor)->getJson('/admin/teks-website/ekspor')->assertStatus(403);
            $this->actingAs($actor)->postJson('/admin/teks-website/impor/pratinjau', ['items' => []])->assertStatus(403);
            $this->actingAs($actor)->postJson('/admin/teks-website/impor/terapkan', ['items' => []])->assertStatus(403);
        }

        // Superadmin dapat mengakses meta
        $this->actingAs($this->superadmin)
            ->getJson('/admin/teks-website/home.hero.title/meta')
            ->assertStatus(200)
            ->assertJsonPath('key', 'home.hero.title')
            ->assertJsonPath('group', 'home');
    }

    public function test_superadmin_can_export_preview_and_apply_json_import_with_sanitization(): void
    {
        SiteText::factory()->create([
            'key' => 'home.hero.title',
            'group' => 'home',
            'locale' => 'id',
            'value' => 'Judul Ekspor Uji',
            'updated_by' => $this->superadmin->id,
        ]);

        // 1. Ekspor menghasilkan JSON hanya untuk teks yang diubah
        $exportRes = $this->actingAs($this->superadmin)
            ->getJson('/admin/teks-website/ekspor')
            ->assertStatus(200)
            ->assertJsonPath('count', 1)
            ->assertJsonPath('items.0.key', 'home.hero.title')
            ->assertJsonPath('items.0.value', 'Judul Ekspor Uji')
            ->assertJsonPath('items.0.locale', 'id');

        $this->assertNotEmpty($exportRes->json('items'));

        // 2. Pratinjau impor mendeteksi valid, key tak dikenal, dan placeholder hilang
        $importPayload = [
            ['key' => 'home.hero.title', 'value' => 'Judul Impor <b>Baru</b>', 'locale' => 'id'],
            ['key' => 'global.footer.legal_note', 'value' => '<p>Aman <strong>NSA</strong></p><script>alert(1)</script>', 'locale' => 'id'],
            ['key' => 'key.tidak.dikenal', 'value' => 'Abaikan', 'locale' => 'id'],
            ['key' => 'registration.progress', 'value' => 'Tanpa placeholder', 'locale' => 'id'],
        ];

        $this->actingAs($this->superadmin)
            ->postJson('/admin/teks-website/impor/pratinjau', ['items' => $importPayload])
            ->assertStatus(200)
            ->assertJsonPath('summary.total', 4)
            ->assertJsonPath('summary.applicable', 2)
            ->assertJsonPath('summary.warnings', 2);

        // 3. Terapkan impor dalam satu transaksi
        $this->actingAs($this->superadmin)
            ->postJson('/admin/teks-website/impor/terapkan', ['items' => $importPayload])
            ->assertStatus(200)
            ->assertJsonPath('applied', 2)
            ->assertJsonPath('skipped', 2);

        $copyService = app(CopyService::class);

        // Text HTML di-escape, richtext script dihapus
        $homeTexts = $copyService->forGroups(['home']);
        $this->assertSame('Judul Impor &lt;b&gt;Baru&lt;/b&gt;', $homeTexts['home.hero.title']);

        $globalTexts = $copyService->forGroups(['global']);
        $this->assertStringNotContainsString('<script', $globalTexts['global.footer.legal_note']);
        $this->assertStringContainsString('<strong>NSA</strong>', $globalTexts['global.footer.legal_note']);

        // Revisi dan log aktivitas tercatat
        $this->assertGreaterThanOrEqual(2, SiteTextRevision::query()->count());
        $this->assertDatabaseHas('activity_logs', [
            'user_id' => $this->superadmin->id,
            'action' => 'import_site_texts',
        ]);
    }

    public function test_copy_service_uses_cache_without_extra_queries(): void
    {
        $copyService = app(CopyService::class);

        // Panggilan pertama mengisi cache
        $copyService->forGroups(['global', 'home']);

        // Panggilan kedua harus 0 query DB
        DB::enableQueryLog();
        DB::flushQueryLog();

        $copyService->forGroups(['global', 'home']);

        $queries = DB::getQueryLog();
        DB::disableQueryLog();

        $this->assertCount(0, $queries);
    }
}
