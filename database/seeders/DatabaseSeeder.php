<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RegionSeeder::class,
            FishCategorySeeder::class,
            BusinessFieldSeeder::class,
            ProductCategorySeeder::class,
            MembershipPlanSeeder::class,
            MembershipCategorySeeder::class,
            MembershipFeeItemSeeder::class,
            ProgramSeeder::class,
            UserSeeder::class,
            DemoSeeder::class,
        ]);
    }
}
