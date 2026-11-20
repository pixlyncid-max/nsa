<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MemberBusiness extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'application_id',
        'institution_name',
        'activity_field',
        'years_operating',
        'scale',
        'operational_info',
        'is_primary',
        'has_no_business',
        'main_job',
        'membership_type',
        'membership_type_other',
        'name',
        'owner_name',
        'nib',
        'npwp',
        'founded_at',
        'employee_count',
        'annual_revenue',
        'business_status',
        'business_scale',
        'business_field_other',
        'province_id',
        'regency_id',
        'district_id',
        'village_id',
        'postal_code',
        'address',
        'latitude',
        'longitude',
    ];

    protected $appends = [
        'business_name',
    ];

    public function getBusinessNameAttribute(): ?string
    {
        return $this->attributes['name'] ?? null;
    }

    protected function casts(): array
    {
        return [
            'founded_at' => 'date',
            'employee_count' => 'integer',
            'years_operating' => 'integer',
            'is_primary' => 'boolean',
            'has_no_business' => 'boolean',
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function application(): BelongsTo
    {
        return $this->belongsTo(MemberApplication::class);
    }

    public function legalDocuments(): HasMany
    {
        return $this->hasMany(MemberLegalDocument::class, 'business_id');
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
}
