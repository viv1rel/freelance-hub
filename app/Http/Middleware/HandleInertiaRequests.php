<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /** @var string */
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /** @return array<string, mixed> */
    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? [
                    ...$user->only('id', 'name', 'email', 'two_factor_enabled'),
                    'role' => $user->currentRole(),
                    'current_tenant_id' => $user->currentTenantId(),
                ] : null,
                'workspaces' => fn () => $user
                    ? DB::connection(config('tenancy.database.central_connection'))
                        ->table('workspace_members')
                        ->join('tenants', 'tenants.id', '=', 'workspace_members.tenant_id')
                        ->where('workspace_members.user_id', $user->id)
                        ->orderBy('tenants.name')
                        ->get(['tenants.id', 'tenants.name', 'workspace_members.role'])
                        ->map(fn ($r) => [
                            'id' => (string) $r->id,
                            'name' => (string) $r->name,
                            'role' => (string) $r->role,
                        ])
                        ->all()
                    : [],
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ];
    }
}
