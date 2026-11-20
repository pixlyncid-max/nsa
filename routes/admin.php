<?php

use App\Http\Controllers\Admin\ActivityLogController;
use App\Http\Controllers\Admin\AdminUserController;
use App\Http\Controllers\Admin\ContactMessageController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\FishCategoryController;
use App\Http\Controllers\Admin\MemberController;
use App\Http\Controllers\Admin\MembershipCategoryController;
use App\Http\Controllers\Admin\MembershipFeeItemController;
use App\Http\Controllers\Admin\MembershipTypeController;
use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\OrganizationController;
use App\Http\Controllers\Admin\PageController;
use App\Http\Controllers\Admin\PartnerController;
use App\Http\Controllers\Admin\PostController;
use App\Http\Controllers\Admin\ProductCategoryController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\ProgramController;
use App\Http\Controllers\Admin\SettingController;
use App\Http\Controllers\Admin\SiteTextController;
use App\Http\Controllers\Admin\StatisticController;
use App\Http\Controllers\Admin\TranslationCenterController;
use Illuminate\Support\Facades\Route;

// ========================================================
// Dasbor Utama
// ========================================================
Route::get('/', [DashboardController::class, 'index'])->name('index');
Route::get('/dasbor', [DashboardController::class, 'index'])->name('dashboard');

// ========================================================
// Modul Verifikasi Keanggotaan
// ========================================================
Route::prefix('anggota')->name('members.')->group(function () {
    Route::get('/', [MemberController::class, 'index'])->name('index');
    Route::get('/ekspor-csv', [MemberController::class, 'exportCsv'])->name('export');
    Route::post('/aksi-massal', [MemberController::class, 'bulkAction'])->name('bulk');
    Route::get('/{member}', [MemberController::class, 'show'])->name('show');
    Route::post('/{member}/lolos-awal', [MemberController::class, 'passInitialReview'])->name('passInitial');
    Route::post('/{member}/setujui', [MemberController::class, 'approve'])->name('approve');
    Route::post('/{member}/tolak-bukti-bayar', [MemberController::class, 'rejectPaymentProof'])->name('rejectPaymentProof');
    Route::post('/{member}/minta-revisi', [MemberController::class, 'requestRevision'])->name('revision');
    Route::post('/{member}/tolak', [MemberController::class, 'reject'])->name('reject');
    Route::delete('/{member}', [MemberController::class, 'destroy'])->name('destroy');
});

// ========================================================
// Modul Produk & Kategori
// ========================================================
Route::resource('kategori-produk', ProductCategoryController::class)
    ->names('product-categories')
    ->except(['create', 'show', 'edit']);

Route::resource('produk', ProductController::class)
    ->names('products');

// ========================================================
// Modul Pesanan & Konfirmasi Bayar
// ========================================================
Route::prefix('pesanan')->name('orders.')->group(function () {
    Route::get('/', [OrderController::class, 'index'])->name('index');
    Route::get('/ekspor-csv', [OrderController::class, 'exportCsv'])->name('export');
    Route::get('/{order}', [OrderController::class, 'show'])->name('show');
    Route::post('/{order}/konfirmasi', [OrderController::class, 'confirmPayment'])->name('confirmPayment');
    Route::patch('/{order}/status', [OrderController::class, 'updateStatus'])->name('updateStatus');
});

// ========================================================
// Modul Master Keanggotaan NSA
// ========================================================
Route::prefix('master-keanggotaan')->name('membership-master.')->group(function () {
    Route::resource('kategori', MembershipCategoryController::class)
        ->names('categories')
        ->except(['create', 'show', 'edit']);

    Route::resource('jenis', MembershipTypeController::class)
        ->names('types')
        ->except(['create', 'show', 'edit']);

    // Biaya & Tarif Keanggotaan (Khusus Superadmin)
    Route::middleware(['role:superadmin'])->group(function () {
        Route::resource('biaya', MembershipFeeItemController::class)
            ->names('fees')
            ->except(['create', 'show', 'edit']);
    });
});

// ========================================================
// Modul Program Kerja
// ========================================================
Route::post('programs/reorder', [ProgramController::class, 'reorder'])->name('programs.reorder');
Route::resource('programs', ProgramController::class)->names('programs');

