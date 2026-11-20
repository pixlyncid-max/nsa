<?php

namespace Database\Factories;

use App\Models\SiteText;
use App\Models\SiteTextRevision;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SiteTextRevision>
 */
class SiteTextRevisionFactory extends Factory
{
    protected $model = SiteTextRevision::class;

    public function definition(): array
    {
        return [
            'site_text_id' => SiteText::factory(),
            'old_value' => fake()->sentence(4),
            'new_value' => fake()->sentence(4),
            'user_id' => User::factory(),
            'created_at' => now(),
        ];
    }
}
