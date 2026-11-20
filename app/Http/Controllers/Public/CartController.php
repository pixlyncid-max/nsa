<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\CartItem;
use App\Services\CartService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CartController extends Controller
{
    public function __construct(
        protected CartService $cartService
    ) {}

    /**
     * Tampilkan halaman keranjang penuh.
     */
    public function index(Request $request): Response
    {
        $cartDetails = $this->cartService->getCartDetails(
            $request->user(),
            $request->session()->getId()
        );

        return Inertia::render('Public/Cart/Index', [
            'cart' => $cartDetails,
        ]);
    }

    /**
     * Endpoint data keranjang (untuk drawer mini di navbar).
     */
    public function data(Request $request): JsonResponse
    {
        $cartDetails = $this->cartService->getCartDetails(
            $request->user(),
            $request->session()->getId()
        );

        return response()->json($cartDetails);
    }

    /**
     * Tambahkan barang ke keranjang.
     */
    public function add(Request $request): RedirectResponse
    {
        $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'qty' => ['nullable', 'integer', 'min:1'],
            'options' => ['nullable', 'array'],
        ]);

        $this->cartService->addItem(
            $request->user(),
            $request->session()->getId(),
            (int) $request->product_id,
            (int) ($request->qty ?? 1),
            $request->options ?? []
        );

        return back()->with('success', 'Produk berhasil ditambahkan ke keranjang belanja.');
    }

    /**
     * Ubah kuantitas barang di keranjang.
     */
    public function update(CartItem $cartItem, Request $request): RedirectResponse
    {
        $request->validate([
            'qty' => ['required', 'integer', 'min:0'],
        ]);

        $this->cartService->updateItem(
            $request->user(),
            $request->session()->getId(),
            $cartItem->id,
            (int) $request->qty
        );

        return back()->with('success', 'Kuantitas barang diperbarui.');
    }

    /**
     * Hapus satu barang dari keranjang.
     */
    public function remove(CartItem $cartItem, Request $request): RedirectResponse
    {
        $this->cartService->removeItem(
            $request->user(),
            $request->session()->getId(),
            $cartItem->id
        );

        return back()->with('success', 'Barang telah dihapus dari keranjang.');
    }

    /**
     * Kosongkan seluruh keranjang belanja.
     */
    public function clear(Request $request): RedirectResponse
    {
        $this->cartService->clearCart(
            $request->user(),
            $request->session()->getId()
        );

        return back()->with('success', 'Keranjang belanja telah dikosongkan.');
    }
}
