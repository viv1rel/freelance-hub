<?php

use App\Models\Client;
use App\Models\Project;
use App\Models\Subscription;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->runTenantMigrations();
});

test('free plan blocks 4th project', function () {
    $user = $this->makeUserInWorkspace('admin');

    for ($i = 1; $i <= 3; $i++) {
        Project::create(['name' => "P$i", 'status' => 'active', 'user_id' => $user->id]);
    }

    $this->actingAs($user)
        ->post('/projects', ['name' => 'P4', 'status' => 'active'])
        ->assertRedirect();

    expect(Project::count())->toBe(3);
});

test('pro subscription on tenant lifts project limit for all members', function () {
    $admin = $this->makeUserInWorkspace('admin');
    $tenant = Tenant::find($admin->currentTenantId());

    $freelancer = User::factory()->create();
    $freelancer->workspaces()->attach($tenant->id, ['role' => 'freelancer', 'joined_at' => now()]);
    $freelancer->update(['current_tenant_id' => $tenant->id]);
    $freelancer = $freelancer->fresh();

    Subscription::create([
        'tenant_id' => $tenant->id, 'user_id' => $admin->id,
        'plan' => 'pro', 'status' => 'active',
        'current_period_start' => now(), 'current_period_end' => now()->addMonth(),
    ]);

    for ($i = 1; $i <= 3; $i++) {
        Project::create(['name' => "P$i", 'status' => 'active', 'user_id' => $admin->id]);
    }

    expect($freelancer->subscribed())->toBeTrue();

    $this->actingAs($freelancer)
        ->post('/projects', ['name' => 'P4', 'status' => 'active'])
        ->assertRedirect('/projects');

    expect(Project::count())->toBe(4);
});

test('free plan blocks 4th client', function () {
    $user = $this->makeUserInWorkspace('admin');

    Client::create(['name' => 'C1', 'currency' => 'RUB']);
    Client::create(['name' => 'C2', 'currency' => 'RUB']);
    Client::create(['name' => 'C3', 'currency' => 'RUB']);

    $this->actingAs($user)
        ->post('/clients', ['name' => 'C4', 'currency' => 'RUB'])
        ->assertRedirect();

    expect(Client::count())->toBe(3);
});

test('billing index renders without yookassa credentials', function () {
    $user = $this->makeUserInWorkspace('admin');
    config(['services.yookassa.shop_id' => '', 'services.yookassa.secret_key' => '']);

    $this->actingAs($user)->get('/billing')->assertOk();
});
