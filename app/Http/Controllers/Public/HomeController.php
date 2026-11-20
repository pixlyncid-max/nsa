<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Services\SiteMediaService;
use App\Services\StatisticService;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __construct(
        protected StatisticService $statisticService,
        protected SiteMediaService $siteMediaService,
    ) {}

    /**
     * Tampilkan halaman Beranda utama NSA.
     */
    public function index(): Response
    {
        $homeData = $this->statisticService->getHomeData();
        $homeData['heroConfig'] = $this->resolveHeroConfig();

        return Inertia::render('Public/Home', $homeData);
    }

    /**
     * Bangun metadata slot gambar Hero dari config/hero.php tanpa menghasilkan 404
     * selama gambar master belum ditempatkan di public/images/hero/.
     *
     * @return array<string, mixed>
     */
    private function resolveHeroConfig(): array
    {
        $desktop = $this->buildVariantPayload(
            config('hero.desktop', []),
            $this->siteMediaService->uploadedUrl('hero_desktop')
        );
        $mobile = $this->buildVariantPayload(
            config('hero.mobile', []),
            $this->siteMediaService->uploadedUrl('hero_mobile')
        );

        return [
            'hasDesktop' => $desktop['exists'],
            'hasMobile' => $mobile['exists'],
            'desktop' => $desktop,
            'mobile' => $mobile,
            'guidesEnabled' => app()->environment('local'),
        ];
    }

    /**
     * @param  array<string, mixed>  $cfg
     * @return array<string, mixed>
     */
    private function buildVariantPayload(array $cfg, ?string $cmsOverrideUrl = null): array
    {
        if ($cmsOverrideUrl !== null) {
            return [
                'exists' => true,
                'src' => $cmsOverrideUrl,
                'avifSrcSet' => '',
                'webpSrcSet' => '',
                'width' => (int) ($cfg['width'] ?? 2560),
                'height' => (int) ($cfg['height'] ?? 1100),
                'objectPosition' => (string) ($cfg['object_position'] ?? 'center'),
                'alt' => (string) ($cfg['alt'] ?? ''),
            ];
        }

        $master = (string) ($cfg['master'] ?? '');
        $base = (string) ($cfg['base'] ?? '');
        $widths = array_map('intval', (array) ($cfg['widths'] ?? []));

        $masterExists = $master !== '' && file_exists(public_path($master));
        $avifSources = [];
        $webpSources = [];

        foreach ($widths as $width) {
            $avifPath = "{$base}-{$width}.avif";
            if (file_exists(public_path($avifPath))) {
                $avifSources[] = '/'.$avifPath." {$width}w";
            }

            $webpPath = "{$base}-{$width}.webp";
            if (file_exists(public_path($webpPath))) {
                $webpSources[] = '/'.$webpPath." {$width}w";
            }
        }

        $exists = $masterExists || $avifSources !== [] || $webpSources !== [];

        return [
            'exists' => $exists,
            'src' => $masterExists ? '/'.$master : ($webpSources !== [] ? explode(' ', $webpSources[0])[0] : '/'.$master),
            'avifSrcSet' => implode(', ', $avifSources),
            'webpSrcSet' => implode(', ', $webpSources),
            'width' => (int) ($cfg['width'] ?? 2560),
            'height' => (int) ($cfg['height'] ?? 1100),
            'objectPosition' => (string) ($cfg['object_position'] ?? 'center'),
            'alt' => (string) ($cfg['alt'] ?? ''),
        ];
    }
}
