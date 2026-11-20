<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SiteTextRevision extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'site_text_id',
        'locale',
        'old_value',
        'new_value',
        'user_id',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
        ];
    }

    public function siteText(): BelongsTo
    {
        return $this->belongsTo(SiteText::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
