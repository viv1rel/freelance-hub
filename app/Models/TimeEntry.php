<?php

declare(strict_types=1);

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $user_id
 * @property int|null $task_id
 * @property int $project_id
 * @property Carbon|null $started_at
 * @property Carbon|null $ended_at
 * @property int $duration_minutes
 * @property string|null $description
 * @property bool $is_running
 * @property-read Project $project
 * @property-read Task|null $task
 */
class TimeEntry extends Model
{
    protected $fillable = [
        'user_id',
        'task_id',
        'project_id',
        'started_at',
        'ended_at',
        'duration_minutes',
        'description',
        'invoice_item_id',
        'is_running',
    ];

    protected function casts(): array
    {
        return [
            'started_at' => 'datetime',
            'ended_at' => 'datetime',
            'duration_minutes' => 'integer',
            'is_running' => 'boolean',
        ];
    }

    /** @return BelongsTo<Task, $this> */
    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }

    /** @return BelongsTo<Project, $this> */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }
}
