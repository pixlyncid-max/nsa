<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Admin\ApproveMember;
use App\Actions\Admin\PassInitialVerification;
use App\Actions\Admin\RejectMember;
use App\Actions\Admin\RejectPaymentProof;
use App\Actions\Admin\RequestMemberRevision;
use App\Enums\MembershipStatus;
use App\Enums\ProgramCategory;
use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\MembershipPlan;
use App\Models\Province;
use App\Models\Regency;
use App\Models\User;
use App\Support\Brand;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\URL;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class MemberController extends Controller
{
    /**
     * Tampilkan daftar pendaftaran dan anggota dengan filter lengkap.
     */
    public function index(Request $request): Response
    {
        Gate::authorize('verifyMember', User::class);

        $query = User::query()
            ->where('role', Role::User)
            ->with([
                'profile',
                'business.province',
                'business.regency',
                'application.membershipPlan',
                'application.membershipType',
                'application.businesses',
                'application.locations.province',
                'application.locations.regency',
            ]);

        // Filter Pencarian (Nama, Email, No. HP, NTA, Nama Usaha, NIB)
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('member_number', 'like', "%{$search}%")
                    ->orWhereHas('business', function ($bq) use ($search) {
                        $bq->where('name', 'like', "%{$search}%")
                            ->orWhere('business_name', 'like', "%{$search}%")
                            ->orWhere('nib', 'like', "%{$search}%");
                    });
            });
        }

        // Filter Tab Antrean (Verifikasi Awal, Menunggu Pembayaran, Menunggu Persetujuan, Disetujui, Ditolak)
        $tab = $request->input('tab');
        if ($tab) {
            match ($tab) {
                'verifikasi_awal' => $query->whereIn('membership_status', [MembershipStatus::PendingReview, 'pending']),
                'menunggu_pembayaran' => $query->where('membership_status', MembershipStatus::AwaitingPayment),
                'menunggu_persetujuan' => $query->where('membership_status', MembershipStatus::PendingApproval),
                'disetujui' => $query->where('membership_status', MembershipStatus::Approved),
                'ditolak' => $query->whereIn('membership_status', [MembershipStatus::Rejected, MembershipStatus::Revision]),
                default => null,
            };
        } elseif ($status = $request->input('status')) {
            if ($status === 'pending') {
                $query->whereIn('membership_status', [MembershipStatus::PendingReview, 'pending']);
            } else {
                $query->where('membership_status', $status);
            }
        }

        // Filter Wilayah Usaha (Provinsi & Kabupaten/Kota)
        if ($provinceId = $request->input('province_id')) {
            $query->whereHas('business', fn ($bq) => $bq->where('province_id', $provinceId));
        }

        if ($regencyId = $request->input('regency_id')) {
            $query->whereHas('business', fn ($bq) => $bq->where('regency_id', $regencyId));
        }

        // Filter Jenis Keanggotaan (Membership Plan)
        if ($membershipType = $request->input('membership_type')) {
            $query->whereHas('application', function ($aq) use ($membershipType) {
                if (is_numeric($membershipType)) {
                    $aq->where('membership_plan_id', $membershipType);
                } else {
                    $aq->whereHas('membershipPlan', fn ($pq) => $pq->where('slug', $membershipType));
                }
            });
        }

        // Filter Rentang Tanggal Pendaftaran
        if ($dateFrom = $request->input('date_from')) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }

        if ($dateTo = $request->input('date_to')) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        // Pengurutan
        $sort = $request->input('sort', 'newest');
        match ($sort) {
            'oldest' => $query->oldest(),
            'name_asc' => $query->orderBy('name', 'asc'),
            'name_desc' => $query->orderBy('name', 'desc'),
            default => $query->latest(),
        };

        $members = $query->paginate(15)->withQueryString()->through(function ($u) {
            return [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'phone' => $u->phone,
                'membership_status' => $u->membership_status instanceof MembershipStatus ? $u->membership_status->value : (string) $u->membership_status,
                'member_number' => $u->member_number,
                'business_name' => $u->application?->businesses?->first()?->name ?? $u->business?->name ?? $u->business?->business_name ?? '-',
                'nib' => $u->application?->businesses?->first()?->nib ?? $u->business?->nib ?? '-',
                'province' => $u->application?->locations?->firstWhere('kind', 'business')?->province?->name ?? $u->application?->locations?->firstWhere('kind', 'domicile')?->province?->name ?? $u->business?->province?->name ?? '-',
                'regency' => $u->application?->locations?->firstWhere('kind', 'business')?->regency?->name ?? $u->application?->locations?->firstWhere('kind', 'domicile')?->regency?->name ?? $u->business?->regency?->name ?? '-',
                'membership_type' => $u->application?->membershipType?->name ?? $u->application?->membershipPlan?->name ?? '-',
                'created_at' => $u->created_at?->format('d/m/Y H:i'),
                'submitted_at' => $u->application?->submitted_at?->format('d/m/Y H:i') ?? $u->created_at?->format('d/m/Y H:i'),
            ];
        });

        $provinces = Province::orderBy('name')->get(['id', 'name']);
        $regencies = $provinceId ? Regency::where('province_id', $provinceId)->orderBy('name')->get(['id', 'name']) : [];
        $membershipPlans = MembershipPlan::where('is_active', true)->orderBy('order')->get(['id', 'name', 'slug']);

        $tabCounts = [
            'verifikasi_awal' => User::where('role', Role::User)->whereIn('membership_status', [MembershipStatus::PendingReview, 'pending'])->count(),
            'menunggu_pembayaran' => User::where('role', Role::User)->where('membership_status', MembershipStatus::AwaitingPayment)->count(),
            'menunggu_persetujuan' => User::where('role', Role::User)->where('membership_status', MembershipStatus::PendingApproval)->count(),
            'disetujui' => User::where('role', Role::User)->where('membership_status', MembershipStatus::Approved)->count(),
            'ditolak' => User::where('role', Role::User)->whereIn('membership_status', [MembershipStatus::Rejected, MembershipStatus::Revision])->count(),
        ];

        return Inertia::render('Admin/Members/Index', [
            'members' => $members,
            'tabCounts' => $tabCounts,
            'activeTab' => $tab ?? 'verifikasi_awal',
            'filters' => [
                'tab' => $tab,
                'search' => $request->input('search', ''),
                'status' => $request->input('status', ''),
                'province_id' => $request->input('province_id', ''),
                'regency_id' => $request->input('regency_id', ''),
                'membership_type' => $request->input('membership_type', ''),
                'date_from' => $request->input('date_from', ''),
                'date_to' => $request->input('date_to', ''),
                'sort' => $sort,
            ],
            'provinces' => $provinces,
            'regencies' => $regencies,
            'membershipPlans' => $membershipPlans,
            'statusOptions' => array_map(fn ($case) => [
                'value' => $case->value,
                'label' => $case->label(),
            ], MembershipStatus::cases()),
        ]);
    }

    /**
     * Tampilkan detail lengkap 9 langkah pendaftaran anggota.
     */
    public function show(User $member): Response
    {
        Gate::authorize('verifyMember', User::class);

        $member->load([
            'profile.province',
            'profile.regency',
            'profile.district',
            'profile.village',
            'business.province',
            'business.regency',
            'business.district',
            'business.village',
            'businessFields',
            'documents',
            'socialLinks',
            'commodities.fishCategory',
            'application.identity',
            'application.membershipType.category',
            'application.businesses.legalDocuments',
            'application.fishActivities.fishCategory',
            'application.networkProfile',
            'application.programInterests',
            'application.locations.province',
            'application.locations.regency',
            'application.locations.district',
            'application.locations.village',
            'application.photos',
            'application.invoices.items.feeItem',
            'application.invoices.payments',
            'application.membershipPlan',
            'application.dpc.province',
            'application.dpc.regency',
            'statement',
            'reviewLogs.admin',
        ]);

        $documentsWithUrls = $member->documents->map(function ($doc) {
            return [
                'id' => $doc->id,
                'type' => $doc->type,
                'original_name' => $doc->original_name,
                'file_size' => $doc->file_size,
                'file_size_formatted' => $doc->file_size ? number_format($doc->file_size / 1024, 1).' KB' : '-',
                'preview_url' => URL::temporarySignedRoute(
                    'account.documents.signed',
                    now()->addHours(4),
                    ['document' => $doc->id]
                ),
            ];
        });

        $statementData = $member->statement ? [
            'id' => $member->statement->id,
            'city' => $member->statement->city,
            'agree_data_accurate' => (bool) $member->statement->agree_data_accurate,
            'agree_ad_art' => (bool) $member->statement->agree_ad_art,
            'agree_privacy_policy' => (bool) $member->statement->agree_privacy_policy,
            'signed_at' => $member->statement->signed_at?->format('d/m/Y H:i'),
            'signature_url' => $member->statement->getSignedUrl(240),
        ] : null;

        $invoicesData = $member->application?->invoices->map(function ($inv) {
            $latestPayment = $inv->payments->last();

            return [
                'id' => $inv->id,
                'number' => $inv->number,
                'status' => $inv->status,
                'total' => (float) $inv->total,
                'due_at' => $inv->due_at?->format('d/m/Y H:i'),
                'items' => $inv->items->map(fn ($it) => [
                    'id' => $it->id,
                    'name' => $it->name_snapshot,
                    'amount' => (float) $it->amount_snapshot,
                    'qty' => $it->qty,
                    'size' => $it->size,
                    'subtotal' => (float) $it->subtotal,
                ]),
                'latest_payment' => $latestPayment ? [
                    'id' => $latestPayment->id,
                    'amount' => (float) $latestPayment->amount,
                    'status' => $latestPayment->status,
                    'proof_url' => $latestPayment->proof_url,
                    'sender_name' => $latestPayment->sender_name,
                    'sender_bank' => $latestPayment->sender_bank,
                    'paid_at' => $latestPayment->paid_at?->format('d/m/Y'),
                    'notes' => $latestPayment->notes,
                ] : null,
            ];
        }) ?? [];

        return Inertia::render('Admin/Members/Show', [
            'member' => [
                'id' => $member->id,
                'name' => $member->name,
                'email' => $member->email,
                'phone' => $member->phone,
                'membership_status' => $member->membership_status instanceof MembershipStatus ? $member->membership_status->value : (string) $member->membership_status,
                'member_number' => $member->member_number,
                'avatar' => $member->avatar,
                'created_at' => $member->created_at?->format('d/m/Y H:i'),
                'profile' => $member->profile,
                'business' => $member->business,
                'business_fields' => $member->businessFields->pluck('name'),
                'documents' => $documentsWithUrls,
                'social_links' => $member->socialLinks,
                'commodities' => $member->commodities,
                'application' => $member->application ? [
                    'id' => $member->application->id,
                    'status' => $member->application->status instanceof MembershipStatus ? $member->application->status->value : (string) $member->application->status,
                    'current_step' => $member->application->current_step,
                    'review_note' => $member->application->review_note,
                    'membership_category' => $member->application->membership_category,
                    'membership_category_custom' => $member->application->membership_category_custom,
                    'applicant_type' => $member->application->applicant_type,
                    'institution_name' => $member->application->institution_name,
                    'applicant_position' => $member->application->applicant_position,
                    'membership_type' => $member->application->membershipType?->name,
                    'identity' => $member->application->identity ? [
                        'full_name' => $member->application->identity->full_name,
                        'nationality' => $member->application->identity->nationality,
                        'nik' => $member->application->identity->nik,
                        'passport_number' => $member->application->identity->passport_number,
                        'origin_country' => $member->application->identity->origin_country,
                        'years_in_indonesia' => $member->application->identity->years_in_indonesia,
                        'gender' => $member->application->identity->gender,
                        'birth_place' => $member->application->identity->birth_place,
                        'birth_date' => $member->application->identity->birth_date?->format('d/m/Y'),
                        'phone' => $member->application->identity->phone,
                        'email' => $member->application->identity->email,
                        'ktp_address' => $member->application->identity->ktp_address,
                    ] : null,
                    'businesses' => $member->application->businesses->map(fn ($b) => [
                        'id' => $b->id,
                        'name' => $b->name,
                        'activity_field' => $b->activity_field,
                        'scale' => $b->scale,
                        'years_operating' => $b->years_operating,
                        'has_no_business' => (bool) $b->has_no_business,
                        'main_job' => $b->main_job,
                        'legal_documents' => $b->legalDocuments->map(fn ($ld) => [
                            'type' => $ld->type,
                            'number' => $ld->number,
                            'label' => $ld->label,
                        ]),
                    ]),
                    'fish_activities' => $member->application->fishActivities->map(fn ($fa) => [
                        'farming_system' => $fa->farming_system,
                        'pond_count' => $fa->pond_count,
                        'production_amount' => $fa->production_amount,
                        'production_unit' => $fa->production_unit,
                        'period' => $fa->period,
                        'seed_need' => $fa->seed_need,
                        'feed_need' => $fa->feed_need,
                        'purchase_capacity' => $fa->purchase_capacity,
                        'notes' => $fa->notes,
                    ]),
                    'network_profile' => $member->application->networkProfile,
                    'program_interests' => $member->application->programInterests->map(fn ($pi) => [
                        'category' => $pi->category instanceof ProgramCategory ? $pi->category->label() : (string) $pi->category,
                        'note' => $pi->note,
                    ]),
                    'locations' => $member->application->locations->map(fn ($loc) => [
                        'kind' => $loc->kind,
                        'province' => $loc->province?->name,
                        'regency' => $loc->regency?->name,
                        'address' => $loc->address,
                        'latitude' => $loc->latitude,
                        'longitude' => $loc->longitude,
                    ]),
                    'photos' => $member->application->photos->map(fn ($p) => [
                        'id' => $p->id,
                        'url' => $p->url,
                        'caption' => $p->caption,
                    ]),
                    'invoices' => $invoicesData,
                    'submitted_at' => $member->application->submitted_at?->format('d/m/Y H:i'),
                    'approved_at' => $member->application->approved_at?->format('d/m/Y H:i'),
                    'previous_organization' => $member->application->previous_organization,
                    'recommender_name' => $member->application->recommender_name,
                    'join_reason' => $member->application->join_reason,
                    'plan' => $member->application->membershipPlan ? [
                        'id' => $member->application->membershipPlan->id,
                        'name' => $member->application->membershipPlan->name,
                        'slug' => $member->application->membershipPlan->slug,
                        'annual_fee' => $member->application->membershipPlan->annual_fee,
                        'badge' => $member->application->membershipPlan->badge,
                    ] : null,
                    'dpc' => $member->application->dpc ? [
                        'id' => $member->application->dpc->id,
                        'name' => $member->application->dpc->name,
                        'code' => $member->application->dpc->code,
                    ] : null,
                ] : null,
                'statement' => $statementData,
                'review_logs' => $member->reviewLogs->map(function ($log) {
                    return [
                        'id' => $log->id,
                        'action' => $log->action,
                        'note' => $log->note,
                        'admin_name' => $log->admin?->name ?? ('Tim Verifikasi '.Brand::shortName()),
                        'created_at' => $log->created_at?->format('d/m/Y H:i'),
                    ];
                }),
            ],
        ]);
    }

    /**
     * Loloskan verifikasi awal pendaftaran anggota dan terbitkan tagihan.
     */
    public function passInitialReview(User $member, Request $request, PassInitialVerification $action): RedirectResponse
    {
        Gate::authorize('verifyMember', User::class);

        $request->validate([
            'note' => ['nullable', 'string', 'max:500'],
        ]);

        $action->execute($member, $request->user(), $request->input('note'));

        return back()->with('success', "Verifikasi awal {$member->name} berhasil diloloskan. Tagihan pembayaran telah diterbitkan.");
    }

    /**
     * Setujui pendaftaran anggota (konfirmasi pembayaran + terbitkan nomor anggota).
     */
    public function approve(User $member, Request $request, ApproveMember $action): RedirectResponse
    {
        Gate::authorize('verifyMember', User::class);

        $request->validate([
            'note' => ['nullable', 'string', 'max:500'],
        ]);

        $action->execute($member, $request->user(), $request->input('note'));

        return back()->with('success', "Keanggotaan {$member->name} berhasil disetujui.");
    }

    /**
     * Tolak bukti pembayaran yang diunggah pengguna.
     */
    public function rejectPaymentProof(User $member, Request $request, RejectPaymentProof $action): RedirectResponse
    {
        Gate::authorize('verifyMember', User::class);

        $request->validate([
            'reason' => ['required', 'string', 'min:5', 'max:1000'],
        ], [
            'reason.required' => 'Alasan penolakan bukti pembayaran wajib diisi.',
            'reason.min' => 'Alasan penolakan minimal 5 karakter.',
        ]);

        $action->execute($member, $request->user(), $request->input('reason'));

        return back()->with('success', "Bukti transfer pembayaran {$member->name} telah ditolak. Pemohon diminta mengunggah ulang.");
    }

    /**
     * Minta revisi berkas pendaftaran dengan catatan spesifik.
     */
    public function requestRevision(User $member, Request $request, RequestMemberRevision $action): RedirectResponse
    {
        Gate::authorize('verifyMember', User::class);

        $request->validate([
            'note' => ['nullable', 'string', 'max:1000'],
            'sections' => ['nullable', 'array'],
            'notes' => ['nullable'],
        ]);

        $payload = $request->input('notes');
        if (! $payload) {
            $payload = [
                'sections' => $request->input('sections', []),
                'note' => $request->input('note', ''),
            ];
        }

        $action->execute($member, $request->user(), $payload);

        return back()->with('success', "Permintaan revisi berhasil dikirimkan ke {$member->name}.");
    }

    /**
     * Tolak pendaftaran anggota dengan alasan wajib.
     */
    public function reject(User $member, Request $request, RejectMember $action): RedirectResponse
    {
        Gate::authorize('verifyMember', User::class);

        $request->validate([
            'reason' => ['required', 'string', 'min:5', 'max:1000'],
        ], [
            'reason.required' => 'Alasan penolakan wajib diisi.',
            'reason.min' => 'Alasan penolakan minimal 5 karakter.',
        ]);

        $action->execute($member, $request->user(), $request->input('reason'));

        return back()->with('success', "Pendaftaran {$member->name} telah ditolak.");
    }

    /**
     * Tindakan massal persetujuan.
     */
    public function bulkAction(Request $request, ApproveMember $approveAction): RedirectResponse
    {
        Gate::authorize('verifyMember', User::class);

        $request->validate([
            'action' => ['required', 'in:approve'],
            'ids' => ['required', 'array'],
            'ids.*' => ['integer', 'exists:users,id'],
        ]);

        $users = User::whereIn('id', $request->input('ids'))->get();
        $count = 0;

        foreach ($users as $u) {
            if (in_array($u->membership_status, [MembershipStatus::PendingReview, MembershipStatus::PendingApproval], true)) {
                $approveAction->execute($u, $request->user(), 'Persetujuan massal oleh verifikator '.(config('brand.short_name') ?? 'NSA').'.');
                $count++;
            }
        }

        return back()->with('success', "{$count} anggota berhasil disetujui secara massal.");
    }

    /**
     * Ekspor data anggota (default disetujui/approved) ke berkas CSV dengan UTF-8 BOM.
     */
    public function exportCsv(Request $request): StreamedResponse
    {
        Gate::authorize('verifyMember', User::class);

        $shortCode = strtolower(config('brand.short_name') ?? 'nsa');
        $filename = "anggota-{$shortCode}-".now()->format('Y-m-d-His').'.csv';

        $query = User::query()
            ->where('role', Role::User)
            ->with([
                'profile',
                'business.province',
                'business.regency',
                'application.membershipPlan',
                'application.membershipType',
                'application.businesses',
                'application.locations.province',
                'application.locations.regency',
            ]);

        // Default ekspor hanya anggota disetujui (Approved) sesuai spesifikasi tugas
        $status = $request->input('status', MembershipStatus::Approved->value);
        if ($status !== 'all') {
            $query->where('membership_status', $status);
        }

        if ($provinceId = $request->input('province_id')) {
            $query->whereHas('business', fn ($bq) => $bq->where('province_id', $provinceId));
        }

        if ($regencyId = $request->input('regency_id')) {
            $query->whereHas('business', fn ($bq) => $bq->where('regency_id', $regencyId));
        }

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('member_number', 'like', "%{$search}%")
                    ->orWhereHas('business', function ($bq) use ($search) {
                        $bq->where('name', 'like', "%{$search}%")
                            ->orWhere('business_name', 'like', "%{$search}%")
                            ->orWhere('nib', 'like', "%{$search}%");
                    });
            });
        }

        return response()->streamDownload(function () use ($query) {
            $handle = fopen('php://output', 'w');
            // Menulis BOM UTF-8 agar Microsoft Excel mengenali format karakter Indonesia dengan sempurna
            fwrite($handle, "\xEF\xBB\xBF");

            fputcsv($handle, [
                'ID',
                'Nomor Anggota (NTA)',
                'Nama Lengkap',
                'Email',
                'No. Handphone / WhatsApp',
                'Status Keanggotaan',
                'Jenis Keanggotaan',
                'Nama Usaha / Perusahaan',
                'NIB (Nomor Induk Berusaha)',
                'Skala Usaha',
                'Provinsi Lokasi Usaha',
                'Kabupaten / Kota Lokasi Usaha',
                'Tanggal Pendaftaran',
                'Tanggal Disetujui',
            ]);

            $query->chunk(200, function ($members) use ($handle) {
                foreach ($members as $m) {
                    $statusVal = $m->membership_status instanceof MembershipStatus ? $m->membership_status->value : (string) $m->membership_status;
                    fputcsv($handle, [
                        $m->id,
                        $m->member_number ?? '-',
                        $m->name,
                        $m->email,
                        $m->phone ?? '-',
                        $statusVal,
                        $m->application?->membershipPlan?->name ?? 'Anggota Reguler',
                        $m->business?->name ?? $m->business?->business_name ?? '-',
                        $m->business?->nib ?? '-',
                        $m->business?->business_scale ?? '-',
                        $m->business?->province?->name ?? '-',
                        $m->business?->regency?->name ?? '-',
                        $m->created_at?->format('Y-m-d H:i:s'),
                        $m->application?->approved_at?->format('Y-m-d H:i:s') ?? '-',
                    ]);
                }
            });

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    /**
     * Hapus permanen data anggota (khusus Superadmin).
     */
    public function destroy(User $member, Request $request): RedirectResponse
    {
        Gate::authorize('delete', $member);

        ActivityLog::log(
            action: 'delete_member_permanent',
            subject: "Menghapus permanen data anggota #{$member->id} ({$member->name})",
            meta: ['name' => $member->name, 'email' => $member->email],
            userId: $request->user()->id,
        );

        $name = $member->name;
        $member->delete();

        return redirect()->route('admin.members.index')->with('success', "Akun {$name} berhasil dihapus permanen.");
    }
}
