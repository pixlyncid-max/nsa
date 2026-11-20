<?php

namespace Tests\Feature;

use App\Enums\Role;
use App\Mail\ContactMessageReceived;
use App\Mail\MemberApprovedMail;
use App\Mail\WelcomeUserMail;
use App\Models\ContactMessage;
use App\Models\SiteText;
use App\Models\User;
use App\Services\CopyService;
use App\Support\Copy\CopyRegistry;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class BilingualSiteTextsTest extends TestCase
{
    use RefreshDatabase;

    public function test_three_layer_resolution_for_en_and_id(): void
    {
        $registry = app(CopyRegistry::class);
        $copyService = app(CopyService::class);

        // Layer 2: bawaan registry en berbeda dari bawaan id
        $idTexts = $copyService->forGroups(['global'], 'id');
        $enTexts = $copyService->forGroups(['global'], 'en');

        $this->assertSame('Beranda', $idTexts['global.nav.home']);
        $this->assertSame('Home', $enTexts['global.nav.home']);

        // Layer 1: override DB locale en mengalahkan bawaan registry en
        $superadmin = User::factory()->create(['role' => Role::Superadmin]);
        $copyService->update('global.nav.home', 'Homepage', $superadmin, 'en');

        $enAfterOverride = $copyService->forGroups(['global'], 'en');
        $this->assertSame('Homepage', $enAfterOverride['global.nav.home']);
        // Versi ID tidak ikut berubah
        $this->assertSame('Beranda', $copyService->forGroups(['global'], 'id')['global.nav.home']);

        // Layer 3: bila registry custom tidak punya en default, fallback ke id default
        $tmpDir = storage_path('framework/testing/copy_fallback_'.uniqid());
        mkdir($tmpDir, 0755, true);
        file_put_contents($tmpDir.'/sample.php', <<<'PHP'
<?php
return [
    'sample.greeting' => [
        'label' => 'Sapaan',
        'hint' => 'Tes',
        'type' => 'text',
        'default' => 'Halo Nusantara',
        'max' => 60,
        'placeholders' => [],
    ],
];
PHP);

        try {
            $tempRegistry = new CopyRegistry($tmpDir);
            $tempService = new CopyService($tempRegistry);

            $this->assertSame('Halo Nusantara', $tempService->forGroups(['sample'], 'en')['sample.greeting']);
        } finally {
            @unlink($tmpDir.'/sample.php');
            @rmdir($tmpDir);
        }
    }

    public function test_updating_id_auto_translates_en_and_manual_en_is_not_overwritten(): void
    {
        $superadmin = User::factory()->create(['role' => Role::Superadmin]);
        $copyService = app(CopyService::class);

        // Ubah teks ID → job M2 otomatis menerjemahkan ke EN (driver fake memberi awalan "[EN] ")
        $copyService->update('about.header.title', 'Tentang Komunitas Perikanan Nusantara', $superadmin, 'id');

        $enRow = SiteText::query()
            ->where('key', 'about.header.title')
            ->where('locale', 'en')
            ->first();

        $this->assertNotNull($enRow);
        $this->assertSame('[EN] Tentang Komunitas Perikanan Nusantara', $enRow->value);
        $this->assertFalse($enRow->is_manual);
        $this->assertSame(SiteText::STATUS_AUTO, $enRow->translation_status);

        // Revisi mencatat locale untuk kedua bahasa
        $this->assertDatabaseHas('site_text_revisions', [
            'locale' => 'id',
            'new_value' => 'Tentang Komunitas Perikanan Nusantara',
        ]);
        $this->assertDatabaseHas('site_text_revisions', [
            'locale' => 'en',
            'new_value' => '[EN] Tentang Komunitas Perikanan Nusantara',
        ]);

        // Edit EN manual → terkunci manual
        $copyService->update('about.header.title', 'About Indonesian Fisheries Community', $superadmin, 'en');

        $enRow->refresh();
        $this->assertTrue($enRow->is_manual);
        $this->assertSame(SiteText::STATUS_MANUAL, $enRow->translation_status);
        $this->assertSame('About Indonesian Fisheries Community', $enRow->value);

        // Ubah ID lagi → EN manual TIDAK boleh tertimpa
        $copyService->update('about.header.title', 'Profil Baru NSA Indonesia', $superadmin, 'id');

        $enRow->refresh();
        $this->assertTrue($enRow->is_manual);
        $this->assertSame('About Indonesian Fisheries Community', $enRow->value);

        // Kembalikan ke otomatis → melepas kunci manual dan menerjemahkan ulang dari ID terbaru
        $copyService->revertToAuto('about.header.title', $superadmin);

        $enRow->refresh();
        $this->assertFalse($enRow->is_manual);
        $this->assertSame(SiteText::STATUS_AUTO, $enRow->translation_status);
        $this->assertSame('[EN] Profil Baru NSA Indonesia', $enRow->value);
    }

    public function test_cache_for_both_locales_is_invalidated_on_change(): void
    {
        $superadmin = User::factory()->create(['role' => Role::Superadmin]);
        $copyService = app(CopyService::class);

        // Isi cache untuk kedua locale
        $copyService->forGroups(['contact'], 'id');
        $copyService->forGroups(['contact'], 'en');

        $idKey = $copyService->cacheKey('contact', 'id');
        $enKey = $copyService->cacheKey('contact', 'en');

        $this->assertTrue(Cache::has($idKey));
        $this->assertTrue(Cache::has($enKey));

        // Ubah satu locale → cache kedua locale harus terhapus
        $copyService->update('contact.header.title', 'Hubungi Kami Sekarang', $superadmin, 'id');

        $this->assertFalse(Cache::has($idKey));
        $this->assertFalse(Cache::has($enKey));
    }

    public function test_superadmin_can_manage_bilingual_site_texts_via_http(): void
    {
        $superadmin = User::factory()->create(['role' => Role::Superadmin]);

        // Simpan EN manual via endpoint (seperti mode edit langsung di /en/...)
        $this->actingAs($superadmin)
            ->putJson('/admin/teks-website/global.nav.about', [
                'value' => 'About NSA',
                'locale' => 'en',
            ])
            ->assertOk()
            ->assertJsonPath('siteText.locale', 'en')
            ->assertJsonPath('siteText.isManual', true);

        // Meta endpoint mengembalikan nilai sesuai locale query
        $this->actingAs($superadmin)
            ->getJson('/admin/teks-website/global.nav.about/meta?locale=en')
            ->assertOk()
            ->assertJsonPath('locale', 'en')
            ->assertJsonPath('currentValue', 'About NSA')
            ->assertJsonPath('isManual', true);

        // Endpoint kembalikan ke otomatis
        $this->actingAs($superadmin)
            ->postJson('/admin/teks-website/global.nav.about/otomatis')
            ->assertOk()
            ->assertJsonPath('enIsManual', false);

        // Riwayat revisi menyertakan field locale
        $this->actingAs($superadmin)
            ->getJson('/admin/teks-website/global.nav.about/riwayat')
            ->assertOk()
            ->assertJsonStructure([
                'revisions' => [
                    '*' => ['id', 'locale', 'oldValue', 'newValue', 'userName'],
                ],
            ]);
    }

    public function test_emails_render_in_user_locale_and_respect_explicit_locale(): void
    {
        $enUser = User::factory()->create([
            'name' => 'John Fisher',
            'locale' => 'en',
            'member_number' => 'NSA-2026-001',
        ]);
        $idUser = User::factory()->create([
            'name' => 'Budi Santoso',
            'locale' => 'id',
            'member_number' => 'NSA-2026-002',
        ]);

        // WelcomeUserMail mengikuti users.locale
        $enWelcome = new WelcomeUserMail($enUser);
        $this->assertStringContainsString('Welcome to', $enWelcome->envelope()->subject);
        $this->assertStringContainsString('Register as Member', $enWelcome->content()->htmlString);

        $idWelcome = new WelcomeUserMail($idUser);
        $this->assertStringContainsString('Selamat Datang di', $idWelcome->envelope()->subject);
        $this->assertStringContainsString('Daftar Jadi Anggota', $idWelcome->content()->htmlString);

        // MemberApprovedMail menghormati $mailable->locale(...)
        $approved = (new MemberApprovedMail($idUser))->locale('en');
        $this->assertStringContainsString('Congratulations!', $approved->envelope()->subject);
        $this->assertStringContainsString('Official Member Number', $approved->content()->htmlString);

        // Guest email memakai locale permintaan (app()->getLocale())
        app()->setLocale('en');
        $contactMessage = ContactMessage::create([
            'name' => 'Alice',
            'email' => 'alice@example.com',
            'topic' => 'kemitraan',
            'message' => 'Hello from guest',
        ]);
        $guestMail = new ContactMessageReceived($contactMessage);
        $this->assertStringContainsString('New Partnership Proposal', $guestMail->envelope()->subject);
        app()->setLocale('id');
    }

    public function test_copy_check_passes_with_complete_en_defaults_and_fails_when_missing(): void
    {
        // Registry utama lengkap → copy:check sukses
        $this->artisan('copy:check')->assertSuccessful();

        // Registry sementara tanpa file en/ → copy:check wajib gagal
        $tmpDir = storage_path('framework/testing/copy_missing_en_'.uniqid());
        mkdir($tmpDir, 0755, true);
        file_put_contents($tmpDir.'/demo.php', <<<'PHP'
<?php
return [
    'demo.title' => [
        'label' => 'Judul Demo',
        'hint' => 'Tes',
        'type' => 'text',
        'default' => 'Halo Dunia',
        'max' => 60,
        'placeholders' => [],
    ],
];
PHP);

        $originalRegistry = app(CopyRegistry::class);

        try {
            $this->app->instance(CopyRegistry::class, new CopyRegistry($tmpDir));

            $this->artisan('copy:check', ['--path' => $tmpDir])
                ->expectsOutputToContain('demo.title')
                ->assertFailed();
        } finally {
            $this->app->instance(CopyRegistry::class, $originalRegistry);
            @unlink($tmpDir.'/demo.php');
            @rmdir($tmpDir);
        }
    }

    public function test_i18n_audit_and_copy_translate_defaults_commands_run_cleanly(): void
    {
        $this->artisan('i18n:audit', ['--limit' => 5])->assertSuccessful();

        // Uji copy:translate-defaults pada direktori sementara
        $tmpDir = storage_path('framework/testing/copy_translate_'.uniqid());
        mkdir($tmpDir, 0755, true);
        file_put_contents($tmpDir.'/demo.php', <<<'PHP'
<?php
return [
    'demo.greeting' => [
        'label' => 'Sapaan',
        'hint' => 'Tes',
        'type' => 'text',
        'default' => 'Halo {name}',
        'max' => 60,
        'placeholders' => ['name'],
    ],
];
PHP);

        $originalRegistry = app(CopyRegistry::class);

        try {
            $this->app->instance(CopyRegistry::class, new CopyRegistry($tmpDir));

            $this->artisan('copy:translate-defaults', ['--only' => 'demo', '--missing' => true])
                ->assertSuccessful();

            $enFile = $tmpDir.'/en/demo.php';
            $this->assertFileExists($enFile);
            $generated = require $enFile;
            $this->assertSame('[EN] Halo {name}', $generated['demo.greeting']);
        } finally {
            $this->app->instance(CopyRegistry::class, $originalRegistry);
            @unlink($tmpDir.'/en/demo.php');
            @rmdir($tmpDir.'/en');
            @unlink($tmpDir.'/demo.php');
            @rmdir($tmpDir);
        }
    }
}
