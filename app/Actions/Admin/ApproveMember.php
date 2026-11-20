<?php

namespace App\Actions\Admin;

use App\Enums\MembershipStatus;
use App\Mail\MemberApprovedMail;
use App\Models\ActivityLog;
use App\Models\MemberReviewLog;
use App\Models\User;
use App\Services\StatisticService;
use App\Support\Brand;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class ApproveMember
{
    public function __construct(
        protected StatisticService $statisticService
    ) {}

    /**
     * Setujui pendaftaran anggota: buat nomor anggota otomatis (format {brand}-YYYY-00001),
     * status approved, perbarui application, log keputusan, bersihkan cache statistik,
     * dan kirim email konfirmasi ke pemohon.
     */
    public function execute(User $user, User $admin, ?string $note = null): User
    {
        return DB::transaction(function () use ($user, $admin, $note) {
            $memberNumber = $this->generateMemberNumber();

            // Update user model
            $user->update([
                'membership_status' => MembershipStatus::Approved,
                'member_number' => $memberNumber,
                'verification_token' => $user->verification_token ?: bin2hex(random_bytes(16)),
            ]);

            // Update member_applications jika ada
            if ($user->application) {
                $user->application->update([
                    'status' => MembershipStatus::Approved,
                    'approved_at' => now(),
                    'member_number' => $memberNumber,
                ]);

                // Tandai invoice dan payment sebagai paid/confirmed
                $invoice = $user->application->invoices()->where('status', '!=', 'rejected')->latest()->first();
                if ($invoice) {
                    $invoice->update(['status' => 'paid']);
                    $payment = $invoice->payments()->latest()->first();
                    if ($payment) {
                        $payment->update([
                            'status' => 'confirmed',
                            'confirmed_by' => $admin->id,
                            'confirmed_at' => now(),
                        ]);
                    }
                }
            }

            // Catat log keputusan verifikasi
            MemberReviewLog::create([
                'user_id' => $user->id,
                'admin_id' => $admin->id,
                'action' => 'approved',
                'note' => $note ?? 'Pendaftaran anggota telah disetujui.',
            ]);

            ActivityLog::log(
                action: 'approve_member',
                subject: "Anggota #{$user->id} ({$user->name}) disetujui dengan NTA: {$memberNumber}",
                meta: [
                    'member_id' => $user->id,
                    'member_number' => $memberNumber,
                    'note' => $note,
                ],
                userId: $admin->id,
            );

            // Bersihkan cache statistik agar data komoditas anggota langsung terintegrasi
            $this->statisticService->clearCache();

            // Kirim email notifikasi persetujuan
            try {
                Mail::to($user->email)->send(new MemberApprovedMail($user));
            } catch (\Throwable $e) {
                report($e);
            }

            return $user->fresh();
        });
    }

    /**
     * Buat nomor anggota unik berformat {brand}-YYYY-00001
     */
    public function generateMemberNumber(): string
    {
        $year = now()->format('Y');
        $shortName = Brand::shortName();
        $prefix = "{$shortName}-{$year}-";

        // Hitung urutan berdasarkan nomor yang sudah ada pada tahun berjalan dengan pessimistic lock
        $lastNumber = User::where('member_number', 'like', "{$prefix}%")
            ->lockForUpdate()
            ->orderByDesc('member_number')
            ->value('member_number');

        if ($lastNumber && preg_match('/^[A-Z0-9]+-'.preg_quote($year, '/').'-(\d{5})$/', $lastNumber, $matches)) {
            $nextSeq = (int) $matches[1] + 1;
        } else {
            $nextSeq = 1;
        }

        $candidate = $prefix.str_pad((string) $nextSeq, 5, '0', STR_PAD_LEFT);

        while (User::where('member_number', $candidate)->exists()) {
            $nextSeq++;
            $candidate = $prefix.str_pad((string) $nextSeq, 5, '0', STR_PAD_LEFT);
        }

        return $candidate;
    }
}
