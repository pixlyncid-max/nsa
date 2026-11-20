<?php

namespace Tests\Feature;

use App\Enums\MembershipStatus;
use App\Enums\Role;
use App\Models\District;
use App\Models\FishCategory;
use App\Models\MembershipCategory;
use App\Models\MembershipFeeItem;
use App\Models\MembershipType;
use App\Models\Province;
use App\Models\Regency;
use App\Models\Setting;
use App\Models\User;
use App\Models\Village;
use App\Services\StatisticService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class EndToEndMembershipJourneyTest extends TestCase
{
    use RefreshDatabase;

    protected Province $province;

    protected Regency $regency;

    protected District $district;

    protected Village $village;

    protected FishCategory $fishCat;

    protected MembershipCategory $category;

    protected MembershipType $type;

    protected MembershipFeeItem $feeItem;

    protected User $admin;

    protected User $superadmin;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('private');
        Storage::fake('public');

        $this->province = Province::firstOrCreate(
            ['id' => 32],
            ['name' => 'Jawa Barat', 'slug' => 'jawa-barat']
        );
        $this->regency = Regency::firstOrCreate(
            ['id' => 3201],
            ['province_id' => 32, 'name' => 'Kabupaten Bogor', 'slug' => 'kabupaten-bogor']
        );
        $this->district = District::firstOrCreate(
            ['id' => 320101],
            ['regency_id' => 3201, 'name' => 'Cibinong', 'slug' => 'cibinong']
        );
        $this->village = Village::firstOrCreate(
            ['id' => 32010101],
            ['district_id' => 320101, 'name' => 'Cirimekar', 'postal_code' => '16911']
        );

        $this->fishCat = FishCategory::firstOrCreate(
            ['slug' => 'ikan-nila'],
            ['name' => 'Ikan Nila', 'order' => 1, 'is_active' => true]
        );

        $this->category = MembershipCategory::firstOrCreate(
            ['slug' => 'pembudidaya'],
            ['name' => 'Pembudidaya Ikan', 'is_active' => true]
        );

        $this->type = MembershipType::firstOrCreate(
            ['slug' => 'anggota-biasa'],
            [
                'category_id' => $this->category->id,
                'name' => 'Anggota Biasa (Pembudidaya)',
                'is_active' => true,
            ]
        );

        $this->feeItem = MembershipFeeItem::firstOrCreate(
            ['code' => 'registration_fee'],
            [
                'name' => 'Uang Pangkal & Pendaftaran',
                'amount' => 150000,
                'type' => 'one_time',
                'is_active' => true,
                'order' => 1,
            ]
        );

        $this->admin = User::factory()->create([
            'role' => Role::Admin,
            'membership_status' => MembershipStatus::Approved,
        ]);

        $this->superadmin = User::factory()->create([
            'role' => Role::Superadmin,
            'membership_status' => MembershipStatus::Approved,
        ]);

        Setting::set('membership.require_initial_verification', true);
        Setting::set('membership.require_ktp_for_wni', true);
    }

    public function test_complete_end_to_end_membership_journey(): void
    {
        // 1. Sign Up User Baru
        $registerRes = $this->post('/register', [
            'name' => 'Budi Santoso',
            'email' => 'budi.santoso@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
        ]);

        $registerRes->assertRedirect('/');
        $registerRes->assertSessionHas('success');
        $this->assertAuthenticated();

        $user = User::where('email', 'budi.santoso@example.com')->first();
        $this->assertNotNull($user);
        $this->assertEquals(Role::User, $user->role);
        $this->assertEquals(MembershipStatus::NonMember, $user->membership_status);

        // 2. Akses Dashboard Sederhana (/akun) & Coba Akses /anggota
        $accountDash = $this->actingAs($user)->get('/akun');
        $accountDash->assertStatus(200);

        // Non-approved member tidak boleh masuk /anggota
        $forbiddenMemberDash = $this->actingAs($user)->get('/anggota');
        $forbiddenMemberDash->assertRedirect('/akun');

        // 3. Masuk ke Formulir Pendaftaran 9 Langkah (diarahkan ke langkah pertama yang aktif)
        $wizardInit = $this->actingAs($user)->get('/akun/keanggotaan/daftar');
        $wizardInit->assertRedirect('/akun/keanggotaan/daftar/identitas');

        $step1Page = $this->actingAs($user)->get('/akun/keanggotaan/daftar/identitas');
        $step1Page->assertStatus(200);

        // LANGKAH 1: Identitas Calon Anggota (WNI dengan NIK)
        $step1Res = $this->actingAs($user)->postJson('/akun/keanggotaan/daftar/identitas', [
            'nationality' => 'wni',
            'full_name' => 'Budi Santoso',
            'gender' => 'male',
            'birth_place' => 'Bogor',
            'birth_date' => '1990-05-15',
            'phone' => '081234567890',
            'email' => 'budi.santoso@example.com',
            'nik' => '3201011505900001',
            'address' => 'Jl. Mina Bahari No. 12',
            'province_id' => $this->province->id,
            'regency_id' => $this->regency->id,
            'district_id' => $this->district->id,
            'village_id' => $this->village->id,
            'postal_code' => '16911',
        ]);
        $step1Res->assertStatus(200);

        // LANGKAH 2: Kategori & Jenis
        $step2Res = $this->actingAs($user)->postJson('/akun/keanggotaan/daftar/kategori-keanggotaan', [
            'membership_category' => 'pembudidaya',
            'membership_type_id' => $this->type->id,
            'applicant_type' => 'individual',
        ]);
        $step2Res->assertStatus(200);

        // LANGKAH 3: Profil Pekerjaan / Usaha
        $step3Res = $this->actingAs($user)->postJson('/akun/keanggotaan/daftar/profil-usaha', [
            'has_no_business' => false,
            'name' => 'Mina Barokah Aquaculture',
            'activity_field' => 'Budidaya Air Tawar',
            'years_operating' => 4,
            'scale' => 'Kecil',
            'legal_documents' => [
                [
                    'type' => 'nib',
                    'number' => '1234567890123',
                ],
            ],
        ]);
        $step3Res->assertStatus(200);

        // LANGKAH 4: Aktivitas Perikanan (Config-driven)
        $step4Res = $this->actingAs($user)->postJson('/akun/keanggotaan/daftar/aktivitas-perikanan', [
            'fish_activities' => [
                [
                    'fish_category_id' => $this->fishCat->id,
                    'farming_system' => 'Bioflok',
                    'pond_count' => 8,
                    'production_amount' => 1500,
                    'production_unit' => 'kg',
                    'period' => 'per siklus',
                    'seed_need' => '20000 ekor',
                    'feed_need' => '1.5 ton',
                ],
            ],
        ]);
        $step4Res->assertStatus(200);

        // LANGKAH 5: Jaringan Bisnis & Rantai Pasok
        $step5Res = $this->actingAs($user)->postJson('/akun/keanggotaan/daftar/jaringan-bisnis', [
            'feed_source' => 'Pabrikan komersial',
            'feed_brand' => 'Super Feed NSA',
            'seed_source' => 'Balai Benih Ikan Mandiri',
            'buyer_types' => ['Pasar Tradisional', 'Restoran Lokal'],
            'marketing_reach' => 'Provinsi Sendiri',
        ]);
        $step5Res->assertStatus(200);

        // LANGKAH 6: Minat Program NSA
        $step6Res = $this->actingAs($user)->postJson('/akun/keanggotaan/daftar/minat-program', [
            'interests' => [
                'pelatihan',
                'teknologi_budidaya',
            ],
            'note' => 'Tertarik riset formulasi pakan lokal',
        ]);
        $step6Res->assertStatus(200);

        // LANGKAH 7: Lokasi, Foto & Dokumen (KTP & NIB)
        $ktpFile = UploadedFile::fake()->create('ktp_budi.jpg', 400, 'image/jpeg');
        $nibFile = UploadedFile::fake()->create('nib_budi.pdf', 800, 'application/pdf');

        $this->actingAs($user)->post('/akun/keanggotaan/dokumen', [
            'type' => 'ktp',
            'file' => $ktpFile,
        ]);
        $this->actingAs($user)->post('/akun/keanggotaan/dokumen', [
            'type' => 'nib',
            'file' => $nibFile,
        ]);

        $step7Res = $this->actingAs($user)->postJson('/akun/keanggotaan/daftar/lokasi-dokumen', [
            'domicile' => [
                'province_id' => $this->province->id,
                'regency_id' => $this->regency->id,
                'district_id' => $this->district->id,
                'village_id' => $this->village->id,
                'postal_code' => '16911',
                'address' => 'Jl. Mina Bahari No. 12',
            ],
            'is_business_address_different' => false,
            'activity_locations' => [
                [
                    'latitude' => -6.4851234,
                    'longitude' => 106.8423456,
                    'label' => 'Kolam Utama',
                ],
            ],
        ]);
        $step7Res->assertStatus(200);

        // LANGKAH 8: Paket Administrasi & Invoice Draf
        $step8Res = $this->actingAs($user)->postJson('/akun/keanggotaan/daftar/paket-administrasi', [
            'items' => [
                [
                    'fee_item_id' => $this->feeItem->id,
                    'selected' => true,
                    'qty' => 1,
                ],
            ],
        ]);
        $step8Res->assertStatus(200);

        // LANGKAH 9: Pemeriksaan Akhir & Kirim Pendaftaran
        $submitRes = $this->actingAs($user)->postJson('/akun/keanggotaan/daftar/kirim', [
            'agree_terms' => true,
            'agree_privacy' => true,
        ]);
        $submitRes->assertStatus(200);

        // Status setelah kirim dengan verifikasi awal aktif -> pending_review
        $user->refresh();
        $this->assertEquals(MembershipStatus::PendingReview, $user->membership_status);

        // 4. Verifikasi Awal oleh Admin di CMS
        $adminViewQueue = $this->actingAs($this->admin)->get('/admin/anggota?tab=verifikasi_awal');
        $adminViewQueue->assertStatus(200);

        $passReviewRes = $this->actingAs($this->admin)->post("/admin/anggota/{$user->id}/lolos-awal", [
            'notes' => 'Dokumen identitas dan perizinan NIB valid sesuai standar.',
        ]);
        $passReviewRes->assertRedirect();

        // Status berpindah ke awaiting_payment
        $user->refresh();
        $this->assertEquals(MembershipStatus::AwaitingPayment, $user->membership_status);

        // 5. User Mengunggah Bukti Pembayaran
        $proofFile = UploadedFile::fake()->create('bukti_transfer.jpg', 500, 'image/jpeg');
        $uploadProofRes = $this->actingAs($user)->post('/akun/keanggotaan/bukti-bayar', [
            'proof' => $proofFile,
            'payment_date' => now()->format('Y-m-d'),
            'sender_name' => 'Budi Santoso',
            'sender_bank' => 'Bank BCA',
        ]);
        $uploadProofRes->assertRedirect();

        // Status menjadi pending_approval
        $user->refresh();
        $this->assertEquals(MembershipStatus::PendingApproval, $user->membership_status);

        // 6. Admin Menyetujui Pendaftaran Anggota (Final Approval)
        $approveRes = $this->actingAs($this->admin)->post("/admin/anggota/{$user->id}/setujui");
        $approveRes->assertRedirect();

        $user->refresh();
        $this->assertEquals(MembershipStatus::Approved, $user->membership_status);
        $this->assertNotNull($user->member_number);
        $this->assertStringStartsWith('NSA-', $user->member_number);
        $this->assertNotNull($user->verification_token);

        // 7. Pengguna Approved Membuka Dashboard Membership (/anggota)
        $memberDashboard = $this->actingAs($user)->get('/anggota');
        $memberDashboard->assertStatus(200);

        $memberProfile = $this->actingAs($user)->get('/anggota/profil');
        $memberProfile->assertStatus(200);

        $memberCard = $this->actingAs($user)->get('/anggota/kartu');
        $memberCard->assertStatus(200);

        $memberBusiness = $this->actingAs($user)->get('/anggota/usaha');
        $memberBusiness->assertStatus(200);

        $memberPrograms = $this->actingAs($user)->get('/anggota/program');
        $memberPrograms->assertStatus(200);

        $memberInvoices = $this->actingAs($user)->get('/anggota/iuran');
        $memberInvoices->assertStatus(200);

        // Halaman Verifikasi Publik untuk QR Code KTA
        $publicVerify = $this->get("/verifikasi/{$user->verification_token}");
        $publicVerify->assertStatus(200);

        // 8. Statistik Beranda Teragregasi & Cache Bersih
        $statisticService = app(StatisticService::class);
        $homeStats = $statisticService->getHomeData();
        $this->assertIsArray($homeStats);
        $this->assertGreaterThan(0, $homeStats['summaryStats']['total_members']);

        // 9. Akses CMS Master Keanggotaan & Pengaturan
        $adminCategories = $this->actingAs($this->admin)->get('/admin/master-keanggotaan/kategori');
        $adminCategories->assertStatus(200);

        $adminTypes = $this->actingAs($this->admin)->get('/admin/master-keanggotaan/jenis');
        $adminTypes->assertStatus(200);

        // Admin biasa tidak boleh kelola biaya & pengaturan (403)
        $adminFeesForbidden = $this->actingAs($this->admin)->get('/admin/master-keanggotaan/biaya');
        $adminFeesForbidden->assertStatus(403);

        $adminSettingsForbidden = $this->actingAs($this->admin)->get('/admin/pengaturan');
        $adminSettingsForbidden->assertStatus(403);

        // Superadmin boleh kelola biaya & pengaturan
        $superadminFees = $this->actingAs($this->superadmin)->get('/admin/master-keanggotaan/biaya');
        $superadminFees->assertStatus(200);

        $superadminSettings = $this->actingAs($this->superadmin)->get('/admin/pengaturan');
        $superadminSettings->assertStatus(200);
    }
}
