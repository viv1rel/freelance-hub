<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $invoice_id
 * @property string|null $stripe_session_id
 * @property string|null $stripe_payment_intent
 * @property string $amount
 * @property string $currency
 * @property string $status
 * @property array<string, mixed>|null $payload
 */
class Transaction extends Model
{
    protected $fillable = [
        'invoice_id',
        'yookassa_payment_id',
        'amount',
        'currency',
        'status',
        'payload',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'payload' => 'array',
        ];
    }

    /** @return BelongsTo<Invoice, $this> */
    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }
}
