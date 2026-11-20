<?php

namespace Tests\Feature;

use App\Enums\MembershipStatus;
use App\Enums\ProgramCategory;
use App\Enums\Role;
use App\Models\MemberApplication;
use App\Models\MemberBusiness;
use App\Models\MemberIdentity;
use App\Models\MembershipCategory;
use App\Models\MembershipType;
use App\Models\Post;
use App\Models\Program;
use App\Models\Province;
use App\Models\Regency;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class MemberDashboardTest extends TestCase
{
    use RefreshDatabase;

    protected User $approvedMember;

    protected User $regularUser;

    protected Province $province;

    protected Regency $regency;

    protected Program $program;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('public');
        Storage::fake('private');

        $this->province = Province::firstOrCreate(
            ['id' => 32],
            ['name' => 'Jawa Barat', 'slug' => 'jawa-barat']
        );

        $this->regency = Regency::firstOrCreate(
            ['id' => 3201],
            ['province_id' => 32, 'name' => 'Kabupaten Bogor', 'slug' => 'kabupaten-bogor']
        );

        $category = MembershipCategory::firstOrCreate(
            ['slug' => 'pembudidaya'],
            ['name' => 'Pembudidaya Ikan', 'is_active' => true]
        );

        $membershipType = MembershipType::firstOrCreate(
            ['slug' => 'anggota-biasa'],
            ['category_id' => $category->id, 'name' => 'Anggota Biasa', 'is_active' => true]
        );

        $this->approvedMember = User::factory()->create([
            'role' => Role::User,
            'membership_status' => MembershipStatus::Approved,
            'member_number' => 'NSA-2026-00088',
            'name' => 'Dharma Budidaya',
            'email' => 'dharma@example.com',
            'phone' => '08123456789',
        ]);

        $app = MemberApplication::create([
            'user_id' => $this->approvedMember->id,
            'status' => MembershipStatus::Approved,
            'membership_category' => 'pembudidaya',
            'membership_type_id' => $membershipType->id,
            'approved_at' => now(),
        ]);

        MemberIdentity::create([
            'application_id' => $app->id,
            'user_id' => $this->approvedMember->id,
            'nationality' => 'wni',
            'full_name' => $this->approvedMember->name,
            'nik' => '3201011505900001',
            'phone' => '08123456789',
            'email' => $this->approvedMember->email,
        ]);

        MemberBusiness::create([
            'user_id' => $this->approvedMember->id,
            'application_id' => $app->id,
            'name' => 'Tambak Vannamei Dharma',
            'activity_field' => 'Budidaya Udang',
            'scale' => 'Menengah',
            'years_operating' => 4,
            'province_id' => $this->province->id,
            'regency_id' => $this->regency->id,
            'is_primary' => true,
        ]);

        $this->regularUser = User::factory()->create([
            'role' => Role::User,
            'membership_status' => MembershipStatus::NonMember,
        ]);

        $this->program = Program::create([
            'title' => 'Pelatihan Biosecurity Tambak Udang',
            'slug' => 'pelatihan-biosecurity-tambak-udang',
            'category' => ProgramCategory::Pelatihan,
            'summary' => 'Pelatihan intensif penerapan biosecurity pencegahan virus.',
            'status' => 'published',
            'is_public' => true,
        ]);
    }

    public function test_non_approved_users_cannot_access_member_dashboard(): void
    {
        // 1. Guest diarahkan ke login
        $this->get('/anggota')->assertRedirect('/login');

        // 2. Non-member diarahkan ke /akun dengan flash pesan khusus anggota
        $response = $this->actingAs($this->regularUser)->get('/anggota');
        $response->assertRedirect('/akun');
        $response->assertSessionHas('error', 'Fitur ini khusus anggota');

        // 3. User dalam proses (pending_review) juga tidak boleh masuk
        $pendingUser = User::factory()->create([
            'role' => Role::User,
            'membership_status' => MembershipStatus::PendingReview,
        ]);

        $this->actingAs($pendingUser)
            ->get('/anggota/kartu')
            ->assertRedirect('/akun');
    }

    public function test_approved_member_can_access_all_member_pages(): void
    {
        Post::create([
            'title' => 'Musyawarah Nasional NSA 2026',
            'slug' => 'munas-nsa-2026',
            'excerpt' => 'Pemberitahuan resmi jadwal musyawarah nasional anggota.',
            'body' => 'Isi lengkap surat edaran pengumuman musyawarah nasional.',
            'cover' => 'posts/munas.jpg',
            'status' => 'published',
            'published_at' => now(),
        ]);

        $this->actingAs($this->approvedMember)
            ->get('/anggota')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Member/Dashboard')
                ->has('announcements', 1)
            );

        $this->actingAs($this->approvedMember)
            ->get('/anggota/profil')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Member/ProfileVerification'));

        $this->actingAs($this->approvedMember)
            ->get('/anggota/kartu')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Member/Card'));

        $this->actingAs($this->approvedMember)
            ->get('/anggota/usaha')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Member/BusinessLegal'));

        $this->actingAs($this->approvedMember)
            ->get('/anggota/program')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Member/Programs'));

        $this->actingAs($this->approvedMember)
            ->get('/anggota/iuran')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Member/Invoices'));

        $this->actingAs($this->approvedMember)
            ->get('/anggota/pengaturan')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Member/Settings'));
    }

    public function test_member_card_displays_correct_data(): void
    {
        $response = $this->actingAs($this->approvedMember)->get('/anggota/kartu');

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Member/Card')
            ->where('cardData.name', 'Dharma Budidaya')
            ->where('cardData.member_number', 'NSA-2026-00088')
            ->has('cardData.verification_url')
            ->has('cardData.verification_token')
        );
    }

    public function test_public_verification_page_does_not_leak_personal_data(): void
    {
        $token = $this->approvedMember->ensureVerificationToken();

        $response = $this->get("/verifikasi/{$token}");

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Public/MemberVerification')
            ->where('isValid', true)
            ->where('member.name', 'Dharma Budidaya')
            ->where('member.member_number', 'NSA-2026-00088')
            ->where('member.status', 'Aktif')
            // Data rahasia / pribadi TIDAK boleh ada di payload publik
            ->missing('member.nik')
            ->missing('member.email')
            ->missing('member.phone')
            ->missing('member.ktp_address')
            ->missing('member.password')
        );

        // Verifikasi menggunakan member_number juga didukung
        $byNumber = $this->get("/verifikasi/{$this->approvedMember->member_number}");
        $byNumber->assertOk();

        // Token yang tidak valid
        $invalid = $this->get('/verifikasi/token-palsu-123');
        $invalid->assertOk();
        $invalid->assertInertia(fn (Assert $page) => $page
            ->component('Public/MemberVerification')
            ->where('isValid', false)
            ->where('member', null)
        );
    }

    public function test_member_can_update_basic_profile_and_request_critical_change(): void
    {
        // 1. Update data dasar langsung
        $response = $this->actingAs($this->approvedMember)
            ->post('/anggota/profil', [
                'phone' => '089988776655',
                'birth_place' => 'Surabaya',
                'gender' => 'male',
                'address' => 'Jl. Tambak Modern No. 5',
            ]);

        $response->assertRedirect();
        $this->approvedMember->refresh();
        $this->assertEquals('089988776655', $this->approvedMember->phone);

        // 2. Permohonan perubahan data penting (nama)
        $reqResponse = $this->actingAs($this->approvedMember)
            ->post('/anggota/profil/permohonan-perubahan', [
                'field' => 'name',
                'new_value' => 'Dharma Budidaya Jaya',
                'reason' => 'Penyesuaian ejaan nama sesuai KTP dan Akta Notaris terbaru.',
            ]);

        $reqResponse->assertRedirect();
        $this->assertDatabaseHas('member_change_requests', [
            'user_id' => $this->approvedMember->id,
            'field' => 'name',
            'new_value' => 'Dharma Budidaya Jaya',
            'status' => 'pending',
        ]);
    }

    public function test_member_can_add_business_unit_and_legal_document(): void
    {
        // 1. Tambah unit usaha kedua
        $unitResponse = $this->actingAs($this->approvedMember)
            ->post('/anggota/usaha/unit', [
                'name' => 'Unit Hatchery Benur NSA',
                'activity_field' => 'Pembenihan Udang',
                'scale' => 'Kecil',
                'years_operating' => 2,
                'province_id' => $this->province->id,
                'address' => 'Kawasan Pesisir Karawang',
            ]);

        $unitResponse->assertRedirect();
        $this->assertDatabaseHas('member_businesses', [
            'user_id' => $this->approvedMember->id,
            'name' => 'Unit Hatchery Benur NSA',
        ]);

        $newUnit = MemberBusiness::where('user_id', $this->approvedMember->id)
            ->where('name', 'Unit Hatchery Benur NSA')
            ->first();

        // 2. Tambah izin legalitas ke unit usaha tersebut
        $file = UploadedFile::fake()->create('cbib.pdf', 300, 'application/pdf');

        $docResponse = $this->actingAs($this->approvedMember)
            ->post('/anggota/usaha/izin', [
                'business_id' => $newUnit->id,
                'type' => 'cbib',
                'number' => 'CBIB-2026-999',
                'label' => 'Sertifikat CBIB Udang',
                'expires_at' => now()->addDays(30)->format('Y-m-d'), // segera berakhir (< 60 hari)
                'file' => $file,
            ]);

        $docResponse->assertRedirect();
        $this->assertDatabaseHas('member_legal_documents', [
            'business_id' => $newUnit->id,
            'number' => 'CBIB-2026-999',
        ]);

        // 3. Permintaan pendampingan
        $mentorResponse = $this->actingAs($this->approvedMember)
            ->post('/anggota/usaha/pendampingan', [
                'business_id' => $newUnit->id,
                'topic' => 'Pendampingan Sertifikasi CBIB',
                'description' => 'Membutuhkan bimbingan teknis auditor kelayakan biosecurity air kolam.',
            ]);

        $mentorResponse->assertRedirect();
        $this->assertDatabaseHas('mentorship_requests', [
            'user_id' => $this->approvedMember->id,
            'topic' => 'Pendampingan Sertifikasi CBIB',
            'status' => 'submitted',
        ]);
    }

    public function test_member_can_register_and_cancel_program(): void
    {
        // 1. Daftar program
        $response = $this->actingAs($this->approvedMember)
            ->post("/anggota/program/{$this->program->id}/daftar");

        $response->assertRedirect();
        $this->assertDatabaseHas('program_registrations', [
            'user_id' => $this->approvedMember->id,
            'program_id' => $this->program->id,
            'status' => 'registered',
        ]);

        // 2. Batalkan keikutsertaan
        $cancel = $this->actingAs($this->approvedMember)
            ->delete("/anggota/program/{$this->program->id}/batal");

        $cancel->assertRedirect();
        $this->assertDatabaseMissing('program_registrations', [
            'user_id' => $this->approvedMember->id,
            'program_id' => $this->program->id,
        ]);
    }
}
