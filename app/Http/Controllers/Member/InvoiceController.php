<?php

namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use App\Models\MemberInvoice;
use App\Models\MembershipFeeItem;
use App\Models\Setting;
use App\Services\Contracts\PaymentServiceInterface;
use App\Support\Brand;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InvoiceController extends Controller
{
    /**
     * Tampilkan riwayat iuran dan tagihan administrasi anggota.
     */
    public function index(Request $request): Response
    {
        $user = $request->user()->load([
            'application.invoices.items',
            'application.invoices.payments',
        ]);

        $invoices = $user->application?->invoices->sortByDesc('created_at')->values()->map(function ($inv) {
            $latestPayment = $inv->payments->last();

            return [
                'id' => $inv->id,
                'number' => $inv->number,
                'status' => $inv->status,
                'total' => (float) $inv->total,
                'due_at' => $inv->due_at?->format('d/m/Y'),
                'created_at' => $inv->created_at->format('d/m/Y'),
                'items' => $inv->items->map(fn ($it) => [
                    'id' => $it->id,
                    'name' => $it->name_snapshot,
                    'amount' => (float) $it->amount_snapshot,
                    'qty' => $it->qty,
                    'size' => $it->size,
                    'subtotal' => (float) $it->subtotal,
                ]),
                'latest_payment' => $latestPayment ? [
                    'id' => $latestPayment->id,
                    'amount' => (float) $latestPayment->amount,
                    'status' => $latestPayment->status,
                    'proof_url' => $latestPayment->proof_url,
                    'sender_name' => $latestPayment->sender_name,
                    'sender_bank' => $latestPayment->sender_bank,
                    'paid_at' => $latestPayment->paid_at?->format('d/m/Y'),
                ] : null,
            ];
        }) ?? [];

        // Aturan dan ketentuan iuran dari CMS (membership_fee_items & settings)
        $feeRules = MembershipFeeItem::where('is_active', true)->orderBy('order')->get()->map(fn ($f) => [
            'id' => $f->id,
            'code' => $f->code,
            'name' => $f->name,
            'amount' => (float) $f->amount,
            'type' => $f->type,
            'description' => $f->description,
        ]);

        $bankInfo = [
            'bank_name' => Setting::get('bank_name', 'Bank Mandiri'),
            'bank_account_number' => Setting::get('bank_account_number', '123-00-9876543-2'),
            'bank_account_holder' => Setting::get('bank_account_holder', 'Perkumpulan '.Brand::shortName().' Indonesia'),
        ];

        return Inertia::render('Member/Invoices', [
            'invoices' => $invoices,
            'feeRules' => $feeRules,
            'bankInfo' => $bankInfo,
        ]);
    }

    /**
     * Unggah bukti bayar untuk tagihan tertentu.
     */
    public function uploadProof(MemberInvoice $invoice, Request $request, PaymentServiceInterface $paymentService): RedirectResponse
    {
        $user = $request->user();

        // Validasi kepemilikan tagihan
        if ($invoice->application?->user_id !== $user->id) {
            abort(403, 'Akses ditolak.');
        }

        $request->validate([
            'proof' => ['required_without:proof_file', 'nullable', 'file', 'mimes:jpg,jpeg,png,pdf,webp', 'max:3072'],
            'proof_file' => ['required_without:proof', 'nullable', 'file', 'mimes:jpg,jpeg,png,pdf,webp', 'max:3072'],
            'sender_name' => ['required', 'string', 'max:100'],
            'payment_date' => ['required_without:paid_at', 'nullable', 'date'],
            'paid_at' => ['required_without:payment_date', 'nullable', 'date'],
            'sender_bank' => ['nullable', 'string', 'max:50'],
            'notes' => ['nullable', 'string', 'max:250'],
        ]);

        $file = $request->file('proof') ?? $request->file('proof_file');
        $paymentService->uploadProof($invoice, $file, [
            'sender_name' => $request->input('sender_name'),
            'sender_bank' => $request->input('sender_bank'),
            'paid_at' => $request->input('payment_date') ?? $request->input('paid_at'),
            'notes' => $request->input('notes'),
        ]);

        return back()->with('success', "Bukti pembayaran tagihan #{$invoice->number} berhasil diunggah.");
    }

    /**
     * Tampilkan kuitansi sederhana resmi NSA.
     */
    public function receipt(MemberInvoice $invoice, Request $request): Response
    {
        $user = $request->user();

        if ($invoice->application?->user_id !== $user->id) {
            abort(403, 'Akses ditolak.');
        }

        $invoice->load(['items', 'payments']);

        return Inertia::render('Member/Receipt', [
            'invoice' => [
                'id' => $invoice->id,
                'number' => $invoice->number,
                'status' => $invoice->status,
                'total' => (float) $invoice->total,
                'created_at' => $invoice->created_at->format('d F Y'),
                'due_at' => $invoice->due_at?->format('d F Y'),
                'items' => $invoice->items->map(fn ($it) => [
                    'id' => $it->id,
                    'name' => $it->name_snapshot,
                    'amount' => (float) $it->amount_snapshot,
                    'qty' => $it->qty,
                    'size' => $it->size,
                    'subtotal' => (float) $it->subtotal,
                ]),
                'member' => [
                    'name' => $user->name,
                    'member_number' => $user->member_number,
                    'email' => $user->email,
                    'phone' => $user->phone,
                ],
                'brand' => [
                    'name' => Brand::name(),
                    'short_name' => Brand::shortName(),
                    'domain' => Brand::domain(),
                    'support_email' => Brand::supportEmail(),
                ],
            ],
        ]);
    }
}
