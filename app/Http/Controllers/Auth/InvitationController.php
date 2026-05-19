<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\InvitationRequest;
use App\Models\User;
use App\Models\WorkspaceInvitation;
use App\Notifications\WorkspaceInvitationNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class InvitationController extends Controller
{
    public function store(InvitationRequest $request): RedirectResponse
    {
        $invitation = WorkspaceInvitation::create([
            'tenant_id' => $request->user()->currentTenantId(),
            'email' => $request->validated('email'),
            'role' => $request->validated('role'),
            'token' => Str::random(64),
            'expires_at' => now()->addDays(7),
        ]);

        Notification::route('mail', $invitation->email)
            ->notify(new WorkspaceInvitationNotification($invitation));

        return back()->with('success', 'Приглашение отправлено.');
    }

    public function show(string $token): Response|RedirectResponse
    {
        $invitation = WorkspaceInvitation::where('token', $token)->firstOrFail();

        if ($invitation->isExpired() || $invitation->isAccepted()) {
            return Inertia::render('Auth/InvitationExpired');
        }

        return Inertia::render('Auth/AcceptInvitation', [
            'invitation' => [
                'token' => $invitation->token,
                'email' => $invitation->email,
                'role' => $invitation->role,
                'workspace_name' => $invitation->tenant->name,
                'user_exists' => User::where('email', $invitation->email)->exists(),
            ],
        ]);
    }

    public function accept(Request $request, string $token): RedirectResponse
    {
        $invitation = WorkspaceInvitation::where('token', $token)->firstOrFail();

        if ($invitation->isExpired() || $invitation->isAccepted()) {
            return redirect()->route('login')->withErrors(['invitation' => 'This invitation has expired.']);
        }

        $existing = User::where('email', $invitation->email)->first();

        if (! $existing) {
            $request->validate([
                'name' => ['required', 'string', 'max:255'],
                'password' => ['required', 'string', 'min:8', 'confirmed'],
            ]);
        }

        $user = DB::transaction(function () use ($request, $invitation, $existing) {
            $user = $existing ?? User::create([
                'name' => $request->input('name'),
                'email' => $invitation->email,
                'password' => $request->input('password'),
            ]);

            if (! $user->isMemberOf($invitation->tenant_id)) {
                $user->workspaces()->attach($invitation->tenant_id, [
                    'role' => $invitation->role,
                    'joined_at' => now(),
                ]);
            }

            $user->update(['current_tenant_id' => $invitation->tenant_id]);
            $invitation->update(['accepted_at' => now()]);

            return $user;
        });

        Auth::login($user);

        return redirect()->route('dashboard');
    }
}
