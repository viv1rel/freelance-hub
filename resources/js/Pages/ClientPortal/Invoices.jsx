import AppLayout from '@/Layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';

const STATUS_LABEL = {
    draft: 'Черновик',
    sent: 'Ожидает оплаты',
    partially_paid: 'Частично оплачен',
    paid: 'Оплачен',
    overdue: 'Просрочен',
};

const STATUS_BADGE = {
    draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    sent: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    partially_paid: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    paid: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    overdue: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

function formatMoney(value, currency) {
    return new Intl.NumberFormat('ru-RU', { style: 'currency', currency, minimumFractionDigits: 0 }).format(value);
}

export default function ClientInvoices({ client, invoices }) {
    return (
        <AppLayout>
            <Head title="Мои счета" />
            <div className="mx-auto max-w-5xl space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Мои счета</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {client.company ? `${client.company} · ` : ''}{client.name}
                    </p>
                </div>

                {invoices.length === 0 ? (
                    <div className="rounded-lg border border-border bg-card p-12 text-center text-muted-foreground">
                        Счетов пока нет.
                    </div>
                ) : (
                    <div className="rounded-lg border border-border bg-card overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="border-b border-border bg-muted/30 text-left text-xs uppercase text-muted-foreground">
                                <tr>
                                    <th className="px-6 py-3 font-medium">№</th>
                                    <th className="px-6 py-3 font-medium">Статус</th>
                                    <th className="px-6 py-3 font-medium">Выставлен</th>
                                    <th className="px-6 py-3 font-medium">Срок оплаты</th>
                                    <th className="px-6 py-3 font-medium text-right">Сумма</th>
                                    <th className="px-6 py-3 font-medium text-right">Действия</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.map((inv) => (
                                    <tr key={inv.id} className="border-b border-border last:border-0">
                                        <td className="px-6 py-4 font-medium text-foreground">
                                            <Link href={`/portal/invoices/${inv.id}`} className="hover:text-primary">
                                                {inv.number}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE[inv.status]}`}>
                                                {STATUS_LABEL[inv.status]}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">{inv.issued_at}</td>
                                        <td className="px-6 py-4 text-muted-foreground">{inv.due_at}</td>
                                        <td className="px-6 py-4 text-right text-foreground">
                                            {formatMoney(inv.total, inv.currency)}
                                            {inv.status === 'partially_paid' && (
                                                <div className="text-xs text-muted-foreground">
                                                    Оплачено: {formatMoney(inv.paid_amount, inv.currency)}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {['sent', 'overdue', 'partially_paid'].includes(inv.status) && inv.payment_token && (
                                                <a
                                                    href={`/pay/invoice/${inv.payment_token}`}
                                                    className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                                                >
                                                    Оплатить
                                                </a>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
