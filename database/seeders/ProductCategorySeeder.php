<?php

namespace Database\Seeders;

use App\Models\ProductCategory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProductCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $structure = [
            'freshwater' => [
                'name' => 'Spot Air Tawar',
                'icon' => 'waves',
                'subs' => [
                    'Pelet Pakan Ikan',
                    'Pakan Hidup',
                    'Sewa Pancing',
                    'Kolam Pemancingan',
                    'Komunitas Air Tawar',
                ],
            ],
            'saltwater' => [
                'name' => 'Spot Air Laut',
                'icon' => 'anchor',
                'subs' => [
                    'Umpan Ikan Laut',
                    'Sewa Pancing Laut',
                    'Sewa Kapal',
                    'Komunitas Air Laut',
                ],
            ],
            'other' => [
                'name' => 'Lain-lain',
                'icon' => 'package',
                'subs' => [
                    'Vitamin',
                    'Bibit',
                ],
            ],
        ];

        foreach ($structure as $group => $data) {
            $parent = ProductCategory::updateOrCreate(
                ['slug' => Str::slug($data['name'])],
                [
                    'parent_id' => null,
                    'name' => $data['name'],
                    'group' => $group,
                    'icon' => $data['icon'],
                ]
            );

            foreach ($data['subs'] as $subName) {
                ProductCategory::updateOrCreate(
                    ['slug' => Str::slug($subName)],
                    [
                        'parent_id' => $parent->id,
                        'name' => $subName,
                        'group' => $group,
                        'icon' => null,
                    ]
                );
            }
        }
    }
}
