import { Head } from '@inertiajs/react';

export default function PaymentSuccess({ invoice }) {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <Head title="Оплата успешна" />
            <div className="max-w-md text-center space-y-4 rounded-lg border border-border bg-card p-8">
                <div className="text-5xl">✓</div>
                <h1 className="text-2xl font-bold text-foreground">Оплата получена</h1>
                <p className="text-muted-foreground">
                    Счёт № {invoice.number} успешно оплачен. Подтверждение отправлено на почту.
                </p>
            </div>
        </div>
    );
}
