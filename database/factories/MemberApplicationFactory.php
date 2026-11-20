<?php

namespace Database\Factories;

use App\Enums\MembershipStatus;
use App\Models\MemberApplication;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<MemberApplication>
 */
class MemberApplicationFactory extends Factory
{
    protected $model = MemberApplication::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'status' => MembershipStatus::Draft,
            'membership_category' => 'Budidaya',
            'applicant_type' => 'individual',
            'current_step' => 'identitas-calon-anggota',
            'completed_steps' => [],
        ];
    }
}
