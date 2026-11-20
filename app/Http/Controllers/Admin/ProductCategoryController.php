<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\ProductCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ProductCategoryController extends Controller
{
    public function index(): Response
    {
        $categories = ProductCategory::with(['parent', 'children'])
            ->withCount('products')
            ->orderBy('group')
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/Products/Categories', [
            'categories' => $categories,
            'groups' => [
                ['value' => 'air-tawar', 'label' => 'Spot Air Tawar'],
                ['value' => 'air-laut', 'label' => 'Spot Air Laut'],
                ['value' => 'lain-lain', 'label' => 'Lain-lain'],
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'parent_id' => ['nullable', 'exists:product_categories,id'],
            'name' => ['required', 'string', 'max:100'],
            'group' => ['required', 'in:air-tawar,air-laut,lain-lain'],
            'icon' => ['nullable', 'string', 'max:50'],
        ]);

        $slug = Str::slug($validated['name']);
        $counter = 1;
        while (ProductCategory::where('slug', $slug)->exists()) {
            $slug = Str::slug($validated['name']).'-'.$counter++;
        }

        $category = ProductCategory::create([
            'parent_id' => $validated['parent_id'] ?? null,
            'name' => $validated['name'],
            'slug' => $slug,
            'group' => $validated['group'],
            'icon' => $validated['icon'] ?? null,
        ]);

        ActivityLog::log('create_product_category', "Menambah kategori produk: {$category->name}");

        return back()->with('success', "Kategori {$category->name} berhasil ditambahkan.");
    }

    public function update(ProductCategory $category, Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'parent_id' => ['nullable', 'exists:product_categories,id'],
            'name' => ['required', 'string', 'max:100'],
            'group' => ['required', 'in:air-tawar,air-laut,lain-lain'],
            'icon' => ['nullable', 'string', 'max:50'],
        ]);

        $category->update([
            'parent_id' => $validated['parent_id'] ?? null,
            'name' => $validated['name'],
            'group' => $validated['group'],
            'icon' => $validated['icon'] ?? null,
        ]);

        ActivityLog::log('update_product_category', "Memperbarui kategori produk: {$category->name}");

        return back()->with('success', "Kategori {$category->name} berhasil diperbarui.");
    }

    public function destroy(ProductCategory $category): RedirectResponse
    {
        if ($category->products()->exists()) {
            return back()->with('error', 'Kategori tidak dapat dihapus karena masih memiliki produk terkait.');
        }

        ActivityLog::log('delete_product_category', "Menghapus kategori produk: {$category->name}");
        $category->delete();

        return back()->with('success', 'Kategori berhasil dihapus.');
    }
}
