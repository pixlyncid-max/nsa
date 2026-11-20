<?php

namespace App\Policies;

use App\Enums\Role;
use App\Models\SiteText;
use App\Models\User;

class SiteTextPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->role === Role::Superadmin;
    }

    public function view(User $user, ?SiteText $siteText = null): bool
    {
        return $user->role === Role::Superadmin;
    }

    public function update(User $user, ?SiteText $siteText = null): bool
    {
        return $user->role === Role::Superadmin;
    }

    public function reset(User $user, ?SiteText $siteText = null): bool
    {
        return $user->role === Role::Superadmin;
    }

    public function restore(User $user, ?SiteText $siteText = null): bool
    {
        return $user->role === Role::Superadmin;
    }
}
