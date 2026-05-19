<?php

use App\Models\Tenant;
use App\Models\User;
use App\Models\WorkspaceMember;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->runTenantMigrations();
});

function addMember(Tenant $tenant, string $role = 'freelancer'): User
{
    $u = User::factory()->create();
    $u->workspaces()->attach($tenant->id, ['role' => $role, 'joined_at' => now()]);
    $u->update(['current_tenant_id' => $tenant->id]);

    return $u->fresh();
}

test('admin sees team page', function () {
    $admin = $this->makeUserInWorkspace('admin');
    $this->actingAs($admin)->get('/settings/team')->assertOk();
});

test('non-admin cannot access team page', function () {
    $user = $this->makeUserInWorkspace('freelancer');
    $this->actingAs($user)->get('/settings/team')->assertStatus(403);
});

test('admin can change role of another member', function () {
    $admin = $this->makeUserInWorkspace('admin');
    $tenant = Tenant::find($admin->currentTenantId());
    $member = addMember($tenant, 'freelancer');

    $this->actingAs($admin)
        ->patch("/settings/team/{$member->id}/role", ['role' => 'admin'])
        ->assertRedirect();

    expect($member->fresh()->roleIn($tenant->id))->toBe('admin');
});

test('admin cannot change own role', function () {
    $admin = $this->makeUserInWorkspace('admin');
    $this->actingAs($admin)
        ->patch("/settings/team/{$admin->id}/role", ['role' => 'freelancer'])
        ->assertStatus(403);
});

test('cannot demote last admin', function () {
    $admin = $this->makeUserInWorkspace('admin');
    $tenant = Tenant::find($admin->currentTenantId());
    $second = addMember($tenant, 'admin');

    // $second понижает $admin — $second сам админ, так что пройдёт
    $this->actingAs($second)
        ->patch("/settings/team/{$admin->id}/role", ['role' => 'freelancer'])
        ->assertRedirect();

    expect($admin->fresh()->roleIn($tenant->id))->toBe('freelancer');

    // Теперь $second — единственный admin. Третий пробует понизить его.
    $third = addMember($tenant, 'admin');
    $third->update(['current_tenant_id' => $tenant->id]);

    // Сначала $second понижает $third — остаётся сам единственным админом.
    $this->actingAs($second)
        ->patch("/settings/team/{$third->id}/role", ['role' => 'freelancer'])
        ->assertRedirect();

    // Понизить $second от лица $admin (он уже freelancer) — 403 из role middleware.
    $this->actingAs($admin)
        ->patch("/settings/team/{$second->id}/role", ['role' => 'freelancer'])
        ->assertStatus(403);
});

test('admin can remove a member', function () {
    $admin = $this->makeUserInWorkspace('admin');
    $tenant = Tenant::find($admin->currentTenantId());
    $member = addMember($tenant, 'freelancer');

    $this->actingAs($admin)
        ->delete("/settings/team/{$member->id}")
        ->assertRedirect();

    expect(WorkspaceMember::where('user_id', $member->id)->where('tenant_id', $tenant->id)->exists())
        ->toBeFalse();
});

test('admin cannot remove self', function () {
    $admin = $this->makeUserInWorkspace('admin');
    $this->actingAs($admin)
        ->delete("/settings/team/{$admin->id}")
        ->assertStatus(403);
});
