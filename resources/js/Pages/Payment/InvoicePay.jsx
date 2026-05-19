import { Head, router } from '@inertiajs/react';

const fmt = (v) => new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 2 }).format(Number(v || 0));

export default function InvoicePay({ invoice, client, items, token, alreadyPaid }) {
    function pay() {
        router.post(`/pay/invoice/${token}/checkout`);
    }

    return (
        <div className="min-h-screen bg-background py-12">
            <Head title={`Оплата счёта № ${invoice.number}`} />
            <div className="mx-auto max-w-2xl space-y-6 px-4">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-foreground">Счёт № {invoice.number}</h1>
                    <p className="mt-1 text-muted-foreground">Для {client.name}{client.company ? `, ${client.company}` : ''}</p>
                </div>

                <div className="rounded-lg border border-border bg-card p-6 space-y-4">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Срок оплаты:</span>
                        <span className="text-foreground">{new Date(invoice.due_at).toLocaleDateString('ru-RU')}</span>
                    </div>

                    <table className="w-full text-sm">
                        <tbody>
                            {items.map((it) => (
                                <tr key={it.id} className="border-b border-border last:border-0">
                                    <td className="py-2">{it.description}</td>
                                    <td className="py-2 text-right">{fmt(it.amount)} {invoice.currency}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="flex justify-between border-t border-border pt-2 text-lg font-semibold">
                        <span>К оплате:</span>
                        <span>{fmt(Number(invoice.total) - Number(invoice.paid_amount))} {invoice.currency}</span>
                    </div>
                </div>

                {alreadyPaid ? (
                    <div className="rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 text-center text-green-700 dark:text-green-400">
                        Счёт уже оплачен. Спасибо!
                    </div>
                ) : (
                    <>
                        <button onClick={pay} className="w-full rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                            Оплатить через ЮKassa
                        </button>
                        <p className="mt-2 text-center text-xs text-muted-foreground">
                            Карты (МИР, Visa, Mastercard) · СБП · ЮMoney
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}
