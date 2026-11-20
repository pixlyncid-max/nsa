<?php

namespace App\Http\Controllers\Account;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SettingController extends Controller
{
    /**
     * Tampilkan halaman pengaturan akun & preferensi pengguna.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();

        // Ambil preferensi notifikasi dari session atau nilai default
        $preferences = [
            'notify_orders' => (bool) ($request->session()->get("pref_{$user->id}_notify_orders", true)),
            'notify_membership' => (bool) ($request->session()->get("pref_{$user->id}_notify_membership", true)),
            'notify_programs' => (bool) ($request->session()->get("pref_{$user->id}_notify_programs", true)),
        ];

        return Inertia::render('Account/Settings', [
            'preferences' => $preferences,
        ]);
    }

    /**
     * Simpan perubahan preferensi pengguna.
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'notify_orders' => ['boolean'],
            'notify_membership' => ['boolean'],
            'notify_programs' => ['boolean'],
        ]);

        $user = $request->user();
        foreach ($validated as $key => $val) {
            $request->session()->put("pref_{$user->id}_{$key}", (bool) $val);
        }

        return back()->with('success', 'Pengaturan akun berhasil disimpan.');
    }
}
