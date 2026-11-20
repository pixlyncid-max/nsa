<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Redirect Tujuan Autentikasi Berdasarkan Role
    |--------------------------------------------------------------------------
    |
    | Menentukan rute atau path tujuan setelah user berhasil login berdasarkan role.
    | Mendukung nama rute Laravel (mis. 'home', 'admin.index', 'admin.dashboard')
    | maupun path URL langsung (mis. '/', '/admin').
    |
    */

    'user' => 'home',
    'admin' => 'admin.index',
    'superadmin' => 'admin.index',

    /*
    |--------------------------------------------------------------------------
    | Fallback Route
    |--------------------------------------------------------------------------
    |
    | Rute default bila role tidak ditemukan pada pemetaan di atas.
    |
    */
    'fallback' => 'home',
];
