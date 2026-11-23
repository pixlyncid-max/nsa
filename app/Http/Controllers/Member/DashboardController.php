<?php

namespace App\Http\Controllers\Member;

use App\Enums\ProgramCategory;
use App\Http\Controllers\Controller;
use App\Models\MemberInvoice;
use App\Models\Post;
use App\Models\ProgramRegistration;
use App\Support\Brand;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Tampilkan Dashboard Membership khusus anggota terverifikasi (approved).
     */
    public function index(Request $request): Response
    {
        $user = $request->user()->load([
            'profile',
            'business.province',
            'business.regency',
            'application.membershipPlan',
            'application.membershipType',
        ]);

        $approvedAt = $user->application?->approved_at ?? $user->updated_at ?? now();
        $validUntil = $approvedAt->copy()->addYear()->format('d F Y');

        // Program yang diikuti
        $enrolledPrograms = ProgramRegistration::with('program')
            ->where('user_id', $user->id)
            ->latest()
            ->take(3)
            ->get()
            ->map(fn ($reg) => [
                'id' => $reg->id,
                'program_id' => $reg->program_id,
                'title' => $reg->program->title,
                'slug' => $reg->program->slug,
                'category' => $reg->program->category instanceof ProgramCategory
                    ? $reg->program->category->label()
                    : (string) $reg->program->category,
                'status' => $reg->status,
                'registered_at' => $reg->created_at->format('d/m/Y'),
            ]);

        $enrolledCount = ProgramRegistration::where('user_id', $user->id)->count();

        // Tagihan belum dibayar
        $applicationId = $user->application?->id;
        $unpaidInvoices = $applicationId ? MemberInvoice::where('application_id', $applicationId)
            ->whereIn('status', ['unpaid', 'draft', 'waiting_confirmation'])
            ->get() : collect();

        $unpaidTotal = $unpaidInvoices->sum('total');
        $unpaidCount = $unpaidInvoices->count();

        // Pengumuman / Berita terbaru anggota
        $announcements = Post::where('status', 'published')
            ->latest('published_at')
            ->take(3)
            ->get(['id', 'title', 'slug', 'excerpt', 'cover', 'published_at'])
            ->map(fn ($p) => [
                'id' => $p->id,
                'title' => $p->title,
                'slug' => $p->slug,
                'excerpt' => $p->excerpt,
                'cover_image' => $p->coverUrl(),
                'date' => $p->published_at?->format('d M Y') ?? '-',
            ]);

        $summaryData = [
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'member_number' => $user->member_number,
            'membership_status' => $user->membership_status->value,
            'status_label' => $user->membership_status->label(),
            'membership_type' => $user->application?->membershipType?->name
                ?? $user->application?->membershipPlan?->name
                ?? 'Anggota Biasa NSA',
            'plan_name' => $user->application?->membershipType?->name
                ?? $user->application?->membershipPlan?->name
                ?? 'Anggota Biasa NSA',
            'approved_at' => $approvedAt->format('d F Y'),
            'valid_until' => $validUntil,
            'enrolled_programs_count' => $enrolledCount,
            'enrolled_programs' => $enrolledPrograms,
            'unpaid_invoices_count' => $unpaidCount,
            'unpaid_invoices_total' => (float) $unpaidTotal,
            'business_name' => $user->business?->name,
            'province_name' => $user->business?->province?->name,
            'announcements' => $announcements,
        ];

        return Inertia::render('Member/Dashboard', [
            'summary' => $summaryData,
            'user' => $summaryData,
            'announcements' => $announcements,
            'brand' => [
                'short_name' => Brand::shortName(),
                'name' => Brand::name(),
            ],
        ]);
    }
}
