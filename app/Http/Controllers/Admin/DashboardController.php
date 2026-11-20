<?php

namespace App\Http\Controllers\Admin;

use App\Enums\MembershipStatus;
use App\Enums\OrderStatus;
use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Models\ContentTranslation;
use App\Models\Order;
use App\Models\Product;
use App\Models\Setting;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        // 4 Kartu Ringkasan
        $totalApprovedMembers = User::where('membership_status', MembershipStatus::Approved)->count();
        $totalPendingMembers = User::whereIn('membership_status', [
            MembershipStatus::PendingReview,
            MembershipStatus::AwaitingPayment,
            MembershipStatus::PendingApproval,
        ])->count();
        $totalRevenue = (float) Order::whereIn('status', [OrderStatus::Paid, OrderStatus::Processing, OrderStatus::Shipped, OrderStatus::Completed])->sum('total');
        $pendingConfirmationOrders = Order::where('status', OrderStatus::PendingPayment)->has('payment')->count();

        // Grafik Pertumbuhan Pendaftaran Anggota (6 bulan terakhir)
        $registrationChart = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = Carbon::now()->subMonths($i);
            $start = $month->copy()->startOfMonth();
            $end = $month->copy()->endOfMonth();

            $count = User::whereBetween('created_at', [$start, $end])->count();
            $approved = User::where('membership_status', MembershipStatus::Approved)
                ->whereBetween('updated_at', [$start, $end])
                ->count();

            $registrationChart[] = [
                'month' => $month->translatedFormat('M Y'),
                'total' => $count,
                'approved' => $approved,
            ];
        }

        // Daftar Perlu Tindakan: Anggota Menunggu Verifikasi/Persetujuan
        $pendingMembers = User::whereIn('membership_status', [
            MembershipStatus::PendingReview,
            MembershipStatus::AwaitingPayment,
            MembershipStatus::PendingApproval,
        ])
            ->with(['profile.province', 'business.province'])
            ->latest()
            ->take(6)
            ->get()
            ->map(function ($u) {
                return [
                    'id' => $u->id,
                    'name' => $u->name,
                    'email' => $u->email,
                    'phone' => $u->phone,
                    'province' => $u->business?->province?->name ?? $u->profile?->province?->name ?? '-',
                    'created_at' => $u->created_at?->format('d/m/Y H:i'),
                ];
            });

        // Daftar Perlu Tindakan: Pesanan Menunggu Konfirmasi Bayar
        $pendingOrders = Order::where('status', OrderStatus::PendingPayment)
            ->has('payment')
            ->with(['user', 'payment'])
            ->latest()
            ->take(6)
            ->get()
            ->map(function ($o) {
                return [
                    'id' => $o->id,
                    'code' => $o->code,
                    'user_name' => $o->user?->name ?? 'Tamu',
                    'total' => (float) $o->total,
                    'payment_method' => $o->payment?->method ?? 'Transfer Bank',
                    'proof_path' => $o->payment?->proof_path,
                    'created_at' => $o->created_at?->format('d/m/Y H:i'),
                ];
            });

        $translationAlert = null;
        if ($request->user()?->role === Role::Superadmin) {
            $failedTranslations = ContentTranslation::query()
                ->where('status', ContentTranslation::STATUS_FAILED)
                ->count();
            $threshold = (int) Setting::get('translation.failed_alert_threshold', '5');
            if ($failedTranslations >= $threshold) {
                $translationAlert = [
                    'failedCount' => $failedTranslations,
                    'threshold' => $threshold,
                ];
            }
        }

        return Inertia::render('Admin/Dashboard', [
            'metrics' => [
                'approved_members' => $totalApprovedMembers,
                'pending_members' => $totalPendingMembers,
                'total_revenue' => $totalRevenue,
                'pending_orders' => $pendingConfirmationOrders,
                'total_products' => Product::count(),
            ],
            'chart' => $registrationChart,
            'pendingMembers' => $pendingMembers,
            'pendingOrders' => $pendingOrders,
            'translationAlert' => $translationAlert,
        ]);
    }
}
