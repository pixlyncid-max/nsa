<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Dpc extends Model
{
    use HasFactory;

    protected $fillable = [
        'regency_id',
        'name',
        'address',
        'phone',
        'email',
        'period',
    ];

    public function regency(): BelongsTo
    {
        return $this->belongsTo(Regency::class);
    }

    public function members(): HasMany
    {
        return $this->hasMany(DpcMember::class)->orderBy('order');
    }
}
