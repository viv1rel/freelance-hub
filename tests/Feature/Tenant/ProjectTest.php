<?php

use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->runTenantMigrations();
});

function projUser(string $role = 'admin'): User
{
    return test()->makeUserInWorkspace($role);
}

test('admin can view projects index', function () {
    $user = projUser();
    $this->actingAs($user)->get('/projects')->assertStatus(200);
});

test('admin can create a project', function () {
    $user = projUser();

    $this->actingAs($user)->post('/projects', [
        'name' => 'Test Project',
        'description' => 'A test project',
        'status' => 'active',
    ])->assertRedirect('/projects');

    expect(Project::where('name', 'Test Project')->exists())->toBeTrue();
});

test('admin can update a project', function () {
    $user = projUser();
    $project = Project::create(['name' => 'Old', 'status' => 'active', 'user_id' => $user->id]);

    $this->actingAs($user)->put("/projects/{$project->id}", [
        'name' => 'New', 'status' => 'active',
    ])->assertRedirect("/projects/{$project->id}");

    expect($project->fresh()->name)->toBe('New');
});

test('admin can delete a project', function () {
    $user = projUser();
    $project = Project::create(['name' => 'X', 'status' => 'active', 'user_id' => $user->id]);

    $this->actingAs($user)->delete("/projects/{$project->id}")->assertRedirect('/projects');
    expect(Project::find($project->id))->toBeNull();
});

test('client cannot access projects index', function () {
    $user = projUser('client');
    $this->actingAs($user)->get('/projects')->assertStatus(403);
});

test('freelancer can create but not delete projects', function () {
    $user = projUser('freelancer');

    $this->actingAs($user)->post('/projects', [
        'name' => 'F', 'status' => 'active',
    ])->assertRedirect('/projects');

    $project = Project::where('name', 'F')->first();
    $this->actingAs($user)->delete("/projects/{$project->id}")->assertStatus(403);
});
