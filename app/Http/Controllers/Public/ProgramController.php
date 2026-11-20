<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Program;
use App\Models\ProgramRegistration;
use App\Support\Brand;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProgramController extends Controller
{
    /**
     * Tampilkan halaman rincian program kerja.
     */
    public function show(string $slug, Request $request): Response|RedirectResponse
    {
        $locale = app()->getLocale();
        $program = Program::where('slug', $slug)->withLocale($locale)->firstOrFail();
        $user = $request->user();

        // 1. Program draf hanya boleh dilihat oleh admin/superadmin
        if ($program->status !== 'published') {
            if (! $user || ! $user->isStaff()) {
                abort(404);
            }
        }

        // 2. Program khusus anggota (is_public = false) hanya untuk anggota terverifikasi
        if (! $program->is_public) {
            if (! $user) {
                return redirect()->route('login')
                    ->with('info', 'Silakan masuk dengan akun anggota NSA Anda untuk mengakses program ini.');
            }

            if (! $user->isApprovedMember() && ! $user->isStaff()) {
                return redirect()->route('account.index')
                    ->with('error', 'Program ini khusus untuk anggota resmi NSA.');
            }
        }

        $schedule = null;
        if ($program->starts_at && $program->ends_at) {
            $schedule = $program->starts_at->translatedFormat('d F Y').' — '.$program->ends_at->translatedFormat('d F Y');
        } elseif ($program->starts_at) {
            $schedule = 'Mulai '.$program->starts_at->translatedFormat('d F Y');
        }

        $isRegistered = false;
        if ($user) {
            $isRegistered = $program->registrations()
                ->where('user_id', $user->id)
                ->exists();
        }

        return Inertia::render('Public/Program/Show', [
            'program' => [
                'id' => $program->id,
                'title' => $program->tr('title', $locale),
                'slug' => $program->slug,
                'category' => $program->category->value,
                'category_label' => $program->category->label(),
                'summary' => $program->tr('summary', $locale),
                'body' => $program->tr('body', $locale),
                'cover_url' => $program->cover_url,
                'is_public' => $program->is_public,
                'status' => $program->status,
                'schedule' => $schedule,
                'starts_at' => $program->starts_at?->translatedFormat('d M Y, H:i'),
                'ends_at' => $program->ends_at?->translatedFormat('d M Y, H:i'),
            ],
            'isRegistered' => $isRegistered,
            'canRegister' => (bool) ($user && $user->isApprovedMember()),
        ]);
    }

    /**
     * Daftarkan anggota resmi ke program kerja.
     */
    public function register(string $slug, Request $request): RedirectResponse
    {
        $user = $request->user();

        if (! $user) {
            return redirect()->route('login');
        }

        if (! $user->isApprovedMember()) {
            return redirect()->route('account.index')
                ->with('error', 'Hanya anggota terverifikasi yang dapat mendaftar program kerja ini.');
        }

        $program = Program::where('slug', $slug)->firstOrFail();

        ProgramRegistration::firstOrCreate(
            [
                'program_id' => $program->id,
                'user_id' => $user->id,
            ],
            [
                'status' => 'registered',
                'note' => $request->input('note'),
            ]
        );

        return back()->with('success', 'Pendaftaran program "'.$program->title.'" berhasil tercatat. Tim '.Brand::shortName().' akan segera menghubungi Anda.');
    }
}
