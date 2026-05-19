<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\TimeEntry;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class TimeReportService
{
    /** @return Collection<int, TimeEntry> */
    public function byProject(int $userId, string $from, string $to): Collection
    {
        return TimeEntry::query()
            ->where('user_id', $userId)
            ->where('is_running', false)
            ->whereBetween('started_at', [$from, $to])
            ->join('projects', 'time_entries.project_id', '=', 'projects.id')
            ->groupBy('projects.id', 'projects.name')
            ->select([
                'projects.id',
                'projects.name',
                DB::raw('SUM(time_entries.duration_minutes) as total_minutes'),
                DB::raw('COUNT(time_entries.id) as entries_count'),
            ])
            ->orderByDesc('total_minutes')
            ->get();
    }

    /** @return Collection<int, TimeEntry> */
    public function byDay(int $userId, string $from, string $to): Collection
    {
        return TimeEntry::query()
            ->where('user_id', $userId)
            ->where('is_running', false)
            ->whereBetween('started_at', [$from, $to])
            ->groupBy('date')
            ->select([
                DB::raw('DATE(started_at) as date'),
                DB::raw('SUM(duration_minutes) as total_minutes'),
                DB::raw('COUNT(id) as entries_count'),
            ])
            ->orderBy('date')
            ->get();
    }
}
