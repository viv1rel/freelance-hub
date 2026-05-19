<?php

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('registration page can be rendered', function () {
    $response = $this->get('/register');
    $response->assertStatus(200);
});

test('new users can register and workspace is created', function () {
    $response = $this->post('/register', [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'workspace_name' => 'Test Workspace',
    ]);

    $response->assertRedirect('/dashboard');
    $this->assertAuthenticated();

    $user = User::where('email', 'test@example.com')->first();
    expect($user)->not->toBeNull()
        ->and($user->currentRole())->toBe('admin')
        ->and($user->currentTenantId())->not->toBeNull();

    $tenant = Tenant::find($user->currentTenantId());
    expect($tenant)->not->toBeNull()
        ->and($tenant->name)->toBe('Test Workspace');
});

test('registration requires valid data', function () {
    $response = $this->post('/register', []);
    $response->assertSessionHasErrors(['name', 'email', 'password', 'workspace_name']);
});

test('registration requires unique email', function () {
    User::factory()->create(['email' => 'taken@example.com']);

    $response = $this->post('/register', [
        'name' => 'Test',
        'email' => 'taken@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'workspace_name' => 'Workspace',
    ]);

    $response->assertSessionHasErrors('email');
});
