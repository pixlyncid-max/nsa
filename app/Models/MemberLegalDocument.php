<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class MemberLegalDocument extends Model
{
    use HasFactory;

    protected $fillable = [
        'business_id',
        'type',
        'number',
        'label',
        'issued_at',
        'expires_at',
        'file_path',
    ];

    protected function casts(): array
    {
        return [
            'issued_at' => 'date',
            'expires_at' => 'date',
        ];
    }

    public function business(): BelongsTo
    {
        return $this->belongsTo(MemberBusiness::class, 'business_id');
    }

    public function getFileUrlAttribute(): ?string
    {
        if (empty($this->file_path)) {
            return null;
        }

        if (str_starts_with($this->file_path, 'http://') || str_starts_with($this->file_path, 'https://')) {
            return $this->file_path;
        }

        return Storage::disk('private')->exists($this->file_path)
            ? route('documents.download', ['path' => $this->file_path])
            : Storage::url($this->file_path);
    }
}
