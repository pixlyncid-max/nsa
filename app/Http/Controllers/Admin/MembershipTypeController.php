<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\MembershipCategory;
use App\Models\MembershipType;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class MembershipTypeController extends Controller
{
    /**
     * Tampilkan daftar master jenis keanggotaan.
     */
    public function index(): Response
    {
        $types = MembershipType::with('category')
            ->withCount('applications')
            ->orderBy('category_id')
            ->orderBy('id')
            ->get();

        $categories = MembershipCategory::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('Admin/MembershipMaster/Types', [
            'types' => $types,
            'categories' => $categories,
        ]);
    }

    /**
     * Simpan jenis keanggotaan baru.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'category_id' => ['required', 'exists:membership_categories,id'],
            'name' => ['required', 'string', 'max:255', 'unique:membership_types,name'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:membership_types,slug'],
            'description' => ['nullable', 'string', 'max:1000'],
            'ad_art_rules' => ['nullable', 'string'],
            'is_active' => ['boolean'],
        ]);

        $validated['slug'] = ! empty($validated['slug'])
            ? Str::slug($validated['slug'])
            : Str::slug($validated['name']);
        $validated['is_active'] = $validated['is_active'] ?? true;

        $type = MembershipType::create($validated);

        ActivityLog::log(
            action: 'create_membership_type',
            subject: "Menambahkan jenis keanggotaan: {$type->name}",
            userId: $request->user()->id,
        );

        return back()->with('success', "Jenis keanggotaan '{$type->name}' berhasil ditambahkan.");
    }

    /**
     * Perbarui jenis keanggotaan.
     */
    public function update(Request $request, MembershipType $type): RedirectResponse
    {
        $validated = $request->validate([
            'category_id' => ['required', 'exists:membership_categories,id'],
            'name' => ['required', 'string', 'max:255', Rule::unique('membership_types', 'name')->ignore($type->id)],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('membership_types', 'slug')->ignore($type->id)],
            'description' => ['nullable', 'string', 'max:1000'],
            'ad_art_rules' => ['nullable', 'string'],
            'is_active' => ['boolean'],
        ]);

        if (! empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['slug']);
        }

        $type->update($validated);

        ActivityLog::log(
            action: 'update_membership_type',
            subject: "Memperbarui jenis keanggotaan: {$type->name}",
            userId: $request->user()->id,
        );

        return back()->with('success', "Jenis keanggotaan '{$type->name}' berhasil diperbarui.");
    }

    /**
     * Hapus jenis keanggotaan.
     */
    public function destroy(Request $request, MembershipType $type): RedirectResponse
    {
        if ($type->applications()->count() > 0) {
            return back()->withErrors([
                'error' => "Jenis '{$type->name}' telah digunakan oleh pendaftar anggota. Tidak dapat dihapus.",
            ]);
        }

        $name = $type->name;
        $type->delete();

        ActivityLog::log(
            action: 'delete_membership_type',
            subject: "Menghapus jenis keanggotaan: {$name}",
            userId: $request->user()->id,
        );

        return back()->with('success', "Jenis keanggotaan '{$name}' berhasil dihapus.");
    }
}
