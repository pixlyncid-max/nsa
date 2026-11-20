<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Province extends Model
{
    use HasFactory;

    public $incrementing = false;

    protected $keyType = 'int';

    protected $fillable = ['id', 'name', 'slug'];

    public function regencies(): HasMany
    {
        return $this->hasMany(Regency::class);
    }

    public function dpw(): HasOne
    {
        return $this->hasOne(Dpw::class);
    }

    public function statisticSnapshots(): HasMany
    {
        return $this->hasMany(StatisticSnapshot::class);
    }
}
