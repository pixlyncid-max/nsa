<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$business = App\Models\MemberBusiness::where('name', 'like', '%LokaLoka%')->first();
if ($business) {
    $user = $business->user;
    echo "User ID: {$user->id}, Email: {$user->email}, Name: {$user->name}, Status: {$user->membership_status->value}\n";
} else {
    echo "No CV. LokaLoka found\n";
    // Check all users
    foreach (App\Models\User::all() as $u) {
        echo "User {$u->id}: {$u->email} ({$u->membership_status->value}) Business: " . ($u->business?->name ?? 'none') . "\n";
    }
}

