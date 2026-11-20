<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ProgramCategory;
use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Program;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;
use Inertia\Inertia;
use Inertia\Response;

class ProgramController extends Controller
{
    /**
     * Tampilkan daftar program kerja untuk CMS Admin & Superadmin.
     */
    public function index(Request $request): Response
    {
        $search = $request->query('search');
        $category = $request->query('category');
        $status = $request->query('status');

        $programs = Program::query()
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                        ->orWhere('summary', 'like', "%{$search}%");
                });
            })
            ->when($category, fn ($query, $cat) => $query->where('category', $cat))
            ->when($status, fn ($query, $st) => $query->where('status', $st))
            ->ordered()
            ->get()
            ->map(function (Program $program) {
                return [
                    'id' => $program->id,
                    'title' => $program->title,
                    'slug' => $program->slug,
                    'category' => $program->category->value,
                    'category_label' => $program->category->label(),
                    'summary' => $program->summary,
                    'status' => $program->status,
                    'is_public' => (bool) $program->is_public,
                    'cover_url' => $program->cover_url,
                    'starts_at' => $program->starts_at?->format('Y-m-d H:i'),
                    'ends_at' => $program->ends_at?->format('Y-m-d H:i'),
                    'order' => $program->order,
                    'registrations_count' => $program->registrations()->count(),
                ];
            });

        $categories = collect(ProgramCategory::cases())->map(fn ($cat) => [
            'value' => $cat->value,
            'label' => $cat->label(),
        ]);

        return Inertia::render('Admin/Programs/Index', [
            'programs' => $programs,
            'categories' => $categories,
            'filters' => [
                'search' => $search ?? '',
                'category' => $category ?? '',
                'status' => $status ?? '',
            ],
        ]);
    }

    /**
     * Formulir tambah program baru.
     */
    public function create(): Response
    {
        $categories = collect(ProgramCategory::cases())->map(fn ($cat) => [
            'value' => $cat->value,
            'label' => $cat->label(),
        ]);

        $maxOrder = (int) Program::max('order');

        return Inertia::render('Admin/Programs/Form', [
            'program' => null,
            'categories' => $categories,
            'nextOrder' => $maxOrder + 1,
        ]);
    }

    /**
     * Simpan program baru ke database.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:programs,slug'],
            'category' => ['required', new Enum(ProgramCategory::class)],
            'summary' => ['nullable', 'string'],
            'body' => ['nullable', 'string'],
            'status' => ['required', 'in:draft,published'],
            'is_public' => ['boolean'],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
            'order' => ['nullable', 'integer'],
            'cover' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:3072'],
        ], [
            'title.required' => 'Judul program wajib diisi.',
            'category.required' => 'Kategori program wajib dipilih.',
            'ends_at.after_or_equal' => 'Jadwal berakhir harus sama atau setelah jadwal mulai.',
            'cover.image' => 'Berkas cover harus berupa gambar (JPG, PNG, WebP).',
            'cover.max' => 'Ukuran berkas cover maksimal 3MB.',
        ]);

        $slug = ! empty($validated['slug'])
            ? Str::slug($validated['slug'])
            : Str::slug($validated['title']);

        // Pastikan keunikan slug
        $originalSlug = $slug;
        $counter = 1;
        while (Program::where('slug', $slug)->exists()) {
            $slug = "{$originalSlug}-{$counter}";
            $counter++;
        }

        $coverPath = null;
        if ($request->hasFile('cover')) {
            $coverPath = $request->file('cover')->store('programs', 'public');
        }

        $program = Program::create([
            'title' => $validated['title'],
            'slug' => $slug,
            'category' => $validated['category'],
            'summary' => $validated['summary'] ?? null,
            'body' => $validated['body'] ?? null,
            'cover' => $coverPath,
            'status' => $validated['status'],
            'is_public' => $request->boolean('is_public', true),
            'starts_at' => $validated['starts_at'] ?? null,
            'ends_at' => $validated['ends_at'] ?? null,
            'order' => $validated['order'] ?? 0,
        ]);

        ActivityLog::log('create_program', "Menambah program baru: {$program->title}");

        return redirect()->route('admin.programs.index')
            ->with('success', "Program {$program->title} berhasil ditambahkan.");
    }

    /**
     * Formulir edit program.
     */
    public function edit(Program $program): Response
    {
        $categories = collect(ProgramCategory::cases())->map(fn ($cat) => [
            'value' => $cat->value,
            'label' => $cat->label(),
        ]);

        return Inertia::render('Admin/Programs/Form', [
            'program' => [
                'id' => $program->id,
                'title' => $program->title,
                'slug' => $program->slug,
                'category' => $program->category->value,
                'summary' => $program->summary ?? '',
                'body' => $program->body ?? '',
                'status' => $program->status,
                'is_public' => (bool) $program->is_public,
                'cover_url' => $program->cover_url,
                'starts_at' => $program->starts_at?->format('Y-m-d\TH:i') ?? '',
                'ends_at' => $program->ends_at?->format('Y-m-d\TH:i') ?? '',
                'order' => $program->order,
            ],
            'categories' => $categories,
            'nextOrder' => $program->order,
        ]);
    }

    /**
     * Perbarui data program kerja.
     */
    public function update(Request $request, Program $program): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('programs', 'slug')->ignore($program->id)],
            'category' => ['required', new Enum(ProgramCategory::class)],
            'summary' => ['nullable', 'string'],
            'body' => ['nullable', 'string'],
            'status' => ['required', 'in:draft,published'],
            'is_public' => ['boolean'],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
            'order' => ['nullable', 'integer'],
            'cover' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:3072'],
        ], [
            'title.required' => 'Judul program wajib diisi.',
            'category.required' => 'Kategori program wajib dipilih.',
            'ends_at.after_or_equal' => 'Jadwal berakhir harus sama atau setelah jadwal mulai.',
            'cover.image' => 'Berkas cover harus berupa gambar (JPG, PNG, WebP).',
            'cover.max' => 'Ukuran berkas cover maksimal 3MB.',
        ]);

        $slug = ! empty($validated['slug'])
            ? Str::slug($validated['slug'])
            : Str::slug($validated['title']);

        if ($request->hasFile('cover')) {
            if ($program->getRawOriginal('cover') && Storage::disk('public')->exists($program->getRawOriginal('cover'))) {
                Storage::disk('public')->delete($program->getRawOriginal('cover'));
            }
            $program->cover = $request->file('cover')->store('programs', 'public');
        }

        $program->update([
            'title' => $validated['title'],
            'slug' => $slug,
            'category' => $validated['category'],
            'summary' => $validated['summary'] ?? null,
            'body' => $validated['body'] ?? null,
            'status' => $validated['status'],
            'is_public' => $request->boolean('is_public'),
            'starts_at' => $validated['starts_at'] ?? null,
            'ends_at' => $validated['ends_at'] ?? null,
            'order' => $validated['order'] ?? $program->order,
        ]);

        ActivityLog::log('update_program', "Memperbarui program: {$program->title}");

        return redirect()->route('admin.programs.index')
            ->with('success', "Program {$program->title} berhasil diperbarui.");
    }

    /**
     * Hapus program kerja.
     */
    public function destroy(Program $program): RedirectResponse
    {
        $title = $program->title;

        if ($program->getRawOriginal('cover') && Storage::disk('public')->exists($program->getRawOriginal('cover'))) {
            Storage::disk('public')->delete($program->getRawOriginal('cover'));
        }

        $program->delete();

        ActivityLog::log('delete_program', "Menghapus program: {$title}");

        return redirect()->route('admin.programs.index')
            ->with('success', "Program {$title} berhasil dihapus.");
    }

    /**
     * Urutkan program kerja (drag and drop).
     */
    public function reorder(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'orders' => ['required', 'array'],
            'orders.*.id' => ['required', 'integer', 'exists:programs,id'],
            'orders.*.order' => ['required', 'integer'],
        ]);

        foreach ($validated['orders'] as $item) {
            Program::where('id', $item['id'])->update(['order' => $item['order']]);
        }

        ActivityLog::log('reorder_programs', 'Memperbarui urutan program kerja');

        return back()->with('success', 'Urutan program kerja berhasil diperbarui.');
    }
}
