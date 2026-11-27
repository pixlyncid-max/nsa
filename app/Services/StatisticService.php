<?php

namespace App\Services;

use App\Enums\MembershipStatus;
use App\Models\Dpc;
use App\Models\FishCategory;
use App\Models\Partner;
use App\Models\Post;
use App\Models\Product;
use App\Models\Province;
use App\Models\StatisticSnapshot;
use App\Models\User;
use App\Support\PublicMediaUrl;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;

class StatisticService
{
    public const CACHE_KEY = 'nsa_home_statistics';

    public const CACHE_TTL = 3600; // 1 jam

    /**
     * Ambil data statistik dan ringkasan beranda dari cache per locale.
     *
     * @return array<string, mixed>
     */
    public function getHomeData(?string $locale = null): array
    {
        $activeLocale = $locale ?? app()->getLocale();

        return Cache::remember($this->cacheKey($activeLocale), self::CACHE_TTL, function () use ($activeLocale) {
            return $this->computeHomeData($activeLocale);
        });
    }

    public function cacheKey(?string $locale = null): string
    {
        $activeLocale = $locale ?? app()->getLocale();
        $defaultLocale = (string) config('locales.default', 'id');

        return $activeLocale === $defaultLocale
            ? self::CACHE_KEY
            : self::CACHE_KEY.':'.$activeLocale;
    }

    /**
     * Bersihkan cache statistik beranda untuk semua bahasa.
     */
    public function clearCache(): void
    {
        Cache::forget(self::CACHE_KEY);
        foreach ((array) config('locales.supported', ['id', 'en']) as $loc) {
            Cache::forget($this->cacheKey((string) $loc));
        }
    }

