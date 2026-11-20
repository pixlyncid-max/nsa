<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class ContentTranslation extends Model
{
    use HasFactory;

    public const STATUS_PENDING = 'pending';

    public const STATUS_DONE = 'done';

    public const STATUS_FAILED = 'failed';

    public const STATUS_MANUAL = 'manual';

    protected $fillable = [
        'translatable_type',
        'translatable_id',
        'field',
        'locale',
        'value',
        'source_hash',
        'status',
        'is_manual',
        'provider',
        'chars',
        'error',
        'translated_at',
    ];

    protected function casts(): array
    {
        return [
            'is_manual' => 'boolean',
            'chars' => 'integer',
            'translated_at' => 'datetime',
        ];
    }

    public function translatable(): MorphTo
    {
        return $this->morphTo();
    }
}
