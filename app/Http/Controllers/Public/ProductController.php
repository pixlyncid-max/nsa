<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    /**
     * Map kelompok slug dari URL ke nilai kolom database 'group'.
     *
     * @var array<string, string>
     */
    protected array $groupMap = [
        'air-tawar' => 'freshwater',
        'air-laut' => 'saltwater',
        'lain-lain' => 'other',
    ];

    /**
     * Katalog utama produk dengan filter, pencarian, dan paginasi.
     */
    public function index(Request $request): Response
    {
        $locale = app()->getLocale();
        $filters = $request->only([
            'search',
            'group',
            'category',
            'type',
            'min_price',
            'max_price',
            'location',
            'sort',
        ]);

        $query = Product::active()
            ->withLocale($locale)
            ->with([
                'category' => fn ($q) => $q->withLocale($locale)->with([
                    'parent' => fn ($p) => $p->withLocale($locale),
                ]),
                'images',
            ])
            ->filter($filters);

        $products = $query->paginate(12)->withQueryString();

        $user = $request->user();

        // Transformasi data produk terlokalisasi untuk frontend
        $transformedProducts = $products->through(function (Product $p) use ($user, $locale) {
            return [
                'id' => $p->id,
                'name' => $p->tr('name', $locale),
                'slug' => $p->slug,
                'type' => $p->type->value,
                'type_label' => $p->type->label(),
                'price' => (float) $p->price,
                'member_price' => $p->member_price ? (float) $p->member_price : null,
                'effective_price' => $p->getPriceFor($user),
                'is_member_price_applied' => $p->isMemberPriceApplied($user),
                'stock' => $p->stock,
                'weight' => $p->weight,
                'location' => $p->location,
                'category_name' => $p->category?->tr('name', $locale) ?? ($locale === 'en' ? 'Product' : 'Produk'),
                'category_slug' => $p->category?->slug,
                'group' => $p->category?->group ?? $p->category?->parent?->group,
                'image' => $p->images->first()?->url(),
            ];
        });

        // Ambil struktur kategori untuk filter samping (dengan eager load terjemahan)
        $categories = ProductCategory::with([
            'children' => fn ($q) => $q->withLocale($locale),
        ])
            ->withLocale($locale)
            ->whereNull('parent_id')
            ->get()
            ->map(fn (ProductCategory $cat) => [
                'id' => $cat->id,
                'parent_id' => $cat->parent_id,
                'name' => $cat->tr('name', $locale),
                'slug' => $cat->slug,
                'group' => $cat->group,
                'icon' => $cat->icon,
                'children' => $cat->children->map(fn (ProductCategory $child) => [
                    'id' => $child->id,
                    'parent_id' => $child->parent_id,
                    'name' => $child->tr('name', $locale),
                    'slug' => $child->slug,
                    'group' => $child->group,
                    'icon' => $child->icon,
                ])->values(),
            ]);

        // Daftar lokasi unik untuk filter
        $locations = Product::active()
            ->whereNotNull('location')
            ->distinct()
            ->pluck('location')
            ->filter()
            ->values();

        return Inertia::render('Public/Product/Index', [
            'products' => $transformedProducts,
            'filters' => $filters,
            'categories' => $categories,
            'locations' => $locations,
            'activeGroup' => $filters['group'] ?? null,
            'activeCategory' => $filters['category'] ?? null,
        ]);
    }

    /**
     * Katalog berdasarkan kelompok utama (air-tawar, air-laut, lain-lain).
     */
    public function group(string $group, Request $request): Response
    {
        $dbGroup = $this->groupMap[$group] ?? $group;
        $request->merge(['group' => $dbGroup]);

        return $this->index($request);
    }

    /**
     * Katalog berdasarkan kelompok dan sub-kategori spesifik.
     */
    public function subCategory(string $group, string $subCategory, Request $request): Response
    {
        $dbGroup = $this->groupMap[$group] ?? $group;
        $request->merge([
            'group' => $dbGroup,
            'category' => $subCategory,
        ]);

        return $this->index($request);
    }

    /**
     * Halaman detail produk lengkap.
     */
    public function show(string $slug, Request $request): Response
    {
        $locale = app()->getLocale();

        /** @var Product $product */
        $product = Product::active()
            ->where('slug', $slug)
            ->withLocale($locale)
            ->with([
                'category' => fn ($q) => $q->withLocale($locale)->with([
                    'parent' => fn ($p) => $p->withLocale($locale),
                ]),
                'images',
            ])
            ->firstOrFail();

        $user = $request->user();

        $productData = [
            'id' => $product->id,
            'name' => $product->tr('name', $locale),
            'slug' => $product->slug,
            'type' => $product->type->value,
            'type_label' => $product->type->label(),
            'description' => $product->tr('description', $locale),
            'price' => (float) $product->price,
            'member_price' => $product->member_price ? (float) $product->member_price : null,
            'effective_price' => $product->getPriceFor($user),
            'is_member_price_applied' => $product->isMemberPriceApplied($user),
            'stock' => $product->stock,
            'weight' => $product->weight,
            'location' => $product->location,
            'category_name' => $product->category?->tr('name', $locale) ?? ($locale === 'en' ? 'Product' : 'Produk'),
            'category_slug' => $product->category?->slug,
            'group' => $product->category?->group ?? $product->category?->parent?->group,
            'images' => $product->images->map(fn ($img) => [
                'id' => $img->id,
                'path' => $img->url(),
            ]),
        ];

        // Produk terkait dalam kategori yang sama
        $relatedProducts = Product::active()
            ->where('id', '!=', $product->id)
            ->where('category_id', $product->category_id)
            ->withLocale($locale)
            ->with([
                'category' => fn ($q) => $q->withLocale($locale),
                'images',
            ])
            ->limit(4)
            ->get()
            ->map(function (Product $p) use ($user, $locale) {
                return [
                    'id' => $p->id,
                    'name' => $p->tr('name', $locale),
                    'slug' => $p->slug,
                    'type' => $p->type->value,
                    'price' => (float) $p->price,
                    'effective_price' => $p->getPriceFor($user),
                    'is_member_price_applied' => $p->isMemberPriceApplied($user),
                    'category_name' => $p->category?->tr('name', $locale),
                    'location' => $p->location,
                    'image' => $p->images->first()?->url(),
                ];
            });

        return Inertia::render('Public/Product/Show', [
            'product' => $productData,
            'relatedProducts' => $relatedProducts,
        ])->withViewData('seo', [
            'type' => 'product',
            'title' => $productData['name'],
            'description' => Str::limit(
                trim((string) preg_replace('/\s+/', ' ', html_entity_decode(strip_tags((string) ($productData['description'] ?? '')), ENT_QUOTES | ENT_HTML5, 'UTF-8'))),
                160
            ),
            'image' => $product->images->first()?->url(),
            'url' => url()->current(),
        ]);
    }
}
