<?php

namespace App\Http\Controllers\Account;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\Contracts\PaymentServiceInterface;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function __construct(
        protected PaymentServiceInterface $paymentService
    ) {}

    /**
     * Tampilkan daftar seluruh pesanan milik pengguna yang login.
     */
    public function index(Request $request): Response
    {
        $orders = $request->user()
            ->orders()
            ->with(['items', 'payment'])
            ->latest()
            ->paginate(10)
            ->through(function (Order $order) {
                return [
                    'id' => $order->id,
                    'code' => $order->code,
                    'status' => $order->status->value,
                    'status_label' => $order->status->label(),
                    'total' => (float) $order->total,
                    'items_count' => $order->items->sum('qty'),
                    'first_item_name' => $order->items->first()?->name_snapshot ?? 'Produk',
                    'created_at' => $order->created_at->translatedFormat('d F Y, H:i'),
                    'payment_status' => $order->payment?->status ?? 'pending',
                ];
            });

        return Inertia::render('Account/Orders/Index', [
            'orders' => $orders,
        ]);
    }

    /**
     * Tampilkan rincian pesanan dan instruksi/bukti transfer.
     */
    public function show(Order $order, Request $request): Response
    {
        if ($order->user_id !== $request->user()->id) {
            abort(403);
        }

        $order->load(['items', 'payment']);

        $instructions = $this->paymentService->getPaymentInstructions($order);

        $orderData = [
            'id' => $order->id,
            'code' => $order->code,
            'status' => $order->status->value,
            'status_label' => $order->status->label(),
            'subtotal' => (float) $order->subtotal,
            'shipping_cost' => (float) $order->shipping_cost,
            'total' => (float) $order->total,
            'address' => $order->address,
            'note' => $order->note,
            'created_at' => $order->created_at->translatedFormat('d F Y, H:i'),
            'items' => $order->items->map(fn ($item) => [
                'id' => $item->id,
                'name' => $item->name_snapshot,
                'price' => (float) $item->price_snapshot,
                'qty' => $item->qty,
                'subtotal' => (float) ($item->price_snapshot * $item->qty),
            ]),
            'payment' => $order->payment ? [
                'id' => $order->payment->id,
                'method' => $order->payment->method,
                'amount' => (float) $order->payment->amount,
                'status' => $order->payment->status,
                'proof_url' => $order->payment->proof_path ? asset('storage/'.$order->payment->proof_path) : null,
                'confirmed_at' => $order->payment->confirmed_at?->translatedFormat('d F Y, H:i'),
            ] : null,
        ];

        return Inertia::render('Account/Orders/Show', [
            'order' => $orderData,
            'instructions' => $instructions,
        ]);
    }

    /**
     * Unggah bukti transfer pembayaran pesanan.
     */
    public function uploadProof(Order $order, Request $request): RedirectResponse
    {
        if ($order->user_id !== $request->user()->id) {
            abort(403);
        }

        $request->validate([
            'proof' => ['required', 'file', 'mimes:jpg,jpeg,png,pdf,webp', 'max:3072'],
        ]);

        $this->paymentService->uploadProof($order, $request->file('proof'));

        return back()->with('success', 'Bukti pembayaran berhasil diunggah. Tim '.(config('brand.short_name') ?? 'NSA').' akan memverifikasi dalam 1x24 jam.');
    }
}
