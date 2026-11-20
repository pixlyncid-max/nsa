<?php

namespace App\Http\Controllers\Account;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Tampilkan formulir profil pengguna & pengaturan kata sandi.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('Account/Profile', [
            'profile' => [
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone ?? '',
                'avatar' => $user->avatar,
                'membership_status' => $user->membership_status->value,
                'member_number' => $user->member_number,
            ],
        ]);
    }

    /**
     * Perbarui data profil pengguna (nama, telepon, foto/avatar).
     */
    public function update(Request $request): RedirectResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'avatar' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
        ], [
            'name.required' => 'Nama lengkap wajib diisi.',
            'avatar.image' => 'Berkas foto profil harus berupa gambar.',
            'avatar.max' => 'Ukuran foto profil maksimal 2MB.',
        ]);

        $user->name = $validated['name'];
        $user->phone = $validated['phone'] ?? null;

        if ($request->hasFile('avatar')) {
            // Hapus avatar lama jika ada di disk public
            if ($user->getRawOriginal('avatar') && Storage::disk('public')->exists($user->getRawOriginal('avatar'))) {
                Storage::disk('public')->delete($user->getRawOriginal('avatar'));
            }

            $path = $request->file('avatar')->store("avatars/{$user->id}", 'public');
            $user->avatar = $path;
        }

        $user->save();

        return back()->with('success', 'Profil Anda berhasil diperbarui.');
    }

    /**
     * Perbarui kata sandi akun.
     */
    public function updatePassword(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', Password::defaults(), 'confirmed'],
        ], [
            'current_password.required' => 'Kata sandi saat ini wajib diisi.',
            'current_password.current_password' => 'Kata sandi saat ini tidak sesuai.',
            'password.required' => 'Kata sandi baru wajib diisi.',
            'password.confirmed' => 'Konfirmasi kata sandi baru tidak cocok.',
        ]);

        $request->user()->update([
            'password' => Hash::make($validated['password']),
        ]);

        return back()->with('success', 'Kata sandi Anda berhasil diperbarui.');
    }
}
