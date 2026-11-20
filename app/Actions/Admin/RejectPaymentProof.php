<?php

namespace App\Actions\Admin;

use App\Enums\MembershipStatus;
use App\Mail\PaymentProofRejectedMail;
use App\Models\ActivityLog;
use App\Models\MemberReviewLog;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class RejectPaymentProof
{
    /**
     * Tolak bukti transfer pembayaran yang diunggah pengguna:
     * Ubah status invoice ke unpaid, status user & application kembali ke awaiting_payment,
     * catat log penolakan, dan kirim email pemberitahuan ke pemohon.
     */
    public function execute(User $user, User $admin, string $reason): User
    {
        return DB::transaction(function () use ($user, $admin, $reason) {
            $user->update([
                'membership_status' => MembershipStatus::AwaitingPayment,
            ]);

            $application = $user->application;
            if ($application) {
                $application->update([
                    'status' => MembershipStatus::AwaitingPayment,
                ]);

                $invoice = $application->invoices()->where('status', '!=', 'rejected')->latest()->first();
                if ($invoice) {
                    $invoice->update(['status' => 'unpaid']);

                    $payment = $invoice->payments()->latest()->first();
                    if ($payment) {
                        $payment->update([
                            'status' => 'rejected',
                            'notes' => $reason,
                        ]);
                    }
                }
            }

            $logNote = "Bukti pembayaran ditolak: {$reason}. Harap unggah ulang bukti transfer yang sah.";

            MemberReviewLog::create([
                'user_id' => $user->id,
                'admin_id' => $admin->id,
                'action' => 'payment_rejected',
                'note' => $logNote,
            ]);

            ActivityLog::log(
                action: 'reject_payment_proof',
                subject: "Penolakan bukti transfer pembayaran pendaftaran #{$user->id} ({$user->name})",
                meta: [
                    'member_id' => $user->id,
                    'reason' => $reason,
                ],
                userId: $admin->id,
            );

            try {
                Mail::to($user->email)->send(new PaymentProofRejectedMail($user, $reason));
            } catch (\Throwable $e) {
                report($e);
            }

            return $user->fresh();
        });
    }
}
