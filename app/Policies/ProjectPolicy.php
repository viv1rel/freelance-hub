<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Project;
use App\Models\User;

class ProjectPolicy
{
    public function viewAny(User $user): bool
    {
        return ! $user->isClient();
    }

    public function view(User $user, Project $project): bool
    {
        if ($user->isClient()) {
            return $project->client_id !== null;
        }

        return true;
    }

    public function create(User $user): bool
    {
        return $user->isAdmin() || $user->isFreelancer();
    }

    public function update(User $user, Project $project): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return $user->isFreelancer() && $project->user_id === $user->id;
    }

    public function delete(User $user, Project $project): bool
    {
        return $user->isAdmin();
    }
}
