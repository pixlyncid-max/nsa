<?php

namespace App\Http\Controllers\Account;

use App\Http\Controllers\Controller;
use App\Models\MemberApplication;
use App\Models\Order;
use App\Services\CartService;
use App\Support\Brand;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Tampilkan Dashboard Sederhana untuk pengguna biasa (non-membership).
     */
    public function index(Request $request, CartService $cartService): Response
    {
        $user = $request->user();

        // 1. Data Keanggotaan & Draf
        $application = $user->application;
        $completedSteps = $application?->completed_steps ?? [];
        $completedStepsCount = is_array($completedSteps) ? count($completedSteps) : 0;
        $totalSteps = count(MemberApplication::STEPS);

        $membershipData = [
            'status' => $user->membership_status->value,
            'status_label' => $user->membership_status->label(),
            'status_color' => $user->membership_status->color(),
            'member_number' => $user->member_number,
            'completed_steps_count' => $completedStepsCount,
            'total_steps' => $totalSteps,
            'review_note' => $application?->review_note,
            'submitted_at' => $application?->submitted_at?->translatedFormat('d F Y, H:i'),
        ];

        // 2. Tiga pesanan belanja terbaru
        $recentOrders = $user->orders()
            ->with(['items', 'payment'])
            ->latest('id')
            ->take(3)
            ->get()
            ->map(function (Order $order) {
                return [
                    'id' => $order->id,
                    'code' => $order->code,
                    'status' => $order->status->value,
                    'status_label' => $order->status->label(),
                    'total' => (float) $order->total,
                    'items_count' => $order->items->sum('qty'),
                    'first_item_name' => $order->items->first()?->name_snapshot ?? 'Produk NSA',
                    'created_at' => $order->created_at->translatedFormat('d M Y, H:i'),
                    'payment_status' => $order->payment?->status ?? 'pending',
                ];
            });

        // 3. Ringkasan jumlah barang di keranjang
        $cartCount = $cartService->count($user, $request->session()->getId());

        // 4. Informasi kontak bantuan dari brand
        $brandSupport = [
            'phone' => Brand::supportPhone(),
            'email' => Brand::supportEmail(),
            'name' => Brand::name(),
            'short_name' => Brand::shortName(),
        ];

        return Inertia::render('Account/Dashboard', [
            'membership' => $membershipData,
            'recentOrders' => $recentOrders,
            'cartCount' => $cartCount,
            'brandSupport' => $brandSupport,
        ]);
    }
}
