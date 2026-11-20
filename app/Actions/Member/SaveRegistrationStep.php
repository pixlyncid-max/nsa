<?php

namespace App\Actions\Member;

use App\Actions\Membership\SaveMembershipStep;
use App\Enums\MembershipStatus;
use App\Enums\ProgramCategory;
use App\Models\MemberApplication;
use App\Models\MemberBusiness;
use App\Models\MemberIdentity;
use App\Models\MemberInvoice;
use App\Models\MemberLocation;
use App\Models\MemberNetworkProfile;
use App\Models\MembershipFeeItem;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class SaveRegistrationStep
{
    public function __construct(
        protected SaveMembershipStep $legacySaver
    ) {}

    /**
     * Simpan data langkah wizard pendaftaran keanggotaan (satu pintu simpan).
     *
     * @param  array<string, mixed>  $data
     */
    public function execute(User $user, string $slug, array $data): MemberApplication
    {
        return DB::transaction(function () use ($user, $slug, $data) {
            // Ambil atau buat aplikasi keanggotaan
            $application = $user->application()->firstOrCreate(
                ['user_id' => $user->id],
                [
                    'status' => $user->membership_status === MembershipStatus::NonMember
                        ? MembershipStatus::Draft
                        : $user->membership_status,
                    'current_step' => $slug,
                    'completed_steps' => [],
                ]
            );

            // Update status user ke draft jika sebelumnya non_member
            if ($user->membership_status === MembershipStatus::NonMember) {
                $user->update(['membership_status' => MembershipStatus::Draft]);
                $application->update(['status' => MembershipStatus::Draft]);
            }

            // Simpan data spesifik per langkah 9-langkah baru
            match ($slug) {
                'identitas' => $this->saveStep1Identity($user, $application, $data),
                'kategori-keanggotaan' => $this->saveStep2Category($user, $application, $data),
                'profil-usaha' => $this->saveStep3BusinessProfile($user, $application, $data),
                'aktivitas-perikanan' => $this->saveStep4FishActivities($user, $application, $data),
                'jaringan-bisnis' => $this->saveStep5NetworkProfile($user, $application, $data),
                'minat-program' => $this->saveStep6ProgramInterests($user, $application, $data),
                'lokasi-dokumen' => $this->saveStep7LocationDocuments($user, $application, $data),
                'paket-administrasi' => $this->saveStep8Administration($user, $application, $data),
                default => $this->saveLegacyOrFallback($user, $slug, $data),
            };

            // Tandai langkah ini sebagai selesai di completed_steps
            $application->markStepCompleted($slug);

            return $application->fresh();
        });
    }

    /**
     * Langkah 1: Identitas Calon Anggota (WNI / WNA).
     *
     * @param  array<string, mixed>  $data
     */
    protected function saveStep1Identity(User $user, MemberApplication $application, array $data): void
    {
        $nationality = $data['nationality'] ?? 'wni';

        $identityData = [
            'user_id' => $user->id,
            'application_id' => $application->id,
            'nationality' => $nationality,
            'full_name' => $data['full_name'] ?? $user->name,
            'gender' => $data['gender'] ?? null,
            'birth_place' => $data['birth_place'] ?? null,
            'birth_date' => $data['birth_date'] ?? null,
            'phone' => $data['phone'] ?? $user->phone,
            'email' => $data['email'] ?? $user->email,
        ];

        if ($nationality === 'wni') {
            $identityData['nik'] = $data['nik'] ?? null;
            $identityData['ktp_address'] = [
                'province_id' => $data['province_id'] ?? null,
                'regency_id' => $data['regency_id'] ?? null,
                'district_id' => $data['district_id'] ?? null,
                'village_id' => $data['village_id'] ?? null,
                'postal_code' => $data['postal_code'] ?? null,
                'address' => $data['address'] ?? null,
            ];
            $identityData['passport_number'] = null;
            $identityData['origin_country'] = null;
            $identityData['years_in_indonesia'] = null;
        } else {
            $identityData['passport_number'] = $data['passport_number'] ?? null;
            $identityData['origin_country'] = $data['origin_country'] ?? null;
            $identityData['years_in_indonesia'] = isset($data['years_in_indonesia']) ? (int) $data['years_in_indonesia'] : null;
            $identityData['nik'] = null;
            $identityData['ktp_address'] = null;
        }

        MemberIdentity::updateOrCreate(
            ['application_id' => $application->id],
            $identityData
        );

        // Sinkronisasi data dasar ke tabel users
        $user->update([
            'name' => $data['full_name'] ?? $user->name,
            'phone' => $data['phone'] ?? $user->phone,
        ]);
    }

    /**
     * Langkah 2: Kategori dan Jenis Keanggotaan.
     *
     * @param  array<string, mixed>  $data
     */
    protected function saveStep2Category(User $user, MemberApplication $application, array $data): void
    {
        $applicantType = $data['applicant_type'] ?? 'individual';

        $application->update([
            'membership_category' => $data['membership_category'] ?? null,
            'membership_category_custom' => ($data['membership_category'] ?? '') === 'Lainnya'
                ? ($data['membership_category_custom'] ?? null)
                : null,
            'applicant_type' => $applicantType,
            'institution_name' => $applicantType === 'institution' ? ($data['institution_name'] ?? null) : null,
            'applicant_position' => $applicantType === 'institution' ? ($data['applicant_position'] ?? null) : null,
            'membership_type_id' => $data['membership_type_id'] ?? null,
        ]);
    }

    /**
     * Langkah 3: Profil Pekerjaan atau Usaha.
     *
     * @param  array<string, mixed>  $data
     */
    protected function saveStep3BusinessProfile(User $user, MemberApplication $application, array $data): void
    {
        $hasNoBusiness = ! empty($data['has_no_business']);

        $businessData = [
            'user_id' => $user->id,
            'application_id' => $application->id,
            'is_primary' => true,
            'has_no_business' => $hasNoBusiness,
            'main_job' => $hasNoBusiness ? ($data['main_job'] ?? null) : null,
            'name' => ! $hasNoBusiness ? ($data['name'] ?? null) : null,
            'institution_name' => ! $hasNoBusiness ? ($data['name'] ?? null) : null,
            'activity_field' => ! $hasNoBusiness ? ($data['activity_field'] ?? null) : null,
            'years_operating' => ! $hasNoBusiness && isset($data['years_operating']) ? (int) $data['years_operating'] : null,
            'scale' => ! $hasNoBusiness ? ($data['scale'] ?? null) : null,
            'operational_info' => ! $hasNoBusiness ? ($data['operational_info'] ?? null) : null,
        ];

        $business = MemberBusiness::updateOrCreate(
            ['application_id' => $application->id, 'is_primary' => true],
            $businessData
        );

        // Simpan / update dokumen legalitas
        if (! $hasNoBusiness && isset($data['legal_documents']) && is_array($data['legal_documents'])) {
            $existingDocs = $business->legalDocuments()->get()->keyBy(function ($doc) {
                return $doc->type.'_'.($doc->number ?? '');
            });

            $business->legalDocuments()->delete();

            foreach ($data['legal_documents'] as $doc) {
                if (empty($doc['type']) && empty($doc['number'])) {
                    continue;
                }

                $key = ($doc['type'] ?? '').'_'.($doc['number'] ?? '');
                $existingFilePath = $existingDocs[$key]->file_path ?? null;

                $business->legalDocuments()->create([
                    'type' => $doc['type'] ?? 'other',
                    'number' => $doc['number'] ?? null,
                    'label' => ($doc['type'] ?? '') === 'other' ? ($doc['label'] ?? null) : null,
                    'issued_at' => ! empty($doc['issued_at']) ? $doc['issued_at'] : null,
                    'expires_at' => ! empty($doc['expires_at']) ? $doc['expires_at'] : null,
                    'file_path' => $existingFilePath,
                ]);
            }
        }
    }

    /**
     * Langkah 4: Data Aktivitas Perikanan (Form Dinamis).
     *
     * @param  array<string, mixed>  $data
     */
    protected function saveStep4FishActivities(User $user, MemberApplication $application, array $data): void
    {
        // Bersihkan data aktivitas lama untuk aplikasi ini
        $application->fishActivities()->delete();

        if (empty($data['is_skipped']) && ! empty($data['activities']) && is_array($data['activities'])) {
            foreach ($data['activities'] as $act) {
                // Abaikan jika seluruh kolom utama kosong
                if (empty($act['fish_category_id']) && empty($act['farming_system']) && empty($act['production_amount'])) {
                    continue;
                }

                $application->fishActivities()->create([
                    'fish_category_id' => ! empty($act['fish_category_id']) ? (int) $act['fish_category_id'] : null,
                    'farming_system' => $act['farming_system'] ?? null,
                    'pond_count' => isset($act['pond_count']) && $act['pond_count'] !== '' ? (int) $act['pond_count'] : null,
                    'production_amount' => isset($act['production_amount']) && $act['production_amount'] !== '' ? (float) $act['production_amount'] : null,
                    'production_unit' => $act['production_unit'] ?? null,
                    'period' => $act['period'] ?? null,
                    'seed_need' => $act['seed_need'] ?? null,
                    'feed_need' => $act['feed_need'] ?? null,
                    'purchase_capacity' => $act['purchase_capacity'] ?? null,
                    'notes' => $act['notes'] ?? null,
                ]);
            }
        }
    }

    /**
     * Langkah 5: Jaringan dan Aktivitas Bisnis.
     *
     * @param  array<string, mixed>  $data
     */
    protected function saveStep5NetworkProfile(User $user, MemberApplication $application, array $data): void
    {
        $cooperationTypes = $data['cooperation_types'] ?? [];
        if (! empty($data['cooperation_types_custom']) && in_array('lainnya', $cooperationTypes, true)) {
            $cooperationTypes[] = 'Lainnya: '.trim($data['cooperation_types_custom']);
        }

        MemberNetworkProfile::updateOrCreate(
            ['application_id' => $application->id],
            [
                'marketing_info' => $data['marketing_info'] ?? null,
                'distribution_areas' => $data['distribution_areas'] ?? [],
                'supply_needs' => $data['supply_needs'] ?? null,
                'cooperation_types' => array_values(array_unique($cooperationTypes)),
                'professional_activities' => $data['professional_activities'] ?? null,
            ]
        );
    }

    /**
     * Langkah 6: Kebutuhan dan Minat Program NSA.
     *
     * @param  array<string, mixed>  $data
     */
    protected function saveStep6ProgramInterests(User $user, MemberApplication $application, array $data): void
    {
        $application->programInterests()->delete();

        if (! empty($data['interests']) && is_array($data['interests'])) {
            $note = $data['note'] ?? null;
            foreach ($data['interests'] as $categoryValue) {
                // Konversi string ke ProgramCategory enum yang valid
                $categoryEnum = $categoryValue instanceof ProgramCategory
                    ? $categoryValue
                    : ProgramCategory::tryFrom($categoryValue);

                if ($categoryEnum) {
                    $application->programInterests()->create([
                        'category' => $categoryEnum,
                        'note' => $note,
                    ]);
                }
            }
        }
    }

    /**
     * Langkah 7: Lokasi, Foto, dan Dokumen.
     *
     * @param  array<string, mixed>  $data
     */
    protected function saveStep7LocationDocuments(User $user, MemberApplication $application, array $data): void
    {
        $domicile = $data['domicile'] ?? [];
        $isBusinessDifferent = ! empty($data['is_business_address_different']);
        $businessAddr = $data['business_address'] ?? [];

        // 1. Simpan Lokasi Domisili
        MemberLocation::updateOrCreate(
            ['application_id' => $application->id, 'kind' => 'domicile'],
            [
                'province_id' => $domicile['province_id'] ?? null,
                'regency_id' => $domicile['regency_id'] ?? null,
                'district_id' => $domicile['district_id'] ?? null,
                'village_id' => $domicile['village_id'] ?? null,
                'postal_code' => $domicile['postal_code'] ?? null,
                'address' => $domicile['address'] ?? null,
            ]
        );

        // 2. Simpan Lokasi Usaha
        if ($isBusinessDifferent) {
            MemberLocation::updateOrCreate(
                ['application_id' => $application->id, 'kind' => 'business'],
                [
                    'province_id' => $businessAddr['province_id'] ?? null,
                    'regency_id' => $businessAddr['regency_id'] ?? null,
                    'district_id' => $businessAddr['district_id'] ?? null,
                    'village_id' => $businessAddr['village_id'] ?? null,
                    'postal_code' => $businessAddr['postal_code'] ?? null,
                    'address' => $businessAddr['address'] ?? null,
                ]
            );
        } else {
            // Jika sama dengan domisili, sinkronkan atau salin nilai domisili
            MemberLocation::updateOrCreate(
                ['application_id' => $application->id, 'kind' => 'business'],
                [
                    'province_id' => $domicile['province_id'] ?? null,
                    'regency_id' => $domicile['regency_id'] ?? null,
                    'district_id' => $domicile['district_id'] ?? null,
                    'village_id' => $domicile['village_id'] ?? null,
                    'postal_code' => $domicile['postal_code'] ?? null,
                    'address' => $domicile['address'] ?? null,
                ]
            );
        }

        // 3. Simpan Lokasi Kegiatan (Multi titik koordinat)
        $activities = $data['activity_locations'] ?? [];
        $application->locations()->where('kind', 'activity')->delete();

        if (is_array($activities)) {
            foreach ($activities as $act) {
                if (isset($act['latitude'], $act['longitude']) && $act['latitude'] !== '' && $act['longitude'] !== '') {
                    $application->locations()->create([
                        'kind' => 'activity',
                        'latitude' => (float) $act['latitude'],
                        'longitude' => (float) $act['longitude'],
                        'address' => $act['label'] ?? null,
                    ]);
                }
            }
        }

        // Sinkronisasi data alamat ke primary business dan user profile untuk kompatibilitas
        $targetProvinceId = $isBusinessDifferent ? ($businessAddr['province_id'] ?? null) : ($domicile['province_id'] ?? null);
        $targetRegencyId = $isBusinessDifferent ? ($businessAddr['regency_id'] ?? null) : ($domicile['regency_id'] ?? null);
        $targetDistrictId = $isBusinessDifferent ? ($businessAddr['district_id'] ?? null) : ($domicile['district_id'] ?? null);
        $targetVillageId = $isBusinessDifferent ? ($businessAddr['village_id'] ?? null) : ($domicile['village_id'] ?? null);
        $targetPostalCode = $isBusinessDifferent ? ($businessAddr['postal_code'] ?? null) : ($domicile['postal_code'] ?? null);
        $targetAddress = $isBusinessDifferent ? ($businessAddr['address'] ?? null) : ($domicile['address'] ?? null);

        $primaryBusiness = $application->businesses->firstWhere('is_primary', true)
            ?? $application->businesses->first();

        if ($primaryBusiness) {
            $primaryBusiness->update([
                'province_id' => $targetProvinceId,
                'regency_id' => $targetRegencyId,
                'district_id' => $targetDistrictId,
                'village_id' => $targetVillageId,
                'postal_code' => $targetPostalCode,
                'address' => $targetAddress,
            ]);
        }
    }

    /**
     * Langkah 8: Paket Keanggotaan dan Administrasi.
     *
     * @param  array<string, mixed>  $data
     */
    protected function saveStep8Administration(User $user, MemberApplication $application, array $data): void
    {
        $feeItems = MembershipFeeItem::where('is_active', true)->get()->keyBy('id');
        $itemsInput = collect($data['items'] ?? [])->keyBy('fee_item_id');

        // Cari atau buat draf invoice belum ditagihkan
        $invoice = MemberInvoice::firstOrCreate(
            [
                'application_id' => $application->id,
                'status' => 'unpaid',
            ],
            [
                'number' => 'INV-NSA-'.date('Ym').'-'.str_pad((string) $application->id, 5, '0', STR_PAD_LEFT),
                'due_at' => now()->addDays(14),
                'total' => 0,
            ]
        );

        $invoice->items()->delete();
        $total = 0;

        foreach ($feeItems as $feeItem) {
            $userInput = $itemsInput->get($feeItem->id);
            $isRequired = in_array($feeItem->type, ['required', 'recurring'], true);
            $isSelected = $isRequired || ! empty($userInput['selected']);

            if ($isSelected) {
                $qty = $isRequired ? 1 : max(1, (int) ($userInput['qty'] ?? 1));
                $size = $feeItem->has_size_option
                    ? ($userInput['size'] ?? ($feeItem->size_options[0] ?? null))
                    : null;
                $amount = (float) $feeItem->amount;
                $total += $amount * $qty;

                $invoice->items()->create([
                    'fee_item_id' => $feeItem->id,
                    'name_snapshot' => $feeItem->name,
                    'amount_snapshot' => $amount,
                    'qty' => $qty,
                    'size' => $size,
                ]);
            }
        }

        $invoice->update(['total' => $total]);
    }

    /**
     * Simpan langkah fallback atau legacy.
     *
     * @param  array<string, mixed>  $data
     */
    protected function saveLegacyOrFallback(User $user, string $slug, array $data): void
    {
        $stepNumber = array_search($slug, MemberApplication::STEPS, true);
        if ($stepNumber === false) {
            $stepNumber = array_search($slug, MemberApplication::LEGACY_STEPS, true);
        }

        if ($stepNumber !== false && $stepNumber >= 1 && $stepNumber <= 8) {
            $this->legacySaver->execute($user, (int) $stepNumber, $data);
        }
    }
}
