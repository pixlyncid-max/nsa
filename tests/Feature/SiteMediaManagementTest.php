<?php

namespace Tests\Feature;

use App\Models\ActivityLog;
use App\Models\Setting;
use App\Models\User;
use App\Services\SiteMediaService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class SiteMediaManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_view_site_media_page(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->get('/admin/gambar-website');

        $response->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('Admin/SiteMedia/Index')
            ->has('groups')
            ->has('items', count(config('site_media.slots')))
        );
    }

    public function test_regular_user_cannot_access_site_media_management(): void
    {
        $member = User::factory()->create(['role' => 'user']);

        $this->actingAs($member)->get('/admin/gambar-website')->assertForbidden();
        $this->actingAs($member)->post('/admin/gambar-website/hero_desktop')->assertForbidden();
        $this->actingAs($member)->delete('/admin/gambar-website/hero_desktop')->assertForbidden();
    }

    public function test_admin_can_upload_and_reset_site_media_slot_and_updates_public_page(): void
    {
        Storage::fake('public');
        $admin = User::factory()->create(['role' => 'superadmin']);

        // 1. Unggah gambar baru untuk slot hero_desktop dan join_strip_desktop
        $heroFile = UploadedFile::fake()->image('hero.webp', 1200, 600);
        $this->actingAs($admin)
            ->post('/admin/gambar-website/hero_desktop', ['image' => $heroFile])
            ->assertRedirect();

        $storedHeroPath = Setting::get('site_media.hero_desktop');
        $this->assertNotNull($storedHeroPath);
        Storage::disk('public')->assertExists($storedHeroPath);

        $joinFile = UploadedFile::fake()->image('join.jpg', 1200, 300);
        $this->actingAs($admin)
            ->post('/admin/gambar-website/join_strip_desktop', ['image' => $joinFile])
            ->assertRedirect();

        $storedJoinPath = Setting::get('site_media.join_strip_desktop');
        $this->assertNotNull($storedJoinPath);
        Storage::disk('public')->assertExists($storedJoinPath);

        // 2. Pastikan activity_logs mencatat aksi unggah
        $this->assertDatabaseHas('activity_logs', [
            'action' => 'update_site_media',
            'user_id' => $admin->id,
        ]);

        // 3. Pastikan halaman publik menerima URL terbaru melalui Inertia props
        $expectedHeroUrl = Storage::url($storedHeroPath);
        $expectedJoinUrl = Storage::url($storedJoinPath);

        $this->get('/')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('siteMedia.hero_desktop', $expectedHeroUrl)
                ->where('siteMedia.join_strip_desktop', $expectedJoinUrl)
                ->where('heroConfig.desktop.src', $expectedHeroUrl)
                ->where('joinStrip.media.desktop.src', $expectedJoinUrl)
            );

        // 4. Kembalikan ke bawaan (reset) dan pastikan berkas & cache terhapus
        $this->actingAs($admin)
            ->delete('/admin/gambar-website/hero_desktop')
            ->assertRedirect();

        Storage::disk('public')->assertMissing($storedHeroPath);
        $this->assertNull(Setting::get('site_media.hero_desktop'));
        $this->assertNull(app(SiteMediaService::class)->uploadedUrl('hero_desktop'));

        $this->assertTrue(
            ActivityLog::query()
                ->where('action', 'reset_site_media')
                ->where('user_id', $admin->id)
                ->exists()
        );
    }

    public function test_unknown_slot_returns_404(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)
            ->post('/admin/gambar-website/slot_tidak_ada', [
                'image' => UploadedFile::fake()->image('x.png'),
            ])
            ->assertNotFound();

        $this->actingAs($admin)
            ->delete('/admin/gambar-website/slot_tidak_ada')
            ->assertNotFound();
    }
}
