<?php

namespace Tests\Feature;

use App\Enums\MembershipStatus;
use App\Enums\Role;
use App\Mail\MembershipApplicationSubmitted;
use App\Models\BusinessField;
use App\Models\District;
use App\Models\Dpc;
use App\Models\FishCategory;
use App\Models\MemberBusiness;
use App\Models\MemberCommodity;
use App\Models\MemberDocument;
use App\Models\MemberProfile;
use App\Models\MembershipPlan;
use App\Models\MemberStatement;
use App\Models\Province;
use App\Models\Regency;
use App\Models\User;
use App\Models\Village;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class MembershipRegistrationTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected Province $province;

    protected Regency $regency;

    protected District $district;

    protected Village $village;

    protected FishCategory $fishCategory;

    protected BusinessField $businessField;

    protected function setUp(): void
    {
        parent::setUp();

        // Create test user
        $this->user = User::factory()->create([
            'role' => Role::User,
            'membership_status' => MembershipStatus::NonMember,
        ]);

        // Seed basic region & category data
        $this->province = Province::create(['id' => 11, 'name' => 'Aceh', 'slug' => 'aceh']);
        $this->regency = Regency::create(['id' => 1101, 'province_id' => 11, 'name' => 'Kabupaten Simeulue', 'slug' => 'kabupaten-simeulue']);
        $this->district = District::create(['id' => 110101, 'regency_id' => 1101, 'name' => 'Teupah Selatan']);
        $this->village = Village::create(['id' => 110101001, 'district_id' => 110101, 'name' => 'Laba']);

        $this->fishCategory = FishCategory::create([
            'name' => 'Ikan Lele',
            'slug' => 'ikan-lele',
            'description' => 'Budidaya Lele Sangkuriang',
        ]);

        $this->businessField = BusinessField::create([
            'name' => 'Udang',
            'slug' => 'udang',
        ]);

        BusinessField::create([
            'name' => 'Lainnya',
            'slug' => 'lainnya',
        ]);
    }

    public function test_user_can_access_membership_registration_page(): void
    {
        $response = $this->actingAs($this->user)->get('/akun/keanggotaan/daftar');
        $response->assertRedirect('/akun/keanggotaan/daftar/identitas');

        $stepResponse = $this->actingAs($this->user)->get('/akun/keanggotaan/daftar/identitas');
        $stepResponse->assertStatus(200);
    }

    public function test_user_can_save_step_draft_and_status_becomes_draft(): void
    {
        // Save step 1 (Informasi Akun)
        $response1 = $this->actingAs($this->user)->postJson('/akun/keanggotaan/langkah/1', [
            'name' => 'Pembudidaya Sukses',
            'phone' => '081234567890',
        ]);

        $response1->assertStatus(200);
        $this->user->refresh();
        $this->assertEquals(MembershipStatus::Draft, $this->user->membership_status);
        $this->assertEquals('Pembudidaya Sukses', $this->user->name);

        // Save step 2 (Data Pribadi)
        $response2 = $this->actingAs($this->user)->postJson('/akun/keanggotaan/langkah/2', [
            'nik' => '3201012345678901',
            'gender' => 'male',
            'birth_place' => 'Bogor',
            'birth_date' => '1990-01-01',
            'address' => 'Jl. Perikanan Raya No. 12',
        ]);

        $response2->assertStatus(200);
        $this->user->refresh();
        $this->assertEquals('3201012345678901', $this->user->profile->nik);
        $this->assertEquals(MembershipStatus::Draft, $this->user->membership_status);
    }

    public function test_step_3_validates_nib_13_digits(): void
    {
        // NIB must be exactly 13 digits
        $response = $this->actingAs($this->user)->postJson('/akun/keanggotaan/langkah/3', [
            'business_name' => 'Tambak Sejahtera',
            'nib' => '12345', // invalid length
            'province_id' => $this->province->id,
            'regency_id' => $this->regency->id,
            'district_id' => $this->district->id,
            'village_id' => $this->village->id,
            'business_address' => 'Jl. Tambak Lele',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['nib']);
    }

    public function test_cannot_submit_application_if_required_fields_are_missing(): void
    {
        // Try submitting without filling all required data
        $response = $this->actingAs($this->user)->post('/akun/keanggotaan/kirim');

        // Should redirect back with error in session
        $response->assertStatus(302);
        $response->assertSessionHasErrors(['profile']);

        $this->user->refresh();
        $this->assertNotEquals(MembershipStatus::PendingReview, $this->user->membership_status);
    }

    public function test_can_upload_document_to_private_storage(): void
    {
        Storage::fake('private');

        $file = UploadedFile::fake()->create('ktp_saya.pdf', 500, 'application/pdf');

        $response = $this->actingAs($this->user)->postJson('/akun/keanggotaan/dokumen', [
            'type' => 'ktp',
            'file' => $file,
        ]);

        $response->assertStatus(200);
        $response->assertJsonStructure(['success', 'document' => ['id', 'type', 'path']]);

        $this->assertDatabaseHas('member_documents', [
            'user_id' => $this->user->id,
            'type' => 'ktp',
        ]);
    }

    public function test_successful_membership_submission_changes_status_to_pending(): void
    {
        Mail::fake();
        Storage::fake('private');

        // Populate valid profile data
        MemberProfile::create([
            'user_id' => $this->user->id,
            'nik' => '3201012345678901',
            'gender' => 'male',
            'birth_place' => 'Bogor',
            'birth_date' => '1990-01-01',
            'address' => 'Jl. Raya Perikanan No. 10',
        ]);

        // Populate valid business data
        MemberBusiness::create([
            'user_id' => $this->user->id,
            'membership_type' => 'Pembudidaya',
            'name' => 'PT Mina Sejahtera',
            'owner_name' => 'Pembudidaya Sukses',
            'nib' => '1234567890123',
            'npwp' => '01.234.567.8-901.000',
            'founded_at' => '2020-01-01',
            'employee_count' => 5,
            'annual_revenue' => '100 Juta - 500 Juta',
            'business_status' => 'Milik Sendiri',
            'business_scale' => 'Kecil',
            'province_id' => $this->province->id,
            'regency_id' => $this->regency->id,
            'district_id' => $this->district->id,
            'village_id' => $this->village->id,
            'address' => 'Kawasan Budidaya Air Tawar Blok A',
        ]);

        // Create required documents (KTP, NIB, business_photo)
        MemberDocument::create([
            'user_id' => $this->user->id,
            'type' => 'ktp',
            'path' => 'documents/'.$this->user->id.'/ktp.jpg',
            'status' => 'pending',
        ]);
        MemberDocument::create([
            'user_id' => $this->user->id,
            'type' => 'nib',
            'path' => 'documents/'.$this->user->id.'/nib.pdf',
            'status' => 'pending',
        ]);
        MemberDocument::create([
            'user_id' => $this->user->id,
            'type' => 'business_photo',
            'path' => 'documents/'.$this->user->id.'/foto.jpg',
            'status' => 'pending',
        ]);

        // Attach commodity
        MemberCommodity::create([
            'user_id' => $this->user->id,
            'fish_category_id' => $this->fishCategory->id,
            'capacity' => 10000,
            'unit' => 'ekor/siklus',
            'land_area' => 500,
        ]);

        $plan = MembershipPlan::create([
            'name' => 'Anggota Biasa',
            'slug' => 'anggota-biasa-sub-legacy',
            'description' => 'Paket biasa',
            'benefits' => ['Manfaat'],
            'annual_fee' => 150000,
        ]);

        $this->user->application()->create([
            'status' => MembershipStatus::Draft,
            'current_step' => 'review-data',
            'completed_steps' => [
                'informasi-akun',
                'data-pribadi',
                'data-usaha-perikanan',
                'dokumen',
                'media-sosial',
                'data-komoditas',
                'keanggotaan',
                'surat-pernyataan',
            ],
            'membership_plan_id' => $plan->id,
            'join_reason' => 'Ingin bergabung dan mengembangkan usaha budidaya ikan.',
        ]);

        // Create statement
        MemberStatement::create([
            'user_id' => $this->user->id,
            'agree_data_accurate' => true,
            'agree_ad_art' => true,
            'agree_privacy_policy' => true,
            'signed_at' => now(),
            'signature_path' => 'signatures/fake_sign.png',
        ]);

        $this->user->update([
            'membership_status' => MembershipStatus::Draft,
        ]);

        // Submit application
        $response = $this->actingAs($this->user)->post('/akun/keanggotaan/kirim');

        $response->assertRedirect('/akun/keanggotaan');
        $this->user->refresh();

        // Verify status changed to pending_review
        $this->assertEquals(MembershipStatus::PendingReview, $this->user->membership_status);

        // Verify review log recorded
        $this->assertDatabaseHas('member_review_logs', [
            'user_id' => $this->user->id,
            'action' => 'submitted',
        ]);

        // Verify confirmation email sent
        Mail::assertSent(MembershipApplicationSubmitted::class, function ($mail) {
            return $mail->hasTo($this->user->email);
        });
    }

    public function test_accessing_locked_step_redirects_to_valid_active_step(): void
    {
        // Pengguna baru belum menyelesaikan langkah 1 (identitas)
        // Mencoba membuka langkah 4 (dokumen) yang terkunci
        $response = $this->actingAs($this->user)->get('/akun/keanggotaan/daftar/dokumen');

        // Harus diarahkan ke langkah yang sah (informasi-akun)
        $response->assertRedirect('/akun/keanggotaan/daftar/informasi-akun');
    }

    public function test_approved_user_can_open_wizard_and_edit_registration_data(): void
    {
        $approvedUser = User::factory()->create([
            'role' => Role::User,
            'membership_status' => MembershipStatus::Approved,
        ]);

        $response = $this->actingAs($approvedUser)->get('/akun/keanggotaan/daftar');
        $response->assertRedirect('/akun/keanggotaan/daftar/identitas');

        $stepResponse = $this->actingAs($approvedUser)->get('/akun/keanggotaan/daftar/identitas');
        $stepResponse->assertStatus(200);

        // Pastikan approved member dapat menyimpan perubahan data dan status tetap approved
        $patchResponse = $this->actingAs($approvedUser)->patchJson('/akun/keanggotaan/daftar/informasi-akun', [
            'name' => 'Budi Terverifikasi Baru',
            'phone' => '081298765432',
        ]);
        $patchResponse->assertStatus(200);
        $this->assertEquals('Budi Terverifikasi Baru', $approvedUser->fresh()->name);
        $this->assertEquals(MembershipStatus::Approved, $approvedUser->fresh()->membership_status);
    }

    public function test_profile_with_plaintext_or_legacy_nik_does_not_crash_form_wizard(): void
    {
        $approvedUser = User::factory()->create([
            'role' => Role::User,
            'membership_status' => MembershipStatus::Approved,
        ]);

        // Masukkan NIK plaintext secara langsung ke DB menyerupai data legacy / seeder awal
        DB::table('member_profiles')->insert([
            'user_id' => $approvedUser->id,
            'nik' => '3201011204850001',
            'birth_place' => 'Bogor',
            'birth_date' => '1985-04-12',
            'gender' => 'male',
            'address' => 'Jl. Mina Bahari No. 12',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Akses wizard langkah 1: tidak boleh throw DecryptException (halaman putih)
        $response = $this->actingAs($approvedUser)->get('/akun/keanggotaan/daftar/informasi-akun');
        $response->assertStatus(200);

        // Akses NIK lewat model tidak melempar exception dan mengembalikan string NIK asli
        $profile = MemberProfile::where('user_id', $approvedUser->id)->first();
        $this->assertEquals('3201011204850001', $profile->nik);

        // Ketika diperbarui melalui Eloquent, NIK tersimpan dalam bentuk terenkripsi di DB
        $profile->nik = '3201011204850002';
        $profile->save();
        $rawNikInDb = DB::table('member_profiles')->where('user_id', $approvedUser->id)->value('nik');
        $this->assertNotEquals('3201011204850002', $rawNikInDb);
        $this->assertEquals('3201011204850002', $profile->fresh()->nik);
    }

    public function test_saving_step_via_patch_stores_completed_steps_on_server(): void
    {
        // Simpan langkah 1 via endpoint PATCH
        $response = $this->actingAs($this->user)->patchJson('/akun/keanggotaan/daftar/informasi-akun', [
            'name' => 'Budi Pembudidaya',
            'phone' => '081234567899',
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'next_step' => 'data-pribadi',
        ]);

        // Pastikan record member_applications tersimpan di server
        $this->assertDatabaseHas('member_applications', [
            'user_id' => $this->user->id,
            'current_step' => 'data-pribadi',
        ]);

        $this->user->refresh();
        $this->assertNotNull($this->user->application);
        $this->assertContains('informasi-akun', $this->user->application->completed_steps);

        // Setelah langkah 1 selesai, user sekarang berhak membuka langkah 2 (data-pribadi)
        $step2Response = $this->actingAs($this->user)->get('/akun/keanggotaan/daftar/data-pribadi');
        $step2Response->assertStatus(200);
    }

    public function test_step_2_validates_nik_must_be_16_digits(): void
    {
        // Menyimpan langkah 1 terlebih dahulu agar berhak ke langkah 2
        $this->actingAs($this->user)->patchJson('/akun/keanggotaan/daftar/informasi-akun', [
            'name' => 'Budi Pembudidaya',
            'phone' => '081234567899',
        ]);

        // Coba kirim NIK yang bukan 16 digit (hanya 10 digit)
        $response = $this->actingAs($this->user)->patchJson('/akun/keanggotaan/daftar/data-pribadi', [
            'nik' => '1234567890',
            'name_ktp' => 'Budi Pembudidaya',
            'birth_place' => 'Bogor',
            'birth_date' => '1995-05-12',
            'gender' => 'male',
            'occupation' => 'Pembudidaya',
            'province_id' => $this->province->id,
            'regency_id' => $this->regency->id,
            'district_id' => $this->district->id,
            'village_id' => $this->village->id,
            'postal_code' => '16120',
            'address' => 'Jl. Budidaya No. 10',
            'is_domicile_same' => true,
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['nik']);
        $this->assertEquals('NIK harus 16 digit angka.', $response->json('errors.nik.0'));
    }

    public function test_step_2_validates_minimum_age_17_years(): void
    {
        $this->actingAs($this->user)->patchJson('/akun/keanggotaan/daftar/informasi-akun', [
            'name' => 'Budi Pembudidaya',
            'phone' => '081234567899',
        ]);

        // Tanggal lahir usia 10 tahun (belum 17 tahun)
        $tooYoungDate = now()->subYears(10)->format('Y-m-d');

        $response = $this->actingAs($this->user)->patchJson('/akun/keanggotaan/daftar/data-pribadi', [
            'nik' => '3201011234567890',
            'name_ktp' => 'Budi Pembudidaya',
            'birth_place' => 'Bogor',
            'birth_date' => $tooYoungDate,
            'gender' => 'male',
            'occupation' => 'Pembudidaya',
            'province_id' => $this->province->id,
            'regency_id' => $this->regency->id,
            'district_id' => $this->district->id,
            'village_id' => $this->village->id,
            'postal_code' => '16120',
            'address' => 'Jl. Budidaya No. 10',
            'is_domicile_same' => true,
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['birth_date']);
        $this->assertEquals('Usia minimal pendaftar adalah 17 tahun.', $response->json('errors.birth_date.0'));
    }

    public function test_step_2_validates_photo_max_size_2mb(): void
    {
        $this->actingAs($this->user)->patchJson('/akun/keanggotaan/daftar/informasi-akun', [
            'name' => 'Budi Pembudidaya',
            'phone' => '081234567899',
        ]);

        // Buat file foto melebihi batas 2048 KB (3000 KB)
        $largePhoto = UploadedFile::fake()->image('pas_foto.jpg')->size(3000);

        $response = $this->actingAs($this->user)->postJson('/akun/keanggotaan/daftar/data-pribadi', [
            '_method' => 'PATCH',
            'nik' => '3201011234567890',
            'name_ktp' => 'Budi Pembudidaya',
            'birth_place' => 'Bogor',
            'birth_date' => '1995-05-12',
            'gender' => 'male',
            'occupation' => 'Pembudidaya',
            'province_id' => $this->province->id,
            'regency_id' => $this->regency->id,
            'district_id' => $this->district->id,
            'village_id' => $this->village->id,
            'postal_code' => '16120',
            'address' => 'Jl. Budidaya No. 10',
            'is_domicile_same' => true,
            'photo' => $largePhoto,
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['photo']);
        $this->assertEquals('Foto tidak boleh lebih dari 2 MB.', $response->json('errors.photo.0'));
    }

    public function test_step_2_valid_data_saved_as_draft_and_nik_is_encrypted_in_database(): void
    {
        $this->actingAs($this->user)->patchJson('/akun/keanggotaan/daftar/informasi-akun', [
            'name' => 'Budi Pembudidaya',
            'phone' => '081234567899',
        ]);

        $validPhoto = UploadedFile::fake()->image('pas_foto.jpg')->size(500);
        $rawNik = '3201011234567890';

        $response = $this->actingAs($this->user)->postJson('/akun/keanggotaan/daftar/data-pribadi', [
            '_method' => 'PATCH',
            'nik' => $rawNik,
            'name_ktp' => 'Budi Santoso KTP',
            'birth_place' => 'Bogor',
            'birth_date' => '1992-04-15',
            'gender' => 'male',
            'occupation' => 'Pembudidaya Ikan Nila',
            'province_id' => $this->province->id,
            'regency_id' => $this->regency->id,
            'district_id' => $this->district->id,
            'village_id' => $this->village->id,
            'postal_code' => '16120',
            'address' => 'Jl. Air Kolam No. 88 RT 02 RW 05',
            'is_domicile_same' => true,
            'photo' => $validPhoto,
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'next_step' => 'data-usaha-perikanan',
        ]);

        // Verifikasi di basis data
        $this->assertDatabaseHas('member_profiles', [
            'user_id' => $this->user->id,
            'name_ktp' => 'Budi Santoso KTP',
            'postal_code' => '16120',
        ]);

        // Cek bahwa NIK disimpan secara terenkripsi (nilai mentah di DB bukan teks asli 3201011234567890)
        $rawDbNik = DB::table('member_profiles')
            ->where('user_id', $this->user->id)
            ->value('nik');

        $this->assertNotEquals($rawNik, $rawDbNik, 'NIK harus disimpan dalam format terenkripsi di tabel database');

        // Cek bahwa saat dibaca lewat Model Eloquent terdekripsi otomatis
        $this->user->refresh();
        $this->assertEquals($rawNik, $this->user->profile->nik);

        // Verifikasi kembali ke langkah ini data terisi ulang di Inertia response
        $getStep2Response = $this->actingAs($this->user)->get('/akun/keanggotaan/daftar/data-pribadi');
        $getStep2Response->assertStatus(200);
        $getStep2Response->assertInertia(fn ($page) => $page
            ->component('Member/Register/Index')
            ->where('draft.step2.nik', $rawNik)
            ->where('draft.step2.name_ktp', 'Budi Santoso KTP')
            ->where('draft.step2.postal_code', '16120')
        );
    }

    public function test_step_3_validates_required_fields(): void
    {
        // Selesaikan langkah 1 & 2 terlebih dahulu
        $this->actingAs($this->user)->patchJson('/akun/keanggotaan/daftar/informasi-akun', [
            'name' => 'Budi Pembudidaya',
            'phone' => '081234567899',
        ]);
        $this->actingAs($this->user)->patchJson('/akun/keanggotaan/daftar/data-pribadi', [
            'nik' => '3201011234567890',
            'name_ktp' => 'Budi Pembudidaya',
            'birth_place' => 'Bogor',
            'birth_date' => '1995-05-12',
            'gender' => 'male',
            'occupation' => 'Pembudidaya',
            'province_id' => $this->province->id,
            'regency_id' => $this->regency->id,
            'district_id' => $this->district->id,
            'village_id' => $this->village->id,
            'postal_code' => '16120',
            'address' => 'Jl. Budidaya No. 10',
            'is_domicile_same' => true,
        ]);

        $response = $this->actingAs($this->user)->patchJson('/akun/keanggotaan/daftar/data-usaha-perikanan', []);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors([
            'membership_type',
            'business_name',
            'owner_name',
            'nib',
            'founded_at',
            'employee_count',
            'annual_revenue',
            'business_status',
            'business_scale',
            'business_field_ids',
            'province_id',
            'regency_id',
            'district_id',
            'village_id',
            'postal_code',
            'business_address',
            'latitude',
            'longitude',
        ]);
    }

    public function test_step_3_rejects_nib_that_is_not_13_digits(): void
    {
        $this->actingAs($this->user)->patchJson('/akun/keanggotaan/daftar/informasi-akun', [
            'name' => 'Budi Pembudidaya',
            'phone' => '081234567899',
        ]);
        $this->actingAs($this->user)->patchJson('/akun/keanggotaan/daftar/data-pribadi', [
            'nik' => '3201011234567890',
            'name_ktp' => 'Budi Pembudidaya',
            'birth_place' => 'Bogor',
            'birth_date' => '1995-05-12',
            'gender' => 'male',
            'occupation' => 'Pembudidaya',
            'province_id' => $this->province->id,
            'regency_id' => $this->regency->id,
            'district_id' => $this->district->id,
            'village_id' => $this->village->id,
            'postal_code' => '16120',
            'address' => 'Jl. Budidaya No. 10',
            'is_domicile_same' => true,
        ]);

        // Coba kirim NIB 10 digit (kurang dari 13)
        $response = $this->actingAs($this->user)->patchJson('/akun/keanggotaan/daftar/data-usaha-perikanan', [
            'membership_type' => 'Pembudidaya',
            'business_name' => 'Tambak Udang Berkah',
            'owner_name' => 'Budi Pembudidaya',
            'nib' => '1234567890', // Hanya 10 digit
            'founded_at' => '2020-01-15',
            'employee_count' => 5,
            'annual_revenue' => 500000000,
            'business_status' => 'Perorangan',
            'business_scale' => 'Mikro',
            'business_field_ids' => [$this->businessField->id],
            'province_id' => $this->province->id,
            'regency_id' => $this->regency->id,
            'district_id' => $this->district->id,
            'village_id' => $this->village->id,
            'postal_code' => '16120',
            'business_address' => 'Jl. Muara Tambak No. 1',
            'latitude' => -6.1234567,
            'longitude' => 106.1234567,
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['nib']);
        $this->assertEquals('NIB harus 13 digit angka.', $response->json('errors.nib.0'));
    }

    public function test_step_3_requires_other_input_when_membership_type_is_lainnya(): void
    {
        $this->actingAs($this->user)->patchJson('/akun/keanggotaan/daftar/informasi-akun', [
            'name' => 'Budi Pembudidaya',
            'phone' => '081234567899',
        ]);
        $this->actingAs($this->user)->patchJson('/akun/keanggotaan/daftar/data-pribadi', [
            'nik' => '3201011234567890',
            'name_ktp' => 'Budi Pembudidaya',
            'birth_place' => 'Bogor',
            'birth_date' => '1995-05-12',
            'gender' => 'male',
            'occupation' => 'Pembudidaya',
            'province_id' => $this->province->id,
            'regency_id' => $this->regency->id,
            'district_id' => $this->district->id,
            'village_id' => $this->village->id,
            'postal_code' => '16120',
            'address' => 'Jl. Budidaya No. 10',
            'is_domicile_same' => true,
        ]);

        $response = $this->actingAs($this->user)->patchJson('/akun/keanggotaan/daftar/data-usaha-perikanan', [
            'membership_type' => 'Lainnya',
            'membership_type_other' => '', // Dikosongkan
            'business_name' => 'Konsultan Bioflok',
            'owner_name' => 'Budi Pembudidaya',
            'nib' => '1234567890123',
            'founded_at' => '2020-01-15',
            'employee_count' => 3,
            'annual_revenue' => 200000000,
            'business_status' => 'Perorangan',
            'business_scale' => 'Mikro',
            'business_field_ids' => [$this->businessField->id],
            'province_id' => $this->province->id,
            'regency_id' => $this->regency->id,
            'district_id' => $this->district->id,
            'village_id' => $this->village->id,
            'postal_code' => '16120',
            'business_address' => 'Jl. Muara Tambak No. 1',
            'latitude' => -6.1234567,
            'longitude' => 106.1234567,
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['membership_type_other']);
        $this->assertEquals('Sebutkan jenis keanggotaan Anda jika memilih opsi Lainnya.', $response->json('errors.membership_type_other.0'));
    }

    public function test_step_3_requires_other_business_field_when_lainnya_is_selected(): void
    {
        $this->actingAs($this->user)->patchJson('/akun/keanggotaan/daftar/informasi-akun', [
            'name' => 'Budi Pembudidaya',
            'phone' => '081234567899',
        ]);
        $this->actingAs($this->user)->patchJson('/akun/keanggotaan/daftar/data-pribadi', [
            'nik' => '3201011234567890',
            'name_ktp' => 'Budi Pembudidaya',
            'birth_place' => 'Bogor',
            'birth_date' => '1995-05-12',
            'gender' => 'male',
            'occupation' => 'Pembudidaya',
            'province_id' => $this->province->id,
            'regency_id' => $this->regency->id,
            'district_id' => $this->district->id,
            'village_id' => $this->village->id,
            'postal_code' => '16120',
            'address' => 'Jl. Budidaya No. 10',
            'is_domicile_same' => true,
        ]);

        $lainnyaField = BusinessField::where('name', 'Lainnya')->first();

        $response = $this->actingAs($this->user)->patchJson('/akun/keanggotaan/daftar/data-usaha-perikanan', [
            'membership_type' => 'Pembudidaya',
            'business_name' => 'Usaha Multi Komoditas',
            'owner_name' => 'Budi Pembudidaya',
            'nib' => '1234567890123',
            'founded_at' => '2020-01-15',
            'employee_count' => 3,
            'annual_revenue' => 200000000,
            'business_status' => 'Perorangan',
            'business_scale' => 'Mikro',
            'business_field_ids' => [$lainnyaField->id],
            'business_field_other' => '', // Dikosongkan
            'province_id' => $this->province->id,
            'regency_id' => $this->regency->id,
            'district_id' => $this->district->id,
            'village_id' => $this->village->id,
            'postal_code' => '16120',
            'business_address' => 'Jl. Muara Tambak No. 1',
            'latitude' => -6.1234567,
            'longitude' => 106.1234567,
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['business_field_other']);
        $this->assertEquals('Sebutkan bidang usaha Anda jika memilih opsi Lainnya.', $response->json('errors.business_field_other.0'));
    }

    public function test_step_3_saves_data_and_coordinates_and_repopulates_when_returned(): void
    {
        $this->actingAs($this->user)->patchJson('/akun/keanggotaan/daftar/informasi-akun', [
            'name' => 'Budi Pembudidaya',
            'phone' => '081234567899',
        ]);
        $this->actingAs($this->user)->patchJson('/akun/keanggotaan/daftar/data-pribadi', [
            'nik' => '3201011234567890',
            'name_ktp' => 'Budi Pembudidaya',
            'birth_place' => 'Bogor',
            'birth_date' => '1995-05-12',
            'gender' => 'male',
            'occupation' => 'Pembudidaya',
            'province_id' => $this->province->id,
            'regency_id' => $this->regency->id,
            'district_id' => $this->district->id,
            'village_id' => $this->village->id,
            'postal_code' => '16120',
            'address' => 'Jl. Budidaya No. 10',
            'is_domicile_same' => true,
        ]);

        $targetLat = -6.6892100;
        $targetLng = 106.7824100;
        $targetRevenue = 750000000;

        $response = $this->actingAs($this->user)->patchJson('/akun/keanggotaan/daftar/data-usaha-perikanan', [
            'membership_type' => 'Pembudidaya',
            'business_name' => 'Mina Bahari Utama',
            'owner_name' => 'Budi Pembudidaya',
            'nib' => '9120001234567',
            'npwp' => '09.123.456.7-403.000',
            'founded_at' => '2019-08-17',
            'employee_count' => 12,
            'annual_revenue' => '750.000.000', // Dipersiapkan jadi integer 750000000
            'business_status' => 'CV',
            'business_scale' => 'Kecil',
            'business_field_ids' => [$this->businessField->id],
            'province_id' => $this->province->id,
            'regency_id' => $this->regency->id,
            'district_id' => $this->district->id,
            'village_id' => $this->village->id,
            'postal_code' => '16740',
            'business_address' => 'Desa Tambak Raya No. 45 RT 03 RW 01',
            'latitude' => $targetLat,
            'longitude' => $targetLng,
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'next_step' => 'dokumen',
        ]);

        // Verifikasi di database
        $this->assertDatabaseHas('member_businesses', [
            'user_id' => $this->user->id,
            'name' => 'Mina Bahari Utama',
            'owner_name' => 'Budi Pembudidaya',
            'nib' => '9120001234567',
            'business_status' => 'CV',
            'business_scale' => 'Kecil',
            'employee_count' => 12,
            'annual_revenue' => $targetRevenue,
            'latitude' => $targetLat,
            'longitude' => $targetLng,
        ]);

        // Verifikasi relasi pivot bidang usaha
        $this->assertDatabaseHas('member_business_field', [
            'user_id' => $this->user->id,
            'business_field_id' => $this->businessField->id,
        ]);

        // Verifikasi kembali ke langkah ini data terisi ulang di Inertia response
        $getStep3Response = $this->actingAs($this->user)->get('/akun/keanggotaan/daftar/data-usaha-perikanan');
        $getStep3Response->assertStatus(200);
        $getStep3Response->assertInertia(fn ($page) => $page
            ->component('Member/Register/Index')
            ->where('draft.step3.business_name', 'Mina Bahari Utama')
            ->where('draft.step3.nib', '9120001234567')
            ->where('draft.step3.annual_revenue', $targetRevenue)
            ->where('draft.step3.business_status', 'CV')
            ->where('draft.step3.business_scale', 'Kecil')
            ->where('draft.step3.latitude', $targetLat)
            ->where('draft.step3.longitude', $targetLng)
            ->where('draft.step3.business_field_ids', [$this->businessField->id])
        );
    }

    public function test_document_upload_validates_file_types_and_rejects_oversized_files(): void
    {
        Storage::fake('private');

        // KTP max is 2MB (2048 KB). Testing 3MB file:
        $oversizedFile = UploadedFile::fake()->create('ktp_besar.jpg', 3072, 'image/jpeg');
        $oversizedResponse = $this->actingAs($this->user)->postJson('/akun/keanggotaan/dokumen', [
            'type' => 'ktp',
            'file' => $oversizedFile,
        ]);
        $oversizedResponse->assertStatus(422);
        $oversizedResponse->assertJsonValidationErrors(['file']);

        // File format salah (misalnya .txt atau mime text/plain)
        $invalidMimeFile = UploadedFile::fake()->create('ktp_palsu.txt', 100, 'text/plain');
        $invalidMimeResponse = $this->actingAs($this->user)->postJson('/akun/keanggotaan/dokumen', [
            'type' => 'ktp',
            'file' => $invalidMimeFile,
        ]);
        $invalidMimeResponse->assertStatus(422);
        $invalidMimeResponse->assertJsonValidationErrors(['file']);

        // File valid (KTP jpg 500 KB)
        $validFile = UploadedFile::fake()->image('ktp_sah.jpg', 800, 600)->size(500);
        $validResponse = $this->actingAs($this->user)->postJson('/akun/keanggotaan/dokumen', [
            'type' => 'ktp',
            'file' => $validFile,
        ]);

        $validResponse->assertStatus(200);
        $validResponse->assertJsonStructure([
            'success',
            'document' => [
                'id',
                'type',
                'original_name',
                'file_size',
                'mime_type',
                'signed_url',
                'formatted_size',
            ],
        ]);

        // Pastikan tersimpan di disk private dan nama file diacak (bukan 'ktp_sah.jpg')
        $doc = MemberDocument::where('user_id', $this->user->id)->where('type', 'ktp')->first();
        $this->assertNotNull($doc);
        $this->assertNotEquals('ktp_sah.jpg', basename($doc->path));
        $this->assertEquals('ktp_sah.jpg', $doc->original_name);
        Storage::disk('private')->assertExists($doc->path);
    }

    public function test_private_document_cannot_be_accessed_without_valid_signature_or_by_unauthorized_user(): void
    {
        Storage::fake('private');

        $file = UploadedFile::fake()->image('ktp_privat.jpg', 600, 400)->size(300);
        $path = $file->store('member-documents/'.$this->user->id, 'private');

        $document = MemberDocument::create([
            'user_id' => $this->user->id,
            'type' => 'ktp',
            'path' => $path,
            'original_name' => 'ktp_privat.jpg',
            'file_size' => 300 * 1024,
            'mime_type' => 'image/jpeg',
        ]);

        // 1. Akses route signed tanpa signature yang valid harus ditolak (403)
        $unsignedUrl = "/akun/dokumen/{$document->id}/signed";
        $unauthorizedResponse = $this->actingAs($this->user)->get($unsignedUrl);
        $unauthorizedResponse->assertStatus(403);

        // 2. Akses dengan URL bertanda tangan yang sah oleh pemilik dokumen harus berhasil (200)
        $signedUrl = $document->getSignedUrl(60);
        $ownerResponse = $this->actingAs($this->user)->get($signedUrl);
        $ownerResponse->assertStatus(200);

        // 3. Akses dengan URL bertanda tangan oleh user lain (bukan admin) harus ditolak oleh Policy (403)
        $otherUser = User::factory()->create([
            'role' => Role::User,
        ]);
        $otherUserResponse = $this->actingAs($otherUser)->get($signedUrl);
        $otherUserResponse->assertStatus(403);

        // 4. Akses dengan URL bertanda tangan oleh Admin harus berhasil (200)
        $admin = User::factory()->create([
            'role' => Role::Admin,
        ]);
        $adminResponse = $this->actingAs($admin)->get($signedUrl);
        $adminResponse->assertStatus(200);
    }

    public function test_step_4_documents_requires_mandatory_documents_before_advancing(): void
    {
        // Tanpa dokumen KTP, NIB, dan Foto Usaha
        $invalidStep4 = $this->actingAs($this->user)->postJson('/akun/keanggotaan/daftar/dokumen', []);
        $invalidStep4->assertStatus(422);
        $invalidStep4->assertJsonValidationErrors(['ktp', 'nib', 'business_photo']);

        // Unggah dokumen wajib
        MemberDocument::create([
            'user_id' => $this->user->id,
            'type' => 'ktp',
            'path' => 'docs/ktp.jpg',
            'original_name' => 'ktp.jpg',
        ]);
        MemberDocument::create([
            'user_id' => $this->user->id,
            'type' => 'nib',
            'path' => 'docs/nib.pdf',
            'original_name' => 'nib.pdf',
        ]);
        MemberDocument::create([
            'user_id' => $this->user->id,
            'type' => 'business_photo',
            'path' => 'docs/tambak.jpg',
            'original_name' => 'tambak.jpg',
        ]);

        // Simpan langkah 4 setelah dokumen wajib lengkap
        $validStep4 = $this->actingAs($this->user)->postJson('/akun/keanggotaan/daftar/dokumen', []);
        $validStep4->assertStatus(200);
        $validStep4->assertJson([
            'success' => true,
            'next_step' => 'media-sosial',
        ]);

        $this->user->refresh();
        $this->assertContains('dokumen', $this->user->application->completed_steps);
    }

    public function test_step_5_social_media_can_be_skipped_or_saved_empty(): void
    {
        // Simpan langkah 5 kosong (lewati)
        $emptySocial = $this->actingAs($this->user)->postJson('/akun/keanggotaan/daftar/media-sosial', []);
        $emptySocial->assertStatus(200);
        $emptySocial->assertJson([
            'success' => true,
            'next_step' => 'data-komoditas',
        ]);

        $this->user->refresh();
        $this->assertContains('media-sosial', $this->user->application->completed_steps);
    }

    public function test_step_5_social_media_normalizes_instagram_and_saves_data(): void
    {
        $payload = [
            'website' => 'https://tambakbahari.id',
            'instagram' => '@tambak_bahari',
            'facebook' => 'https://facebook.com/tambakbahari',
            'tiktok' => '@tambakbahari',
            'youtube' => 'https://youtube.com/@tambakbahari',
            'whatsapp' => '081298765432',
        ];

        $response = $this->actingAs($this->user)->postJson('/akun/keanggotaan/daftar/media-sosial', $payload);
        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'next_step' => 'data-komoditas',
        ]);

        $this->assertDatabaseHas('member_social_links', [
            'user_id' => $this->user->id,
            'platform' => 'website',
            'url' => 'https://tambakbahari.id',
        ]);
        $this->assertDatabaseHas('member_social_links', [
            'user_id' => $this->user->id,
            'platform' => 'instagram',
            'url' => 'https://instagram.com/tambak_bahari',
        ]);
        $this->assertDatabaseHas('member_social_links', [
            'user_id' => $this->user->id,
            'platform' => 'facebook',
            'url' => 'https://facebook.com/tambakbahari',
        ]);
        $this->assertDatabaseHas('member_social_links', [
            'user_id' => $this->user->id,
            'platform' => 'tiktok',
            'url' => 'https://tiktok.com/@tambakbahari',
        ]);
        $this->assertDatabaseHas('member_social_links', [
            'user_id' => $this->user->id,
            'platform' => 'youtube',
            'url' => 'https://youtube.com/@tambakbahari',
        ]);
        $this->assertDatabaseHas('member_social_links', [
            'user_id' => $this->user->id,
            'platform' => 'whatsapp',
            'url' => '081298765432',
        ]);
    }

    public function test_step_6_commodity_requires_at_least_one_commodity(): void
    {
        // 1. Kirim array kosong
        $responseEmpty = $this->actingAs($this->user)->postJson('/akun/keanggotaan/daftar/data-komoditas', [
            'commodities' => [],
        ]);
        $responseEmpty->assertStatus(422);
        $responseEmpty->assertJsonValidationErrors(['commodities']);

        // 2. Tanpa field commodities
        $responseMissing = $this->actingAs($this->user)->postJson('/akun/keanggotaan/daftar/data-komoditas', []);
        $responseMissing->assertStatus(422);
        $responseMissing->assertJsonValidationErrors(['commodities']);
    }

    public function test_step_6_commodity_validates_nested_fields_and_saves_in_transaction(): void
    {
        $secondCategory = FishCategory::create([
            'name' => 'Ikan Nila Merah',
            'slug' => 'ikan-nila-merah',
            'description' => 'Budidaya Nila Bioflok',
        ]);

        // Kirim data komoditas pertama
        $payload = [
            'commodities' => [
                [
                    'fish_category_id' => $this->fishCategory->id,
                    'cultivation_type' => 'Kolam tanah',
                    'capacity' => 12.5,
                    'capacity_unit' => 'ton',
                    'production_period' => 'tahun',
                    'land_area' => 1500,
                    'land_area_unit' => 'm2',
                    'pond_count' => 6,
                ],
            ],
        ];

        $response = $this->actingAs($this->user)->postJson('/akun/keanggotaan/daftar/data-komoditas', $payload);
        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'next_step' => 'keanggotaan',
        ]);

        $this->assertDatabaseHas('member_commodities', [
            'user_id' => $this->user->id,
            'fish_category_id' => $this->fishCategory->id,
            'cultivation_type' => 'Kolam tanah',
            'capacity' => 12.5,
            'capacity_unit' => 'ton',
            'production_period' => 'tahun',
            'land_area' => 1500,
            'land_area_unit' => 'm2',
            'pond_count' => 6,
        ]);

        $this->user->refresh();
        $this->assertContains('data-komoditas', $this->user->application->completed_steps);

        // Update dengan komoditas baru (memastikan baris lama terhapus dalam transaksi)
        $payloadUpdate = [
            'commodities' => [
                [
                    'fish_category_id' => $secondCategory->id,
                    'cultivation_type' => 'Bioflok',
                    'capacity' => 500,
                    'capacity_unit' => 'kg',
                    'production_period' => 'bulan',
                    'land_area' => 80,
                    'land_area_unit' => 'm2',
                    'pond_count' => 8,
                ],
            ],
        ];

        $responseUpdate = $this->actingAs($this->user)->postJson('/akun/keanggotaan/daftar/data-komoditas', $payloadUpdate);
        $responseUpdate->assertStatus(200);

        // Komoditas lama tidak ada lagi
        $this->assertDatabaseMissing('member_commodities', [
            'user_id' => $this->user->id,
            'fish_category_id' => $this->fishCategory->id,
        ]);

        // Komoditas baru tersimpan
        $this->assertDatabaseHas('member_commodities', [
            'user_id' => $this->user->id,
            'fish_category_id' => $secondCategory->id,
            'cultivation_type' => 'Bioflok',
            'capacity' => 500,
            'capacity_unit' => 'kg',
            'production_period' => 'bulan',
            'land_area' => 80,
            'land_area_unit' => 'm2',
            'pond_count' => 8,
        ]);
    }

    public function test_step_7_membership_suggests_dpc_based_on_business_regency(): void
    {
        // Berikan izin akses hingga keanggotaan
        $this->user->application()->create([
            'status' => MembershipStatus::Draft,
            'current_step' => 'keanggotaan',
            'completed_steps' => [
                'informasi-akun',
                'data-pribadi',
                'data-usaha-perikanan',
                'dokumen',
                'media-sosial',
                'data-komoditas',
            ],
        ]);

        // Buat DPC yang terdaftar pada kabupaten usaha test user
        $dpc = Dpc::create([
            'regency_id' => $this->regency->id,
            'name' => 'DPC NSA Simeulue Bahari',
            'address' => 'Jl. Pesisir Barat No. 10',
            'phone' => '081122334455',
            'email' => 'dpc.simeulue@nsa.test',
            'period' => '2025-2030',
        ]);

        // Kaitkan usaha user dengan kabupaten ini
        MemberBusiness::create([
            'user_id' => $this->user->id,
            'name' => 'Tambak Sejahtera Simeulue',
            'regency_id' => $this->regency->id,
            'province_id' => $this->province->id,
            'membership_type' => 'Pembudidaya',
        ]);

        // Buka halaman Step 7
        $response = $this->actingAs($this->user)->get('/akun/keanggotaan/daftar/keanggotaan');
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Member/Register/Index')
            ->has('suggestedDpc')
            ->where('suggestedDpc.id', $dpc->id)
            ->where('suggestedDpc.name', 'DPC NSA Simeulue Bahari')
        );
    }

    public function test_step_7_membership_works_gracefully_when_dpc_does_not_exist(): void
    {
        // Berikan izin akses hingga keanggotaan
        $this->user->application()->create([
            'status' => MembershipStatus::Draft,
            'current_step' => 'keanggotaan',
            'completed_steps' => [
                'informasi-akun',
                'data-pribadi',
                'data-usaha-perikanan',
                'dokumen',
                'media-sosial',
                'data-komoditas',
            ],
        ]);

        // Usaha berada di kabupaten tanpa DPC
        $otherRegency = Regency::create([
            'id' => 9999,
            'province_id' => $this->province->id,
            'name' => 'Kabupaten Belum Ada DPC',
            'slug' => 'kabupaten-belum-ada-dpc',
        ]);

        MemberBusiness::create([
            'user_id' => $this->user->id,
            'name' => 'Tambak Pelosok',
            'regency_id' => $otherRegency->id,
            'province_id' => $this->province->id,
            'membership_type' => 'Pembudidaya',
        ]);

        // Buka halaman Step 7 -> suggestedDpc harus null dan tidak menimbulkan error
        $response = $this->actingAs($this->user)->get('/akun/keanggotaan/daftar/keanggotaan');
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Member/Register/Index')
            ->where('suggestedDpc', null)
        );

        $plan = MembershipPlan::create([
            'name' => 'Anggota Biasa (Pembudidaya)',
            'slug' => 'anggota-biasa-test',
            'description' => 'Paket pembudidaya ikan',
            'benefits' => ['Akses pasar', 'Harga pakan murah'],
            'annual_fee' => 150000,
        ]);

        // Simpan Step 7 tanpa DPC (dpc_id = null)
        $payload = [
            'membership_plan_id' => $plan->id,
            'dpc_id' => null,
            'previous_organization' => 'Kelompok Tani Mina Jaya',
            'recommender_name' => 'H. Suryanto',
            'join_reason' => 'Ingin memperluas pemasaran ikan dan mendapatkan pendampingan budidaya dari NSA.',
        ];

        $postResponse = $this->actingAs($this->user)->postJson('/akun/keanggotaan/daftar/keanggotaan', $payload);
        $postResponse->assertStatus(200);
        $postResponse->assertJson([
            'success' => true,
            'next_step' => 'surat-pernyataan',
        ]);

        $this->user->refresh();
        $this->assertEquals($plan->id, $this->user->application->membership_plan_id);
        $this->assertNull($this->user->application->dpc_id);
        $this->assertEquals('Kelompok Tani Mina Jaya', $this->user->application->previous_organization);
        $this->assertEquals('H. Suryanto', $this->user->application->recommender_name);
        $this->assertContains('keanggotaan', $this->user->application->completed_steps);
    }

    public function test_step_7_membership_validates_plan_and_join_reason(): void
    {
        $plan = MembershipPlan::create([
            'name' => 'Anggota Biasa',
            'slug' => 'anggota-biasa-val',
            'description' => 'Paket biasa',
            'benefits' => ['Manfaat 1'],
            'annual_fee' => 150000,
        ]);

        // 1. Tanpa paket dan alasan bergabung
        $invalidResponse = $this->actingAs($this->user)->postJson('/akun/keanggotaan/daftar/keanggotaan', []);
        $invalidResponse->assertStatus(422);
        $invalidResponse->assertJsonValidationErrors(['membership_plan_id', 'join_reason']);

        // 2. Alasan bergabung melebihi 500 karakter
        $longReason = str_repeat('Alasan ini sangat panjang sekali ', 25); // > 500 chars
        $exceededResponse = $this->actingAs($this->user)->postJson('/akun/keanggotaan/daftar/keanggotaan', [
            'membership_plan_id' => $plan->id,
            'join_reason' => $longReason,
        ]);
        $exceededResponse->assertStatus(422);
        $exceededResponse->assertJsonValidationErrors(['join_reason']);
    }

    public function test_step_8_statement_saves_agreements_signature_and_advances_to_review(): void
    {
        Storage::fake('private');

        $this->user->application()->create([
            'status' => MembershipStatus::Draft,
            'current_step' => 'surat-pernyataan',
            'completed_steps' => [
                'informasi-akun',
                'data-pribadi',
                'data-usaha-perikanan',
                'dokumen',
                'media-sosial',
                'data-komoditas',
                'keanggotaan',
            ],
        ]);

        $dummyPngBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

        $payload = [
            'agree_data_accurate' => true,
            'agree_ad_art' => true,
            'agree_privacy_policy' => true,
            'signature_data' => $dummyPngBase64,
            'city' => 'Kabupaten Simeulue',
        ];

        $response = $this->actingAs($this->user)->postJson('/akun/keanggotaan/daftar/surat-pernyataan', $payload);
        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'next_step' => 'review-data',
        ]);

        $this->assertDatabaseHas('member_statements', [
            'user_id' => $this->user->id,
            'city' => 'Kabupaten Simeulue',
            'agree_data_accurate' => 1,
            'agree_ad_art' => 1,
            'agree_privacy_policy' => 1,
        ]);

        $statement = MemberStatement::where('user_id', $this->user->id)->first();
        $this->assertNotNull($statement->signature_path);
        Storage::disk('private')->assertExists($statement->signature_path);

        $this->user->refresh();
        $this->assertContains('surat-pernyataan', $this->user->application->completed_steps);
    }

    public function test_step_8_statement_requires_mandatory_agreements_and_signature(): void
    {
        $response = $this->actingAs($this->user)->postJson('/akun/keanggotaan/daftar/surat-pernyataan', []);
        $response->assertStatus(422);
        $response->assertJsonValidationErrors([
            'agree_data_accurate',
            'agree_ad_art',
            'agree_privacy_policy',
            'signature_data',
        ]);
    }

    public function test_cannot_submit_if_any_step_is_incomplete(): void
    {
        // User baru yang belum mengisi data apapun
        $response = $this->actingAs($this->user)->postJson('/akun/keanggotaan/daftar/kirim');

        // Harus gagal validasi server (422)
        $response->assertStatus(422);
        $this->user->refresh();
        $this->assertNotEquals(MembershipStatus::PendingReview, $this->user->membership_status);
    }

    public function test_submit_changes_status_to_pending_and_sends_emails(): void
    {
        Storage::fake('private');
        Mail::fake();

        // 1. Lengkapi Profile
        MemberProfile::create([
            'user_id' => $this->user->id,
            'nik' => '1234567890123456',
            'name_ktp' => 'Pembudidaya Handal',
            'birth_place' => 'Simeulue',
            'birth_date' => '1990-01-01',
            'gender' => 'male',
            'address' => 'Jl. Bahari No. 10',
            'province_id' => $this->province->id,
            'regency_id' => $this->regency->id,
            'district_id' => $this->district->id,
            'village_id' => $this->village->id,
        ]);

        // 2. Lengkapi Business
        MemberBusiness::create([
            'user_id' => $this->user->id,
            'name' => 'Tambak Sejahtera',
            'owner_name' => 'Pembudidaya Handal',
            'nib' => '1234567890123',
            'founded_at' => '2020-01-01',
            'employee_count' => 5,
            'annual_revenue' => 100000000,
            'business_status' => 'Perorangan',
            'business_scale' => 'Mikro',
            'province_id' => $this->province->id,
            'regency_id' => $this->regency->id,
            'district_id' => $this->district->id,
            'village_id' => $this->village->id,
            'address' => 'Jl. Tambak Lele Makmur',
        ]);

        // 3. Lengkapi Dokumen (KTP, NIB, business_photo)
        foreach (['ktp', 'nib', 'business_photo'] as $docType) {
            MemberDocument::create([
                'user_id' => $this->user->id,
                'type' => $docType,
                'path' => "documents/{$this->user->id}_{$docType}.jpg",
                'original_name' => "{$docType}.jpg",
                'file_size' => 1024,
                'mime_type' => 'image/jpeg',
                'status' => 'pending',
            ]);
        }

        // 4. Lengkapi Komoditas
        MemberCommodity::create([
            'user_id' => $this->user->id,
            'fish_category_id' => $this->fishCategory->id,
            'cultivation_type' => 'Kolam terpal',
            'capacity' => 15,
            'capacity_unit' => 'ton',
            'production_period' => 'tahun',
            'unit' => 'ton/tahun',
            'land_area' => 500,
            'land_area_unit' => 'm2',
        ]);

        // 5. Lengkapi Keanggotaan & Plan
        $plan = MembershipPlan::create([
            'name' => 'Anggota Biasa (Pembudidaya)',
            'slug' => 'anggota-biasa-sub',
            'description' => 'Paket pembudidaya',
            'benefits' => ['Benefit 1'],
            'annual_fee' => 150000,
        ]);

        $this->user->application()->create([
            'status' => MembershipStatus::Draft,
            'current_step' => 'review-data',
            'completed_steps' => [
                'informasi-akun',
                'data-pribadi',
                'data-usaha-perikanan',
                'dokumen',
                'media-sosial',
                'data-komoditas',
                'keanggotaan',
                'surat-pernyataan',
            ],
            'membership_plan_id' => $plan->id,
            'join_reason' => 'Ingin bergabung demi kemajuan bersama industri akuakultur.',
        ]);

        // 6. Lengkapi Surat Pernyataan & Tanda Tangan
        MemberStatement::create([
            'user_id' => $this->user->id,
            'city' => 'Kabupaten Simeulue',
            'agree_data_accurate' => true,
            'agree_ad_art' => true,
            'agree_privacy_policy' => true,
            'signed_at' => now(),
            'signature_path' => "signatures/{$this->user->id}_sig.png",
        ]);

        // Kirim Pengajuan
        $response = $this->actingAs($this->user)->postJson('/akun/keanggotaan/daftar/kirim');
        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'redirect_url' => route('account.membership.status'),
        ]);

        $this->user->refresh();
        $this->assertEquals(MembershipStatus::PendingReview, $this->user->membership_status);
        $this->assertEquals(MembershipStatus::PendingReview, $this->user->application->status);
        $this->assertNotNull($this->user->application->submitted_at);

        // Periksa email terkirim ke pemohon
        Mail::assertSent(MembershipApplicationSubmitted::class, function ($mail) {
            return $mail->hasTo($this->user->email);
        });

        // Periksa review log tercatat
        $this->assertDatabaseHas('member_review_logs', [
            'user_id' => $this->user->id,
            'action' => 'submitted',
        ]);
    }

    public function test_pending_user_cannot_access_wizard_and_redirected_to_status(): void
    {
        $this->user->update([
            'membership_status' => MembershipStatus::PendingReview,
        ]);

        $this->user->application()->create([
            'status' => MembershipStatus::PendingReview,
            'current_step' => 'review-data',
            'completed_steps' => ['informasi-akun', 'data-pribadi'],
        ]);

        $response = $this->actingAs($this->user)->get('/akun/keanggotaan/daftar');
        $response->assertRedirect(route('account.membership.status'));

        $stepResponse = $this->actingAs($this->user)->get('/akun/keanggotaan/daftar/informasi-akun');
        $stepResponse->assertRedirect(route('account.membership.status'));
    }

    public function test_revision_user_can_reopen_wizard_and_edit(): void
    {
        $this->user->update([
            'membership_status' => MembershipStatus::Revision,
        ]);

        $this->user->application()->create([
            'status' => MembershipStatus::Revision,
            'current_step' => 'informasi-akun',
            'completed_steps' => ['informasi-akun'],
        ]);

        // User dalam status revision tidak di-redirect ke status, tapi diizinkan membuka wizard
        $response = $this->actingAs($this->user)->get('/akun/keanggotaan/daftar/informasi-akun');
        $response->assertStatus(200);
    }
}
