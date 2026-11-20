<?php

namespace App\Services;

use App\Enums\ProductType;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Validation\ValidationException;

class CartService
{
    /**
     * Hitung total kuantitas barang di keranjang.
     */
    public function count(?User $user, string $sessionId): int
    {
        $cart = $this->findCart($user, $sessionId);

        return (int) ($cart?->items()->sum('qty') ?? 0);
    }

    /**
     * Ambil model Cart aktif atau buat baru jika belum ada.
     */
    public function getCart(?User $user, string $sessionId): Cart
    {
        if ($user) {
            return Cart::firstOrCreate(['user_id' => $user->id]);
        }

        return Cart::firstOrCreate(['session_id' => $sessionId]);
    }

    /**
     * Cari Cart tanpa otomatis membuat yang baru.
     */
    public function findCart(?User $user, string $sessionId): ?Cart
    {
        return Cart::query()
            ->when(
                $user,
                fn ($query) => $query->where('user_id', $user->id),
                fn ($query) => $query->where('session_id', $sessionId),
            )
            ->first();
    }

    /**
     * Dapatkan rincian keranjang lengkap dengan kalkulasi harga efektif, berat, dan validasi stok.
     *
     * @return array<string, mixed>
     */
    public function getCartDetails(?User $user, string $sessionId): array
    {
        $cart = $this->findCart($user, $sessionId);

        if (! $cart) {
            return [
                'items' => collect(),
                'total_qty' => 0,
                'total_weight' => 0,
                'subtotal' => 0.0,
            ];
        }

        $items = $cart->items()->with(['product.category', 'product.images'])->get();

        $subtotal = 0.0;
        $totalWeight = 0;
        $totalQty = 0;

        $detailedItems = $items->map(function (CartItem $item) use ($user, &$subtotal, &$totalWeight, &$totalQty) {
            $product = $item->product;
            if (! $product || ! $product->is_active) {
                return null;
            }

            $effectivePrice = $product->getPriceFor($user);
            $itemSubtotal = $effectivePrice * $item->qty;
            $subtotal += $itemSubtotal;
            $totalQty += $item->qty;

            $itemWeight = ($product->weight ?? 0) * $item->qty;
            $totalWeight += $itemWeight;

            // Validasi ketersediaan stok untuk produk fisik
            $isOutOfStock = false;
            if ($product->type === ProductType::Physical && $item->qty > $product->stock) {
                $isOutOfStock = true;
            }

            return [
                'id' => $item->id,
                'product_id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'type' => $product->type->value,
                'category_name' => $product->category?->name ?? 'Produk',
                'image' => $product->images->first()?->path ?? null,
                'qty' => $item->qty,
                'options' => $item->options ?? [],
                'unit_price' => $effectivePrice,
                'normal_price' => (float) $product->price,
                'member_price' => $product->member_price ? (float) $product->member_price : null,
                'is_member_price_applied' => $product->isMemberPriceApplied($user),
                'subtotal' => $itemSubtotal,
                'weight' => $itemWeight,
                'stock' => $product->stock,
                'is_out_of_stock' => $isOutOfStock,
            ];
        })->filter()->values();

        return [
            'id' => $cart->id,
            'items' => $detailedItems,
            'total_qty' => $totalQty,
            'total_weight' => $totalWeight,
            'subtotal' => $subtotal,
        ];
    }

    /**
     * Tambah barang ke keranjang dengan validasi stok.
     *
     * @param  array<string, mixed>  $options
     */
    public function addItem(?User $user, string $sessionId, int $productId, int $qty = 1, array $options = []): CartItem
    {
        $product = Product::active()->findOrFail($productId);

        if ($qty < 1) {
            $qty = 1;
        }

        // Untuk komunitas, kuantitas selalu 1
        if ($product->type === ProductType::Community) {
            $qty = 1;
        }

        $cart = $this->getCart($user, $sessionId);

        $existingItem = CartItem::where('cart_id', $cart->id)
            ->where('product_id', $productId)
            ->first();

        $targetQty = $existingItem ? ($existingItem->qty + $qty) : $qty;

        // Validasi ketersediaan stok fisik
        if ($product->type === ProductType::Physical && $targetQty > $product->stock) {
            throw ValidationException::withMessages([
                'qty' => "Stok produk tidak mencukupi. Tersedia {$product->stock} unit.",
            ]);
        }

        if ($existingItem) {
            $existingItem->update([
                'qty' => $targetQty,
                'options' => ! empty($options) ? $options : $existingItem->options,
            ]);

            return $existingItem;
        }

        return $cart->items()->create([
            'product_id' => $productId,
            'qty' => $targetQty,
            'options' => ! empty($options) ? $options : null,
        ]);
    }

    /**
     * Ubah kuantitas barang di keranjang.
     */
    public function updateItem(?User $user, string $sessionId, int $cartItemId, int $qty): ?CartItem
    {
        $cart = $this->getCart($user, $sessionId);
        $item = $cart->items()->with('product')->findOrFail($cartItemId);

        if ($qty <= 0) {
            $item->delete();

            return null;
        }

        $product = $item->product;
        if ($product && $product->type === ProductType::Physical && $qty > $product->stock) {
            throw ValidationException::withMessages([
                'qty' => "Kuantitas melebihi stok yang tersedia ({$product->stock} unit).",
            ]);
        }

        $item->update(['qty' => $qty]);

        return $item;
    }

    /**
     * Hapus satu item dari keranjang.
     */
    public function removeItem(?User $user, string $sessionId, int $cartItemId): void
    {
        $cart = $this->findCart($user, $sessionId);
        if ($cart) {
            $cart->items()->where('id', $cartItemId)->delete();
        }
    }

    /**
     * Kosongkan seluruh isi keranjang.
     */
    public function clearCart(?User $user, string $sessionId): void
    {
        $cart = $this->findCart($user, $sessionId);
        if ($cart) {
            $cart->items()->delete();
        }
    }

    /**
     * Gabungkan keranjang tamu (session) ke keranjang pengguna saat login.
     */
    public function mergeGuestCart(User $user, string $guestSessionId): void
    {
        if (empty($guestSessionId)) {
            return;
        }

        $guestCart = Cart::where('session_id', $guestSessionId)->with('items.product')->first();
        if (! $guestCart || $guestCart->items->isEmpty()) {
            return;
        }

        $userCart = Cart::firstOrCreate(['user_id' => $user->id]);

        foreach ($guestCart->items as $guestItem) {
            $product = $guestItem->product;
            if (! $product || ! $product->is_active) {
                continue;
            }

            $userItem = CartItem::where('cart_id', $userCart->id)
                ->where('product_id', $guestItem->product_id)
                ->first();

            if ($userItem) {
                $newQty = $userItem->qty + $guestItem->qty;
                if ($product->type === ProductType::Physical && $newQty > $product->stock) {
                    $newQty = $product->stock;
                }
                $userItem->update(['qty' => $newQty]);
            } else {
                $initialQty = $guestItem->qty;
                if ($product->type === ProductType::Physical && $initialQty > $product->stock) {
                    $initialQty = $product->stock;
                }
                $userCart->items()->create([
                    'product_id' => $guestItem->product_id,
                    'qty' => $initialQty,
                    'options' => $guestItem->options,
                ]);
            }
        }

        // Hapus keranjang guest setelah berhasil digabung
        $guestCart->items()->delete();
        $guestCart->delete();
    }
}
