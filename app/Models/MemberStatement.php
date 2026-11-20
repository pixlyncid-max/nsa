<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\URL;

/**
 * @deprecated Digantikan oleh alur langkah 9 NSA baru (centang persetujuan pada MemberApplication). Data lama dipertahankan.
 */
class MemberStatement extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'city',
        'agree_data_accurate',
        'agree_ad_art',
        'agree_privacy_policy',
        'signed_at',
        'signature_path',
    ];

    protected $casts = [
        'signed_at' => 'datetime',
        'agree_data_accurate' => 'boolean',
        'agree_ad_art' => 'boolean',
        'agree_privacy_policy' => 'boolean',
    ];

    protected $appends = [
        'signed_url',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Dapatkan URL bertanda tangan (signed URL) untuk mengakses gambar tanda tangan privat.
     */
    public function getSignedUrl(int $minutes = 60): ?string
    {
        if (! $this->signature_path) {
            return null;
        }

        return URL::temporarySignedRoute(
            'account.statements.signature',
            now()->addMinutes($minutes),
            ['statement' => $this->id]
        );
    }

    public function getSignedUrlAttribute(): ?string
    {
        return $this->getSignedUrl();
    }
}
