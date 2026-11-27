<?php

use App\Http\Controllers\Api\RegionController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Public\AboutController;
use App\Http\Controllers\Public\CartController;
use App\Http\Controllers\Public\CheckoutController;
use App\Http\Controllers\Public\ContactController;
use App\Http\Controllers\Public\DpcController;
use App\Http\Controllers\Public\DppController;
use App\Http\Controllers\Public\DpwController;
use App\Http\Controllers\Public\HomeController;
use App\Http\Controllers\Public\LocaleController;
use App\Http\Controllers\Public\PartnershipController;
use App\Http\Controllers\Public\PostController;
use App\Http\Controllers\Public\ProductController;
use App\Http\Controllers\Public\ProgramController;
use App\Http\Controllers\Public\SitemapController;
use App\Http\Controllers\Public\VerificationController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Pemilih Bahasa (simpan cookie 'locale' & users.locale)
Route::post('/locale', [LocaleController::class, 'update'])->name('locale.update');

// =========================================================================
// Halaman Publik Terlokalisasi (id tanpa awalan, en berawalan /en)
// =========================================================================
Route::localized(function () {
    Route::get('/', [HomeController::class, 'index'])->name('home');

    // Halaman Konten Statis & Informasi
    Route::get('/tentang-kami', [AboutController::class, 'index'])->name('about');

    // Program Kerja NSA
    Route::get('/program/{slug}', [ProgramController::class, 'show'])->name('program.show');
    Route::post('/program/{slug}/daftar', [ProgramController::class, 'register'])
        ->middleware('auth')
        ->name('program.register');

    // Verifikasi Publik Kartu Anggota NSA (KTA)
    Route::get('/verifikasi/{token}', [VerificationController::class, 'verify'])->name('member.verify');

    Route::get('/kemitraan', [PartnershipController::class, 'index'])->name('partnership.index');
    Route::post('/kemitraan', [PartnershipController::class, 'store'])
        ->middleware('throttle:10,1')
        ->name('partnership.store');

    Route::get('/artikel', fn (Request $request) => app(PostController::class)->index($request, 'article'))->name('article.index');
    Route::get('/artikel/{slug}', fn (Request $request, string $slug) => app(PostController::class)->show($request, $slug, 'article'))->name('article.show');

    Route::get('/berita', fn (Request $request) => app(PostController::class)->index($request, 'news'))->name('news.index');
    Route::get('/berita/{slug}', fn (Request $request, string $slug) => app(PostController::class)->show($request, $slug, 'news'))->name('news.show');

    Route::get('/kontak', [ContactController::class, 'index'])->name('contact.index');
    Route::post('/kontak', [ContactController::class, 'store'])
        ->middleware('throttle:5,1')
        ->name('contact.store');

    Route::prefix('organisasi')->name('organization.')->group(function () {
        Route::get('/', fn () => redirect(lroute('organization.dpp')))->name('index');
        Route::get('/dpp', [DppController::class, 'index'])->name('dpp');
        Route::get('/dpw', [DpwController::class, 'index'])->name('dpw');
        Route::get('/dpc', [DpcController::class, 'index'])->name('dpc');
        Route::get('/dpc/regencies', [DpcController::class, 'regencies'])->name('dpc.regencies');
    });

    // Produk NSA
    Route::prefix('produk')->name('product.')->group(function () {
        Route::get('/', [ProductController::class, 'index'])->name('index');
        Route::get('/detail/{slug}', [ProductController::class, 'show'])->name('show');
        Route::get('/{group}', [ProductController::class, 'group'])
            ->where('group', 'air-tawar|air-laut|lain-lain')
            ->name('group');
        Route::get('/{group}/{subCategory}', [ProductController::class, 'subCategory'])
            ->where('group', 'air-tawar|air-laut|lain-lain')
            ->name('subCategory');
        Route::get('/{slug}', [ProductController::class, 'show'])->name('show.slug');
    });

    // Keranjang Belanja
    Route::prefix('keranjang')->name('cart.')->group(function () {
        Route::get('/', [CartController::class, 'index'])->name('index');
        Route::get('/data', [CartController::class, 'data'])->name('data');
        Route::post('/tambah', [CartController::class, 'add'])->name('add');
        Route::patch('/item/{cartItem}', [CartController::class, 'update'])->name('update');
        Route::delete('/item/{cartItem}', [CartController::class, 'remove'])->name('remove');
        Route::post('/kosongkan', [CartController::class, 'clear'])->name('clear');
    });

    // Checkout (Wajib Login)
    Route::middleware('auth')->prefix('checkout')->name('checkout.')->group(function () {
        Route::get('/', [CheckoutController::class, 'index'])->name('index');
        Route::post('/', [CheckoutController::class, 'store'])->name('store');
        Route::get('/sukses/{order:code}', [CheckoutController::class, 'success'])->name('success');
    });
});

// Sitemap XML (memuat sitemap_index.xml, sitemap.xml gabungan, dan sub-sitemap per kategori)
Route::get('/sitemap_index.xml', [SitemapController::class, 'sitemapIndex'])->name('sitemap.index');
Route::get('/sitemap.xml', [SitemapController::class, 'index'])->name('sitemap');
Route::get('/sitemap-pages.xml', [SitemapController::class, 'pages'])->name('sitemap.pages');
Route::get('/sitemap-posts.xml', [SitemapController::class, 'posts'])->name('sitemap.posts');
Route::get('/sitemap-products.xml', [SitemapController::class, 'products'])->name('sitemap.products');

// API Wilayah Indonesia (Cascading)
Route::get('/api/wilayah/{level}', [RegionController::class, 'wilayah'])->name('api.wilayah');

Route::prefix('api/regions')->name('api.regions.')->group(function () {
    Route::get('/provinces', [RegionController::class, 'provinces'])->name('provinces');
    Route::get('/regencies', [RegionController::class, 'regencies'])->name('regencies');
    Route::get('/districts', [RegionController::class, 'districts'])->name('districts');
    Route::get('/villages', [RegionController::class, 'villages'])->name('villages');
});

Route::get('/desain', function () {
    abort_unless(app()->environment('local'), 404);

    return Inertia::render('Design/Gallery');
})->name('design');

Route::get('/dashboard', function () {
    return view('dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
