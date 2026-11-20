<?php

namespace App\Http\Controllers\Account;

use App\Actions\Membership\SaveMembershipStep;
use App\Actions\Membership\SubmitMembershipApplication;
use App\Enums\MembershipStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Membership\SaveStepRequest;
use App\Http\Requests\Membership\UploadDocumentRequest;
use App\Models\ActivityLog;
use App\Models\MemberApplication;
use App\Models\MemberDocument;
use App\Models\MemberReviewLog;
use App\Models\Setting;
use App\Services\Contracts\PaymentServiceInterface;
use App\Support\Brand;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class MembershipRegistrationController extends Controller
{
    /**
     * Arahkan pendaftaran ke formulir wizard 9 langkah baru.
     */
    public function index(Request $request): RedirectResponse
    {
        return redirect()->route('account.membership.register');
    }

    /**
     * Simpan data draf per langkah (otomatis atau saat klik Selanjutnya).
     */
    public function saveStep(int $step, SaveStepRequest $request, SaveMembershipStep $saveMembershipStep): JsonResponse|RedirectResponse
    {
        $saveMembershipStep->execute($request->user(), $step, $request->validated());

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => "Langkah {$step} berhasil disimpan sebagai draf.",
            ]);
        }

        return back()->with('success', "Langkah {$step} berhasil disimpan.");
    }

    /**
     * Unggah berkas dokumen (disimpan di storage privat dengan nama teracak).
     */
    public function uploadDocument(UploadDocumentRequest $request): JsonResponse|RedirectResponse
    {
        $user = $request->user();
        $type = $request->validated('type');
        $file = $request->file('file');

        $ext = $file->getClientOriginalExtension() ?: 'bin';
        $randomName = Str::random(40).'.'.$ext;
        $path = "documents/{$user->id}/{$randomName}";

        Storage::disk('private')->putFileAs("documents/{$user->id}", $file, $randomName);

        $configs = config('member_documents', []);
        $isMultiple = ! empty($configs[$type]['multiple']);

        if ($isMultiple) {
            $doc = MemberDocument::create([
                'user_id' => $user->id,
                'type' => $type,
                'path' => $path,
                'original_name' => $file->getClientOriginalName(),
                'file_size' => $file->getSize(),
                'mime_type' => $file->getMimeType(),
                'status' => 'pending',
            ]);
        } else {
            // Jika dokumen tunggal (KTP, NIB, NPWP, Akta) dan sudah ada sebelumnya, hapus file lama
            $existing = MemberDocument::where('user_id', $user->id)->where('type', $type)->first();
            if ($existing && Storage::disk('private')->exists($existing->path)) {
                Storage::disk('private')->delete($existing->path);
            }

            $doc = MemberDocument::updateOrCreate(
                [
                    'user_id' => $user->id,
                    'type' => $type,
                ],
                [
                    'path' => $path,
                    'original_name' => $file->getClientOriginalName(),
                    'file_size' => $file->getSize(),
                    'mime_type' => $file->getMimeType(),
                    'status' => 'pending',
                ]
            );
        }

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'document' => [
                    'id' => $doc->id,
                    'type' => $doc->type,
                    'path' => $doc->path,
                    'original_name' => $doc->original_name,
                    'file_size' => $doc->file_size,
                    'formatted_size' => $doc->formatted_size,
                    'mime_type' => $doc->mime_type,
                    'status' => $doc->status,
                    'signed_url' => $doc->signed_url,
                ],
                'message' => 'Dokumen berhasil diunggah.',
            ]);
        }

        return back()->with('success', 'Dokumen berhasil diunggah.');
    }

    /**
     * Hapus berkas dokumen yang telah diunggah.
     */
    public function deleteDocument(MemberDocument $document, Request $request): JsonResponse|RedirectResponse
    {
        if ($document->user_id !== $request->user()->id) {
            abort(403, 'Anda tidak berhak menghapus dokumen ini.');
        }

        if (Storage::disk('private')->exists($document->path)) {
            Storage::disk('private')->delete($document->path);
        }

        $document->delete();

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Dokumen berhasil dihapus.',
            ]);
        }

        return back()->with('success', 'Dokumen berhasil dihapus.');
    }

    /**
     * Kirim pendaftaran final keanggotaan (validasi komprehensif seluruh data).
     */
    public function submit(Request $request, SubmitMembershipApplication $submitApplication): RedirectResponse
    {
        $submitApplication->execute($request->user());

        return redirect()->route('account.membership.status')
            ->with('success', 'Pendaftaran keanggotaan berhasil diajukan! Berkas Anda sedang dalam proses verifikasi pengurus '.Brand::shortName().'.');
    }

    /**
     * Halaman status keanggotaan (penjelasan alur verifikasi).
     */
    public function status(Request $request): Response|RedirectResponse
    {
        $user = $request->user();

        // 4. Saat approved: arahkan ke /anggota
        if ($user->membership_status === MembershipStatus::Approved) {
            return redirect()->route('member.index');
        }

        $user->load([
            'profile',
            'business.province',
            'business.regency',
            'reviewLogs.admin',
            'application.invoices.items',
            'application.invoices.payments',
            'application.identity',
        ]);

        $application = $user->application;
        $completedSteps = $application?->completed_steps ?? [];
        $totalSteps = count(MemberApplication::STEPS);
        $completedStepsCount = is_array($completedSteps) ? count($completedSteps) : 0;
        $isSubmitted = in_array($user->membership_status, [
            MembershipStatus::PendingReview,
            MembershipStatus::AwaitingPayment,
            MembershipStatus::PendingApproval,
            MembershipStatus::Approved,
            MembershipStatus::Revision,
            MembershipStatus::Rejected,
        ], true);

        // Ambil tagihan aktif jika ada
        $activeInvoice = $application?->invoices()->where('status', '!=', 'rejected')->latest()->first();
        $latestPayment = $activeInvoice?->payments()->latest()->first();

        $invoiceData = null;
        if ($activeInvoice) {
            $invoiceData = [
                'id' => $activeInvoice->id,
                'number' => $activeInvoice->number,
                'status' => $activeInvoice->status,
                'total' => (float) $activeInvoice->total,
                'due_at' => $activeInvoice->due_at?->translatedFormat('d F Y, H:i'),
                'items' => $activeInvoice->items->map(fn ($it) => [
                    'id' => $it->id,
                    'name' => $it->name_snapshot,
                    'amount' => (float) $it->amount_snapshot,
                    'qty' => $it->qty,
                    'size' => $it->size,
                    'subtotal' => (float) $it->subtotal,
                ])->values()->all(),
            ];
        }

        $paymentData = null;
        if ($latestPayment) {
            $paymentData = [
                'id' => $latestPayment->id,
                'amount' => (float) $latestPayment->amount,
                'status' => $latestPayment->status,
                'proof_url' => $latestPayment->proof_url,
                'sender_name' => $latestPayment->sender_name,
                'sender_bank' => $latestPayment->sender_bank,
                'paid_at' => $latestPayment->paid_at?->format('Y-m-d'),
                'notes' => $latestPayment->notes,
            ];
        }

        $bankInfo = [
            'bank_name' => Setting::get('bank_name', 'Bank Mandiri'),
            'bank_account_number' => Setting::get('bank_account_number', '123-00-9876543-2'),
            'bank_account_holder' => Setting::get('bank_account_holder', 'Perkumpulan '.Brand::shortName().' Indonesia'),
        ];

        // Kumpulkan catatan revisi terbaru
        $latestRevisionNote = null;
        if ($user->membership_status === MembershipStatus::Revision) {
            $latestRevisionNote = $application?->review_note
                ?? $user->reviewLogs->where('action', 'revision')->first()?->note
                ?? 'Silakan periksa dan perbaiki data formulir pendaftaran Anda.';
        } elseif ($user->membership_status === MembershipStatus::Rejected) {
            $latestRevisionNote = $application?->review_note
                ?? $user->reviewLogs->where('action', 'rejected')->first()?->note
                ?? 'Pengajuan pendaftaran belum dapat diterima.';
        }

        $statusData = [
            'status' => $user->membership_status->value,
            'status_label' => $user->membership_status->label(),
            'member_number' => $user->member_number,
            'is_submitted' => $isSubmitted,
            'completed_steps_count' => $completedStepsCount,
            'total_steps' => $totalSteps,
            'review_note' => $latestRevisionNote,
            'invoice' => $invoiceData,
            'payment' => $paymentData,
            'bank_info' => $bankInfo,
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
            ],
            'business_name' => $user->business?->name,
            'regency_name' => $user->business?->regency?->name,
            'province_name' => $user->business?->province?->name,
            'review_logs' => $user->reviewLogs->map(fn ($log) => [
                'id' => $log->id,
                'action' => $log->action,
                'note' => $log->note,
                'admin_name' => $log->admin?->name ?? ('Tim Verifikasi '.Brand::shortName()),
                'created_at' => $log->created_at->translatedFormat('d F Y, H:i'),
            ]),
        ];

        return Inertia::render('Member/Status', [
            'statusData' => $statusData,
        ]);
    }

    /**
     * POST /akun/keanggotaan/bukti-bayar -> unggah bukti bayar transfer manual.
     */
    public function uploadProof(Request $request, PaymentServiceInterface $paymentService): RedirectResponse|JsonResponse
    {
        $request->validate([
            'proof' => ['required_without:proof_file', 'nullable', 'file', 'mimes:jpg,jpeg,png,pdf,webp', 'max:3072'],
            'proof_file' => ['required_without:proof', 'nullable', 'file', 'mimes:jpg,jpeg,png,pdf,webp', 'max:3072'],
            'sender_name' => ['required', 'string', 'max:100'],
            'payment_date' => ['required_without:paid_at', 'nullable', 'date'],
            'paid_at' => ['required_without:payment_date', 'nullable', 'date'],
            'sender_bank' => ['nullable', 'string', 'max:50'],
            'notes' => ['nullable', 'string', 'max:250'],
        ], [
            'proof.required_without' => 'Berkas bukti pembayaran wajib diunggah.',
            'proof_file.required_without' => 'Berkas bukti pembayaran wajib diunggah.',
            'proof.mimes' => 'Format berkas bukti transfer harus berupa JPG, PNG, WEBP, atau PDF.',
            'proof_file.mimes' => 'Format berkas bukti transfer harus berupa JPG, PNG, WEBP, atau PDF.',
            'proof.max' => 'Ukuran berkas bukti transfer maksimal 3 MB.',
            'proof_file.max' => 'Ukuran berkas bukti transfer maksimal 3 MB.',
            'sender_name.required' => 'Nama pemilik rekening / pengirim wajib diisi.',
            'payment_date.required_without' => 'Tanggal transfer pembayaran wajib diisi.',
            'paid_at.required_without' => 'Tanggal transfer pembayaran wajib diisi.',
        ]);

        $user = $request->user();
        $application = $user->application;
        if (! $application) {
            abort(404, 'Aplikasi pendaftaran belum ditemukan.');
        }

        $invoice = $application->invoices()->where('status', '!=', 'paid')->latest()->first();
        if (! $invoice) {
            abort(404, 'Tagihan keanggotaan belum diterbitkan.');
        }

        $file = $request->file('proof') ?? $request->file('proof_file');
        $payment = $paymentService->uploadProof($invoice, $file, [
            'sender_name' => $request->input('sender_name'),
            'sender_bank' => $request->input('sender_bank'),
            'paid_at' => $request->input('payment_date') ?? $request->input('paid_at'),
            'notes' => $request->input('notes'),
        ]);

        // Update status user & application ke pending_approval
        $user->update(['membership_status' => MembershipStatus::PendingApproval]);
        $application->update(['status' => MembershipStatus::PendingApproval]);

        // Catat review log
        MemberReviewLog::create([
            'user_id' => $user->id,
            'action' => 'payment_submitted',
            'note' => "Bukti transfer telah diunggah oleh {$request->input('sender_name')}. Menunggu konfirmasi pembayaran oleh Pengurus ".Brand::shortName().'.',
        ]);

        // Catat activity log
        ActivityLog::log(
            action: 'upload_payment_proof',
            subject: "Bukti transfer tagihan #{$invoice->number} diunggah oleh {$user->name}",
            meta: [
                'user_id' => $user->id,
                'invoice_id' => $invoice->id,
                'amount' => $invoice->total,
                'sender_name' => $request->input('sender_name'),
            ],
            userId: $user->id,
        );

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Bukti pembayaran berhasil diunggah. Menunggu konfirmasi pengurus.',
                'invoice_status' => $invoice->fresh()->status,
                'user_status' => $user->fresh()->membership_status->value,
            ]);
        }

        return redirect()->route('account.membership.status')
            ->with('success', 'Bukti pembayaran berhasil diunggah! Pengurus '.Brand::shortName().' akan segera mengonfirmasi pembayaran Anda.');
    }

    /**
     * Tampilkan salinan formulir pendaftaran anggota terverifikasi (read-only) atau arahkan ke formulir edit.
     */
    public function form(Request $request): Response|RedirectResponse
    {
        $user = $request->user();

        // Anggota terverifikasi maupun non-member diarahkan ke formulir pendaftaran 9 langkah yang dapat diedit
        if ($user->membership_status === MembershipStatus::Approved || $user->membership_status === MembershipStatus::NonMember) {
            return redirect()->route('account.membership.register');
        }

        $user->load([
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
            'application.membershipPlan',
            'application.dpc.province',
            'application.dpc.regency',
            'statement',
        ]);

        $documentsWithUrls = $user->documents->map(function ($doc) {
            return [
                'id' => $doc->id,
                'type' => $doc->type,
                'original_name' => $doc->original_name,
                'file_size' => $doc->file_size,
                'file_size_formatted' => $doc->file_size ? number_format($doc->file_size / 1024, 1).' KB' : '-',
                'preview_url' => $doc->signed_url,
            ];
        });

        $formData = [
            'status' => $user->membership_status->value,
            'status_label' => $user->membership_status->label(),
            'member_number' => $user->member_number,
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
            ],
            'profile' => $user->profile ? [
                'nik' => $user->profile->nik,
                'name_ktp' => $user->profile->name_ktp ?? $user->name,
                'birth_place' => $user->profile->birth_place,
                'birth_date' => $user->profile->birth_date?->format('d/m/Y'),
                'gender' => $user->profile->gender === 'male' ? 'Laki-laki' : 'Perempuan',
                'occupation' => $user->profile->occupation,
                'province_name' => $user->profile->province?->name,
                'regency_name' => $user->profile->regency?->name,
                'district_name' => $user->profile->district?->name,
                'village_name' => $user->profile->village?->name,
                'postal_code' => $user->profile->postal_code,
                'address' => $user->profile->address,
                'is_domicile_same' => (bool) $user->profile->is_domicile_same,
                'domicile_address' => $user->profile->domicile_address,
                'photo_url' => $user->profile->photo ? (str_starts_with($user->profile->photo, 'http') ? $user->profile->photo : Storage::url($user->profile->photo)) : null,
            ] : null,
            'business' => $user->business ? [
                'name' => $user->business->name,
                'owner_name' => $user->business->owner_name,
                'nib' => $user->business->nib,
                'npwp' => $user->business->npwp,
                'founded_at' => $user->business->founded_at?->format('d/m/Y'),
                'employee_count' => $user->business->employee_count,
                'annual_revenue' => $user->business->annual_revenue ? number_format($user->business->annual_revenue, 0, ',', '.') : null,
                'business_status' => $user->business->business_status,
                'business_scale' => $user->business->business_scale,
                'membership_type' => $user->business->membership_type,
                'membership_type_other' => $user->business->membership_type_other,
                'province_name' => $user->business->province?->name,
                'regency_name' => $user->business->regency?->name,
                'district_name' => $user->business->district?->name,
                'village_name' => $user->business->village?->name,
                'postal_code' => $user->business->postal_code,
                'address' => $user->business->address,
                'business_fields' => $user->businessFields->pluck('name')->toArray(),
            ] : null,
            'documents' => $documentsWithUrls,
            'social_links' => $user->socialLinks->map(fn ($link) => [
                'platform' => $link->platform,
                'url' => $link->url,
            ]),
            'commodities' => $user->commodities->map(fn ($c) => [
                'category_name' => $c->fishCategory?->name ?? 'Komoditas',
                'cultivation_type' => $c->cultivation_type,
                'capacity' => $c->capacity,
                'unit' => $c->unit,
                'land_area' => $c->land_area,
                'land_area_unit' => $c->land_area_unit ?? 'm2',
                'pond_count' => $c->pond_count,
            ]),
            'membership_plan' => $user->application?->membershipPlan ? [
                'name' => $user->application->membershipPlan->name,
                'fee' => $user->application->membershipPlan->formatted_fee,
            ] : null,
            'dpc' => $user->application?->dpc ? [
                'name' => $user->application->dpc->name,
                'regency_name' => $user->application->dpc->regency?->name,
                'province_name' => $user->application->dpc->province?->name,
            ] : null,
            'join_reason' => $user->application?->join_reason,
            'statement' => $user->statement ? [
                'city' => $user->statement->city,
                'signed_at' => $user->statement->signed_at?->translatedFormat('d F Y'),
                'signature_url' => $user->statement->signed_url,
            ] : null,
        ];

        return Inertia::render('Member/Form', [
            'formData' => $formData,
        ]);
    }
}
