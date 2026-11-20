<?php

namespace App\Models;

use App\Enums\MembershipStatus;
use App\Enums\Role;
use Database\Factories\UserFactory;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'phone',
        'password',
        'role',
        'membership_status',
        'member_number',
        'verification_token',
        'avatar',
        'locale',
        'email_verified_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'role' => Role::class,
            'membership_status' => MembershipStatus::class,
        ];
    }

    /**
     * URL Foto Avatar Pengguna (dari users.avatar atau foto profil anggota).
     */
    protected function avatar(): Attribute
    {
        return Attribute::make(
            get: function ($value) {
                $raw = $value ?: $this->profile?->photo;
                if (empty($raw)) {
                    return null;
                }

                if (Str::startsWith($raw, ['http://', 'https://', '/storage/'])) {
                    return $raw;
                }

                return Storage::disk('public')->url($raw);
            }
        );
    }

    public function isSuperadmin(): bool
    {
        return $this->role === Role::Superadmin;
    }

    public function isAdmin(): bool
    {
        return $this->role === Role::Admin;
    }

    public function isStaff(): bool
    {
        return in_array($this->role, [Role::Superadmin, Role::Admin], true);
    }

    public function isApprovedMember(): bool
    {
        return $this->membership_status === MembershipStatus::Approved;
    }

    public function application(): HasOne
    {
        return $this->hasOne(MemberApplication::class);
    }

    public function profile(): HasOne
    {
        return $this->hasOne(MemberProfile::class);
    }

    public function business(): HasOne
    {
        return $this->hasOne(MemberBusiness::class);
    }

    public function businesses(): HasMany
    {
        return $this->hasMany(MemberBusiness::class);
    }

    public function identity(): HasOne
    {
        return $this->hasOne(MemberIdentity::class);
    }

    public function programRegistrations(): HasMany
    {
        return $this->hasMany(ProgramRegistration::class);
    }

    public function businessFields(): BelongsToMany
    {
        return $this->belongsToMany(BusinessField::class, 'member_business_field');
    }

    public function documents(): HasMany
    {
        return $this->hasMany(MemberDocument::class);
    }

    public function socialLinks(): HasMany
    {
        return $this->hasMany(MemberSocialLink::class);
    }

    public function commodities(): HasMany
    {
        return $this->hasMany(MemberCommodity::class);
    }

    public function statement(): HasOne
    {
        return $this->hasOne(MemberStatement::class);
    }

    public function reviewLogs(): HasMany
    {
        return $this->hasMany(MemberReviewLog::class)->latest();
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function cart(): HasOne
    {
        return $this->hasOne(Cart::class);
    }

    public function changeRequests(): HasMany
    {
        return $this->hasMany(MemberChangeRequest::class)->latest();
    }

    public function mentorshipRequests(): HasMany
    {
        return $this->hasMany(MentorshipRequest::class)->latest();
    }

    public function ensureVerificationToken(): string
    {
        if (empty($this->verification_token)) {
            $token = bin2hex(random_bytes(16));
            $this->forceFill(['verification_token' => $token])->saveQuietly();

            return $token;
        }

        return $this->verification_token;
    }
}
