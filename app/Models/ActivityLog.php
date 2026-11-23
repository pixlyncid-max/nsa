<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class ActivityLog extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'action',
        'subject',
        'meta',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'meta' => 'array',
            'created_at' => 'datetime',
        ];
    }

    public static function log(string $action, ?string $subject = null, ?array $meta = null, ?int $userId = null): static
    {
        return static::create([
            'user_id' => $userId ?? auth()->id(),
            'action' => Str::limit($action, 50, ''),
            'subject' => $subject !== null ? Str::limit($subject, 97, '...') : null,
            'meta' => $meta,
            'created_at' => now(),
        ]);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
