<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Session;

/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property string $password
 * @property string|null $current_tenant_id
 * @property string|null $two_factor_secret
 * @property bool $two_factor_enabled
 * @property-read Tenant|null $currentTenant
 * @property-read Subscription|null $subscription
 */
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory;

    use Notifiable;

    public function getConnectionName(): ?string
    {
        return config('tenancy.database.central_connection');
    }

    /** @var list<string> */
    protected $fillable = [
        'name',
        'email',
        'password',
        'current_tenant_id',
        'two_factor_secret',
        'two_factor_enabled',
    ];

    /** @var list<string> */
    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_secret',
    ];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_enabled' => 'boolean',
        ];
    }

    /** @return BelongsToMany<Tenant, $this, WorkspaceMember, 'pivot'> */
    public function workspaces(): BelongsToMany
    {
        return $this->belongsToMany(Tenant::class, 'workspace_members', 'user_id', 'tenant_id')
            ->using(WorkspaceMember::class)
            ->withPivot(['role', 'joined_at']);
    }

    /** @return BelongsTo<Tenant, $this> */
    public function currentTenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class, 'current_tenant_id');
    }

    public function currentTenantId(): ?string
    {
        $sessionId = Session::get('current_tenant_id');
        if ($sessionId && $this->isMemberOf($sessionId)) {
            return $sessionId;
        }

        if ($this->current_tenant_id && $this->isMemberOf($this->current_tenant_id)) {
            return $this->current_tenant_id;
        }

        return $this->workspaces()->first()?->id;
    }

    public function isMemberOf(string $tenantId): bool
    {
        return $this->workspaces()->where('tenants.id', $tenantId)->exists();
    }

    public function roleIn(string $tenantId): ?string
    {
        $role = WorkspaceMember::query()
            ->where('user_id', $this->id)
            ->where('tenant_id', $tenantId)
            ->value('role');

        return $role !== null ? (string) $role : null;
    }

    public function currentRole(): ?string
    {
        $id = $this->currentTenantId();

        return $id ? $this->roleIn($id) : null;
    }

    public function switchTo(Tenant $tenant): void
    {
        Session::put('current_tenant_id', $tenant->id);
        $this->update(['current_tenant_id' => $tenant->id]);
    }

    public function getSubscriptionAttribute(): ?Subscription
    {
        $id = $this->currentTenantId();

        return $id ? Tenant::find($id)?->subscription : null;
    }

    public function subscribed(): bool
    {
        $id = $this->currentTenantId();

        return $id ? (bool) Tenant::find($id)?->subscribed() : false;
    }

    public function onGracePeriod(): bool
    {
        $id = $this->currentTenantId();

        return $id ? (bool) Tenant::find($id)?->onGracePeriod() : false;
    }

    public function isAdmin(): bool
    {
        return $this->currentRole() === 'admin';
    }

    public function isFreelancer(): bool
    {
        return $this->currentRole() === 'freelancer';
    }

    public function isClient(): bool
    {
        return $this->currentRole() === 'client';
    }
}
