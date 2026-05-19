<?php

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->runTenantMigrations();
});

test('user without any workspace is rejected', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->get('/dashboard')->assertRedirect('/login');
});

test('user whose workspace was deleted is rejected', function () {
    $tenant = Tenant::create(['id' => 'will-go', 'name' => 'Tmp']);
    $user = User::factory()->create(['current_tenant_id' => $tenant->id]);
    $user->workspaces()->attach($tenant->id, ['role' => 'admin', 'joined_at' => now()]);
    $tenant->delete(); // cascades pivot rows

    $this->actingAs($user)->get('/dashboard')->assertRedirect('/login');
});

test('tenant context initialized for valid member', function () {
    $user = $this->makeUserInWorkspace('admin');
    $this->actingAs($user)->get('/projects')->assertOk();
});

test('user can switch between two workspaces', function () {
    $user = $this->makeUserInWorkspace('admin');
    $first = Tenant::find($user->currentTenantId());

    $second = Tenant::create(['id' => 'ws-second', 'name' => 'Second']);
    $user->workspaces()->attach($second->id, ['role' => 'freelancer', 'joined_at' => now()]);

    $this->actingAs($user)
        ->post("/workspaces/{$second->id}/switch")
        ->assertRedirect('/dashboard');

    expect($user->fresh()->current_tenant_id)->toBe($second->id)
        ->and($user->fresh()->currentRole())->toBe('freelancer');
});

test('cannot switch to a workspace user is not a member of', function () {
    $user = $this->makeUserInWorkspace('admin');
    $foreign = Tenant::create(['id' => 'foreign-ws', 'name' => 'Foreign']);

    $this->actingAs($user)
        ->post("/workspaces/{$foreign->id}/switch")
        ->assertStatus(404);
});
