<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();
        $role = $user?->currentRole();

        if (! $role || ! in_array($role, $roles, true)) {
            abort(403, 'Unauthorized.');
        }

        return $next($request);
    }
}
