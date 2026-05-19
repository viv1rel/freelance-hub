<?php

use App\Models\Client;
use App\Models\Invoice;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->runTenantMigrations();
});

function portalSetup(): array
{
    $admin = test()->makeUserInWorkspace('admin');
    $tenant = Tenant::find($admin->currentTenantId());

    $clientUser = User::factory()->create();
    $clientUser->workspaces()->attach($tenant->id, ['role' => 'client', 'joined_at' => now()]);
    $clientUser->update(['current_tenant_id' => $tenant->id]);
    $clientUser = $clientUser->fresh();

    $client = Client::create([
        'user_id' => $clientUser->id,
        'name' => 'Acme',
        'currency' => 'RUB',
    ]);

    $invoice = Invoice::create([
        'client_id' => $client->id, 'user_id' => $admin->id,
        'number' => 'INV-001', 'status' => 'sent', 'currency' => 'RUB',
        'issued_at' => now()->toDateString(), 'due_at' => now()->addDays(7)->toDateString(),
        'subtotal' => 1000, 'tax_rate' => 0, 'tax_amount' => 0, 'discount' => 0,
        'total' => 1000, 'paid_amount' => 0,
        'payment_token' => 'tok-'.uniqid(),
    ]);

    return compact('tenant', 'admin', 'clientUser', 'client', 'invoice');
}

test('client sees own invoices', function () {
    ['clientUser' => $u] = portalSetup();
    $this->actingAs($u)->get('/portal/invoices')->assertOk();
});

test('client cannot view another client invoice', function () {
    ['tenant' => $tenant, 'admin' => $admin, 'clientUser' => $clientUser] = portalSetup();

    $otherUser = User::factory()->create();
    $otherUser->workspaces()->attach($tenant->id, ['role' => 'client', 'joined_at' => now()]);
    $otherUser->update(['current_tenant_id' => $tenant->id]);

    $otherClient = Client::create(['user_id' => $otherUser->id, 'name' => 'Other', 'currency' => 'RUB']);
    $otherInvoice = Invoice::create([
        'client_id' => $otherClient->id, 'user_id' => $admin->id,
        'number' => 'INV-OTHER', 'status' => 'sent', 'currency' => 'RUB',
        'issued_at' => now()->toDateString(), 'due_at' => now()->addDays(7)->toDateString(),
        'subtotal' => 500, 'tax_rate' => 0, 'tax_amount' => 0, 'discount' => 0,
        'total' => 500, 'paid_amount' => 0,
        'payment_token' => 'tok-other-'.uniqid(),
    ]);

    $this->actingAs($clientUser)
        ->get("/portal/invoices/{$otherInvoice->id}")
        ->assertStatus(404);
});

test('client cannot access admin pages', function () {
    ['clientUser' => $u] = portalSetup();

    $this->actingAs($u)->get('/projects')->assertStatus(403);
    $this->actingAs($u)->get('/clients')->assertStatus(403);
    $this->actingAs($u)->get('/invoices')->assertStatus(403);
});

test('dashboard redirects client to portal', function () {
    ['clientUser' => $u] = portalSetup();
    $this->actingAs($u)->get('/dashboard')->assertRedirect('/portal/invoices');
});
