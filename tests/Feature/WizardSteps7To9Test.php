<?php

namespace Tests\Feature;

use App\Enums\MembershipStatus;
use App\Enums\ProgramCategory;
use App\Enums\Role;
use App\Mail\AdminNewMembershipNotification;
use App\Mail\MembershipApplicationSubmitted;
use App\Models\District;
use App\Models\MemberApplication;
use App\Models\MemberDocument;
use App\Models\MemberInvoice;
use App\Models\MemberLocation;
use App\Models\MembershipCategory;
use App\Models\MembershipFeeItem;
use App\Models\MembershipType;
use App\Models\Province;
use App\Models\Regency;
use App\Models\Setting;
use App\Models\User;
use App\Models\Village;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class WizardSteps7To9Test extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected Province $province;

    protected Regency $regency;

    protected District $district;

    protected Village $village;

    protected MembershipCategory $category;

    protected MembershipType $membershipType;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('public');
        Storage::fake('private');

        $this->user = User::factory()->create([
            'role' => Role::User,
            'membership_status' => MembershipStatus::Draft,
        ]);

        $this->province = Province::firstOrCreate(
            ['id' => 32],
            ['name' => 'Jawa Barat', 'slug' => 'jawa-barat']
        );

        $this->regency = Regency::firstOrCreate(
            ['id' => 3201],
            ['province_id' => $this->province->id, 'name' => 'Bogor', 'slug' => 'bogor']
        );

        $this->district = District::firstOrCreate(
            ['id' => 320101],
            ['regency_id' => $this->regency->id, 'name' => 'Cibinong']
        );

        $this->village = Village::firstOrCreate(
            ['id' => 32010101],
            ['district_id' => $this->district->id, 'name' => 'Cirimekar']
        );

        $this->category = MembershipCategory::firstOrCreate(
            ['slug' => 'pembudidaya'],
            ['name' => 'Pembudidaya Ikan', 'is_active' => true]
        );

        $this->membershipType = MembershipType::firstOrCreate(
            ['slug' => 'anggota-biasa'],
            ['category_id' => $this->category->id, 'name' => 'Anggota Biasa', 'is_active' => true]
        );

        // Seed fee items jika belum ada
        MembershipFeeItem::firstOrCreate(
            ['code' => 'REG_FEE'],
            ['name' => 'Biaya Registrasi', 'amount' => 100000, 'type' => 'required', 'is_active' => true, 'order' => 1]
        );
        MembershipFeeItem::firstOrCreate(
            ['code' => 'KTA_CARD'],
            ['name' => 'KTA Fisik', 'amount' => 50000, 'type' => 'required', 'is_active' => true, 'order' => 2]
        );
        MembershipFeeItem::firstOrCreate(
            ['code' => 'ANNUAL_DUES'],
            ['name' => 'Iuran Tahunan', 'amount' => 200000, 'type' => 'recurring', 'is_active' => true, 'order' => 3]
        );
        MembershipFeeItem::firstOrCreate(
            ['code' => 'VEST_OFFICIAL'],
            [
                'name' => 'Rompi Resmi',
                'amount' => 150000,
                'type' => 'optional',
                'has_size_option' => true,
                'size_options' => ['S', 'M', 'L', 'XL', 'XXL'],
                'is_active' => true,
                'order' => 4,
            ]
        );
        MembershipFeeItem::firstOrCreate(
            ['code' => 'SHIRT_OFFICIAL'],
            [
                'name' => 'Kemeja Resmi',
                'amount' => 175000,
                'type' => 'optional',
                'has_size_option' => true,
                'size_options' => ['S', 'M', 'L', 'XL', 'XXL'],
                'is_active' => true,
                'order' => 5,
            ]
        );
    }

    protected function setupFullApplication(User $user, string $nationality = 'wni', bool $hasLegalNib = true): MemberApplication
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
        if ($nationality === 'wni') {
            $app->identity()->updateOrCreate(
                ['application_id' => $app->id],
                [
                    'user_id' => $user->id,
                    'nationality' => 'wni',
                    'full_name' => 'Ahmad Pembudidaya',
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
        } else {
            $app->identity()->updateOrCreate(
                ['application_id' => $app->id],
                [
                    'user_id' => $user->id,
                    'nationality' => 'wna',
                    'full_name' => 'John Aquaculture',
                    'gender' => 'male',
                    'birth_place' => 'Sydney',
                    'birth_date' => '1985-02-20',
                    'phone' => '081298765432',
                    'email' => $user->email,
                    'passport_number' => 'A12345678',
                    'origin_country' => 'Australia',
                    'years_in_indonesia' => 3,
                ]
            );
        }

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

        if ($hasLegalNib) {
            $biz->legalDocuments()->create([
                'type' => 'nib',
                'number' => '1234567890123',
                'label' => 'NIB OSS',
            ]);
        }

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

        // Langkah 7: Lokasi Domisili
        $app->locations()->create([
            'kind' => 'domicile',
            'province_id' => $this->province->id,
            'regency_id' => $this->regency->id,
            'district_id' => $this->district->id,
            'village_id' => $this->village->id,
            'postal_code' => '16911',
            'address' => 'Jl. Raya Cibinong KM 45',
        ]);

        // Langkah 8: Administrasi Invoice
        $invoice = MemberInvoice::firstOrCreate(
            ['application_id' => $app->id, 'status' => 'unpaid'],
            ['number' => 'INV-TEST-'.$app->id, 'total' => 350000]
        );
        $fee1 = MembershipFeeItem::where('code', 'REG_FEE')->first();
        $invoice->items()->create([
            'fee_item_id' => $fee1->id,
            'name_snapshot' => $fee1->name,
            'amount_snapshot' => $fee1->amount,
            'qty' => 1,
        ]);

        return $app;
    }

    public function test_user_can_save_step_7_location_domicile_and_activity_points(): void
    {
        $app = $this->user->application()->firstOrCreate(
            ['user_id' => $this->user->id],
            ['status' => MembershipStatus::Draft, 'current_step' => 'lokasi-dokumen']
        );

        $payload = [
            'domicile' => [
                'province_id' => $this->province->id,
                'regency_id' => $this->regency->id,
                'district_id' => $this->district->id,
                'village_id' => $this->village->id,
                'postal_code' => '16120',
                'address' => 'Jl. Pajajaran No. 25, Bogor',
            ],
            'is_business_address_different' => false,
            'activity_locations' => [
                ['latitude' => -6.5950, 'longitude' => 106.8166, 'label' => 'Kolam Utama'],
                ['latitude' => -6.5980, 'longitude' => 106.8200, 'label' => 'Hatchery'],
            ],
        ];

        $response = $this->actingAs($this->user)
            ->patch(route('account.membership.saveStep', ['slug' => 'lokasi-dokumen']), $payload);

        $response->assertSessionHasNoErrors();
        $this->assertDatabaseHas('member_locations', [
            'application_id' => $app->id,
            'kind' => 'domicile',
            'province_id' => $this->province->id,
            'regency_id' => $this->regency->id,
            'postal_code' => '16120',
        ]);

        $this->assertDatabaseCount('member_locations', 4); // 1 domicile, 1 business (synced), 2 activities
        $activityCount = MemberLocation::where('application_id', $app->id)->where('kind', 'activity')->count();
        $this->assertEquals(2, $activityCount);
    }

    public function test_user_can_save_step_7_with_different_business_address(): void
    {
        $app = $this->user->application()->firstOrCreate(
            ['user_id' => $this->user->id],
            ['status' => MembershipStatus::Draft, 'current_step' => 'lokasi-dokumen']
        );

        $payload = [
            'domicile' => [
                'province_id' => $this->province->id,
                'regency_id' => $this->regency->id,
                'district_id' => $this->district->id,
                'village_id' => $this->village->id,
                'postal_code' => '16120',
                'address' => 'Jl. Pajajaran No. 25, Domisili',
            ],
            'is_business_address_different' => true,
            'business_address' => [
                'province_id' => $this->province->id,
                'regency_id' => $this->regency->id,
                'district_id' => $this->district->id,
                'village_id' => $this->village->id,
                'postal_code' => '16122',
                'address' => 'Jl. Raya Dramaga KM 8, Lokasi Tambak',
            ],
        ];

        $response = $this->actingAs($this->user)
            ->patch(route('account.membership.saveStep', ['slug' => 'lokasi-dokumen']), $payload);

        $response->assertSessionHasNoErrors();

        $this->assertDatabaseHas('member_locations', [
            'application_id' => $app->id,
            'kind' => 'business',
            'address' => 'Jl. Raya Dramaga KM 8, Lokasi Tambak',
        ]);
    }

    public function test_user_can_upload_and_delete_farm_photos_up_to_5(): void
    {
        $app = $this->user->application()->firstOrCreate(
            ['user_id' => $this->user->id],
            ['status' => MembershipStatus::Draft, 'current_step' => 'lokasi-dokumen']
        );

        $file = UploadedFile::fake()->image('farm1.jpg', 600, 400);

        $response = $this->actingAs($this->user)
            ->postJson(route('account.membership.uploadPhoto'), [
                'photo' => $file,
                'caption' => 'Fasilitas Kolam Bioflok',
            ]);

        $response->assertOk();
        $response->assertJsonPath('success', true);
        $photoId = $response->json('photo.id');

        $this->assertDatabaseHas('member_photos', [
            'id' => $photoId,
            'application_id' => $app->id,
            'caption' => 'Fasilitas Kolam Bioflok',
        ]);

        // Hapus foto
        $deleteResp = $this->actingAs($this->user)
            ->deleteJson(route('account.membership.deletePhoto', ['photo' => $photoId]));

        $deleteResp->assertOk();
        $this->assertDatabaseMissing('member_photos', ['id' => $photoId]);
    }

    public function test_step_8_saves_draft_invoice_with_exact_total_and_fee_items(): void
    {
        $app = $this->user->application()->firstOrCreate(
            ['user_id' => $this->user->id],
            ['status' => MembershipStatus::Draft, 'current_step' => 'paket-administrasi']
        );

        $regFee = MembershipFeeItem::where('code', 'REG_FEE')->first();
        $kta = MembershipFeeItem::where('code', 'KTA_CARD')->first();
        $annual = MembershipFeeItem::where('code', 'ANNUAL_DUES')->first();
        $vest = MembershipFeeItem::where('code', 'VEST_OFFICIAL')->first();
        $shirt = MembershipFeeItem::where('code', 'SHIRT_OFFICIAL')->first();

        $payload = [
            'items' => [
                ['fee_item_id' => $regFee->id, 'selected' => true], // 100,000
                ['fee_item_id' => $kta->id, 'selected' => true],    // 50,000
                ['fee_item_id' => $annual->id, 'selected' => true], // 200,000
                ['fee_item_id' => $vest->id, 'selected' => true, 'size' => 'L', 'qty' => 1], // 150,000
                ['fee_item_id' => $shirt->id, 'selected' => true, 'size' => 'XL', 'qty' => 2], // 175,000 * 2 = 350,000
            ],
        ];

        // Total: 100k + 50k + 200k + 150k + 350k = 850,000
        $response = $this->actingAs($this->user)
            ->patch(route('account.membership.saveStep', ['slug' => 'paket-administrasi']), $payload);

        $response->assertSessionHasNoErrors();

        $invoice = MemberInvoice::where('application_id', $app->id)->first();
        $this->assertNotNull($invoice);
        $this->assertEquals(850000.00, (float) $invoice->total);
        $this->assertCount(5, $invoice->items);

        $shirtItem = $invoice->items()->where('fee_item_id', $shirt->id)->first();
        $this->assertEquals(2, $shirtItem->qty);
        $this->assertEquals('XL', $shirtItem->size);
    }

    public function test_step_9_cannot_submit_without_accepting_terms_and_privacy(): void
    {
        $this->setupFullApplication($this->user);

        // Submit tanpa menyetujui ketentuan & privasi
        $response = $this->actingAs($this->user)
            ->post(route('account.membership.submit'), [
                'agree_terms' => false,
                'agree_privacy' => false,
            ]);

        $response->assertSessionHasErrors(['agree_terms', 'agree_privacy']);
    }

    public function test_submit_enforces_required_documents_based_on_nationality_and_legalities(): void
    {
        // Setup WNI dengan NIB tapi dokumen belum diunggah
        $app = $this->setupFullApplication($this->user, 'wni', true);
        Setting::set('membership.require_ktp_for_wni', '1');

        $response = $this->actingAs($this->user)
            ->post(route('account.membership.submit'), [
                'agree_terms' => true,
                'agree_privacy' => true,
            ]);

        // Harus gagal karena KTP dan NIB belum diunggah
        $response->assertSessionHasErrors(['doc_ktp', 'doc_nib']);

        // Sekarang unggah dokumen KTP dan NIB
        MemberDocument::create([
            'user_id' => $this->user->id,
            'type' => 'ktp',
            'path' => 'documents/test_ktp.jpg',
            'original_name' => 'ktp.jpg',
            'status' => 'pending',
        ]);
        MemberDocument::create([
            'user_id' => $this->user->id,
            'type' => 'nib',
            'path' => 'documents/test_nib.pdf',
            'original_name' => 'nib.pdf',
            'status' => 'pending',
        ]);

        $validResp = $this->actingAs($this->user)
            ->post(route('account.membership.submit'), [
                'agree_terms' => true,
                'agree_privacy' => true,
            ]);

        $validResp->assertSessionHasNoErrors();
    }

    public function test_submit_registration_status_changes_based_on_initial_verification_switch(): void
    {
        Mail::fake();

        // 1. Kasus saklar true: status menjadi pending_review
        Setting::set('membership.require_initial_verification', '1');
        $this->setupFullApplication($this->user, 'wni', false);
        MemberDocument::create([
            'user_id' => $this->user->id,
            'type' => 'ktp',
            'path' => 'documents/test_ktp.jpg',
            'original_name' => 'ktp.jpg',
            'status' => 'pending',
        ]);

        $this->actingAs($this->user)
            ->post(route('account.membership.submit'), [
                'agree_terms' => true,
                'agree_privacy' => true,
            ]);

        $this->user->refresh();
        $this->assertEquals(MembershipStatus::PendingReview, $this->user->membership_status);
        $this->assertEquals(MembershipStatus::PendingReview, $this->user->application->status);

        // 2. Kasus saklar false: status langsung awaiting_payment
        $user2 = User::factory()->create([
            'role' => Role::User,
            'membership_status' => MembershipStatus::Draft,
        ]);
        Setting::set('membership.require_initial_verification', '0');
        $this->setupFullApplication($user2, 'wni', false);
        MemberDocument::create([
            'user_id' => $user2->id,
            'type' => 'ktp',
            'path' => 'documents/test_ktp2.jpg',
            'original_name' => 'ktp2.jpg',
            'status' => 'pending',
        ]);

        $this->actingAs($user2)
            ->post(route('account.membership.submit'), [
                'agree_terms' => true,
                'agree_privacy' => true,
            ]);

        $user2->refresh();
        $this->assertEquals(MembershipStatus::AwaitingPayment, $user2->membership_status);
        $this->assertEquals(MembershipStatus::AwaitingPayment, $user2->application->status);
    }

    public function test_submit_sends_email_notifications_to_applicant_and_admin(): void
    {
        Mail::fake();

        $this->setupFullApplication($this->user, 'wni', false);
        MemberDocument::create([
            'user_id' => $this->user->id,
            'type' => 'ktp',
            'path' => 'documents/test_ktp.jpg',
            'original_name' => 'ktp.jpg',
            'status' => 'pending',
        ]);

        $this->actingAs($this->user)
            ->post(route('account.membership.submit'), [
                'agree_terms' => true,
                'agree_privacy' => true,
            ]);

        Mail::assertSent(MembershipApplicationSubmitted::class, function ($mail) {
            return $mail->hasTo($this->user->email);
        });

        Mail::assertSent(AdminNewMembershipNotification::class);
    }
}
