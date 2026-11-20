<?php

namespace Tests\Feature;

use App\Enums\Role;
use App\Models\SiteText;
use App\Models\SiteTextRevision;
use App\Models\User;
use App\Services\CopyService;
use App\Support\Copy\CopyRegistry;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class SiteTextFoundationTest extends TestCase
{
    use RefreshDatabase;

    private User $superadmin;

    private User $admin;

    private User $user;

    private CopyService $copyService;

    protected function setUp(): void
    {
        parent::setUp();

        Cache::flush();

        $this->superadmin = User::factory()->create(['role' => Role::Superadmin]);
        $this->admin = User::factory()->create(['role' => Role::Admin]);
        $this->user = User::factory()->create(['role' => Role::User]);
        $this->copyService = app(CopyService::class);
    }

    public function test_registry_loads_all_14_groups_and_validates_entries(): void
    {
        $registry = app(CopyRegistry::class);
        $groups = $registry->groups();

        foreach ([
            'global',
            'home',
            'organization',
            'products',
            'cart',
            'about',
            'partnership',
            'articles',
            'contact',
            'auth',
            'account',
            'member',
            'registration',
            'emails',
        ] as $expectedGroup) {
            $this->assertContains($expectedGroup, $groups);
        }

        $this->assertTrue($registry->has('home.hero.title'));
        $this->assertTrue($registry->has('registration.progress'));
    }

    public function test_default_value_is_used_when_db_is_empty_and_db_value_overrides_default(): void
    {
        $defaults = $this->copyService->forGroups(['home']);
        $this->assertSame(
            'Menguatkan Budidaya Perikanan Berkelanjutan Nusantara',
            $defaults['home.hero.title']
        );

        $this->copyService->update('home.hero.title', 'Judul Baru Beranda NSA', $this->superadmin);

        $updated = $this->copyService->forGroups(['home']);
        $this->assertSame('Judul Baru Beranda NSA', $updated['home.hero.title']);
    }

    public function test_update_clears_cache_records_revision_and_activity_log_and_supports_reset_and_restore(): void
    {
        // Isi cache terlebih dahulu
        $initial = $this->copyService->forGroups(['home']);
        $this->assertTrue(Cache::has($this->copyService->cacheKey('home')));
        $this->assertSame('Menguatkan Budidaya Perikanan Berkelanjutan Nusantara', $initial['home.hero.title']);

        // Update 1
        $siteText = $this->copyService->update('home.hero.title', 'Versi Pertama', $this->superadmin);
        $this->assertFalse(Cache::has($this->copyService->cacheKey('home')));
        $this->assertSame('Versi Pertama', $this->copyService->forGroups(['home'])['home.hero.title']);

        $firstRevision = SiteTextRevision::query()->where('site_text_id', $siteText->id)->first();
        $this->assertNotNull($firstRevision);
        $this->assertNull($firstRevision->old_value);
        $this->assertSame('Versi Pertama', $firstRevision->new_value);
        $this->assertSame($this->superadmin->id, $firstRevision->user_id);

        $this->assertDatabaseHas('activity_logs', [
            'user_id' => $this->superadmin->id,
            'action' => 'update_site_text',
        ]);

        // Update 2
        $this->copyService->update('home.hero.title', 'Versi Kedua', $this->superadmin);
        $this->assertSame('Versi Kedua', $this->copyService->forGroups(['home'])['home.hero.title']);

        // Restore ke revisi pertama
        $this->copyService->restore($firstRevision->id, $this->superadmin);
        $this->assertSame('Versi Pertama', $this->copyService->forGroups(['home'])['home.hero.title']);

        // Reset ke bawaan (value = null)
        $this->copyService->reset('home.hero.title', $this->superadmin);
        $this->assertDatabaseHas('site_texts', [
            'key' => 'home.hero.title',
            'value' => null,
        ]);
        $this->assertSame(
            'Menguatkan Budidaya Perikanan Berkelanjutan Nusantara',
            $this->copyService->forGroups(['home'])['home.hero.title']
        );
    }

    public function test_missing_required_placeholder_and_exceeding_max_length_are_rejected(): void
    {
        // Placeholder {step} atau {total} hilang harus ditolak
        try {
            $this->copyService->update('registration.progress', 'Langkah {step} saja', $this->superadmin);
            $this->fail('Seharusnya gagal karena placeholder {total} hilang.');
        } catch (ValidationException $e) {
            $this->assertArrayHasKey('value', $e->errors());
        }

        // Melebihi max (home.hero.title max = 80) harus ditolak
        try {
            $this->copyService->update('home.hero.title', str_repeat('A', 81), $this->superadmin);
            $this->fail('Seharusnya gagal karena panjang melebihi batas max.');
        } catch (ValidationException $e) {
            $this->assertArrayHasKey('value', $e->errors());
        }

        // Nilai valid dengan placeholder lengkap berhasil
        $this->copyService->update('registration.progress', 'Tahap {step}/{total}', $this->superadmin);
        $this->assertSame('Tahap 3/9', $this->copyService->get('registration.progress', ['step' => 3, 'total' => 9]));
    }

    public function test_html_in_text_is_escaped_and_richtext_is_sanitized(): void
    {
        // Tipe text: tag HTML di-escape
        $this->copyService->update(
            'home.hero.title',
            'Halo <b>NSA</b> <script>alert(1)</script>',
            $this->superadmin
        );

        $escaped = $this->copyService->forGroups(['home'])['home.hero.title'];
        $this->assertStringNotContainsString('<script>', $escaped);
        $this->assertStringContainsString('&lt;script&gt;', $escaped);
        $this->assertStringContainsString('&lt;b&gt;NSA&lt;/b&gt;', $escaped);

        // Tipe richtext: script & event handler dihapus, tag aman dipertahankan
        $this->copyService->update(
            'global.footer.legal_note',
            '<p onclick="evil()">Halo <strong>NSA</strong></p><script>alert("xss")</script><a href="javascript:alert(1)">Klik</a>',
            $this->superadmin
        );

        $sanitized = $this->copyService->forGroups(['global'])['global.footer.legal_note'];
        $this->assertStringNotContainsString('<script', $sanitized);
        $this->assertStringNotContainsString('alert("xss")', $sanitized);
        $this->assertStringNotContainsString('onclick', $sanitized);
        $this->assertStringNotContainsString('javascript:', $sanitized);
        $this->assertStringContainsString('<strong>NSA</strong>', $sanitized);
    }

    public function test_site_text_routes_are_strictly_superadmin_only(): void
    {
        $siteText = SiteText::factory()->create([
            'key' => 'home.hero.title',
            'group' => 'home',
            'value' => 'Judul Lama',
            'updated_by' => $this->superadmin->id,
        ]);

        $revision = SiteTextRevision::factory()->create([
            'site_text_id' => $siteText->id,
            'old_value' => null,
            'new_value' => 'Judul Lama',
            'user_id' => $this->superadmin->id,
        ]);

        // Guest -> redirect ke login
        $this->get('/admin/teks-website')->assertRedirect('/login');
        $this->put('/admin/teks-website/home.hero.title', ['value' => 'Baru'])->assertRedirect('/login');
        $this->post('/admin/teks-website/home.hero.title/reset')->assertRedirect('/login');
        $this->post("/admin/teks-website/revisi/{$revision->id}/pulihkan")->assertRedirect('/login');

        // User biasa -> 403 di semua rute
        $this->actingAs($this->user)->get('/admin/teks-website')->assertStatus(403);
        $this->actingAs($this->user)->put('/admin/teks-website/home.hero.title', ['value' => 'Baru'])->assertStatus(403);
        $this->actingAs($this->user)->post('/admin/teks-website/home.hero.title/reset')->assertStatus(403);
        $this->actingAs($this->user)->post("/admin/teks-website/revisi/{$revision->id}/pulihkan")->assertStatus(403);

        // Admin biasa -> 403 di semua rute
        $this->actingAs($this->admin)->get('/admin/teks-website')->assertStatus(403);
        $this->actingAs($this->admin)->put('/admin/teks-website/home.hero.title', ['value' => 'Baru'])->assertStatus(403);
        $this->actingAs($this->admin)->post('/admin/teks-website/home.hero.title/reset')->assertStatus(403);
        $this->actingAs($this->admin)->post("/admin/teks-website/revisi/{$revision->id}/pulihkan")->assertStatus(403);

        // Superadmin -> 200 & aksi berhasil
        $this->actingAs($this->superadmin)
            ->get('/admin/teks-website')
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->component('Admin/SiteTexts/Index')
                ->has('groups')
                ->where('totalKeys', count(app(CopyRegistry::class)->all()))
            );

        $this->actingAs($this->superadmin)
            ->put('/admin/teks-website/home.hero.title', ['value' => 'Judul Baru Superadmin'])
            ->assertRedirect();

        $this->assertSame('Judul Baru Superadmin', $this->copyService->forGroups(['home'])['home.hero.title']);

        $this->actingAs($this->superadmin)
            ->post('/admin/teks-website/home.hero.title/reset')
            ->assertRedirect();

        $this->assertSame(
            'Menguatkan Budidaya Perikanan Berkelanjutan Nusantara',
            $this->copyService->forGroups(['home'])['home.hero.title']
        );

        $this->actingAs($this->superadmin)
            ->post("/admin/teks-website/revisi/{$revision->id}/pulihkan")
            ->assertRedirect();

        $this->assertSame('Judul Lama', $this->copyService->forGroups(['home'])['home.hero.title']);
    }

    public function test_inertia_shares_global_and_active_route_copy_groups_only(): void
    {
        $response = $this->get('/');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->has('copy')
            ->where('copy', function ($copy) {
                $data = is_array($copy) ? $copy : $copy->toArray();

                return ($data['global.nav.home'] ?? null) === 'Beranda'
                    && ($data['home.hero.title'] ?? null) === 'Menguatkan Budidaya Perikanan Berkelanjutan Nusantara'
                    && ! array_key_exists('contact.header.title', $data);
            })
        );
    }

    public function test_copy_seed_and_copy_check_artisan_commands(): void
    {
        $this->artisan('copy:seed')->assertExitCode(0);
        $this->artisan('copy:check')->assertExitCode(0);

        // Buat direktori sementara dengan key yang tidak terdaftar untuk menguji exit code 1
        $tempDir = storage_path('framework/testing/copy-check-invalid');
        if (! is_dir($tempDir)) {
            mkdir($tempDir, 0777, true);
        }

        $sampleFile = $tempDir.DIRECTORY_SEPARATOR.'Sample.tsx';
        file_put_contents($sampleFile, "const x = t('home.tidak.terdaftar');");

        try {
            $this->artisan('copy:check', ['--path' => $tempDir])->assertExitCode(1);
        } finally {
            @unlink($sampleFile);
            @rmdir($tempDir);
        }
    }
}
