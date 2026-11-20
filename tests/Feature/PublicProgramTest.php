<?php

namespace Tests\Feature;

use App\Enums\MembershipStatus;
use App\Enums\ProgramCategory;
use App\Enums\Role;
use App\Models\Program;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PublicProgramTest extends TestCase
{
    use RefreshDatabase;

    public function test_tentang_kami_displays_public_published_programs_in_order(): void
    {
        // 1. Program Publik 1 (Order 2)
        Program::create([
            'title' => 'Program B (Order 2)',
            'slug' => 'program-b-order-2',
            'category' => ProgramCategory::Pendampingan,
            'summary' => 'Ringkasan Program B',
            'status' => 'published',
            'is_public' => true,
            'order' => 2,
        ]);

        // 2. Program Publik 2 (Order 1) - Harus muncul pertama
        Program::create([
            'title' => 'Program A (Order 1)',
            'slug' => 'program-a-order-1',
            'category' => ProgramCategory::Pelatihan,
            'summary' => 'Ringkasan Program A',
            'status' => 'published',
            'is_public' => true,
            'order' => 1,
        ]);

        // 3. Program Khusus Anggota (is_public = false) - TIDAK boleh muncul di halaman publik
        Program::create([
            'title' => 'Program Khusus Anggota',
            'slug' => 'program-khusus-anggota',
            'category' => ProgramCategory::AksesKemitraan,
            'summary' => 'Hanya untuk anggota',
            'status' => 'published',
            'is_public' => false,
            'order' => 0,
        ]);

        // 4. Program Draf (status = draft) - TIDAK boleh muncul di halaman publik
        Program::create([
            'title' => 'Program Draf',
            'slug' => 'program-draf',
            'category' => ProgramCategory::PengembanganUsaha,
            'summary' => 'Belum siap terbit',
            'status' => 'draft',
            'is_public' => true,
            'order' => 3,
        ]);

        $response = $this->get('/tentang-kami');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Public/About')
            ->has('programs', 2)
            ->where('programs.0.slug', 'program-a-order-1')
            ->where('programs.1.slug', 'program-b-order-2')
        );
    }

    public function test_public_program_detail_page_is_viewable(): void
    {
        $program = Program::create([
            'title' => 'Pelatihan Budidaya Air Tawar',
            'slug' => 'pelatihan-budidaya-air-tawar',
            'category' => ProgramCategory::Pelatihan,
            'summary' => 'Ringkasan pelatihan',
            'body' => '<p>Materi silabus lengkap budidaya lele dan nila.</p>',
            'status' => 'published',
            'is_public' => true,
            'order' => 1,
        ]);

        $response = $this->get("/program/{$program->slug}");

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Public/Program/Show')
            ->where('program.title', 'Pelatihan Budidaya Air Tawar')
            ->where('program.category_label', 'Pelatihan')
            ->where('isRegistered', false)
            ->where('canRegister', false)
        );
    }

    public function test_member_only_program_restricts_guest_and_non_approved_users(): void
    {
        $program = Program::create([
            'title' => 'Konsorsium Ekspor Khusus Anggota',
            'slug' => 'konsorsium-ekspor-khusus-anggota',
            'category' => ProgramCategory::AksesKemitraan,
            'status' => 'published',
            'is_public' => false,
            'order' => 1,
        ]);

        // Guest dialihkan ke login
        $guestResponse = $this->get("/program/{$program->slug}");
        $guestResponse->assertRedirect(route('login'));

        // Pengguna non-approved dialihkan ke /akun dengan error
        $regularUser = User::factory()->create([
            'role' => Role::User,
            'membership_status' => MembershipStatus::NonMember,
        ]);

        $userResponse = $this->actingAs($regularUser)->get("/program/{$program->slug}");
        $userResponse->assertRedirect(route('account.index'));
        $userResponse->assertSessionHas('error');

        // Anggota approved boleh mengakses
        $approvedMember = User::factory()->create([
            'role' => Role::User,
            'membership_status' => MembershipStatus::Approved,
        ]);

        $memberResponse = $this->actingAs($approvedMember)->get("/program/{$program->slug}");
        $memberResponse->assertStatus(200);
        $memberResponse->assertInertia(fn (Assert $page) => $page
            ->component('Public/Program/Show')
            ->where('canRegister', true)
        );
    }

    public function test_approved_member_can_register_for_program(): void
    {
        $program = Program::create([
            'title' => 'Workshop Sertifikasi CBIB',
            'slug' => 'workshop-sertifikasi-cbib',
            'category' => ProgramCategory::Pendampingan,
            'status' => 'published',
            'is_public' => true,
            'order' => 1,
        ]);

        $approvedMember = User::factory()->create([
            'role' => Role::User,
            'membership_status' => MembershipStatus::Approved,
        ]);

        $response = $this->actingAs($approvedMember)->post("/program/{$program->slug}/daftar", [
            'note' => 'Ingin mendaftarkan 2 kolam budidaya nila.',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('program_registrations', [
            'program_id' => $program->id,
            'user_id' => $approvedMember->id,
            'status' => 'registered',
        ]);
    }

    public function test_admin_and_superadmin_can_manage_programs_in_cms(): void
    {
        Storage::fake('public');

        $admin = User::factory()->create(['role' => Role::Admin]);
        $superadmin = User::factory()->create(['role' => Role::Superadmin]);

        // 1. Admin bisa akses halaman daftar program
        $response = $this->actingAs($admin)->get(route('admin.programs.index'));
        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page->component('Admin/Programs/Index'));

        // 2. Admin bisa membuat program baru dengan cover
        $createResponse = $this->actingAs($admin)->post(route('admin.programs.store'), [
            'title' => 'Program Baru Uji Coba',
            'category' => ProgramCategory::TeknologiBudidaya->value,
            'summary' => 'Ringkasan teknologi budidaya',
            'body' => '<p>Deskripsi program</p>',
            'status' => 'published',
            'is_public' => 1,
            'order' => 10,
            'cover' => UploadedFile::fake()->image('cover.jpg'),
        ]);

        $createResponse->assertRedirect(route('admin.programs.index'));
        $this->assertDatabaseHas('programs', [
            'title' => 'Program Baru Uji Coba',
            'slug' => 'program-baru-uji-coba',
            'status' => 'published',
            'is_public' => true,
        ]);

        $createdProgram = Program::where('slug', 'program-baru-uji-coba')->firstOrFail();
        $this->assertNotNull($createdProgram->cover);
        Storage::disk('public')->assertExists($createdProgram->cover);

        // 3. Superadmin bisa mengedit program
        $updateResponse = $this->actingAs($superadmin)->put(route('admin.programs.update', $createdProgram), [
            'title' => 'Program Baru Uji Coba Diperbarui',
            'category' => ProgramCategory::TeknologiBudidaya->value,
            'status' => 'published',
            'is_public' => 0, // diubah jadi khusus anggota
            'order' => 5,
        ]);

        $updateResponse->assertRedirect(route('admin.programs.index'));
        $this->assertDatabaseHas('programs', [
            'id' => $createdProgram->id,
            'title' => 'Program Baru Uji Coba Diperbarui',
            'is_public' => false,
            'order' => 5,
        ]);

        // 4. Admin bisa reorder program
        $prog2 = Program::create([
            'title' => 'Program Kedua',
            'slug' => 'program-kedua',
            'category' => ProgramCategory::Pelatihan,
            'status' => 'published',
            'order' => 1,
        ]);

        $reorderResponse = $this->actingAs($admin)->post(route('admin.programs.reorder'), [
            'orders' => [
                ['id' => $createdProgram->id, 'order' => 1],
                ['id' => $prog2->id, 'order' => 2],
            ],
        ]);

        $reorderResponse->assertRedirect();
        $this->assertEquals(1, $createdProgram->fresh()->order);
        $this->assertEquals(2, $prog2->fresh()->order);

        // 5. Superadmin bisa menghapus program
        $deleteResponse = $this->actingAs($superadmin)->delete(route('admin.programs.destroy', $createdProgram));
        $deleteResponse->assertRedirect(route('admin.programs.index'));
        $this->assertDatabaseMissing('programs', ['id' => $createdProgram->id]);
    }

    public function test_regular_user_forbidden_from_admin_programs_cms(): void
    {
        $user = User::factory()->create(['role' => Role::User]);

        $response = $this->actingAs($user)->get(route('admin.programs.index'));
        $response->assertStatus(403);
    }
}
