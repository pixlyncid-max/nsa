<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PartnershipVisibilityTest extends TestCase
{
    use RefreshDatabase;

    public function test_partnership_page_is_hidden_by_default(): void
    {
        $this->get('/kemitraan')->assertNotFound();
        $this->get('/en/partnership')->assertNotFound();

        $this->get('/')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('features.partnership_enabled', false)
            );
    }

    public function test_superadmin_can_toggle_partnership_page_visibility(): void
    {
        $superadmin = User::factory()->create(['role' => 'superadmin']);
        $basePayload = [
            'contact_email' => 'info@nsa.or.id',
            'contact_phone' => '081234567890',
            'contact_address' => 'Jakarta',
            'bank_name' => 'BCA',
            'bank_account_number' => '1234567890',
            'bank_account_holder' => 'NSA',
        ];

        // Aktifkan halaman kemitraan
        $this->actingAs($superadmin)
            ->post('/admin/pengaturan', [...$basePayload, 'partnership_page_enabled' => true])
            ->assertRedirect();

        $this->get('/kemitraan')->assertOk();
        $this->get('/')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('features.partnership_enabled', true)
            );

        // Nonaktifkan kembali
        $this->actingAs($superadmin)
            ->post('/admin/pengaturan', [...$basePayload, 'partnership_page_enabled' => false])
            ->assertRedirect();

        $this->get('/kemitraan')->assertNotFound();
    }

    public function test_regular_admin_cannot_toggle_partnership_setting(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)
            ->post('/admin/pengaturan', ['partnership_page_enabled' => true])
            ->assertForbidden();
    }
}
