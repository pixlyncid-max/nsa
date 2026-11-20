<?php

namespace Database\Seeders;

use App\Models\MembershipCategory;
use App\Models\MembershipType;
use Illuminate\Database\Seeder;

class MembershipCategorySeeder extends Seeder
{
    /**
     * Seed contoh kategori dan jenis keanggotaan NSA yang dapat dikelola via CMS.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Pembudidaya Ikan & Biota Air',
                'slug' => 'pembudidaya-ikan-biota-air',
                'description' => 'Pelaku usaha budidaya perikanan air tawar, payau, dan laut nusantara.',
                'types' => [
                    [
                        'name' => 'Anggota Biasa - Pembudidaya Air Tawar',
                        'slug' => 'anggota-biasa-pembudidaya-air-tawar',
                        'description' => 'Pembudidaya komoditas lele, nila, patin, gurame, dan ikan hias air tawar.',
                        'ad_art_rules' => 'Memiliki hak suara dalam musyawarah anggota, berhak menerima pembinaan teknis dan sertifikasi budidaya.',
                    ],
                    [
                        'name' => 'Anggota Biasa - Pembudidaya Payau & Laut',
                        'slug' => 'anggota-biasa-pembudidaya-payau-laut',
                        'description' => 'Pembudidaya udang vaname, bandeng, kerapu, kakap, dan rumput laut.',
                        'ad_art_rules' => 'Memiliki hak suara penuh, wajib mematuhi standar Good Aquaculture Practices (CBIB/GAP).',
                    ],
                ],
            ],
            [
                'name' => 'Pengolah & Pemasar Hasil Perikanan',
                'slug' => 'pengolah-pemasar-hasil-perikanan',
                'description' => 'Industri pengolahan, cold storage, distributor, offtaker, dan eksportir produk akuatik.',
                'types' => [
                    [
                        'name' => 'Anggota Biasa - Unit Pengolahan Ikan (UPI)',
                        'slug' => 'anggota-biasa-unit-pengolahan-ikan',
                        'description' => 'Perusahaan dan UMKM pengolah ikan segar, beku, fillet, dan produk turunan.',
                        'ad_art_rules' => 'Berhak mengakses jaringan supply chain pembudidaya NSA, berhak mengikuti pameran dagang.',
                    ],
                    [
                        'name' => 'Anggota Biasa - Distributor & Pemasar',
                        'slug' => 'anggota-biasa-distributor-pemasar',
                        'description' => 'Pelaku logistik rantai dingin dan jaringan distribusi pasar domestik/ekspor.',
                        'ad_art_rules' => 'Berhak mendapatkan data produksi anggota dan peluang kerjasama konsorsium.',
                    ],
                ],
            ],
            [
                'name' => 'Penyedia Sarana & Prasarana Perikanan',
                'slug' => 'penyedia-sarana-prasarana',
                'description' => 'Produsen benih, pakan, obat ikan, kincir, dan teknologi sensor budidaya.',
                'types' => [
                    [
                        'name' => 'Anggota Luar Biasa - Produsen Sarpras',
                        'slug' => 'anggota-luar-biasa-produsen-sarpras',
                        'description' => 'Pabrikan pakan, suplemen, mesin aerasi, dan peralatan laboratorium perikanan.',
                        'ad_art_rules' => 'Hak bicara tanpa hak suara legislatif, dapat menjadi sponsor resmi agenda NSA.',
                    ],
                ],
            ],
            [
                'name' => 'Akademisi, Peneliti & Konsultan',
                'slug' => 'akademisi-peneliti-konsultan',
                'description' => 'Pakar akuakultur, dosen, peneliti lembaga riset, dan konsultan akuatik berkelanjutan.',
                'types' => [
                    [
                        'name' => 'Anggota Kehormatan & Pakar Riset',
                        'slug' => 'anggota-kehormatan-pakar-riset',
                        'description' => 'Individu dengan kontribusi luar biasa dalam riset dan inovasi perikanan akuatik.',
                        'ad_art_rules' => 'Diangkat berdasarkan keputusan DPP NSA, bertindak sebagai dewan penasihat teknis.',
                    ],
                ],
            ],
        ];

        foreach ($categories as $catData) {
            $types = $catData['types'];
            unset($catData['types']);

            $category = MembershipCategory::updateOrCreate(
                ['slug' => $catData['slug']],
                $catData
            );

            foreach ($types as $typeData) {
                MembershipType::updateOrCreate(
                    ['slug' => $typeData['slug']],
                    array_merge($typeData, ['category_id' => $category->id])
                );
            }
        }
    }
}