    /**
     * Hitung seluruh data agregasi statistik dan konten beranda.
     *
     * @return array<string, mixed>
     */
    public function computeHomeData(?string $locale = null): array
    {
        $activeLocale = $locale ?? app()->getLocale();

        $fishCategories = FishCategory::where('is_active', true)
            ->withLocale($activeLocale)
            ->get(['id', 'name', 'slug', 'icon']);

        // Data statistik dari snapshots dan data anggota approved
        $snapshots = StatisticSnapshot::with(['province', 'fishCategory'])
            ->where('year', 2025)
            ->get();

        // Anggota approved dengan lokasi usaha, aktivitas perikanan baru, dan komoditas legacy
        $approvedMembers = User::where('membership_status', MembershipStatus::Approved)
            ->with([
                'application.locations.province',
                'application.locations.regency',
                'application.fishActivities.fishCategory',
                'application.businesses',
                'application.membershipType',
                'business.province',
                'business.regency',
                'commodities.fishCategory',
            ])
            ->get();

        // Helper untuk memetakan provinsi anggota approved:
        // Prioritas 1: member_locations (kind = business)
        // Prioritas 2: member_locations (kind = domicile)
        // Fallback: member_businesses.province_id / member_profiles.province_id
        $resolveMemberProvinceId = function ($user): ?int {
            if ($user->application && $user->application->locations->isNotEmpty()) {
                $bizLoc = $user->application->locations->firstWhere('kind', 'business');
                if ($bizLoc && $bizLoc->province_id) {
                    return (int) $bizLoc->province_id;
                }
                $domLoc = $user->application->locations->firstWhere('kind', 'domicile');
                if ($domLoc && $domLoc->province_id) {
                    return (int) $domLoc->province_id;
                }
            }

            if ($user->business && $user->business->province_id) {
                return (int) $user->business->province_id;
            }

            if ($user->profile && $user->profile->province_id) {
                return (int) $user->profile->province_id;
            }

            return null;
        };

        // Helper untuk mencocokkan kategori ikan anggota approved:
        // Prioritas 1: member_fish_activities
        // Fallback: member_commodities (legacy)
        $memberHasCategory = function ($user, int $categoryId): bool {
            if ($user->application && $user->application->fishActivities->isNotEmpty()) {
                return $user->application->fishActivities->contains('fish_category_id', $categoryId);
            }

            if ($user->commodities->isNotEmpty()) {
                return $user->commodities->contains('fish_category_id', $categoryId);
            }

            return false;
        };

        // Hitung total dan breakdown per provinsi
        $provinces = Province::orderBy('id')->get();
        $provincesData = [];
        $totalFarmersNationwide = 0;

        foreach ($provinces as $province) {
            $provinceSnapshots = $snapshots->where('province_id', $province->id);
            $provinceApprovedMembers = $approvedMembers->filter(function ($user) use ($province, $resolveMemberProvinceId) {
                return $resolveMemberProvinceId($user) === (int) $province->id;
            });

            $byCategory = [];
            $provinceTotal = 0;

            // Hitung per kategori ikan
            foreach ($fishCategories as $cat) {
                $snapshotCount = (int) $provinceSnapshots->where('fish_category_id', $cat->id)->sum('farmer_count');

                // Tambahkan anggota live approved yang memiliki komoditas/aktivitas ikan ini
                $liveCount = $provinceApprovedMembers->filter(function ($user) use ($cat, $memberHasCategory) {
                    return $memberHasCategory($user, (int) $cat->id);
                })->count();

                $catCount = $snapshotCount + $liveCount;
                $byCategory[$cat->slug] = $catCount;
                $provinceTotal += $catCount;
            }

            $byCategory['all'] = $provinceTotal;
            $totalFarmersNationwide += $provinceTotal;

            $provincesData[] = [
                'id' => (int) $province->id,
                'name' => $province->name,
                'slug' => $province->slug,
                'farmer_count' => $provinceTotal,
                'by_category' => $byCategory,
            ];
        }

        // Urutkan provinsi berdasarkan jumlah pembudidaya terbanyak untuk ranking
        $rankedProvinces = collect($provincesData)
            ->where('farmer_count', '>', 0)
            ->sortByDesc('farmer_count')
            ->values()
            ->map(function ($item, $idx) {
                return [
                    'rank' => $idx + 1,
                    'id' => $item['id'],
                    'name' => $item['name'],
                    'farmer_count' => $item['farmer_count'],
                ];
            })
            ->all();

        // Angka Utama (Hero Stats)
        $approvedCount = $approvedMembers->count();
        $totalMembersDisplay = 12450 + $approvedCount; // Baseline asosiasi + live approved members
        $provincesReached = Province::whereHas('dpw')->count();
        if ($provincesReached === 0) {
            $provincesReached = 34; // Baseline jangkauan provinsi
        }
        $dpcCount = Dpc::count();
        if ($dpcCount === 0) {
            $dpcCount = 186; // Baseline cabang
        }
        $productCount = Product::where('is_active', true)->count();

        $summaryStats = [
            'total_members' => $totalMembersDisplay,
            'total_farmers' => $totalFarmersNationwide,
            'total_provinces' => $provincesReached,
            'total_dpcs' => $dpcCount,
            'total_products' => $productCount,
        ];

        // Data Grafik Perbandingan dan Tren Tahunan
        $categoryCharts = $this->computeCategoryCharts($snapshots, $approvedMembers, $fishCategories);

        // Berita & Artikel Terkini (semua pos yang tampil di publik untuk Beranda & Kilas Warta)
        $latestPosts = Post::with(['category' => fn ($q) => $q->withLocale($activeLocale), 'author'])
            ->withLocale($activeLocale)
            ->visiblePublicly()
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->limit(30)
            ->get()
            ->map(function (Post $post) use ($activeLocale) {
                return [
                    'id' => $post->id,
                    'type' => $post->type?->value ?? (string) $post->type,
                    'title' => $post->tr('title', $activeLocale),
                    'slug' => $post->slug,
                    'excerpt' => $post->tr('excerpt', $activeLocale),
                    'cover' => $post->coverUrl(),
                    'category' => $post->category?->tr('name', $activeLocale) ?? 'Warta NSA',
                    'published_at' => $post->published_at ? $post->published_at->translatedFormat('d F Y') : null,
                ];
            });

        // Produk Unggulan
        $featuredProducts = Product::with(['category' => fn ($q) => $q->withLocale($activeLocale), 'images'])
            ->withLocale($activeLocale)
            ->where('is_active', true)
            ->orderBy('id')
            ->limit(6)
            ->get()
            ->map(function (Product $prod) use ($activeLocale) {
                return [
                    'id' => $prod->id,
                    'name' => $prod->tr('name', $activeLocale),
                    'slug' => $prod->slug,
                    'description' => $prod->tr('description', $activeLocale),
                    'price' => (float) $prod->price,
                    'member_price' => $prod->member_price ? (float) $prod->member_price : null,
                    'location' => $prod->location,
                    'type' => $prod->type->value,
                    'category' => $prod->category?->tr('name', $activeLocale),
                    'image' => $prod->images->first()?->url(),
                ];
            });

        // Mitra Kami
        $partners = Partner::orderBy('order')
            ->withLocale($activeLocale)
            ->get(['id', 'name', 'type', 'logo', 'url'])
            ->map(fn (Partner $partner) => [
                'id' => $partner->id,
                'name' => $partner->name,
                'type' => $partner->tr('type', $activeLocale),
                'logo' => PublicMediaUrl::resolve($partner->logo),
                'url' => $partner->url,
            ]);

        // Anggota Terbaru (Nama Usaha & Kota/Kabupaten)
        $latestMembers = $this->getLatestMembers($approvedMembers);

        // Fakta Perikanan Hari Ini
        $fisheryFacts = $activeLocale === 'en'
            ? [
                [
                    'title' => 'Second Largest Global Producer',
                    'description' => 'Indonesia ranks as the world\'s second-largest aquaculture producer after China, backed by vast freshwater and marine farming potential.',
                ],
                [
                    'title' => 'National Tilapia Growth',
                    'description' => 'National tilapia production grows an average of 8.4% annually driven by biofloc and recirculating aquaculture system (RAS) adoption.',
                ],
                [
                    'title' => 'Shrimp Export Revenue',
                    'description' => 'Vannamei shrimp contributes over 35% of Indonesia\'s total fisheries export value, supplied by thousands of integrated coastal ponds.',
                ],
                [
                    'title' => 'Local Feed Independence',
                    'description' => 'NSA actively promotes independent floating feed formulations using local raw materials such as BSF maggot and fishmeal.',
                ],
            ]
            : [
                [
                    'title' => 'Produsen Terbesar Kedua Dunia',
                    'description' => 'Indonesia menempati posisi kedua produsen perikanan budidaya dunia setelah Tiongkok dengan potensi lahan air tawar dan laut yang sangat luas.',
                ],
                [
                    'title' => 'Komoditas Nila Nasional',
                    'description' => 'Produksi ikan nila nasional tumbuh rata-rata 8,4% per tahun berkat adopsi teknologi bioflok dan sirkulasi air tertutup (RAS).',
                ],
                [
                    'title' => 'Devisa Ekspor Udang',
                    'description' => 'Udang vaname menyumbang lebih dari 35% total nilai ekspor perikanan Indonesia, dipasok dari ribuan tambak pesisir terpadu.',
                ],
                [
                    'title' => 'Kemandirian Pakan Lokal',
                    'description' => 'NSA aktif mendorong formulasi pakan apung mandiri menggunakan bahan baku lokal seperti maggot BSF dan tepung ikan rucah.',
                ],
            ];

        return [
            'summaryStats' => $summaryStats,
            'provincesData' => $provincesData,
            'rankedProvinces' => array_slice($rankedProvinces, 0, 8),
            'fishCategories' => $fishCategories->map(fn (FishCategory $c) => [
                'id' => $c->id,
                'name' => $c->tr('name', $activeLocale),
                'slug' => $c->slug,
                'icon' => $c->icon,
            ]),
            'categoryCharts' => $categoryCharts,
            'latestPosts' => $latestPosts,
            'featuredProducts' => $featuredProducts,
            'partners' => $partners,
            'latestMembers' => $latestMembers,
            'fisheryFacts' => $fisheryFacts,
        ];
    }

