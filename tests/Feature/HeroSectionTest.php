<?php

namespace Tests\Feature;

use App\Enums\MembershipStatus;
use App\Enums\Role;
use App\Models\User;
use App\Services\CopyService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class HeroSectionTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Cache::flush();
    }

    public function test_home_hero_renders_placeholder_when_hero_images_are_absent_and_exposes_hero_copy(): void
    {
        $this->get('/')
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->component('Public/Home')
                ->where('heroConfig.hasDesktop', false)
                ->where('heroConfig.hasMobile', false)
                ->where('heroConfig.desktop.width', 2560)
                ->where('heroConfig.desktop.height', 1100)
                ->where('heroConfig.mobile.width', 1080)
                ->where('heroConfig.mobile.height', 1440)
                ->where('copy', function ($copy) {
                    $data = is_array($copy) ? $copy : $copy->toArray();

                    return ($data['home.hero.title_line1'] ?? null) === 'Building a Sustainable Future'
                        && ($data['home.hero.title_line2'] ?? null) === "for Indonesia's Aquatic Sector"
                        && ($data['home.hero.cta_primary'] ?? null) === 'Join Membership'
                        && ($data['home.hero.cta_secondary'] ?? null) === 'Explore Programs';
                })
            );
    }

    public function test_home_hero_detects_desktop_image_when_present(): void
    {
        $heroDir = public_path('images/hero');
        $desktopPath = public_path('images/hero/hero-desktop.webp');
        $dirExisted = is_dir($heroDir);
        $fileExisted = file_exists($desktopPath);

        if (! $dirExisted) {
            mkdir($heroDir, 0777, true);
        }
        if (! $fileExisted) {
            file_put_contents($desktopPath, 'fake-webp-content');
        }

        try {
            $this->get('/')
                ->assertStatus(200)
                ->assertInertia(fn ($page) => $page
                    ->where('heroConfig.hasDesktop', true)
                    ->where('heroConfig.desktop.src', '/images/hero/hero-desktop.webp')
                );
        } finally {
            if (! $fileExisted && file_exists($desktopPath)) {
                @unlink($desktopPath);
            }
            if (! $dirExisted && is_dir($heroDir)) {
                @rmdir($heroDir);
            }
        }
    }

    public function test_hero_text_updates_when_superadmin_edits_copy(): void
    {
        $superadmin = User::factory()->create(['role' => Role::Superadmin]);

        app(CopyService::class)->update(
            'home.hero.title_line1',
            'Membangun Masa Depan Berkelanjutan',
            $superadmin
        );

        $this->get('/')
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->where('copy', function ($copy) {
                    $data = is_array($copy) ? $copy : $copy->toArray();

                    return ($data['home.hero.title_line1'] ?? null) === 'Membangun Masa Depan Berkelanjutan';
                })
            );
    }

    public function test_home_shares_membership_status_for_hero_primary_cta_variants(): void
    {
        // Guest: membershipPromo null
        $this->get('/')
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->where('auth.user', null)
                ->where('membershipPromo', null)
            );

        // Non-member
        $nonMember = User::factory()->create([
            'role' => Role::User,
            'membership_status' => MembershipStatus::NonMember,
        ]);
        $this->actingAs($nonMember)
            ->get('/')
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->where('membershipPromo.status', 'non_member')
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
                ->where('membershipPromo.status', 'draft')
            );

        // Pending review
        $pending = User::factory()->create([
            'role' => Role::User,
            'membership_status' => MembershipStatus::PendingReview,
        ]);
        $this->actingAs($pending)
            ->get('/')
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->where('membershipPromo.status', 'pending_review')
            );

        // Approved
        $approved = User::factory()->create([
            'role' => Role::User,
            'membership_status' => MembershipStatus::Approved,
        ]);
        $this->actingAs($approved)
            ->get('/')
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->where('auth.user.membership_status', 'approved')
                ->where('membershipPromo', null)
            );
    }
}
