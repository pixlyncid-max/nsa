<?php

return [
    'supported' => ['id', 'en'],

    'default' => 'id',

    'cookie_name' => 'locale',

    'cookie_minutes' => 60 * 24 * 365, // 1 tahun

    'locales' => [
        'id' => [
            'code' => 'id',
            'short' => 'ID',
            'name' => 'Bahasa Indonesia',
            'html_lang' => 'id',
            'og_locale' => 'id_ID',
            'intl' => 'id-ID',
        ],
        'en' => [
            'code' => 'en',
            'short' => 'EN',
            'name' => 'English',
            'html_lang' => 'en',
            'og_locale' => 'en_US',
            'intl' => 'en-US',
        ],
    ],
];
