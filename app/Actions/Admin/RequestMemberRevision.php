<?php

namespace App\Actions\Admin;

use App\Enums\MembershipStatus;
use App\Mail\MemberRevisionRequestedMail;
use App\Models\ActivityLog;
use App\Models\MemberReviewLog;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class RequestMemberRevision
{
    /**
     * Minta perbaikan berkas pendaftaran dengan catatan per bagian.
     *
     * @param  array<string, string>|string  $notes
     */
    public function execute(User $user, User $admin, array|string $notes): User
    {
        return DB::transaction(function () use ($user, $admin, $notes) {
            $user->update([
                'membership_status' => MembershipStatus::Revision,
            ]);

            $noteString = is_array($notes)
                ? (isset($notes['note']) ? (string) $notes['note'] : (isset($notes['general']) ? (string) $notes['general'] : json_encode($notes, JSON_UNESCAPED_UNICODE)))
                : (string) $notes;

            if (is_array($notes) && ! empty($notes['sections'])) {
                $secText = implode(', ', (array) $notes['sections']);
                $msg = $notes['note'] ?? $notes['general'] ?? '';
                $noteString = "Bagian yang perlu diperbaiki: [{$secText}]. ".($msg ? "Catatan: {$msg}" : '');
            }

            if ($user->application) {
                $user->application->update([
                    'status' => MembershipStatus::Revision,
                    'review_note' => $noteString,
                ]);
            }

            MemberReviewLog::create([
                'user_id' => $user->id,
                'admin_id' => $admin->id,
                'action' => 'revision',
                'note' => $noteString,
            ]);

            ActivityLog::log(
                action: 'request_revision',
                subject: "Permintaan revisi berkas pendaftaran #{$user->id} ({$user->name})",
                meta: [
                    'member_id' => $user->id,
                    'notes' => $notes,
                ],
                userId: $admin->id,
            );

            try {
                Mail::to($user->email)->send(new MemberRevisionRequestedMail($user, $notes));
            } catch (\Throwable $e) {
                report($e);
            }

            return $user->fresh();
        });
    }
}
