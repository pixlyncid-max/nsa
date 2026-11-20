<?php

/**
 * Pemetaan nama route (atau pola wildcard Str::is) ke kelompok teks di resources/copy/.
 * Kelompok 'global' selalu ikut dibagikan secara otomatis oleh HandleInertiaRequests.
 */
return [
    'home' => ['home'],

    'about' => ['about'],
    'program.*' => ['about'],

    'organization.*' => ['organization'],

    'product.*' => ['products', 'cart'],
    'cart.*' => ['cart'],
    'checkout.*' => ['cart'],

    'partnership.*' => ['partnership'],

    'article.*' => ['articles'],
    'news.*' => ['articles'],

    'contact.*' => ['contact'],

    'login' => ['auth'],
    'register' => ['auth'],
    'password.*' => ['auth'],
    'verification.*' => ['auth'],

    'account.membership.*' => ['account', 'registration'],
    'account.*' => ['account'],

    'member.verify' => ['member'],
    'member.*' => ['member'],
];
