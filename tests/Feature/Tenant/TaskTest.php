<?php

use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->runTenantMigrations();
});

function taskUser(string $role = 'admin'): User
{
    return test()->makeUserInWorkspace($role);
}

function taskProject(User $u): Project
{
    return Project::create(['name' => 'P', 'status' => 'active', 'user_id' => $u->id]);
}

test('admin can view tasks index', function () {
    $this->actingAs(taskUser())->get('/tasks')->assertStatus(200);
});

test('admin can create a task', function () {
    $user = taskUser();
    $project = taskProject($user);

    $this->actingAs($user)->post('/tasks', [
        'project_id' => $project->id,
        'title' => 'T', 'status' => 'open', 'priority' => 'medium',
    ])->assertRedirect();

    expect(Task::where('title', 'T')->exists())->toBeTrue();
});

test('admin can update a task and activity is logged', function () {
    $user = taskUser();
    $project = taskProject($user);
    $task = Task::create([
        'project_id' => $project->id,
        'title' => 'Orig', 'status' => 'open', 'priority' => 'medium',
    ]);

    $this->actingAs($user)->put("/tasks/{$task->id}", [
        'title' => 'U', 'status' => 'in_progress', 'priority' => 'high',
    ])->assertRedirect("/tasks/{$task->id}");

    expect($task->fresh()->status)->toBe('in_progress');
    expect($task->activities()->count())->toBeGreaterThan(0);
});

test('admin can delete a task', function () {
    $user = taskUser();
    $project = taskProject($user);
    $task = Task::create([
        'project_id' => $project->id,
        'title' => 'X', 'status' => 'open', 'priority' => 'low',
    ]);

    $this->actingAs($user)->delete("/tasks/{$task->id}")->assertRedirect('/tasks');
    expect(Task::find($task->id))->toBeNull();
});

test('task reorder endpoint works', function () {
    $user = taskUser();
    $project = taskProject($user);
    $task = Task::create([
        'project_id' => $project->id,
        'title' => 'D', 'status' => 'open', 'priority' => 'medium', 'sort_order' => 0,
    ]);

    $this->actingAs($user)->postJson('/tasks/reorder', [
        'task_id' => $task->id, 'status' => 'in_progress', 'sort_order' => 1,
    ])->assertOk();

    expect($task->fresh()->status)->toBe('in_progress')
        ->and($task->fresh()->sort_order)->toBe(1);
});

test('kanban view can be rendered', function () {
    $this->actingAs(taskUser())->get('/tasks?view=kanban')->assertStatus(200);
});
