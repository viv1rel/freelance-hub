<?php

use App\Http\Controllers\Auth\InvitationController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Auth\TwoFactorController;
use App\Http\Controllers\Billing\SubscriptionController;
use App\Http\Controllers\Billing\YooKassaWebhookController;
use App\Http\Controllers\Settings\TeamController;
use App\Http\Controllers\Tenant\ClientController;
use App\Http\Controllers\Tenant\ClientPortalController;
use App\Http\Controllers\Tenant\DashboardController;
use App\Http\Controllers\Tenant\InvoiceController;
use App\Http\Controllers\Tenant\InvoicePaymentController;
use App\Http\Controllers\Tenant\ProjectController;
use App\Http\Controllers\Tenant\TaskController;
use App\Http\Controllers\Tenant\TimeEntryController;
use App\Http\Controllers\WorkspaceSwitchController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Лендинг для гостей; авторизованных кидаем на дашборд.
Route::get('/', function () {
    if (auth()->check()) {
        return redirect()->route('dashboard');
    }

    return Inertia::render('Landing');
})->name('landing');

Route::middleware('guest')->group(function () {
    Route::get('/register', [RegisterController::class, 'create'])->name('register');
    Route::post('/register', [RegisterController::class, 'store'])
        ->middleware('throttle:5,1');

    Route::get('/login', [LoginController::class, 'create'])->name('login');
    Route::post('/login', [LoginController::class, 'store'])
        ->middleware('throttle:10,1');

    Route::get('/two-factor', [TwoFactorController::class, 'create'])->name('two-factor.create');
    Route::post('/two-factor', [TwoFactorController::class, 'store'])
        ->middleware('throttle:10,1')
        ->name('two-factor.store');

    Route::get('/invitations/{token}/accept', [InvitationController::class, 'show'])->name('invitations.show');
    Route::post('/invitations/{token}/accept', [InvitationController::class, 'accept'])
        ->middleware('throttle:5,1')
        ->name('invitations.accept');
});

Route::middleware(['auth', 'tenant'])->group(function () {
    Route::get('/dashboard', function () {
        return auth()->user()->isClient()
            ? redirect()->route('portal.invoices')
            : app(DashboardController::class)->index();
    })->name('dashboard');

    Route::middleware('role:client')->group(function () {
        Route::get('/portal/invoices', [ClientPortalController::class, 'invoices'])->name('portal.invoices');
        Route::get('/portal/invoices/{invoice}', [ClientPortalController::class, 'show'])->name('portal.invoices.show');
    });

    Route::post('/logout', [LoginController::class, 'destroy'])->name('logout');

    Route::post('/workspaces/{tenant}/switch', WorkspaceSwitchController::class)
        ->name('workspaces.switch');

    Route::get('/settings', fn () => Inertia::render('Settings/Index'))->name('settings.index');

    Route::get('/settings/two-factor', [TwoFactorController::class, 'setup'])->name('settings.two-factor');
    Route::post('/settings/two-factor/enable', [TwoFactorController::class, 'enable'])->name('settings.two-factor.enable');
    Route::delete('/settings/two-factor/disable', [TwoFactorController::class, 'disable'])->name('settings.two-factor.disable');

    Route::middleware('role:admin')->group(function () {
        Route::get('/settings/team', [TeamController::class, 'index'])
            ->name('settings.team');
        Route::patch('/settings/team/{member}/role', [TeamController::class, 'updateRole'])
            ->name('settings.team.role');
        Route::delete('/settings/team/{member}', [TeamController::class, 'destroy'])
            ->name('settings.team.destroy');
        Route::delete('/settings/team/invitations/{invitation}', [TeamController::class, 'revokeInvitation'])
            ->name('settings.team.invitation.revoke');

        Route::post('/invitations', [InvitationController::class, 'store'])
            ->name('invitations.store');
    });

    Route::middleware('role:admin,freelancer')->group(function () {
        Route::post('/projects', [ProjectController::class, 'store'])
            ->middleware('subscription.limit:project')->name('projects.store');
        Route::resource('projects', ProjectController::class)->except(['store']);

        Route::resource('tasks', TaskController::class);
        Route::post('/tasks/reorder', [TaskController::class, 'reorder'])->name('tasks.reorder');

        Route::get('/time-tracking', [TimeEntryController::class, 'index'])->name('time-tracking.index');
        Route::post('/time-tracking', [TimeEntryController::class, 'store'])->name('time-tracking.store');
        Route::post('/time-tracking/start', [TimeEntryController::class, 'start'])->name('time-tracking.start');
        Route::post('/time-tracking/stop', [TimeEntryController::class, 'stop'])->name('time-tracking.stop');
        Route::delete('/time-tracking/{timeEntry}', [TimeEntryController::class, 'destroy'])->name('time-tracking.destroy');
        Route::get('/time-tracking/reports', [TimeEntryController::class, 'reports'])->name('time-tracking.reports');

        Route::post('/clients', [ClientController::class, 'store'])
            ->middleware('subscription.limit:client')->name('clients.store');
        Route::resource('clients', ClientController::class)->except(['store']);

        Route::resource('invoices', InvoiceController::class);
        Route::post('/invoices/{invoice}/send', [InvoiceController::class, 'send'])->name('invoices.send');
        Route::get('/invoices/{invoice}/pdf', [InvoiceController::class, 'pdf'])->name('invoices.pdf');
        Route::post('/invoices/{invoice}/mark-paid', [InvoiceController::class, 'markPaid'])->name('invoices.mark-paid');

        Route::get('/billing', [SubscriptionController::class, 'index'])->name('billing.index');
        Route::post('/billing/subscribe', [SubscriptionController::class, 'subscribe'])->name('billing.subscribe');
        Route::post('/billing/cancel', [SubscriptionController::class, 'cancel'])->name('billing.cancel');
        Route::post('/billing/resume', [SubscriptionController::class, 'resume'])->name('billing.resume');
    });
});

// Публичная оплата счёта по токену + webhook ЮKassa.
Route::get('/pay/invoice/{token}', [InvoicePaymentController::class, 'show'])->name('invoices.pay');
Route::post('/pay/invoice/{token}/checkout', [InvoicePaymentController::class, 'checkout'])->name('invoices.pay.checkout');
Route::get('/pay/invoice/{token}/success', [InvoicePaymentController::class, 'success'])->name('invoices.pay.success');

Route::post('/yookassa/webhook', [YooKassaWebhookController::class, 'handle'])
    ->name('yookassa.webhook');
