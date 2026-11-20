<?php

use App\Http\Controllers\Member\BusinessLegalController;
use App\Http\Controllers\Member\CardController;
use App\Http\Controllers\Member\DashboardController;
use App\Http\Controllers\Member\InvoiceController;
use App\Http\Controllers\Member\ProfileVerificationController;
use App\Http\Controllers\Member\ProgramController;
use App\Http\Controllers\Member\SettingController;
use Illuminate\Support\Facades\Route;

// 1. Dashboard Membership (/anggota)
Route::get('/', [DashboardController::class, 'index'])->name('dashboard');
Route::get('/dashboard', fn () => redirect()->route('member.dashboard'))->name('index');

// 2. Profil & Verifikasi (/anggota/profil)
Route::get('/profil', [ProfileVerificationController::class, 'index'])->name('profile');
Route::post('/profil', [ProfileVerificationController::class, 'updateBasic'])->name('profile.update');
Route::post('/profil/permohonan-perubahan', [ProfileVerificationController::class, 'requestChange'])->name('profile.change-request');

// 3. Kartu Anggota Digital (/anggota/kartu)
Route::get('/kartu', [CardController::class, 'index'])->name('card');

// 4. Usaha & Legalitas (/anggota/usaha)
Route::get('/usaha', [BusinessLegalController::class, 'index'])->name('business');
Route::post('/usaha/unit', [BusinessLegalController::class, 'storeUnit'])->name('business.unit.store');
Route::put('/usaha/unit/{business}', [BusinessLegalController::class, 'updateUnit'])->name('business.unit.update');
Route::delete('/usaha/unit/{business}', [BusinessLegalController::class, 'deleteUnit'])->name('business.unit.delete');
Route::post('/usaha/izin', [BusinessLegalController::class, 'storeDocument'])->name('business.document.store');
Route::delete('/usaha/izin/{document}', [BusinessLegalController::class, 'deleteDocument'])->name('business.document.delete');
Route::post('/usaha/pendampingan', [BusinessLegalController::class, 'requestMentorship'])->name('business.mentorship.store');

// 5. Program NSA (/anggota/program)
Route::get('/program', [ProgramController::class, 'index'])->name('programs');
Route::post('/program/{program}/daftar', [ProgramController::class, 'register'])->name('programs.register');
Route::delete('/program/{program}/batal', [ProgramController::class, 'cancel'])->name('programs.cancel');

// 6. Iuran & Administrasi (/anggota/iuran)
Route::get('/iuran', [InvoiceController::class, 'index'])->name('invoices');
Route::post('/iuran/{invoice}/bukti-bayar', [InvoiceController::class, 'uploadProof'])->name('invoices.uploadProof');
Route::get('/iuran/{invoice}/kuitansi', [InvoiceController::class, 'receipt'])->name('invoices.receipt');

// 7. Pengaturan (/anggota/pengaturan)
Route::get('/pengaturan', [SettingController::class, 'edit'])->name('settings');
Route::post('/pengaturan/password', [SettingController::class, 'updatePassword'])->name('settings.password');
Route::post('/pengaturan/logout-other', [SettingController::class, 'logoutOtherDevices'])->name('settings.logoutOther');
