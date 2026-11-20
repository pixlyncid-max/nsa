<?php

namespace Database\Factories;

use App\Models\MemberApplication;
use App\Models\MemberIdentity;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<MemberIdentity>
 */
class MemberIdentityFactory extends Factory
{
    protected $model = MemberIdentity::class;

    public function definition(): array
    {
        return [
            'application_id' => MemberApplication::factory(),
            'user_id' => User::factory(),
            'nationality' => 'wni',
            'full_name' => fake()->name(),
            'gender' => fake()->randomElement(['male', 'female']),
            'birth_place' => fake()->city(),
            'birth_date' => fake()->date('Y-m-d', '-20 years'),
            'phone' => fake()->phoneNumber(),
            'email' => fake()->safeEmail(),
            'nik' => fake()->numerify('################'),
            'ktp_address' => [
                'address' => fake()->streetAddress(),
                'province' => 'DKI Jakarta',
                'regency' => 'Jakarta Selatan',
            ],
            'passport_number' => null,
            'origin_country' => null,
            'years_in_indonesia' => null,
        ];
    }
}
