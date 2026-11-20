<?php

namespace App\Services\Contracts;

use App\Models\MemberInvoice;
use App\Models\Order;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Http\UploadedFile;

interface PaymentServiceInterface
{
    /**
     * Buat entri pembayaran baru untuk pesanan atau tagihan keanggotaan.
     */
    public function createPayment(Order|MemberInvoice $payable, string $method = 'manual_transfer'): Payment;

    /**
     * Unggah bukti transfer pembayaran.
     *
     * @param  array<string, mixed>  $metadata
     */
    public function uploadProof(Order|MemberInvoice $payable, UploadedFile $file, array $metadata = []): Payment;

    /**
     * Konfirmasi pembayaran oleh staf admin.
     */
    public function confirmPayment(Payment $payment, ?User $confirmedBy = null): void;

    /**
     * Dapatkan instruksi pembayaran dan informasi rekening resmi.
     *
     * @return array<string, mixed>
     */
    public function getPaymentInstructions(Order|MemberInvoice $payable): array;
}
