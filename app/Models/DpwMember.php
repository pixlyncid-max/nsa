<?php

namespace App\Models;

use App\Models\Concerns\HasAutoTranslations;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DpwMember extends Model
{
    use HasAutoTranslations, HasFactory;

    /** @var list<string> */
    protected array $translatable = ['position'];

    protected $fillable = [
        'dpw_id',
        'name',
        'position',
        'photo',
        'order',
    ];

    public function dpw(): BelongsTo
    {
        return $this->belongsTo(Dpw::class);
    }
}
