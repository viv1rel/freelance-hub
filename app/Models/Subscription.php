<?php

declare(strict_types=1);

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property string|null $tenant_id
 * @property int|null $user_id
 * @property string $plan
 * @property string $status
 * @property string|null $yookassa_payment_id
 * @property string|null $yookassa_payment_method_id
 * @property Carbon|null $current_period_start
 * @property Carbon|null $current_period_end
 * @property Carbon|null $cancelled_at
 */
class Subscription extends Model
{
    public function getConnectionName(): ?string
    {
        return config('tenancy.database.central_connection');
    }

    protected $fillable = [
        'tenant_id',
        'user_id',
        'plan',
        'status',
        'yookassa_payment_id',
        'yookassa_payment_method_id',
        'current_period_start',
        'current_period_end',
        'cancelled_at',
    ];

    protected function casts(): array
    {
        return [
            'current_period_start' => 'datetime',
            'current_period_end' => 'datetime',
            'cancelled_at' => 'datetime',
        ];
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return BelongsTo<Tenant, $this> */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function isActive(): bool
    {
        return $this->status === 'active'
            && ($this->current_period_end === null || $this->current_period_end->isFuture());
    }

    public function onGracePeriod(): bool
    {
        return $this->status === 'cancelled'
            && $this->current_period_end !== null
            && $this->current_period_end->isFuture();
    }
}
