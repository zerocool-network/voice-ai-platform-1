<?php

namespace App\Policies;

use App\Models\User;

class HubSpotIntegrationPolicy
{
    public function view(User $user): bool
    {
        return $user->tenant_id !== null;
    }

    public function manage(User $user): bool
    {
        return $user->isOwner() || $user->isAdmin() || $user->hasPermissionTo('settings.manage');
    }

    public function mutateCrm(User $user): bool
    {
        return $this->manage($user);
    }
}
