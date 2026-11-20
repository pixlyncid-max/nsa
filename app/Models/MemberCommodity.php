<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @deprecated Digantikan oleh member_fish_activities pada alur NSA baru. Data lama dipertahankan untuk retensi historis.
 */
class MemberCommodity extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'fish_category_id',
        'cultivation_type',
        'capacity',
        'capacity_unit',
        'production_period',
        'unit',
        'land_area',
        'land_area_unit',
        'pond_count',
    ];

    protected function casts(): array
    {
        return [
            'capacity' => 'decimal:2',
            'land_area' => 'decimal:2',
            'pond_count' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function fishCategory(): BelongsTo
    {
        return $this->belongsTo(FishCategory::class);
    }
}
