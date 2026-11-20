<?php

namespace Tests\Feature;

use App\Enums\MembershipStatus;
use App\Enums\Role;
use App\Models\BusinessField;
use App\Models\MemberBusiness;
use App\Models\MemberProfile;
use App\Models\Province;
use App\Models\Regency;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class MembershipFormTest extends TestCase
{
    use RefreshDatabase;

    protected User $approvedUser;

    protected function setUp(): void
    {
        parent::setUp();

        $province = Province::create(['id' => 64, 'name' => 'Kalimantan Timur', 'slug' => 'kalimantan-timur']);
        $regency = Regency::create(['id' => 6472, 'province_id' => 64, 'name' => 'Kota Samarinda', 'slug' => 'kota-samarinda']);

        BusinessField::firstOrCreate(
            ['slug' => 'udang'],
            ['id' => 1, 'name' => 'Udang']
        );
        BusinessField::firstOrCreate(
            ['slug' => 'ikan-air-tawar'],
            ['id' => 6, 'name' => 'Ikan Air Tawar']
        );

        $this->approvedUser = User::factory()->create([
            'role' => Role::User,
            'membership_status' => MembershipStatus::Approved,
            'member_number' => 'NSA-6472-2026-0001',
        ]);

        MemberProfile::create([
            'user_id' => $this->approvedUser->id,
            'nik' => '6472012005040001',
            'name_ktp' => 'Budi Santoso',
            'birth_place' => 'Samarinda',
            'birth_date' => '1995-05-20',
            'gender' => 'male',
            'occupation' => 'Pembudidaya Ikan',
            'province_id' => $province->id,
            'regency_id' => $regency->id,
            'address' => 'Jl. Mugirejo No. 12',
            'postal_code' => '75119',
            'photo' => 'avatars/'.$this->approvedUser->id.'/profil.png',
        ]);

        MemberBusiness::create([
            'user_id' => $this->approvedUser->id,
            'name' => 'CV. LokaLoka',
            'owner_name' => 'Budi Santoso',
            'nib' => '1234567890123',
            'province_id' => $province->id,
            'regency_id' => $regency->id,
            'address' => 'Jl. Perikanan Mahakam',
            'business_scale' => 'Kecil',
            'business_status' => 'CV',
        ]);
    }

    public function test_guest_cannot_access_membership_form(): void
    {
        $response = $this->get('/akun/keanggotaan/formulir');
        $response->assertRedirect('/login');
    }

    public function test_non_member_cannot_access_membership_form(): void
    {
        $user = User::factory()->create([
            'role' => Role::User,
            'membership_status' => MembershipStatus::NonMember,
        ]);

        $response = $this->actingAs($user)->get('/akun/keanggotaan/formulir');
        $response->assertRedirect('/akun/keanggotaan/daftar');
    }

    public function test_verified_approved_member_accessing_form_redirects_to_registration_wizard(): void
    {
        $response = $this->actingAs($this->approvedUser)->get('/akun/keanggotaan/formulir');

        $response->assertRedirect('/akun/keanggotaan/daftar');
    }

    public function test_verified_approved_member_can_access_wizard_to_edit_data(): void
    {
        $response = $this->actingAs($this->approvedUser)->get('/akun/keanggotaan/daftar');
        $response->assertRedirect('/akun/keanggotaan/daftar/identitas');

        $stepResponse = $this->actingAs($this->approvedUser)->get('/akun/keanggotaan/daftar/identitas');
        $stepResponse->assertStatus(200);
        $stepResponse->assertInertia(fn (Assert $page) => $page
            ->component('Member/Register/Index')
            ->where('currentStepSlug', 'identitas')
            ->has('application', fn (Assert $app) => $app
                ->where('status', 'approved')
                ->where('current_step', 'identitas')
                ->etc()
            )
            ->has('draft', fn (Assert $draft) => $draft
                ->where('step1.name', $this->approvedUser->name)
                ->where('step1.email', $this->approvedUser->email)
                ->where('step2.name_ktp', 'Budi Santoso')
                ->where('step3.business_name', 'CV. LokaLoka')
                ->etc()
            )
        );
    }

    public function test_approved_member_can_update_data_and_remains_approved(): void
    {
        $response = $this->actingAs($this->approvedUser)->post('/akun/keanggotaan/daftar/informasi-akun', [
            'name' => 'Budi Santoso Diperbarui',
            'phone' => '081234567899',
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertEquals('Budi Santoso Diperbarui', $this->approvedUser->fresh()->name);
        $this->assertEquals(MembershipStatus::Approved, $this->approvedUser->fresh()->membership_status);
    }

    public function test_user_avatar_accessor_resolves_profile_photo_url(): void
    {
        // Kondisi 1: user punya photo di MemberProfile
        $user = User::factory()->create();
        MemberProfile::create([
            'user_id' => $user->id,
            'photo' => 'avatars/'.$user->id.'/test_photo.png',
        ]);

        $this->assertNotNull($user->avatar);
        $this->assertStringContainsString('storage/avatars/'.$user->id.'/test_photo.png', $user->avatar);

        // Kondisi 2: user belum punya photo
        $emptyUser = User::factory()->create();
        $this->assertNull($emptyUser->avatar);
    }

    public function test_step_3_business_data_renders_business_fields(): void
    {
        $response = $this->actingAs($this->approvedUser)->get('/akun/keanggotaan/daftar/data-usaha-perikanan');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Member/Register/Index')
            ->where('currentStepSlug', 'data-usaha-perikanan')
            ->has('businessFields')
            ->has('draft.step3')
        );
    }

    public function test_status_page_redirects_approved_member_to_member_dashboard(): void
    {
        $response = $this->actingAs($this->approvedUser)->get('/akun/keanggotaan/status');

        $response->assertRedirect(route('member.index'));
    }

    public function test_status_page_for_draft_member_indicates_step_not_submitted(): void
    {
        $draftUser = User::factory()->create([
            'role' => Role::User,
            'membership_status' => MembershipStatus::Draft,
        ]);

        $response = $this->actingAs($draftUser)->get('/akun/keanggotaan/status');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Member/Status')
            ->where('statusData.status', 'draft')
            ->where('statusData.is_submitted', false)
        );
    }

    public function test_status_page_for_pending_member_indicates_step_submitted(): void
    {
        $pendingUser = User::factory()->create([
            'role' => Role::User,
            'membership_status' => MembershipStatus::PendingReview,
        ]);

        $response = $this->actingAs($pendingUser)->get('/akun/keanggotaan/status');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Member/Status')
            ->where('statusData.status', 'pending_review')
            ->where('statusData.is_submitted', true)
        );
    }

    public function test_status_page_accessible_at_main_membership_route_for_draft_member(): void
    {
        $draftUser = User::factory()->create([
            'role' => Role::User,
            'membership_status' => MembershipStatus::Draft,
        ]);

        $response = $this->actingAs($draftUser)->get('/akun/keanggotaan');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Member/Status')
            ->where('statusData.status', 'draft')
            ->where('statusData.status_label', 'Draft')
            ->where('statusData.is_submitted', false)
        );
    }
}
