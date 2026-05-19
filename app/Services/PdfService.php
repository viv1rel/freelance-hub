<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Invoice;
use Barryvdh\DomPDF\Facade\Pdf;

class PdfService
{
    public function streamInvoice(Invoice $invoice): string
    {
        $invoice->loadMissing(['client', 'items']);

        $pdf = Pdf::loadView('invoices.pdf', [
            'invoice' => $invoice,
            'client' => $invoice->client,
            'items' => $invoice->items,
            'appName' => config('app.name'),
        ])->setOption([
            'defaultFont' => 'DejaVu Sans',
            'isRemoteEnabled' => true,
            'isHtml5ParserEnabled' => true,
        ]);

        return $pdf->output();
    }
}
