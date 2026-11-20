<?php

namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use App\Models\MemberBusiness;
use App\Models\MemberLegalDocument;
use App\Models\MentorshipRequest;
use App\Models\Province;
use App\Support\Brand;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class BusinessLegalController extends Controller
{
    /**
     * Tampilkan daftar unit usaha, izin legalitas, dan form pendampingan.
     */
    public function index(Request $request): Response
    {
        $user = $request->user()->load([
            'businesses.legalDocuments',
            'businesses.province',
            'businesses.regency',
            'application.fishActivities',
            'application.networkProfile',
            'mentorshipRequests.business',
        ]);

        $now = now();
        $sixtyDaysFromNow = $now->copy()->addDays(60);

        $businesses = $user->businesses->map(function ($b) use ($sixtyDaysFromNow) {
            return [
                'id' => $b->id,
                'name' => $b->name,
                'institution_name' => $b->institution_name,
                'activity_field' => $b->activity_field ?? $b->membership_type,
                'scale' => $b->scale ?? $b->business_scale ?? 'Kecil',
                'years_operating' => $b->years_operating,
                'province_name' => $b->province?->name ?? '-',
                'regency_name' => $b->regency?->name ?? '-',
                'address' => $b->address ?? '-',
                'is_primary' => (bool) $b->is_primary,
                'legal_documents' => $b->legalDocuments->map(function ($doc) use ($sixtyDaysFromNow) {
                    $expiresAt = $doc->expires_at ? Carbon::parse($doc->expires_at) : null;
                    $isExpiringSoon = $expiresAt && $expiresAt->isFuture() && $expiresAt->lte($sixtyDaysFromNow);
                    $isExpired = $expiresAt && $expiresAt->isPast();

                    return [
                        'id' => $doc->id,
                        'type' => $doc->type,
                        'number' => $doc->number,
                        'label' => $doc->label ?: strtoupper($doc->type),
                        'issued_at' => $doc->issued_at?->format('d/m/Y'),
                        'expires_at' => $doc->expires_at?->format('d/m/Y'),
                        'raw_expires_at' => $doc->expires_at?->format('Y-m-d'),
                        'is_expiring_soon' => $isExpiringSoon,
                        'is_expired' => $isExpired,
                        'file_url' => $doc->file_url,
                    ];
                }),
            ];
        });

        // Ringkasan perizinan umum
        $allLegalDocs = $user->businesses->flatMap->legalDocuments;
        $hasNib = $allLegalDocs->contains(fn ($d) => strtolower($d->type) === 'nib' && ! empty($d->number));
        $hasNpwp = $allLegalDocs->contains(fn ($d) => strtolower($d->type) === 'npwp' && ! empty($d->number));
        $hasCbib = $allLegalDocs->contains(fn ($d) => strtolower($d->type) === 'cbib' && ! empty($d->number));

        // Data operasional & pemasaran (Langkah 4-5)
        $fishActivities = $user->application?->fishActivities ?? collect();
        $networkProfile = $user->application?->networkProfile;

        // Riwayat permintaan pendampingan
        $mentorshipRequests = $user->mentorshipRequests->map(fn ($mr) => [
            'id' => $mr->id,
            'topic' => $mr->topic,
            'description' => $mr->description,
            'status' => $mr->status,
            'status_label' => $mr->statusLabel(),
            'business_name' => $mr->business?->name ?? 'Semua Unit Usaha',
            'admin_note' => $mr->admin_note,
            'created_at' => $mr->created_at->format('d/m/Y H:i'),
        ]);

        $provinces = Province::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Member/BusinessLegal', [
            'businesses' => $businesses,
            'legalSummary' => [
                'has_nib' => $hasNib,
                'has_npwp' => $hasNpwp,
                'has_cbib' => $hasCbib,
                'total_units' => $businesses->count(),
            ],
            'operationalSummary' => [
                'activities_count' => $fishActivities->count(),
                'primary_system' => $fishActivities->first()?->farming_system ?? '-',
                'market_reach' => $networkProfile?->market_reach ?? 'Lokal / Regional',
                'partnership_needs' => $networkProfile?->partnership_needs ?? '-',
            ],
            'mentorshipRequests' => $mentorshipRequests,
            'provinces' => $provinces,
        ]);
    }

    /**
     * Tambah unit usaha baru.
     */
    public function storeUnit(Request $request): RedirectResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'activity_field' => ['required', 'string', 'max:100'],
            'scale' => ['required', 'string', 'in:Mikro,Kecil,Menengah,Besar'],
            'years_operating' => ['nullable', 'integer', 'min:0', 'max:100'],
            'province_id' => ['nullable', 'exists:provinces,id'],
            'regency_id' => ['nullable', 'exists:regencies,id'],
            'address' => ['nullable', 'string', 'max:500'],
        ]);

        $isFirst = $user->businesses()->count() === 0;

        $user->businesses()->create([
            'application_id' => $user->application?->id,
            'name' => $validated['name'],
            'activity_field' => $validated['activity_field'],
            'scale' => $validated['scale'],
            'years_operating' => $validated['years_operating'] ?? 0,
            'province_id' => $validated['province_id'] ?? null,
            'regency_id' => $validated['regency_id'] ?? null,
            'address' => $validated['address'] ?? null,
            'is_primary' => $isFirst,
        ]);

        return back()->with('success', 'Unit usaha baru berhasil ditambahkan.');
    }

    /**
     * Perbarui data unit usaha.
     */
    public function updateUnit(MemberBusiness $business, Request $request): RedirectResponse
    {
        $user = $request->user();
        if ($business->user_id !== $user->id) {
            abort(403, 'Akses ditolak.');
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'activity_field' => ['required', 'string', 'max:100'],
            'scale' => ['required', 'string', 'in:Mikro,Kecil,Menengah,Besar'],
            'years_operating' => ['nullable', 'integer', 'min:0', 'max:100'],
            'address' => ['nullable', 'string', 'max:500'],
        ]);

        $business->update($validated);

        return back()->with('success', 'Data unit usaha berhasil diperbarui.');
    }

    /**
     * Hapus unit usaha (hanya jika ada lebih dari 1).
     */
    public function deleteUnit(MemberBusiness $business, Request $request): RedirectResponse
    {
        $user = $request->user();
        if ($business->user_id !== $user->id) {
            abort(403, 'Akses ditolak.');
        }

        if ($user->businesses()->count() <= 1) {
            return back()->with('error', 'Anda harus memiliki setidaknya satu unit usaha terdaftar.');
        }

        $business->delete();

        return back()->with('success', 'Unit usaha berhasil dihapus.');
    }

    /**
     * Tambah dokumen legalitas / izin per unit usaha.
     */
    public function storeDocument(Request $request): RedirectResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'business_id' => ['required', 'exists:member_businesses,id'],
            'type' => ['required', 'string', 'max:50'],
            'number' => ['required', 'string', 'max:100'],
            'label' => ['nullable', 'string', 'max:100'],
            'issued_at' => ['nullable', 'date'],
            'expires_at' => ['nullable', 'date'],
            'file' => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:3072'],
        ]);

        $business = MemberBusiness::where('id', $validated['business_id'])
            ->where('user_id', $user->id)
            ->firstOrFail();

        $filePath = null;
        if ($request->hasFile('file')) {
            $filePath = $request->file('file')->store("legal-docs/{$business->id}", 'private');
        }

        $business->legalDocuments()->create([
            'type' => $validated['type'],
            'number' => $validated['number'],
            'label' => $validated['label'] ?? strtoupper($validated['type']),
            'issued_at' => $validated['issued_at'] ?? null,
            'expires_at' => $validated['expires_at'] ?? null,
            'file_path' => $filePath,
        ]);

        return back()->with('success', 'Dokumen perizinan berhasil ditambahkan.');
    }

    /**
     * Hapus dokumen legalitas / izin.
     */
    public function deleteDocument(MemberLegalDocument $document, Request $request): RedirectResponse
    {
        $user = $request->user();
        if ($document->business?->user_id !== $user->id) {
            abort(403, 'Akses ditolak.');
        }

        if ($document->file_path && Storage::disk('private')->exists($document->file_path)) {
            Storage::disk('private')->delete($document->file_path);
        }

        $document->delete();

        return back()->with('success', 'Dokumen perizinan berhasil dihapus.');
    }

    /**
     * Kirim permohonan pendampingan usaha/perizinan ke CMS.
     */
    public function requestMentorship(Request $request): RedirectResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'business_id' => ['nullable', 'exists:member_businesses,id'],
            'topic' => ['required', 'string', 'max:150'],
            'description' => ['required', 'string', 'min:10', 'max:1000'],
        ], [
            'topic.required' => 'Topik pendampingan wajib diisi.',
            'description.required' => 'Uraian kebutuhan pendampingan wajib diisi.',
            'description.min' => 'Uraian kebutuhan pendampingan minimal 10 karakter.',
        ]);

        MentorshipRequest::create([
            'user_id' => $user->id,
            'business_id' => $validated['business_id'] ?? $user->business?->id,
            'topic' => $validated['topic'],
            'description' => $validated['description'],
            'status' => 'submitted',
        ]);

        return back()->with('success', 'Permintaan pendampingan berhasil diajukan. Tim pengurus '.Brand::shortName().' akan segera menindaklanjuti.');
    }
}
