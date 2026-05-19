import AppLayout from '@/Layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';

const fmt = (v) => new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(Number(v || 0));

const statusLabels = {
    draft: 'Черновик', sent: 'Отправлен', partially_paid: 'Частично оплачен', paid: 'Оплачен', overdue: 'Просрочен',
};

function Metric({ label, value, hint }) {
    return (
        <div className="rounded-lg border border-border bg-card p-5">
            <div className="text-sm text-muted-foreground">{label}</div>
            <div className="mt-1 text-2xl font-bold text-foreground">{value}</div>
            {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
        </div>
    );
}

function RevenueChart({ data }) {
    const max = Math.max(...data.map((d) => d.revenue), 1);
    return (
        <div className="rounded-lg border border-border bg-card p-5">
            <h2 className="font-semibold text-foreground mb-4">Доход по месяцам</h2>
            <div className="flex items-end gap-2 h-48">
                {data.map((d, i) => {
                    const h = (d.revenue / max) * 100;
                    return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2">
                            <div className="text-xs text-muted-foreground">{fmt(d.revenue)}</div>
                            <div className="w-full bg-primary/20 rounded-t" style={{ height: `${h}%`, minHeight: d.revenue > 0 ? '4px' : '2px' }}>
                                <div className="w-full h-full bg-primary rounded-t" style={{ opacity: d.revenue > 0 ? 1 : 0 }} />
                            </div>
                            <div className="text-xs text-muted-foreground truncate w-full text-center">{d.month}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default function DashboardIndex({ metrics, topClients, revenueSeries, recentInvoices }) {
    return (
        <AppLayout>
            <Head title="Дашборд" />
            <div className="space-y-6">
                <h1 className="text-2xl font-bold text-foreground">Дашборд</h1>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Metric label="Доход за месяц" value={`${fmt(metrics.monthRevenue)} ₽`} />
                    <Metric label="Доход за квартал" value={`${fmt(metrics.quarterRevenue)} ₽`} />
                    <Metric label="Активные проекты" value={metrics.activeProjects} hint={`${metrics.openTasks} открытых задач`} />
                    <Metric label="Задолженность" value={`${fmt(metrics.unpaidAmount)} ₽`} hint={`${metrics.unpaidCount} незакрытых счетов`} />
                </div>

                <RevenueChart data={revenueSeries} />

                <div className="grid gap-6 md:grid-cols-2">
                    <div className="rounded-lg border border-border bg-card p-5">
                        <h2 className="font-semibold text-foreground mb-3">Топ клиентов</h2>
                        {topClients.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Пока нет оплаченных счетов.</p>
                        ) : (
                            <div className="space-y-2">
                                {topClients.map((c) => (
                                    <Link key={c.id} href={`/clients/${c.id}`} className="flex justify-between rounded p-2 text-sm hover:bg-accent/50">
                                        <span className="text-foreground">{c.name}</span>
                                        <span className="font-medium text-foreground">{fmt(c.revenue)} ₽</span>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="rounded-lg border border-border bg-card p-5">
                        <h2 className="font-semibold text-foreground mb-3">Недавние счета</h2>
                        {recentInvoices.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Счетов пока нет.</p>
                        ) : (
                            <div className="space-y-2">
                                {recentInvoices.map((inv) => (
                                    <Link key={inv.id} href={`/invoices/${inv.id}`} className="flex justify-between rounded p-2 text-sm hover:bg-accent/50">
                                        <span className="text-foreground">№ {inv.number} — {inv.client?.name}</span>
                                        <span className="text-muted-foreground">{statusLabels[inv.status]} • {fmt(inv.total)} {inv.currency}</span>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
