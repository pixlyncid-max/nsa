<?php

namespace Database\Seeders;

use App\Models\FishCategory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class FishCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Ikan Lele',
                'description' => 'Komoditas budidaya air tawar unggulan nasional dengan daya adaptasi tinggi dan siklus panen cepat.',
                'icon' => 'fish',
            ],
            [
                'name' => 'Ikan Nila',
                'description' => 'Ikan konsumsi populer dengan pertumbuhan cepat dan pasar domestik maupun ekspor yang stabil.',
                'icon' => 'fish',
            ],
            [
                'name' => 'Ikan Mas',
                'description' => 'Ikan air tawar bernilai ekonomis tinggi untuk konsumsi dan kolam pemancingan.',
                'icon' => 'fish',
            ],
            [
                'name' => 'Ikan Patin',
                'description' => 'Ikan air tawar bernilai industri olahan fillet (dory lokal) dan permintaan restoran tinggi.',
                'icon' => 'fish',
            ],
            [
                'name' => 'Ikan Gurame',
                'description' => 'Ikan air tawar premium dengan cita rasa gurih dan harga jual stabil di tingkat peternak.',
                'icon' => 'fish',
            ],
            [
                'name' => 'Ikan Bawal',
                'description' => 'Ikan air tawar rakus dan bertubuh pipih yang banyak diminati untuk rekreasi dan kuliner.',
                'icon' => 'fish',
            ],
            [
                'name' => 'Udang Vaname',
                'description' => 'Komoditas perikanan payau devisa utama ekspor perikanan Indonesia.',
                'icon' => 'shrimp',
            ],
            [
                'name' => 'Kepiting & Rajungan',
                'description' => 'Komoditas krustasea bernilai tinggi dari perairan pesisir dan mangrove.',
                'icon' => 'crab',
            ],
            [
                'name' => 'Bandeng',
                'description' => 'Ikan tambak payau kaya nutrisi dan bahan baku berbagai olahan kuliner tradisional.',
                'icon' => 'fish',
            ],
            [
                'name' => 'Ikan Kerapu & Kakap',
                'description' => 'Komoditas marikultur air laut premium untuk pasar ekspor segar.',
                'icon' => 'anchor',
            ],
        ];

        foreach ($categories as $cat) {
            FishCategory::updateOrCreate(
                ['slug' => Str::slug($cat['name'])],
                [
                    'name' => $cat['name'],
                    'description' => $cat['description'],
                    'icon' => $cat['icon'],
                    'is_active' => true,
                ]
            );
        }
    }
}
