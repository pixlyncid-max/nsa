<?php

namespace App\Http\Controllers\Auth;

use App\Actions\ResolveHomeRoute;
use App\Enums\MembershipStatus;
use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Mail\WelcomeUserMail;
use App\Models\User;
use App\Support\Brand;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:'.User::class],
            'phone' => ['nullable', 'string', 'max:30'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'password' => Hash::make($request->password),
            'role' => Role::User,
            'membership_status' => MembershipStatus::NonMember,
        ]);

        event(new Registered($user));

        try {
            Mail::to($user->email)->send(new WelcomeUserMail($user));
        } catch (\Throwable $e) {
            report($e);
        }

        Auth::login($user);

        $targetUrl = app(ResolveHomeRoute::class)->execute($user, 'signup');
        $brandShort = Brand::shortName() ?? 'NSA';

        return redirect()->intended($targetUrl)->with('success', "Akun berhasil dibuat. Selamat datang di {$brandShort}.");
    }
}
