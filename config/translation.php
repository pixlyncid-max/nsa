<?php

use App\Models\BusinessField;
use App\Models\DpcMember;
use App\Models\DppMember;
use App\Models\DpwMember;
use App\Models\FishCategory;
use App\Models\MembershipCategory;
use App\Models\MembershipFeeItem;
use App\Models\MembershipPlan;
use App\Models\MembershipType;
use App\Models\Page;
use App\Models\Partner;
use App\Models\Post;
use App\Models\PostCategory;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\Program;

return [
    'driver' => env('TRANSLATION_DRIVER', 'fake'),

    'queue' => env('TRANSLATION_QUEUE', 'translations'),

    'source_locale' => 'id',

    'target_locales' => ['en'],

    'max_attempts' => (int) env('TRANSLATION_MAX_ATTEMPTS', 3),

    'backoff' => [30, 120, 300],

    'batch_size' => (int) env('TRANSLATION_BATCH_SIZE', 25),

    'daily_char_limit' => (int) env('TRANSLATION_DAILY_CHAR_LIMIT', 100000),

    'drivers' => [
        'claude' => [
            'api_key' => env('ANTHROPIC_API_KEY'),
            'model' => env('TRANSLATION_CLAUDE_MODEL', 'claude-3-5-sonnet-latest'),
            'endpoint' => env('ANTHROPIC_API_URL', 'https://api.anthropic.com/v1/messages'),
            'timeout' => 45,
        ],
        'deepl' => [
            'api_key' => env('DEEPL_API_KEY'),
            'endpoint' => env('DEEPL_API_URL', 'https://api-free.deepl.com/v2/translate'),
            'timeout' => 30,
        ],
        'google' => [
            'api_key' => env('GOOGLE_TRANSLATE_API_KEY'),
            'endpoint' => env('GOOGLE_TRANSLATE_API_URL', 'https://translation.googleapis.com/language/translate/v2'),
            'timeout' => 30,
        ],
        'fake' => [
            'prefix' => '[EN] ',
        ],
    ],

    'models' => [
        'post' => Post::class,
        'post_category' => PostCategory::class,
        'product' => Product::class,
        'product_category' => ProductCategory::class,
        'program' => Program::class,
        'page' => Page::class,
        'dpp_member' => DppMember::class,
        'dpw_member' => DpwMember::class,
        'dpc_member' => DpcMember::class,
        'partner' => Partner::class,
        'fish_category' => FishCategory::class,
        'business_field' => BusinessField::class,
        'membership_category' => MembershipCategory::class,
        'membership_type' => MembershipType::class,
        'membership_fee_item' => MembershipFeeItem::class,
        'membership_plan' => MembershipPlan::class,
    ],
];
