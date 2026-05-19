<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Client;
use App\Models\User;

class ClientPolicy
{
    public function viewAny(User $user): bool
    {
        return ! $user->isClient();
    }

    public function view(User $user, Client $client): bool
    {
        return ! $user->isClient();
    }

    public function create(User $user): bool
    {
        return $user->isAdmin() || $user->isFreelancer();
    }

    public function update(User $user, Client $client): bool
    {
        return $user->isAdmin() || $user->isFreelancer();
    }

    public function delete(User $user, Client $client): bool
    {
        return $user->isAdmin();
    }
}
