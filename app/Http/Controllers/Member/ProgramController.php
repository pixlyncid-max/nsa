<?php

namespace App\Http\Controllers\Member;

use App\Enums\ProgramCategory;
use App\Http\Controllers\Controller;
use App\Models\Program;
use App\Models\ProgramRegistration;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProgramController extends Controller
{
    /**
     * Tampilkan daftar program kerja NSA dan riwayat pendaftaran anggota.
     */
    public function index(Request $request): Response
    {
        $user = $request->user()->load([
            'application.programInterests',
            'programRegistrations.program',
        ]);

        // Kategori minat dari Langkah 6
        $userInterests = $user->application?->programInterests->map(function ($pi) {
            return $pi->category instanceof ProgramCategory
                ? $pi->category->value
                : (string) $pi->category;
        })->filter()->values()->all() ?? [];

        $categoryFilter = $request->input('category');

        $query = Program::where('status', 'published')->orderBy('order');

        if ($categoryFilter) {
            $query->where('category', $categoryFilter);
        }

        $programs = $query->get()->map(function ($program) use ($user, $userInterests) {
            $categoryVal = $program->category instanceof ProgramCategory
                ? $program->category->value
                : (string) $program->category;

            $isEnrolled = $user->programRegistrations->contains('program_id', $program->id);
            $registration = $isEnrolled
                ? $user->programRegistrations->firstWhere('program_id', $program->id)
                : null;

            // Apakah sesuai dengan minat yang dipilih di Langkah 6
            $matchesInterest = in_array($categoryVal, $userInterests, true);

            return [
                'id' => $program->id,
                'title' => $program->title,
                'slug' => $program->slug,
                'category' => $categoryVal,
                'category_label' => $program->category instanceof ProgramCategory
                    ? $program->category->label()
                    : ucfirst($categoryVal),
                'summary' => $program->summary,
                'cover_url' => $program->cover_url,
                'starts_at' => $program->starts_at?->format('d M Y'),
                'ends_at' => $program->ends_at?->format('d M Y'),
                'is_enrolled' => $isEnrolled,
                'registration_status' => $registration?->status,
                'matches_interest' => $matchesInterest,
            ];
        });

        // Riwayat program yang diikuti
        $myRegistrations = $user->programRegistrations->map(function ($reg) {
            return [
                'id' => $reg->id,
                'program_id' => $reg->program_id,
                'title' => $reg->program->title,
                'slug' => $reg->program->slug,
                'category' => $reg->program->category instanceof ProgramCategory
                    ? $reg->program->category->label()
                    : (string) $reg->program->category,
                'status' => $reg->status,
                'note' => $reg->note,
                'registered_at' => $reg->created_at->format('d/m/Y H:i'),
            ];
        });

        return Inertia::render('Member/Programs', [
            'programs' => $programs,
            'myRegistrations' => $myRegistrations,
            'userInterests' => $userInterests,
            'selectedCategory' => $categoryFilter ?? '',
            'categories' => array_map(fn ($c) => [
                'value' => $c->value,
                'label' => $c->label(),
            ], ProgramCategory::cases()),
        ]);
    }

    /**
     * Daftarkan anggota ke program kerja NSA.
     */
    public function register(Program $program, Request $request): RedirectResponse
    {
        $user = $request->user();

        $registration = ProgramRegistration::firstOrCreate(
            [
                'program_id' => $program->id,
                'user_id' => $user->id,
            ],
            [
                'status' => 'registered',
                'note' => $request->input('note'),
            ]
        );

        return back()->with('success', "Pendaftaran Anda untuk program '{$program->title}' berhasil tercatat.");
    }

    /**
     * Batalkan keikutsertaan program.
     */
    public function cancel(Program $program, Request $request): RedirectResponse
    {
        $user = $request->user();

        $registration = ProgramRegistration::where('program_id', $program->id)
            ->where('user_id', $user->id)
            ->first();

        if ($registration) {
            $registration->delete();
        }

        return back()->with('success', "Keikutsertaan program '{$program->title}' berhasil dibatalkan.");
    }
}
