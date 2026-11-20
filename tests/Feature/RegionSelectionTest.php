<?php

namespace Tests\Feature;

use App\Enums\MembershipStatus;
use App\Enums\Role;
use App\Models\District;
use App\Models\Province;
use App\Models\Regency;
use App\Models\User;
use App\Models\Village;
use Database\Seeders\RegionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegionSelectionTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create([
            'role' => Role::User,
            'membership_status' => MembershipStatus::Draft,
        ]);
    }

    /**
     * Test that all seeded provinces in Indonesia have regencies available in API.
     */
    public function test_all_provinces_have_regencies_seeded_and_accessible_via_api(): void
    {
        $this->seed(RegionSeeder::class);

        $provinces = Province::all();
        $this->assertCount(38, $provinces, 'All 38 provinces of Indonesia should be seeded.');

        // Kalimantan Timur (64) is specifically reported by user
        $kaltimResponse = $this->getJson('/api/wilayah/kabupaten?parent=64');
        $kaltimResponse->assertOk();
        $kaltimRegencies = $kaltimResponse->json();

        $this->assertNotEmpty($kaltimRegencies, 'Kalimantan Timur (id 64) must have regencies available.');
        $regencyNames = array_column($kaltimRegencies, 'name');
        $this->assertTrue(
            collect($regencyNames)->contains(fn ($name) => str_contains($name, 'Samarinda')),
            'Kalimantan Timur should contain Kota Samarinda'
        );

        // Every single province must have at least one regency
        foreach ($provinces as $province) {
            $regencies = Regency::where('province_id', $province->id)->get();
            $this->assertGreaterThan(
                0,
                $regencies->count(),
                "Province '{$province->name}' (ID: {$province->id}) must have regencies seeded."
            );
        }
    }

    /**
     * Test cascading region hierarchy for Kalimantan Timur (Provinsi -> Kabupaten/Kota -> Kecamatan -> Kelurahan).
     */
    public function test_cascading_region_api_for_kalimantan_timur(): void
    {
        $this->seed(RegionSeeder::class);

        // 1. Get regency for Kalimantan Timur
        $regencyResponse = $this->getJson('/api/wilayah/kabupaten?parent=64');
        $regencyResponse->assertOk();
        $regencies = $regencyResponse->json();
        $this->assertNotEmpty($regencies);

        $samarinda = collect($regencies)->first(fn ($item) => str_contains($item['name'], 'Samarinda')) ?? $regencies[0];
        $this->assertNotNull($samarinda);

        // 2. Get districts for Samarinda
        $districtResponse = $this->getJson('/api/wilayah/kecamatan?parent='.$samarinda['id']);
        $districtResponse->assertOk();
        $districts = $districtResponse->json();
        $this->assertNotEmpty($districts, "Regency '{$samarinda['name']}' must have districts.");

        // 3. Get villages for the first district
        $firstDistrict = $districts[0];
        $villageResponse = $this->getJson('/api/wilayah/kelurahan?parent='.$firstDistrict['id']);
        $villageResponse->assertOk();
        $villages = $villageResponse->json();
        $this->assertNotEmpty($villages, "District '{$firstDistrict['name']}' must have villages.");
    }

    /**
     * Test user can submit Step 2 Personal Data with Kalimantan Timur (Samarinda) address without validation error.
     */
    public function test_user_can_save_step_2_with_kalimantan_timur_region(): void
    {
        $this->seed(RegionSeeder::class);

        // Find Samarinda or a regency in Kaltim
        $kaltimRegency = Regency::where('province_id', 64)->first();
        $this->assertNotNull($kaltimRegency, 'Kalimantan Timur regency should exist');

        $district = District::where('regency_id', $kaltimRegency->id)->first();
        $this->assertNotNull($district, 'District should exist');

        $village = Village::where('district_id', $district->id)->first();
        $this->assertNotNull($village, 'Village should exist');

        $response = $this->actingAs($this->user)->postJson('/akun/keanggotaan/langkah/2', [
            'nik' => '6472012005040001',
            'name_ktp' => 'Ahmad Pembudidaya',
            'birth_place' => 'Samarinda',
            'birth_date' => '2004-05-20',
            'gender' => 'male',
            'occupation' => 'Pembudidaya Ikan',
            'province_id' => 64,
            'regency_id' => $kaltimRegency->id,
            'district_id' => $district->id,
            'village_id' => $village->id,
            'postal_code' => '75119',
            'address' => 'Jl. Mugirejo Gg. Mulia',
            'is_domicile_same' => true,
        ]);

        $response->assertStatus(200);

        $this->user->refresh();
        $this->assertNotNull($this->user->profile);
        $this->assertEquals(64, $this->user->profile->province_id);
        $this->assertEquals($kaltimRegency->id, $this->user->profile->regency_id);
        $this->assertEquals('Jl. Mugirejo Gg. Mulia', $this->user->profile->address);
    }

    /**
     * Test user can submit Step 2 Personal Data wizard route with exact Samarinda - Sungai Pinang - Mugirejo data.
     */
    public function test_user_can_save_wizard_step_2_with_exact_samarinda_mugirejo_address(): void
    {
        $this->seed(RegionSeeder::class);

        // Fetch Samarinda (6472)
        $samarinda = Regency::find(6472);
        $this->assertNotNull($samarinda, 'Kota Samarinda should exist');

        // Fetch Sungai Pinang (647201)
        $sungaiPinang = District::find(647201);
        $this->assertNotNull($sungaiPinang, 'Kecamatan Sungai Pinang should exist');

        // Fetch Mugirejo (647201001)
        $mugirejo = Village::find(647201001);
        $this->assertNotNull($mugirejo, 'Kelurahan Mugirejo should exist');

        $response = $this->actingAs($this->user)->postJson('/akun/keanggotaan/daftar/data-pribadi', [
            'nik' => '6472012005040001',
            'name_ktp' => 'Ahmad Pembudidaya Kaltim',
            'birth_place' => 'Samarinda',
            'birth_date' => '2004-05-20',
            'gender' => 'male',
            'occupation' => 'Pembudidaya Ikan',
            'province_id' => 64,
            'regency_id' => 6472,
            'district_id' => 647201,
            'village_id' => 647201001,
            'postal_code' => '75119',
            'address' => 'Jl. Mugirejo Gg. Mulia',
            'is_domicile_same' => true,
        ]);

        $response->assertStatus(200);

        $this->user->refresh();
        $this->assertNotNull($this->user->profile);
        $this->assertEquals(64, $this->user->profile->province_id);
        $this->assertEquals(6472, $this->user->profile->regency_id);
        $this->assertEquals(647201, $this->user->profile->district_id);
        $this->assertEquals(647201001, $this->user->profile->village_id);
        $this->assertEquals('Jl. Mugirejo Gg. Mulia', $this->user->profile->address);
    }
}
