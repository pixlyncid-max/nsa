<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SiteText extends Model
{
    use HasFactory;

    public const STATUS_AUTO = 'auto';

    public const STATUS_PENDING = 'pending';

    public const STATUS_FAILED = 'failed';

    public const STATUS_MANUAL = 'manual';

    protected $fillable = [
        'key',
        'group',
        'locale',
        'value',
        'is_manual',
        'translation_status',
        'source_hash',
        'translation_error',
        'translated_at',
        'updated_by',
    ];

    protected function casts(): array
    {
        return [
            'is_manual' => 'boolean',
            'translated_at' => 'datetime',
        ];
    }

    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function revisions(): HasMany
    {
        return $this->hasMany(SiteTextRevision::class)->orderByDesc('created_at')->orderByDesc('id');
    }
}
