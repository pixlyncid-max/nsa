<?php

use App\Enums\OrderStatus;
use App\Enums\Role;
use App\Models\Order;
use App\Models\Province;
use App\Models\Regency;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

test('guest cannot access account drawer api endpoints', function () {
    $this->getJson('/akun/api/pesanan')->assertStatus(401);
    $this->getJson('/akun/api/alamat')->assertStatus(401);
    $this->getJson('/akun/api/profil')->assertStatus(401);
    $this->postJson('/akun/api/alamat', [])->assertStatus(401);
    $this->postJson('/akun/api/profil', [])->assertStatus(401);
    $this->postJson('/akun/api/password', [])->assertStatus(401);
});

test('authenticated user can fetch orders list from drawer api', function () {
    $user = User::factory()->create([
        'role' => Role::User,
    ]);

    $order = Order::create([
        'user_id' => $user->id,
        'code' => 'ORD-TEST-DRAWER-01',
        'status' => OrderStatus::PendingPayment,
        'subtotal' => 100000,
        'shipping_cost' => 10000,
        'total' => 110000,
        'address' => ['recipient_name' => 'Budi'],
    ]);

    $order->items()->create([
        'name_snapshot' => 'Pelet Apung 1kg',
        'price_snapshot' => 50000,
        'qty' => 2,
    ]);

    $response = $this->actingAs($user)->getJson('/akun/api/pesanan');

    $response->assertStatus(200);
    $response->assertJsonStructure([
        'orders' => [
            '*' => [
                'id',
                'code',
                'status',
                'status_label',
                'total',
                'items_count',
                'items',
                'created_at',
            ],
        ],
    ]);
});

test('authenticated user can fetch and update address from drawer api', function () {
    $user = User::factory()->create([
        'role' => Role::User,
    ]);

    $province = Province::create([
        'id' => 32,
        'name' => 'Jawa Barat',
        'slug' => 'jawa-barat',
    ]);

    $regency = Regency::create([
        'id' => 3201,
        'province_id' => $province->id,
        'name' => 'Kabupaten Bogor',
        'slug' => 'kabupaten-bogor',
    ]);

    // Initial fetch
    $response = $this->actingAs($user)->getJson('/akun/api/alamat');
    $response->assertStatus(200);

    // Update address
    $updateResponse = $this->actingAs($user)->postJson('/akun/api/alamat', [
        'recipient_name' => 'Nama Penerima Baru',
        'phone' => '089876543210',
        'province_id' => $province->id,
        'regency_id' => $regency->id,
        'postal_code' => '16680',
        'address' => 'Jl. Budidaya Lele No. 45 RT 03/02',
    ]);

    $updateResponse->assertStatus(200);
    $updateResponse->assertJson([
        'success' => true,
    ]);

    $user->refresh();
    expect($user->name)->toBe('Nama Penerima Baru');
    expect($user->phone)->toBe('089876543210');
    expect($user->business->address)->toBe('Jl. Budidaya Lele No. 45 RT 03/02');
    expect($user->business->postal_code)->toBe('16680');
});

test('authenticated user can fetch and update profile from drawer api', function () {
    $user = User::factory()->create([
        'name' => 'Akun Lama',
        'email' => 'lama@example.com',
        'phone' => '081111111111',
    ]);

    $response = $this->actingAs($user)->getJson('/akun/api/profil');
    $response->assertStatus(200);
    $response->assertJson([
        'name' => 'Akun Lama',
        'email' => 'lama@example.com',
        'phone' => '081111111111',
    ]);

    $updateResponse = $this->actingAs($user)->postJson('/akun/api/profil', [
        'name' => 'Akun Baru NSA',
        'email' => 'baru@example.com',
        'phone' => '082222222222',
    ]);

    $updateResponse->assertStatus(200);
    $updateResponse->assertJson([
        'success' => true,
    ]);

    $user->refresh();
    expect($user->name)->toBe('Akun Baru NSA');
    expect($user->email)->toBe('baru@example.com');
    expect($user->phone)->toBe('082222222222');
});

test('authenticated user can update password with valid current password', function () {
    $user = User::factory()->create([
        'password' => Hash::make('old-password-123'),
    ]);

    $response = $this->actingAs($user)->postJson('/akun/api/password', [
        'current_password' => 'old-password-123',
        'password' => 'new-secure-password-456',
        'password_confirmation' => 'new-secure-password-456',
    ]);

    $response->assertStatus(200);
    $response->assertJson([
        'success' => true,
    ]);

    $user->refresh();
    expect(Hash::check('new-secure-password-456', $user->password))->toBeTrue();
});

test('authenticated user cannot update password with invalid current password', function () {
    $user = User::factory()->create([
        'password' => Hash::make('old-password-123'),
    ]);

    $response = $this->actingAs($user)->postJson('/akun/api/password', [
        'current_password' => 'wrong-password',
        'password' => 'new-secure-password-456',
        'password_confirmation' => 'new-secure-password-456',
    ]);

    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['current_password']);
});
