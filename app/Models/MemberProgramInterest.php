<?php

namespace App\Models;

use App\Enums\ProgramCategory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MemberProgramInterest extends Model
{
    use HasFactory;

    protected $fillable = [
        'application_id',
        'category',
        'note',
    ];

    protected function casts(): array
    {
        return [
            'category' => ProgramCategory::class,
        ];
    }

    public function application(): BelongsTo
    {
        return $this->belongsTo(MemberApplication::class);
    }
}
