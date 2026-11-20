<?php

namespace App\Http\Controllers\Public;

use App\Actions\Order\PlaceOrder;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Setting;
use App\Services\CartService;
use App\Services\Contracts\PaymentServiceInterface;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CheckoutController extends Controller
{
    public function __construct(
        protected CartService $cartService,
        protected PaymentServiceInterface $paymentService
    ) {}

    /**
     * Tampilkan form checkout 3 langkah. Wajib login.
     */
    public function index(Request $request): Response|RedirectResponse
    {
        $user = $request->user();

        $cartDetails = $this->cartService->getCartDetails($user, '');

        if ($cartDetails['items']->isEmpty()) {
            return redirect()->route('cart.index')->with('error', 'Keranjang belanja Anda kosong.');
        }

        // Cek data alamat tersimpan dari profil usaha / profil anggota pengguna
        $defaultAddress = [
            'recipient_name' => $user->name,
            'phone' => $user->phone ?? '',
            'province' => $user->business?->province?->name ?? '',
            'city' => $user->business?->regency?->name ?? '',
            'postal_code' => $user->business?->postal_code ?? '',
            'address' => $user->business?->address ?? $user->profile?->address ?? '',
        ];

        $paymentInfo = [
            'bank_name' => Setting::get('bank_name', 'Bank Mandiri'),
            'bank_account_number' => Setting::get('bank_account_number', '123-00-9876543-2'),
            'bank_account_holder' => Setting::get('bank_account_holder', 'Perkumpulan '.(config('brand.short_name') ?? 'NSA').' Indonesia'),
        ];

        return Inertia::render('Public/Checkout/Index', [
            'cart' => $cartDetails,
            'defaultAddress' => $defaultAddress,
            'paymentInfo' => $paymentInfo,
        ]);
    }

    /**
     * Proses pembuatan pesanan via PlaceOrder Action.
     */
    public function store(Request $request, PlaceOrder $placeOrder): RedirectResponse
    {
        $validated = $request->validate([
            'recipient_name' => ['required', 'string', 'max:150'],
            'phone' => ['required', 'string', 'max:30'],
            'province' => ['required', 'string', 'max:100'],
            'city' => ['required', 'string', 'max:100'],
            'postal_code' => ['nullable', 'string', 'max:10'],
            'address' => ['required', 'string', 'max:500'],
            'shipping_option' => ['required', 'string'],
            'payment_method' => ['required', 'string'],
            'note' => ['nullable', 'string', 'max:500'],
        ]);

        $shippingCost = match ($validated['shipping_option']) {
            'express' => 45000.0,
            'pickup' => 0.0,
            default => 25000.0,
        };

        $addressData = [
            'recipient_name' => $validated['recipient_name'],
            'phone' => $validated['phone'],
            'province' => $validated['province'],
            'city' => $validated['city'],
            'postal_code' => $validated['postal_code'] ?? null,
            'address' => $validated['address'],
            'shipping_option' => $validated['shipping_option'],
        ];

        $order = $placeOrder->execute(
            $request->user(),
            $addressData,
            $shippingCost,
            $validated['payment_method'],
            $validated['note'] ?? null
        );

        return redirect()->route('checkout.success', $order->code)
            ->with('success', 'Pesanan Anda berhasil dibuat. Silakan selesaikan pembayaran.');
    }

    /**
     * Halaman sukses checkout dengan kode pesanan dan instruksi transfer.
     */
    public function success(Order $order, Request $request): Response|RedirectResponse
    {
        // Pastikan pesanan milik pengguna yang sedang login
        if ($order->user_id !== $request->user()->id) {
            abort(403);
        }

        $instructions = $this->paymentService->getPaymentInstructions($order);

        return Inertia::render('Public/Checkout/Success', [
            'order' => $order->load(['items', 'payment']),
            'instructions' => $instructions,
        ]);
    }
}
