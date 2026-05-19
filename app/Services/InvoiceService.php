<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Client;
use App\Models\Invoice;
use App\Models\TimeEntry;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class InvoiceService
{
    public function nextNumber(): string
    {
        $year = now()->year;
        $count = Invoice::whereYear('created_at', $year)->count() + 1;

        return sprintf('%d-%04d', $year, $count);
    }

    /**
     * Сгруппированные строки счёта из неучтённых time-entries клиента.
     *
     * @return array<int, array{description: string, quantity: float, unit_price: float, amount: float, time_entry_ids: array<int>}>
     */
    public function suggestItemsFromTimeEntries(Client $client): array
    {
        $rate = (float) ($client->hourly_rate ?? 0);
        if ($rate <= 0) {
            return [];
        }

        $projectIds = $client->projects()->pluck('id');
        if ($projectIds->isEmpty()) {
            return [];
        }

        $entries = TimeEntry::whereIn('project_id', $projectIds)
            ->where('is_running', false)
            ->whereNull('invoice_item_id')
            ->with('project')
            ->get()
            ->groupBy('project_id');

        $items = [];
        foreach ($entries as $projectId => $group) {
            $minutes = (int) $group->sum('duration_minutes');
            if ($minutes <= 0) {
                continue;
            }
            $hours = round($minutes / 60, 2);
            $items[] = [
                'description' => 'Работа по проекту: '.$group->first()->project->name,
                'quantity' => $hours,
                'unit_price' => $rate,
                'amount' => round($hours * $rate, 2),
                'time_entry_ids' => $group->pluck('id')->all(),
            ];
        }

        return $items;
    }

    /**
     * @param  array<string, mixed>  $data
     * @param  array<int, array<string, mixed>>  $items
     */
    public function create(array $data, array $items, int $userId): Invoice
    {
        return DB::transaction(function () use ($data, $items, $userId) {
            $invoice = Invoice::create([
                ...$data,
                'user_id' => $userId,
                'number' => $this->nextNumber(),
                'payment_token' => Str::random(48),
                'status' => $data['status'] ?? 'draft',
            ]);

            foreach ($items as $i => $item) {
                $invoice->items()->create([
                    'description' => $item['description'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'amount' => round((float) $item['quantity'] * (float) $item['unit_price'], 2),
                    'sort_order' => $i,
                ]);
            }

            $this->recalculate($invoice);

            return $invoice->fresh('items');
        });
    }

    /**
     * @param  array<string, mixed>  $data
     * @param  array<int, array<string, mixed>>  $items
     */
    public function update(Invoice $invoice, array $data, array $items): Invoice
    {
        return DB::transaction(function () use ($invoice, $data, $items) {
            $invoice->update($data);
            $invoice->items()->delete();

            foreach ($items as $i => $item) {
                $invoice->items()->create([
                    'description' => $item['description'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'amount' => round((float) $item['quantity'] * (float) $item['unit_price'], 2),
                    'sort_order' => $i,
                ]);
            }

            $this->recalculate($invoice);

            return $invoice->fresh('items');
        });
    }

    public function recalculate(Invoice $invoice): void
    {
        $subtotal = (float) $invoice->items()->sum('amount');
        $taxRate = (float) $invoice->tax_rate;
        $discount = (float) $invoice->discount;
        $taxable = max($subtotal - $discount, 0);
        $taxAmount = round($taxable * ($taxRate / 100), 2);
        $total = round($taxable + $taxAmount, 2);

        $invoice->update([
            'subtotal' => $subtotal,
            'tax_amount' => $taxAmount,
            'total' => $total,
        ]);
    }

    public function recordPayment(Invoice $invoice, float $amount): void
    {
        $paid = round((float) $invoice->paid_amount + $amount, 2);
        $status = $paid >= (float) $invoice->total
            ? 'paid'
            : 'partially_paid';

        $invoice->update([
            'paid_amount' => $paid,
            'status' => $status,
            'paid_at' => $status === 'paid' ? now() : $invoice->paid_at,
        ]);
    }
}
