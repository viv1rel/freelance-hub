<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int $project_id
 * @property int|null $parent_id
 * @property string $title
 * @property string|null $description
 * @property string $status
 * @property string $priority
 * @property string|null $deadline
 * @property int|null $assignee_id
 * @property int $sort_order
 * @property Project $project
 */
class Task extends Model
{
    protected $fillable = [
        'project_id',
        'parent_id',
        'title',
        'description',
        'status',
        'priority',
        'deadline',
        'assignee_id',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'deadline' => 'date',
            'sort_order' => 'integer',
        ];
    }

    /** @return BelongsTo<Project, $this> */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /** @return BelongsTo<self, $this> */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    /** @return HasMany<self, $this> */
    public function subtasks(): HasMany
    {
        return $this->hasMany(self::class, 'parent_id');
    }

    /** @return HasMany<TaskActivity, $this> */
    public function activities(): HasMany
    {
        return $this->hasMany(TaskActivity::class);
    }
}
