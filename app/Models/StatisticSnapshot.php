<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StatisticSnapshot extends Model
{
    use HasFactory;

    protected $fillable = [
        'province_id',
        'fish_category_id',
        'year',
        'farmer_count',
        'source',
    ];

    protected function casts(): array
    {
        return [
            'year' => 'integer',
            'farmer_count' => 'integer',
        ];
    }

    public function province(): BelongsTo
    {
        return $this->belongsTo(Province::class);
    }

    public function fishCategory(): BelongsTo
    {
        return $this->belongsTo(FishCategory::class);
    }
}
