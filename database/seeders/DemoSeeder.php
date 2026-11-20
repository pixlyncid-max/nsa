<?php

namespace Database\Seeders;

use App\Enums\PostType;
use App\Enums\ProductType;
use App\Models\Dpc;
use App\Models\DpcMember;
use App\Models\DppMember;
use App\Models\Dpw;
use App\Models\DpwMember;
use App\Models\FishCategory;
use App\Models\Page;
use App\Models\Partner;
use App\Models\Post;
use App\Models\PostCategory;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\Setting;
use App\Models\StatisticSnapshot;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DemoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. DPP Members
        $dppData = [
            [
                'name' => 'Dr. Ir. Hendra Gunawan, M.Si',
                'position' => 'Ketua Umum',
                'order' => 1,
                'period' => '2024-2029',
                'bio' => 'Praktisi dan akademisi perikanan dengan pengalaman lebih dari 25 tahun di bidang budidaya air tawar dan marikultur modern.',
            ],
            [
                'name' => 'Bambang Sudarmono, S.Pi',
                'position' => 'Sekretaris Jenderal',
                'order' => 2,
                'period' => '2024-2029',
                'bio' => 'Penggerak kelembagaan asosiasi perikanan dan pemerhati regulasi perlindungan nelayan budidaya.',
            ],
            [
                'name' => 'Hj. Ratna Dewi Sartika, S.E',
                'position' => 'Bendahara Umum',
                'order' => 3,
                'period' => '2024-2029',
                'bio' => 'Pengusaha pakan mandiri dan eksportir komoditas olahan perikanan air tawar.',
            ],
            [
                'name' => 'Ir. Agus Wijaya',
                'position' => 'Ketua Bidang Budidaya Air Tawar',
                'order' => 4,
                'period' => '2024-2029',
                'bio' => 'Pelopor integrasi sistem bioflok dan sirkulasi air tertutup (RAS) di Jawa Barat.',
            ],
            [
                'name' => 'Ferry Sitorus, S.St.Pi',
                'position' => 'Ketua Bidang Marikultur & Kelautan',
                'order' => 5,
                'period' => '2024-2029',
                'bio' => 'Konsultan budidaya kerapu tambak dan rumput laut di perairan Indonesia Timur.',
            ],
        ];

        foreach ($dppData as $dpp) {
            DppMember::updateOrCreate(
                ['name' => $dpp['name']],
                $dpp
            );
        }

        // 2. DPW (Tingkat Provinsi) & DPW Members
        $dpwConfigs = [
            [
                'province_id' => 32, // Jawa Barat
                'name' => 'DPW NSA Jawa Barat',
                'address' => 'Jl. Soekarno Hatta No. 452, Bandung, Jawa Barat',
                'phone' => '022-7561234',
                'email' => 'dpw.jabar@nsa.test',
                'members' => [
                    ['name' => 'Ahmad Fauzi, S.Pi', 'position' => 'Ketua DPW', 'order' => 1],
                    ['name' => 'Dadan Ramdani', 'position' => 'Sekretaris', 'order' => 2],
                    ['name' => 'Sri Wahyuni, S.E', 'position' => 'Bendahara', 'order' => 3],
                ],
            ],
            [
                'province_id' => 35, // Jawa Timur
                'name' => 'DPW NSA Jawa Timur',
                'address' => 'Jl. Jemursari No. 108, Surabaya, Jawa Timur',
                'phone' => '031-8439876',
                'email' => 'dpw.jatim@nsa.test',
                'members' => [
                    ['name' => 'H. Suwandi Santoso', 'position' => 'Ketua DPW', 'order' => 1],
                    ['name' => 'Tri Prasetyo, M.P', 'position' => 'Sekretaris', 'order' => 2],
                    ['name' => 'Lestari Handayani', 'position' => 'Bendahara', 'order' => 3],
                ],
            ],
            [
                'province_id' => 61, // Kalimantan Barat
                'name' => 'DPW NSA Kalimantan Barat',
                'address' => 'Jl. Ahmad Yani No. 89, Pontianak, Kalimantan Barat',
                'phone' => '0561-734567',
                'email' => 'dpw.kalbar@nsa.test',
                'members' => [
                    ['name' => 'Zulkifli Al-Habsyi, S.Pi', 'position' => 'Ketua DPW', 'order' => 1],
                    ['name' => 'Hermanto', 'position' => 'Sekretaris', 'order' => 2],
                ],
            ],
            [
                'province_id' => 73, // Sulawesi Selatan
                'name' => 'DPW NSA Sulawesi Selatan',
                'address' => 'Jl. Perintis Kemerdekaan KM 11, Makassar, Sulawesi Selatan',
                'phone' => '0411-587654',
                'email' => 'dpw.sulsel@nsa.test',
                'members' => [
                    ['name' => 'Andi Muh. Rasyid', 'position' => 'Ketua DPW', 'order' => 1],
                    ['name' => 'Kaharuddin, S.St.Pi', 'position' => 'Sekretaris', 'order' => 2],
                ],
            ],
        ];

        foreach ($dpwConfigs as $cfg) {
            $dpw = Dpw::updateOrCreate(
                ['province_id' => $cfg['province_id']],
                [
                    'name' => $cfg['name'],
                    'address' => $cfg['address'],
                    'phone' => $cfg['phone'],
                    'email' => $cfg['email'],
                    'period' => '2024-2029',
                ]
            );

            foreach ($cfg['members'] as $m) {
                DpwMember::updateOrCreate(
                    ['dpw_id' => $dpw->id, 'name' => $m['name']],
                    ['position' => $m['position'], 'order' => $m['order']]
                );
            }
        }

        // 3. DPC (Tingkat Kabupaten/Kota — Terpisah, berelasi ke regencies)
        $dpcConfigs = [
            [
                'regency_id' => 3201, // Kabupaten Bogor
                'name' => 'DPC NSA Kabupaten Bogor',
                'address' => 'Jl. Raya Cikaret No. 24, Cibinong, Kabupaten Bogor',
                'phone' => '021-8790123',
                'email' => 'dpc.bogor@nsa.test',
                'members' => [
                    ['name' => 'Cecep Supriyadi', 'position' => 'Ketua DPC', 'order' => 1],
                    ['name' => 'Indra Lesmana', 'position' => 'Sekretaris', 'order' => 2],
                ],
            ],
            [
                'regency_id' => 3515, // Kabupaten Sidoarjo
                'name' => 'DPC NSA Kabupaten Sidoarjo',
                'address' => 'Jl. Pahlawan No. 56, Sidoarjo, Jawa Timur',
                'phone' => '031-8941234',
                'email' => 'dpc.sidoarjo@nsa.test',
                'members' => [
                    ['name' => 'Sugeng Rianto', 'position' => 'Ketua DPC', 'order' => 1],
                    ['name' => 'Yusuf Wibowo', 'position' => 'Sekretaris', 'order' => 2],
                ],
            ],
            [
                'regency_id' => 6171, // Kota Pontianak
                'name' => 'DPC NSA Kota Pontianak',
                'address' => 'Jl. Gajah Mada No. 120, Kota Pontianak',
                'phone' => '0561-748900',
                'email' => 'dpc.pontianak@nsa.test',
                'members' => [
                    ['name' => 'Gunawan Tan', 'position' => 'Ketua DPC', 'order' => 1],
                    ['name' => 'Rahmat Hidayat', 'position' => 'Sekretaris', 'order' => 2],
                ],
            ],
        ];

        foreach ($dpcConfigs as $dpcCfg) {
            $dpc = Dpc::updateOrCreate(
                ['regency_id' => $dpcCfg['regency_id']],
                [
                    'name' => $dpcCfg['name'],
                    'address' => $dpcCfg['address'],
                    'phone' => $dpcCfg['phone'],
                    'email' => $dpcCfg['email'],
                    'period' => '2024-2029',
                ]
            );

            foreach ($dpcCfg['members'] as $dm) {
                DpcMember::updateOrCreate(
                    ['dpc_id' => $dpc->id, 'name' => $dm['name']],
                    ['position' => $dm['position'], 'order' => $dm['order']]
                );
            }
        }

        // 4. Statistic Snapshots (Lele, Nila, Mas, dll.)
        $fishCategories = FishCategory::all()->keyBy('name');
        if ($fishCategories->isNotEmpty()) {
            $stats = [
                // Jawa Barat
                ['province_id' => 32, 'cat' => 'Ikan Lele', 'count' => 14250],
                ['province_id' => 32, 'cat' => 'Ikan Nila', 'count' => 18600],
                ['province_id' => 32, 'cat' => 'Ikan Mas', 'count' => 9800],
                ['province_id' => 32, 'cat' => 'Ikan Patin', 'count' => 4500],
                // Jawa Timur
                ['province_id' => 35, 'cat' => 'Ikan Lele', 'count' => 22400],
                ['province_id' => 35, 'cat' => 'Ikan Nila', 'count' => 15300],
                ['province_id' => 35, 'cat' => 'Udang Vaname', 'count' => 11200],
                // Jawa Tengah
                ['province_id' => 33, 'cat' => 'Ikan Lele', 'count' => 16800],
                ['province_id' => 33, 'cat' => 'Ikan Nila', 'count' => 12900],
                ['province_id' => 33, 'cat' => 'Ikan Mas', 'count' => 6400],
                // Kalimantan Barat
                ['province_id' => 61, 'cat' => 'Ikan Lele', 'count' => 5200],
                ['province_id' => 61, 'cat' => 'Ikan Nila', 'count' => 6800],
                // Sulawesi Selatan
                ['province_id' => 73, 'cat' => 'Udang Vaname', 'count' => 14300],
                ['province_id' => 73, 'cat' => 'Ikan Nila', 'count' => 8400],
            ];

            foreach ($stats as $st) {
                if (isset($fishCategories[$st['cat']])) {
                    StatisticSnapshot::updateOrCreate(
                        [
                            'province_id' => $st['province_id'],
                            'fish_category_id' => $fishCategories[$st['cat']]->id,
                            'year' => 2025,
                            'source' => 'members',
                        ],
                        [
                            'farmer_count' => $st['count'],
                        ]
                    );
                }
            }
        }

        // 5. Products across Types & Categories
        $subCats = ProductCategory::whereNotNull('parent_id')->get()->keyBy('name');
        if ($subCats->isNotEmpty()) {
            $demoProducts = [
                [
                    'sub' => 'Pelet Pakan Ikan',
                    'type' => ProductType::Physical,
                    'name' => 'Pelet Pakan Apung PrimaFeed LP-3 (Sak 30kg)',
                    'desc' => 'Pakan apung protein 32% diformulasikan khusus untuk pertumbuhan optimal ikan lele dan patin fase pembesaran.',
                    'price' => 345000,
                    'member_price' => 320000,
                    'stock' => 150,
                    'weight' => 30000,
                    'location' => 'Bogor, Jawa Barat',
                ],
                [
                    'sub' => 'Bibit',
                    'type' => ProductType::Physical,
                    'name' => 'Benih Ikan Nila Nirwana 3 Ukuran 5-7 cm (Paket 1.000 Ekor)',
                    'desc' => 'Benih bersertifikat CPIB dengan tingkat kelangsungan hidup (SR) tinggi dan daya tahan penyakit optimal.',
                    'price' => 450000,
                    'member_price' => 400000,
                    'stock' => 50,
                    'weight' => 5000,
                    'location' => 'Sukabumi, Jawa Barat',
                ],
                [
                    'sub' => 'Sewa Kapal',
                    'type' => ProductType::Rental,
                    'name' => 'Sewa Kapal Nelayan KM Mina Bahari 12 GT (Per Hari)',
                    'desc' => 'Sewa kapal penangkapan dan survei riset laut lengkap dengan kapten berpengalaman dan GPS Garmin.',
                    'price' => 1850000,
                    'member_price' => 1650000,
                    'stock' => 2,
                    'weight' => 0,
                    'location' => 'Kepulauan Seribu, DKI Jakarta',
                ],
                [
                    'sub' => 'Kolam Pemancingan',
                    'type' => ProductType::Spot,
                    'name' => 'Tiket Harian Kolam Pemancingan Galatama Telaga Mina',
                    'desc' => 'Akses pemancingan ikan mas dan bawal monster dengan fasilitas gazebo, kantin, dan timbang ikan otomatis.',
                    'price' => 120000,
                    'member_price' => 100000,
                    'stock' => 80,
                    'weight' => 0,
                    'location' => 'Sidoarjo, Jawa Timur',
                ],
                [
                    'sub' => 'Komunitas Air Tawar',
                    'type' => ProductType::Community,
                    'name' => 'Keanggotaan Komunitas Pembudidaya Bioflok Mandiri',
                    'desc' => 'Akses grup pendampingan teknisi ahli, konsultasi penanganan penyakit air tawar, dan sharing pasar regional.',
                    'price' => 0,
                    'member_price' => 0,
                    'stock' => 9999,
                    'weight' => 0,
                    'location' => 'Nasional',
                ],
                [
                    'sub' => 'Vitamin',
                    'type' => ProductType::Physical,
                    'name' => 'Probiotik Multi-Strain AquaBio Plus 1 Liter',
                    'desc' => 'Menguraikan amonia kolam, menjaga kestabilan plankton, dan meningkatkan nafsu makan ikan.',
                    'price' => 85000,
                    'member_price' => 75000,
                    'stock' => 300,
                    'weight' => 1200,
                    'location' => 'Surabaya, Jawa Timur',
                ],
            ];

            foreach ($demoProducts as $dp) {
                if (isset($subCats[$dp['sub']])) {
                    Product::updateOrCreate(
                        ['slug' => Str::slug($dp['name'])],
                        [
                            'category_id' => $subCats[$dp['sub']]->id,
                            'type' => $dp['type'],
                            'name' => $dp['name'],
                            'description' => $dp['desc'],
                            'price' => $dp['price'],
                            'member_price' => $dp['member_price'],
                            'stock' => $dp['stock'],
                            'weight' => $dp['weight'],
                            'location' => $dp['location'],
                            'is_active' => true,
                        ]
                    );
                }
            }
        }

        // 6. Posts (News & Articles)
        $author = User::where('email', 'admin@nsa.test')->first() ?? User::first();
        $postCat = PostCategory::updateOrCreate(
            ['slug' => 'kebijakan-industri'],
            ['name' => 'Kebijakan & Industri']
        );
        $postCatTech = PostCategory::updateOrCreate(
            ['slug' => 'teknologi-budidaya'],
            ['name' => 'Teknologi Budidaya']
        );

        $postsData = [
            [
                'type' => PostType::News,
                'category_id' => $postCat->id,
                'author_id' => $author?->id,
                'title' => 'NSA Dorong Hilirisasi Perikanan Budidaya Nasional untuk Ketahanan Pangan',
                'excerpt' => 'Asosiasi memaparkan peta jalan peningkatan efisiensi pakan dan penguatan rantai pasok dingin antar pulau.',
                'body' => 'Pengurus Pusat NSA resmi menyampaikan rekomendasi strategis mengenai peningkatan mutu produksi perikanan budidaya air tawar dan laut. Dalam dialog bersama pemangku kepentingan nasional, ditekankan pentingnya adopsi teknologi tepat guna di tingkat pembudidaya rakyat agar hasil panen memiliki standar keamanan pangan yang konsisten.',
                'status' => 'published',
                'published_at' => now()->subDays(2),
            ],
            [
                'type' => PostType::News,
                'category_id' => $postCat->id,
                'author_id' => $author?->id,
                'title' => 'Pembentukan DPC NSA Baru di Lima Kabupaten Sentra Tambak Indonesia',
                'excerpt' => 'Langkah nyata mendekatkan pendampingan teknis dan akses pasar langsung kepada para petambak lokal.',
                'body' => 'NSA terus memperluas jaringan kepengurusan cabang di daerah sentra produksi. Kehadiran DPC diharapkan mampu memfasilitasi kebutuhan bibit unggul, legalitas berusaha NIB, hingga mitigasi penyakit secara cepat.',
                'status' => 'published',
                'published_at' => now()->subDays(5),
            ],
            [
                'type' => PostType::Article,
                'category_id' => $postCatTech->id,
                'author_id' => $author?->id,
                'title' => 'Strategi Manajemen Kualitas Air Kolam Bioflok Menghadapi Cuaca Ekstrem',
                'excerpt' => 'Langkah praktis menjaga kestabilan DO, pH, dan rasio C/N saat intensitas hujan tinggi.',
                'body' => 'Fluktuasi suhu dan keasaman akibat hujan asam sering menjadi tantangan terbesar pembudidaya bioflok. Artikel ini membahas langkah preventif mulai dari pengapuran bertahap, penambahan sumber karbon molase, hingga aerasi optimal agar flok bakteri menguntungkan tetap stabil.',
                'status' => 'published',
                'published_at' => now()->subDays(7),
            ],
        ];

        foreach ($postsData as $p) {
            Post::updateOrCreate(
                ['slug' => Str::slug($p['title'])],
                $p
            );
        }

        // 7. Partners
        $partners = [
            ['name' => 'Kementerian Kelautan dan Perikanan RI', 'type' => 'Regulator & Pembina', 'logo' => '/images/partners/kkp.png', 'order' => 1],
            ['name' => 'Institut Pertanian Bogor (IPB University)', 'type' => 'Akademisi & Riset', 'logo' => '/images/partners/ipb.png', 'order' => 2],
            ['name' => 'Balai Riset Budidaya Air Tawar (BBPBAT)', 'type' => 'Litbang Pemerintah', 'logo' => '/images/partners/bbpbat.png', 'order' => 3],
            ['name' => 'Himpunan Nelayan Seluruh Indonesia', 'type' => 'Organisasi Mitra', 'logo' => '/images/partners/hnsi.png', 'order' => 4],
        ];

        foreach ($partners as $ptr) {
            Partner::updateOrCreate(
                ['name' => $ptr['name']],
                $ptr
            );
        }

        // 8. Settings
        $settings = [
            'site_name' => 'NSA (Nusantara Sustainable Aquatic)',
            'brand_name' => 'NSA (Nusantara Sustainable Aquatic)',
            'brand_short_name' => 'NSA',
            'brand_tagline' => 'Asosiasi Akuakultur dan Perikanan Berkelanjutan Nusantara',
            'site_tagline' => 'Bersatu Memajukan Perikanan dan Budidaya Indonesia',
            'contact_email' => 'info@nsa.or.id',
            'brand_support_email' => 'info@nsa.or.id',
            'contact_phone' => '+62 812-3456-7890',
            'brand_support_phone' => '+62 812-3456-7890',
            'contact_address' => 'Jl. Pajajaran No. 128, Baranangsiang, Bogor, Jawa Barat 16143',
            'brand_address' => 'Jl. Pajajaran No. 128, Baranangsiang, Bogor, Jawa Barat 16143',
            'bank_name' => 'Bank Mandiri',
            'bank_account_number' => '123-00-9876543-2',
            'bank_account_holder' => 'Perkumpulan NSA Indonesia',
        ];

        foreach ($settings as $k => $v) {
            Setting::set($k, $v);
        }

        // 9. Static Pages (Tentang Kami)
        Page::updateOrCreate(
            ['slug' => 'tentang-kami'],
            [
                'title' => 'Tentang NSA (Nusantara Sustainable Aquatic)',
                'body' => [
                    'subtitle' => 'Wadah Persatuan Pembudidaya, Pelaku Usaha, dan Pemerhati Perikanan Nusantara',
                    'history' => 'Didirikan pada tahun 2018 di Bogor, NSA (Nusantara Sustainable Aquatic) lahir dari keresahan bersama para pelaku budidaya air tawar dan petambak pesisir terhadap tingginya biaya pakan serta fluktuasi harga panen. Berawal dari forum diskusi lapangan peternak lele dan nila, gerakan ini berkembang pesat menjadi kongres nasional yang menyatukan ribuan pembudidaya, akademisi, eksportir, hingga penyedia teknologi di seluruh Indonesia.',
                    'vision' => 'Terwujudnya industri perikanan budidaya dan akuakultur nasional yang tangguh, berdaulat, ramah lingkungan, dan menjadi pilar utama ketahanan pangan dunia.',
                    'missions' => [
                        'Mendorong pemerataan teknologi budidaya tepat guna (RAS, bioflok, IoT) untuk menekan biaya produksi dan meningkatkan rasio konversi pakan (FCR).',
                        'Membangun jejaring rantai pasok terintegrasi dari benih unggul bersertifikat hingga akses pasar ekspor tanpa perantara yang merugikan.',
                        'Melakukan advokasi kebijakan publik serta pendampingan legalitas berusaha (NIB, sertifikasi CBIB/CPIB) bagi pembudidaya skala mikro dan kecil.',
                        'Menguatkan tata kelola organisasi melalui Dewan Pengurus Wilayah (DPW) dan Dewan Pengurus Cabang (DPC) di setiap sentra perikanan daerah.',
                    ],
                    'values' => [
                        [
                            'title' => 'Keberlanjutan Ekosistem',
                            'desc' => 'Menjaga kemurnian sumber daya perairan dan menerapkan prinsip biosekuriti demi keberlangsungan budidaya jangka panjang.',
                        ],
                        [
                            'title' => 'Kemandirian Pembudidaya',
                            'desc' => 'Mendukung formulasi pakan mandiri bermutu tinggi dan penguasaan teknik pembenihan mandiri oleh rakyat.',
                        ],
                        [
                            'title' => 'Solidaritas & Gotong Royong',
                            'desc' => 'Berbagi data panen, harga pasar regional, dan saling menopang saat terjadi wabah penyakit ikan.',
                        ],
                        [
                            'title' => 'Integritas Ilmiah',
                            'desc' => 'Setiap rekomendasi budidaya didasarkan pada riset sains terapan dan verifikasi empiris di kolam uji.',
                        ],
                    ],
                    'legalities' => [
                        ['label' => 'Akta Notaris Pendirian', 'value' => 'No. 24 Tanggal 18 Juli 2019 (Notaris Dr. Suhendra, S.H., M.Kn)'],
                        ['label' => 'SK Kemenkumham RI', 'value' => 'AHU-0008452.AH.01.07.TAHUN 2019'],
                        ['label' => 'Nomor Pokok Wajib Pajak (NPWP)', 'value' => '92.124.789.2-072.000'],
                        ['label' => 'Izin Operasional Asosiasi', 'value' => 'Kemenlut RI No. 503/AS-NSA/2020'],
                    ],
                ],
            ]
        );
    }
}
