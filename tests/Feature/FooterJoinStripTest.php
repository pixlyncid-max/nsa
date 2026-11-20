<?php

namespace Tests\Feature;

use App\Enums\MembershipStatus;
use App\Enums\Role;
use App\Models\User;
use App\Services\CopyService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class FooterJoinStripTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Cache::flush();
    }

    public function test_join_strip_is_visible_for_guest_non_member_and_draft_on_public_pages(): void
    {
        // Guest di Beranda & halaman publik lainnya
        foreach (['/', '/tentang-kami', '/produk', '/kemitraan', '/artikel', '/kontak', '/organisasi/dpp'] as $url) {
            $this->get($url)
                ->assertStatus(200)
                ->assertInertia(fn ($page) => $page
                    ->where('joinStrip.visible', true)
                    ->where('joinStrip.ctaLabel', 'Daftar Anggota')
                    ->where('joinStrip.ctaHref', '/register?intended=/akun/keanggotaan/daftar')
                );
        }

        // Non-member
        $nonMember = User::factory()->create([
            'role' => Role::User,
            'membership_status' => MembershipStatus::NonMember,
        ]);

        $this->actingAs($nonMember)
            ->get('/')
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->where('joinStrip.visible', true)
                ->where('joinStrip.ctaLabel', 'Daftar Anggota')
                ->where('joinStrip.ctaHref', '/akun/keanggotaan/daftar')
            );

        // Draft
        $draft = User::factory()->create([
            'role' => Role::User,
            'membership_status' => MembershipStatus::Draft,
        ]);

        $this->actingAs($draft)
            ->get('/')
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->where('joinStrip.visible', true)
                ->where('joinStrip.ctaLabel', 'Lanjutkan Pendaftaran')
                ->where('joinStrip.ctaHref', '/akun/keanggotaan/daftar')
            );
    }

    public function test_join_strip_is_hidden_for_approved_post_submission_statuses_and_staff(): void
    {
        $hiddenStatuses = [
            MembershipStatus::Approved,
            MembershipStatus::PendingReview,
            MembershipStatus::Revision,
            MembershipStatus::AwaitingPayment,
            MembershipStatus::PendingApproval,
            MembershipStatus::Rejected,
        ];

        foreach ($hiddenStatuses as $status) {
            $user = User::factory()->create([
                'role' => Role::User,
                'membership_status' => $status,
            ]);

            $this->actingAs($user)
                ->get('/')
                ->assertStatus(200)
                ->assertInertia(fn ($page) => $page
                    ->where('joinStrip.visible', false)
                );
        }

        foreach ([Role::Admin, Role::Superadmin] as $role) {
            $staff = User::factory()->create(['role' => $role]);

            $this->actingAs($staff)
                ->get('/')
                ->assertStatus(200)
                ->assertInertia(fn ($page) => $page
                    ->where('joinStrip.visible', false)
                );
        }
    }

    public function test_join_strip_is_hidden_on_auth_account_wizard_member_and_admin_routes(): void
    {
        // Guest di halaman login & daftar
        $this->get('/login')->assertInertia(fn ($page) => $page->where('joinStrip.visible', false));
        $this->get('/register')->assertInertia(fn ($page) => $page->where('joinStrip.visible', false));

        // Non-member di /akun dan wizard
        $nonMember = User::factory()->create([
            'role' => Role::User,
            'membership_status' => MembershipStatus::NonMember,
        ]);
        $this->actingAs($nonMember)
            ->get('/akun')
            ->assertInertia(fn ($page) => $page->where('joinStrip.visible', false));

        $this->actingAs($nonMember)
            ->get('/akun/keanggotaan/daftar/identitas')
            ->assertInertia(fn ($page) => $page->where('joinStrip.visible', false));

        // Approved di /anggota
        $approved = User::factory()->create([
            'role' => Role::User,
            'membership_status' => MembershipStatus::Approved,
        ]);
        $this->actingAs($approved)
            ->get('/anggota')
            ->assertInertia(fn ($page) => $page->where('joinStrip.visible', false));

        // Admin di /admin
        $admin = User::factory()->create(['role' => Role::Admin]);
        $this->actingAs($admin)
            ->get('/admin')
            ->assertInertia(fn ($page) => $page->where('joinStrip.visible', false));
    }

    public function test_join_strip_copy_updates_when_superadmin_edits_global_join_strip_keys(): void
    {
        $superadmin = User::factory()->create(['role' => Role::Superadmin]);

        app(CopyService::class)->update(
            'global.join_strip.title',
            'Mari Bergabung Menjadi Anggota NSA',
            $superadmin
        );

        $this->get('/')
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->where('copy', function ($copy) {
                    $data = is_array($copy) ? $copy : $copy->toArray();

                    return ($data['global.join_strip.title'] ?? null) === 'Mari Bergabung Menjadi Anggota NSA';
                })
            );
    }

    public function test_join_strip_exposes_fallback_and_detects_background_images_when_present(): void
    {
        // Tanpa gambar -> fallback aktif
        $this->get('/')
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->where('joinStrip.media.hasDesktop', false)
                ->where('joinStrip.media.hasMobile', false)
                ->where('joinStrip.media.desktop.width', 2560)
                ->where('joinStrip.media.desktop.height', 320)
                ->where('joinStrip.media.mobile.width', 1080)
                ->where('joinStrip.media.mobile.height', 720)
            );

        // Dengan gambar master -> hasDesktop & hasMobile menjadi true
        $dir = public_path('images/join-strip');
        $desktopFile = public_path('images/join-strip/join-strip-desktop.webp');
        $mobileFile = public_path('images/join-strip/join-strip-mobile.webp');
        $dirExisted = is_dir($dir);
        $desktopExisted = file_exists($desktopFile);
        $mobileExisted = file_exists($mobileFile);

        if (! $dirExisted) {
            mkdir($dir, 0777, true);
        }
        if (! $desktopExisted) {
            file_put_contents($desktopFile, 'fake-desktop');
        }
        if (! $mobileExisted) {
            file_put_contents($mobileFile, 'fake-mobile');
        }

        try {
            $this->get('/')
                ->assertStatus(200)
                ->assertInertia(fn ($page) => $page
                    ->where('joinStrip.media.hasDesktop', true)
                    ->where('joinStrip.media.hasMobile', true)
                    ->where('joinStrip.media.desktop.src', '/images/join-strip/join-strip-desktop.webp')
                    ->where('joinStrip.media.mobile.src', '/images/join-strip/join-strip-mobile.webp')
                );
        } finally {
            if (! $desktopExisted && file_exists($desktopFile)) {
                @unlink($desktopFile);
            }
            if (! $mobileExisted && file_exists($mobileFile)) {
                @unlink($mobileFile);
            }
            if (! $dirExisted && is_dir($dir)) {
                @rmdir($dir);
            }
        }
    }
}
