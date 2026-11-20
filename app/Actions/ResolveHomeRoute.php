<?php

namespace App\Actions;

use App\Enums\Role;
use App\Models\User;
use Illuminate\Support\Facades\Route;

class ResolveHomeRoute
{
    /**
     * Tentukan URL tujuan beranda setelah autentikasi (login / register) sesuai peran dan konfigurasi auth_redirect.
     *
     * @param  string  $source  'login' | 'signup' | 'register'
     */
    public function execute(?User $user, string $source = 'login'): string
    {
        if (! $user) {
            return url('/');
        }

        // 1. Setelah SIGN UP, user selalu diarahkan ke Beranda Utama ("/")
        if (in_array($source, ['signup', 'register', 'sign_up'], true)) {
            return url('/');
        }

        // 2. Aturan Setelah LOGIN: berbasis konfigurasi config/auth_redirect.php
        $roleKey = $user->role instanceof Role ? $user->role->value : (string) $user->role;

        $target = config("auth_redirect.{$roleKey}")
            ?? config("auth_redirect.roles.{$roleKey}")
            ?? config('auth_redirect.fallback')
            ?? ($user->isStaff() ? 'admin.index' : 'home');

        return $this->resolveUrl($target);
    }

    /**
     * Ubah nama route Laravel atau path URL menjadi string URL lengkap.
     */
    protected function resolveUrl(string $target): string
    {
        if (Route::has($target)) {
            return route($target);
        }

        if (str_starts_with($target, 'http://') || str_starts_with($target, 'https://')) {
            return $target;
        }

        return url($target);
    }
}
