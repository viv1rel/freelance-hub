import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';

const statusLabels = {
    draft: 'Черновик', sent: 'Отправлен', partially_paid: 'Частично оплачен', paid: 'Оплачен', overdue: 'Просрочен',
};

const fmt = (v) => new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 2 }).format(Number(v || 0));

export default function InvoiceShow({ invoice, payUrl }) {
    const { flash, auth } = usePage().props;

    const send = () => { if (confirm('Отправить счёт клиенту по email?')) router.post(`/invoices/${invoice.id}/send`); };
    const markPaid = () => { if (confirm('Отметить счёт как оплаченный?')) router.post(`/invoices/${invoice.id}/mark-paid`); };
    const del = () => { if (confirm('Удалить счёт?')) router.delete(`/invoices/${invoice.id}`); };
    const copyLink = () => { navigator.clipboard.writeText(payUrl); alert('Ссылка скопирована'); };

    return (
        <AppLayout>
            <Head title={`Счёт № ${invoice.number}`} />
            <div className="mx-auto max-w-4xl space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/invoices" className="text-muted-foreground hover:text-foreground">&larr; Назад</Link>
                        <h1 className="text-2xl font-bold text-foreground">Счёт № {invoice.number}</h1>
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">{statusLabels[invoice.status]}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <a href={`/invoices/${invoice.id}/pdf`} target="_blank" rel="noreferrer" className="rounded-md border border-border px-3 py-2 text-sm hover:bg-accent">PDF</a>
                        <button onClick={copyLink} className="rounded-md border border-border px-3 py-2 text-sm hover:bg-accent">Ссылка на оплату</button>
                        {invoice.status !== 'paid' && (
                            <>
                                <Link href={`/invoices/${invoice.id}/edit`} className="rounded-md border border-border px-3 py-2 text-sm hover:bg-accent">Редактировать</Link>
                                <button onClick={send} className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">Отправить</button>
                                <button onClick={markPaid} className="rounded-md border border-green-600 text-green-700 dark:text-green-400 px-3 py-2 text-sm hover:bg-green-50 dark:hover:bg-green-900/20">Отметить оплаченным</button>
                            </>
                        )}
                        {auth?.user?.role === 'admin' && invoice.status !== 'paid' && (
                            <button onClick={del} className="rounded-md border border-destructive text-destructive px-3 py-2 text-sm hover:bg-destructive/10">Удалить</button>
                        )}
                    </div>
                </div>

                {flash?.success && <div className="rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-3 text-sm text-green-700 dark:text-green-400">{flash.success}</div>}
                {flash?.error && <div className="rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-sm text-red-700 dark:text-red-400">{flash.error}</div>}

                <div className="rounded-lg border border-border bg-card p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <div className="text-muted-foreground">Клиент</div>
                            <div className="font-medium text-foreground">{invoice.client?.name}</div>
                            {invoice.client?.company && <div className="text-muted-foreground">{invoice.client.company}</div>}
                            {invoice.client?.email && <div className="text-muted-foreground">{invoice.client.email}</div>}
                        </div>
                        <div className="text-right">
                            <div className="text-muted-foreground">Выставлен: <span className="text-foreground">{new Date(invoice.issued_at).toLocaleDateString('ru-RU')}</span></div>
                            <div className="text-muted-foreground">Срок: <span className="text-foreground">{new Date(invoice.due_at).toLocaleDateString('ru-RU')}</span></div>
                        </div>
                    </div>

                    <table className="w-full text-sm">
                        <thead className="border-b border-border">
                            <tr>
                                <th className="py-2 text-left font-medium text-muted-foreground">Описание</th>
                                <th className="py-2 text-right font-medium text-muted-foreground">Кол-во</th>
                                <th className="py-2 text-right font-medium text-muted-foreground">Цена</th>
                                <th className="py-2 text-right font-medium text-muted-foreground">Сумма</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoice.items.map((it) => (
                                <tr key={it.id} className="border-b border-border last:border-0">
                                    <td className="py-2 text-foreground">{it.description}</td>
                                    <td className="py-2 text-right text-foreground">{it.quantity}</td>
                                    <td className="py-2 text-right text-foreground">{fmt(it.unit_price)}</td>
                                    <td className="py-2 text-right text-foreground">{fmt(it.amount)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="ml-auto max-w-xs space-y-1 text-sm">
                        <div className="flex justify-between"><span className="text-muted-foreground">Подытог:</span><span>{fmt(invoice.subtotal)} {invoice.currency}</span></div>
                        {Number(invoice.discount) > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Скидка:</span><span>−{fmt(invoice.discount)} {invoice.currency}</span></div>}
                        {Number(invoice.tax_rate) > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Налог ({invoice.tax_rate}%):</span><span>{fmt(invoice.tax_amount)} {invoice.currency}</span></div>}
                        <div className="flex justify-between border-t border-border pt-1 font-semibold text-base"><span>Итого:</span><span>{fmt(invoice.total)} {invoice.currency}</span></div>
                        {Number(invoice.paid_amount) > 0 && <div className="flex justify-between text-green-700 dark:text-green-400"><span>Оплачено:</span><span>{fmt(invoice.paid_amount)} {invoice.currency}</span></div>}
                    </div>

                    {invoice.notes && (
                        <div className="border-t border-border pt-4 text-sm text-muted-foreground whitespace-pre-wrap">{invoice.notes}</div>
                    )}
                </div>

                {invoice.transactions?.length > 0 && (
                    <div className="rounded-lg border border-border bg-card p-6">
                        <h2 className="font-semibold text-foreground mb-3">Транзакции</h2>
                        <div className="space-y-2 text-sm">
                            {invoice.transactions.map((t) => (
                                <div key={t.id} className="flex justify-between">
                                    <span className="text-muted-foreground">{new Date(t.created_at).toLocaleString('ru-RU')} — {t.status}</span>
                                    <span className="text-foreground">{fmt(t.amount)} {t.currency}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
