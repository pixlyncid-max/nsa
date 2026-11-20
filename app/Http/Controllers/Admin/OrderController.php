<?php

namespace App\Http\Controllers\Admin;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Order;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class OrderController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Order::query()->with(['user', 'payment']);

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($uq) use ($search) {
                        $uq->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            });
        }

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        $sort = $request->input('sort', 'newest');
        match ($sort) {
            'oldest' => $query->oldest(),
            'total_desc' => $query->orderBy('total', 'desc'),
            'total_asc' => $query->orderBy('total', 'asc'),
            default => $query->latest(),
        };

        $orders = $query->paginate(15)->withQueryString()->through(function ($o) {
            return [
                'id' => $o->id,
                'code' => $o->code,
                'user_name' => $o->user?->name ?? 'Tamu',
                'user_email' => $o->user?->email,
                'status' => $o->status instanceof OrderStatus ? $o->status->value : (string) $o->status,
                'subtotal' => (float) $o->subtotal,
                'shipping_cost' => (float) $o->shipping_cost,
                'total' => (float) $o->total,
                'payment_status' => $o->payment?->status ?? 'unpaid',
                'payment_method' => $o->payment?->method ?? '-',
                'has_proof' => ! empty($o->payment?->proof_path),
                'created_at' => $o->created_at?->format('d/m/Y H:i'),
            ];
        });

        return Inertia::render('Admin/Orders/Index', [
            'orders' => $orders,
            'filters' => $request->only(['search', 'status', 'sort']),
            'statusOptions' => [
                ['value' => 'pending_payment', 'label' => 'Menunggu Pembayaran'],
                ['value' => 'paid', 'label' => 'Sudah Dibayar'],
                ['value' => 'processing', 'label' => 'Diproses'],
                ['value' => 'shipped', 'label' => 'Dikirim'],
                ['value' => 'completed', 'label' => 'Selesai'],
                ['value' => 'cancelled', 'label' => 'Dibatalkan'],
            ],
        ]);
    }

    public function show(Order $order): Response
    {
        $order->load(['user', 'items.product.images', 'payment.confirmedByUser']);

        $proofUrl = null;
        if ($order->payment?->proof_path) {
            $proofUrl = Storage::url($order->payment->proof_path);
        }

        return Inertia::render('Admin/Orders/Show', [
            'order' => [
                'id' => $order->id,
                'code' => $order->code,
                'status' => $order->status instanceof OrderStatus ? $order->status->value : (string) $order->status,
                'subtotal' => (float) $order->subtotal,
                'shipping_cost' => (float) $order->shipping_cost,
                'total' => (float) $order->total,
                'address' => $order->address,
                'note' => $order->note,
                'created_at' => $order->created_at?->format('d/m/Y H:i'),
                'user' => $order->user ? [
                    'id' => $order->user->id,
                    'name' => $order->user->name,
                    'email' => $order->user->email,
                    'phone' => $order->user->phone,
                ] : null,
                'items' => $order->items->map(fn ($item) => [
                    'id' => $item->id,
                    'product_name' => $item->product?->name ?? 'Produk Dihapus',
                    'product_slug' => $item->product?->slug,
                    'product_image' => $item->product?->images->first()?->path ? Storage::url($item->product->images->first()->path) : null,
                    'quantity' => $item->quantity,
                    'unit_price' => (float) $item->unit_price,
                    'subtotal' => (float) $item->subtotal,
                ]),
                'payment' => $order->payment ? [
                    'id' => $order->payment->id,
                    'method' => $order->payment->method,
                    'amount' => (float) $order->payment->amount,
                    'status' => $order->payment->status,
                    'proof_url' => $proofUrl,
                    'confirmed_at' => $order->payment->confirmed_at?->format('d/m/Y H:i'),
                    'confirmed_by' => $order->payment->confirmedByUser?->name,
                ] : null,
            ],
            'statusOptions' => [
                ['value' => 'pending_payment', 'label' => 'Menunggu Pembayaran'],
                ['value' => 'paid', 'label' => 'Sudah Dibayar'],
                ['value' => 'processing', 'label' => 'Diproses'],
                ['value' => 'shipped', 'label' => 'Dikirim'],
                ['value' => 'completed', 'label' => 'Selesai'],
                ['value' => 'cancelled', 'label' => 'Dibatalkan'],
            ],
        ]);
    }

    public function confirmPayment(Order $order, Request $request): RedirectResponse
    {
        if (! $order->payment) {
            return back()->with('error', 'Pesanan tidak memiliki data pembayaran.');
        }

        $order->payment->update([
            'status' => 'confirmed',
            'confirmed_by' => $request->user()->id,
            'confirmed_at' => now(),
        ]);

        $order->update([
            'status' => OrderStatus::Paid,
        ]);

        ActivityLog::log(
            action: 'confirm_order_payment',
            subject: "Konfirmasi pembayaran untuk pesanan #{$order->code}",
            meta: ['order_code' => $order->code, 'amount' => $order->total],
            userId: $request->user()->id,
        );

        return back()->with('success', "Pembayaran pesanan {$order->code} berhasil dikonfirmasi.");
    }

    public function updateStatus(Order $order, Request $request): RedirectResponse
    {
        $request->validate([
            'status' => ['required', 'in:pending_payment,paid,processing,shipped,completed,cancelled'],
        ]);

        $oldStatus = $order->status instanceof OrderStatus ? $order->status->value : (string) $order->status;
        $newStatus = $request->input('status');

        $order->update([
            'status' => $newStatus,
        ]);

        ActivityLog::log(
            action: 'update_order_status',
            subject: "Status pesanan #{$order->code} diubah dari {$oldStatus} ke {$newStatus}",
            meta: ['order_code' => $order->code, 'from' => $oldStatus, 'to' => $newStatus],
            userId: $request->user()->id,
        );

        return back()->with('success', "Status pesanan {$order->code} berhasil diperbarui.");
    }

    public function exportCsv(Request $request): StreamedResponse
    {
        $shortCode = strtolower(config('brand.short_name') ?? 'nsa');
        $filename = "pesanan-{$shortCode}-".now()->format('Y-m-d-His').'.csv';

        $query = Order::query()->with('user');

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                    ->orWhereHas('user', fn ($uq) => $uq->where('name', 'like', "%{$search}%"));
            });
        }

        return response()->streamDownload(function () use ($query) {
            $handle = fopen('php://output', 'w');
            fwrite($handle, "\xEF\xBB\xBF");

            fputcsv($handle, [
                'Kode Pesanan',
                'Nama Pembeli',
                'Email',
                'Subtotal (Rp)',
                'Ongkos Kirim (Rp)',
                'Total (Rp)',
                'Status Pesanan',
                'Tanggal Pemesanan',
            ]);

            $query->chunk(200, function ($orders) use ($handle) {
                foreach ($orders as $o) {
                    $statusVal = $o->status instanceof OrderStatus ? $o->status->value : (string) $o->status;
                    fputcsv($handle, [
                        $o->code,
                        $o->user?->name ?? 'Tamu',
                        $o->user?->email ?? '-',
                        $o->subtotal,
                        $o->shipping_cost,
                        $o->total,
                        $statusVal,
                        $o->created_at?->format('Y-m-d H:i:s'),
                    ]);
                }
            });

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }
}
