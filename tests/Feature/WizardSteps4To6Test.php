<?php

namespace Tests\Feature;

use App\Enums\MembershipStatus;
use App\Enums\ProgramCategory;
use App\Enums\Role;
use App\Models\FishCategory;
use App\Models\MemberApplication;
use App\Models\MemberNetworkProfile;
use App\Models\Province;
use App\Models\User;
use App\Support\ActivityFormRules;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WizardSteps4To6Test extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected FishCategory $fish1;

    protected FishCategory $fish2;

    protected Province $province1;

    protected Province $province2;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create([
            'role' => Role::User,
            'membership_status' => MembershipStatus::Draft,
        ]);

        $this->fish1 = FishCategory::firstOrCreate(
            ['slug' => 'ikan-nila'],
            ['name' => 'Ikan Nila', 'is_active' => true]
        );

        $this->fish2 = FishCategory::firstOrCreate(
            ['slug' => 'udang-vaname'],
            ['name' => 'Udang Vaname', 'is_active' => true]
        );

        $this->province1 = Province::firstOrCreate(
            ['id' => 32],
            ['name' => 'Jawa Barat', 'slug' => 'jawa-barat']
        );

        $this->province2 = Province::firstOrCreate(
            ['id' => 33],
            ['name' => 'Jawa Tengah', 'slug' => 'jawa-tengah']
        );
    }

    protected function setupApplicationWithCategory(string $category): MemberApplication
    {
        $app = $this->user->application()->firstOrCreate(
            ['user_id' => $this->user->id],
            [
                'status' => MembershipStatus::Draft,
                'current_step' => 'aktivitas-perikanan',
                'completed_steps' => ['identitas', 'kategori-keanggotaan', 'profil-usaha'],
                'membership_category' => $category,
            ]
        );
        $app->update([
            'membership_category' => $category,
            'completed_steps' => ['identitas', 'kategori-keanggotaan', 'profil-usaha'],
        ]);

        return $app;
    }

    public function test_dynamic_form_config_differs_per_category(): void
    {
        // Pembudidaya has farming_system and pond_count
        $pembudidayaConfig = ActivityFormRules::getCategoryConfig('Pembudidaya');
        $this->assertFalse(ActivityFormRules::isSkippable('Pembudidaya'));
        $this->assertArrayHasKey('farming_system', $pembudidayaConfig['fields']);
        $this->assertArrayHasKey('pond_count', $pembudidayaConfig['fields']);

        // Buyer has purchase_capacity
        $buyerConfig = ActivityFormRules::getCategoryConfig('Buyer');
        $this->assertFalse(ActivityFormRules::isSkippable('Buyer'));
        $this->assertArrayHasKey('purchase_capacity', $buyerConfig['fields']);

        // Akademisi is skippable with empty fields
        $this->assertTrue(ActivityFormRules::isSkippable('Akademisi & Peneliti'));
        $akademisiConfig = ActivityFormRules::getCategoryConfig('Akademisi');
        $this->assertEmpty($akademisiConfig['fields']);
    }

    public function test_server_validation_enforces_required_fields_from_config_for_pembudidaya(): void
    {
        $this->setupApplicationWithCategory('Pembudidaya');

        // Missing activities
        $response1 = $this->actingAs($this->user)
            ->patch(route('account.membership.saveStep', ['slug' => 'aktivitas-perikanan']), [
                'activities' => [],
            ]);
        $response1->assertSessionHasErrors(['activities']);

        // Missing required farming_system and fish_category_id
        $response2 = $this->actingAs($this->user)
            ->patch(route('account.membership.saveStep', ['slug' => 'aktivitas-perikanan']), [
                'activities' => [
                    [
                        'fish_category_id' => '',
                        'farming_system' => '',
                    ],
                ],
            ]);
        $response2->assertSessionHasErrors([
            'activities.0.fish_category_id',
            'activities.0.farming_system',
        ]);
    }

    public function test_user_can_save_multiple_fish_activities_for_pembudidaya(): void
    {
        $this->setupApplicationWithCategory('Pembudidaya');

        $payload = [
            'activities' => [
                [
                    'fish_category_id' => $this->fish1->id,
                    'farming_system' => 'Kolam Tanah',
                    'pond_count' => 6,
                    'production_amount' => 12.5,
                    'production_unit' => 'ton',
                    'period' => 'per siklus',
                    'seed_need' => '20.000 ekor',
                    'feed_need' => '3 ton',
                    'notes' => 'Siklus panen tiap 4 bulan',
                ],
                [
                    'fish_category_id' => $this->fish2->id,
                    'farming_system' => 'Bioflok',
                    'pond_count' => 4,
                    'production_amount' => 5.0,
                    'production_unit' => 'ton',
                    'period' => 'per siklus',
                    'notes' => 'Sistem intensif kolam terpal bulat',
                ],
            ],
        ];

        $response = $this->actingAs($this->user)
            ->patch(route('account.membership.saveStep', ['slug' => 'aktivitas-perikanan']), $payload);

        $response->assertSessionHasNoErrors();

        $app = $this->user->application;
        $this->assertEquals(2, $app->fishActivities()->count());

        $this->assertDatabaseHas('member_fish_activities', [
            'application_id' => $app->id,
            'fish_category_id' => $this->fish1->id,
            'farming_system' => 'Kolam Tanah',
            'pond_count' => 6,
            'production_unit' => 'ton',
        ]);

        $this->assertDatabaseHas('member_fish_activities', [
            'application_id' => $app->id,
            'fish_category_id' => $this->fish2->id,
            'farming_system' => 'Bioflok',
            'pond_count' => 4,
        ]);
    }

    public function test_skippable_category_can_skip_step_4_and_is_marked_completed(): void
    {
        $app = $this->setupApplicationWithCategory('Akademisi & Peneliti');

        $response = $this->actingAs($this->user)
            ->patch(route('account.membership.saveStep', ['slug' => 'aktivitas-perikanan']), [
                'activities' => [],
                'is_skipped' => true,
            ]);

        $response->assertSessionHasNoErrors();

        $app->refresh();
        $this->assertTrue($app->isStepCompleted('aktivitas-perikanan'));
        $this->assertEquals(0, $app->fishActivities()->count());
    }

    public function test_user_can_save_network_profile_in_step_5(): void
    {
        $this->setupApplicationWithCategory('Pembudidaya');

        $payload = [
            'marketing_info' => 'Menjual langsung ke pasar induk dan restoran ikan bakar lokal.',
            'distribution_areas' => ['Jawa Barat', 'DKI Jakarta', 'Banten'],
            'supply_needs' => 'Membutuhkan suplai pakan pelet apung berkualitas 5 ton per bulan.',
            'cooperation_types' => ['pasokan', 'distribusi', 'lainnya'],
            'cooperation_types_custom' => 'Kemitraan sewa cold storage',
            'professional_activities' => 'Pengurus kelompok pembudidaya ikan mina makmur.',
        ];

        $response = $this->actingAs($this->user)
            ->patch(route('account.membership.saveStep', ['slug' => 'jaringan-bisnis']), $payload);

        $response->assertSessionHasNoErrors();

        $app = $this->user->application;
        $profile = MemberNetworkProfile::where('application_id', $app->id)->first();
        $this->assertNotNull($profile);
        $this->assertEquals('Menjual langsung ke pasar induk dan restoran ikan bakar lokal.', $profile->marketing_info);
        $this->assertEquals(['Jawa Barat', 'DKI Jakarta', 'Banten'], $profile->distribution_areas);
        $this->assertContains('pasokan', $profile->cooperation_types);
        $this->assertContains('Lainnya: Kemitraan sewa cold storage', $profile->cooperation_types);

        $app->refresh();
        $this->assertTrue($app->isStepCompleted('jaringan-bisnis'));
    }

    public function test_step_5_is_optional_and_can_be_saved_empty(): void
    {
        $this->setupApplicationWithCategory('Pembudidaya');

        $response = $this->actingAs($this->user)
            ->patch(route('account.membership.saveStep', ['slug' => 'jaringan-bisnis']), []);

        $response->assertSessionHasNoErrors();

        $app = $this->user->application;
        $app->refresh();
        $this->assertTrue($app->isStepCompleted('jaringan-bisnis'));
    }

    public function test_user_can_save_program_interests_in_step_6(): void
    {
        $this->setupApplicationWithCategory('Pembudidaya');

        $payload = [
            'interests' => [
                ProgramCategory::Pelatihan->value,
                ProgramCategory::InformasiPasar->value,
                ProgramCategory::TeknologiBudidaya->value,
            ],
            'note' => 'Tertarik mengikuti sertifikasi CBIB dan pelatihan manajemen pakan mandiri.',
        ];

        $response = $this->actingAs($this->user)
            ->patch(route('account.membership.saveStep', ['slug' => 'minat-program']), $payload);

        $response->assertSessionHasNoErrors();

        $app = $this->user->application;
        $this->assertEquals(3, $app->programInterests()->count());

        $this->assertDatabaseHas('member_program_interests', [
            'application_id' => $app->id,
            'category' => ProgramCategory::Pelatihan->value,
            'note' => 'Tertarik mengikuti sertifikasi CBIB dan pelatihan manajemen pakan mandiri.',
        ]);

        $this->assertDatabaseHas('member_program_interests', [
            'application_id' => $app->id,
            'category' => ProgramCategory::InformasiPasar->value,
        ]);

        $this->assertDatabaseHas('member_program_interests', [
            'application_id' => $app->id,
            'category' => ProgramCategory::TeknologiBudidaya->value,
        ]);

        $app->refresh();
        $this->assertTrue($app->isStepCompleted('minat-program'));
    }

    public function test_step_6_rejects_invalid_program_category(): void
    {
        $this->setupApplicationWithCategory('Pembudidaya');

        $response = $this->actingAs($this->user)
            ->patch(route('account.membership.saveStep', ['slug' => 'minat-program']), [
                'interests' => ['kategori_palsu'],
            ]);

        $response->assertSessionHasErrors(['interests.0']);
    }
}
