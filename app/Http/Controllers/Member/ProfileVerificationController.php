<?php

namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use App\Models\MemberChangeRequest;
use App\Models\MemberDocument;
use App\Support\Brand;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProfileVerificationController extends Controller
{
    /**
     * Tampilkan data profil anggota, dokumen, dan riwayat verifikasi.
     */
    public function index(Request $request): Response
    {
        $user = $request->user()->load([
            'profile.province',
            'profile.regency',
            'application.identity',
            'application.membershipType.category',
            'reviewLogs.admin',
            'changeRequests.admin',
        ]);

        $identity = $user->application?->identity;

        // Masking NIK dan Paspor
        $rawNik = $identity?->nik ?? $user->profile?->nik;
        $maskedNik = $rawNik && strlen($rawNik) >= 8
            ? substr($rawNik, 0, 4).'********'.substr($rawNik, -4)
            : ($rawNik ? '********' : '-');

        $rawPassport = $identity?->passport_number;
        $maskedPassport = $rawPassport && strlen($rawPassport) >= 4
            ? substr($rawPassport, 0, 2).'****'.substr($rawPassport, -2)
            : ($rawPassport ? '****' : '-');

        // Status dokumen
        $documents = MemberDocument::where('user_id', $user->id)->get()->map(fn ($doc) => [
            'id' => $doc->id,
            'type' => $doc->type,
            'original_name' => $doc->original_name,
            'status' => $doc->status,
            'signed_url' => $doc->signed_url,
            'formatted_size' => $doc->formatted_size,
            'uploaded_at' => $doc->created_at->format('d/m/Y'),
        ]);

        // Riwayat keputusan
        $reviewLogs = $user->reviewLogs->map(fn ($log) => [
            'id' => $log->id,
            'action' => $log->action,
            'note' => $log->note,
            'admin_name' => $log->admin?->name ?? 'Verifikator '.Brand::shortName(),
            'created_at' => $log->created_at->format('d F Y, H:i'),
        ]);

        // Riwayat permintaan perubahan data
        $changeRequests = $user->changeRequests->map(fn ($cr) => [
            'id' => $cr->id,
            'field' => $cr->field,
            'field_label' => match ($cr->field) {
                'name' => 'Nama Lengkap',
                'nationality' => 'Kewarganegaraan',
                'membership_category' => 'Kategori Keanggotaan',
                'nik' => 'Nomor Induk Kependudukan (NIK)',
                'passport_number' => 'Nomor Paspor',
                default => ucfirst($cr->field),
            },
            'old_value' => $cr->old_value,
            'new_value' => $cr->new_value,
            'reason' => $cr->reason,
            'status' => $cr->status,
            'admin_note' => $cr->admin_note,
            'created_at' => $cr->created_at->format('d/m/Y H:i'),
        ]);

        return Inertia::render('Member/ProfileVerification', [
            'memberData' => [
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'member_number' => $user->member_number,
                'nationality' => $identity?->nationality ?? 'wni',
                'masked_nik' => $maskedNik,
                'masked_passport' => $maskedPassport,
                'gender' => $identity?->gender ?? $user->profile?->gender ?? 'male',
                'birth_place' => $identity?->birth_place ?? $user->profile?->birth_place ?? '-',
                'birth_date' => $identity?->birth_date?->format('d/m/Y') ?? $user->profile?->birth_date?->format('d/m/Y') ?? '-',
                'address' => typeofAddress($identity?->ktp_address) ?? $user->profile?->address ?? '-',
                'category_name' => $user->application?->membership_category_custom
                    ?? $user->application?->membership_category
                    ?? $user->application?->membershipType?->name
                    ?? 'Pembudidaya',
                'membership_type' => $user->application?->membershipType?->name ?? 'Anggota Biasa',
                'documents' => $documents,
                'review_logs' => $reviewLogs,
                'change_requests' => $changeRequests,
            ],
        ]);
    }

    /**
     * Ubah data dasar anggota (kontak, tempat tanggal lahir, alamat).
     */
    public function updateBasic(Request $request): RedirectResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'phone' => ['required', 'string', 'max:20'],
            'birth_place' => ['nullable', 'string', 'max:100'],
            'birth_date' => ['nullable', 'date'],
            'gender' => ['nullable', 'in:male,female'],
            'address' => ['nullable', 'string', 'max:500'],
        ]);

        $user->update(['phone' => $validated['phone']]);

        if ($user->profile) {
            $user->profile->update([
                'birth_place' => $validated['birth_place'] ?? $user->profile->birth_place,
                'birth_date' => $validated['birth_date'] ?? $user->profile->birth_date,
                'gender' => $validated['gender'] ?? $user->profile->gender,
                'address' => $validated['address'] ?? $user->profile->address,
            ]);
        }

        if ($user->application?->identity) {
            $user->application->identity->update([
                'phone' => $validated['phone'],
                'birth_place' => $validated['birth_place'] ?? $user->application->identity->birth_place,
                'birth_date' => $validated['birth_date'] ?? $user->application->identity->birth_date,
                'gender' => $validated['gender'] ?? $user->application->identity->gender,
            ]);
        }

        return back()->with('success', 'Data dasar profil berhasil diperbarui.');
    }

    /**
     * Buat permohonan perubahan data penting (nama, kewarganegaraan, kategori).
     */
    public function requestChange(Request $request): RedirectResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'field' => ['required', 'in:name,nationality,membership_category,nik,passport_number'],
            'new_value' => ['required', 'string', 'max:255'],
            'reason' => ['required', 'string', 'min:5', 'max:500'],
        ], [
            'field.required' => 'Bidang yang ingin diubah wajib dipilih.',
            'new_value.required' => 'Nilai data baru wajib diisi.',
            'reason.required' => 'Alasan permohonan perubahan data wajib dicantumkan.',
            'reason.min' => 'Alasan permohonan perubahan minimal 5 karakter.',
        ]);

        $oldValue = match ($validated['field']) {
            'name' => $user->name,
            'nationality' => $user->application?->identity?->nationality ?? 'wni',
            'membership_category' => $user->application?->membership_category ?? 'pembudidaya',
            'nik' => $user->application?->identity?->nik ?? $user->profile?->nik ?? '-',
            'passport_number' => $user->application?->identity?->passport_number ?? '-',
            default => '-',
        };

        MemberChangeRequest::create([
            'user_id' => $user->id,
            'field' => $validated['field'],
            'old_value' => (string) $oldValue,
            'new_value' => $validated['new_value'],
            'reason' => $validated['reason'],
            'status' => 'pending',
        ]);

        return back()->with('success', 'Permohonan perubahan data penting berhasil diajukan. Menunggu peninjauan pengurus '.Brand::shortName().'.');
    }
}

function typeofAddress($addr): ?string
{
    if (is_string($addr)) {
        return $addr;
    }
    if (is_array($addr) && isset($addr['address'])) {
        return $addr['address'];
    }

    return null;
}
