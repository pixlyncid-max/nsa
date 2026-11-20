<?php

namespace Database\Seeders;

use App\Models\MembershipPlan;
use Illuminate\Database\Seeder;

class MembershipPlanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $plans = [
            [
                'name' => 'Anggota Biasa (Pembudidaya & Nelayan)',
                'slug' => 'anggota-biasa',
                'description' => 'Ditujukan khusus bagi pembudidaya ikan air tawar, payau, laut, petambak, dan nelayan perorangan maupun kelompok tani.',
                'benefits' => [
                    'Kartu Tanda Anggota (KTA) resmi berbarcode & nomor register nasional',
                    'Akses ke rantai pasok pakan pabrikan & benih bersertifikasi dengan harga anggota',
                    'Bimbingan teknis budidaya, penanganan penyakit ikan, dan standarisasi CBIB/CPIB',
                    'Hak suara penuh dalam musyawarah cabang (DPC) & temu akbar nasional NSA',
                    'Akses pendampingan perizinan berusaha OSS-RBA perikanan',
                ],
                'annual_fee' => 150000,
                'badge' => 'Pilihan Populer',
                'is_popular' => true,
                'is_active' => true,
                'order' => 1,
            ],
            [
                'name' => 'Anggota Luar Biasa (Pelaku Usaha & Korporasi)',
                'slug' => 'anggota-luar-biasa',
                'description' => 'Ditujukan bagi badan usaha perikanan (CV, PT, Koperasi), industri pengolahan, produsen pakan, importir, dan eksportir komoditas.',
                'benefits' => [
                    'Seluruh manfaat paket Anggota Biasa untuk perwakilan manajemen usaha',
                    'Profil perusahaan terverifikasi di direktori B2B & katalog mitra nasional NSA',
                    'Fasilitasi temu bisnis (business matching) dengan off-taker domestik dan pasar ekspor',
                    'Advokasi kebijakan regulasi perikanan, perpajakan, dan karantina ikan',
                    'Prioritas menjadi sponsor dan mitra utama dalam expo serta konferensi tahunan',
                ],
                'annual_fee' => 1200000,
                'badge' => 'Pelaku Usaha',
                'is_popular' => false,
                'is_active' => true,
                'order' => 2,
            ],
            [
                'name' => 'Anggota Kehormatan & Akademisi',
                'slug' => 'anggota-kehormatan-akademisi',
                'description' => 'Ditujukan bagi dosen, peneliti, mahasiswa perikanan, konsultan akuakultur, serta tokoh pemerhati kelestarian perikanan.',
                'benefits' => [
                    'KTA digital keanggotaan ilmiah dan jejaring pakar akuakultur',
                    'Akses basis data statistik riset lapangan dan komoditas perikanan nasional',
                    'Peluang kolaborasi riset terapan bersama ratusan kelompok pembudidaya',
                    'Akses jurnal, buletin riset perikanan berkala, dan diskon seminar internasional',
                ],
                'annual_fee' => 75000,
                'badge' => 'Riset & Edukasi',
                'is_popular' => false,
                'is_active' => true,
                'order' => 3,
            ],
        ];

        foreach ($plans as $plan) {
            MembershipPlan::updateOrCreate(
                ['slug' => $plan['slug']],
                $plan
            );
        }
    }
}
