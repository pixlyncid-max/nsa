<?php

namespace Database\Factories;

use App\Enums\ProgramCategory;
use App\Models\Program;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Program>
 */
class ProgramFactory extends Factory
{
    protected $model = Program::class;

    public function definition(): array
    {
        $title = fake()->unique()->sentence(4);

        return [
            'title' => $title,
            'slug' => Str::slug($title),
            'category' => fake()->randomElement(ProgramCategory::cases()),
            'summary' => fake()->paragraph(),
            'body' => fake()->paragraphs(3, true),
            'cover' => null,
            'status' => 'published',
            'is_public' => true,
            'starts_at' => now()->addDays(7),
            'ends_at' => now()->addDays(14),
            'order' => fake()->numberBetween(1, 10),
        ];
    }
}
