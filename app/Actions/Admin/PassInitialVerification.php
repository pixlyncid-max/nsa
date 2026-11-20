<?php

namespace App\Actions\Admin;

use App\Enums\MembershipStatus;
use App\Mail\MemberInitialVerifiedMail;
use App\Models\ActivityLog;
use App\Models\MemberInvoice;
use App\Models\MemberReviewLog;
use App\Models\MembershipFeeItem;
use App\Models\User;
use App\Support\Brand;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class PassInitialVerification
{
    /**
     * Loloskan verifikasi awal pendaftaran anggota:
     * Ubah status ke awaiting_payment, terbitkan invoice resmi, catat log, dan kirim email instruksi pembayaran.
     */
    public function execute(User $user, User $admin, ?string $note = null): User
    {
        return DB::transaction(function () use ($user, $admin, $note) {
            $user->update([
                'membership_status' => MembershipStatus::AwaitingPayment,
            ]);

            $application = $user->application;
            if ($application) {
                $application->update([
                    'status' => MembershipStatus::AwaitingPayment,
                ]);

                // Pastikan invoice resmi diterbitkan
                $invoice = $application->invoices()->where('status', '!=', 'rejected')->latest()->first();

                if (! $invoice) {
                    $invoice = MemberInvoice::create([
                        'application_id' => $application->id,
                        'number' => 'INV-NSA-'.date('Ym').'-'.str_pad((string) $application->id, 5, '0', STR_PAD_LEFT),
                        'status' => 'unpaid',
                        'due_at' => now()->addDays(14),
                        'total' => 0,
                    ]);

                    // Tambahkan item biaya standar jika belum ada item
                    $feeItems = MembershipFeeItem::where('is_active', true)
                        ->whereIn('type', ['required', 'recurring'])
                        ->get();

                    $total = 0;
                    foreach ($feeItems as $fee) {
                        $amt = (float) $fee->amount;
                        $total += $amt;
                        $invoice->items()->create([
                            'fee_item_id' => $fee->id,
                            'name_snapshot' => $fee->name,
                            'amount_snapshot' => $amt,
                            'qty' => 1,
                        ]);
                    }
                    $invoice->update(['total' => $total]);
                } else {
                    $invoice->update([
                        'status' => 'unpaid',
                        'due_at' => $invoice->due_at ?? now()->addDays(14),
                    ]);
                }
            } else {
                $invoice = null;
            }

            $logNote = $note ?? ('Verifikasi awal berkas lolos. Menunggu penyelesaian pembayaran administrasi keanggotaan '.Brand::shortName().'.');

            MemberReviewLog::create([
                'user_id' => $user->id,
                'admin_id' => $admin->id,
                'action' => 'initial_verified',
                'note' => $logNote,
            ]);

            ActivityLog::log(
                action: 'initial_verify_member',
                subject: "Verifikasi awal pendaftaran #{$user->id} ({$user->name}) disetujui",
                meta: [
                    'member_id' => $user->id,
                    'invoice_id' => $invoice?->id,
                    'note' => $note,
                ],
                userId: $admin->id,
            );

            try {
                Mail::to($user->email)->send(new MemberInitialVerifiedMail($user, $invoice));
            } catch (\Throwable $e) {
                report($e);
            }

            return $user->fresh();
        });
    }
}
