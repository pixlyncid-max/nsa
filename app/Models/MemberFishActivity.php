<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MemberFishActivity extends Model
{
    use HasFactory;

    protected $fillable = [
        'application_id',
        'fish_category_id',
        'farming_system',
        'pond_count',
        'production_amount',
        'production_unit',
        'period',
        'seed_need',
        'feed_need',
        'purchase_capacity',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'pond_count' => 'integer',
            'production_amount' => 'decimal:2',
        ];
    }

    public function application(): BelongsTo
    {
        return $this->belongsTo(MemberApplication::class);
    }

    public function fishCategory(): BelongsTo
    {
        return $this->belongsTo(FishCategory::class);
    }
}
