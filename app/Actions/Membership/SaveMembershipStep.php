<?php

namespace App\Actions\Membership;

use App\Enums\MembershipStatus;
use App\Models\MemberBusiness;
use App\Models\MemberProfile;
use App\Models\MembershipPlan;
use App\Models\MemberSocialLink;
use App\Models\MemberStatement;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class SaveMembershipStep
{
    /**
     * Simpan data draft per langkah pendaftaran anggota.
     *
     * @param  array<string, mixed>  $data
     */
    public function execute(User $user, int $step, array $data): User
    {
        return DB::transaction(function () use ($user, $step, $data) {
            // Jika status masih non_member, ubah menjadi draft
            if ($user->membership_status === MembershipStatus::NonMember) {
                $user->update(['membership_status' => MembershipStatus::Draft]);
            }

            match ($step) {
                1 => $this->saveStep1Account($user, $data),
                2 => $this->saveStep2Personal($user, $data),
                3 => $this->saveStep3Business($user, $data),
                4 => $this->saveStep4Documents($user, $data),
                5 => $this->saveStep5Social($user, $data),
                6 => $this->saveStep6Commodity($user, $data),
                7 => $this->saveStep7Membership($user, $data),
                8 => $this->saveStep8Statement($user, $data),
                default => null,
            };

            return $user->fresh([
                'profile',
                'business.province',
                'business.regency',
                'business.district',
                'business.village',
                'businessFields',
                'documents',
                'socialLinks',
                'commodities.fishCategory',
                'statement',
            ]);
        });
    }

    /**
     * Langkah 1: Informasi Akun (Nama, No HP, Password baru jika diisi).
     *
     * @param  array<string, mixed>  $data
     */
    protected function saveStep1Account(User $user, array $data): void
    {
        $payload = [
            'name' => $data['name'] ?? $user->name,
            'phone' => $data['phone'] ?? $user->phone,
        ];

        if (! empty($data['password'])) {
            $payload['password'] = Hash::make($data['password']);
        }

        $user->update($payload);
    }

    /**
     * Langkah 2: Data Pribadi (NIK, Identitas KTP, Alamat, Domisili, Foto).
     *
     * @param  array<string, mixed>  $data
     */
    protected function saveStep2Personal(User $user, array $data): void
    {
        $payload = [
            'nik' => $data['nik'] ?? null,
            'name_ktp' => $data['name_ktp'] ?? $data['name'] ?? null,
            'birth_place' => $data['birth_place'] ?? null,
            'birth_date' => $data['birth_date'] ?? null,
            'gender' => match ($data['gender'] ?? null) {
                'Laki-laki', 'male' => 'male',
                'Perempuan', 'female' => 'female',
                default => $data['gender'] ?? null,
            },
            'occupation' => $data['occupation'] ?? null,
            'address' => $data['address'] ?? null,
            'province_id' => $data['province_id'] ?? null,
            'regency_id' => $data['regency_id'] ?? null,
            'district_id' => $data['district_id'] ?? null,
            'village_id' => $data['village_id'] ?? null,
            'postal_code' => $data['postal_code'] ?? null,
            'is_domicile_same' => isset($data['is_domicile_same']) ? filter_var($data['is_domicile_same'], FILTER_VALIDATE_BOOLEAN) : true,
            'domicile_address' => $data['domicile_address'] ?? null,
            'domicile_province_id' => $data['domicile_province_id'] ?? null,
            'domicile_regency_id' => $data['domicile_regency_id'] ?? null,
            'domicile_district_id' => $data['domicile_district_id'] ?? null,
            'domicile_village_id' => $data['domicile_village_id'] ?? null,
            'domicile_postal_code' => $data['domicile_postal_code'] ?? null,
        ];

        // Kelola berkas foto diri bila diunggah
        if (isset($data['photo'])) {
            if ($data['photo'] instanceof UploadedFile) {
                $payload['photo'] = $data['photo']->store("avatars/{$user->id}", 'public');
            } elseif (is_string($data['photo'])) {
                $payload['photo'] = $data['photo'];
            } elseif ($data['photo'] === null) {
                $payload['photo'] = null;
            }

            if (array_key_exists('photo', $payload)) {
                $user->update(['avatar' => $payload['photo']]);
            }
        }

        MemberProfile::updateOrCreate(
            ['user_id' => $user->id],
            $payload
        );
    }

    /**
     * Langkah 3: Data Usaha Perikanan (Jenis Keanggotaan, Info Usaha, Bidang Usaha, Alamat Usaha).
     *
     * @param  array<string, mixed>  $data
     */
    protected function saveStep3Business(User $user, array $data): void
    {
        MemberBusiness::updateOrCreate(
            ['user_id' => $user->id],
            [
                'membership_type' => $data['membership_type'] ?? null,
                'membership_type_other' => ($data['membership_type'] ?? null) === 'Lainnya' ? ($data['membership_type_other'] ?? null) : null,
                'name' => $data['business_name'] ?? $data['name'] ?? null,
                'owner_name' => $data['owner_name'] ?? null,
                'nib' => $data['nib'] ?? null,
                'npwp' => $data['npwp'] ?? null,
                'founded_at' => $data['founded_at'] ?? null,
                'employee_count' => isset($data['employee_count']) ? (int) $data['employee_count'] : null,
                'annual_revenue' => isset($data['annual_revenue']) ? (is_numeric($data['annual_revenue']) ? (int) $data['annual_revenue'] : preg_replace('/[^\d]/', '', (string) $data['annual_revenue'])) : null,
                'business_status' => $data['business_status'] ?? null,
                'business_scale' => $data['business_scale'] ?? null,
                'business_field_other' => $data['business_field_other'] ?? null,
                'province_id' => $data['province_id'] ?? null,
                'regency_id' => $data['regency_id'] ?? null,
                'district_id' => $data['district_id'] ?? null,
                'village_id' => $data['village_id'] ?? null,
                'postal_code' => $data['postal_code'] ?? null,
                'address' => $data['business_address'] ?? $data['address'] ?? null,
                'latitude' => $data['latitude'] ?? null,
                'longitude' => $data['longitude'] ?? null,
            ]
        );

        // Sinkronisasi Bidang Usaha (Array of IDs)
        if (isset($data['business_field_ids']) && is_array($data['business_field_ids'])) {
            $user->businessFields()->sync($data['business_field_ids']);
        }
    }

    /**
     * Langkah 4: Berkas Dokumen.
     *
     * @param  array<string, mixed>  $data
     */
    protected function saveStep4Documents(User $user, array $data): void
    {
        // Berkas dokumen diupload lewat uploadDocument endpoint dan tersimpan di member_documents.
    }

    /**
     * Langkah 5: Media Sosial.
     *
     * @param  array<string, mixed>  $data
     */
    protected function saveStep5Social(User $user, array $data): void
    {
        $platforms = ['website', 'instagram', 'facebook', 'tiktok', 'youtube', 'whatsapp'];

        foreach ($platforms as $platform) {
            $url = $data[$platform] ?? null;

            if (! empty($url)) {
                MemberSocialLink::updateOrCreate(
                    [
                        'user_id' => $user->id,
                        'platform' => $platform,
                    ],
                    ['url' => $url]
                );
            } else {
                MemberSocialLink::where('user_id', $user->id)
                    ->where('platform', $platform)
                    ->delete();
            }
        }
    }

    /**
     * Langkah 6: Data Komoditas Ikan.
     *
     * @param  array<string, mixed>  $data
     */
    protected function saveStep6Commodity(User $user, array $data): void
    {
        if (isset($data['commodities']) && is_array($data['commodities'])) {
            // Hapus komoditas lama dan masukkan kembali list terbaru dalam DB transaction
            DB::transaction(function () use ($user, $data) {
                $user->commodities()->delete();

                foreach ($data['commodities'] as $com) {
                    if (! empty($com['fish_category_id'])) {
                        $capUnit = $com['capacity_unit'] ?? 'ton';
                        $prodPeriod = $com['production_period'] ?? 'tahun';
                        $unit = ! empty($com['unit']) ? $com['unit'] : "{$capUnit}/{$prodPeriod}";
                        $landUnit = $com['land_area_unit'] ?? 'm2';

                        $user->commodities()->create([
                            'fish_category_id' => (int) $com['fish_category_id'],
                            'cultivation_type' => $com['cultivation_type'] ?? null,
                            'capacity' => (float) ($com['capacity'] ?? 0),
                            'capacity_unit' => $capUnit,
                            'production_period' => $prodPeriod,
                            'unit' => $unit,
                            'land_area' => (float) ($com['land_area'] ?? 0),
                            'land_area_unit' => $landUnit,
                            'pond_count' => isset($com['pond_count']) && $com['pond_count'] !== '' ? (int) $com['pond_count'] : null,
                        ]);
                    }
                }
            });
        }
    }

    /**
     * Langkah 7: Paket Keanggotaan & Preferensi Cabang.
     *
     * @param  array<string, mixed>  $data
     */
    protected function saveStep7Membership(User $user, array $data): void
    {
        $planId = $data['membership_plan_id'] ?? null;
        $plan = $planId ? MembershipPlan::find($planId) : null;

        // Simpan ke member_applications
        if ($user->application) {
            $user->application->update([
                'membership_plan_id' => $planId,
                'dpc_id' => $data['dpc_id'] ?? null,
                'previous_organization' => $data['previous_organization'] ?? null,
                'recommender_name' => $data['recommender_name'] ?? null,
                'join_reason' => $data['join_reason'] ?? null,
            ]);
        }

        // Simpan ke member_businesses untuk konsistensi profil usaha
        if ($user->business) {
            $type = $plan?->name ?? $data['membership_type'] ?? $user->business->membership_type;
            $user->business->update([
                'membership_type' => $type,
            ]);
        }
    }

    /**
     * Langkah 8: Surat Pernyataan & Tanda Tangan Digital.
     *
     * @param  array<string, mixed>  $data
     */
    protected function saveStep8Statement(User $user, array $data): void
    {
        $existing = MemberStatement::where('user_id', $user->id)->first();
        $signaturePath = $existing?->signature_path;

        // Jika berupa Base64 Data URL dari kanvas HTML5
        if (! empty($data['signature_data']) && str_starts_with($data['signature_data'], 'data:image')) {
            $imageParts = explode(';base64,', $data['signature_data']);
            if (count($imageParts) === 2) {
                $imageBinary = base64_decode($imageParts[1]);
                $filename = 'signatures/'.$user->id.'_'.time().'_'.Str::random(6).'.png';
                Storage::disk('private')->put($filename, $imageBinary);
                $signaturePath = $filename;
            }
        } elseif (! empty($data['signature_path'])) {
            $signaturePath = $data['signature_path'];
        }

        $city = $data['city'] ?? $user->business?->regency?->name ?? 'Jakarta';

        MemberStatement::updateOrCreate(
            ['user_id' => $user->id],
            [
                'city' => $city,
                'agree_data_accurate' => (bool) ($data['agree_data_accurate'] ?? false),
                'agree_ad_art' => (bool) ($data['agree_ad_art'] ?? false),
                'agree_privacy_policy' => (bool) ($data['agree_privacy_policy'] ?? false),
                'signed_at' => now(),
                'signature_path' => $signaturePath,
            ]
        );
    }
}
