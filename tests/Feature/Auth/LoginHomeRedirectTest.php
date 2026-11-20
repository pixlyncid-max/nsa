<?php

namespace Tests\Feature\Auth;

use App\Actions\ResolveHomeRoute;
use App\Enums\MembershipStatus;
use App\Enums\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Tests\TestCase;

class LoginHomeRedirectTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_admin_and_superadmin_redirects_to_admin_panel(): void
    {
        $this->withoutVite();

        $admin = User::factory()->admin()->create();
        $response = $this->post('/login', [
            'email' => $admin->email,
            'password' => 'password',
        ]);

        $this->assertAuthenticatedAs($admin);
        $response->assertRedirect('/admin');
        $response->assertSessionHas('success', "Selamat datang kembali, {$admin->name}.");

        $this->post('/logout');

        $superadmin = User::factory()->superadmin()->create();
        $response = $this->post('/login', [
            'email' => $superadmin->email,
            'password' => 'password',
        ]);

        $this->assertAuthenticatedAs($superadmin);
        $response->assertRedirect('/admin');
        $response->assertSessionHas('success', "Selamat datang kembali, {$superadmin->name}.");
    }

    public function test_login_user_role_with_various_statuses_redirects_to_home(): void
    {
        $this->withoutVite();

        $statuses = [
            MembershipStatus::NonMember,
            MembershipStatus::Draft,
            MembershipStatus::PendingReview,
            MembershipStatus::Revision,
            MembershipStatus::AwaitingPayment,
            MembershipStatus::PendingApproval,
            MembershipStatus::Approved,
            MembershipStatus::Rejected,
        ];

        foreach ($statuses as $status) {
            $user = User::factory()->create([
                'name' => "User Status {$status->value}",
                'email' => "user_{$status->value}@example.com",
                'role' => Role::User,
                'membership_status' => $status,
                'member_number' => $status === MembershipStatus::Approved ? 'NSA-2026-0001' : null,
            ]);

            $response = $this->post('/login', [
                'email' => $user->email,
                'password' => 'password',
            ]);

            $this->assertAuthenticatedAs($user);
            $response->assertRedirect('/');
            $response->assertSessionHas('success', "Selamat datang kembali, {$user->name}.");

            $this->post('/logout');
        }
    }

    public function test_intended_url_is_respected_after_login(): void
    {
        $this->withoutVite();

        $user = User::factory()->create([
            'role' => Role::User,
            'membership_status' => MembershipStatus::Approved,
        ]);

        // Simulasikan user dialihkan ke login dari halaman keranjang / checkout
        $response = $this->withSession(['url.intended' => url('/keranjang')])
            ->post('/login', [
                'email' => $user->email,
                'password' => 'password',
            ]);

        $this->assertAuthenticatedAs($user);
        $response->assertRedirect(url('/keranjang'));
        $response->assertSessionHas('success', "Selamat datang kembali, {$user->name}.");
    }

    public function test_auth_redirect_is_customizable_via_config(): void
    {
        $resolveHome = app(ResolveHomeRoute::class);

        $user = User::factory()->create([
            'role' => Role::User,
            'membership_status' => MembershipStatus::Approved,
        ]);

        // Default: 'user' => 'home' -> url('/')
        $this->assertEquals(url('/'), $resolveHome->execute($user, 'login'));

        // Ubah config auth_redirect untuk role user
        Config::set('auth_redirect.user', '/tentang-kami');
        $this->assertEquals(url('/tentang-kami'), $resolveHome->execute($user, 'login'));

        // Ubah config auth_redirect untuk admin
        $admin = User::factory()->admin()->create();
        Config::set('auth_redirect.admin', 'admin.dashboard');
        $this->assertEquals(route('admin.dashboard'), $resolveHome->execute($admin, 'login'));
    }
}
