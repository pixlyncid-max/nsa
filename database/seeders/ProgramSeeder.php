<?php

namespace Database\Seeders;

use App\Enums\ProgramCategory;
use App\Models\Program;
use Illuminate\Database\Seeder;

class ProgramSeeder extends Seeder
{
    /**
     * Seed contoh program kerja NSA lintas kategori.
     */
    public function run(): void
    {
        $programs = [
            [
                'title' => 'Pelatihan Budidaya Berkelanjutan & Manajemen Kualitas Air',
                'slug' => 'pelatihan-budidaya-berkelanjutan-manajemen-air',
                'category' => ProgramCategory::Pelatihan,
                'summary' => 'Pelatihan komprehensif bagi pembudidaya untuk mengoptimalkan efisiensi pakan (FCR) dan mitigasi penyakit kolam.',
                'body' => '<p>Program pelatihan ini mencakup pemantauan parameter DO, pH, nitrit, dan amonia menggunakan instrumen sensor modern, formulasi probiotik lokal, dan mitigasi penyakit vibrio serta white spot.</p>',
                'status' => 'published',
                'is_public' => true,
                'starts_at' => now()->addWeeks(2),
                'ends_at' => now()->addWeeks(3),
                'order' => 1,
            ],
            [
                'title' => 'Pendampingan Sertifikasi CBIB dan CPIB Nasional',
                'slug' => 'pendampingan-sertifikasi-cbib-cpib-nasional',
                'category' => ProgramCategory::Pendampingan,
                'summary' => 'Fasilitasi konsultasi langsung dari tim pakar NSA agar unit budidaya siap lolos audit verifikasi KKP.',
                'body' => '<p>Pendampingan audit pra-sertifikasi Cara Budidaya Ikan yang Baik (CBIB) dan Cara Pembenihan Ikan yang Baik (CPIB) hingga terbit sertifikat resmi.</p>',
                'status' => 'published',
                'is_public' => true,
                'starts_at' => now()->addMonth(),
                'ends_at' => now()->addMonths(2),
                'order' => 2,
            ],
            [
                'title' => 'Dashboard Intelijen Pasar & Fluktuasi Harga Ikan Nasional',
                'slug' => 'dashboard-intelijen-pasar-harga-ikan-nasional',
                'category' => ProgramCategory::InformasiPasar,
                'summary' => 'Penyediaan data real-time harga komoditas perikanan air tawar dan laut di sentra pasar induk.',
                'body' => '<p>Anggota memperoleh laporan mingguan pergerakan harga bandeng, lele, udang vaname, dan tuna di pasar lokal maupun indikasi harga FOB ekspor.</p>',
                'status' => 'published',
                'is_public' => true,
                'starts_at' => now(),
                'ends_at' => now()->addYear(),
                'order' => 3,
            ],
            [
                'title' => 'Konsorsium Kemitraan Ekspor dan Akses Offtaker Industri',
                'slug' => 'konsorsium-kemitraan-ekspor-offtaker-industri',
                'category' => ProgramCategory::AksesKemitraan,
                'summary' => 'Menghubungkan petambak anggota dengan pabrik pengolahan ikan berstandar HACCP dan buyer internasional.',
                'body' => '<p>NSA menjembatani kontrak pembelian pasti (offtake contract) dengan harga adil, kepastian pembayaran, dan jaminan penyerapan panen petambak anggota.</p>',
                'status' => 'published',
                'is_public' => true,
                'starts_at' => now()->addWeeks(4),
                'ends_at' => now()->addMonths(6),
                'order' => 4,
            ],
            [
                'title' => 'Adopsi Teknologi IoT Sensor Kolam & Sistem Bioflok Mandiri',
                'slug' => 'adopsi-teknologi-iot-sensor-kolam-bioflok',
                'category' => ProgramCategory::TeknologiBudidaya,
                'summary' => 'Demoplot dan workshop instalasi sensor telemetri air berbasis solar panel dan integrasi bioflok padat tebar tinggi.',
                'body' => '<p>Pengenalan otomasi aerasi berbasis sensor oksigen terlarut dan sistem sirkulasi air tertutup (RAS) hemat air untuk perkotaan dan pesisir.</p>',
                'status' => 'published',
                'is_public' => true,
                'starts_at' => now()->addMonths(2),
                'ends_at' => now()->addMonths(3),
                'order' => 5,
            ],
            [
                'title' => 'Klinik Usaha Perikanan & Fasilitasi Kredit Usaha Rakyat (KUR)',
                'slug' => 'klinik-usaha-perikanan-fasilitasi-kur',
                'category' => ProgramCategory::PengembanganUsaha,
                'summary' => 'Penyusunan studi kelayakan usaha tambak, pembukuan digital, dan rekomendasi kemitraan bank Himbara.',
                'body' => '<p>Membantu anggota menyusun proposal bisnis akuakultur, kelayakan teknis perbankan, dan fasilitasi subsidi bunga pembiayaan KUR maritim.</p>',
                'status' => 'published',
                'is_public' => true,
                'starts_at' => now()->addWeeks(1),
                'ends_at' => now()->addMonths(4),
                'order' => 6,
            ],
        ];

        foreach ($programs as $prog) {
            Program::updateOrCreate(
                ['slug' => $prog['slug']],
                $prog
            );
        }
    }
}
