<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class MemberPhoto extends Model
{
    use HasFactory;

    protected $fillable = [
        'application_id',
        'path',
        'caption',
    ];

    public function application(): BelongsTo
    {
        return $this->belongsTo(MemberApplication::class);
    }

    public function getUrlAttribute(): string
    {
        if (str_starts_with($this->path, 'http://') || str_starts_with($this->path, 'https://')) {
            return $this->path;
        }

        return Storage::url($this->path);
    }
}
