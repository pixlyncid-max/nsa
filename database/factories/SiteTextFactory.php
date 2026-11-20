<?php

namespace Database\Factories;

use App\Models\SiteText;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SiteText>
 */
class SiteTextFactory extends Factory
{
    protected $model = SiteText::class;

    public function definition(): array
    {
        return [
            'key' => 'home.hero.title',
            'group' => 'home',
            'locale' => 'id',
            'value' => fake()->sentence(5),
            'updated_by' => User::factory(),
        ];
    }
}
