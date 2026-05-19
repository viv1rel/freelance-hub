<?php

use App\Models\Tenant;
use App\Models\User;
use App\Models\WorkspaceInvitation;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('admin can send invitation', function () {
    $admin = $this->makeUserInWorkspace('admin');

    $this->actingAs($admin)->post('/invitations', [
        'email' => 'invited@example.com',
        'role' => 'freelancer',
    ])->assertRedirect();

    expect(WorkspaceInvitation::where('email', 'invited@example.com')->exists())->toBeTrue();
});

test('non-admin cannot send invitation', function () {
    $user = $this->makeUserInWorkspace('freelancer');

    $this->actingAs($user)->post('/invitations', [
        'email' => 'invited@example.com',
        'role' => 'freelancer',
    ])->assertStatus(403);
});

test('invitation acceptance page renders', function () {
    $tenant = Tenant::create(['id' => 'inv-tenant', 'name' => 'Test WS']);
    WorkspaceInvitation::create([
        'tenant_id' => $tenant->id,
        'email' => 'invited@example.com',
        'role' => 'freelancer',
        'token' => 'test-token-123',
        'expires_at' => now()->addDays(7),
    ]);

    $this->get('/invitations/test-token-123/accept')->assertStatus(200);
});

test('new user can accept invitation', function () {
    $tenant = Tenant::create(['id' => 'inv-tenant', 'name' => 'Test WS']);
    WorkspaceInvitation::create([
        'tenant_id' => $tenant->id,
        'email' => 'newuser@example.com',
        'role' => 'freelancer',
        'token' => 'accept-token',
        'expires_at' => now()->addDays(7),
    ]);

    $this->post('/invitations/accept-token/accept', [
        'name' => 'New User',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ])->assertRedirect('/dashboard');

    $user = User::where('email', 'newuser@example.com')->first();
    expect($user)->not->toBeNull()
        ->and($user->currentRole())->toBe('freelancer')
        ->and($user->currentTenantId())->toBe($tenant->id);
});

test('existing user accepting invitation gets pivot row, no new user', function () {
    // Существующий юзер со своим workspace
    $existing = $this->makeUserInWorkspace('admin');
    $originalEmail = $existing->email;
    $usersBefore = User::count();

    // Второй tenant приглашает его по тому же email
    $tenant2 = Tenant::create(['id' => 'inv-tenant2', 'name' => 'WS 2']);
    WorkspaceInvitation::create([
        'tenant_id' => $tenant2->id,
        'email' => $originalEmail,
        'role' => 'client',
        'token' => 'reuse-token',
        'expires_at' => now()->addDays(7),
    ]);

    $this->post('/invitations/reuse-token/accept')->assertRedirect('/dashboard');

    expect(User::count())->toBe($usersBefore); // no new user created

    $existing = $existing->fresh();
    expect($existing->workspaces()->count())->toBe(2)
        ->and($existing->roleIn($tenant2->id))->toBe('client')
        ->and($existing->currentTenantId())->toBe($tenant2->id);
});

test('expired invitation cannot be accepted', function () {
    $tenant = Tenant::create(['id' => 'inv-tenant', 'name' => 'Test WS']);
    WorkspaceInvitation::create([
        'tenant_id' => $tenant->id,
        'email' => 'expired@example.com',
        'role' => 'freelancer',
        'token' => 'expired-token',
        'expires_at' => now()->subDay(),
    ]);

    $this->get('/invitations/expired-token/accept')->assertStatus(200);
});
