<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Stancl\Tenancy\Contracts\TenantWithDatabase;
use Stancl\Tenancy\Database\Concerns\HasDatabase;
use Stancl\Tenancy\Database\Concerns\HasDomains;
use Stancl\Tenancy\Database\Models\Tenant as BaseTenant;

/**
 * Workspace. При создании stancl/tenancy провижнит отдельную MySQL БД.
 *
 * @property string $id
 * @property string $name
 * @property array<string, mixed> $data
 */
class Tenant extends BaseTenant implements TenantWithDatabase
{
    use HasDatabase;
    use HasDomains;

    /** @return string[] */
    public static function getCustomColumns(): array
    {
        return [
            'id',
            'name',
        ];
    }

    /** @return HasOne<Subscription, $this> */
    public function subscription(): HasOne
    {
        return $this->hasOne(Subscription::class, 'tenant_id')->latestOfMany();
    }

    public function subscribed(): bool
    {
        return (bool) $this->subscription?->isActive();
    }

    public function onGracePeriod(): bool
    {
        return (bool) $this->subscription?->onGracePeriod();
    }

    /** @return BelongsToMany<User, $this, WorkspaceMember, 'pivot'> */
    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'workspace_members', 'tenant_id', 'user_id')
            ->using(WorkspaceMember::class)
            ->withPivot(['role', 'joined_at']);
    }
}
