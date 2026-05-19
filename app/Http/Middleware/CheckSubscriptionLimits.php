<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Models\Client;
use App\Models\Project;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckSubscriptionLimits
{
    /** Лимиты Free-плана: 3 проекта, 3 клиента. */
    public function handle(Request $request, Closure $next, string $resource): Response
    {
        $user = $request->user();

        if ($user && $user->subscribed()) {
            return $next($request);
        }

        $limit = match ($resource) {
            'project' => 3,
            'client' => 3,
            default => null,
        };

        if ($limit === null) {
            return $next($request);
        }

        $count = match ($resource) {
            'project' => Project::count(),
            'client' => Client::count(),
            default => 0,
        };

        if ($count >= $limit) {
            return back()->with('error', 'Достигнут лимит тарифа Free. Перейдите на Pro, чтобы продолжить.');
        }

        return $next($request);
    }
}
