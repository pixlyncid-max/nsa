<?php

use App\Http\Controllers\Account\AccountApiController;
use App\Http\Controllers\Account\DashboardController;
use App\Http\Controllers\Account\DocumentController;
use App\Http\Controllers\Account\MemberRegistrationController;
use App\Http\Controllers\Account\MembershipRegistrationController;
use App\Http\Controllers\Account\OrderController as AccountOrderController;
use App\Http\Controllers\Account\ProfileController;
use App\Http\Controllers\Account\SettingController;
use Illuminate\Support\Facades\Route;

// Dasbor Akun Sederhana (Non-Membership)
Route::get('/', [DashboardController::class, 'index'])->middleware('role:user')->name('index');

Route::get('/dashboard', function () {
    return redirect()->route('account.index');
})->middleware('role:user')->name('dashboard');

// Profil & Pengaturan Pengguna
Route::get('/profil', [ProfileController::class, 'edit'])->name('profile.edit');
Route::post('/profil', [ProfileController::class, 'update'])->name('profile.update');
Route::post('/profil/password', [ProfileController::class, 'updatePassword'])->name('profile.password');

Route::get('/pengaturan', [SettingController::class, 'edit'])->name('settings.edit');
Route::post('/pengaturan', [SettingController::class, 'update'])->name('settings.update');

// Keanggotaan NSA (Pendaftaran, Wizard, Status, dan Formulir)
Route::get('/keanggotaan', [MembershipRegistrationController::class, 'status'])->name('membership.status');
Route::get('/keanggotaan/status', [MembershipRegistrationController::class, 'status'])->name('membership.status-alias');
Route::get('/keanggotaan/formulir', [MembershipRegistrationController::class, 'form'])->name('membership.form');
Route::get('/keanggotaan/daftar', [MemberRegistrationController::class, 'index'])->name('membership.register');
Route::post('/keanggotaan/daftar/kirim', [MemberRegistrationController::class, 'submit'])->name('membership.submit');
Route::get('/keanggotaan/daftar/{slug}', [MemberRegistrationController::class, 'show'])->name('membership.step');
Route::match(['patch', 'post'], '/keanggotaan/daftar/{slug}', [MemberRegistrationController::class, 'update'])->name('membership.saveStep');
Route::post('/keanggotaan/foto', [MemberRegistrationController::class, 'uploadPhoto'])->name('membership.uploadPhoto');
Route::delete('/keanggotaan/foto/{photo}', [MemberRegistrationController::class, 'deletePhoto'])->name('membership.deletePhoto');
Route::post('/keanggotaan/bukti-bayar', [MembershipRegistrationController::class, 'uploadProof'])->name('membership.uploadProof');

// Kompatibilitas Endpoint Dokumen & Draf Pendaftaran
Route::post('/keanggotaan/langkah/{step}', [MembershipRegistrationController::class, 'saveStep'])->name('membership.legacySaveStep');
Route::post('/keanggotaan/dokumen', [MembershipRegistrationController::class, 'uploadDocument'])->name('membership.uploadDocument');
Route::delete('/keanggotaan/dokumen/{document}', [MembershipRegistrationController::class, 'deleteDocument'])->name('membership.deleteDocument');
Route::post('/keanggotaan/kirim', [MembershipRegistrationController::class, 'submit'])->name('membership.legacySubmit');

// Pesanan & Riwayat Transaksi Toko
Route::get('/pesanan', [AccountOrderController::class, 'index'])->name('orders.index');
Route::get('/pesanan/{order:code}', [AccountOrderController::class, 'show'])->name('orders.show');
Route::post('/pesanan/{order:code}/bukti-bayar', [AccountOrderController::class, 'uploadProof'])->name('orders.uploadProof');

// Dokumen Privat Anggota (Policy & Signed URL)
Route::get('/dokumen/{document}', [DocumentController::class, 'show'])->name('documents.show');
Route::get('/dokumen/{document}/signed', [DocumentController::class, 'signedShow'])->name('documents.signed')->middleware('signed');
Route::get('/pernyataan/{statement}/tanda-tangan', [DocumentController::class, 'signatureSigned'])->name('statements.signature')->middleware('signed');

// Drawer Akun (Pesanan, Alamat, Profil & Sandi tanpa masuk CMS)
Route::prefix('api')->name('api.')->group(function () {
    Route::get('/pesanan', [AccountApiController::class, 'orders'])->name('orders');
    Route::post('/pesanan/{order:code}/bukti-bayar', [AccountApiController::class, 'uploadProof'])->name('orders.uploadProof');
    Route::get('/alamat', [AccountApiController::class, 'address'])->name('address');
    Route::post('/alamat', [AccountApiController::class, 'updateAddress'])->name('address.update');
    Route::get('/profil', [AccountApiController::class, 'profile'])->name('profile');
    Route::post('/profil', [AccountApiController::class, 'updateProfile'])->name('profile.update');
    Route::post('/password', [AccountApiController::class, 'updatePassword'])->name('password.update');
});
