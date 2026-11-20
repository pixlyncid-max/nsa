<?php

namespace Tests\Feature;

use App\Enums\MembershipStatus;
use App\Enums\Role;
use App\Mail\MemberApprovedMail;
use App\Mail\MemberRejectedMail;
use App\Mail\MemberRevisionRequestedMail;
use App\Models\FishCategory;
use App\Models\MemberApplication;
use App\Models\MemberBusiness;
use App\Models\MemberCommodity;
use App\Models\MemberProfile;
use App\Models\MembershipPlan;
use App\Models\MemberStatement;
use App\Models\Province;
use App\Models\Regency;
use App\Models\User;
use App\Services\StatisticService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class AdminMemberVerificationTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected User $regularUser;

    protected User $applicant;

    protected function setUp(): void
    {
        parent::setUp();

        Mail::fake();

        $this->admin = User::factory()->create([
            'role' => Role::Admin,
            'membership_status' => MembershipStatus::Approved,
        ]);

        $this->regularUser = User::factory()->create([
            'role' => Role::User,
            'membership_status' => MembershipStatus::Approved,
        ]);

        $this->applicant = User::factory()->create([
            'name' => 'Budi Santoso',
            'email' => 'budi.santoso@example.com',
            'phone' => '081234567890',
            'role' => Role::User,
            'membership_status' => MembershipStatus::PendingReview,
        ]);

        MemberApplication::create([
            'user_id' => $this->applicant->id,
            'status' => MembershipStatus::PendingReview->value,
            'current_step' => 'tinjau-kirim',
            'submitted_at' => now(),
        ]);
    }

    public function test_regular_user_cannot_access_admin_member_pages_and_actions_gets_403(): void
    {
        // 1. Index
        $response = $this->actingAs($this->regularUser)->get('/admin/anggota');
        $response->assertStatus(403);

        // 2. Show
        $response = $this->actingAs($this->regularUser)->get("/admin/anggota/{$this->applicant->id}");
        $response->assertStatus(403);

        // 3. Approve
        $response = $this->actingAs($this->regularUser)->post("/admin/anggota/{$this->applicant->id}/setujui");
        $response->assertStatus(403);

        // 4. Request Revision
        $response = $this->actingAs($this->regularUser)->post("/admin/anggota/{$this->applicant->id}/minta-revisi", [
            'note' => 'Perbaiki dokumen KTP',
        ]);
        $response->assertStatus(403);

        // 5. Reject
        $response = $this->actingAs($this->regularUser)->post("/admin/anggota/{$this->applicant->id}/tolak", [
            'reason' => 'Dokumen tidak valid dan ditolak',
        ]);
        $response->assertStatus(403);

        // 6. Export CSV
        $response = $this->actingAs($this->regularUser)->get('/admin/anggota/ekspor-csv');
        $response->assertStatus(403);
    }

    public function test_admin_can_view_member_list_with_filters(): void
    {
        $province = Province::create(['id' => 31, 'name' => 'DKI JAKARTA', 'slug' => 'dki-jakarta']);
        $regency = Regency::create(['id' => 3171, 'province_id' => 31, 'name' => 'KOTA JAKARTA SELATAN', 'slug' => 'jakarta-selatan']);

        MemberBusiness::create([
            'user_id' => $this->applicant->id,
            'name' => 'PT Mina Sejahtera Nusantara',
            'nib' => '1234567890123',
            'province_id' => $province->id,
            'regency_id' => $regency->id,
        ]);

        $response = $this->actingAs($this->admin)->get('/admin/anggota?search=Mina&status=pending_review&province_id=31');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Members/Index')
            ->has('members.data', 1)
            ->where('members.data.0.id', $this->applicant->id)
            ->where('members.data.0.business_name', 'PT Mina Sejahtera Nusantara')
        );
    }

    public function test_admin_can_view_member_detail_with_all_9_steps_data(): void
    {
        $province = Province::create(['id' => 32, 'name' => 'JAWA BARAT', 'slug' => 'jawa-barat']);
        $regency = Regency::create(['id' => 3201, 'province_id' => 32, 'name' => 'KABUPATEN BOGOR', 'slug' => 'kab-bogor']);

        MemberProfile::create([
            'user_id' => $this->applicant->id,
            'nik' => '3201234567890001',
            'birth_place' => 'Bogor',
            'birth_date' => '1990-05-15',
            'gender' => 'male',
            'province_id' => $province->id,
            'regency_id' => $regency->id,
            'address' => 'Jl. Perikanan Air Tawar No. 10',
        ]);

        MemberBusiness::create([
            'user_id' => $this->applicant->id,
            'name' => 'Tambak Sejahtera Bogor',
            'nib' => '9988776655443',
            'province_id' => $province->id,
            'regency_id' => $regency->id,
            'latitude' => -6.595038,
            'longitude' => 106.816635,
        ]);

        $plan = MembershipPlan::create([
            'name' => 'Anggota Biasa (Pembudidaya)',
            'slug' => 'anggota-biasa',
            'description' => 'Paket pembudidaya ikan',
            'benefits' => ['KTA', 'Bimbingan'],
            'annual_fee' => 150000,
            'is_active' => true,
        ]);

        $this->applicant->application->update([
            'membership_plan_id' => $plan->id,
        ]);

        MemberStatement::create([
            'user_id' => $this->applicant->id,
            'city' => 'Bogor',
            'agree_data_accurate' => true,
            'agree_ad_art' => true,
            'agree_privacy_policy' => true,
            'signed_at' => now(),
            'signature_path' => 'signatures/test_sig.png',
        ]);

        $response = $this->actingAs($this->admin)->get("/admin/anggota/{$this->applicant->id}");

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Members/Show')
            ->where('member.id', $this->applicant->id)
            ->where('member.name', 'Budi Santoso')
            ->where('member.profile.nik', '3201234567890001')
            ->where('member.business.name', 'Tambak Sejahtera Bogor')
            ->has('member.statement')
        );
    }

    public function test_admin_can_approve_member_and_generates_unique_number_format_nsa_yyy_y_00001(): void
    {
        $year = now()->format('Y');

        $response = $this->actingAs($this->admin)->post("/admin/anggota/{$this->applicant->id}/setujui", [
            'note' => 'Berkas pendaftaran lengkap dan valid.',
        ]);

        $response->assertSessionHas('success');

        $this->applicant->refresh();

        // Verifikasi status dan format nomor anggota
        $this->assertEquals(MembershipStatus::Approved, $this->applicant->membership_status);
        $expectedNumber = "NSA-{$year}-00001";
        $this->assertEquals($expectedNumber, $this->applicant->member_number);

        // Verifikasi member_applications
        $this->assertNotNull($this->applicant->application);
        $this->assertEquals(MembershipStatus::Approved, $this->applicant->application->status);
        $this->assertEquals($expectedNumber, $this->applicant->application->member_number);
        $this->assertNotNull($this->applicant->application->approved_at);

        // Verifikasi member_review_logs
        $this->assertDatabaseHas('member_review_logs', [
            'user_id' => $this->applicant->id,
            'admin_id' => $this->admin->id,
            'action' => 'approved',
            'note' => 'Berkas pendaftaran lengkap dan valid.',
        ]);

        // Verifikasi email terkirim
        Mail::assertSent(MemberApprovedMail::class, function ($mail) {
            return $mail->hasTo('budi.santoso@example.com');
        });

        // Verifikasi bahwa anggota berikutnya mendapatkan nomor berurutan yang unik
        $applicant2 = User::factory()->create([
            'role' => Role::User,
            'membership_status' => MembershipStatus::PendingReview,
        ]);
        MemberApplication::create([
            'user_id' => $applicant2->id,
            'status' => MembershipStatus::PendingReview->value,
        ]);

        $this->actingAs($this->admin)->post("/admin/anggota/{$applicant2->id}/setujui");
        $applicant2->refresh();
        $this->assertEquals("NSA-{$year}-00002", $applicant2->member_number);
    }

    public function test_approved_member_commodities_clear_statistic_cache_and_flow_to_statistics(): void
    {
        $fishCat = FishCategory::firstOrCreate(
            ['slug' => 'air-tawar'],
            ['name' => 'Ikan Air Tawar', 'order' => 1, 'is_active' => true]
        );

        MemberCommodity::create([
            'user_id' => $this->applicant->id,
            'fish_category_id' => $fishCat->id,
            'name' => 'Ikan Nila Merah Unggul',
            'cultivation_type' => 'Kolam Air Deras',
            'land_area' => 500,
            'pond_count' => 6,
            'production_capacity' => 2500,
            'harvest_cycle' => '3 bulan',
        ]);

        // Pastikan cache diuji lewat StatisticService
        $statisticService = app(StatisticService::class);
        $beforeStats = $statisticService->getHomeData();
        $this->assertIsArray($beforeStats);

        // Admin approve member
        $this->actingAs($this->admin)->post("/admin/anggota/{$this->applicant->id}/setujui");

        // Setelah disetujui, cache telah dibersihkan dan data home memuat pemohon
        $afterStats = $statisticService->getHomeData();
        $this->assertIsArray($afterStats);
        $this->assertGreaterThan(0, $afterStats['summaryStats']['total_members'] ?? 0);
        $this->assertNotEmpty($afterStats['categoryCharts']['distribution'] ?? []);
    }

    public function test_admin_can_request_revision_and_notes_appear_for_applicant(): void
    {
        $revisionNote = 'Scan NIB kabur dan tidak terbaca. Harap unggah ulang berkas asli.';

        $response = $this->actingAs($this->admin)->post("/admin/anggota/{$this->applicant->id}/minta-revisi", [
            'sections' => ['Langkah 3: Data Usaha', 'Langkah 6: Dokumen Usaha'],
            'note' => $revisionNote,
        ]);

        $response->assertSessionHas('success');

        $this->applicant->refresh();

        // 1. Status berubah jadi revision
        $this->assertEquals(MembershipStatus::Revision, $this->applicant->membership_status);

        // 2. Review log tercatat
        $this->assertDatabaseHas('member_review_logs', [
            'user_id' => $this->applicant->id,
            'admin_id' => $this->admin->id,
            'action' => 'revision',
        ]);

        // 3. Email terkirim
        Mail::assertSent(MemberRevisionRequestedMail::class, function ($mail) {
            return $mail->hasTo('budi.santoso@example.com');
        });

        // 4. Catatan muncul di sisi pemohon pada halaman status keanggotaan
        $applicantResponse = $this->actingAs($this->applicant)->get('/akun/keanggotaan');
        $applicantResponse->assertStatus(200);
        $applicantResponse->assertInertia(fn ($page) => $page
            ->component('Member/Status')
            ->where('statusData.status', 'revision')
            ->has('statusData.review_logs', fn ($logs) => $logs
                ->where('0.action', 'revision')
                ->where('0.note', fn ($note) => str_contains((string) $note, 'Scan NIB kabur'))
            )
        );
    }

    public function test_admin_can_reject_member_with_mandatory_reason(): void
    {
        // 1. Gagal jika alasan kosong atau < 5 karakter
        $invalidResponse = $this->actingAs($this->admin)->post("/admin/anggota/{$this->applicant->id}/tolak", [
            'reason' => 'abc',
        ]);
        $invalidResponse->assertSessionHasErrors('reason');

        // 2. Berhasil dengan alasan valid
        $reason = 'Usaha tidak bergerak di sektor perikanan atau akuakultur sesuai AD/ART.';
        $validResponse = $this->actingAs($this->admin)->post("/admin/anggota/{$this->applicant->id}/tolak", [
            'reason' => $reason,
        ]);
        $validResponse->assertSessionHas('success');

        $this->applicant->refresh();
        $this->assertEquals(MembershipStatus::Rejected, $this->applicant->membership_status);

        $this->assertDatabaseHas('member_review_logs', [
            'user_id' => $this->applicant->id,
            'admin_id' => $this->admin->id,
            'action' => 'rejected',
            'note' => $reason,
        ]);

        Mail::assertSent(MemberRejectedMail::class, function ($mail) {
            return $mail->hasTo('budi.santoso@example.com');
        });
    }

    public function test_admin_can_export_approved_members_csv_with_utf8_bom(): void
    {
        // Setujui pendaftar
        $this->actingAs($this->admin)->post("/admin/anggota/{$this->applicant->id}/setujui");

        $response = $this->actingAs($this->admin)->get('/admin/anggota/ekspor-csv');

        $response->assertStatus(200);
        $this->assertStringContainsString('text/csv', $response->headers->get('Content-Type'));

        // Cek isi stream output
        ob_start();
        $response->sendContent();
        $csvContent = ob_get_clean();

        // 1. Memiliki UTF-8 BOM
        $this->assertStringStartsWith("\xEF\xBB\xBF", $csvContent);

        // 2. Berisi header dan data pendaftar yang telah disetujui
        $this->assertStringContainsString('Nomor Anggota (NTA)', $csvContent);
        $this->assertStringContainsString('Budi Santoso', $csvContent);
        $this->assertStringContainsString('budi.santoso@example.com', $csvContent);
        $this->assertStringContainsString('NSA-', $csvContent);
    }
}
