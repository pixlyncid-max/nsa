<?php

namespace App\Http\Controllers\Public;

use App\Enums\MembershipStatus;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\Brand;
use Inertia\Inertia;
use Inertia\Response;

class VerificationController extends Controller
{
    /**
     * Halaman verifikasi publik KTA resmi NSA.
     * HANYA menampilkan nama, nomor anggota, jenis keanggotaan, dan status aktif.
     * Dilarang membocorkan data pribadi (tanpa NIK, email, no HP, alamat, dll.).
     */
    public function verify(string $token): Response
    {
        $member = User::query()
            ->where(function ($q) use ($token) {
                $q->where('verification_token', $token)
                    ->orWhere('member_number', $token);
            })
            ->where('membership_status', MembershipStatus::Approved)
            ->with(['application.membershipType', 'application.membershipPlan'])
            ->first();

        if (! $member) {
            return Inertia::render('Public/MemberVerification', [
                'isValid' => false,
                'token' => $token,
                'member' => null,
                'brand' => [
                    'name' => Brand::name(),
                    'short_name' => Brand::shortName(),
                ],
            ]);
        }

        $approvedAt = $member->application?->approved_at ?? $member->updated_at ?? now();
        $validUntil = $approvedAt->copy()->addYear()->format('d F Y');

        return Inertia::render('Public/MemberVerification', [
            'isValid' => true,
            'token' => $token,
            'member' => [
                'name' => $member->name,
                'member_number' => $member->member_number,
                'membership_type' => $member->application?->membershipType?->name
                    ?? $member->application?->membershipPlan?->name
                    ?? 'Anggota Biasa NSA',
                'status' => 'Aktif',
                'status_label' => 'Anggota Resmi Terverifikasi',
                'valid_until' => $validUntil,
            ],
            'brand' => [
                'name' => Brand::name(),
                'short_name' => Brand::shortName(),
                'tagline' => Brand::tagline(),
            ],
        ]);
    }
}
