import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';

const invoiceStatusLabels = {
    draft: 'Черновик',
    sent: 'Отправлен',
    partially_paid: 'Частично оплачен',
    paid: 'Оплачен',
    overdue: 'Просрочен',
};

export default function ClientShow({ client }) {
    const { flash, auth } = usePage().props;

    function handleDelete() {
        if (confirm('Удалить клиента?')) {
            router.delete(`/clients/${client.id}`);
        }
    }

    return (
        <AppLayout>
            <Head title={client.name} />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/clients" className="text-muted-foreground hover:text-foreground">&larr; Назад</Link>
                        <h1 className="text-2xl font-bold text-foreground">{client.name}</h1>
                    </div>
                    <div className="flex gap-2">
                        <Link href={`/clients/${client.id}/edit`} className="rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-accent">Редактировать</Link>
                        {auth?.user?.role === 'admin' && (
                            <button onClick={handleDelete} className="rounded-md border border-destructive text-destructive px-3 py-2 text-sm font-medium hover:bg-destructive/10">Удалить</button>
                        )}
                    </div>
                </div>

                {flash?.success && (
                    <div className="rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-3 text-sm text-green-700 dark:text-green-400">
                        {flash.success}
                    </div>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-lg border border-border bg-card p-5 space-y-2 text-sm">
                        <div><span className="text-muted-foreground">Компания: </span><span className="text-foreground">{client.company || '—'}</span></div>
                        <div><span className="text-muted-foreground">Email: </span><span className="text-foreground">{client.email || '—'}</span></div>
                        <div><span className="text-muted-foreground">Телефон: </span><span className="text-foreground">{client.phone || '—'}</span></div>
                        <div><span className="text-muted-foreground">Ставка: </span><span className="text-foreground">{client.hourly_rate ? `${client.hourly_rate} ${client.currency}` : '—'}</span></div>
                    </div>
                    {client.notes && (
                        <div className="rounded-lg border border-border bg-card p-5 text-sm">
                            <div className="font-medium text-foreground mb-2">Заметки</div>
                            <p className="text-muted-foreground whitespace-pre-wrap">{client.notes}</p>
                        </div>
                    )}
                </div>

                <div className="rounded-lg border border-border bg-card p-5">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="font-semibold text-foreground">Проекты</h2>
                    </div>
                    <div className="space-y-2">
                        {client.projects?.length > 0 ? client.projects.map((p) => (
                            <Link key={p.id} href={`/projects/${p.id}`} className="block rounded border border-border p-3 hover:bg-accent/50">
                                <div className="flex justify-between">
                                    <span className="font-medium text-foreground">{p.name}</span>
                                    <span className="text-xs text-muted-foreground">{p.status}</span>
                                </div>
                            </Link>
                        )) : <p className="text-sm text-muted-foreground">Нет проектов</p>}
                    </div>
                </div>

                <div className="rounded-lg border border-border bg-card p-5">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="font-semibold text-foreground">Счета</h2>
                        <Link href={`/invoices/create?client_id=${client.id}`} className="text-sm text-primary hover:underline">Создать счёт</Link>
                    </div>
                    <div className="space-y-2">
                        {client.invoices?.length > 0 ? client.invoices.map((inv) => (
                            <Link key={inv.id} href={`/invoices/${inv.id}`} className="flex justify-between rounded border border-border p-3 text-sm hover:bg-accent/50">
                                <span className="font-medium text-foreground">№ {inv.number}</span>
                                <span className="text-muted-foreground">{invoiceStatusLabels[inv.status] || inv.status}</span>
                                <span className="text-foreground">{inv.total} {client.currency}</span>
                            </Link>
                        )) : <p className="text-sm text-muted-foreground">Нет счетов</p>}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
