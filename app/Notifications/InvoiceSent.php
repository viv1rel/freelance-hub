<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Models\Invoice;
use App\Services\PdfService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class InvoiceSent extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public Invoice $invoice, public string $payUrl) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $pdf = app(PdfService::class)->streamInvoice($this->invoice);

        return (new MailMessage)
            ->subject('Счёт № '.$this->invoice->number)
            ->greeting('Здравствуйте, '.($this->invoice->client->name ?? '').'!')
            ->line('Во вложении счёт № '.$this->invoice->number.' на сумму '.number_format((float) $this->invoice->total, 2, ',', ' ').' '.$this->invoice->currency.'.')
            ->line('Срок оплаты: '.$this->invoice->due_at->format('d.m.Y').'.')
            ->action('Оплатить онлайн', $this->payUrl)
            ->attachData($pdf, 'invoice-'.$this->invoice->number.'.pdf', [
                'mime' => 'application/pdf',
            ]);
    }
}
