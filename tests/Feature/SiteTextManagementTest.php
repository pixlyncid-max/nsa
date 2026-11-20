<?php

namespace Tests\Feature;

use App\Enums\Role;
use App\Models\SiteText;
use App\Models\SiteTextRevision;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class SiteTextManagementTest extends TestCase
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

    public function test_superadmin_can_update_reset_restore_and_public_page_shows_new_text(): void
    {
        // 1. Buka halaman kelompok Beranda
        $this->actingAs($this->superadmin)
            ->get('/admin/teks-website/home')
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->component('Admin/SiteTexts/Index')
                ->where('activeGroup', 'home')
                ->has('groups', 14)
            );

        // 2. Ubah teks via endpoint JSON (seperti di UI editor)
        $this->actingAs($this->superadmin)
            ->putJson('/admin/teks-website/home.hero.title', [
                'value' => 'Judul Baru Dari Panel Superadmin',
            ])
            ->assertStatus(200)
            ->assertJsonPath('siteText.value', 'Judul Baru Dari Panel Superadmin');

        $this->assertDatabaseHas('activity_logs', [
            'user_id' => $this->superadmin->id,
            'action' => 'update_site_text',
        ]);

        // 3. Halaman publik langsung menampilkan teks baru (cache terhapus otomatis)
        $this->get('/')
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->where('copy', function ($copy) {
                    $data = is_array($copy) ? $copy : $copy->toArray();

                    return ($data['home.hero.title'] ?? null) === 'Judul Baru Dari Panel Superadmin';
                })
            );

        // 4. Ubah lagi lalu cek endpoint riwayat & pulihkan revisi pertama
        $this->actingAs($this->superadmin)
            ->putJson('/admin/teks-website/home.hero.title', [
                'value' => 'Judul Versi Kedua',
            ])
            ->assertStatus(200);

        $historyRes = $this->actingAs($this->superadmin)
            ->getJson('/admin/teks-website/home.hero.title/riwayat')
            ->assertStatus(200);

        $idRevisions = collect($historyRes->json('revisions'))->where('locale', 'id')->values();
        $this->assertCount(2, $idRevisions);

        $firstRevisionId = SiteTextRevision::query()->orderBy('id')->firstOrFail()->id;
        $this->assertNotEmpty($historyRes->json('revisions'));

        $this->actingAs($this->superadmin)
            ->postJson("/admin/teks-website/revisi/{$firstRevisionId}/pulihkan")
            ->assertStatus(200)
            ->assertJsonPath('value', 'Judul Baru Dari Panel Superadmin');

        // 5. Reset ke default
        $this->actingAs($this->superadmin)
            ->postJson('/admin/teks-website/home.hero.title/reset')
            ->assertStatus(200);

        $this->get('/')
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->where('copy', function ($copy) {
                    $data = is_array($copy) ? $copy : $copy->toArray();

                    return ($data['home.hero.title'] ?? null) === 'Menguatkan Budidaya Perikanan Berkelanjutan Nusantara';
                })
            );
    }

    public function test_superadmin_can_bulk_save_multiple_texts_and_logs_activity(): void
    {
        $this->actingAs($this->superadmin)
            ->putJson('/admin/teks-website/simpan-banyak', [
                'items' => [
                    ['key' => 'home.hero.title', 'value' => 'Judul Massal Satu'],
                    ['key' => 'home.news.title', 'value' => 'Berita Massal Dua'],
                ],
            ])
            ->assertStatus(200)
            ->assertJsonPath('updatedCount', 2);

        $this->assertDatabaseHas('site_texts', [
            'key' => 'home.hero.title',
            'value' => 'Judul Massal Satu',
        ]);
        $this->assertDatabaseHas('site_texts', [
            'key' => 'home.news.title',
            'value' => 'Berita Massal Dua',
        ]);
    }

    public function test_regular_admin_and_user_receive_403_on_all_management_routes(): void
    {
        foreach ([$this->admin, $this->user] as $actor) {
            $this->actingAs($actor)->get('/admin/teks-website')->assertStatus(403);
            $this->actingAs($actor)->get('/admin/teks-website/home')->assertStatus(403);
            $this->actingAs($actor)->getJson('/admin/teks-website/home.hero.title/riwayat')->assertStatus(403);
            $this->actingAs($actor)->putJson('/admin/teks-website/simpan-banyak', [
                'items' => [['key' => 'home.hero.title', 'value' => 'Tidak Boleh']],
            ])->assertStatus(403);
        }
    }

    public function test_missing_required_placeholder_and_exceeding_max_length_are_rejected_by_form_request(): void
    {
        // Placeholder wajib {total} hilang -> 422
        $this->actingAs($this->superadmin)
            ->putJson('/admin/teks-website/registration.progress', [
                'value' => 'Langkah {step} tanpa total',
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['value']);

        // Melebihi max (home.hero.title max = 80) -> 422
        $this->actingAs($this->superadmin)
            ->putJson('/admin/teks-website/home.hero.title', [
                'value' => str_repeat('X', 85),
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['value']);
    }

    public function test_global_search_and_changed_only_filter_work(): void
    {
        SiteText::factory()->create([
            'key' => 'home.hero.title',
            'group' => 'home',
            'value' => 'Judul Khusus Pencarian Unik',
            'updated_by' => $this->superadmin->id,
        ]);

        // Filter "Hanya yang diubah" pada kelompok home hanya mengembalikan 1 item
        $this->actingAs($this->superadmin)
            ->get('/admin/teks-website/home?filter=changed')
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->has('items', 1)
                ->where('items.0.key', 'home.hero.title')
                ->where('items.0.isChanged', true)
            );

        // Pencarian global dari kelompok lain (mis. contact) tetap menemukan key di home
        $this->actingAs($this->superadmin)
            ->get('/admin/teks-website/contact?search=Pencarian+Unik')
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->has('items', 1)
                ->where('items.0.key', 'home.hero.title')
            );
    }
}
