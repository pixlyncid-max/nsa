<?php

namespace Tests\Feature;

use App\Models\Setting;
use App\Support\Brand;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BrandLogoTest extends TestCase
{
    use RefreshDatabase;

    public function test_generated_brand_logo_manifest_and_variants_exist_with_valid_aspect_ratio(): void
    {
        $manifestPath = resource_path('js/generated/brand-logo.json');
        $this->assertFileExists($manifestPath);

        $manifest = json_decode((string) file_get_contents($manifestPath), true);
        $this->assertIsArray($manifest);
        $this->assertTrue($manifest['available']);
        $this->assertSame('mono-white', $manifest['footerMode']);
        $this->assertGreaterThan(2.0, $manifest['ratio']);

        // Pastikan seluruh file turunan navbar & footer (termasuk mono-white) ada di public/images/brand/
        foreach (['1x', '2x', '3x'] as $scale) {
            $this->assertFileExists(public_path(ltrim($manifest['navbar']['webp'][$scale], '/')));
            $this->assertFileExists(public_path(ltrim($manifest['navbar']['png'][$scale], '/')));
            $this->assertFileExists(public_path(ltrim($manifest['footer']['webp'][$scale], '/')));
            $this->assertFileExists(public_path(ltrim($manifest['footer']['png'][$scale], '/')));
            $this->assertFileExists(public_path(ltrim($manifest['footer']['whiteWebp'][$scale], '/')));
            $this->assertFileExists(public_path(ltrim($manifest['footer']['whitePng'][$scale], '/')));
        }
    }

    public function test_brand_props_share_logo_footer_mode_and_settings_override(): void
    {
        config(['brand.logo.footer_mode' => 'white-badge']);
        Setting::set('brand_logo_dark', 'brand/custom-dark.png');

        $brand = Brand::toArray();
        $this->assertSame('white-badge', $brand['logo_footer_mode']);
        $this->assertStringContainsString('brand/custom-dark.png', (string) $brand['logo_dark']);

        $this->get('/')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('brand.logo_footer_mode', 'white-badge')
            );

        $this->get('/en')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('locale', 'en')
                ->where('brand.logo_footer_mode', 'white-badge')
            );
    }
}
