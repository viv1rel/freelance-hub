<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Task;
use App\Models\User;

class TaskPolicy
{
    public function viewAny(User $user): bool
    {
        return ! $user->isClient();
    }

    public function view(User $user, Task $task): bool
    {
        return ! $user->isClient();
    }

    public function create(User $user): bool
    {
        return $user->isAdmin() || $user->isFreelancer();
    }

    public function update(User $user, Task $task): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        if ($user->isFreelancer()) {
            return $task->assignee_id === $user->id || $task->project->user_id === $user->id;
        }

        return false;
    }

    public function delete(User $user, Task $task): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return $user->isFreelancer() && $task->project->user_id === $user->id;
    }
}
