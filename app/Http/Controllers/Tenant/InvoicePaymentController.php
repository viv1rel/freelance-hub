<?php

declare(strict_types=1);

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Tenant;
use App\Services\YooKassaService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

class InvoicePaymentController extends Controller
{
    public function show(string $token): Response
    {
        $invoice = $this->locate($token);

        return Inertia::render('Payment/InvoicePay', [
            'invoice' => $invoice,
            'client' => $invoice->client,
            'items' => $invoice->items,
            'token' => $token,
            'alreadyPaid' => $invoice->status === 'paid',
        ]);
    }

    public function checkout(string $token, YooKassaService $yookassa): RedirectResponse|SymfonyResponse
    {
        $invoice = $this->locate($token);

        if ($invoice->status === 'paid') {
            return redirect()->route('invoices.pay', ['token' => $token]);
        }

        $returnUrl = route('invoices.pay.success', ['token' => $token]);
        $payment = $yookassa->createInvoicePayment($invoice, $returnUrl);

        return Inertia::location($payment['confirmation_url']);
    }

    public function success(string $token): Response
    {
        $invoice = $this->locate($token);

        return Inertia::render('Payment/Success', [
            'invoice' => $invoice,
        ]);
    }

    private function locate(string $token): Invoice
    {
        /** @var Tenant $tenant */
        foreach (Tenant::all() as $tenant) {
            tenancy()->initialize($tenant);

            $invoice = Invoice::where('payment_token', $token)
                ->with(['client', 'items'])
                ->first();

            if ($invoice) {
                return $invoice;
            }

            tenancy()->end();
        }

        abort(404);
    }
}
