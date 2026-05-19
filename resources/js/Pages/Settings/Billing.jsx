import AppLayout from '@/Layouts/AppLayout';
import { Head, router, usePage } from '@inertiajs/react';

export default function Billing({ plans, subscribed, onGracePeriod, currentPlan, periodEnd }) {
    const { flash } = usePage().props;

    const subscribe = () => router.post('/billing/subscribe');
    const cancel = () => { if (confirm('Отменить подписку Pro?')) router.post('/billing/cancel'); };
    const resume = () => router.post('/billing/resume');

    return (
        <AppLayout>
            <Head title="Подписка" />
            <div className="mx-auto max-w-4xl space-y-6">
                <h1 className="text-2xl font-bold text-foreground">Тарифы и подписка</h1>

                {flash?.success && (
                    <div className="rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-3 text-sm text-green-700 dark:text-green-400">
                        {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-sm text-red-700 dark:text-red-400">
                        {flash.error}
                    </div>
                )}

                {onGracePeriod && periodEnd && (
                    <div className="rounded-md bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 text-sm text-yellow-800 dark:text-yellow-400 flex items-center justify-between">
                        <span>Подписка отменена. Доступ Pro активен до <strong>{periodEnd}</strong>.</span>
                        <button onClick={resume} className="ml-4 text-primary hover:underline">Возобновить</button>
                    </div>
                )}

                <div className="grid gap-6 md:grid-cols-2">
                    {Object.entries(plans).map(([key, plan]) => {
                        const isCurrent = currentPlan === key;
                        return (
                            <div
                                key={key}
                                className={`rounded-xl border p-6 ${isCurrent ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}
                            >
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-bold text-foreground">{plan.name}</h2>
                                    {isCurrent && (
                                        <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                                            Текущий
                                        </span>
                                    )}
                                </div>

                                <div className="mt-2 flex items-baseline gap-2">
                                    <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                                    <span className="text-sm text-muted-foreground">{plan.period}</span>
                                </div>

                                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                                    {plan.features.map((f, i) => (
                                        <li key={i} className="flex items-start gap-2">
                                            <span className="text-primary mt-0.5">✓</span>
                                            <span>{f}</span>
                                        </li>
                                    ))}
                                </ul>

                                <div className="mt-6">
                                    {key === 'pro' && !subscribed && !onGracePeriod && (
                                        <button
                                            onClick={subscribe}
                                            className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                                        >
                                            Перейти на Pro — оплата через ЮKassa
                                        </button>
                                    )}
                                    {key === 'pro' && subscribed && !onGracePeriod && (
                                        <div className="space-y-2">
                                            {periodEnd && (
                                                <p className="text-xs text-muted-foreground text-center">
                                                    Следующее списание: {periodEnd}
                                                </p>
                                            )}
                                            <button
                                                onClick={cancel}
                                                className="w-full rounded-md border border-destructive text-destructive px-4 py-2 text-sm hover:bg-destructive/10"
                                            >
                                                Отменить подписку
                                            </button>
                                        </div>
                                    )}
                                    {key === 'pro' && onGracePeriod && (
                                        <button
                                            onClick={resume}
                                            className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                                        >
                                            Возобновить подписку
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
                    <strong>Оплата через ЮKassa:</strong> банковские карты (Visa, Mastercard, МИР), СБП, ЮMoney, оплата через банки.
                </div>
            </div>
        </AppLayout>
    );
}
