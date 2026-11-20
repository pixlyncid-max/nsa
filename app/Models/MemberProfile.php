<?php

namespace App\Models;

use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Crypt;

class MemberProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'nik',
        'name_ktp',
        'birth_place',
        'birth_date',
        'gender',
        'occupation',
        'address',
        'province_id',
        'regency_id',
        'district_id',
        'village_id',
        'postal_code',
        'is_domicile_same',
        'domicile_address',
        'domicile_province_id',
        'domicile_regency_id',
        'domicile_district_id',
        'domicile_village_id',
        'domicile_postal_code',
        'photo',
    ];

    protected function casts(): array
    {
        return [
            'birth_date' => 'date',
            'is_domicile_same' => 'boolean',
        ];
    }

    /**
     * Aksesor dan mutator NIK terenkripsi dengan penanganan kegagalan aman (safe decrypt fallback).
     */
    protected function nik(): Attribute
    {
        return Attribute::make(
            get: function ($value) {
                if (empty($value)) {
                    return $value;
                }

                try {
                    return Crypt::decryptString($value);
                } catch (DecryptException) {
                    // Fallback jika nilai di database adalah plaintext (seeder atau data legacy)
                    return $value;
                }
            },
            set: function ($value) {
                if (empty($value)) {
                    return $value;
                }

                // Jika sudah merupakan payload enkripsi yang sah, biarkan
                try {
                    Crypt::decryptString($value);

                    return $value;
                } catch (DecryptException) {
                    return Crypt::encryptString($value);
                }
            }
        );
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function province(): BelongsTo
    {
        return $this->belongsTo(Province::class);
    }

    public function regency(): BelongsTo
    {
        return $this->belongsTo(Regency::class);
    }

    public function district(): BelongsTo
    {
        return $this->belongsTo(District::class);
    }

    public function village(): BelongsTo
    {
        return $this->belongsTo(Village::class);
    }

    public function domicileProvince(): BelongsTo
    {
        return $this->belongsTo(Province::class, 'domicile_province_id');
    }

    public function domicileRegency(): BelongsTo
    {
        return $this->belongsTo(Regency::class, 'domicile_regency_id');
    }

    public function domicileDistrict(): BelongsTo
    {
        return $this->belongsTo(District::class, 'domicile_district_id');
    }

    public function domicileVillage(): BelongsTo
    {
        return $this->belongsTo(Village::class, 'domicile_village_id');
    }
}
