<?php

namespace Tests\Feature;

use App\Actions\Membership\SubmitMembershipApplication;
use App\Enums\MembershipStatus;
use App\Enums\ProgramCategory;
use App\Models\District;
use App\Models\FishCategory;
use App\Models\MemberApplication;
use App\Models\MemberBusiness;
use App\Models\MemberCommodity;
use App\Models\MemberDocument;
use App\Models\MemberFishActivity;
use App\Models\MemberIdentity;
use App\Models\MemberInvoice;
use App\Models\MemberInvoiceItem;
use App\Models\MemberLegalDocument;
use App\Models\MemberLocation;
use App\Models\MemberNetworkProfile;
use App\Models\MemberPhoto;
use App\Models\MemberProfile;
use App\Models\MemberProgramInterest;
use App\Models\MembershipCategory;
use App\Models\MembershipFeeItem;
use App\Models\MembershipPlan;
use App\Models\MembershipType;
use App\Models\MemberStatement;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Program;
use App\Models\ProgramRegistration;
use App\Models\Province;
use App\Models\Regency;
use App\Models\Setting;
use App\Models\User;
use App\Models\Village;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class NsaDatabaseAndStatusTest extends TestCase
{
    use RefreshDatabase;

    public function test_membership_status_enum_cases_labels_and_colors(): void
    {
        $expectedCases = [
            'non_member' => ['Bukan Anggota', 'neutral'],
            'draft' => ['Draft', 'neutral'],
            'pending_review' => ['Menunggu Verifikasi Awal', 'warning'],
            'revision' => ['Perlu Perbaikan', 'sky'],
            'awaiting_payment' => ['Menunggu Pembayaran', 'warning'],
            'pending_approval' => ['Menunggu Persetujuan Akhir', 'info'],
            'approved' => ['Disetujui', 'success'],
            'rejected' => ['Ditolak', 'danger'],
        ];

        $this->assertCount(8, MembershipStatus::cases());

        foreach ($expectedCases as $value => [$label, $color]) {
            $status = MembershipStatus::from($value);
            $this->assertEquals($label, $status->label());
            $this->assertEquals($color, $status->color());
        }
    }

    public function test_program_category_enum_cases_and_labels(): void
    {
        $expected = [
            'pelatihan' => 'Pelatihan',
            'pendampingan' => 'Pendampingan',
            'informasi_pasar' => 'Informasi Pasar',
            'akses_kemitraan' => 'Akses Kemitraan',
            'teknologi_budidaya' => 'Teknologi Budidaya',
            'pengembangan_usaha' => 'Pengembangan Usaha',
        ];

        $this->assertCount(6, ProgramCategory::cases());

        foreach ($expected as $value => $label) {
            $category = ProgramCategory::from($value);
            $this->assertEquals($label, $category->label());
        }
    }

    public function test_setting_switch_controls_submitted_application_status(): void
    {
        Mail::fake();

        $plan = MembershipPlan::create([
            'name' => 'Paket Utama',
            'slug' => 'paket-utama',
            'description' => 'Paket utama NSA',
            'benefits' => ['Akses program', 'KTA resmi'],
            'annual_fee' => 100000,
            'is_active' => true,
        ]);

        // Kasus 1: require_initial_verification = true (default) -> status pending_review
        Setting::set('membership.require_initial_verification', '1');

        $user1 = User::factory()->create();
        $this->fillApplicantData($user1, $plan);

        $submitter = app(SubmitMembershipApplication::class);
        $submitter->execute($user1);

        $user1->refresh();
        $this->assertEquals(MembershipStatus::PendingReview, $user1->membership_status);
        $this->assertEquals(MembershipStatus::PendingReview, $user1->application->status);

        // Kasus 2: require_initial_verification = false -> status awaiting_payment
        Setting::set('membership.require_initial_verification', '0');

        $user2 = User::factory()->create();
        $this->fillApplicantData($user2, $plan);

        $submitter->execute($user2);

        $user2->refresh();
        $this->assertEquals(MembershipStatus::AwaitingPayment, $user2->membership_status);
        $this->assertEquals(MembershipStatus::AwaitingPayment, $user2->application->status);
    }

    public function test_polymorphic_payments_work_for_both_orders_and_invoices(): void
    {
        $user = User::factory()->create();

        // 1. Pembayaran Pesanan Toko (Order)
        $order = Order::create([
            'user_id' => $user->id,
            'code' => 'ORD-TEST-001',
            'status' => 'pending_payment',
            'subtotal' => 150000,
            'shipping_cost' => 20000,
            'total' => 170000,
            'address' => ['street' => 'Jl. Ikan No. 1', 'city' => 'Jakarta'],
        ]);

        $orderPayment = Payment::create([
            'order_id' => $order->id,
            'payable_type' => Order::class,
            'payable_id' => $order->id,
            'amount' => 170000,
            'method' => 'manual_transfer',
            'status' => 'pending',
        ]);

        $this->assertInstanceOf(Order::class, $orderPayment->payable);
        $this->assertEquals($order->id, $orderPayment->payable->id);
        $this->assertEquals($orderPayment->id, $order->fresh()->payment->id);

        // 2. Pembayaran Tagihan Keanggotaan (MemberInvoice)
        $application = MemberApplication::create([
            'user_id' => $user->id,
            'status' => MembershipStatus::AwaitingPayment,
        ]);

        $invoice = MemberInvoice::create([
            'application_id' => $application->id,
            'number' => 'INV-NSA-TEST-001',
            'status' => 'unpaid',
            'total' => 350000,
            'due_at' => now()->addDays(3),
        ]);

        $invoicePayment = Payment::create([
            'order_id' => null,
            'payable_type' => MemberInvoice::class,
            'payable_id' => $invoice->id,
            'amount' => 350000,
            'method' => 'manual_transfer',
            'status' => 'pending',
        ]);

        $this->assertInstanceOf(MemberInvoice::class, $invoicePayment->payable);
        $this->assertEquals($invoice->id, $invoicePayment->payable->id);
        $this->assertCount(1, $invoice->fresh()->payments);
        $this->assertEquals($invoicePayment->id, $invoice->fresh()->latestPayment->id);
    }

    public function test_nsa_membership_and_program_models_and_relationships(): void
    {
        $user = User::factory()->create();

        // 1. Kategori & Jenis Keanggotaan
        $category = MembershipCategory::create([
            'name' => 'Pembudidaya Air Tawar',
            'slug' => 'pembudidaya-air-tawar',
            'description' => 'Petambak air tawar',
            'is_active' => true,
        ]);

        $type = MembershipType::create([
            'category_id' => $category->id,
            'name' => 'Anggota Biasa Komoditas Nila',
            'slug' => 'anggota-biasa-komoditas-nila',
            'description' => 'Pembudidaya ikan nila',
            'ad_art_rules' => 'Hak suara penuh',
            'is_active' => true,
        ]);

        $this->assertTrue($category->types->contains($type));
        $this->assertEquals($category->id, $type->category->id);

        // 2. MemberApplication dengan Category, Type, dan ApplicantType
        $application = MemberApplication::create([
            'user_id' => $user->id,
            'status' => MembershipStatus::Draft,
            'membership_category' => 'Pembudidaya Air Tawar',
            'applicant_type' => 'individual',
            'membership_type_id' => $type->id,
        ]);

        $this->assertEquals($type->id, $application->membershipType->id);

        // 3. MemberIdentity dengan enkripsi
        $identity = MemberIdentity::create([
            'application_id' => $application->id,
            'user_id' => $user->id,
            'nationality' => 'wni',
            'full_name' => 'Ahmad Bahari',
            'gender' => 'male',
            'birth_place' => 'Surabaya',
            'birth_date' => '1990-05-15',
            'phone' => '08123456789',
            'email' => 'ahmad@example.com',
            'nik' => '3578011505900001',
            'ktp_address' => ['street' => 'Jl. Pesisir No. 5', 'city' => 'Surabaya'],
        ]);

        $this->assertEquals($identity->id, $application->fresh()->identity->id);
        $this->assertEquals('3578011505900001', $identity->fresh()->nik);

        // 4. MemberBusiness (hasMany) dan MemberLegalDocument
        $business = MemberBusiness::create([
            'user_id' => $user->id,
            'application_id' => $application->id,
            'name' => 'Tambak Mina Bahari',
            'institution_name' => 'UD Mina Bahari Mandiri',
            'activity_field' => 'Pembudidayaan Ikan Nila',
            'years_operating' => 5,
            'scale' => 'Mikro/Kecil',
            'is_primary' => true,
        ]);

        $legalDoc = MemberLegalDocument::create([
            'business_id' => $business->id,
            'type' => 'nib',
            'number' => '9120001234567',
            'issued_at' => '2021-01-01',
        ]);

        $this->assertTrue($application->fresh()->businesses->contains($business));
        $this->assertTrue($business->fresh()->legalDocuments->contains($legalDoc));

        // 5. MemberFishActivity
        $fishCat = FishCategory::create([
            'name' => 'Nila Merah',
            'slug' => 'nila-merah',
            'is_active' => true,
        ]);

        $activity = MemberFishActivity::create([
            'application_id' => $application->id,
            'fish_category_id' => $fishCat->id,
            'farming_system' => 'Kolam Terpal Bioflok',
            'pond_count' => 12,
            'production_amount' => 3500.50,
            'production_unit' => 'kg',
            'period' => 'per siklus',
            'seed_need' => '20.000 ekor',
            'feed_need' => '4 ton',
        ]);

        $this->assertTrue($application->fresh()->fishActivities->contains($activity));
        $this->assertEquals($fishCat->id, $activity->fishCategory->id);

        // 6. MemberNetworkProfile
        $network = MemberNetworkProfile::create([
            'application_id' => $application->id,
            'marketing_info' => 'Pasar lokal dan restoran ikan bakar Jawa Timur',
            'distribution_areas' => ['Jawa Timur', 'Jawa Tengah', 'Bali'],
            'supply_needs' => 'Pakan pelet apung kadar protein 32%',
            'cooperation_types' => ['kemitraan_pakan', 'offtaker_panen'],
        ]);

        $this->assertEquals($network->id, $application->fresh()->networkProfile->id);
        $this->assertEquals(['Jawa Timur', 'Jawa Tengah', 'Bali'], $network->fresh()->distribution_areas);

        // 7. MemberProgramInterest
        $interest = MemberProgramInterest::create([
            'application_id' => $application->id,
            'category' => ProgramCategory::TeknologiBudidaya,
            'note' => 'Tertarik sensor telemetri air kolam',
        ]);

        $this->assertTrue($application->fresh()->programInterests->contains($interest));
        $this->assertEquals(ProgramCategory::TeknologiBudidaya, $interest->fresh()->category);

        // 8. MemberLocation dan MemberPhoto
        $location = MemberLocation::create([
            'application_id' => $application->id,
            'kind' => 'activity',
            'address' => 'Desa Tambakrejo Kolam 3',
        ]);

        $photo = MemberPhoto::create([
            'application_id' => $application->id,
            'path' => 'photos/kolam-1.jpg',
            'caption' => 'Foto kolam terpal bioflok',
        ]);

        $this->assertTrue($application->fresh()->locations->contains($location));
        $this->assertTrue($application->fresh()->photos->contains($photo));

        // 9. MembershipFeeItem, MemberInvoice, MemberInvoiceItem
        $feeItem = MembershipFeeItem::create([
            'code' => 'REG_NSA_01',
            'name' => 'Biaya Registrasi NSA',
            'amount' => 100000,
            'type' => 'required',
            'is_active' => true,
        ]);

        $invoice = MemberInvoice::create([
            'application_id' => $application->id,
            'number' => 'INV-NSA-TEST-002',
            'status' => 'unpaid',
            'total' => 100000,
        ]);

        $item = MemberInvoiceItem::create([
            'invoice_id' => $invoice->id,
            'fee_item_id' => $feeItem->id,
            'name_snapshot' => $feeItem->name,
            'amount_snapshot' => 100000,
            'qty' => 1,
        ]);

        $this->assertTrue($application->fresh()->invoices->contains($invoice));
        $this->assertTrue($invoice->fresh()->items->contains($item));

        // 10. Program dan ProgramRegistration
        $program = Program::create([
            'title' => 'Webinar Strategi Pakan Efisien',
            'slug' => 'webinar-strategi-pakan-efisien',
            'category' => ProgramCategory::Pelatihan,
            'summary' => 'Webinar efisiensi FCR akuakultur',
            'status' => 'published',
            'is_public' => true,
        ]);

        $reg = ProgramRegistration::create([
            'program_id' => $program->id,
            'user_id' => $user->id,
            'status' => 'registered',
        ]);

        $this->assertTrue($program->fresh()->registrations->contains($reg));
        $this->assertTrue($user->fresh()->programRegistrations->contains($reg));
    }

    private function fillApplicantData(User $user, MembershipPlan $plan): void
    {
        $user->update([
            'name' => 'Budi Pemohon',
            'phone' => '081234567890',
        ]);

        $province = Province::firstOrCreate(['id' => 32], ['name' => 'JAWA BARAT', 'slug' => 'jawa-barat']);
        $regency = Regency::firstOrCreate(['id' => 3201], ['province_id' => $province->id, 'name' => 'KABUPATEN BOGOR', 'slug' => 'kab-bogor']);
        $district = District::firstOrCreate(['id' => 320101], ['regency_id' => $regency->id, 'name' => 'Cibinong', 'slug' => 'cibinong']);
        $village = Village::firstOrCreate(['id' => 3201012001], ['district_id' => $district->id, 'name' => 'Tengah', 'slug' => 'tengah']);

        MemberProfile::create([
            'user_id' => $user->id,
            'nik' => '3201010101900001',
            'birth_place' => 'Bogor',
            'birth_date' => '1990-01-01',
            'gender' => 'male',
            'address' => 'Jl. Raya Bogor No. 1',
        ]);

        MemberBusiness::create([
            'user_id' => $user->id,
            'name' => 'Mina Sejahtera',
            'owner_name' => 'Budi',
            'nib' => '1234567890123',
            'founded_at' => '2020-01-01',
            'employee_count' => 5,
            'annual_revenue' => '50000000',
            'business_status' => 'active',
            'business_scale' => 'small',
            'province_id' => $province->id,
            'regency_id' => $regency->id,
            'district_id' => $district->id,
            'village_id' => $village->id,
            'address' => 'Jl. Raya Bogor No. 1',
        ]);

        foreach (['ktp', 'nib', 'business_photo'] as $docType) {
            MemberDocument::create([
                'user_id' => $user->id,
                'type' => $docType,
                'path' => "documents/{$user->id}_{$docType}.jpg",
                'original_name' => "{$docType}.jpg",
                'status' => 'pending',
            ]);
        }

        $fishCat = FishCategory::firstOrCreate(
            ['slug' => 'nila'],
            ['name' => 'Ikan Nila', 'is_active' => true]
        );

        MemberCommodity::create([
            'user_id' => $user->id,
            'fish_category_id' => $fishCat->id,
            'cultivation_type' => 'Kolam Terpal',
            'capacity' => 10,
            'unit' => 'ton/tahun',
        ]);

        MemberStatement::create([
            'user_id' => $user->id,
            'city' => 'Bogor',
            'signature_path' => 'signatures/sig.png',
            'agree_data_accurate' => true,
            'agree_ad_art' => true,
            'agree_privacy_policy' => true,
            'signed_at' => now(),
        ]);

        $user->application()->create([
            'status' => MembershipStatus::Draft,
            'membership_plan_id' => $plan->id,
            'join_reason' => 'Ingin berkontribusi dalam perikanan berkelanjutan bersama NSA.',
            'current_step' => 'review-data',
            'completed_steps' => array_values(MemberApplication::STEPS),
        ]);
    }
}