// ========================================================
// Modul Berita & Artikel
// ========================================================
Route::resource('pos', PostController::class)
    ->names('posts');
Route::resource('artikel', PostController::class)
    ->names('articles');

// ========================================================
// Modul Organisasi (DPP, DPW, DPC TERPISAH)
// ========================================================
Route::prefix('organisasi')->name('organization.')->group(function () {
    // DPP
    Route::get('/dpp', [OrganizationController::class, 'dppIndex'])->name('dpp.index');
    Route::post('/dpp', [OrganizationController::class, 'dppStore'])->name('dpp.store');
    Route::put('/dpp/{member}', [OrganizationController::class, 'dppUpdate'])->name('dpp.update');
    Route::delete('/dpp/{member}', [OrganizationController::class, 'dppDestroy'])->name('dpp.destroy');

    // DPW
    Route::get('/dpw', [OrganizationController::class, 'dpwIndex'])->name('dpw.index');
    Route::post('/dpw', [OrganizationController::class, 'dpwStore'])->name('dpw.store');
    Route::put('/dpw/{dpw}', [OrganizationController::class, 'dpwUpdate'])->name('dpw.update');
    Route::delete('/dpw/{dpw}', [OrganizationController::class, 'dpwDestroy'])->name('dpw.destroy');
    Route::post('/dpw/{dpw}/anggota', [OrganizationController::class, 'dpwMemberStore'])->name('dpw.member.store');
    Route::delete('/dpw/anggota/{member}', [OrganizationController::class, 'dpwMemberDestroy'])->name('dpw.member.destroy');

    // DPC
    Route::get('/dpc', [OrganizationController::class, 'dpcIndex'])->name('dpc.index');
    Route::post('/dpc', [OrganizationController::class, 'dpcStore'])->name('dpc.store');
    Route::put('/dpc/{dpc}', [OrganizationController::class, 'dpcUpdate'])->name('dpc.update');
    Route::delete('/dpc/{dpc}', [OrganizationController::class, 'dpcDestroy'])->name('dpc.destroy');
    Route::post('/dpc/{dpc}/anggota', [OrganizationController::class, 'dpcMemberStore'])->name('dpc.member.store');
    Route::delete('/dpc/anggota/{member}', [OrganizationController::class, 'dpcMemberDestroy'])->name('dpc.member.destroy');
});

// ========================================================
// Modul Statistik & Kategori Ikan
// ========================================================
Route::resource('statistik', StatisticController::class)
    ->names('statistics')
    ->only(['index', 'store', 'update', 'destroy']);

Route::resource('kategori-ikan', FishCategoryController::class)
    ->names('fish-categories')
    ->only(['index', 'store', 'update', 'destroy']);

// ========================================================
// Modul Halaman Statis, Mitra, & Pesan Kontak
// ========================================================
Route::prefix('halaman')->name('pages.')->group(function () {
    Route::get('/', [PageController::class, 'index'])->name('index');
    Route::get('/{page}/edit', [PageController::class, 'edit'])->name('edit');
    Route::put('/{page}', [PageController::class, 'update'])->name('update');
});

Route::resource('mitra', PartnerController::class)
    ->names('partners')
    ->only(['index', 'store', 'update', 'destroy']);

Route::prefix('pesan')->name('messages.')->group(function () {
    Route::get('/', [ContactMessageController::class, 'index'])->name('index');
    Route::patch('/{message}/baca', [ContactMessageController::class, 'markAsRead'])->name('read');
    Route::delete('/{message}', [ContactMessageController::class, 'destroy'])->name('destroy');
});

