<?php

namespace App\Providers;

require_once __DIR__.'/../helpers.php';

use App\Contracts\Translator;
use App\Models\SiteText;
use App\Policies\SiteTextPolicy;
use App\Policies\UserPolicy;
use App\Services\Contracts\PaymentServiceInterface;
use App\Services\ManualTransferPaymentService;
use App\Services\Translation\Drivers\ClaudeTranslator;
use App\Services\Translation\Drivers\DeepLTranslator;
use App\Services\Translation\Drivers\FakeTranslator;
use App\Services\Translation\Drivers\GoogleTranslator;
use App\Support\Copy\CopyRegistry;
use Closure;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(
            PaymentServiceInterface::class,
            ManualTransferPaymentService::class
        );

        $this->app->singleton(CopyRegistry::class);

        $this->app->bind(Translator::class, function () {
            return match (config('translation.driver', 'fake')) {
                'claude' => new ClaudeTranslator,
                'deepl' => new DeepLTranslator,
                'google' => new GoogleTranslator,
                default => new FakeTranslator((string) config('translation.drivers.fake.prefix', '[EN] ')),
            };
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Route::macro('localized', function (Closure $routes): void {
            Route::group([], $routes);
            Route::prefix('en')->name('en.')->group($routes);
        });

        Gate::policy(SiteText::class, SiteTextPolicy::class);

        Gate::define('manage-settings', [UserPolicy::class, 'manageSettings']);
        Gate::define('manage-admins', [UserPolicy::class, 'manageAdmins']);
        Gate::define('view-activity-logs', [UserPolicy::class, 'viewActivityLogs']);
        Gate::define('delete-permanently', [UserPolicy::class, 'deletePermanently']);
        Gate::define('verify-members', [UserPolicy::class, 'verifyMember']);
    }
}
