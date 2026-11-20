<?php

namespace Database\Seeders;

use App\Models\BusinessField;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class BusinessFieldSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $fields = [
            'Udang',
            'Kepiting',
            'Lobster',
            'Rajungan',
            'Rumput Laut',
            'Ikan Air Tawar',
            'Ikan Laut',
            'Pakan',
            'Cold Storage',
            'Logistik',
            'Pengolahan',
            'Ekspor',
            'Impor',
            'Hatchery',
            'Tambak',
            'Budidaya',
            'Alat Perikanan',
            'Industri Hilir',
            'Jasa Pendukung',
            'Lainnya',
        ];

        foreach ($fields as $name) {
            BusinessField::updateOrCreate(
                ['name' => $name],
                ['slug' => Str::slug($name)]
            );
        }
    }
}
