<?php

use App\Models\Client;
use App\Models\Invoice;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->runTenantMigrations();
});

function invUser(): User
{
    return test()->makeUserInWorkspace('admin');
}

test('admin can create invoice with items', function () {
    $user = invUser();
    $client = Client::create(['name' => 'A', 'currency' => 'RUB']);

    $this->actingAs($user)->post('/invoices', [
        'client_id' => $client->id,
        'issued_at' => now()->toDateString(),
        'due_at' => now()->addDays(7)->toDateString(),
        'currency' => 'RUB', 'tax_rate' => 0, 'discount' => 0,
        'items' => [['description' => 'Work', 'quantity' => 2, 'unit_price' => 500]],
    ])->assertRedirect();

    expect(Invoice::where('client_id', $client->id)->exists())->toBeTrue();
});

test('admin can mark invoice paid', function () {
    $user = invUser();
    $client = Client::create(['name' => 'A', 'currency' => 'RUB']);
    $invoice = Invoice::create([
        'client_id' => $client->id, 'user_id' => $user->id,
        'number' => 'INV-X', 'status' => 'sent', 'currency' => 'RUB',
        'issued_at' => now()->toDateString(), 'due_at' => now()->addDays(7)->toDateString(),
        'subtotal' => 1000, 'tax_rate' => 0, 'tax_amount' => 0, 'discount' => 0,
        'total' => 1000, 'paid_amount' => 0,
        'payment_token' => 'tok-'.uniqid(),
    ]);

    $this->actingAs($user)
        ->post("/invoices/{$invoice->id}/mark-paid")
        ->assertRedirect();

    expect((float) $invoice->fresh()->paid_amount)->toBe(1000.0)
        ->and($invoice->fresh()->status)->toBe('paid');
});

test('freelancer can list invoices', function () {
    $user = test()->makeUserInWorkspace('freelancer');
    $this->actingAs($user)->get('/invoices')->assertOk();
});
