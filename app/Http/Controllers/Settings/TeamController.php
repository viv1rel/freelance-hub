<?php

declare(strict_types=1);

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\WorkspaceInvitation;
use App\Models\WorkspaceMember;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class TeamController extends Controller
{
    public function index(Request $request): Response
    {
        $tenantId = $request->user()->currentTenantId();
        $currentUserId = $request->user()->id;

        $members = DB::connection(config('tenancy.database.central_connection'))
            ->table('workspace_members')
            ->join('users', 'users.id', '=', 'workspace_members.user_id')
            ->where('workspace_members.tenant_id', $tenantId)
            ->orderBy('users.id')
            ->get(['users.id', 'users.name', 'users.email', 'users.created_at', 'workspace_members.role'])
            ->map(fn ($u) => [
                'id' => (int) $u->id,
                'name' => (string) $u->name,
                'email' => (string) $u->email,
                'role' => (string) $u->role,
                'joined_at' => $u->created_at ? Carbon::parse($u->created_at)->format('d.m.Y') : null,
                'is_self' => (int) $u->id === $currentUserId,
            ]);

        $invitations = WorkspaceInvitation::where('tenant_id', $tenantId)
            ->whereNull('accepted_at')
            ->where('expires_at', '>', now())
            ->orderByDesc('created_at')
            ->get(['id', 'email', 'role', 'expires_at', 'created_at'])
            ->map(fn (WorkspaceInvitation $i) => [
                'id' => $i->id,
                'email' => $i->email,
                'role' => $i->role,
                'expires_at' => $i->expires_at->format('d.m.Y'),
            ]);

        return Inertia::render('Settings/Team', [
            'members' => $members,
            'invitations' => $invitations,
        ]);
    }

    public function updateRole(Request $request, User $member): RedirectResponse
    {
        $tenantId = $request->user()->currentTenantId();
        abort_if(! $member->isMemberOf($tenantId), 404);
        abort_if($member->id === $request->user()->id, 403, 'Нельзя менять собственную роль.');

        $data = $request->validate([
            'role' => ['required', Rule::in(['admin', 'freelancer', 'client'])],
        ]);

        $currentRole = $member->roleIn($tenantId);

        if ($currentRole === 'admin' && $data['role'] !== 'admin' && $this->isLastAdmin($tenantId, $member->id)) {
            return back()->withErrors(['role' => 'Нельзя понизить последнего администратора.']);
        }

        WorkspaceMember::where('user_id', $member->id)
            ->where('tenant_id', $tenantId)
            ->update(['role' => $data['role']]);

        return back()->with('success', 'Роль участника обновлена.');
    }

    public function destroy(Request $request, User $member): RedirectResponse
    {
        $tenantId = $request->user()->currentTenantId();
        abort_if(! $member->isMemberOf($tenantId), 404);
        abort_if($member->id === $request->user()->id, 403, 'Нельзя удалить самого себя.');

        if ($member->roleIn($tenantId) === 'admin' && $this->isLastAdmin($tenantId, $member->id)) {
            return back()->withErrors(['member' => 'Нельзя удалить последнего администратора.']);
        }

        WorkspaceMember::where('user_id', $member->id)
            ->where('tenant_id', $tenantId)
            ->delete();

        // Если активный workspace юзера — этот же, сбрасываем, чтобы middleware пере-решил
        if ($member->current_tenant_id === $tenantId) {
            $member->update(['current_tenant_id' => null]);
        }

        return back()->with('success', 'Участник удалён из рабочего пространства.');
    }

    public function revokeInvitation(Request $request, WorkspaceInvitation $invitation): RedirectResponse
    {
        abort_if($invitation->tenant_id !== $request->user()->currentTenantId(), 404);

        $invitation->delete();

        return back()->with('success', 'Приглашение отозвано.');
    }

    private function isLastAdmin(string $tenantId, int $excludeUserId): bool
    {
        return ! WorkspaceMember::where('tenant_id', $tenantId)
            ->where('role', 'admin')
            ->where('user_id', '!=', $excludeUserId)
            ->exists();
    }
}
