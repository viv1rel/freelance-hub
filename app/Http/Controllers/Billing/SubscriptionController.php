<?php

declare(strict_types=1);

namespace App\Http\Controllers\Billing;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use App\Services\YooKassaService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

class SubscriptionController extends Controller
{
    public function __construct(private readonly YooKassaService $yookassa) {}

    public function index(Request $request): Response
    {
        $user = $request->user();
        $subscription = $user->subscription;

        $plans = [
            'free' => [
                'name' => 'Free',
                'price' => '0 ₽',
                'period' => 'навсегда',
                'features' => [
                    'До 3 проектов',
                    'До 3 клиентов',
                    'Все основные функции',
                    'Email-поддержка',
                ],
            ],
            'pro' => [
                'name' => 'Pro',
                'price' => '990 ₽',
                'period' => 'в месяц',
                'features' => [
                    'Безлимит проектов и клиентов',
                    'Брендинг PDF-счетов',
                    'Приоритетная поддержка',
                    'Расширенная аналитика',
                ],
            ],
        ];

        return Inertia::render('Settings/Billing', [
            'plans' => $plans,
            'subscribed' => $user->subscribed(),
            'onGracePeriod' => $user->onGracePeriod(),
            'currentPlan' => $user->subscribed() ? 'pro' : 'free',
            'periodEnd' => $subscription?->current_period_end?->format('d.m.Y'),
        ]);
    }

    public function subscribe(Request $request): SymfonyResponse|RedirectResponse
    {
        $user = $request->user();

        if ($user->subscribed()) {
            return back()->with('error', 'У вас уже активна подписка Pro.');
        }

        $returnUrl = route('billing.index').'?payment_id={payment.id}';

        $payment = $this->yookassa->createSubscriptionPayment(
            $user->currentTenantId(),
            $user->id,
            $returnUrl,
        );

        Subscription::create([
            'tenant_id' => $user->currentTenantId(),
            'user_id' => $user->id,
            'plan' => 'pro',
            'status' => 'active',
            'yookassa_payment_id' => $payment['payment_id'],
            'current_period_start' => now(),
            'current_period_end' => now()->addMonth(),
        ]);

        return Inertia::location($payment['confirmation_url']);
    }

    public function cancel(Request $request): RedirectResponse
    {
        $subscription = $request->user()->subscription;

        if (! $subscription?->isActive()) {
            return back()->with('error', 'Нет активной подписки для отмены.');
        }

        $subscription->update([
            'status' => 'cancelled',
            'cancelled_at' => now(),
        ]);

        return back()->with('success', 'Подписка отменена. Доступ Pro сохранится до '.$subscription->current_period_end->format('d.m.Y').'.');
    }

    public function resume(Request $request): RedirectResponse
    {
        $subscription = $request->user()->subscription;

        if (! $subscription?->onGracePeriod()) {
            return back()->with('error', 'Нет отменённой подписки для возобновления.');
        }

        $subscription->update([
            'status' => 'active',
            'cancelled_at' => null,
        ]);

        return back()->with('success', 'Подписка возобновлена.');
    }
}