    /**
     * Hitung perbandingan komoditas dan tren tahunan.
     *
     * @return array<string, mixed>
     */
    protected function computeCategoryCharts(Collection $snapshots, Collection $approvedMembers, Collection $fishCategories): array
    {
        // Hitung total nasional per kategori
        $distribution = [];
        $palette = [
            'ikan-lele' => '#014081',
            'ikan-nila' => '#056ED4',
            'ikan-mas' => '#27AAE1',
            'ikan-patin' => '#3AD1F3',
            'udang-vaname' => '#1E9E5A',
        ];

        $totalSum = 0;
        foreach ($fishCategories as $cat) {
            $count = (int) $snapshots->where('fish_category_id', $cat->id)->sum('farmer_count');
            $count += $approvedMembers->filter(function ($u) use ($cat) {
                if ($u->application && $u->application->fishActivities->isNotEmpty()) {
                    return $u->application->fishActivities->contains('fish_category_id', $cat->id);
                }

                return $u->commodities->contains('fish_category_id', $cat->id);
            })->count();

            if ($count > 0) {
                $totalSum += $count;
                $distribution[] = [
                    'name' => $cat->tr('name'),
                    'slug' => $cat->slug,
                    'count' => $count,
                    'color' => $palette[$cat->slug] ?? '#5B6B7F',
                ];
            }
        }

        // Tren pertumbuhan per tahun (2022 - 2025)
        $leleBase = (int) $snapshots->where('fishCategory.slug', 'ikan-lele')->sum('farmer_count');
        $nilaBase = (int) $snapshots->where('fishCategory.slug', 'ikan-nila')->sum('farmer_count');
        $masBase = (int) $snapshots->where('fishCategory.slug', 'ikan-mas')->sum('farmer_count');

        if ($leleBase === 0) {
            $leleBase = 58650;
        }
        if ($nilaBase === 0) {
            $nilaBase = 53100;
        }
        if ($masBase === 0) {
            $masBase = 26000;
        }

        $yearlyTrend = [
            [
                'year' => '2022',
                'lele' => (int) round($leleBase * 0.78),
                'nila' => (int) round($nilaBase * 0.74),
                'mas' => (int) round($masBase * 0.82),
            ],
            [
                'year' => '2023',
                'lele' => (int) round($leleBase * 0.85),
                'nila' => (int) round($nilaBase * 0.83),
                'mas' => (int) round($masBase * 0.88),
            ],
            [
                'year' => '2024',
                'lele' => (int) round($leleBase * 0.93),
                'nila' => (int) round($nilaBase * 0.92),
                'mas' => (int) round($masBase * 0.94),
            ],
            [
                'year' => '2025',
                'lele' => $leleBase,
                'nila' => $nilaBase,
                'mas' => $masBase,
            ],
        ];

        return [
            'distribution' => $distribution,
            'yearlyTrend' => $yearlyTrend,
        ];
    }

