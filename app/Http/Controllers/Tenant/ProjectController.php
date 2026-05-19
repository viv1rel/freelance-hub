<?php

declare(strict_types=1);

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProjectRequest;
use App\Models\Project;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProjectController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Project::class);

        $query = Project::query()
            ->withCount('tasks')
            ->latest();

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        if ($search = $request->query('search')) {
            $query->where('name', 'like', "%{$search}%");
        }

        $projects = $query->paginate(15)->withQueryString();

        return Inertia::render('Projects/Index', [
            'projects' => $projects,
            'filters' => $request->only(['status', 'search']),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Project::class);

        return Inertia::render('Projects/Create');
    }

    public function store(ProjectRequest $request): RedirectResponse
    {
        $this->authorize('create', Project::class);

        Project::create([
            ...$request->validated(),
            'user_id' => $request->user()->id,
        ]);

        return redirect()->route('projects.index')->with('success', 'Проект создан.');
    }

    public function show(Project $project): Response
    {
        $this->authorize('view', $project);

        $project->load(['tasks' => function ($query) {
            $query->whereNull('parent_id')
                ->with('subtasks')
                ->orderBy('sort_order');
        }]);

        return Inertia::render('Projects/Show', [
            'project' => $project,
        ]);
    }

    public function edit(Project $project): Response
    {
        $this->authorize('update', $project);

        return Inertia::render('Projects/Edit', [
            'project' => $project,
        ]);
    }

    public function update(ProjectRequest $request, Project $project): RedirectResponse
    {
        $this->authorize('update', $project);

        $project->update($request->validated());

        return redirect()->route('projects.show', $project)->with('success', 'Проект обновлён.');
    }

    public function destroy(Project $project): RedirectResponse
    {
        $this->authorize('delete', $project);

        $project->delete();

        return redirect()->route('projects.index')->with('success', 'Проект удалён.');
    }
}
