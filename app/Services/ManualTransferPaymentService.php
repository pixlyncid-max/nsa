<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Models\MemberInvoice;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Setting;
use App\Models\User;
use App\Services\Contracts\PaymentServiceInterface;
use App\Support\Brand;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class ManualTransferPaymentService implements PaymentServiceInterface
{
    /**
     * Buat pembayaran transfer manual untuk pesanan atau tagihan keanggotaan.
     */
    public function createPayment(Order|MemberInvoice $payable, string $method = 'manual_transfer'): Payment
    {
        $orderId = $payable instanceof Order ? $payable->id : null;

        return Payment::updateOrCreate(
            [
                'payable_type' => get_class($payable),
                'payable_id' => $payable->id,
            ],
            [
                'order_id' => $orderId,
                'method' => $method,
                'amount' => (float) $payable->total,
                'status' => 'pending',
            ]
        );
    }

    /**
     * Unggah bukti transfer pembayaran.
     *
     * @param  array<string, mixed>  $metadata
     */
    public function uploadProof(Order|MemberInvoice $payable, UploadedFile $file, array $metadata = []): Payment
    {
        $allowedExtensions = ['jpg', 'jpeg', 'png', 'pdf', 'webp'];
        $ext = strtolower($file->getClientOriginalExtension());
        if (! in_array($ext, $allowedExtensions, true)) {
            throw ValidationException::withMessages([
                'proof' => 'Format berkas bukti pembayaran harus berupa JPG, PNG, WEBP, atau PDF.',
            ]);
        }

        if ($file->getSize() > 3 * 1024 * 1024) {
            throw ValidationException::withMessages([
                'proof' => 'Ukuran berkas bukti pembayaran maksimal 3 MB.',
            ]);
        }

        $folder = $payable instanceof MemberInvoice
            ? "payment_proofs/invoices/{$payable->id}"
            : "payment_proofs/orders/{$payable->id}";

        $path = $file->store($folder, 'public');

        $orderId = $payable instanceof Order ? $payable->id : null;

        $payment = Payment::firstOrCreate(
            [
                'payable_type' => get_class($payable),
                'payable_id' => $payable->id,
            ],
            [
                'order_id' => $orderId,
                'method' => 'manual_transfer',
                'amount' => (float) $payable->total,
                'status' => 'pending',
            ]
        );

        // Hapus file lama jika ada
        if ($payment->proof_path && Storage::disk('public')->exists($payment->proof_path)) {
            Storage::disk('public')->delete($payment->proof_path);
        }

        $updateData = [
            'proof_path' => $path,
            'status' => 'pending',
            'sender_name' => $metadata['sender_name'] ?? $payment->sender_name,
            'sender_bank' => $metadata['sender_bank'] ?? $payment->sender_bank,
            'paid_at' => $metadata['paid_at'] ?? now()->toDateString(),
            'notes' => $metadata['notes'] ?? $payment->notes,
        ];

        $payment->update($updateData);

        if ($payable instanceof MemberInvoice) {
            $payable->update([
                'status' => 'waiting_confirmation',
            ]);
        }

        return $payment;
    }

    /**
     * Konfirmasi pembayaran oleh staf/admin.
     */
    public function confirmPayment(Payment $payment, ?User $confirmedBy = null): void
    {
        $payment->update([
            'status' => 'confirmed',
            'confirmed_by' => $confirmedBy?->id,
            'confirmed_at' => now(),
        ]);

        if ($payment->payable instanceof Order) {
            $payment->payable->update([
                'status' => OrderStatus::Paid,
            ]);
        } elseif ($payment->payable instanceof MemberInvoice) {
            $payment->payable->update([
                'status' => 'paid',
            ]);
        } elseif ($payment->order) {
            $payment->order->update([
                'status' => OrderStatus::Paid,
            ]);
        }
    }

    /**
     * Dapatkan instruksi pembayaran dan rekening resmi asosiasi.
     *
     * @return array<string, mixed>
     */
    public function getPaymentInstructions(Order|MemberInvoice $payable): array
    {
        $code = $payable instanceof Order ? $payable->code : $payable->number;

        return [
            'method' => 'manual_transfer',
            'method_name' => 'Transfer Bank Manual',
            'bank_name' => Setting::get('bank_name', 'Bank Mandiri'),
            'bank_account_number' => Setting::get('bank_account_number', '123-00-9876543-2'),
            'bank_account_holder' => Setting::get('bank_account_holder', 'Perkumpulan '.Brand::shortName().' Indonesia'),
            'amount' => (float) $payable->total,
            'code' => $code,
            'due_at' => $payable instanceof MemberInvoice ? $payable->due_at?->translatedFormat('d F Y, H:i') : null,
        ];
    }
}
