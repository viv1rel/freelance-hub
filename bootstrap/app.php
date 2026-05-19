<?php

use App\Http\Middleware\CheckRole;
use App\Http\Middleware\CheckSubscriptionLimits;
use App\Http\Middleware\EnsureTenantContext;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Routing\Middleware\SubstituteBindings;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->trustProxies(at: '*');

        $middleware->web(append: [
            HandleInertiaRequests::class,
        ]);

        $middleware->alias([
            'tenant' => EnsureTenantContext::class,
            'role' => CheckRole::class,
            'subscription.limit' => CheckSubscriptionLimits::class,
        ]);

        // Должен идти ДО SubstituteBindings, иначе route-model binding уходит в центральную БД.
        $middleware->prependToPriorityList(
            before: SubstituteBindings::class,
            prepend: EnsureTenantContext::class,
        );

        $middleware->validateCsrfTokens(except: [
            'yookassa/webhook',
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
