<?php

namespace Database\Factories;

use App\Models\MembershipCategory;
use App\Models\MembershipType;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<MembershipType>
 */
class MembershipTypeFactory extends Factory
{
    protected $model = MembershipType::class;

    public function definition(): array
    {
        $name = fake()->unique()->words(2, true);

        return [
            'category_id' => MembershipCategory::factory(),
            'name' => ucfirst($name),
            'slug' => Str::slug($name),
            'description' => fake()->sentence(),
            'ad_art_rules' => fake()->paragraph(),
            'is_active' => true,
        ];
    }
}
