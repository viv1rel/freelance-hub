import AppLayout from '@/Layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';

const STATUS_LABEL = {
    draft: 'Черновик',
    sent: 'Ожидает оплаты',
    partially_paid: 'Частично оплачен',
    paid: 'Оплачен',
    overdue: 'Просрочен',
};

function formatMoney(value, currency) {
    return new Intl.NumberFormat('ru-RU', { style: 'currency', currency, minimumFractionDigits: 2 }).format(value);
}

export default function ClientInvoiceShow({ invoice }) {
    return (
        <AppLayout>
            <Head title={`Счёт ${invoice.number}`} />
            <div className="mx-auto max-w-3xl space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <Link href="/portal/invoices" className="text-sm text-muted-foreground hover:text-foreground">
                            ← К списку счетов
                        </Link>
                        <h1 className="mt-2 text-2xl font-bold text-foreground">Счёт {invoice.number}</h1>
                        <p className="text-sm text-muted-foreground">Статус: {STATUS_LABEL[invoice.status]}</p>
                    </div>
                    {['sent', 'overdue', 'partially_paid'].includes(invoice.status) && invoice.payment_token && (
                        <a
                            href={`/pay/invoice/${invoice.payment_token}`}
                            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                        >
                            Оплатить
                        </a>
                    )}
                </div>

                <div className="rounded-lg border border-border bg-card p-6 grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <div className="text-muted-foreground">Выставлен</div>
                        <div className="font-medium text-foreground">
                            {new Date(invoice.issued_at).toLocaleDateString('ru-RU')}
                        </div>
                    </div>
                    <div>
                        <div className="text-muted-foreground">Срок оплаты</div>
                        <div className="font-medium text-foreground">
                            {new Date(invoice.due_at).toLocaleDateString('ru-RU')}
                        </div>
                    </div>
                </div>

                <div className="rounded-lg border border-border bg-card overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="border-b border-border bg-muted/30 text-left text-xs uppercase text-muted-foreground">
                            <tr>
                                <th className="px-6 py-3 font-medium">Позиция</th>
                                <th className="px-6 py-3 font-medium text-right">Кол-во</th>
                                <th className="px-6 py-3 font-medium text-right">Цена</th>
                                <th className="px-6 py-3 font-medium text-right">Сумма</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoice.items.map((item) => (
                                <tr key={item.id} className="border-b border-border last:border-0">
                                    <td className="px-6 py-4 text-foreground">{item.description}</td>
                                    <td className="px-6 py-4 text-right text-muted-foreground">{Number(item.quantity)}</td>
                                    <td className="px-6 py-4 text-right text-muted-foreground">{formatMoney(item.unit_price, invoice.currency)}</td>
                                    <td className="px-6 py-4 text-right text-foreground">{formatMoney(item.amount, invoice.currency)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-muted/30 text-sm">
                            <tr>
                                <td colSpan={3} className="px-6 py-3 text-right text-muted-foreground">Итого</td>
                                <td className="px-6 py-3 text-right font-bold text-foreground">{formatMoney(invoice.total, invoice.currency)}</td>
                            </tr>
                            {Number(invoice.paid_amount) > 0 && (
                                <tr>
                                    <td colSpan={3} className="px-6 py-2 text-right text-muted-foreground">Оплачено</td>
                                    <td className="px-6 py-2 text-right text-green-600 dark:text-green-400">{formatMoney(invoice.paid_amount, invoice.currency)}</td>
                                </tr>
                            )}
                        </tfoot>
                    </table>
                </div>

                {invoice.notes && (
                    <div className="rounded-lg border border-border bg-card p-6">
                        <h2 className="text-sm font-semibold text-foreground">Заметки</h2>
                        <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">{invoice.notes}</p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
