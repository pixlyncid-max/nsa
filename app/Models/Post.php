<?php

namespace App\Models;

use App\Enums\PostType;
use App\Models\Concerns\HasAutoTranslations;
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

    public function category(): BelongsTo
    {
        return $this->belongsTo(PostCategory::class, 'category_id');
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }
}
