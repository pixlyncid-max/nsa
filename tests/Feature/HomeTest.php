<?php

namespace Tests\Feature;

use App\Services\StatisticService;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class HomeTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_home_page_renders_successfully(): void
    {
        $this->withoutVite();

        $response = $this->get('/');

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Public/Home')
            ->has('summaryStats')
            ->has('provincesData')
            ->has('fishCategories')
            ->has('categoryCharts')
            ->has('latestPosts')
            ->has('featuredProducts')
            ->has('partners')
            ->has('fisheryFacts')
        );
    }

    public function test_statistic_service_computes_and_caches_data(): void
    {
        /** @var StatisticService $service */
        $service = app(StatisticService::class);
        $service->clearCache();

        $this->assertFalse(Cache::has(StatisticService::CACHE_KEY));

        $data = $service->getHomeData();

        $this->assertTrue(Cache::has(StatisticService::CACHE_KEY));
        $this->assertArrayHasKey('summaryStats', $data);
        $this->assertGreaterThan(0, $data['summaryStats']['total_farmers']);
        $this->assertGreaterThan(0, $data['summaryStats']['total_members']);
        $this->assertGreaterThan(0, $data['summaryStats']['total_products']);
        $this->assertNotEmpty($data['provincesData']);

        // Pastikan snapshot Jawa Barat dan Jawa Timur terhitung
        $jabar = collect($data['provincesData'])->firstWhere('id', 32);
        $this->assertNotNull($jabar);
        $this->assertGreaterThan(0, $jabar['farmer_count']);
        $this->assertArrayHasKey('ikan-lele', $jabar['by_category']);
        $this->assertGreaterThan(0, $jabar['by_category']['ikan-lele']);

        // Verifikasi cache invalidation
        $service->clearCache();
        $this->assertFalse(Cache::has(StatisticService::CACHE_KEY));
    }
}
