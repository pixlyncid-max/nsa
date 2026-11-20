<?php

namespace Tests\Feature;

use App\Actions\ResolveHomeRoute;
use App\Enums\MembershipStatus;
use App\Enums\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class NsaAuthAndDashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_resolve_home_route_action_routes_correctly_per_role_and_status(): void
    {
        $resolver = app(ResolveHomeRoute::class);

        // Guest / null -> /
        $this->assertEquals(url('/'), $resolver->execute(null));

        // Admin & Superadmin -> /admin
        $admin = User::factory()->admin()->create();
        $this->assertEquals(url('/admin'), $resolver->execute($admin));

        $superadmin = User::factory()->superadmin()->create();
        $this->assertEquals(url('/admin'), $resolver->execute($superadmin));

        // Approved Member -> / (beranda sesuai aturan baru)
        $approvedMember = User::factory()->approvedMember()->create();
        $this->assertEquals(url('/'), $resolver->execute($approvedMember));

        // Regular Non-Member & other statuses -> / (beranda)
        $nonMember = User::factory()->create([
            'role' => Role::User,
            'membership_status' => MembershipStatus::NonMember,
        ]);
        $this->assertEquals(url('/'), $resolver->execute($nonMember));

        $pendingMember = User::factory()->create([
            'role' => Role::User,
            'membership_status' => MembershipStatus::PendingReview,
        ]);
        $this->assertEquals(url('/'), $resolver->execute($pendingMember));

        $revisionMember = User::factory()->create([
            'role' => Role::User,
            'membership_status' => MembershipStatus::Revision,
        ]);
        $this->assertEquals(url('/'), $resolver->execute($revisionMember));
    }

    public function test_login_redirects_each_role_and_status_to_their_respective_home(): void
    {
        $this->withoutVite();

        // 1. Admin login -> /admin
        $admin = User::factory()->admin()->create();
        $res = $this->post('/login', ['email' => $admin->email, 'password' => 'password']);
        $this->assertAuthenticatedAs($admin);
        $res->assertRedirect('/admin');
        $this->post('/logout');

        // 2. Superadmin login -> /admin
        $superadmin = User::factory()->superadmin()->create();
        $res = $this->post('/login', ['email' => $superadmin->email, 'password' => 'password']);
        $this->assertAuthenticatedAs($superadmin);
        $res->assertRedirect('/admin');
        $this->post('/logout');

        // 3. Approved Member login -> / (beranda) dengan toast sukses
        $approved = User::factory()->approvedMember()->create();
        $res = $this->post('/login', ['email' => $approved->email, 'password' => 'password']);
        $this->assertAuthenticatedAs($approved);
        $res->assertRedirect('/');
        $res->assertSessionHas('success', "Selamat datang kembali, {$approved->name}.");
        $this->post('/logout');

        // 4. Regular User (NonMember) login -> / (beranda) dengan toast sukses
        $regular = User::factory()->create([
            'role' => Role::User,
            'membership_status' => MembershipStatus::NonMember,
        ]);
        $res = $this->post('/login', ['email' => $regular->email, 'password' => 'password']);
        $this->assertAuthenticatedAs($regular);
        $res->assertRedirect('/');
        $res->assertSessionHas('success', "Selamat datang kembali, {$regular->name}.");
        $this->post('/logout');

        // 5. User Pending Review login -> / (beranda) dengan toast sukses
        $pending = User::factory()->pendingMember()->create();
        $res = $this->post('/login', ['email' => $pending->email, 'password' => 'password']);
        $this->assertAuthenticatedAs($pending);
        $res->assertRedirect('/');
        $res->assertSessionHas('success', "Selamat datang kembali, {$pending->name}.");
    }

    public function test_sign_up_creates_regular_user_with_non_member_status_and_redirects_to_home(): void
    {
        $this->withoutVite();

        $response = $this->post('/register', [
            'name' => 'Calon Anggota Baru',
            'email' => 'calon@example.com',
            'phone' => '081298765432',
            'password' => 'rahasia123',
            'password_confirmation' => 'rahasia123',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect('/');
        $response->assertSessionHas('success');

        $user = User::where('email', 'calon@example.com')->first();
        $this->assertNotNull($user);
        $this->assertEquals(Role::User, $user->role);
        $this->assertEquals(MembershipStatus::NonMember, $user->membership_status);
    }

    public function test_member_approved_middleware_protects_anggota_routes(): void
    {
        $this->withoutVite();

        // 1. Guest ditolak masuk /anggota dan dialihkan ke login
        $guestRes = $this->get('/anggota');
        $guestRes->assertRedirect(route('login'));

        // 2. Non-approved user (mis. non_member) dialihkan ke /akun dengan toast error
        $nonMember = User::factory()->create([
            'role' => Role::User,
            'membership_status' => MembershipStatus::NonMember,
        ]);

        $nonMemberRes = $this->actingAs($nonMember)->get('/anggota');
        $nonMemberRes->assertRedirect('/akun');
        $nonMemberRes->assertSessionHas('error', 'Fitur ini khusus anggota');

        // 3. User pending_review juga ditolak masuk /anggota
        $pendingUser = User::factory()->pendingMember()->create();
        $pendingRes = $this->actingAs($pendingUser)->get('/anggota');
        $pendingRes->assertRedirect('/akun');
        $pendingRes->assertSessionHas('error', 'Fitur ini khusus anggota');

        // 4. Approved member diizinkan masuk /anggota (200 OK)
        $approvedMember = User::factory()->approvedMember()->create();
        $approvedRes = $this->actingAs($approvedMember)->get('/anggota');
        $approvedRes->assertStatus(200);
        $approvedRes->assertInertia(fn (Assert $page) => $page
            ->component('Member/Dashboard')
            ->has('user')
            ->where('user.name', $approvedMember->name)
        );
    }

    public function test_akun_dashboard_renders_cleanly_and_handles_join_button_destination(): void
    {
        $this->withoutVite();

        $user = User::factory()->create([
            'role' => Role::User,
            'membership_status' => MembershipStatus::NonMember,
        ]);

        // Non member can access /akun
        $response = $this->actingAs($user)->get('/akun');
        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Account/Dashboard')
        );

        // Non member accessing wizard /akun/keanggotaan/daftar is redirected to active step
        $wizardRes = $this->actingAs($user)->get('/akun/keanggotaan/daftar');
        $wizardRes->assertRedirect(route('account.membership.step', ['slug' => 'identitas']));
        $this->actingAs($user)->get('/akun/keanggotaan/daftar/identitas')->assertStatus(200);

        // In process user accessing /akun/keanggotaan/daftar is redirected to status
        $inProcessUser = User::factory()->pendingMember()->create();
        $inProcessRes = $this->actingAs($inProcessUser)->get('/akun/keanggotaan/daftar');
        $inProcessRes->assertRedirect(route('account.membership.status'));
    }
}
