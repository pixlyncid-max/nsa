<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MemberIdentity extends Model
{
    use HasFactory;

    protected $fillable = [
        'application_id',
        'user_id',
        'nationality',
        'full_name',
        'gender',
        'birth_place',
        'birth_date',
        'phone',
        'email',
        'nik',
        'ktp_address',
        'passport_number',
        'origin_country',
        'years_in_indonesia',
    ];

    protected function casts(): array
    {
        return [
            'birth_date' => 'date',
            'ktp_address' => 'array',
            'nik' => 'encrypted',
            'passport_number' => 'encrypted',
            'years_in_indonesia' => 'integer',
        ];
    }

    public function application(): BelongsTo
    {
        return $this->belongsTo(MemberApplication::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
