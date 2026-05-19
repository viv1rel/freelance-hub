<?php

declare(strict_types=1);

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Requests\InvoiceRequest;
use App\Models\Client;
use App\Models\Invoice;
use App\Notifications\InvoiceSent;
use App\Services\InvoiceService;
use App\Services\PdfService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Inertia\Inertia;
use Inertia\Response;

class InvoiceController extends Controller
{
    public function __construct(private readonly InvoiceService $invoices) {}

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Invoice::class);

        $query = Invoice::query()->with('client')->latest();

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        if ($clientId = $request->query('client_id')) {
            $query->where('client_id', $clientId);
        }

        return Inertia::render('Invoices/Index', [
            'invoices' => $query->paginate(15)->withQueryString(),
            'clients' => Client::select('id', 'name')->orderBy('name')->get(),
            'filters' => $request->only(['status', 'client_id']),
        ]);
    }

    public function create(Request $request): Response
    {
        $this->authorize('create', Invoice::class);

        $clientId = $request->query('client_id');
        $suggested = [];
        if ($clientId) {
            /** @var Client|null $client */
            $client = Client::find($clientId);
            if ($client) {
                $suggested = $this->invoices->suggestItemsFromTimeEntries($client);
            }
        }

        return Inertia::render('Invoices/Create', [
            'clients' => Client::select('id', 'name', 'currency', 'hourly_rate')->orderBy('name')->get(),
            'preselectedClientId' => $clientId ? (int) $clientId : null,
            'suggestedItems' => $suggested,
            'nextNumber' => $this->invoices->nextNumber(),
        ]);
    }

    public function store(InvoiceRequest $request): RedirectResponse
    {
        $this->authorize('create', Invoice::class);

        $data = $request->validated();
        $items = $data['items'];
        unset($data['items']);

        $invoice = $this->invoices->create($data, $items, $request->user()->id);

        return redirect()->route('invoices.show', $invoice)->with('success', 'Счёт создан.');
    }

    public function show(Invoice $invoice): Response
    {
        $this->authorize('view', $invoice);

        $invoice->load(['client', 'items', 'transactions']);

        return Inertia::render('Invoices/Show', [
            'invoice' => $invoice,
            'payUrl' => route('invoices.pay', ['token' => $invoice->payment_token]),
        ]);
    }

    public function edit(Invoice $invoice): Response
    {
        $this->authorize('update', $invoice);

        $invoice->load('items');

        return Inertia::render('Invoices/Edit', [
            'invoice' => $invoice,
            'clients' => Client::select('id', 'name', 'currency', 'hourly_rate')->orderBy('name')->get(),
        ]);
    }

    public function update(InvoiceRequest $request, Invoice $invoice): RedirectResponse
    {
        $this->authorize('update', $invoice);

        $data = $request->validated();
        $items = $data['items'];
        unset($data['items']);

        $this->invoices->update($invoice, $data, $items);

        return redirect()->route('invoices.show', $invoice)->with('success', 'Счёт обновлён.');
    }

    public function destroy(Invoice $invoice): RedirectResponse
    {
        $this->authorize('delete', $invoice);

        $invoice->delete();

        return redirect()->route('invoices.index')->with('success', 'Счёт удалён.');
    }

    public function send(Invoice $invoice): RedirectResponse
    {
        $this->authorize('update', $invoice);

        $invoice->load('client');

        if (! $invoice->client->email) {
            return back()->with('error', 'У клиента не указан email.');
        }

        $payUrl = route('invoices.pay', ['token' => $invoice->payment_token]);

        $invoice->client->notify(new InvoiceSent($invoice, $payUrl));

        $invoice->update([
            'status' => in_array($invoice->status, ['draft'], true) ? 'sent' : $invoice->status,
            'sent_at' => now(),
        ]);

        return back()->with('success', 'Счёт отправлен клиенту.');
    }

    public function pdf(Invoice $invoice, PdfService $pdfService): HttpResponse
    {
        $this->authorize('view', $invoice);

        return response($pdfService->streamInvoice($invoice), 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="invoice-'.$invoice->number.'.pdf"',
        ]);
    }

    public function markPaid(Invoice $invoice): RedirectResponse
    {
        $this->authorize('update', $invoice);

        $remaining = max((float) $invoice->total - (float) $invoice->paid_amount, 0);
        $this->invoices->recordPayment($invoice, $remaining);

        return back()->with('success', 'Счёт отмечен оплаченным.');
    }
}
