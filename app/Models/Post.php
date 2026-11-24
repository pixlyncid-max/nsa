<?php

namespace App\Models;

use App\Enums\PostType;
use App\Models\Concerns\HasAutoTranslations;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Post extends Model
{
    use HasAutoTranslations, HasFactory;

    /** @var list<string> */
    protected array $translatable = ['title', 'excerpt', 'body'];

    /** @var list<string> */
    protected array $translatableHtml = ['body'];

    protected $fillable = [
        'type',
        'category_id',
        'author_id',
        'publisher_name',
        'title',
        'slug',
        'excerpt',
        'body',
        'cover',
        'status',
        'published_at',
    ];

    protected function casts(): array
    {
        return [
            'type' => PostType::class,
            'published_at' => 'datetime',
        ];
    }

    public function scopeVisiblePublicly(Builder $query): Builder
    {
        return $query->where(function (Builder $q) {
            $q->where('status', 'published')
                ->orWhere(function (Builder $scheduled) {
                    $scheduled->where('status', 'scheduled')
                        ->whereNotNull('published_at')
                        ->where('published_at', '<=', now());
                });
        });
    }

    public function coverUrl(): ?string
    {
        if (! is_string($this->cover) || trim($this->cover) === '') {
            return null;
        }

        $cover = trim($this->cover);
        if (str_starts_with($cover, 'http://') || str_starts_with($cover, 'https://') || str_starts_with($cover, '/')) {
            return $cover;
        }

        return '/storage/'.ltrim($cover, '/');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(PostCategory::class, 'category_id');
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }
}
