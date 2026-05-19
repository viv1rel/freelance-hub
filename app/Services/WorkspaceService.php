<?php

namespace App\Services;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class WorkspaceService
{
    public function createForUser(User $user, string $workspaceName): Tenant
    {
        return DB::transaction(function () use ($user, $workspaceName) {
            $tenant = Tenant::create([
                'id' => Str::uuid()->toString(),
                'name' => $workspaceName,
            ]);

            $user->workspaces()->attach($tenant->id, [
                'role' => 'admin',
                'joined_at' => now(),
            ]);

            $user->update(['current_tenant_id' => $tenant->id]);

            return $tenant;
        });
    }
}
