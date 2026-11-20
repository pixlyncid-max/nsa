<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\MembershipCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class MembershipCategoryController extends Controller
{
    /**
     * Tampilkan daftar master kategori keanggotaan.
     */
    public function index(): Response
    {
        $categories = MembershipCategory::withCount('types')
            ->orderBy('id')
            ->get();

        return Inertia::render('Admin/MembershipMaster/Categories', [
            'categories' => $categories,
        ]);
    }

    /**
     * Simpan kategori baru.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:membership_categories,name'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:membership_categories,slug'],
            'description' => ['nullable', 'string', 'max:1000'],
            'is_active' => ['boolean'],
        ]);

        $validated['slug'] = ! empty($validated['slug'])
            ? Str::slug($validated['slug'])
            : Str::slug($validated['name']);
        $validated['is_active'] = $validated['is_active'] ?? true;

        $category = MembershipCategory::create($validated);

        ActivityLog::log(
            action: 'create_membership_category',
            subject: "Menambahkan kategori keanggotaan: {$category->name}",
            userId: $request->user()->id,
        );

        return back()->with('success', "Kategori '{$category->name}' berhasil ditambahkan.");
    }

    /**
     * Perbarui kategori keanggotaan.
     */
    public function update(Request $request, MembershipCategory $category): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('membership_categories', 'name')->ignore($category->id)],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('membership_categories', 'slug')->ignore($category->id)],
            'description' => ['nullable', 'string', 'max:1000'],
            'is_active' => ['boolean'],
        ]);

        if (! empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['slug']);
        }

        $category->update($validated);

        ActivityLog::log(
            action: 'update_membership_category',
            subject: "Memperbarui kategori keanggotaan: {$category->name}",
            userId: $request->user()->id,
        );

        return back()->with('success', "Kategori '{$category->name}' berhasil diperbarui.");
    }

    /**
     * Hapus kategori keanggotaan.
     */
    public function destroy(Request $request, MembershipCategory $category): RedirectResponse
    {
        if ($category->types()->count() > 0) {
            return back()->withErrors([
                'error' => "Kategori '{$category->name}' memiliki jenis keanggotaan terkait. Hapus atau pindahkan jenis terlebih dahulu.",
            ]);
        }

        $name = $category->name;
        $category->delete();

        ActivityLog::log(
            action: 'delete_membership_category',
            subject: "Menghapus kategori keanggotaan: {$name}",
            userId: $request->user()->id,
        );

        return back()->with('success', "Kategori '{$name}' berhasil dihapus.");
    }
}
