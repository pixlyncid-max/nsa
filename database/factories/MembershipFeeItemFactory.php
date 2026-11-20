<?php

namespace Database\Factories;

use App\Models\MembershipFeeItem;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<MembershipFeeItem>
 */
class MembershipFeeItemFactory extends Factory
{
    protected $model = MembershipFeeItem::class;

    public function definition(): array
    {
        $code = Str::upper(fake()->unique()->lexify('FEE_????'));

        return [
            'code' => $code,
            'name' => 'Biaya '.fake()->words(2, true),
            'description' => fake()->sentence(),
            'amount' => fake()->randomElement([50000, 100000, 150000, 250000]),
            'type' => fake()->randomElement(['required', 'optional', 'recurring']),
            'has_size_option' => false,
            'size_options' => null,
            'is_active' => true,
            'order' => fake()->numberBetween(1, 10),
        ];
    }
}
