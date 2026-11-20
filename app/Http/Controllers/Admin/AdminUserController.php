<?php

namespace App\Http\Controllers\Admin;

use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class AdminUserController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('manage-admins');

        $users = User::whereIn('role', [Role::Admin, Role::Superadmin])
            ->latest('id')
            ->get()
            ->map(fn ($u) => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'phone' => $u->phone,
                'role' => $u->role instanceof Role ? $u->role->value : (string) $u->role,
                'created_at' => $u->created_at?->format('d/m/Y H:i'),
            ]);

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        Gate::authorize('manage-admins');

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:20'],
            'password' => ['required', 'confirmed', Password::defaults()],
            'role' => ['required', 'in:admin,superadmin'],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'email_verified_at' => now(),
        ]);

        ActivityLog::log(
            action: 'create_admin_user',
            subject: "Membuat akun pengelola baru: {$user->name} ({$user->role->value})",
            meta: ['user_id' => $user->id, 'email' => $user->email, 'role' => $user->role->value],
            userId: $request->user()->id,
        );

        return back()->with('success', "Akun pengelola {$user->name} berhasil dibuat.");
    }

    public function update(User $user, Request $request): RedirectResponse
    {
        Gate::authorize('manage-admins');

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:users,email,'.$user->id],
            'phone' => ['nullable', 'string', 'max:20'],
            'password' => ['nullable', 'confirmed', Password::defaults()],
            'role' => ['required', 'in:admin,superadmin'],
        ]);

        $updateData = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'role' => $validated['role'],
        ];

        if (! empty($validated['password'])) {
            $updateData['password'] = Hash::make($validated['password']);
        }

        $user->update($updateData);

        ActivityLog::log(
            action: 'update_admin_user',
            subject: "Memperbarui akun pengelola: {$user->name}",
            meta: ['user_id' => $user->id, 'email' => $user->email],
            userId: $request->user()->id,
        );

        return back()->with('success', "Akun pengelola {$user->name} berhasil diperbarui.");
    }

    public function destroy(User $user, Request $request): RedirectResponse
    {
        Gate::authorize('manage-admins');

        if ($user->id === $request->user()->id) {
            return back()->with('error', 'Anda tidak dapat menghapus akun Anda sendiri.');
        }

        $name = $user->name;
        ActivityLog::log(
            action: 'delete_admin_user',
            subject: "Menghapus akun pengelola: {$name}",
            meta: ['user_id' => $user->id, 'email' => $user->email],
            userId: $request->user()->id,
        );

        $user->delete();

        return back()->with('success', "Akun {$name} berhasil dihapus.");
    }
}
