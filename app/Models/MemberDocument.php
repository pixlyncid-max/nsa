<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\URL;

class MemberDocument extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'type',
        'path',
        'status',
        'original_name',
        'file_size',
        'mime_type',
    ];

    protected $appends = [
        'signed_url',
        'formatted_size',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Dapatkan URL bertanda tangan (signed URL) untuk akses berkas privat.
     */
    public function getSignedUrl(int $minutes = 60): string
    {
        return URL::temporarySignedRoute(
            'account.documents.signed',
            now()->addMinutes($minutes),
            ['document' => $this->id]
        );
    }

    public function getSignedUrlAttribute(): string
    {
        return $this->getSignedUrl();
    }

    public function getFormattedSizeAttribute(): string
    {
        if (! $this->file_size) {
            return '';
        }

        if ($this->file_size >= 1048576) {
            return number_format($this->file_size / 1048576, 1).' MB';
        }

        return number_format($this->file_size / 1024, 0).' KB';
    }
}
