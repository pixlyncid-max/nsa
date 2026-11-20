<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\FishCategory;
use App\Services\StatisticService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class FishCategoryController extends Controller
{
    public function index(): Response
    {
        $categories = FishCategory::withCount('statisticSnapshots')
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/FishCategories/Index', [
            'categories' => $categories,
        ]);
    }

    public function store(Request $request, StatisticService $statisticService): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'icon' => ['nullable', 'string', 'max:50'],
            'description' => ['nullable', 'string'],
            'is_active' => ['boolean'],
        ]);

        $slug = Str::slug($validated['name']);
        $counter = 1;
        while (FishCategory::where('slug', $slug)->exists()) {
            $slug = Str::slug($validated['name']).'-'.$counter++;
        }

        $category = FishCategory::create([
            'name' => $validated['name'],
            'slug' => $slug,
            'icon' => $validated['icon'] ?? 'fish',
            'description' => $validated['description'] ?? null,
            'is_active' => $request->boolean('is_active', true),
        ]);

        $statisticService->clearCache();
        ActivityLog::log('create_fish_category', "Menambah kategori ikan: {$category->name}");

        return back()->with('success', "Kategori ikan {$category->name} berhasil ditambahkan.");
    }

    public function update(FishCategory $fishCategory, Request $request, StatisticService $statisticService): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'icon' => ['nullable', 'string', 'max:50'],
            'description' => ['nullable', 'string'],
            'is_active' => ['boolean'],
        ]);

        $fishCategory->update([
            'name' => $validated['name'],
            'icon' => $validated['icon'] ?? 'fish',
            'description' => $validated['description'] ?? null,
            'is_active' => $request->boolean('is_active', true),
        ]);

        $statisticService->clearCache();
        ActivityLog::log('update_fish_category', "Memperbarui kategori ikan: {$fishCategory->name}");

        return back()->with('success', "Kategori ikan {$fishCategory->name} berhasil diperbarui.");
    }

    public function destroy(FishCategory $fishCategory, StatisticService $statisticService): RedirectResponse
    {
        if ($fishCategory->statisticSnapshots()->exists() || $fishCategory->memberCommodities()->exists()) {
            return back()->with('error', 'Kategori ikan tidak dapat dihapus karena masih digunakan dalam data komoditas atau statistik.');
        }

        $name = $fishCategory->name;
        $fishCategory->delete();
        $statisticService->clearCache();

        ActivityLog::log('delete_fish_category', "Menghapus kategori ikan: {$name}");

        return back()->with('success', "Kategori ikan {$name} berhasil dihapus.");
    }
}
