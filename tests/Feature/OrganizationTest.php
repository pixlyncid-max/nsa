<?php

namespace Tests\Feature;

use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class OrganizationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_organisasi_redirects_to_dpp(): void
    {
        $response = $this->get('/organisasi');

        $response->assertRedirect('/organisasi/dpp');
    }

    public function test_dpp_page_renders_successfully(): void
    {
        $this->withoutVite();

        $response = $this->get('/organisasi/dpp');

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Public/Organization/Dpp')
            ->has('members', 5)
            ->where('members.0.name', 'Dr. Ir. Hendra Gunawan, M.Si')
        );
    }

    public function test_dpw_page_renders_with_default_province(): void
    {
        $this->withoutVite();

        $response = $this->get('/organisasi/dpw');

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Public/Organization/Dpw')
            ->has('provinces')
            ->has('selectedProvince')
            ->has('dpw')
        );
    }

    public function test_dpw_page_renders_with_selected_province_with_dpw(): void
    {
        $this->withoutVite();

        $response = $this->get('/organisasi/dpw?provinsi=jawa-barat');

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Public/Organization/Dpw')
            ->where('selectedProvince.slug', 'jawa-barat')
            ->where('dpw.name', 'DPW NSA Jawa Barat')
            ->has('dpw.members', 3)
        );
    }

    public function test_dpw_page_renders_with_province_without_dpw(): void
    {
        $this->withoutVite();

        // Aceh tidak memiliki DPW di seeder
        $response = $this->get('/organisasi/dpw?provinsi=aceh');

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Public/Organization/Dpw')
            ->where('selectedProvince.slug', 'aceh')
            ->where('dpw', null)
        );
    }

    public function test_dpc_page_renders_with_default_regency(): void
    {
        $this->withoutVite();

        $response = $this->get('/organisasi/dpc');

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Public/Organization/Dpc')
            ->has('provinces')
            ->has('regencies')
            ->has('selectedProvince')
            ->has('selectedRegency')
        );
    }

    public function test_dpc_page_renders_with_selected_regency_with_dpc(): void
    {
        $this->withoutVite();

        $response = $this->get('/organisasi/dpc?provinsi=jawa-barat&kota=kabupaten-bogor');

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Public/Organization/Dpc')
            ->where('selectedProvince.slug', 'jawa-barat')
            ->where('selectedRegency.slug', 'kabupaten-bogor')
            ->where('dpc.name', 'DPC NSA Kabupaten Bogor')
            ->has('dpc.members', 2)
        );
    }

    public function test_dpc_page_renders_with_regency_without_dpc(): void
    {
        $this->withoutVite();

        // Kabupaten Sukabumi belum memiliki DPC di seeder
        $response = $this->get('/organisasi/dpc?provinsi=jawa-barat&kota=kabupaten-sukabumi');

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Public/Organization/Dpc')
            ->where('selectedProvince.slug', 'jawa-barat')
            ->where('selectedRegency.slug', 'kabupaten-sukabumi')
            ->where('dpc', null)
        );
    }

    public function test_dpc_regencies_endpoint_returns_json(): void
    {
        $response = $this->getJson('/organisasi/dpc/regencies?provinsi=jawa-barat');

        $response->assertOk();
        $response->assertJsonStructure([
            '*' => ['id', 'name', 'slug'],
        ]);
        $this->assertGreaterThan(0, count($response->json()));
    }
}
