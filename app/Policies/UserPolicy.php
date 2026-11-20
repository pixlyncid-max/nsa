<?php

namespace App\Policies;

use App\Enums\Role;
use App\Models\User;

class UserPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->isStaff();
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, User $model): bool
    {
        return $user->isStaff() || $user->id === $model->id;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, User $model): bool
    {
        return $user->isStaff() || $user->id === $model->id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, User $model): bool
    {
        return $user->role === Role::Superadmin;
    }

    /**
     * Determine whether the user can verify members.
     */
    public function verifyMember(User $user): bool
    {
        return $user->isStaff();
    }

    /**
     * Determine whether the user can manage settings.
     */
    public function manageSettings(User $user): bool
    {
        return $user->role === Role::Superadmin;
    }

    /**
     * Determine whether the user can manage admin accounts.
     */
    public function manageAdmins(User $user): bool
    {
        return $user->role === Role::Superadmin;
    }

    /**
     * Determine whether the user can view activity logs.
     */
    public function viewActivityLogs(User $user): bool
    {
        return $user->role === Role::Superadmin;
    }

    /**
     * Determine whether the user can permanently delete resources.
     */
    public function deletePermanently(User $user): bool
    {
        return $user->role === Role::Superadmin;
    }
}
