<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class TimeEntryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'project_id' => ['required', 'integer', 'exists:projects,id'],
            'task_id' => ['nullable', 'integer', 'exists:tasks,id'],
            'started_at' => ['nullable', 'date'],
            'ended_at' => ['nullable', 'date', 'after:started_at'],
            'duration_minutes' => ['nullable', 'integer', 'min:1'],
            'description' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
