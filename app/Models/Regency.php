<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Regency extends Model
{
    use HasFactory;

    public $incrementing = false;

    protected $keyType = 'int';

    protected $fillable = ['id', 'province_id', 'name', 'slug'];

    public function province(): BelongsTo
    {
        return $this->belongsTo(Province::class);
    }

    public function districts(): HasMany
    {
        return $this->hasMany(District::class);
    }

    public function dpc(): HasOne
    {
        return $this->hasOne(Dpc::class);
    }
}
