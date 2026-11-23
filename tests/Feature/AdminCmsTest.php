<?php

namespace Tests\Feature;

use App\Enums\MembershipStatus;
use App\Enums\OrderStatus;
use App\Enums\Role;
use App\Mail\MemberApprovedMail;
use App\Mail\MemberRejectedMail;
use App\Mail\MemberRevisionRequestedMail;
use App\Models\Order;
use App\Models\Province;
use App\Models\Regency;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class AdminCmsTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected User $admin;

    protected User $superadmin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create([
            'role' => Role::User,
            'membership_status' => MembershipStatus::PendingReview,
        ]);

        $this->admin = User::factory()->create([
            'role' => Role::Admin,
        ]);

        $this->superadmin = User::factory()->create([
            'role' => Role::Superadmin,
        ]);
    }

    public function test_regular_user_cannot_access_admin_dashboard(): void
    {
        $response = $this->actingAs($this->user)->get('/admin');

        $response->assertStatus(403);
    }

    public function test_admin_can_access_admin_dashboard(): void
    {
        $response = $this->actingAs($this->admin)->get('/admin');

        $response->assertStatus(200);
    }

    public function test_admin_cannot_access_superadmin_menus(): void
    {
        // 1. Kelola Admin
        $res1 = $this->actingAs($this->admin)->get('/admin/kelola-admin');
        $res1->assertStatus(403);

        // 2. Pengaturan Situs
        $res2 = $this->actingAs($this->admin)->get('/admin/pengaturan');
        $res2->assertStatus(403);

        // 3. Log Aktivitas
        $res3 = $this->actingAs($this->admin)->get('/admin/log-aktivitas');
        $res3->assertStatus(403);
    }

    public function test_superadmin_can_access_superadmin_menus(): void
    {
        $res1 = $this->actingAs($this->superadmin)->get('/admin/kelola-admin');
        $res1->assertStatus(200);

        $res2 = $this->actingAs($this->superadmin)->get('/admin/pengaturan');
        $res2->assertStatus(200);

        $res3 = $this->actingAs($this->superadmin)->get('/admin/log-aktivitas');
        $res3->assertStatus(200);
    }

    public function test_admin_can_approve_member_generates_member_number_and_records_logs(): void
    {
        Mail::fake();

        $this->assertEquals(MembershipStatus::PendingReview, $this->user->membership_status);
        $this->assertNull($this->user->member_number);

        $response = $this->actingAs($this->admin)
            ->post("/admin/anggota/{$this->user->id}/setujui", [
                'note' => 'Dokumen lengkap dan valid.',
            ]);

        $response->assertRedirect();

        $this->user->refresh();
        $this->assertEquals(MembershipStatus::Approved, $this->user->membership_status);
        $this->assertNotNull($this->user->member_number);
        $this->assertStringStartsWith('NSA-', $this->user->member_number);

        // Member review log tercatat
        $this->assertDatabaseHas('member_review_logs', [
            'user_id' => $this->user->id,
            'admin_id' => $this->admin->id,
            'action' => 'approved',
            'note' => 'Dokumen lengkap dan valid.',
        ]);

        // Activity log tercatat
        $this->assertDatabaseHas('activity_logs', [
            'user_id' => $this->admin->id,
            'action' => 'approve_member',
        ]);

        // Email konfirmasi terkirim
        Mail::assertSent(MemberApprovedMail::class, function ($mail) {
            return $mail->hasTo($this->user->email);
        });
    }

    public function test_admin_can_request_member_revision_and_records_logs(): void
    {
        Mail::fake();

        $response = $this->actingAs($this->admin)
            ->post("/admin/anggota/{$this->user->id}/minta-revisi", [
                'notes' => [
                    'Dokumen' => 'KTP tidak terbaca jelas',
                    'Data Usaha' => 'NIB perlu diperbarui',
                ],
            ]);

        $response->assertRedirect();

        $this->user->refresh();
        $this->assertEquals(MembershipStatus::Revision, $this->user->membership_status);

        $this->assertDatabaseHas('member_review_logs', [
            'user_id' => $this->user->id,
            'admin_id' => $this->admin->id,
            'action' => 'revision',
        ]);

        $this->assertDatabaseHas('activity_logs', [
            'user_id' => $this->admin->id,
            'action' => 'request_revision',
        ]);

        Mail::assertSent(MemberRevisionRequestedMail::class, function ($mail) {
            return $mail->hasTo($this->user->email);
        });
    }

    public function test_admin_can_reject_member_with_mandatory_reason_and_records_logs(): void
    {
        Mail::fake();

        // Alasan kosong harus gagal
        $failResponse = $this->actingAs($this->admin)
            ->post("/admin/anggota/{$this->user->id}/tolak", [
                'reason' => '',
            ]);
        $failResponse->assertSessionHasErrors('reason');

        // Alasan valid
        $response = $this->actingAs($this->admin)
            ->post("/admin/anggota/{$this->user->id}/tolak", [
                'reason' => 'Data usaha tidak dapat diverifikasi oleh instansi terkait.',
            ]);

        $response->assertRedirect();

        $this->user->refresh();
        $this->assertEquals(MembershipStatus::Rejected, $this->user->membership_status);

        $this->assertDatabaseHas('member_review_logs', [
            'user_id' => $this->user->id,
            'admin_id' => $this->admin->id,
            'action' => 'rejected',
            'note' => 'Data usaha tidak dapat diverifikasi oleh instansi terkait.',
        ]);

        $this->assertDatabaseHas('activity_logs', [
            'user_id' => $this->admin->id,
            'action' => 'reject_member',
        ]);

        Mail::assertSent(MemberRejectedMail::class, function ($mail) {
            return $mail->hasTo($this->user->email);
        });
    }

    public function test_member_and_order_csv_export_returns_stream(): void
    {
        Province::create(['id' => 32, 'name' => 'Jawa Barat', 'slug' => 'jawa-barat']);

        // Member CSV
        $resMembers = $this->actingAs($this->admin)->get('/admin/anggota/ekspor-csv');
        $resMembers->assertStatus(200);
        $resMembers->assertHeader('Content-Type', 'text/csv; charset=UTF-8');

        // Order CSV
        Order::create([
            'user_id' => $this->user->id,
            'code' => 'ORD-TEST-001',
            'status' => OrderStatus::Paid,
            'subtotal' => 200000,
            'shipping_cost' => 15000,
            'total' => 215000,
            'address' => ['recipient_name' => 'Budi'],
        ]);

        $resOrders = $this->actingAs($this->admin)->get('/admin/pesanan/ekspor-csv');
        $resOrders->assertStatus(200);
        $resOrders->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
    }

    public function test_admin_can_access_member_verification_list_and_details(): void
    {
        $province = Province::create(['id' => 32, 'name' => 'Jawa Barat', 'slug' => 'jawa-barat']);
        $regency = Regency::create(['id' => 3201, 'province_id' => 32, 'name' => 'Kabupaten Bogor', 'slug' => 'kabupaten-bogor']);

        $this->user->profile()->create([
            'nik' => '3201011204850001',
            'birth_place' => 'Bogor',
            'birth_date' => '1985-04-12',
            'gender' => 'male',
            'address' => 'Jl. Mina Bahari No. 12',
        ]);

        $this->user->business()->create([
            'name' => 'Mina Sejahtera Aquaculture',
            'membership_type' => 'Pembudidaya',
            'province_id' => $province->id,
            'regency_id' => $regency->id,
            'nib' => '9120001234567',
        ]);

        // 1. Akses halaman verifikasi anggota (index)
        $response = $this->actingAs($this->admin)->get('/admin/anggota');
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Members/Index')
            ->has('filters.sort')
            ->where('filters.sort', 'newest')
            ->has('members.data', 1)
            ->where('members.data.0.name', $this->user->name)
            ->where('members.data.0.business_name', 'Mina Sejahtera Aquaculture')
            ->where('members.data.0.province', 'Jawa Barat')
            ->where('members.data.0.regency', 'Kabupaten Bogor')
        );

        // 2. Filter pencarian berdasarkan nama usaha
        $searchResponse = $this->actingAs($this->admin)->get('/admin/anggota?search=Mina+Sejahtera');
        $searchResponse->assertStatus(200);
        $searchResponse->assertInertia(fn ($page) => $page
            ->has('members.data', 1)
        );

        // 3. Filter berdasarkan wilayah (provinsi & kabupaten)
        $filterWilayahResponse = $this->actingAs($this->admin)->get("/admin/anggota?province_id={$province->id}&regency_id={$regency->id}");
        $filterWilayahResponse->assertStatus(200);
        $filterWilayahResponse->assertInertia(fn ($page) => $page
            ->has('members.data', 1)
        );

        // 4. Akses halaman detail verifikasi anggota (show)
        $showResponse = $this->actingAs($this->admin)->get("/admin/anggota/{$this->user->id}");
        $showResponse->assertStatus(200);
        $showResponse->assertInertia(fn ($page) => $page
            ->component('Admin/Members/Show')
            ->where('member.id', $this->user->id)
            ->where('member.name', $this->user->name)
        );
    }

    public function test_admin_and_superadmin_can_access_dashboard_and_return_to_public_home(): void
    {
        // 1. Admin dapat mengakses dasbor admin dan website publik
        $adminDashboard = $this->actingAs($this->admin)->get('/admin');
        $adminDashboard->assertStatus(200);

        $adminHome = $this->actingAs($this->admin)->get('/');
        $adminHome->assertStatus(200);

        // 2. Superadmin dapat mengakses dasbor admin dan website publik
        $superadminDashboard = $this->actingAs($this->superadmin)->get('/admin');
        $superadminDashboard->assertStatus(200);

        $superadminHome = $this->actingAs($this->superadmin)->get('/');
        $superadminHome->assertStatus(200);
    }

    public function test_admin_can_open_post_form_and_create_article(): void
    {
        $createPage = $this->actingAs($this->admin)->get('/admin/pos/create');
        $createPage->assertStatus(200);
        $createPage->assertInertia(fn ($page) => $page
            ->component('Admin/Posts/Form')
            ->where('post', null)
        );

        $storeResponse = $this->actingAs($this->admin)->post('/admin/pos', [
            'title' => 'Panduan Kualitas Air Kolam Budidaya',
            'type' => 'article',
            'excerpt' => 'Ringkasan panduan menjaga kualitas air kolam bagi pembudidaya pemula.',
            'body' => '<p>Menjaga suhu dan pH air kolam sangat penting bagi kesehatan ikan.</p><h2>Parameter Utama</h2><p>Periksa kadar oksigen terlarut setiap pagi.</p>',
            'status' => 'published',
        ]);

        $storeResponse->assertRedirect(route('admin.posts.index'));
        $this->assertDatabaseHas('posts', [
            'title' => 'Panduan Kualitas Air Kolam Budidaya',
            'type' => 'article',
            'status' => 'published',
        ]);
    }
}
