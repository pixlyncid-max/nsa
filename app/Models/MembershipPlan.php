<?php

namespace App\Models;

use App\Models\Concerns\HasAutoTranslations;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MembershipPlan extends Model
{
    use HasAutoTranslations, HasFactory;

    /** @var list<string> */
    protected array $translatable = ['name', 'description', 'badge'];

    /** @var list<string> */
    protected array $translatableJson = ['benefits'];

    protected $fillable = [
        'name',
        'slug',
        'description',
        'benefits',
        'annual_fee',
        'badge',
        'is_popular',
        'is_active',
        'order',
    ];

    protected function casts(): array
    {
        return [
            'benefits' => 'array',
            'annual_fee' => 'integer',
            'is_popular' => 'boolean',
            'is_active' => 'boolean',
            'order' => 'integer',
        ];
    }

    public function applications(): HasMany
    {
        return $this->hasMany(MemberApplication::class);
    }

    /**
     * Format iuran per tahun ke bentuk Rupiah ramah pengguna.
     */
    public function getFormattedFeeAttribute(): string
    {
        if ($this->annual_fee <= 0) {
            return 'Gratis';
        }

        return 'Rp '.number_format($this->annual_fee, 0, ',', '.').' / tahun';
    }
}
