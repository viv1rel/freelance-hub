import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';

export default function ClientsIndex({ clients, filters }) {
    const { flash } = usePage().props;

    function handleSearch(value) {
        router.get('/clients', { search: value || undefined }, { preserveState: true, replace: true });
    }

    return (
        <AppLayout>
            <Head title="Клиенты" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-foreground">Клиенты</h1>
                    <Link
                        href="/clients/create"
                        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                    >
                        Новый клиент
                    </Link>
                </div>

                {flash?.success && (
                    <div className="rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-3 text-sm text-green-700 dark:text-green-400">
                        {flash.success}
                    </div>
                )}

                <input
                    type="text"
                    placeholder="Поиск клиентов..."
                    defaultValue={filters.search}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full max-w-md rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
                />

                <div className="overflow-x-auto rounded-lg border border-border bg-card">
                    <table className="w-full text-sm">
                        <thead className="border-b border-border bg-muted/50">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Имя</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Компания</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Ставка</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Проекты</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Счета</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clients.data.map((c) => (
                                <tr
                                    key={c.id}
                                    onClick={() => router.visit(`/clients/${c.id}`)}
                                    className="cursor-pointer border-b border-border last:border-0 hover:bg-accent/50"
                                >
                                    <td className="px-4 py-3 font-medium text-foreground">{c.name}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{c.company || '—'}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{c.email || '—'}</td>
                                    <td className="px-4 py-3 text-muted-foreground">
                                        {c.hourly_rate ? `${c.hourly_rate} ${c.currency}` : '—'}
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">{c.projects_count}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{c.invoices_count}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {clients.data.length === 0 && (
                        <div className="py-12 text-center text-muted-foreground">
                            Клиентов пока нет.
                        </div>
                    )}
                </div>

                {clients.last_page > 1 && (
                    <div className="flex justify-center gap-2">
                        {clients.links.map((link, i) => (
                            <Link
                                key={i}
                                href={link.url || '#'}
                                className={`rounded px-3 py-1 text-sm ${
                                    link.active ? 'bg-primary text-primary-foreground' : 'border border-border text-muted-foreground hover:bg-accent'
                                } ${!link.url ? 'pointer-events-none opacity-50' : ''}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
