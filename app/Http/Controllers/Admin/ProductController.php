<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ProductType;
use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\ProductImage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Product::query()->with(['category', 'images']);

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($categoryId = $request->input('category_id')) {
            $query->where('category_id', $categoryId);
        }

        if ($type = $request->input('type')) {
            $query->where('type', $type);
        }

        if ($request->filled('is_active')) {
            $query->where('is_active', filter_var($request->input('is_active'), FILTER_VALIDATE_BOOLEAN));
        }

        $sort = $request->input('sort', 'newest');
        match ($sort) {
            'oldest' => $query->oldest(),
            'name_asc' => $query->orderBy('name', 'asc'),
            'name_desc' => $query->orderBy('name', 'desc'),
            'price_asc' => $query->orderBy('price', 'asc'),
            'price_desc' => $query->orderBy('price', 'desc'),
            'stock_asc' => $query->orderBy('stock', 'asc'),
            default => $query->latest(),
        };

        $products = $query->paginate(12)->withQueryString()->through(function ($p) {
            return [
                'id' => $p->id,
                'name' => $p->name,
                'slug' => $p->slug,
                'type' => $p->type instanceof ProductType ? $p->type->value : (string) $p->type,
                'category_name' => $p->category?->name ?? '-',
                'price' => (float) $p->price,
                'member_price' => $p->member_price !== null ? (float) $p->member_price : null,
                'stock' => $p->stock,
                'weight' => $p->weight,
                'location' => $p->location,
                'is_active' => $p->is_active,
                'primary_image' => $p->images->first()?->path ? Storage::url($p->images->first()->path) : null,
            ];
        });

        $categories = ProductCategory::orderBy('name')->get(['id', 'name', 'group']);

        return Inertia::render('Admin/Products/Index', [
            'products' => $products,
            'categories' => $categories,
            'filters' => $request->only(['search', 'category_id', 'type', 'is_active', 'sort']),
            'typeOptions' => [
                ['value' => 'physical', 'label' => 'Barang Fisik'],
                ['value' => 'rental', 'label' => 'Sewa'],
                ['value' => 'spot', 'label' => 'Spot Mancing'],
                ['value' => 'community', 'label' => 'Komunitas'],
            ],
        ]);
    }

    public function create(): Response
    {
        $categories = ProductCategory::orderBy('group')->orderBy('name')->get();

        return Inertia::render('Admin/Products/Form', [
            'product' => null,
            'categories' => $categories,
            'typeOptions' => [
                ['value' => 'physical', 'label' => 'Barang Fisik'],
                ['value' => 'rental', 'label' => 'Sewa'],
                ['value' => 'spot', 'label' => 'Spot Mancing'],
                ['value' => 'community', 'label' => 'Komunitas'],
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'category_id' => ['required', 'exists:product_categories,id'],
            'type' => ['required', 'in:physical,rental,spot,community'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'member_price' => ['nullable', 'numeric', 'min:0', 'lte:price'],
            'stock' => ['nullable', 'integer', 'min:0'],
            'weight' => ['nullable', 'integer', 'min:0'],
            'location' => ['nullable', 'string', 'max:255'],
            'is_active' => ['boolean'],
            'images' => ['nullable', 'array'],
            'images.*' => ['image', 'max:5120'], // maks 5MB
        ]);

        $product = DB::transaction(function () use ($request, $validated) {
            $slug = Str::slug($validated['name']);
            $counter = 1;
            while (Product::where('slug', $slug)->exists()) {
                $slug = Str::slug($validated['name']).'-'.$counter++;
            }

            $product = Product::create([
                'category_id' => $validated['category_id'],
                'type' => $validated['type'],
                'name' => $validated['name'],
                'slug' => $slug,
                'description' => $validated['description'] ?? null,
                'price' => $validated['price'],
                'member_price' => $validated['member_price'] ?? null,
                'stock' => $validated['stock'] ?? 0,
                'weight' => $validated['weight'] ?? 0,
                'location' => $validated['location'] ?? null,
                'is_active' => $request->boolean('is_active', true),
            ]);

            if ($request->hasFile('images')) {
                $order = 0;
                foreach ($request->file('images') as $file) {
                    $path = $file->store('products', 'public');
                    ProductImage::create([
                        'product_id' => $product->id,
                        'path' => $path,
                        'order' => $order++,
                    ]);
                }
            }

            ActivityLog::log(
                action: 'create_product',
                subject: "Menambahkan produk baru: {$product->name}",
                meta: ['product_id' => $product->id, 'price' => $product->price],
                userId: $request->user()->id,
            );

            return $product;
        });

        return redirect()->route('admin.products.index')->with('success', "Produk {$product->name} berhasil dibuat.");
    }

    public function edit(Product $product): Response
    {
        $product->load(['images' => fn ($q) => $q->orderBy('order')]);
        $categories = ProductCategory::orderBy('group')->orderBy('name')->get();

        return Inertia::render('Admin/Products/Form', [
            'product' => [
                'id' => $product->id,
                'category_id' => $product->category_id,
                'type' => $product->type instanceof ProductType ? $product->type->value : (string) $product->type,
                'name' => $product->name,
                'slug' => $product->slug,
                'description' => $product->description,
                'price' => (float) $product->price,
                'member_price' => $product->member_price !== null ? (float) $product->member_price : null,
                'stock' => $product->stock,
                'weight' => $product->weight,
                'location' => $product->location,
                'is_active' => $product->is_active,
                'images' => $product->images->map(fn ($img) => [
                    'id' => $img->id,
                    'path' => Storage::url($img->path),
                    'order' => $img->order,
                ]),
            ],
            'categories' => $categories,
            'typeOptions' => [
                ['value' => 'physical', 'label' => 'Barang Fisik'],
                ['value' => 'rental', 'label' => 'Sewa'],
                ['value' => 'spot', 'label' => 'Spot Mancing'],
                ['value' => 'community', 'label' => 'Komunitas'],
            ],
        ]);
    }

    public function update(Product $product, Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'category_id' => ['required', 'exists:product_categories,id'],
            'type' => ['required', 'in:physical,rental,spot,community'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'member_price' => ['nullable', 'numeric', 'min:0', 'lte:price'],
            'stock' => ['nullable', 'integer', 'min:0'],
            'weight' => ['nullable', 'integer', 'min:0'],
            'location' => ['nullable', 'string', 'max:255'],
            'is_active' => ['boolean'],
            'new_images' => ['nullable', 'array'],
            'new_images.*' => ['image', 'max:5120'],
            'remove_image_ids' => ['nullable', 'array'],
            'remove_image_ids.*' => ['integer', 'exists:product_images,id'],
            'image_order' => ['nullable', 'array'],
        ]);

        DB::transaction(function () use ($product, $request, $validated) {
            $product->update([
                'category_id' => $validated['category_id'],
                'type' => $validated['type'],
                'name' => $validated['name'],
                'description' => $validated['description'] ?? null,
                'price' => $validated['price'],
                'member_price' => $validated['member_price'] ?? null,
                'stock' => $validated['stock'] ?? 0,
                'weight' => $validated['weight'] ?? 0,
                'location' => $validated['location'] ?? null,
                'is_active' => $request->boolean('is_active', true),
            ]);

            // Hapus gambar yang diminta
            if (! empty($validated['remove_image_ids'])) {
                $imagesToDelete = ProductImage::where('product_id', $product->id)
                    ->whereIn('id', $validated['remove_image_ids'])
                    ->get();

                foreach ($imagesToDelete as $img) {
                    Storage::disk('public')->delete($img->path);
                    $img->delete();
                }
            }

            // Tambah gambar baru
            if ($request->hasFile('new_images')) {
                $maxOrder = (int) ProductImage::where('product_id', $product->id)->max('order');
                foreach ($request->file('new_images') as $file) {
                    $maxOrder++;
                    $path = $file->store('products', 'public');
                    ProductImage::create([
                        'product_id' => $product->id,
                        'path' => $path,
                        'order' => $maxOrder,
                    ]);
                }
            }

            // Atur urutan gambar bila disediakan
            if (! empty($validated['image_order'])) {
                foreach ($validated['image_order'] as $item) {
                    if (isset($item['id'], $item['order'])) {
                        ProductImage::where('id', $item['id'])
                            ->where('product_id', $product->id)
                            ->update(['order' => (int) $item['order']]);
                    }
                }
            }

            ActivityLog::log(
                action: 'update_product',
                subject: "Memperbarui produk: {$product->name}",
                meta: ['product_id' => $product->id],
                userId: $request->user()->id,
            );
        });

        return redirect()->route('admin.products.index')->with('success', "Produk {$product->name} berhasil diperbarui.");
    }

    public function destroy(Product $product, Request $request): RedirectResponse
    {
        // Hanya superadmin yang dapat menghapus permanen (Policy / Gate)
        Gate::authorize('delete-permanently');

        ActivityLog::log(
            action: 'delete_product_permanent',
            subject: "Menghapus permanen produk: {$product->name}",
            meta: ['name' => $product->name, 'id' => $product->id],
            userId: $request->user()->id,
        );

        $name = $product->name;
        foreach ($product->images as $img) {
            Storage::disk('public')->delete($img->path);
            $img->delete();
        }
        $product->delete();

        return redirect()->route('admin.products.index')->with('success', "Produk {$name} berhasil dihapus permanen.");
    }
}
