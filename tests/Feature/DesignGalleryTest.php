<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DesignGalleryTest extends TestCase
{
    use RefreshDatabase;

    public function test_gallery_is_hidden_outside_local_environment(): void
    {
        $this->withoutVite();

        $this->get('/desain')->assertNotFound();
    }

    public function test_gallery_is_available_in_local_environment(): void
    {
        $this->withoutVite();
        $this->app->detectEnvironment(fn () => 'local');

        $this->get('/desain')->assertOk();
    }
}
