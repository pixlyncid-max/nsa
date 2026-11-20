<?php

namespace App\Actions\Admin;

use App\Enums\MembershipStatus;
use App\Mail\MemberRejectedMail;
use App\Models\ActivityLog;
use App\Models\MemberReviewLog;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class RejectMember
{
    /**
     * Tolak pendaftaran anggota dengan alasan wajib.
     */
    public function execute(User $user, User $admin, string $reason): User
    {
        return DB::transaction(function () use ($user, $admin, $reason) {
            $user->update([
                'membership_status' => MembershipStatus::Rejected,
            ]);

            if ($user->application) {
                $user->application->update([
                    'status' => MembershipStatus::Rejected,
                    'review_note' => $reason,
                ]);
            }

            MemberReviewLog::create([
                'user_id' => $user->id,
                'admin_id' => $admin->id,
                'action' => 'rejected',
                'note' => $reason,
            ]);

            ActivityLog::log(
                action: 'reject_member',
                subject: "Penolakan pendaftaran anggota #{$user->id} ({$user->name})",
                meta: [
                    'member_id' => $user->id,
                    'reason' => $reason,
                ],
                userId: $admin->id,
            );

            try {
                Mail::to($user->email)->send(new MemberRejectedMail($user, $reason));
            } catch (\Throwable $e) {
                report($e);
            }

            return $user->fresh();
        });
    }
}
