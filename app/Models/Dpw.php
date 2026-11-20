<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Dpw extends Model
{
    use HasFactory;

    protected $fillable = [
        'province_id',
        'name',
        'address',
        'phone',
        'email',
        'period',
    ];

    public function province(): BelongsTo
    {
        return $this->belongsTo(Province::class);
    }

    public function members(): HasMany
    {
        return $this->hasMany(DpwMember::class)->orderBy('order');
    }
}