// ========================================================
// Modul Khusus Superadmin (Dilindungi Middleware & Policy)
// ========================================================
Route::middleware(['role:superadmin'])->group(function () {
    // Kelola Akun Admin
    Route::prefix('kelola-admin')->name('users.')->group(function () {
        Route::get('/', [AdminUserController::class, 'index'])->name('index');
        Route::post('/', [AdminUserController::class, 'store'])->name('store');
        Route::put('/{user}', [AdminUserController::class, 'update'])->name('update');
        Route::delete('/{user}', [AdminUserController::class, 'destroy'])->name('destroy');
    });

    // Pengaturan Situs
    Route::prefix('pengaturan')->name('settings.')->group(function () {
        Route::get('/', [SettingController::class, 'index'])->name('index');
        Route::post('/', [SettingController::class, 'update'])->name('update');
    });

    // Teks Website (Khusus Superadmin)
    Route::prefix('teks-website')->name('site-texts.')->group(function () {
        Route::get('/', [SiteTextController::class, 'index'])->name('index');
        Route::get('/ekspor', [SiteTextController::class, 'export'])->name('export');
        Route::post('/impor/pratinjau', [SiteTextController::class, 'importPreview'])->name('importPreview');
        Route::post('/impor/terapkan', [SiteTextController::class, 'importApply'])->name('importApply');
        Route::put('/simpan-banyak', [SiteTextController::class, 'bulkUpdate'])->name('bulkUpdate');
        Route::post('/revisi/{revision}/pulihkan', [SiteTextController::class, 'restore'])->name('restore');
        Route::get('/{key}/meta', [SiteTextController::class, 'meta'])
            ->where('key', '[a-z0-9._-]+')
            ->name('meta');
        Route::get('/{key}/riwayat', [SiteTextController::class, 'revisions'])
            ->where('key', '[a-z0-9._-]+')
            ->name('revisions');
        Route::post('/{key}/reset', [SiteTextController::class, 'reset'])
            ->where('key', '[a-z0-9._-]+')
            ->name('reset');
        Route::post('/{key}/terjemahkan-ulang', [SiteTextController::class, 'retranslate'])
            ->where('key', '[a-z0-9._-]+')
            ->name('retranslate');
        Route::post('/{key}/otomatis', [SiteTextController::class, 'revertToAuto'])
            ->where('key', '[a-z0-9._-]+')
            ->name('revertToAuto');
        Route::put('/{key}', [SiteTextController::class, 'update'])
            ->where('key', '[a-z0-9._-]+')
            ->name('update');
        Route::get('/{group}', [SiteTextController::class, 'index'])
            ->where('group', '[a-z]+')
            ->name('group');
    });

    // Pusat Terjemahan (Khusus Superadmin)
    Route::prefix('terjemahan')->name('translations.')->group(function () {
        Route::get('/', [TranslationCenterController::class, 'index'])->name('index');
        Route::post('/uji-koneksi', [TranslationCenterController::class, 'testConnection'])->name('testConnection');
        Route::put('/konten/{translation}', [TranslationCenterController::class, 'updateContent'])->name('content.update');
        Route::post('/konten/{translation}/terjemahkan-ulang', [TranslationCenterController::class, 'retranslateContent'])->name('content.retranslate');
        Route::post('/konten/{translation}/otomatis', [TranslationCenterController::class, 'revertContentToAuto'])->name('content.revertAuto');
        Route::post('/konten/ulang-gagal', [TranslationCenterController::class, 'retryFailed'])->name('content.retryFailed');
        Route::post('/konten/terjemahkan-semua', [TranslationCenterController::class, 'translateMissing'])->name('content.translateMissing');
        Route::post('/glosarium', [TranslationCenterController::class, 'storeGlossary'])->name('glossary.store');
        Route::put('/glosarium/{glossary}', [TranslationCenterController::class, 'updateGlossary'])->name('glossary.update');
        Route::delete('/glosarium/{glossary}', [TranslationCenterController::class, 'destroyGlossary'])->name('glossary.destroy');
        Route::post('/glosarium/{glossary}/terapkan', [TranslationCenterController::class, 'applyGlossary'])->name('glossary.apply');
        Route::get('/glosarium/ekspor', [TranslationCenterController::class, 'exportGlossaryCsv'])->name('glossary.export');
        Route::post('/glosarium/impor', [TranslationCenterController::class, 'importGlossaryCsv'])->name('glossary.import');
        Route::put('/pengaturan', [TranslationCenterController::class, 'updateSettings'])->name('settings.update');
    });

    // Log Aktivitas
    Route::get('/log-aktivitas', [ActivityLogController::class, 'index'])->name('activity-logs.index');
});
