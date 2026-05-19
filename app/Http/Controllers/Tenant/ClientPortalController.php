<?php

declare(strict_types=1);

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\Invoice;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as HttpResponse;

class ClientPortalController extends Controller
{
    public function invoices(Request $request): Response
    {
        $client = Client::where('user_id', $request->user()->id)->first();

        if (! $client) {
            return Inertia::render('ClientPortal/NoAccess');
        }

        $invoices = Invoice::where('client_id', $client->id)
            ->with('items')
            ->orderByDesc('issued_at')
            ->get()
            ->map(fn (Invoice $i) => [
                'id' => $i->id,
                'number' => $i->number,
                'status' => $i->status,
                'currency' => $i->currency,
                'issued_at' => $i->issued_at->format('d.m.Y'),
                'due_at' => $i->due_at->format('d.m.Y'),
                'total' => (float) $i->total,
                'paid_amount' => (float) $i->paid_amount,
                'payment_token' => $i->payment_token,
            ]);

        return Inertia::render('ClientPortal/Invoices', [
            'client' => [
                'id' => $client->id,
                'name' => $client->name,
                'company' => $client->company,
            ],
            'invoices' => $invoices,
        ]);
    }

    public function show(Request $request, Invoice $invoice): Response|HttpResponse
    {
        $client = Client::where('user_id', $request->user()->id)->first();

        abort_if(! $client || $invoice->client_id !== $client->id, 404);

        $invoice->load(['items', 'transactions']);

        return Inertia::render('ClientPortal/InvoiceShow', [
            'invoice' => $invoice,
        ]);
    }
}
