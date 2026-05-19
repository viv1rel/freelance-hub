<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Tenant;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class WorkspaceSwitchController extends Controller
{
    public function __invoke(Request $request, Tenant $tenant): RedirectResponse
    {
        $user = $request->user();

        abort_unless($user->isMemberOf($tenant->id), 404);

        $user->switchTo($tenant);

        return redirect()->route('dashboard');
    }
}
