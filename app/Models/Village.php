<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Village extends Model
{
    use HasFactory;

    public $incrementing = false;

    protected $keyType = 'int';

    protected $fillable = ['id', 'district_id', 'name'];

    public function district(): BelongsTo
    {
        return $this->belongsTo(District::class);
    }
}
