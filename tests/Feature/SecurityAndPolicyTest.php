<?php

namespace Tests\Feature;

use App\Enums\MembershipStatus;
use App\Enums\Role;
use App\Models\MemberDocument;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class SecurityAndPolicyTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected User $memberUser;

    protected User $otherUser;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('private');

        $this->admin = User::factory()->create([
            'role' => Role::Admin,
            'membership_status' => MembershipStatus::Approved,
        ]);

        $this->memberUser = User::factory()->create([
            'role' => Role::User,
            'membership_status' => MembershipStatus::Approved,
        ]);

        $this->otherUser = User::factory()->create([
            'role' => Role::User,
            'membership_status' => MembershipStatus::NonMember,
        ]);
    }

    public function test_security_headers_are_present_on_web_responses(): void
    {
        $response = $this->get('/');

        $response->assertStatus(200);
        $response->assertHeader('X-Content-Type-Options', 'nosniff');
        $response->assertHeader('X-Frame-Options', 'SAMEORIGIN');
        $response->assertHeader('X-XSS-Protection', '1; mode=block');
        $response->assertHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->assertHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)');
    }

    public function test_guest_cannot_access_private_documents(): void
    {
        Storage::disk('private')->put('documents/test_ktp.pdf', 'fake pdf content');

        $document = MemberDocument::create([
            'user_id' => $this->memberUser->id,
            'type' => 'ktp',
            'path' => 'documents/test_ktp.pdf',
            'status' => 'pending',
        ]);

        // Guest mencoba akses langsung
        $response = $this->get("/akun/dokumen/{$document->id}");

        // Wajib diarahkan ke login
        $response->assertRedirect('/login');
    }

    public function test_regular_user_cannot_view_other_users_private_document(): void
    {
        Storage::disk('private')->put('documents/test_ktp.pdf', 'fake pdf content');

        $document = MemberDocument::create([
            'user_id' => $this->memberUser->id,
            'type' => 'ktp',
            'path' => 'documents/test_ktp.pdf',
            'status' => 'pending',
        ]);

        // User lain yang bukan pemilik dokumen mencoba akses
        $response = $this->actingAs($this->otherUser)->get("/akun/dokumen/{$document->id}");

        // Policy harus memblokir dengan 403 Forbidden
        $response->assertStatus(403);
    }

    public function test_document_owner_can_access_their_own_document(): void
    {
        Storage::disk('private')->put('documents/my_ktp.pdf', 'fake pdf content');

        $document = MemberDocument::create([
            'user_id' => $this->memberUser->id,
            'type' => 'ktp',
            'path' => 'documents/my_ktp.pdf',
            'status' => 'pending',
        ]);

        $response = $this->actingAs($this->memberUser)->get("/akun/dokumen/{$document->id}");

        $response->assertStatus(200);
    }

    public function test_admin_can_access_any_member_private_document(): void
    {
        Storage::disk('private')->put('documents/member_nib.pdf', 'fake pdf content');

        $document = MemberDocument::create([
            'user_id' => $this->memberUser->id,
            'type' => 'nib',
            'path' => 'documents/member_nib.pdf',
            'status' => 'pending',
        ]);

        $response = $this->actingAs($this->admin)->get("/akun/dokumen/{$document->id}");

        $response->assertStatus(200);
    }

    public function test_regular_user_forbidden_from_accessing_admin_routes(): void
    {
        $response = $this->actingAs($this->memberUser)->get('/admin');

        $response->assertStatus(403);
    }
}
