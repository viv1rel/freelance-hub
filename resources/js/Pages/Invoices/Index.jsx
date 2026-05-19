import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';

const statusLabels = {
    draft: 'Черновик',
    sent: 'Отправлен',
    partially_paid: 'Частично оплачен',
    paid: 'Оплачен',
    overdue: 'Просрочен',
};

const statusColors = {
    draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    sent: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    partially_paid: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    paid: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    overdue: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

function fmt(v) {
    return new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 2 }).format(Number(v || 0));
}

export default function InvoicesIndex({ invoices, clients, filters }) {
    const { flash } = usePage().props;

    function handleFilter(key, value) {
        router.get('/invoices', { ...filters, [key]: value || undefined }, { preserveState: true, replace: true });
    }

    return (
        <AppLayout>
            <Head title="Счета" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-foreground">Счета</h1>
                    <Link href="/invoices/create" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                        Новый счёт
                    </Link>
                </div>

                {flash?.success && (
                    <div className="rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-3 text-sm text-green-700 dark:text-green-400">{flash.success}</div>
                )}
                {flash?.error && (
                    <div className="rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-sm text-red-700 dark:text-red-400">{flash.error}</div>
                )}

                <div className="flex gap-3">
                    <select
                        defaultValue={filters.status || ''}
                        onChange={(e) => handleFilter('status', e.target.value)}
                        className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                        <option value="">Все статусы</option>
                        {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                    <select
                        defaultValue={filters.client_id || ''}
                        onChange={(e) => handleFilter('client_id', e.target.value)}
                        className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                        <option value="">Все клиенты</option>
                        {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>

                <div className="overflow-x-auto rounded-lg border border-border bg-card">
                    <table className="w-full text-sm">
                        <thead className="border-b border-border bg-muted/50">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Номер</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Клиент</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Выставлен</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Срок</th>
                                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Сумма</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Статус</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.data.map((inv) => (
                                <tr key={inv.id} onClick={() => router.visit(`/invoices/${inv.id}`)} className="cursor-pointer border-b border-border last:border-0 hover:bg-accent/50">
                                    <td className="px-4 py-3 font-medium text-foreground">№ {inv.number}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{inv.client?.name}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{new Date(inv.issued_at).toLocaleDateString('ru-RU')}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{new Date(inv.due_at).toLocaleDateString('ru-RU')}</td>
                                    <td className="px-4 py-3 text-right font-medium text-foreground">{fmt(inv.total)} {inv.currency}</td>
                                    <td className="px-4 py-3">
                                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[inv.status]}`}>
                                            {statusLabels[inv.status]}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {invoices.data.length === 0 && (
                        <div className="py-12 text-center text-muted-foreground">Счетов пока нет.</div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
