<?php

namespace App\Http\Controllers\Account;

use App\Actions\Member\SaveRegistrationStep;
use App\Actions\Member\SubmitRegistration;
use App\Enums\BusinessScale;
use App\Enums\BusinessStatus;
use App\Enums\MembershipStatus;
use App\Enums\ProgramCategory;
use App\Http\Controllers\Controller;
use App\Http\Requests\Membership\SaveAccountStepRequest;
use App\Http\Requests\Membership\SaveAdministrationStepRequest;
use App\Http\Requests\Membership\SaveBusinessProfileStepRequest;
use App\Http\Requests\Membership\SaveBusinessStepRequest;
use App\Http\Requests\Membership\SaveCategoryStepRequest;
use App\Http\Requests\Membership\SaveCommoditiesStepRequest;
use App\Http\Requests\Membership\SaveDocumentsStepRequest;
use App\Http\Requests\Membership\SaveFishActivitiesStepRequest;
use App\Http\Requests\Membership\SaveIdentityStepRequest;
use App\Http\Requests\Membership\SaveLocationDocumentsStepRequest;
use App\Http\Requests\Membership\SaveMembershipPlanStepRequest;
use App\Http\Requests\Membership\SaveNetworkProfileStepRequest;
use App\Http\Requests\Membership\SavePersonalStepRequest;
use App\Http\Requests\Membership\SaveProgramInterestsStepRequest;
use App\Http\Requests\Membership\SaveSocialStepRequest;
use App\Http\Requests\Membership\SaveStatementStepRequest;
use App\Http\Requests\Membership\SubmitApplicationRequest;
use App\Models\BusinessField;
use App\Models\Dpc;
use App\Models\FishCategory;
use App\Models\MemberApplication;
use App\Models\MemberDocument;
use App\Models\MemberPhoto;
use App\Models\MembershipCategory;
use App\Models\MembershipFeeItem;
use App\Models\MembershipType;
use App\Models\Province;
use App\Models\Setting;
use App\Support\ActivityFormRules;
use App\Support\Brand;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class MemberRegistrationController extends Controller
{
    /**
     * Pastikan user berhak mengakses wizard pendaftaran.
     */
    protected function ensureCanAccessWizard($user): ?RedirectResponse
    {
        // Status dalam proses dikunci sementara menunggu verifikasi/pembayaran/persetujuan admin
        if (in_array($user->membership_status, [
            MembershipStatus::PendingReview,
            MembershipStatus::AwaitingPayment,
            MembershipStatus::PendingApproval,
        ], true)) {
            return redirect()->route('account.membership.status');
        }

        return null;
    }

    /**
     * GET /akun/keanggotaan/daftar -> arahkan ke langkah aktif yang sah.
     */
    public function index(Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($redirect = $this->ensureCanAccessWizard($user)) {
            return $redirect;
        }

        $application = $user->application()->firstOrCreate(
            ['user_id' => $user->id],
            [
                'status' => $user->membership_status === MembershipStatus::NonMember
                    ? MembershipStatus::Draft
                    : $user->membership_status,
                'current_step' => 'identitas',
                'completed_steps' => $user->membership_status === MembershipStatus::Approved
                    ? array_merge(array_values(MemberApplication::STEPS), array_values(MemberApplication::LEGACY_STEPS))
                    : [],
            ]
        );

        if ($user->membership_status === MembershipStatus::Approved && empty($application->completed_steps)) {
            $application->update([
                'completed_steps' => array_values(MemberApplication::STEPS),
            ]);
        }

        $activeSlug = $user->membership_status === MembershipStatus::Approved
            ? 'identitas'
            : $application->getActiveStepSlug();

        return redirect()->route('account.membership.step', ['slug' => $activeSlug]);
    }

    protected function getActiveLegacySlug(MemberApplication $application): string
    {
        $completed = $application->completed_steps ?? [];
        foreach (MemberApplication::LEGACY_STEPS as $legacySlug) {
            if (! in_array($legacySlug, $completed, true)) {
                return $legacySlug;
            }
        }

        return 'informasi-akun';
    }

    /**
     * GET /akun/keanggotaan/daftar/{slug} -> tampilkan halaman langkah wizard.
     */
    public function show(Request $request, string $slug): Response|RedirectResponse
    {
        $user = $request->user();

        if ($redirect = $this->ensureCanAccessWizard($user)) {
            return $redirect;
        }

        if (! in_array($slug, MemberApplication::STEPS, true) && ! in_array($slug, MemberApplication::LEGACY_STEPS, true)) {
            abort(404, 'Langkah pendaftaran tidak ditemukan.');
        }

        $application = $user->application()->firstOrCreate(
            ['user_id' => $user->id],
            [
                'status' => $user->membership_status === MembershipStatus::NonMember
                    ? MembershipStatus::Draft
                    : $user->membership_status,
                'current_step' => 'identitas',
                'completed_steps' => $user->membership_status === MembershipStatus::Approved
                    ? array_merge(array_values(MemberApplication::STEPS), array_values(MemberApplication::LEGACY_STEPS))
                    : [],
            ]
        );

        if ($user->membership_status === MembershipStatus::Approved && empty($application->completed_steps)) {
            $application->update([
                'completed_steps' => array_values(MemberApplication::STEPS),
            ]);
            $application->refresh();
        }

        // Guard: Jika user mencoba mengakses langkah di depan langkah yang sah
        if (! $application->canAccessStep($slug)) {
            $validSlug = in_array($slug, MemberApplication::LEGACY_STEPS, true)
                ? $this->getActiveLegacySlug($application)
                : $application->getActiveStepSlug();

            return redirect()->route('account.membership.step', ['slug' => $validSlug]);
        }

        // Ambil info kontak bantuan dari settings bila ada
        $supportPhone = Setting::get('contact_phone', Brand::supportPhone());
        $supportEmail = Setting::get('contact_email', Brand::supportEmail());

        // Load data relasi untuk wizard 9 langkah baru
        $application->load([
            'identity',
            'membershipType.category',
            'businesses.legalDocuments',
            'fishActivities',
            'networkProfile',
            'programInterests',
            'locations',
            'photos',
        ]);

        // Load data legacy user
        $user->load([
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

        $identity = $application->identity;
        $primaryBusiness = $application->businesses->firstWhere('is_primary', true)
            ?? $application->businesses->first();

        $requireKtpForWni = (bool) Setting::get(
            'membership.require_ktp_for_wni',
            config('membership.require_ktp_for_wni', true)
        );

        $requiredLegalities = config('membership.required_legalities', []);

        $locale = app()->getLocale();

        $categories = MembershipCategory::where('is_active', true)
            ->withLocale($locale)
            ->orderBy('id')
            ->get(['id', 'name', 'slug', 'description'])
            ->map(fn (MembershipCategory $cat) => [
                'id' => $cat->id,
                'name' => $cat->tr('name', $locale),
                'slug' => $cat->slug,
                'description' => $cat->tr('description', $locale),
            ]);

        $types = MembershipType::where('is_active', true)
            ->withLocale($locale)
            ->with(['category' => fn ($q) => $q->withLocale($locale)])
            ->orderBy('id')
            ->get()
            ->map(fn (MembershipType $type) => [
                'id' => $type->id,
                'category_id' => $type->category_id,
                'name' => $type->tr('name', $locale),
                'slug' => $type->slug,
                'description' => $type->tr('description', $locale),
                'ad_art_rules' => $type->tr('ad_art_rules', $locale),
                'is_active' => $type->is_active,
                'category' => $type->category ? [
                    'id' => $type->category->id,
                    'name' => $type->category->tr('name', $locale),
                    'slug' => $type->category->slug,
                ] : null,
            ]);

        $regencyId = $user->business?->regency_id;
        $suggestedDpc = null;
        if ($regencyId) {
            $dpcModel = Dpc::with('regency')->where('regency_id', $regencyId)->first();
            if ($dpcModel) {
                $suggestedDpc = [
                    'id' => $dpcModel->id,
                    'name' => $dpcModel->name,
                    'address' => $dpcModel->address,
                    'phone' => $dpcModel->phone,
                    'email' => $dpcModel->email,
                    'period' => $dpcModel->period,
                    'regency_name' => $dpcModel->regency?->name,
                ];
            }
        }

        $statementCity = $user->statement?->city ?? $user->business?->regency?->name ?? 'Jakarta';
        $statementDate = now()->translatedFormat('d F Y');
        $brandName = Brand::name();
        $brandShort = Brand::shortName();
        $rawStatementTemplate = Setting::get(
            'membership_statement_template',
            "Dengan ini saya yang bertanda tangan di bawah ini:\nNama: {nama}\nNama Usaha: {usaha}\nTanggal: {tanggal}\nKota: {kota}\n\nMenyatakan dengan sesungguhnya bahwa seluruh data, informasi, dan dokumen yang saya berikan dalam proses pendaftaran {$brandName} adalah benar, akurat, dan sesuai dengan fakta yang sebenarnya. Apabila di kemudian hari ditemukan ketidakbenaran atas data tersebut, saya bersedia menerima segala konsekuensi hukum maupun sanksi organisasi sesuai ketentuan AD/ART {$brandShort}."
        );

        $statementText = str_replace(
            ['{nama}', '{usaha}', '{tanggal}', '{kota}'],
            [$user->name, $primaryBusiness?->name ?? $user->business?->name ?? 'Perorangan', $statementDate, $statementCity],
            $rawStatementTemplate
        );

        $domicileLocation = $application->locations->firstWhere('kind', 'domicile');
        $businessLocation = $application->locations->firstWhere('kind', 'business');
        $activityLocations = $application->locations->where('kind', 'activity');
        $isDifferent = false;
        if ($businessLocation && $domicileLocation) {
            $isDifferent = ($businessLocation->province_id !== $domicileLocation->province_id)
                || ($businessLocation->regency_id !== $domicileLocation->regency_id)
                || ($businessLocation->address !== $domicileLocation->address);
        }

        $activeInvoice = $application->invoices()->where('status', 'unpaid')->with('items')->first();
        $invoiceItems = $activeInvoice ? $activeInvoice->items->keyBy('fee_item_id') : collect();
        $feeItems = MembershipFeeItem::where('is_active', true)
            ->withLocale($locale)
            ->orderBy('order')
            ->get();
        $requireInitialVerification = (bool) Setting::get('membership.require_initial_verification', true);

        // Dokumen yang sudah diunggah oleh pengguna
        $userDocuments = MemberDocument::where('user_id', $user->id)->get()->map(fn ($doc) => [
            'id' => $doc->id,
            'type' => $doc->type,
            'original_name' => $doc->original_name,
            'file_size' => $doc->file_size,
            'formatted_size' => $doc->formatted_size,
            'mime_type' => $doc->mime_type,
            'status' => $doc->status,
            'signed_url' => $doc->signed_url,
        ]);

        // Daftar dokumen wajib dinamis dari Langkah 1-3
        $requiredDocsList = [];
        if ($identity && $identity->nationality === 'wna') {
            $requiredDocsList[] = [
                'type' => 'passport',
                'title' => 'Paspor (Warga Negara Asing)',
                'description' => 'Foto atau pindaian paspor resmi yang masih berlaku.',
                'required' => true,
            ];
        } else {
            $requiredDocsList[] = [
                'type' => 'ktp',
                'title' => 'Kartu Tanda Penduduk (KTP)',
                'description' => 'Foto atau pindaian e-KTP asli yang jelas dan terbaca.',
                'required' => $requireKtpForWni,
            ];
        }

        if ($primaryBusiness && ! $primaryBusiness->has_no_business) {
            foreach ($primaryBusiness->legalDocuments as $ld) {
                if (! empty($ld->type)) {
                    $requiredDocsList[] = [
                        'type' => $ld->type,
                        'title' => ($ld->label ?: strtoupper($ld->type)).($ld->number ? " ({$ld->number})" : ''),
                        'description' => "Dokumen resmi perizinan {$ld->type} sesuai data Profil Usaha.",
                        'required' => true,
                    ];
                }
            }
        }

        // Hitung kelengkapan berkas untuk validasi Langkah 9
        $missingItems = [];
        if (! $identity || empty($identity->full_name) || empty($identity->birth_date) || empty($identity->phone)) {
            $missingItems['Langkah 1 (Identitas)'] = ['Nama, tanggal lahir, dan kontak wajib lengkap'];
        }
        if (empty($application->membership_category) || empty($application->membership_type_id)) {
            $missingItems['Langkah 2 (Kategori)'] = ['Kategori dan jenis keanggotaan wajib dipilih'];
        }
        if (! $primaryBusiness || (! $primaryBusiness->has_no_business && empty($primaryBusiness->name))) {
            $missingItems['Langkah 3 (Profil Usaha)'] = ['Data usaha wajib diisi'];
        }
        if (! $application->networkProfile) {
            $missingItems['Langkah 5 (Jaringan Bisnis)'] = ['Data jaringan & pemasaran belum disimpan'];
        }
        if ($application->programInterests->isEmpty()) {
            $missingItems['Langkah 6 (Minat Program)'] = ['Minimal 1 minat program kerja wajib dipilih'];
        }
        if (! $domicileLocation || empty($domicileLocation->province_id) || empty($domicileLocation->regency_id) || empty($domicileLocation->address)) {
            $missingItems['Langkah 7 (Lokasi)'] = ['Alamat domisili lengkap wajib diisi'];
        }

        // Cek berkas wajib yang belum diunggah
        $uploadedTypes = $userDocuments->pluck('type')->toArray();
        foreach ($requiredDocsList as $rd) {
            if ($rd['required'] && ! in_array($rd['type'], $uploadedTypes, true)) {
                $missingItems['Langkah 7 (Dokumen)'][] = "Berkas {$rd['title']} belum diunggah";
            }
        }

        $canSubmit = empty($missingItems);

        $draft = [
            // 9 Langkah Baru
            'identitas' => [
                'nationality' => $identity?->nationality ?? 'wni',
                'full_name' => $identity?->full_name ?? $user->name,
                'gender' => $identity?->gender ?? 'male',
                'birth_place' => $identity?->birth_place ?? '',
                'birth_date' => $identity?->birth_date?->format('Y-m-d') ?? '',
                'phone' => $identity?->phone ?? $user->phone ?? '',
                'email' => $identity?->email ?? $user->email,
                'nik' => $identity?->nik ?? '',
                'province_id' => $identity?->ktp_address['province_id'] ?? null,
                'regency_id' => $identity?->ktp_address['regency_id'] ?? null,
                'district_id' => $identity?->ktp_address['district_id'] ?? null,
                'village_id' => $identity?->ktp_address['village_id'] ?? null,
                'postal_code' => $identity?->ktp_address['postal_code'] ?? '',
                'address' => $identity?->ktp_address['address'] ?? '',
                'passport_number' => $identity?->passport_number ?? '',
                'origin_country' => $identity?->origin_country ?? '',
                'years_in_indonesia' => $identity?->years_in_indonesia ?? '',
            ],
            'kategori-keanggotaan' => [
                'membership_category' => $application->membership_category ?? '',
                'membership_category_custom' => $application->membership_category_custom ?? '',
                'applicant_type' => $application->applicant_type ?? 'individual',
                'institution_name' => $application->institution_name ?? '',
                'applicant_position' => $application->applicant_position ?? '',
                'membership_type_id' => $application->membership_type_id ?? null,
            ],
            'profil-usaha' => [
                'has_no_business' => (bool) ($primaryBusiness?->has_no_business ?? false),
                'main_job' => $primaryBusiness?->main_job ?? '',
                'name' => $primaryBusiness?->name ?? '',
                'activity_field' => $primaryBusiness?->activity_field ?? '',
                'years_operating' => $primaryBusiness?->years_operating ?? '',
                'scale' => $primaryBusiness?->scale ?? 'Mikro',
                'operational_info' => $primaryBusiness?->operational_info ?? '',
                'legal_documents' => $primaryBusiness?->legalDocuments->map(fn ($doc) => [
                    'id' => $doc->id,
                    'type' => $doc->type,
                    'number' => $doc->number,
                    'label' => $doc->label,
                    'issued_at' => $doc->issued_at?->format('Y-m-d') ?? '',
                    'expires_at' => $doc->expires_at?->format('Y-m-d') ?? '',
                    'file_path' => $doc->file_path,
                    'file_url' => $doc->file_url,
                ])->values()->all() ?? [],
            ],
            'aktivitas-perikanan' => [
                'activities' => $application->fishActivities->map(fn ($act) => [
                    'id' => $act->id,
                    'fish_category_id' => $act->fish_category_id,
                    'farming_system' => $act->farming_system ?? '',
                    'pond_count' => $act->pond_count ?? '',
                    'production_amount' => $act->production_amount !== null ? (float) $act->production_amount : '',
                    'production_unit' => $act->production_unit ?? 'ton',
                    'period' => $act->period ?? 'per siklus',
                    'seed_need' => $act->seed_need ?? '',
                    'feed_need' => $act->feed_need ?? '',
                    'purchase_capacity' => $act->purchase_capacity ?? '',
                    'notes' => $act->notes ?? '',
                ])->values()->all(),
            ],
            'jaringan-bisnis' => [
                'marketing_info' => $application->networkProfile?->marketing_info ?? '',
                'distribution_areas' => $application->networkProfile?->distribution_areas ?? [],
                'supply_needs' => $application->networkProfile?->supply_needs ?? '',
                'cooperation_types' => $application->networkProfile?->cooperation_types ?? [],
                'cooperation_types_custom' => '',
                'professional_activities' => $application->networkProfile?->professional_activities ?? '',
            ],
            'minat-program' => [
                'interests' => $application->programInterests->pluck('category')->map(fn ($c) => $c instanceof ProgramCategory ? $c->value : (string) $c)->all(),
                'note' => $application->programInterests->first()?->note ?? '',
            ],
            'lokasi-dokumen' => [
                'domicile' => [
                    'province_id' => $domicileLocation?->province_id ?? $identity?->ktp_address['province_id'] ?? null,
                    'regency_id' => $domicileLocation?->regency_id ?? $identity?->ktp_address['regency_id'] ?? null,
                    'district_id' => $domicileLocation?->district_id ?? $identity?->ktp_address['district_id'] ?? null,
                    'village_id' => $domicileLocation?->village_id ?? $identity?->ktp_address['village_id'] ?? null,
                    'postal_code' => $domicileLocation?->postal_code ?? $identity?->ktp_address['postal_code'] ?? '',
                    'address' => $domicileLocation?->address ?? $identity?->ktp_address['address'] ?? '',
                ],
                'is_business_address_different' => $isDifferent,
                'business_address' => [
                    'province_id' => $businessLocation?->province_id ?? null,
                    'regency_id' => $businessLocation?->regency_id ?? null,
                    'district_id' => $businessLocation?->district_id ?? null,
                    'village_id' => $businessLocation?->village_id ?? null,
                    'postal_code' => $businessLocation?->postal_code ?? '',
                    'address' => $businessLocation?->address ?? '',
                ],
                'activity_locations' => $activityLocations->map(fn ($act) => [
                    'id' => $act->id,
                    'latitude' => $act->latitude,
                    'longitude' => $act->longitude,
                    'label' => $act->address ?? '',
                ])->values()->all(),
                'photos' => $application->photos->map(fn ($p) => [
                    'id' => $p->id,
                    'path' => $p->path,
                    'url' => $p->url,
                    'caption' => $p->caption,
                ])->values()->all(),
            ],
            'paket-administrasi' => [
                'items' => $feeItems->map(function ($fee) use ($invoiceItems, $locale) {
                    $existing = $invoiceItems->get($fee->id);
                    $isRequired = in_array($fee->type, ['required', 'recurring'], true);

                    return [
                        'fee_item_id' => $fee->id,
                        'code' => $fee->code,
                        'name' => $fee->tr('name', $locale),
                        'description' => $fee->tr('description', $locale),
                        'amount' => (float) $fee->amount,
                        'type' => $fee->type,
                        'has_size_option' => (bool) $fee->has_size_option,
                        'size_options' => $fee->size_options ?? [],
                        'selected' => $isRequired ? true : ($existing !== null),
                        'qty' => $existing ? $existing->qty : 1,
                        'size' => $existing ? $existing->size : ($fee->size_options[0] ?? null),
                    ];
                })->values()->all(),
            ],
            'pemeriksaan' => [
                'agree_terms' => false,
                'agree_privacy' => false,
            ],
            // Kompatibilitas langkah legacy
            'step1' => [
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone ?? '',
                'has_password' => ! empty($user->password),
            ],
            'step2' => [
                'nik' => $identity?->nik ?? $user->profile?->nik ?? '',
                'name_ktp' => $identity?->full_name ?? $user->profile?->name_ktp ?? $user->name,
                'birth_place' => $identity?->birth_place ?? $user->profile?->birth_place ?? '',
                'birth_date' => $identity?->birth_date?->format('Y-m-d') ?? $user->profile?->birth_date?->format('Y-m-d') ?? '',
                'gender' => $identity?->gender ?? $user->profile?->gender ?? 'male',
                'occupation' => $user->profile?->occupation ?? '',
                'address' => $identity?->ktp_address['address'] ?? $user->profile?->address ?? '',
                'province_id' => $identity?->ktp_address['province_id'] ?? $user->profile?->province_id ?? null,
                'regency_id' => $identity?->ktp_address['regency_id'] ?? $user->profile?->regency_id ?? null,
                'district_id' => $identity?->ktp_address['district_id'] ?? $user->profile?->district_id ?? null,
                'village_id' => $identity?->ktp_address['village_id'] ?? $user->profile?->village_id ?? null,
                'postal_code' => $identity?->ktp_address['postal_code'] ?? $user->profile?->postal_code ?? '',
            ],
            'step3' => [
                'membership_type' => $user->business?->membership_type ?? 'Pembudidaya',
                'membership_type_other' => $user->business?->membership_type_other ?? '',
                'business_name' => $user->business?->name ?? '',
                'owner_name' => $user->business?->owner_name ?? $user->name,
                'nib' => $user->business?->nib ?? '',
                'npwp' => $user->business?->npwp ?? '',
                'founded_at' => $user->business?->founded_at?->format('Y-m-d') ?? '',
                'employee_count' => $user->business?->employee_count ?? 1,
                'annual_revenue' => $user->business?->annual_revenue ? (int) $user->business->annual_revenue : null,
                'business_status' => $user->business?->business_status ?? 'Perorangan',
                'business_scale' => $user->business?->business_scale ?? 'Mikro',
                'province_id' => $user->business?->province_id ?? null,
                'regency_id' => $user->business?->regency_id ?? null,
                'district_id' => $user->business?->district_id ?? null,
                'village_id' => $user->business?->village_id ?? null,
                'postal_code' => $user->business?->postal_code ?? '',
                'business_address' => $user->business?->address ?? '',
                'latitude' => $user->business?->latitude ? (float) $user->business->latitude : null,
                'longitude' => $user->business?->longitude ? (float) $user->business->longitude : null,
                'business_field_ids' => $user->businessFields->pluck('id')->toArray(),
                'business_field_other' => $user->business?->business_field_other ?? '',
            ],
        ];

        return Inertia::render('Member/Register/Index', [
            'application' => [
                'id' => $application->id,
                'status' => $application->status->value,
                'current_step' => $application->current_step,
                'completed_steps' => $application->completed_steps ?? [],
                'membership_category' => $application->membership_category,
            ],
            'currentStepSlug' => $slug,
            'draft' => $draft,
            'categories' => $categories,
            'membershipTypes' => $types,
            'activityFormConfig' => ActivityFormRules::getCategoryConfig($application->membership_category),
            'programCategories' => collect(ProgramCategory::cases())->map(fn ($c) => [
                'value' => $c->value,
                'label' => $c->label(),
            ])->values()->all(),
            'requireKtpForWni' => $requireKtpForWni,
            'requiredLegalities' => $requiredLegalities,
            'supportContact' => [
                'phone' => $supportPhone,
                'email' => $supportEmail,
            ],
            'businessFields' => BusinessField::withLocale($locale)
                ->orderBy('id')
                ->get(['id', 'name', 'slug'])
                ->map(fn (BusinessField $bf) => [
                    'id' => $bf->id,
                    'name' => $bf->tr('name', $locale),
                    'slug' => $bf->slug,
                ]),
            'fishCategories' => FishCategory::where('is_active', true)
                ->withLocale($locale)
                ->orderBy('name')
                ->get(['id', 'name', 'slug'])
                ->map(fn (FishCategory $fc) => [
                    'id' => $fc->id,
                    'name' => $fc->tr('name', $locale),
                    'slug' => $fc->slug,
                ]),
            'provinces' => Province::orderBy('name')->get(['id', 'name']),
            'businessStatuses' => BusinessStatus::values(),
            'businessScales' => BusinessScale::values(),
            'memberDocumentsConfig' => config('member_documents', []),
            'userDocuments' => $userDocuments,
            'requiredDocsList' => $requiredDocsList,
            'membershipFeeItems' => $feeItems->map(fn (MembershipFeeItem $fee) => [
                'id' => $fee->id,
                'code' => $fee->code,
                'name' => $fee->tr('name', $locale),
                'description' => $fee->tr('description', $locale),
                'amount' => $fee->amount,
                'type' => $fee->type,
                'has_size_option' => $fee->has_size_option,
                'size_options' => $fee->size_options,
                'is_active' => $fee->is_active,
                'order' => $fee->order,
            ]),
            'requireInitialVerification' => $requireInitialVerification,
            'termsModalContent' => Setting::get(
                'membership_terms_content',
                "Ketentuan Keanggotaan NSA:\n\n1. Mematuhi Anggaran Dasar dan Anggaran Rumah Tangga (AD/ART) NSA.\n2. Berkomitmen menjaga kelestarian ekosistem dan budidaya perikanan berkelanjutan.\n3. Menjunjung tinggi nama baik, integritas, dan etika asosiasi."
            ),
            'privacyModalContent' => Setting::get(
                'membership_privacy_content',
                "Kebijakan Privasi NSA:\n\n1. Seluruh data identitas dan dokumen perizinan Anda disimpan secara aman dan terenkripsi.\n2. Data Anda hanya digunakan untuk verifikasi keanggotaan, sensus statistik perikanan, serta layanan keanggotaan NSA.\n3. NSA tidak pernah menjual atau mendistribusikan data pribadi Anda ke pihak ketiga tanpa persetujuan."
            ),
            'suggestedDpc' => $suggestedDpc,
            'statementTemplate' => $statementText,
            'statementCity' => $statementCity,
            'statementDate' => $statementDate,
            'missingItems' => $missingItems,
            'stepCompleteness' => [],
            'canSubmit' => $canSubmit,
        ]);
    }

    /**
     * PATCH /akun/keanggotaan/daftar/{slug} -> simpan data langkah dan tandai selesai.
     */
    public function update(Request $request, string $slug, SaveRegistrationStep $action): JsonResponse|RedirectResponse
    {
        $user = $request->user();

        if ($redirect = $this->ensureCanAccessWizard($user)) {
            return $redirect;
        }

        if (! in_array($slug, MemberApplication::STEPS, true) && ! in_array($slug, MemberApplication::LEGACY_STEPS, true)) {
            abort(404, 'Langkah pendaftaran tidak ditemukan.');
        }

        // Jalankan validasi Form Request spesifik per langkah 9-langkah baru
        if ($slug === 'identitas') {
            app(SaveIdentityStepRequest::class);
        } elseif ($slug === 'kategori-keanggotaan') {
            app(SaveCategoryStepRequest::class);
        } elseif ($slug === 'profil-usaha') {
            app(SaveBusinessProfileStepRequest::class);
        } elseif ($slug === 'aktivitas-perikanan') {
            app(SaveFishActivitiesStepRequest::class);
        } elseif ($slug === 'jaringan-bisnis') {
            app(SaveNetworkProfileStepRequest::class);
        } elseif ($slug === 'minat-program') {
            app(SaveProgramInterestsStepRequest::class);
        } elseif ($slug === 'lokasi-dokumen') {
            app(SaveLocationDocumentsStepRequest::class);
        } elseif ($slug === 'paket-administrasi') {
            app(SaveAdministrationStepRequest::class);
        } elseif ($slug === 'informasi-akun') {
            app(SaveAccountStepRequest::class);
        } elseif ($slug === 'data-pribadi') {
            app(SavePersonalStepRequest::class);
        } elseif ($slug === 'data-usaha-perikanan' || $slug === 'data-usaha') {
            app(SaveBusinessStepRequest::class);
        } elseif ($slug === 'dokumen') {
            app(SaveDocumentsStepRequest::class);
        } elseif ($slug === 'media-sosial') {
            app(SaveSocialStepRequest::class);
        } elseif ($slug === 'data-komoditas') {
            app(SaveCommoditiesStepRequest::class);
        } elseif ($slug === 'keanggotaan') {
            app(SaveMembershipPlanStepRequest::class);
        } elseif ($slug === 'surat-pernyataan') {
            app(SaveStatementStepRequest::class);
        }

        $application = $action->execute($user, $slug, $request->all());

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Langkah berhasil disimpan.',
                'application' => [
                    'id' => $application->id,
                    'status' => $application->status->value,
                    'current_step' => $application->current_step,
                    'completed_steps' => $application->completed_steps ?? [],
                ],
                'next_step' => $application->getNextStepSlug($slug),
            ]);
        }

        $nextSlug = $application->getNextStepSlug($slug);
        if ($nextSlug) {
            return redirect()->route('account.membership.step', ['slug' => $nextSlug]);
        }

        return back()->with('success', 'Langkah berhasil disimpan.');
    }

    /**
     * POST /akun/keanggotaan/foto -> unggah foto usaha (maksimal 5).
     */
    public function uploadPhoto(Request $request): JsonResponse
    {
        $request->validate([
            'photo' => ['required', 'image', 'mimes:jpeg,jpg,png,webp', 'max:5120'],
            'caption' => ['nullable', 'string', 'max:100'],
        ], [
            'photo.required' => 'Berkas foto usaha wajib diunggah.',
            'photo.image' => 'Berkas harus berupa gambar.',
            'photo.mimes' => 'Format gambar yang diperbolehkan: JPG, PNG, atau WEBP.',
            'photo.max' => 'Ukuran foto maksimal 5 MB.',
        ]);

        $user = $request->user();
        $application = $user->application;
        if (! $application) {
            abort(404, 'Aplikasi pendaftaran belum dibuat.');
        }

        if ($application->photos()->count() >= 5) {
            return response()->json([
                'success' => false,
                'message' => 'Maksimal 5 foto usaha telah tercapai.',
            ], 422);
        }

        $file = $request->file('photo');
        $path = $file->store("member-photos/{$application->id}", 'public');

        $photo = $application->photos()->create([
            'path' => $path,
            'caption' => $request->input('caption'),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Foto usaha berhasil diunggah.',
            'photo' => [
                'id' => $photo->id,
                'path' => $photo->path,
                'url' => $photo->url,
                'caption' => $photo->caption,
            ],
        ]);
    }

    /**
     * DELETE /akun/keanggotaan/foto/{photo} -> hapus foto usaha.
     */
    public function deletePhoto(MemberPhoto $photo, Request $request): JsonResponse
    {
        $user = $request->user();
        if ($photo->application?->user_id !== $user->id) {
            abort(403, 'Anda tidak berhak menghapus foto ini.');
        }

        if (Storage::disk('public')->exists($photo->path)) {
            Storage::disk('public')->delete($photo->path);
        }

        $photo->delete();

        return response()->json([
            'success' => true,
            'message' => 'Foto berhasil dihapus.',
        ]);
    }

    /**
     * POST /akun/keanggotaan/daftar/kirim -> finalisasi dan kirim pengajuan keanggotaan.
     */
    public function submit(Request $request, SubmitRegistration $action): JsonResponse|RedirectResponse
    {
        $user = $request->user();

        if ($redirect = $this->ensureCanAccessWizard($user)) {
            return $redirect;
        }

        // Jika status sudah Approved, simpan pembaruan tanpa menurunkan status ke Pending
        if ($user->membership_status === MembershipStatus::Approved) {
            return $request->wantsJson()
                ? response()->json([
                    'success' => true,
                    'message' => 'Pembaruan data keanggotaan berhasil disimpan.',
                    'redirect_url' => route('account.membership.status'),
                ])
                : redirect()->route('account.membership.status')
                    ->with('success', 'Pembaruan data keanggotaan berhasil disimpan.');
        }

        $application = $user->application;
        if ($application && $application->identity) {
            app(SubmitApplicationRequest::class);
        }

        $action->execute($user, $request->all());

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Pendaftaran keanggotaan berhasil diajukan.',
                'redirect_url' => route('account.membership.status'),
            ]);
        }

        return redirect()->route('account.membership.status')
            ->with('success', 'Pendaftaran keanggotaan berhasil diajukan ke tim verifikator '.Brand::shortName().'.');
    }
}