    /**
     * Dapatkan daftar anggota terdaftar terbaru (hanya nama usaha dan kota, tanpa data pribadi).
     *
     * @return array<int, array<string, string>>
     */
    protected function getLatestMembers(Collection $approvedMembers): array
    {
        $members = [];

        foreach ($approvedMembers as $member) {
            $businessName = null;
            if ($member->application && $member->application->businesses->isNotEmpty()) {
                $businessName = $member->application->businesses->first()->name;
            } elseif ($member->business) {
                $businessName = $member->business->name ?? $member->business->business_name;
            } elseif (! empty($member->application?->institution_name)) {
                $businessName = $member->application->institution_name;
            }

            if ($businessName) {
                $location = null;
                if ($member->application && $member->application->locations->isNotEmpty()) {
                    $loc = $member->application->locations->firstWhere('kind', 'business')
                        ?? $member->application->locations->firstWhere('kind', 'domicile');
                    $location = $loc?->regency?->name ?? $loc?->province?->name;
                }
                if (! $location && $member->business) {
                    $location = $member->business->regency?->name ?? $member->business->province?->name;
                }

                $members[] = [
                    'business_name' => $businessName,
                    'location' => $location ?? 'Indonesia',
                    'type' => $member->application?->membershipType?->name
                        ?? $member->application?->membership_category
                        ?? $member->business?->membership_type
                        ?? 'Pembudidaya',
                ];
            }
        }

        // Jika data anggota terdaftar masih sedikit dari seeder, tambahkan entri demo terverifikasi
        $demoFallback = [
            ['business_name' => 'Mina Sejahtera Aquaculture', 'location' => 'Kabupaten Bogor', 'type' => 'Pembudidaya'],
            ['business_name' => 'Tambak Vaname Bahari', 'location' => 'Kabupaten Sidoarjo', 'type' => 'Pembudidaya'],
            ['business_name' => 'Bioflok Khatulistiwa Mandiri', 'location' => 'Kota Pontianak', 'type' => 'Pembudidaya'],
            ['business_name' => 'Mina Barokah Pasundan', 'location' => 'Kabupaten Sukabumi', 'type' => 'Pembudidaya'],
            ['business_name' => 'Celebes Aqua Perkasa', 'location' => 'Kabupaten Pangkep', 'type' => 'Pelaku Usaha'],
        ];

        return array_slice(array_merge($members, $demoFallback), 0, 5);
    }
}
