<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class LocaleController extends Controller
{
    public function update(Request $request): JsonResponse|RedirectResponse
    {
        $supported = (array) config('locales.supported', ['id', 'en']);

        $validated = $request->validate([
            'locale' => ['required', 'string', Rule::in($supported)],
        ]);

        $locale = $validated['locale'];

        if ($user = $request->user()) {
            $user->forceFill(['locale' => $locale])->save();
        }

        $cookie = cookie(
            name: (string) config('locales.cookie_name', 'locale'),
            value: $locale,
            minutes: (int) config('locales.cookie_minutes', 60 * 24 * 365),
            path: '/',
            httpOnly: false,
            sameSite: 'lax',
        );

        if ($request->wantsJson()) {
            return response()
                ->json(['locale' => $locale])
                ->withCookie($cookie);
        }

        return back()->withCookie($cookie);
    }
}
