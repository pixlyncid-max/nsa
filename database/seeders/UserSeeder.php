<?php

namespace Database\Seeders;

use App\Enums\MembershipStatus;
use App\Enums\Role;
use App\Models\MemberBusiness;
use App\Models\MemberProfile;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $password = Hash::make('password');

        // 1. Superadmin
        User::updateOrCreate(
            ['email' => 'superadmin@nsa.test'],
            [
                'name' => 'Super Administrator',
                'phone' => '081122334455',
                'password' => $password,
                'role' => Role::Superadmin,
                'membership_status' => MembershipStatus::Approved,
                'member_number' => 'NSA-SA-0001',
                'email_verified_at' => now(),
            ]
        );

        // 2. Admin CMS
        User::updateOrCreate(
            ['email' => 'admin@nsa.test'],
            [
                'name' => 'Admin Pengelola',
                'phone' => '081234567890',
                'password' => $password,
                'role' => Role::Admin,
                'membership_status' => MembershipStatus::Approved,
                'member_number' => 'NSA-ADM-0001',
                'email_verified_at' => now(),
            ]
        );

        // 3. User Anggota Resmi
        $anggota = User::updateOrCreate(
            ['email' => 'anggota@nsa.test'],
            [
                'name' => 'Budi Pratama (Anggota)',
                'phone' => '081398765432',
                'password' => $password,
                'role' => Role::User,
                'membership_status' => MembershipStatus::Approved,
                'member_number' => 'NSA-2024-00001',
                'email_verified_at' => now(),
            ]
        );

        MemberProfile::updateOrCreate(
            ['user_id' => $anggota->id],
            [
                'nik' => '3201011204850001',
                'birth_place' => 'Bogor',
                'birth_date' => '1985-04-12',
                'gender' => 'male',
                'address' => 'Jl. Mina Bahari No. 12, RT 02/RW 04, Cijeruk',
            ]
        );

        MemberBusiness::updateOrCreate(
            ['user_id' => $anggota->id],
            [
                'membership_type' => 'Pembudidaya',
                'name' => 'Mina Sejahtera Aquaculture',
                'owner_name' => 'Budi Pratama',
                'nib' => '9120001234567',
                'npwp' => '09.123.456.7-403.000',
                'founded_at' => '2018-05-10',
                'employee_count' => 12,
                'annual_revenue' => 'Rp 500 Juta - Rp 1 Miliar',
                'business_status' => 'Milik Sendiri',
                'business_scale' => 'Menengah',
                'province_id' => 32, // Jawa Barat
                'regency_id' => 3201, // Kabupaten Bogor
                'postal_code' => '16740',
                'address' => 'Desa Cijeruk, Kec. Cijeruk, Kabupaten Bogor',
                'latitude' => -6.6892100,
                'longitude' => 106.7824100,
            ]
        );

        // 4. User Non-Anggota
        User::updateOrCreate(
            ['email' => 'user@nsa.test'],
            [
                'name' => 'Siti Nurhaliza (Umum)',
                'phone' => '081567891234',
                'password' => $password,
                'role' => Role::User,
                'membership_status' => MembershipStatus::NonMember,
                'member_number' => null,
                'email_verified_at' => now(),
            ]
        );
    }
}
