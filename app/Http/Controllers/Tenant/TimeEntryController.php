<?php

declare(strict_types=1);

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Requests\TimeEntryRequest;
use App\Models\Project;
use App\Models\Task;
use App\Models\TimeEntry;
use App\Services\TimeReportService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TimeEntryController extends Controller
{
    public function index(Request $request): Response
    {
        $userId = $request->user()->id;
        $query = TimeEntry::with(['project', 'task'])
            ->where('user_id', $userId)
            ->where('is_running', false);

        if ($projectId = $request->query('project_id')) {
            $query->where('project_id', $projectId);
        }

        if ($from = $request->query('from')) {
            $query->where('started_at', '>=', $from);
        }

        if ($to = $request->query('to')) {
            $query->where('started_at', '<=', $to.' 23:59:59');
        }

        $entries = $query->latest('started_at')->paginate(20)->withQueryString();

        $runningEntry = TimeEntry::with(['project', 'task'])
            ->where('user_id', $userId)
            ->where('is_running', true)
            ->first();

        return Inertia::render('TimeTracking/Index', [
            'entries' => $entries,
            'runningEntry' => $runningEntry,
            'projects' => Project::select('id', 'name')->get(),
            'tasks' => Task::select('id', 'title', 'project_id')->get(),
            'filters' => $request->only(['project_id', 'from', 'to']),
        ]);
    }

    public function start(Request $request): JsonResponse
    {
        $request->validate([
            'project_id' => ['required', 'integer', 'exists:projects,id'],
            'task_id' => ['nullable', 'integer', 'exists:tasks,id'],
            'description' => ['nullable', 'string', 'max:2000'],
        ]);

        $userId = $request->user()->id;

        // Сначала остановим уже запущенный таймер, если есть.
        $running = TimeEntry::where('user_id', $userId)->where('is_running', true)->first();
        if ($running) {
            $this->stopTimer($running);
        }

        $entry = TimeEntry::create([
            'user_id' => $userId,
            'project_id' => $request->input('project_id'),
            'task_id' => $request->input('task_id'),
            'description' => $request->input('description'),
            'started_at' => now(),
            'is_running' => true,
        ]);

        $entry->load(['project', 'task']);

        return response()->json($entry);
    }

    public function stop(Request $request): JsonResponse
    {
        $entry = TimeEntry::where('user_id', $request->user()->id)
            ->where('is_running', true)
            ->firstOrFail();

        $this->stopTimer($entry);

        return response()->json($entry->fresh(['project', 'task']));
    }

    public function store(TimeEntryRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $userId = $request->user()->id;

        if (! empty($validated['started_at']) && ! empty($validated['ended_at'])) {
            $start = Carbon::parse($validated['started_at']);
            $end = Carbon::parse($validated['ended_at']);
            $validated['duration_minutes'] = (int) $start->diffInMinutes($end);
        }

        TimeEntry::create([
            'user_id' => $userId,
            'project_id' => $validated['project_id'],
            'task_id' => $validated['task_id'] ?? null,
            'started_at' => $validated['started_at'] ?? now(),
            'ended_at' => $validated['ended_at'] ?? now(),
            'duration_minutes' => $validated['duration_minutes'] ?? 0,
            'description' => $validated['description'] ?? null,
            'is_running' => false,
        ]);

        return redirect()->route('time-tracking.index')->with('success', 'Запись времени добавлена.');
    }

    public function destroy(TimeEntry $timeEntry): RedirectResponse
    {
        if ($timeEntry->user_id !== request()->user()->id) {
            abort(403);
        }

        $timeEntry->delete();

        return redirect()->route('time-tracking.index')->with('success', 'Запись удалена.');
    }

    public function reports(Request $request, TimeReportService $reportService): Response
    {
        $userId = $request->user()->id;
        $period = $request->query('period', 'week');

        $from = match ($period) {
            'month' => now()->startOfMonth()->toDateString(),
            'quarter' => now()->startOfQuarter()->toDateString(),
            default => now()->startOfWeek()->toDateString(),
        };
        $to = now()->toDateString();

        return Inertia::render('TimeTracking/Reports', [
            'byProject' => $reportService->byProject($userId, $from, $to),
            'byDay' => $reportService->byDay($userId, $from, $to),
            'period' => $period,
            'from' => $from,
            'to' => $to,
        ]);
    }

    private function stopTimer(TimeEntry $entry): void
    {
        $now = now();
        $duration = (int) $entry->started_at->diffInMinutes($now);

        $entry->update([
            'ended_at' => $now,
            'duration_minutes' => $duration,
            'is_running' => false,
        ]);
    }
}
