<?php

namespace App\Models;

use App\Enums\MembershipStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class MemberApplication extends Model
{
    use HasFactory;

    public const STEPS = [
        1 => 'identitas',
        2 => 'kategori-keanggotaan',
        3 => 'profil-usaha',
        4 => 'aktivitas-perikanan',
        5 => 'jaringan-bisnis',
        6 => 'minat-program',
        7 => 'lokasi-dokumen',
        8 => 'paket-administrasi',
        9 => 'pemeriksaan',
    ];

    public const LEGACY_STEPS = [
        1 => 'informasi-akun',
        2 => 'data-pribadi',
        3 => 'data-usaha-perikanan',
        4 => 'dokumen',
        5 => 'media-sosial',
        6 => 'data-komoditas',
        7 => 'keanggotaan',
        8 => 'surat-pernyataan',
        9 => 'review-data',
    ];

    protected $fillable = [
        'user_id',
        'status',
        'membership_category',
        'membership_category_custom',
        'applicant_type',
        'institution_name',
        'applicant_position',
        'membership_type_id',
        'current_step',
        'completed_steps',
        'submitted_at',
        'approved_at',
        'member_number',
        'review_note',
        'membership_plan_id',
        'dpc_id',
        'previous_organization',
        'recommender_name',
        'join_reason',
    ];

    protected function casts(): array
    {
        return [
            'status' => MembershipStatus::class,
            'completed_steps' => 'array',
            'submitted_at' => 'datetime',
            'approved_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function membershipPlan(): BelongsTo
    {
        return $this->belongsTo(MembershipPlan::class);
    }

    public function plan(): BelongsTo
    {
        return $this->membershipPlan();
    }

    public function dpc(): BelongsTo
    {
        return $this->belongsTo(Dpc::class);
    }

    public function membershipType(): BelongsTo
    {
        return $this->belongsTo(MembershipType::class, 'membership_type_id');
    }

    public function identity(): HasOne
    {
        return $this->hasOne(MemberIdentity::class, 'application_id');
    }

    public function businesses(): HasMany
    {
        return $this->hasMany(MemberBusiness::class, 'application_id');
    }

    public function fishActivities(): HasMany
    {
        return $this->hasMany(MemberFishActivity::class, 'application_id');
    }

    public function networkProfile(): HasOne
    {
        return $this->hasOne(MemberNetworkProfile::class, 'application_id');
    }

    public function programInterests(): HasMany
    {
        return $this->hasMany(MemberProgramInterest::class, 'application_id');
    }

    public function locations(): HasMany
    {
        return $this->hasMany(MemberLocation::class, 'application_id');
    }

    public function photos(): HasMany
    {
        return $this->hasMany(MemberPhoto::class, 'application_id');
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(MemberInvoice::class, 'application_id');
    }

    public function latestInvoice(): HasOne
    {
        return $this->hasOne(MemberInvoice::class, 'application_id')->latestOfMany();
    }

    /**
     * Cek apakah slug langkah sudah diselesaikan.
     */
    public function isStepCompleted(string $slug): bool
    {
        $completed = $this->completed_steps ?? [];

        return in_array($slug, $completed, true);
    }

    /**
     * Dapatkan langkah pertama yang belum selesai (langkah aktif yang sah).
     */
    public function getActiveStepSlug(): string
    {
        $completed = $this->completed_steps ?? [];

        foreach (self::STEPS as $number => $slug) {
            if (! in_array($slug, $completed, true)) {
                return $slug;
            }
        }

        return self::STEPS[9];
    }

    /**
     * Cek apakah user diperbolehkan mengakses langkah tertentu.
     * Langkah diizinkan jika sudah diselesaikan, ATAU merupakan langkah pertama yang belum selesai.
     */
    public function canAccessStep(string $slug): bool
    {
        if ($this->status === MembershipStatus::Approved || $this->user?->membership_status === MembershipStatus::Approved) {
            return true;
        }

        if ($this->isStepCompleted($slug)) {
            return true;
        }

        if (in_array($slug, self::LEGACY_STEPS, true)) {
            $completed = $this->completed_steps ?? [];
            foreach (self::LEGACY_STEPS as $legacySlug) {
                if (! in_array($legacySlug, $completed, true)) {
                    return $legacySlug === $slug;
                }
            }

            return false;
        }

        if (! in_array($slug, self::STEPS, true)) {
            return false;
        }

        return $this->getActiveStepSlug() === $slug;
    }

    /**
     * Tandai langkah sebagai selesai.
     */
    public function markStepCompleted(string $slug): void
    {
        $completed = $this->completed_steps ?? [];

        if (! in_array($slug, $completed, true)) {
            $completed[] = $slug;
            $this->completed_steps = $completed;
        }

        $nextSlug = $this->getNextStepSlug($slug);
        if ($nextSlug) {
            $this->current_step = $nextSlug;
        }

        $this->save();
    }

    /**
     * Dapatkan slug langkah berikutnya.
     */
    public function getNextStepSlug(string $currentSlug): ?string
    {
        if (in_array($currentSlug, self::LEGACY_STEPS, true)) {
            $legacyKeys = array_values(self::LEGACY_STEPS);
            $idx = array_search($currentSlug, $legacyKeys, true);

            return ($idx !== false && $idx < count($legacyKeys) - 1) ? $legacyKeys[$idx + 1] : null;
        }

        $keys = array_values(self::STEPS);
        $currentIndex = array_search($currentSlug, $keys, true);

        if ($currentIndex === false || $currentIndex >= count($keys) - 1) {
            return null;
        }

        return $keys[$currentIndex + 1];
    }

    /**
     * Dapatkan slug langkah sebelumnya.
     */
    public function getPrevStepSlug(string $currentSlug): ?string
    {
        $keys = array_values(self::STEPS);
        $currentIndex = array_search($currentSlug, $keys, true);

        if ($currentIndex === false || $currentIndex <= 0) {
            return null;
        }

        return $keys[$currentIndex - 1];
    }

    /**
     * Relasi ke data profil user
     */
    public function profile(): HasOne
    {
        return $this->hasOne(MemberProfile::class, 'user_id', 'user_id');
    }

    /**
     * Relasi ke data usaha user
     */
    public function business(): HasOne
    {
        return $this->hasOne(MemberBusiness::class, 'user_id', 'user_id');
    }

    /**
     * Relasi ke data dokumen user
     */
    public function documents(): HasMany
    {
        return $this->hasMany(MemberDocument::class, 'user_id', 'user_id');
    }
}
