<?php

namespace App\Policies;

use App\Models\MemberDocument;
use App\Models\User;

class MemberDocumentPolicy
{
    /**
     * Tentukan apakah pengguna dapat melihat berkas dokumen.
     */
    public function view(User $user, MemberDocument $document): bool
    {
        // Admin dan Superadmin selalu diizinkan melihat semua dokumen verifikasi
        if ($user->isStaff()) {
            return true;
        }

        // Pengguna hanya diizinkan melihat dokumen miliknya sendiri
        return $document->user_id === $user->id;
    }
}
