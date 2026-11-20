<?php

namespace Tests\Feature;

use App\Actions\ResolveHomeRoute;
use App\Enums\MembershipStatus;
use App\Enums\Role;
use App\Mail\WelcomeUserMail;
use App\Models\MemberApplication;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class SignUpHomeRedirectAndPromoBarTest extends TestCase
{
    use RefreshDatabase;

    public function test_sign_up_redirects_to_home_with_toast_and_sends_welcome_email(): void
    {
        Mail::fake();

        $response = $this->post('/register', [
            'name' => 'Calon Anggota NSA',
            'email' => 'calon@example.com',
            'phone' => '081299887766',
            'password' => 'Rahasia123!',
            'password_confirmation' => 'Rahasia123!',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect('/');
        $response->assertSessionHas('success', 'Akun berhasil dibuat. Selamat datang di NSA.');

        $user = User::where('email', 'calon@example.com')->first();
        $this->assertNotNull($user);
        $this->assertEquals(Role::User, $user->role);
        $this->assertEquals(MembershipStatus::NonMember, $user->membership_status);

        Mail::assertSent(WelcomeUserMail::class, function ($mail) use ($user) {
            return $mail->hasTo($user->email);
        });
    }

    public function test_login_routes_adhere_to_login_rules(): void
    {
        $resolveHome = app(ResolveHomeRoute::class);

        // 1. User biasa (non_member) setelah login diarahkan ke / (beranda)
        $nonMember = User::factory()->create([
            'role' => Role::User,
            'membership_status' => MembershipStatus::NonMember,
        ]);
        $this->assertEquals(url('/'), $resolveHome->execute($nonMember, 'login'));

        // 2. Anggota approved setelah login juga diarahkan ke / (beranda)
        $approvedMember = User::factory()->create([
            'role' => Role::User,
            'membership_status' => MembershipStatus::Approved,
        ]);
        $this->assertEquals(url('/'), $resolveHome->execute($approvedMember, 'login'));

        // 3. Staf Admin setelah login diarahkan ke /admin
        $admin = User::factory()->create([
            'role' => Role::Admin,
            'membership_status' => MembershipStatus::Approved,
        ]);
        $this->assertEquals(url('/admin'), $resolveHome->execute($admin, 'login'));

        // 4. Setelah sign up selalu ke /
        $this->assertEquals(url('/'), $resolveHome->execute($nonMember, 'signup'));
    }

    public function test_authenticated_user_accessing_guest_routes_redirects_by_login_rule(): void
    {
        $admin = User::factory()->create([
            'role' => Role::Admin,
            'membership_status' => MembershipStatus::Approved,
        ]);
        $approvedMember = User::factory()->create([
            'role' => Role::User,
            'membership_status' => MembershipStatus::Approved,
        ]);
        $nonMember = User::factory()->create([
            'role' => Role::User,
            'membership_status' => MembershipStatus::NonMember,
        ]);

        // Admin mengakses /login atau /register diarahkan ke /admin
        $this->actingAs($admin)->get('/login')->assertRedirect('/admin');
        $this->actingAs($admin)->get('/register')->assertRedirect('/admin');

        // Approved member mengakses /login atau /register diarahkan ke / (beranda)
        $this->actingAs($approvedMember)->get('/login')->assertRedirect('/');
        $this->actingAs($approvedMember)->get('/register')->assertRedirect('/');

        // Non member mengakses /login atau /register diarahkan ke / (beranda)
        $this->actingAs($nonMember)->get('/login')->assertRedirect('/');
        $this->actingAs($nonMember)->get('/register')->assertRedirect('/');
    }

    public function test_membership_promo_shared_props_for_guest_and_various_statuses(): void
    {
        // 1. Guest tidak menerima membershipPromo (null)
        $this->get('/')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('membershipPromo', null)
            );

        // 2. User non_member menerima promo status non_member
        $nonMember = User::factory()->create([
            'role' => Role::User,
            'membership_status' => MembershipStatus::NonMember,
        ]);
        $this->actingAs($nonMember)->get('/')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('membershipPromo', fn (Assert $promo) => $promo
                    ->where('status', 'non_member')
                    ->where('currentStep', 1)
                    ->where('completedCount', 0)
                    ->where('totalSteps', 9)
                )
            );

        // 3. User draft dengan 2 langkah selesai menerima currentStep 3
        $draftUser = User::factory()->create([
            'role' => Role::User,
            'membership_status' => MembershipStatus::Draft,
        ]);
        MemberApplication::create([
            'user_id' => $draftUser->id,
            'status' => MembershipStatus::Draft,
            'current_step' => 'profil-usaha',
            'completed_steps' => ['identitas', 'kategori-keanggotaan'],
        ]);

        $this->actingAs($draftUser)->get('/')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('membershipPromo', fn (Assert $promo) => $promo
                    ->where('status', 'draft')
                    ->where('currentStep', 3)
                    ->where('completedCount', 2)
                    ->where('totalSteps', 9)
                )
            );

        // 4. User approved tidak menerima membershipPromo (null)
        $approvedMember = User::factory()->create([
            'role' => Role::User,
            'membership_status' => MembershipStatus::Approved,
        ]);
        $this->actingAs($approvedMember)->get('/')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('membershipPromo', null)
            );

        // 5. Admin tidak menerima membershipPromo (null)
        $admin = User::factory()->create([
            'role' => Role::Admin,
            'membership_status' => MembershipStatus::Approved,
        ]);
        $this->actingAs($admin)->get('/')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('membershipPromo', null)
            );
    }

    public function test_membership_promo_shared_across_all_public_pages_and_updates_on_status_change(): void
    {
        $user = User::factory()->create([
            'role' => Role::User,
            'membership_status' => MembershipStatus::PendingReview,
        ]);

        // Tampil di berbagai halaman publik
        $this->actingAs($user)->get('/tentang-kami')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('membershipPromo', fn (Assert $promo) => $promo
                    ->where('status', 'pending_review')
                    ->etc()
                )
            );

        $this->actingAs($user)->get('/kontak')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('membershipPromo', fn (Assert $promo) => $promo
                    ->where('status', 'pending_review')
                    ->etc()
                )
            );

        $this->actingAs($user)->get('/produk')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('membershipPromo', fn (Assert $promo) => $promo
                    ->where('status', 'pending_review')
                    ->etc()
                )
            );

        // Ketika status berubah ke awaiting_payment, promo status langsung berubah
        $user->update(['membership_status' => MembershipStatus::AwaitingPayment]);

        $this->actingAs($user->fresh())->get('/')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('membershipPromo', fn (Assert $promo) => $promo
                    ->where('status', 'awaiting_payment')
                    ->etc()
                )
            );
    }
}
