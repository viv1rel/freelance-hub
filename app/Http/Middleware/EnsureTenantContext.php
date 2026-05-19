<?php

namespace App\Http\Middleware;

use App\Models\Tenant;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureTenantContext
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            return redirect()->route('login');
        }

        $tenantId = $user->currentTenantId();
        $tenant = $tenantId ? Tenant::find($tenantId) : null;

        if (! $tenant) {
            // Без членств: разлогиниваем, иначе цикл /dashboard ↔ /login.
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()->route('login')->withErrors([
                'workspace' => 'Вы не принадлежите ни к одному рабочему пространству.',
            ]);
        }

        if ($user->current_tenant_id !== $tenant->id) {
            $user->update(['current_tenant_id' => $tenant->id]);
        }

        tenancy()->initialize($tenant);

        return $next($request);
    }
}
