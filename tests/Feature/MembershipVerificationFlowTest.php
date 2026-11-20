<?php

namespace Tests\Feature;

use App\Actions\Admin\ApproveMember;
use App\Enums\MembershipStatus;
use App\Enums\ProgramCategory;
use App\Enums\Role;
use App\Mail\MemberApprovedMail;
use App\Mail\MemberInitialVerifiedMail;
use App\Mail\PaymentProofRejectedMail;
use App\Models\District;
use App\Models\MemberApplication;
use App\Models\MemberDocument;
use App\Models\MemberInvoice;
use App\Models\MemberInvoiceItem;
use App\Models\MembershipCategory;
use App\Models\MembershipFeeItem;
use App\Models\MembershipType;
use App\Models\Payment;
use App\Models\Province;
use App\Models\Regency;
use App\Models\Setting;
use App\Models\User;
use App\Models\Village;
use App\Support\Brand;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class MembershipVerificationFlowTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected User $user;

    protected MemberApplication $application;

    protected MemberInvoice $invoice;

    protected MembershipCategory $category;

    protected MembershipType $membershipType;

    protected Province $province;

    protected Regency $regency;

    protected District $district;

    protected Village $village;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('public');
        Storage::fake('private');
        Mail::fake();

        $this->province = Province::firstOrCreate(
            ['id' => 32],
            ['name' => 'Jawa Barat', 'slug' => 'jawa-barat']
        );

        $this->regency = Regency::firstOrCreate(
            ['id' => 3201],
            ['province_id' => 32, 'name' => 'Kabupaten Bogor', 'slug' => 'kabupaten-bogor']
        );

        $this->district = District::firstOrCreate(
            ['id' => 3201010],
            ['regency_id' => 3201, 'name' => 'Cibinong', 'slug' => 'cibinong']
        );

        $this->village = Village::firstOrCreate(
            ['id' => 3201010001],
            ['district_id' => 3201010, 'name' => 'Cirimekar', 'postal_code' => '16911']
        );

        $this->admin = User::factory()->create([
            'role' => Role::Admin,
            'name' => 'Verifikator NSA',
            'email' => 'admin@nsa.test',
        ]);

        $this->user = User::factory()->create([
            'role' => Role::User,
            'membership_status' => MembershipStatus::PendingReview,
            'name' => 'Budi Santoso',
            'email' => 'budi@example.com',
        ]);

        $this->category = MembershipCategory::firstOrCreate(
            ['slug' => 'pembudidaya'],
            ['name' => 'Pembudidaya Ikan', 'is_active' => true]
        );

        $this->membershipType = MembershipType::firstOrCreate(
            ['slug' => 'anggota-biasa'],
            ['category_id' => $this->category->id, 'name' => 'Anggota Biasa', 'is_active' => true]
        );

        $this->application = MemberApplication::create([
            'user_id' => $this->user->id,
            'status' => MembershipStatus::PendingReview,
            'current_step' => 'pemeriksaan',
            'membership_category' => 'pembudidaya',
            'membership_type_id' => $this->membershipType->id,
            'submitted_at' => now(),
        ]);

        $feeItem = MembershipFeeItem::create([
            'code' => 'REG-FEE',
            'name' => 'Biaya Pendaftaran NSA',
            'amount' => 150000,
            'is_mandatory' => true,
            'is_active' => true,
        ]);

        $this->invoice = MemberInvoice::create([
            'application_id' => $this->application->id,
            'number' => 'INV-TEST-001',
            'status' => 'draft',
            'total' => 150000,
        ]);

        MemberInvoiceItem::create([
            'invoice_id' => $this->invoice->id,
            'fee_item_id' => $feeItem->id,
            'name_snapshot' => $feeItem->name,
            'amount_snapshot' => $feeItem->amount,
            'qty' => 1,
            'subtotal' => 150000,
        ]);
    }

    protected function setupFullApplication(User $user): MemberApplication
    {
        $app = $user->application()->firstOrCreate(
            ['user_id' => $user->id],
            [
                'status' => MembershipStatus::Draft,
                'current_step' => 'pemeriksaan',
                'completed_steps' => [
                    'identitas',
                    'kategori-keanggotaan',
                    'profil-usaha',
                    'aktivitas-perikanan',
                    'jaringan-bisnis',
                    'minat-program',
                    'lokasi-dokumen',
                    'paket-administrasi',
                ],
                'membership_category' => 'pembudidaya',
                'applicant_type' => 'individual',
                'membership_type_id' => $this->membershipType->id,
            ]
        );

        // Langkah 1: Identitas
        $app->identity()->updateOrCreate(
            ['application_id' => $app->id],
            [
                'user_id' => $user->id,
                'nationality' => 'wni',
                'full_name' => $user->name,
                'gender' => 'male',
                'birth_place' => 'Bogor',
                'birth_date' => '1990-05-15',
                'phone' => '081234567890',
                'email' => $user->email,
                'nik' => '3201011505900001',
                'ktp_address' => [
                    'province_id' => $this->province->id,
                    'regency_id' => $this->regency->id,
                    'district_id' => $this->district->id,
                    'village_id' => $this->village->id,
                    'address' => 'Jl. Perikanan No. 10',
                ],
            ]
        );

        // Langkah 3: Profil Usaha
        $biz = $app->businesses()->updateOrCreate(
            ['application_id' => $app->id, 'is_primary' => true],
            [
                'user_id' => $user->id,
                'name' => 'Tambak Makmur NSA',
                'activity_field' => 'Budidaya Air Tawar',
                'has_no_business' => false,
                'scale' => 'Kecil',
                'years_operating' => 5,
            ]
        );

        $biz->legalDocuments()->create([
            'type' => 'nib',
            'number' => '1234567890123',
            'label' => 'NIB OSS',
        ]);

        // Langkah 5: Jaringan
        $app->networkProfile()->updateOrCreate(
            ['application_id' => $app->id],
            [
                'marketing_info' => 'Pasar lokal Bogor & Jakarta',
                'distribution_areas' => ['Jawa Barat', 'DKI Jakarta'],
                'cooperation_types' => ['kemitraan_pakan', 'pemasaran_bersama'],
            ]
        );

        // Langkah 6: Minat
        $app->programInterests()->create([
            'category' => ProgramCategory::Pelatihan,
            'note' => 'Tertarik pelatihan biosecurity',
        ]);

        // Langkah 7: Lokasi Domisili & Dokumen
        $app->locations()->create([
            'kind' => 'domicile',
            'province_id' => $this->province->id,
            'regency_id' => $this->regency->id,
            'district_id' => $this->district->id,
            'village_id' => $this->village->id,
            'postal_code' => '16911',
            'address' => 'Jl. Raya Cibinong KM 45',
        ]);

        MemberDocument::create([
            'user_id' => $user->id,
            'type' => 'ktp',
            'path' => 'documents/test_ktp.jpg',
            'original_name' => 'ktp.jpg',
            'status' => 'pending',
        ]);

        MemberDocument::create([
            'user_id' => $user->id,
            'type' => 'nib',
            'path' => 'documents/test_nib.pdf',
            'original_name' => 'nib.pdf',
            'status' => 'pending',
        ]);

        // Langkah 8: Administrasi Invoice
        $invoice = MemberInvoice::firstOrCreate(
            ['application_id' => $app->id, 'status' => 'unpaid'],
            ['number' => 'INV-BYPASS-'.$app->id, 'total' => 150000]
        );

        $fee1 = MembershipFeeItem::where('code', 'REG-FEE')->first();
        if ($fee1) {
            $invoice->items()->create([
                'fee_item_id' => $fee1->id,
                'name_snapshot' => $fee1->name,
                'amount_snapshot' => $fee1->amount,
                'qty' => 1,
            ]);
        }

        return $app;
    }

    public function test_full_flow_from_submission_to_approved(): void
    {
        // 1. Verifikasi Awal oleh Admin
        $response = $this->actingAs($this->admin)
            ->post("/admin/anggota/{$this->user->id}/lolos-awal", [
                'note' => 'Dokumen awal lengkap dan valid.',
            ]);

        $response->assertRedirect();
        $this->user->refresh();
        $this->application->refresh();
        $this->invoice->refresh();

        $this->assertEquals(MembershipStatus::AwaitingPayment, $this->user->membership_status);
        $this->assertEquals(MembershipStatus::AwaitingPayment, $this->application->status);
        $this->assertEquals('unpaid', $this->invoice->status);
        $this->assertNotNull($this->invoice->due_at);

        // Pastikan email verifikasi awal terkirim
        Mail::assertSent(MemberInitialVerifiedMail::class, function ($mail) {
            return $mail->hasTo('budi@example.com');
        });

        // 2. Pemohon mengunggah bukti pembayaran di /akun/keanggotaan/bukti-bayar
        $proofFile = UploadedFile::fake()->create('bukti_transfer.jpg', 800, 'image/jpeg');

        $uploadResponse = $this->actingAs($this->user)
            ->post('/akun/keanggotaan/bukti-bayar', [
                'sender_name' => 'Budi Santoso',
                'sender_bank' => 'BCA',
                'paid_at' => now()->format('Y-m-d'),
                'proof' => $proofFile,
                'notes' => 'Sudah ditransfer melalui m-BCA.',
            ]);

        $uploadResponse->assertRedirect(route('account.membership.status'));
        $this->user->refresh();
        $this->application->refresh();
        $this->invoice->refresh();

        $this->assertEquals(MembershipStatus::PendingApproval, $this->user->membership_status);
        $this->assertEquals(MembershipStatus::PendingApproval, $this->application->status);
        $this->assertEquals('waiting_confirmation', $this->invoice->status);

        $payment = Payment::where('payable_type', MemberInvoice::class)
            ->where('payable_id', $this->invoice->id)
            ->first();
        $this->assertNotNull($payment);
        $this->assertEquals('Budi Santoso', $payment->sender_name);
        $this->assertEquals('pending', $payment->status);

        // 3. Admin Melakukan Persetujuan Akhir (Approve)
        $approveResponse = $this->actingAs($this->admin)
            ->post("/admin/anggota/{$this->user->id}/setujui", [
                'note' => 'Pembayaran terverifikasi lunas. Selamat bergabung.',
            ]);

        $approveResponse->assertRedirect();
        $this->user->refresh();
        $this->application->refresh();
        $this->invoice->refresh();
        $payment->refresh();

        $this->assertEquals(MembershipStatus::Approved, $this->user->membership_status);
        $this->assertEquals(MembershipStatus::Approved, $this->application->status);
        $this->assertEquals('paid', $this->invoice->status);
        $this->assertEquals('confirmed', $payment->status);

        // NTA terbit dengan format NSA-YYYY-00001
        $currentYear = date('Y');
        $expectedPrefix = Brand::shortName().'-'.$currentYear.'-';
        $this->assertNotNull($this->user->member_number);
        $this->assertStringStartsWith($expectedPrefix, $this->user->member_number);

        // Email approved terkirim
        Mail::assertSent(MemberApprovedMail::class, function ($mail) {
            return $mail->hasTo('budi@example.com');
        });
    }

    public function test_initial_verification_switch_disabled_bypasses_pending_review(): void
    {
        // Matikan saklar verifikasi awal
        Setting::set('membership.require_initial_verification', false);

        $newUser = User::factory()->create([
            'role' => Role::User,
            'membership_status' => MembershipStatus::Draft,
            'email' => 'newuser@example.com',
        ]);

        $app = $this->setupFullApplication($newUser);

        // Submit Step 9 (Pemeriksaan) via route submit
        $response = $this->actingAs($newUser)
            ->post(route('account.membership.submit'), [
                'agree_terms' => true,
                'agree_privacy' => true,
            ]);

        $response->assertRedirect(route('account.membership.status'));
        $newUser->refresh();
        $app->refresh();

        $inv = $app->invoices()->first();

        // Status langsung awaiting_payment tanpa melewati pending_review
        $this->assertEquals(MembershipStatus::AwaitingPayment, $newUser->membership_status);
        $this->assertEquals(MembershipStatus::AwaitingPayment, $app->status);
        $this->assertEquals('unpaid', $inv->status);
    }

    public function test_reject_payment_proof_allows_reupload(): void
    {
        // Setup state awaiting approval dengan payment proof
        $this->user->update(['membership_status' => MembershipStatus::PendingApproval]);
        $this->application->update(['status' => MembershipStatus::PendingApproval]);
        $this->invoice->update(['status' => 'waiting_confirmation']);

        $payment = Payment::create([
            'payable_type' => MemberInvoice::class,
            'payable_id' => $this->invoice->id,
            'amount' => 150000,
            'payment_method' => 'manual_transfer',
            'status' => 'pending',
            'sender_name' => 'Budi Santoso',
            'proof_file' => 'payments/proof.jpg',
        ]);

        // Admin menolak bukti pembayaran
        $response = $this->actingAs($this->admin)
            ->post("/admin/anggota/{$this->user->id}/tolak-bukti-bayar", [
                'reason' => 'Foto bukti bayar tidak jelas/terpotong. Mohon unggah bukti struk asli yang utuh.',
            ]);

        $response->assertRedirect();
        $this->user->refresh();
        $this->application->refresh();
        $this->invoice->refresh();
        $payment->refresh();

        $this->assertEquals(MembershipStatus::AwaitingPayment, $this->user->membership_status);
        $this->assertEquals(MembershipStatus::AwaitingPayment, $this->application->status);
        $this->assertEquals('unpaid', $this->invoice->status);
        $this->assertEquals('rejected', $payment->status);

        // Pastikan email penolakan bukti bayar dikirim
        Mail::assertSent(PaymentProofRejectedMail::class, function ($mail) {
            return $mail->hasTo('budi@example.com');
        });

        // Pemohon mengunggah ulang bukti pembayaran baru
        $newProof = UploadedFile::fake()->create('bukti_baru.jpg', 500, 'image/jpeg');
        $reupload = $this->actingAs($this->user)
            ->post('/akun/keanggotaan/bukti-bayar', [
                'sender_name' => 'Budi Santoso',
                'sender_bank' => 'BCA',
                'payment_date' => now()->format('Y-m-d'),
                'proof' => $newProof,
            ]);

        $reupload->assertRedirect(route('account.membership.status'));
        $this->user->refresh();
        $this->invoice->refresh();

        $this->assertEquals(MembershipStatus::PendingApproval, $this->user->membership_status);
        $this->assertEquals('waiting_confirmation', $this->invoice->status);
    }

    public function test_request_revision_flow(): void
    {
        // Admin meminta revisi dokumen
        $response = $this->actingAs($this->admin)
            ->post("/admin/anggota/{$this->user->id}/minta-revisi", [
                'sections' => ['Langkah 3: Profil Usaha & Legalitas', 'Langkah 7: Lokasi, Foto & Dokumen'],
                'note' => 'Nomor NIB tidak sesuai dengan berkas lampiran. Harap periksa kembali.',
            ]);

        $response->assertRedirect();
        $this->user->refresh();
        $this->application->refresh();

        $this->assertEquals(MembershipStatus::Revision, $this->user->membership_status);
        $this->assertEquals(MembershipStatus::Revision, $this->application->status);
        $this->assertStringContainsString('NIB', $this->application->review_note);

        // Log verifikasi tersimpan
        $this->assertDatabaseHas('member_review_logs', [
            'user_id' => $this->user->id,
            'action' => 'revision',
        ]);
    }

    public function test_reject_member_flow(): void
    {
        $response = $this->actingAs($this->admin)
            ->post("/admin/anggota/{$this->user->id}/tolak", [
                'reason' => 'Data dan izin usaha tidak memenuhi syarat keanggotaan NSA.',
            ]);

        $response->assertRedirect();
        $this->user->refresh();
        $this->application->refresh();

        $this->assertEquals(MembershipStatus::Rejected, $this->user->membership_status);
        $this->assertEquals(MembershipStatus::Rejected, $this->application->status);

        $this->assertDatabaseHas('member_review_logs', [
            'user_id' => $this->user->id,
            'action' => 'rejected',
        ]);
    }

    public function test_unique_member_number_generation_no_collision(): void
    {
        $action = app(ApproveMember::class);

        // Buat 3 user dan setujui berturut-turut
        $user1 = User::factory()->create(['role' => Role::User, 'membership_status' => MembershipStatus::PendingApproval]);
        $user2 = User::factory()->create(['role' => Role::User, 'membership_status' => MembershipStatus::PendingApproval]);
        $user3 = User::factory()->create(['role' => Role::User, 'membership_status' => MembershipStatus::PendingApproval]);

        $action->execute($user1, $this->admin);
        $action->execute($user2, $this->admin);
        $action->execute($user3, $this->admin);

        $user1->refresh();
        $user2->refresh();
        $user3->refresh();

        $year = date('Y');
        $prefix = Brand::shortName().'-'.$year.'-';

        $this->assertEquals($prefix.'00001', $user1->member_number);
        $this->assertEquals($prefix.'00002', $user2->member_number);
        $this->assertEquals($prefix.'00003', $user3->member_number);
    }

    public function test_regular_user_cannot_access_admin_verification_endpoints(): void
    {
        $regularUser = User::factory()->create(['role' => Role::User]);

        // Coba akses list anggota admin
        $this->actingAs($regularUser)
            ->get('/admin/anggota')
            ->assertForbidden();

        // Coba aksi verifikasi awal
        $this->actingAs($regularUser)
            ->post("/admin/anggota/{$this->user->id}/lolos-awal")
            ->assertForbidden();

        // Coba aksi persetujuan
        $this->actingAs($regularUser)
            ->post("/admin/anggota/{$this->user->id}/setujui")
            ->assertForbidden();

        // Coba tolak bukti bayar
        $this->actingAs($regularUser)
            ->post("/admin/anggota/{$this->user->id}/tolak-bukti-bayar", ['reason' => 'Tidak valid'])
            ->assertForbidden();

        // Coba tolak pendaftaran
        $this->actingAs($regularUser)
            ->post("/admin/anggota/{$this->user->id}/tolak", ['reason' => 'Tidak valid'])
            ->assertForbidden();
    }
}
