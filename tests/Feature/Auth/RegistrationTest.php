<?php

use App\Enums\MembershipStatus;
use App\Enums\Role;
use App\Models\User;

test('registration screen can be rendered', function () {
    $this->withoutVite();

    $response = $this->get('/register');

    $response->assertStatus(200);
});

test('new users can register with role user and status non_member and redirect to home with toast', function () {
    $this->withoutVite();

    $response = $this->post('/register', [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'phone' => '081234567890',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect('/');
    $response->assertSessionHas('success');

    $user = User::where('email', 'test@example.com')->first();
    $this->assertNotNull($user);
    $this->assertEquals(Role::User, $user->role);
    $this->assertEquals(MembershipStatus::NonMember, $user->membership_status);
});
