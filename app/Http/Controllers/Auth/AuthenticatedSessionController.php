<?php

namespace App\Http\Controllers\Auth;

use App\Actions\ResolveHomeRoute;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Services\CartService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request, ResolveHomeRoute $resolveHomeRoute): RedirectResponse
    {
        $guestSessionId = $request->session()->getId();

        $request->authenticate();

        if ($request->user()) {
            app(CartService::class)->mergeGuestCart($request->user(), $guestSessionId);
        }

        $request->session()->regenerate();

        $user = $request->user();
        $targetUrl = $resolveHomeRoute->execute($user);

        return redirect()
            ->intended($targetUrl)
            ->with('success', "Selamat datang kembali, {$user->name}.");
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
