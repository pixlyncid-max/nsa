<?php

namespace Database\Factories;

use App\Models\MemberApplication;
use App\Models\MemberInvoice;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<MemberInvoice>
 */
class MemberInvoiceFactory extends Factory
{
    protected $model = MemberInvoice::class;

    public function definition(): array
    {
        return [
            'application_id' => MemberApplication::factory(),
            'number' => 'INV-NSA-'.date('Y').'-'.fake()->unique()->numerify('#####'),
            'status' => 'unpaid',
            'total' => 250000,
            'due_at' => now()->addDays(7),
        ];
    }
}
