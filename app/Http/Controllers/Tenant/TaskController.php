<?php

declare(strict_types=1);

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Requests\TaskReorderRequest;
use App\Http\Requests\TaskRequest;
use App\Models\Project;
use App\Models\Task;
use App\Models\TaskActivity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TaskController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Task::class);

        $query = Task::with('project')
            ->whereNull('parent_id');

        if ($projectId = $request->query('project_id')) {
            $query->where('project_id', $projectId);
        }

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        if ($priority = $request->query('priority')) {
            $query->where('priority', $priority);
        }

        if ($search = $request->query('search')) {
            $query->where('title', 'like', "%{$search}%");
        }

        $view = $request->query('view', 'list');

        if ($view === 'kanban') {
            $tasks = $query->orderBy('sort_order')->get();

            $columns = [
                'open' => $tasks->where('status', 'open')->values(),
                'in_progress' => $tasks->where('status', 'in_progress')->values(),
                'review' => $tasks->where('status', 'review')->values(),
                'closed' => $tasks->where('status', 'closed')->values(),
            ];

            return Inertia::render('Tasks/Kanban', [
                'columns' => $columns,
                'projects' => Project::select('id', 'name')->get(),
                'filters' => $request->only(['project_id', 'priority', 'search']),
            ]);
        }

        $tasks = $query->latest()->paginate(20)->withQueryString();

        return Inertia::render('Tasks/Index', [
            'tasks' => $tasks,
            'projects' => Project::select('id', 'name')->get(),
            'filters' => $request->only(['project_id', 'status', 'priority', 'search']),
        ]);
    }

    public function create(Request $request): Response
    {
        $this->authorize('create', Task::class);

        return Inertia::render('Tasks/Create', [
            'projects' => Project::select('id', 'name')->get(),
            'project_id' => $request->query('project_id'),
        ]);
    }

    public function store(TaskRequest $request): RedirectResponse
    {
        $this->authorize('create', Task::class);

        $task = Task::create($request->validated());

        TaskActivity::create([
            'task_id' => $task->id,
            'user_id' => $request->user()->id,
            'field' => 'created',
            'old_value' => null,
            'new_value' => $task->title,
        ]);

        return redirect()->route('tasks.show', $task)->with('success', 'Задача создана.');
    }

    public function show(Task $task): Response
    {
        $this->authorize('view', $task);

        $task->load(['project', 'subtasks', 'activities' => function ($query) {
            $query->latest()->limit(50);
        }]);

        return Inertia::render('Tasks/Show', [
            'task' => $task,
        ]);
    }

    public function edit(Task $task): Response
    {
        $this->authorize('update', $task);

        return Inertia::render('Tasks/Edit', [
            'task' => $task,
            'projects' => Project::select('id', 'name')->get(),
        ]);
    }

    public function update(TaskRequest $request, Task $task): RedirectResponse
    {
        $this->authorize('update', $task);

        $trackedFields = ['status', 'priority', 'assignee_id', 'title', 'deadline'];
        $validated = $request->validated();

        foreach ($trackedFields as $field) {
            if (array_key_exists($field, $validated) && $task->{$field} != $validated[$field]) {
                TaskActivity::create([
                    'task_id' => $task->id,
                    'user_id' => $request->user()->id,
                    'field' => $field,
                    'old_value' => (string) $task->{$field},
                    'new_value' => (string) $validated[$field],
                ]);
            }
        }

        $task->update($validated);

        return redirect()->route('tasks.show', $task)->with('success', 'Задача обновлена.');
    }

    public function destroy(Task $task): RedirectResponse
    {
        $this->authorize('delete', $task);

        $task->delete();

        return redirect()->route('tasks.index')->with('success', 'Задача удалена.');
    }

    public function reorder(TaskReorderRequest $request): JsonResponse
    {
        $validated = $request->validated();
        /** @var Task $task */
        $task = Task::findOrFail($validated['task_id']);

        $this->authorize('update', $task);

        $oldStatus = $task->status;
        $task->update([
            'status' => $validated['status'],
            'sort_order' => $validated['sort_order'],
        ]);

        if ($oldStatus !== $validated['status']) {
            TaskActivity::create([
                'task_id' => $task->id,
                'user_id' => $request->user()->id,
                'field' => 'status',
                'old_value' => $oldStatus,
                'new_value' => $validated['status'],
            ]);
        }

        return response()->json(['success' => true]);
    }
}
