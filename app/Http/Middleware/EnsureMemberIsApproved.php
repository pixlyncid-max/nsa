<?php

namespace App\Http\Middleware;

use App\Enums\MembershipStatus;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureMemberIsApproved
{
    /**
     * Pastikan pengguna memiliki status keanggotaan approved untuk mengakses area /anggota/*.
     * User yang belum disetujui dialihkan ke /akun dengan pesan informasi toast.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            return redirect()->guest(route('login'));
        }

        if ($user->membership_status !== MembershipStatus::Approved) {
            return redirect()->to('/akun')->with('error', 'Fitur ini khusus anggota');
        }

        return $next($request);
    }
}
