<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $task_id
 * @property int $user_id
 * @property string $field
 * @property string|null $old_value
 * @property string|null $new_value
 */
class TaskActivity extends Model
{
    protected $fillable = [
        'task_id',
        'user_id',
        'field',
        'old_value',
        'new_value',
    ];

    /** @return BelongsTo<Task, $this> */
    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }
}
