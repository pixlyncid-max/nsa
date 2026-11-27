<?php

namespace App\Http\Middleware;

use App\Enums\MembershipStatus;
use App\Enums\Role;
use App\Models\MemberApplication;
use App\Models\Setting;
use App\Services\CartService;
use App\Services\CopyService;
use App\Services\SiteMediaService;
use App\Support\Brand;
use App\Support\LocaleUrl;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user()?->only([
                    'id',
                    'name',
                    'email',
                    'role',
                    'membership_status',
                    'member_number',
                    'avatar',
                ]),
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
            'cart' => [
                'count' => fn () => app(CartService::class)->count(
                    $request->user(),
                    $request->session()->getId(),
                ),
            ],
            'membershipPromo' => function () use ($request) {
                $user = $request->user();
                if (! $user || $user->role !== Role::User || $user->membership_status === MembershipStatus::Approved) {
                    return null;
                }

                $application = $user->relationLoaded('application')
                    ? $user->application
                    : $user->application()->first(['id', 'user_id', 'status', 'current_step', 'completed_steps']);

                $completedSteps = $application?->completed_steps ?? [];
                $completedCount = count($completedSteps);
                $currentStep = 1;

                if ($application) {
                    foreach (MemberApplication::STEPS as $num => $slug) {
                        if (! in_array($slug, $completedSteps, true)) {
                            $currentStep = $num;
                            break;
                        }
                    }
                }

                return [
                    'status' => $user->membership_status instanceof MembershipStatus
                        ? $user->membership_status->value
                        : (string) $user->membership_status,
                    'currentStep' => $currentStep,
                    'completedCount' => $completedCount,
                    'totalSteps' => 9,
                ];
            },
            'brand' => fn () => Brand::toArray(),
            'siteMedia' => fn () => app(SiteMediaService::class)->allUrls(),
            'features' => fn () => [
                'partnership_enabled' => filter_var(Setting::get('partnership_page_enabled', '0'), FILTER_VALIDATE_BOOLEAN),
            ],
            'locale' => fn () => app()->getLocale(),
            'availableLocales' => fn () => config('locales.locales', []),
            'alternates' => fn () => LocaleUrl::alternates($request),
            'copy' => fn () => app(CopyService::class)->forGroups(
                $this->resolveCopyGroups($request),
                app()->getLocale()
            ),
            'joinStrip' => fn () => $this->resolveJoinStrip($request),
            ...($request->user()?->role === Role::Superadmin ? ['canEditCopy' => true] : []),
        ];
    }

    /**
     * Menentukan apakah FooterJoinStrip tampil beserta label & tautan CTA-nya di server
     * agar tidak terjadi kedipan (layout shift) di sisi klien.
     *
     * @return array{visible: bool, ctaLabel: string, ctaHref: string}
     */
    protected function resolveJoinStrip(Request $request): array
    {
        $routeName = (string) ($request->route()?->getName() ?? '');
        $path = ltrim($request->path(), '/');

        // Jangan tampil di area CMS, portal akun/anggota, wizard, dan autentikasi.
        $nonPublicRoutePatterns = [
            'admin.*',
            'account.*',
            'member.dashboard',
            'member.index',
            'member.profile*',
            'member.card',
            'member.business*',
            'member.programs*',
            'member.invoices*',
            'member.settings*',
            'login',
            'register',
            'password.*',
            'verification.*',
            'profile.*',
            'dashboard',
        ];

        $isExcludedRoute = false;
        foreach (array_merge($nonPublicRoutePatterns, (array) config('join_strip.except_routes', [])) as $pattern) {
            if ($routeName !== '' && Str::is($pattern, $routeName)) {
                $isExcludedRoute = true;
                break;
            }
        }

        if (
            ! $isExcludedRoute &&
            (str_starts_with($path, 'admin')
                || str_starts_with($path, 'akun')
                || str_starts_with($path, 'anggota')
                || in_array($path, ['login', 'register', 'forgot-password', 'reset-password'], true))
        ) {
            $isExcludedRoute = true;
        }

        $user = $request->user();
        if (! $user) {
            $status = 'guest';
        } elseif ($user->role !== Role::User) {
            $status = 'staff';
        } else {
            $status = $user->membership_status instanceof MembershipStatus
                ? $user->membership_status->value
                : (string) $user->membership_status;
        }

        $visibleStatuses = (array) config('join_strip.visible_statuses', ['guest', 'non_member', 'draft']);
        $visible = ! $isExcludedRoute && in_array($status, $visibleStatuses, true);

        $locale = app()->getLocale();
        $defaultLabel = app(CopyService::class)->get('global.button.register_member', [], $locale)
            ?: ($locale === 'en' ? 'Join Membership' : 'Daftar Anggota');

        if ($status === 'draft') {
            $ctaLabel = $locale === 'en' ? 'Continue Registration' : 'Lanjutkan Pendaftaran';
            $ctaHref = '/akun/keanggotaan/daftar';
        } elseif ($status === 'non_member') {
            $ctaLabel = $defaultLabel;
            $ctaHref = '/akun/keanggotaan/daftar';
        } else {
            $ctaLabel = $defaultLabel;
            $ctaHref = '/register?intended=/akun/keanggotaan/daftar';
        }

        return [
            'visible' => $visible,
            'ctaLabel' => $ctaLabel,
            'ctaHref' => $ctaHref,
            'media' => $this->resolveJoinStripMedia(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    protected function resolveJoinStripMedia(): array
    {
        $mediaService = app(SiteMediaService::class);
        $desktop = $this->buildJoinStripVariant(
            (array) config('join_strip.images.desktop', []),
            2560,
            320,
            $mediaService->uploadedUrl('join_strip_desktop')
        );
        $mobile = $this->buildJoinStripVariant(
            (array) config('join_strip.images.mobile', []),
            1080,
            720,
            $mediaService->uploadedUrl('join_strip_mobile')
        );

        return [
            'hasDesktop' => $desktop['exists'],
            'hasMobile' => $mobile['exists'],
            'desktop' => $desktop,
            'mobile' => $mobile,
        ];
    }

    /**
     * @param  array<string, mixed>  $cfg
     * @return array<string, mixed>
     */
    protected function buildJoinStripVariant(
        array $cfg,
        int $defaultWidth,
        int $defaultHeight,
        ?string $cmsOverrideUrl = null
    ): array {
        if ($cmsOverrideUrl !== null) {
            return [
                'exists' => true,
                'src' => $cmsOverrideUrl,
                'avifSrcSet' => '',
                'webpSrcSet' => '',
                'width' => (int) ($cfg['width'] ?? $defaultWidth),
                'height' => (int) ($cfg['height'] ?? $defaultHeight),
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
            'width' => (int) ($cfg['width'] ?? $defaultWidth),
            'height' => (int) ($cfg['height'] ?? $defaultHeight),
            'objectPosition' => (string) ($cfg['object_position'] ?? 'center'),
            'alt' => (string) ($cfg['alt'] ?? ''),
        ];
    }

    /**
     * Menentukan kelompok teks yang dibagikan ke halaman aktif (selalu menyertakan 'global').
     *
     * @return list<string>
     */
    protected function resolveCopyGroups(Request $request): array
    {
        $groups = ['global', 'footer'];
        $routeName = $request->route()?->getName();

        if (! is_string($routeName) || $routeName === '') {
            return $groups;
        }

        if (str_starts_with($routeName, 'en.')) {
            $routeName = substr($routeName, 3);
        }

        $routeMap = config('copy_routes', []);
        foreach ($routeMap as $pattern => $mappedGroups) {
            if (Str::is($pattern, $routeName)) {
                foreach ((array) $mappedGroups as $group) {
                    $groups[] = $group;
                }
            }
        }

        return array_values(array_unique($groups));
    }
}
