<?php

namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use App\Support\Brand;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CardController extends Controller
{
    /**
     * Tampilkan Kartu Anggota Digital (KTA) NSA.
     */
    public function index(Request $request): Response
    {
        $user = $request->user()->load([
            'profile',
            'application.membershipPlan',
            'application.membershipType',
        ]);

        $token = $user->ensureVerificationToken();
        $approvedAt = $user->application?->approved_at ?? $user->updated_at ?? now();
        $validUntil = $approvedAt->copy()->addYear()->format('d F Y');

        $verificationUrl = url("/verifikasi/{$token}");

        return Inertia::render('Member/Card', [
            'cardData' => [
                'name' => $user->name,
                'member_number' => $user->member_number,
                'avatar' => $user->avatar,
                'membership_type' => $user->application?->membershipType?->name
                    ?? $user->application?->membershipPlan?->name
                    ?? 'Anggota Biasa NSA',
                'membership_category' => $user->application?->membership_category_custom
                    ?? $user->application?->membership_category
                    ?? 'Pembudidaya',
                'approved_at' => $approvedAt->format('d/m/Y'),
                'valid_until' => $validUntil,
                'verification_url' => $verificationUrl,
                'verification_token' => $token,
                'brand_name' => Brand::name(),
                'brand_short' => Brand::shortName(),
                'brand_tagline' => Brand::tagline(),
            ],
        ]);
    }
}
