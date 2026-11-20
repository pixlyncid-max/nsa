<?php

namespace App\Http\Controllers\Auth;

use App\Actions\ResolveHomeRoute;
use App\Http\Controllers\Controller;
use App\Support\Brand;
use Illuminate\Auth\Events\Verified;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\RedirectResponse;

class VerifyEmailController extends Controller
{
    /**
     * Mark the authenticated user's email address as verified.
     */
    public function __invoke(EmailVerificationRequest $request, ResolveHomeRoute $resolveHomeRoute): RedirectResponse
    {
        $user = $request->user();
        $target = $resolveHomeRoute->execute($user, 'signup');
        $brandShort = Brand::shortName() ?? 'NSA';

        if ($user->hasVerifiedEmail()) {
            return redirect()->intended($target);
        }

        if ($user->markEmailAsVerified()) {
            event(new Verified($user));
        }

        return redirect()->intended($target)->with('success', "Akun berhasil diverifikasi. Selamat datang di {$brandShort}.");
    }
}
