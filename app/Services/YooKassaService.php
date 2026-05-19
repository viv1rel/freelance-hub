<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Invoice;
use App\Models\Transaction;
use YooKassa\Client;
use YooKassa\Client\CurlClient;
use YooKassa\Common\Exceptions\ApiConnectionException;
use YooKassa\Model\Notification\NotificationSucceeded;
use YooKassa\Model\Notification\NotificationWaitingForCapture;
use YooKassa\Request\Payments\CreatePaymentResponse;

class YooKassaService
{
    /**
     * DNS api.yookassa.ru возвращает несколько IP, и не все из них стабильно доступны
     * из ряда сетей — на «плохом» IP cURL висит до полного таймаута. Снижаем connect-таймаут
     * и ретраим, чтобы попасть на рабочий IP за разумное время.
     */
    private const CONNECTION_TIMEOUT_SECONDS = 5;

    private const REQUEST_TIMEOUT_SECONDS = 15;

    private const MAX_ATTEMPTS = 3;

    private ?Client $client = null;

    private function client(): Client
    {
        if ($this->client === null) {
            $curl = new CurlClient;
            $curl->setConnectionTimeout(self::CONNECTION_TIMEOUT_SECONDS);
            $curl->setTimeout(self::REQUEST_TIMEOUT_SECONDS);

            $this->client = new Client;
            $this->client->setApiClient($curl);
            $this->client->setAuth(
                (int) config('services.yookassa.shop_id'),
                (string) config('services.yookassa.secret_key')
            );
        }

        return $this->client;
    }

    /**
     * Идемпотентный вызов createPayment с ретраями: один и тот же idempotencyKey
     * безопасно повторяется — ЮKassa вернёт уже созданный платёж вместо дубликата.
     *
     * @param  array<string, mixed>  $payload
     */
    private function createPaymentWithRetry(array $payload, string $idempotencyKey): CreatePaymentResponse
    {
        $lastException = null;

        for ($attempt = 1; $attempt <= self::MAX_ATTEMPTS; $attempt++) {
            try {
                return $this->client()->createPayment($payload, $idempotencyKey);
            } catch (ApiConnectionException $e) {
                $lastException = $e;
            }
        }

        throw $lastException;
    }

    /** @return array{payment_id: string, confirmation_url: string} */
    public function createInvoicePayment(Invoice $invoice, string $returnUrl): array
    {
        $amount = (float) $invoice->total - (float) $invoice->paid_amount;

        $idempotencyKey = 'invoice-'.$invoice->id.'-'.time();

        $response = $this->createPaymentWithRetry([
            'amount' => [
                'value' => number_format($amount, 2, '.', ''),
                'currency' => $invoice->currency === 'RUB' ? 'RUB' : $invoice->currency,
            ],
            'confirmation' => [
                'type' => 'redirect',
                'return_url' => $returnUrl,
            ],
            'capture' => true,
            'description' => 'Счёт № '.$invoice->number,
            'metadata' => [
                'invoice_id' => (string) $invoice->id,
                'type' => 'invoice',
            ],
        ], $idempotencyKey);

        Transaction::create([
            'invoice_id' => $invoice->id,
            'yookassa_payment_id' => $response->getId(),
            'amount' => $amount,
            'currency' => $invoice->currency,
            'status' => 'pending',
        ]);

        return [
            'payment_id' => $response->getId(),
            'confirmation_url' => $response->getConfirmation()->getConfirmationUrl(),
        ];
    }

    /**
     * Подписка Pro с сохранением payment_method для последующих списаний.
     *
     * @return array{payment_id: string, confirmation_url: string}
     */
    public function createSubscriptionPayment(string $tenantId, int $userId, string $returnUrl): array
    {
        $price = (int) config('services.yookassa.pro_price', 99000);
        $amount = $price / 100;

        $idempotencyKey = 'sub-'.$tenantId.'-'.time();

        $response = $this->createPaymentWithRetry([
            'amount' => [
                'value' => number_format($amount, 2, '.', ''),
                'currency' => 'RUB',
            ],
            'confirmation' => [
                'type' => 'redirect',
                'return_url' => $returnUrl,
            ],
            'capture' => true,
            'save_payment_method' => true,
            'description' => 'Подписка FreelanceHub Pro',
            'metadata' => [
                'tenant_id' => $tenantId,
                'user_id' => (string) $userId,
                'type' => 'subscription',
            ],
        ], $idempotencyKey);

        return [
            'payment_id' => $response->getId(),
            'confirmation_url' => $response->getConfirmation()->getConfirmationUrl(),
        ];
    }

    /** @return array{event: string, payment_id: string, status: string, metadata: array<string, mixed>, payment_method_id: string|null, amount: float} */
    public function parseWebhook(string $body): array
    {
        $data = json_decode($body, true);

        $notification = match ($data['event'] ?? '') {
            'payment.succeeded' => new NotificationSucceeded($data),
            'payment.waiting_for_capture' => new NotificationWaitingForCapture($data),
            default => null,
        };

        $payment = $notification?->getObject();

        return [
            'event' => $data['event'] ?? '',
            'payment_id' => $payment?->getId() ?? '',
            'status' => $payment?->getStatus() ?? '',
            'metadata' => (array) ($payment?->getMetadata() ?? []),
            'payment_method_id' => $payment?->getPaymentMethod()?->getId(),
            'amount' => (float) ($payment?->getAmount()?->getValue() ?? 0),
        ];
    }
}
