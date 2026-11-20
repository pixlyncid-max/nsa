<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MemberNetworkProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'application_id',
        'marketing_info',
        'distribution_areas',
        'supply_needs',
        'cooperation_types',
        'professional_activities',
    ];

    protected function casts(): array
    {
        return [
            'distribution_areas' => 'array',
            'cooperation_types' => 'array',
        ];
    }

    public function application(): BelongsTo
    {
        return $this->belongsTo(MemberApplication::class);
    }
}
