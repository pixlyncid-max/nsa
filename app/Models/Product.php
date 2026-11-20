<?php

namespace App\Models;

use App\Enums\ProductType;
use App\Models\Concerns\HasAutoTranslations;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use HasAutoTranslations, HasFactory;

    /** @var list<string> */
    protected array $translatable = ['name', 'description'];

    protected $fillable = [
        'category_id',
        'type',
        'name',
        'slug',
        'description',
        'price',
        'member_price',
        'stock',
        'weight',
        'location',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'type' => ProductType::class,
            'price' => 'decimal:2',
            'member_price' => 'decimal:2',
            'stock' => 'integer',
            'weight' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(ProductCategory::class, 'category_id');
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class)->orderBy('order');
    }

    /**
     * Hitung harga efektif untuk pengguna (harga anggota hanya untuk anggota approved).
     */
    public function getPriceFor(?User $user): float
    {
        if ($user && $user->isApprovedMember() && $this->member_price !== null) {
            return (float) $this->member_price;
        }

        return (float) $this->price;
    }

    /**
     * Cek apakah harga anggota berlaku untuk pengguna saat ini.
     */
    public function isMemberPriceApplied(?User $user): bool
    {
        return $user && $user->isApprovedMember() && $this->member_price !== null;
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeFilter($query, array $filters)
    {
        $query->when($filters['search'] ?? null, function ($q, $search) {
            $locale = app()->getLocale();
            $sourceLocale = (string) config('translation.source_locale', 'id');

            $q->where(function ($sub) use ($search, $locale, $sourceLocale) {
                $sub->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");

                if ($locale !== $sourceLocale) {
                    $sub->orWhereHas('translations', function ($tr) use ($search, $locale) {
                        $tr->where('locale', $locale)
                            ->whereIn('status', [
                                ContentTranslation::STATUS_DONE,
                                ContentTranslation::STATUS_MANUAL,
                            ])
                            ->where('value', 'like', "%{$search}%");
                    });
                }
            });
        });

        $query->when($filters['group'] ?? null, function ($q, $group) {
            $q->whereHas('category', function ($sub) use ($group) {
                $sub->where('group', $group)
                    ->orWhereHas('parent', fn ($p) => $p->where('group', $group));
            });
        });

        $query->when($filters['category'] ?? null, function ($q, $catSlug) {
            $q->whereHas('category', fn ($sub) => $sub->where('slug', $catSlug));
        });

        $query->when($filters['type'] ?? null, function ($q, $type) {
            $q->where('type', $type);
        });

        $query->when($filters['min_price'] ?? null, function ($q, $min) {
            $q->where('price', '>=', (float) $min);
        });

        $query->when($filters['max_price'] ?? null, function ($q, $max) {
            $q->where('price', '<=', (float) $max);
        });

        $query->when($filters['location'] ?? null, function ($q, $loc) {
            $q->where('location', 'like', "%{$loc}%");
        });

        $sort = $filters['sort'] ?? 'newest';
        match ($sort) {
            'price_asc' => $query->orderBy('price', 'asc'),
            'price_desc' => $query->orderBy('price', 'desc'),
            'name_asc' => $query->orderBy('name', 'asc'),
            default => $query->latest(),
        };

        return $query;
    }
}
