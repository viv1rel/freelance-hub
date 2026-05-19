<?php

declare(strict_types=1);

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int $client_id
 * @property int $user_id
 * @property string $number
 * @property string $status
 * @property string $currency
 * @property Carbon $issued_at
 * @property Carbon $due_at
 * @property string $subtotal
 * @property string $tax_rate
 * @property string $tax_amount
 * @property string $discount
 * @property string $total
 * @property string $paid_amount
 * @property string|null $notes
 * @property string|null $payment_token
 * @property-read Client $client
 * @property-read Collection<int, InvoiceItem> $items
 * @property-read Collection<int, Transaction> $transactions
 */
class Invoice extends Model
{
    protected $fillable = [
        'client_id',
        'user_id',
        'number',
        'status',
        'currency',
        'issued_at',
        'due_at',
        'subtotal',
        'tax_rate',
        'tax_amount',
        'discount',
        'total',
        'paid_amount',
        'notes',
        'payment_token',
        'sent_at',
        'paid_at',
    ];

    protected function casts(): array
    {
        return [
            'issued_at' => 'date',
            'due_at' => 'date',
            'sent_at' => 'datetime',
            'paid_at' => 'datetime',
            'subtotal' => 'decimal:2',
            'tax_rate' => 'decimal:2',
            'tax_amount' => 'decimal:2',
            'discount' => 'decimal:2',
            'total' => 'decimal:2',
            'paid_amount' => 'decimal:2',
        ];
    }

    /** @return BelongsTo<Client, $this> */
    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    /** @return HasMany<InvoiceItem, $this> */
    public function items(): HasMany
    {
        return $this->hasMany(InvoiceItem::class);
    }

    /** @return HasMany<Transaction, $this> */
    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    public function isOverdue(): bool
    {
        return in_array($this->status, ['sent', 'partially_paid'], true)
            && $this->due_at->isPast();
    }
}
