<?php

namespace Tests\Feature;

use App\Enums\MembershipStatus;
use App\Enums\Role;
use App\Models\MemberApplication;
use App\Models\MemberBusiness;
use App\Models\MemberIdentity;
use App\Models\MembershipCategory;
use App\Models\MembershipType;
use App\Models\Province;
use App\Models\Regency;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class WizardSteps1To3Test extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected Province $province;

    protected Regency $regency;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create([
            'role' => Role::User,
            'membership_status' => MembershipStatus::NonMember,
        ]);

        $this->province = Province::firstOrCreate(
            ['id' => 32],
            ['name' => 'Jawa Barat', 'slug' => 'jawa-barat']
        );

        $this->regency = Regency::firstOrCreate(
            ['id' => 3201],
            ['province_id' => $this->province->id, 'name' => 'Bogor', 'slug' => 'bogor']
        );
    }

    public function test_user_can_access_wizard_and_redirects_to_first_step_identitas(): void
    {
        $response = $this->actingAs($this->user)->get(route('account.membership.register'));

        $response->assertRedirect(route('account.membership.step', ['slug' => 'identitas']));
    }

    public function test_wni_validation_requires_nik_and_ktp_when_setting_is_enabled(): void
    {
        Setting::set('membership.require_ktp_for_wni', '1');

        $response = $this->actingAs($this->user)
            ->patch(route('account.membership.saveStep', ['slug' => 'identitas']), [
                'nationality' => 'wni',
                'full_name' => '',
                'gender' => '',
                'birth_place' => '',
                'birth_date' => '',
                'phone' => '',
                'nik' => '',
                'province_id' => '',
                'address' => '',
            ]);

        $response->assertSessionHasErrors([
            'full_name',
            'gender',
            'birth_place',
            'birth_date',
            'phone',
            'nik',
            'province_id',
            'address',
        ]);

        // Hidden WNA fields MUST NOT have errors
        $response->assertSessionDoesntHaveErrors([
            'passport_number',
            'origin_country',
            'years_in_indonesia',
        ]);
    }

    public function test_wna_validation_requires_passport_and_origin_and_ignores_nik(): void
    {
        $response = $this->actingAs($this->user)
            ->patch(route('account.membership.saveStep', ['slug' => 'identitas']), [
                'nationality' => 'wna',
                'full_name' => '',
                'gender' => '',
                'birth_place' => '',
                'birth_date' => '',
                'phone' => '',
                'passport_number' => '',
                'origin_country' => '',
                'years_in_indonesia' => '',
            ]);

        $response->assertSessionHasErrors([
            'full_name',
            'gender',
            'birth_place',
            'birth_date',
            'phone',
            'passport_number',
            'origin_country',
            'years_in_indonesia',
        ]);

        // Hidden WNI fields MUST NOT have errors
        $response->assertSessionDoesntHaveErrors([
            'nik',
            'province_id',
            'regency_id',
            'district_id',
            'village_id',
            'address',
        ]);
    }

    public function test_wni_saves_identity_and_encrypts_nik(): void
    {
        Setting::set('membership.require_ktp_for_wni', '1');

        $response = $this->actingAs($this->user)
            ->patch(route('account.membership.saveStep', ['slug' => 'identitas']), [
                'nationality' => 'wni',
                'full_name' => 'Budi Santoso',
                'gender' => 'male',
                'birth_place' => 'Bogor',
                'birth_date' => '1990-05-15',
                'phone' => '+6281234567890',
                'nik' => '3201123456780001',
                'province_id' => $this->province->id,
                'regency_id' => $this->regency->id,
                'address' => 'Jl. Raya Dramaga No. 10',
                'postal_code' => '16680',
            ]);

        $response->assertSessionHasNoErrors();

        $identity = MemberIdentity::where('user_id', $this->user->id)->first();
        $this->assertNotNull($identity);
        $this->assertEquals('wni', $identity->nationality);
        $this->assertEquals('Budi Santoso', $identity->full_name);
        $this->assertEquals('3201123456780001', $identity->nik);

        // Check raw database value is encrypted (not plain text)
        $rawNik = DB::table('member_identities')->where('id', $identity->id)->value('nik');
        $this->assertNotEquals('3201123456780001', $rawNik);
    }

    public function test_wna_saves_identity_and_encrypts_passport(): void
    {
        $response = $this->actingAs($this->user)
            ->patch(route('account.membership.saveStep', ['slug' => 'identitas']), [
                'nationality' => 'wna',
                'full_name' => 'John Doe',
                'gender' => 'male',
                'birth_place' => 'Sydney',
                'birth_date' => '1985-08-20',
                'phone' => '+6281987654321',
                'passport_number' => 'E12345678',
                'origin_country' => 'Australia',
                'years_in_indonesia' => 4,
            ]);

        $response->assertSessionHasNoErrors();

        $identity = MemberIdentity::where('user_id', $this->user->id)->first();
        $this->assertNotNull($identity);
        $this->assertEquals('wna', $identity->nationality);
        $this->assertEquals('Australia', $identity->origin_country);
        $this->assertEquals(4, $identity->years_in_indonesia);
        $this->assertEquals('E12345678', $identity->passport_number);

        // Check raw database value is encrypted
        $rawPassport = DB::table('member_identities')->where('id', $identity->id)->value('passport_number');
        $this->assertNotEquals('E12345678', $rawPassport);
    }

    public function test_wni_skips_nik_validation_when_require_ktp_setting_is_false(): void
    {
        Setting::set('membership.require_ktp_for_wni', '0');

        $response = $this->actingAs($this->user)
            ->patch(route('account.membership.saveStep', ['slug' => 'identitas']), [
                'nationality' => 'wni',
                'full_name' => 'Ahmad Tanpa KTP',
                'gender' => 'male',
                'birth_place' => 'Bandung',
                'birth_date' => '1992-01-01',
                'phone' => '+628111222333',
                // NIK and address omitted
            ]);

        $response->assertSessionHasNoErrors();
    }

    public function test_category_step_saves_custom_category_and_institution(): void
    {
        $category = MembershipCategory::create([
            'name' => 'Lainnya',
            'slug' => 'lainnya',
            'description' => 'Kategori lain',
            'is_active' => true,
        ]);

        $type = MembershipType::create([
            'name' => 'Anggota Biasa',
            'slug' => 'biasa',
            'description' => 'Anggota biasa',
            'ad_art_rules' => 'Memiliki hak suara dan hak bicara.',
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->user)
            ->patch(route('account.membership.saveStep', ['slug' => 'kategori-keanggotaan']), [
                'membership_category' => 'Lainnya',
                'membership_category_custom' => 'Pengolahan Rumput Laut Inovatif',
                'applicant_type' => 'institution',
                'institution_name' => 'PT Bio Seaweed Nusantara',
                'applicant_position' => 'Direktur Operasional',
                'membership_type_id' => $type->id,
            ]);

        $response->assertSessionHasNoErrors();

        $app = MemberApplication::where('user_id', $this->user->id)->first();
        $this->assertNotNull($app);
        $this->assertEquals('Lainnya', $app->membership_category);
        $this->assertEquals('Pengolahan Rumput Laut Inovatif', $app->membership_category_custom);
        $this->assertEquals('institution', $app->applicant_type);
        $this->assertEquals('PT Bio Seaweed Nusantara', $app->institution_name);
        $this->assertEquals('Direktur Operasional', $app->applicant_position);
        $this->assertEquals($type->id, $app->membership_type_id);
    }

    public function test_category_step_fails_if_institution_fields_are_missing_when_type_is_institution(): void
    {
        $response = $this->actingAs($this->user)
            ->patch(route('account.membership.saveStep', ['slug' => 'kategori-keanggotaan']), [
                'membership_category' => 'Pembudidaya',
                'applicant_type' => 'institution',
                'institution_name' => '',
                'applicant_position' => '',
            ]);

        $response->assertSessionHasErrors(['institution_name', 'applicant_position']);
    }

    public function test_business_step_saves_job_when_user_has_no_business(): void
    {
        $response = $this->actingAs($this->user)
            ->patch(route('account.membership.saveStep', ['slug' => 'profil-usaha']), [
                'has_no_business' => true,
                'main_job' => 'Peneliti Madya Balai Perikanan',
                'operational_info' => 'Fokus pada riset kualitas air tambak udang.',
            ]);

        $response->assertSessionHasNoErrors();

        $business = MemberBusiness::where('user_id', $this->user->id)->first();
        $this->assertNotNull($business);
        $this->assertTrue($business->has_no_business);
        $this->assertEquals('Peneliti Madya Balai Perikanan', $business->main_job);
        $this->assertNull($business->name);
    }

    public function test_business_step_enforces_required_legalities_based_on_category(): void
    {
        // Set category to Eksportir on application
        $app = $this->user->application()->firstOrCreate(
            ['user_id' => $this->user->id],
            [
                'status' => MembershipStatus::Draft,
                'current_step' => 'profil-usaha',
                'membership_category' => 'Eksportir',
            ]
        );
        $app->update(['membership_category' => 'Eksportir']);

        // Config specifies Eksportir requires 'nib'
        config(['membership.required_legalities' => ['Eksportir' => ['nib']]]);

        // Attempt without NIB
        $response = $this->actingAs($this->user)
            ->patch(route('account.membership.saveStep', ['slug' => 'profil-usaha']), [
                'has_no_business' => false,
                'name' => 'PT Mina Ekspor',
                'activity_field' => 'Ekspor Kerapu',
                'years_operating' => 3,
                'scale' => 'Menengah',
                'legal_documents' => [
                    [
                        'type' => 'npwp',
                        'number' => '01.234.567.8-901.000',
                    ],
                ],
            ]);

        $response->assertSessionHasErrors(['legal_documents']);

        // Now include NIB
        $responseSuccess = $this->actingAs($this->user)
            ->patch(route('account.membership.saveStep', ['slug' => 'profil-usaha']), [
                'has_no_business' => false,
                'name' => 'PT Mina Ekspor',
                'activity_field' => 'Ekspor Kerapu',
                'years_operating' => 3,
                'scale' => 'Menengah',
                'legal_documents' => [
                    [
                        'type' => 'nib',
                        'number' => '1234567890123',
                        'issued_at' => '2022-01-10',
                    ],
                    [
                        'type' => 'npwp',
                        'number' => '01.234.567.8-901.000',
                    ],
                ],
            ]);

        $responseSuccess->assertSessionHasNoErrors();

        $business = MemberBusiness::where('user_id', $this->user->id)->first();
        $this->assertEquals(2, $business->legalDocuments()->count());
        $this->assertDatabaseHas('member_legal_documents', [
            'business_id' => $business->id,
            'type' => 'nib',
            'number' => '1234567890123',
        ]);
    }
}
