<?php

namespace App\Models;

use App\Enums\ProgramCategory;
use App\Models\Concerns\HasAutoTranslations;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class Program extends Model
{
    use HasAutoTranslations, HasFactory;

    /** @var list<string> */
    protected array $translatable = ['title', 'summary', 'body'];

    /** @var list<string> */
    protected array $translatableHtml = ['body'];

    protected $fillable = [
        'title',
        'slug',
        'category',
        'summary',
        'body',
        'cover',
        'status',
        'is_public',
        'starts_at',
        'ends_at',
        'order',
    ];

    protected $appends = [
        'cover_url',
    ];

    protected function casts(): array
    {
        return [
            'category' => ProgramCategory::class,
            'is_public' => 'boolean',
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'order' => 'integer',
        ];
    }

    /**
     * URL publik untuk gambar cover program.
     */
    protected function coverUrl(): Attribute
    {
        return Attribute::make(
            get: function () {
                if (empty($this->cover)) {
                    return null;
                }

                if (Str::startsWith($this->cover, ['http://', 'https://', '/storage/'])) {
                    return $this->cover;
                }

                return Storage::disk('public')->url($this->cover);
            }
        );
    }

    public function scopePublicOnly(Builder $query): Builder
    {
        return $query->where('is_public', true);
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', 'published');
    }

    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('order')->orderBy('id');
    }

    public function registrations(): HasMany
    {
        return $this->hasMany(ProgramRegistration::class);
    }
}
