<?php

namespace Tests\Feature;

use App\Enums\MembershipStatus;
use App\Enums\OrderStatus;
use App\Enums\ProductType;
use App\Enums\Role;
use App\Models\MemberApplication;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\User;
use App\Support\Brand;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AccountSimpleDashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_non_member_dashboard_renders_with_join_invitation(): void
    {
        $user = User::factory()->create([
            'role' => Role::User,
            'membership_status' => MembershipStatus::NonMember,
        ]);

        $response = $this->actingAs($user)->get(route('account.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Account/Dashboard')
            ->where('membership.status', 'non_member')
            ->where('membership.status_label', 'Bukan Anggota')
            ->where('brandSupport.phone', Brand::supportPhone())
            ->where('brandSupport.email', Brand::supportEmail())
        );
    }

    public function test_draft_member_dashboard_renders_with_progress_and_continue_action(): void
    {
        $user = User::factory()->create([
            'role' => Role::User,
            'membership_status' => MembershipStatus::Draft,
        ]);

        MemberApplication::create([
            'user_id' => $user->id,
            'status' => MembershipStatus::Draft,
            'current_step' => 'dokumen',
            'completed_steps' => ['informasi-akun', 'data-pribadi', 'data-usaha-perikanan'],
        ]);

        $response = $this->actingAs($user)->get(route('account.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Account/Dashboard')
            ->where('membership.status', 'draft')
            ->where('membership.completed_steps_count', 3)
            ->where('membership.total_steps', 9)
        );
    }

    public function test_in_process_memberships_render_appropriate_statuses(): void
    {
        $inProcessStatuses = [
            MembershipStatus::PendingReview,
            MembershipStatus::AwaitingPayment,
            MembershipStatus::PendingApproval,
            MembershipStatus::Revision,
        ];

        foreach ($inProcessStatuses as $status) {
            $user = User::factory()->create([
                'role' => Role::User,
                'membership_status' => $status,
            ]);

            MemberApplication::create([
                'user_id' => $user->id,
                'status' => $status,
                'review_note' => $status === MembershipStatus::Revision ? 'Mohon unggah ulang foto KTP yang lebih jelas.' : null,
            ]);

            $response = $this->actingAs($user)->get(route('account.index'));

            $response->assertStatus(200);
            $response->assertInertia(fn (Assert $page) => $page
                ->component('Account/Dashboard')
                ->where('membership.status', $status->value)
            );
        }
    }

    public function test_dashboard_displays_recent_orders_and_empty_state_correctly(): void
    {
        $user = User::factory()->create([
            'role' => Role::User,
            'membership_status' => MembershipStatus::NonMember,
        ]);

        // 1. Awalnya belum ada pesanan
        $response = $this->actingAs($user)->get(route('account.index'));
        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Account/Dashboard')
            ->has('recentOrders', 0)
        );

        // 2. Buat 4 pesanan; dashboard harus menampilkan 3 terbaru
        $category = ProductCategory::firstOrCreate([
            'slug' => 'bibit-ikan',
        ], [
            'name' => 'Bibit Ikan',
            'group' => 'freshwater',
        ]);

        $product = Product::create([
            'category_id' => $category->id,
            'type' => ProductType::Physical,
            'name' => 'Bibit Ikan Nila Unggul',
            'slug' => 'bibit-ikan-nila-unggul',
            'description' => 'Bibit ikan nila pilihan',
            'price' => 100000,
            'stock' => 50,
            'weight' => 500,
            'is_active' => true,
        ]);

        for ($i = 1; $i <= 4; $i++) {
            $order = Order::create([
                'user_id' => $user->id,
                'code' => "ORD-TEST-00{$i}",
                'status' => OrderStatus::PendingPayment,
                'subtotal' => 100000 * $i,
                'shipping_cost' => 15000,
                'total' => (100000 * $i) + 15000,
            ]);

            OrderItem::create([
                'order_id' => $order->id,
                'product_id' => $product->id,
                'name_snapshot' => $product->name,
                'price_snapshot' => 100000,
                'qty' => $i,
                'subtotal' => 100000 * $i,
            ]);
        }

        $responseWithOrders = $this->actingAs($user)->get(route('account.index'));
        $responseWithOrders->assertStatus(200);
        $responseWithOrders->assertInertia(fn (Assert $page) => $page
            ->component('Account/Dashboard')
            ->has('recentOrders', 3)
            ->where('recentOrders.0.code', 'ORD-TEST-004')
        );
    }

    public function test_user_can_view_and_update_profile(): void
    {
        $user = User::factory()->create([
            'name' => 'Budi Santoso',
            'phone' => '081234567890',
            'role' => Role::User,
        ]);

        // GET /akun/profil
        $response = $this->actingAs($user)->get(route('account.profile.edit'));
        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Account/Profile')
            ->where('profile.name', 'Budi Santoso')
            ->where('profile.phone', '081234567890')
        );

        // POST /akun/profil
        $updateResponse = $this->actingAs($user)->post(route('account.profile.update'), [
            'name' => 'Budi Santoso Updated',
            'phone' => '089988776655',
        ]);

        $updateResponse->assertRedirect();
        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'Budi Santoso Updated',
            'phone' => '089988776655',
        ]);
    }

    public function test_user_can_update_password(): void
    {
        $user = User::factory()->create([
            'password' => Hash::make('old-password-123'),
            'role' => Role::User,
        ]);

        $response = $this->actingAs($user)->post(route('account.profile.password'), [
            'current_password' => 'old-password-123',
            'password' => 'new-secure-password-456',
            'password_confirmation' => 'new-secure-password-456',
        ]);

        $response->assertRedirect();
        $this->assertTrue(Hash::check('new-secure-password-456', $user->fresh()->password));
    }

    public function test_user_can_view_and_update_settings(): void
    {
        $user = User::factory()->create(['role' => Role::User]);

        // GET /akun/pengaturan
        $response = $this->actingAs($user)->get(route('account.settings.edit'));
        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Account/Settings')
            ->has('preferences')
        );

        // POST /akun/pengaturan
        $postResponse = $this->actingAs($user)->post(route('account.settings.update'), [
            'notify_orders' => true,
            'notify_membership' => false,
            'notify_programs' => true,
        ]);

        $postResponse->assertRedirect();
    }
}
