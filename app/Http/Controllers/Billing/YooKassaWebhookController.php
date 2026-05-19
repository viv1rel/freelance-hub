<?php

declare(strict_types=1);

namespace App\Http\Controllers\Billing;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Subscription;
use App\Models\Transaction;
use App\Services\InvoiceService;
use App\Services\YooKassaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class YooKassaWebhookController extends Controller
{
    public function handle(Request $request, YooKassaService $yookassa, InvoiceService $invoices): JsonResponse
    {
        try {
            $event = $yookassa->parseWebhook($request->getContent());
        } catch (\Throwable $e) {
            Log::warning('YooKassa webhook parse error', ['error' => $e->getMessage()]);

            return response()->json(['error' => 'parse error'], 400);
        }

        if ($event['status'] !== 'succeeded') {
            return response()->json(['received' => true]);
        }

        $type = $event['metadata']['type'] ?? null;

        match ($type) {
            'invoice' => $this->handleInvoicePayment($event, $invoices),
            'subscription', 'subscription_renewal' => $this->handleSubscriptionPayment($event),
            default => null,
        };

        return response()->json(['received' => true]);
    }

    /**
     * @param  array<string, mixed>  $event
     */
    private function handleInvoicePayment(array $event, InvoiceService $invoices): void
    {
        $invoiceId = $event['metadata']['invoice_id'] ?? null;
        $tenantId = $event['metadata']['tenant_id'] ?? null;

        if (! $invoiceId) {
            return;
        }

        if ($tenantId) {
            tenancy()->initialize($tenantId);
        }

        $transaction = Transaction::where('yookassa_payment_id', $event['payment_id'])->first();

        if ($transaction) {
            $transaction->update(['status' => 'succeeded', 'payload' => $event]);
        }

        /** @var Invoice|null $invoice */
        $invoice = Invoice::find($invoiceId);
        if ($invoice) {
            $invoices->recordPayment($invoice, $event['amount']);
        }
    }

    /**
     * @param  array<string, mixed>  $event
     */
    private function handleSubscriptionPayment(array $event): void
    {
        $userId = $event['metadata']['user_id'] ?? null;
        $tenantId = $event['metadata']['tenant_id'] ?? null;

        if (! $tenantId) {
            return;
        }

        $subscription = Subscription::where('tenant_id', $tenantId)
            ->where('yookassa_payment_id', $event['payment_id'])
            ->first();

        if ($subscription) {
            $subscription->update([
                'status' => 'active',
                'yookassa_payment_method_id' => $event['payment_method_id'],
                'current_period_end' => now()->addMonth(),
            ]);
        } else {
            Subscription::create([
                'tenant_id' => $tenantId,
                'user_id' => $userId,
                'plan' => 'pro',
                'status' => 'active',
                'yookassa_payment_id' => $event['payment_id'],
                'yookassa_payment_method_id' => $event['payment_method_id'],
                'current_period_start' => now(),
                'current_period_end' => now()->addMonth(),
            ]);
        }
    }
}
