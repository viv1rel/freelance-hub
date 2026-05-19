<?php

declare(strict_types=1);

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Relations\Pivot;

/**
 * @property int $user_id
 * @property string $tenant_id
 * @property string $role
 * @property Carbon $joined_at
 */
class WorkspaceMember extends Pivot
{
    protected $table = 'workspace_members';

    public $incrementing = false;

    public $timestamps = false;

    protected $fillable = ['user_id', 'tenant_id', 'role', 'joined_at'];

    protected function casts(): array
    {
        return [
            'joined_at' => 'datetime',
        ];
    }

    public function getConnectionName(): ?string
    {
        return config('tenancy.database.central_connection');
    }
}
