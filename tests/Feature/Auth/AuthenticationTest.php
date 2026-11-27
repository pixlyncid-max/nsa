<?php

use App\Enums\MembershipStatus;
use App\Enums\Role;
use App\Models\User;

test('login screen can be rendered', function () {
    $this->withoutVite();

    $response = $this->get('/login');

    $response->assertStatus(200);
});

test('regular user authenticates and redirects to home', function () {
    $this->withoutVite();

    $user = User::factory()->create([
        'role' => Role::User,
        'membership_status' => MembershipStatus::NonMember,
    ]);

    $response = $this->post('/login', [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect('/');
    $response->assertSessionHas('success', "Selamat datang kembali, {$user->name}.");
});

test('approved member authenticates and redirects to home', function () {
    $this->withoutVite();

    $member = User::factory()->approvedMember()->create();

    $response = $this->post('/login', [
        'email' => $member->email,
        'password' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect('/');
    $response->assertSessionHas('success', "Selamat datang kembali, {$member->name}.");
});

test('admin authenticates and redirects to /admin', function () {
    $this->withoutVite();

    $admin = User::factory()->admin()->create();

    $response = $this->post('/login', [
        'email' => $admin->email,
        'password' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('admin.index'));
});

test('superadmin authenticates and redirects to /admin', function () {
    $this->withoutVite();

    $superadmin = User::factory()->superadmin()->create();

    $response = $this->post('/login', [
        'email' => $superadmin->email,
        'password' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('admin.index'));
});

test('user cannot authenticate with invalid password', function () {
    $user = User::factory()->create();

    $response = $this->post('/login', [
        'email' => $user->email,
        'password' => 'wrong-password',
    ]);

    $this->assertGuest();
    $response->assertSessionHasErrors('password');
    $response->assertSessionDoesntHaveErrors('email');
});

test('user sees email error when email is not registered', function () {
    $response = $this->post('/login', [
        'email' => 'tidak-terdaftar@nsa.or.id',
        'password' => 'password',
    ]);

    $this->assertGuest();
    $response->assertSessionHasErrors('email');
    $response->assertSessionDoesntHaveErrors('password');
});

test('regular user is forbidden from accessing /admin with 403', function () {
    $this->withoutVite();

    $user = User::factory()->create([
        'role' => Role::User,
    ]);

    $response = $this->actingAs($user)->get('/admin');

    $response->assertStatus(403);
});

test('admin is forbidden from accessing /akun with 403', function () {
    $this->withoutVite();

    $admin = User::factory()->admin()->create();

    $response = $this->actingAs($admin)->get('/akun');

    $response->assertStatus(403);
});

test('guest cannot access protected /akun and is redirected to login', function () {
    $response = $this->get('/akun');

    $response->assertRedirect(route('login'));
});

test('guest cannot access protected /admin and is redirected to login', function () {
    $response = $this->get('/admin');

    $response->assertRedirect(route('login'));
});

test('admin can access /admin successfully', function () {
    $this->withoutVite();

    $admin = User::factory()->admin()->create();

    $response = $this->actingAs($admin)->get('/admin');

    $response->assertStatus(200);
});

test('regular user can access /akun successfully', function () {
    $this->withoutVite();

    $user = User::factory()->create([
        'role' => Role::User,
    ]);

    $response = $this->actingAs($user)->get('/akun');

    $response->assertStatus(200);
});

test('users can logout', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/logout');

    $this->assertGuest();
    $response->assertRedirect('/');
});

test('login page provides register route and guests can access login', function () {
    $this->withoutVite();

    $response = $this->get('/login');

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('Auth/Login')
    );
});
