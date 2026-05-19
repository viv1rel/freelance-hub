import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, router } from '@inertiajs/react';

function formatDuration(minutes) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}ч ${m}м` : `${m}м`;
}

export default function TimeTrackingReports({ byProject, byDay, period, from, to }) {
    const totalMinutes = byProject.reduce((sum, p) => sum + p.total_minutes, 0);

    function handlePeriod(p) {
        router.get('/time-tracking/reports', { period: p }, { preserveState: true, replace: true });
    }

    return (
        <AppLayout>
            <Head title="Отчёты по времени" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-foreground">Отчёты по времени</h1>
                    <Link href="/time-tracking"
                        className="rounded-md border border-border px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent">
                        &larr; Назад
                    </Link>
                </div>

                {/* Period selector */}
                <div className="flex gap-2">
                    {[
                        { key: 'week', label: 'Неделя' },
                        { key: 'month', label: 'Месяц' },
                        { key: 'quarter', label: 'Квартал' },
                    ].map(({ key, label }) => (
                        <button key={key} onClick={() => handlePeriod(key)}
                            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                                period === key
                                    ? 'bg-primary text-primary-foreground'
                                    : 'border border-border text-muted-foreground hover:bg-accent'
                            }`}>
                            {label}
                        </button>
                    ))}
                </div>

                <p className="text-sm text-muted-foreground">
                    Период: {new Date(from).toLocaleDateString('ru-RU')} — {new Date(to).toLocaleDateString('ru-RU')}
                    {' | '}Всего: <strong>{formatDuration(totalMinutes)}</strong>
                </p>

                {/* By project */}
                <div className="rounded-lg border border-border bg-card p-5">
                    <h2 className="text-sm font-semibold text-foreground mb-3">По проектам</h2>
                    {byProject.length > 0 ? (
                        <div className="space-y-3">
                            {byProject.map((p) => {
                                const pct = totalMinutes > 0 ? Math.round((p.total_minutes / totalMinutes) * 100) : 0;
                                return (
                                    <div key={p.id}>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-foreground">{p.name}</span>
                                            <span className="text-muted-foreground">
                                                {formatDuration(p.total_minutes)} ({p.entries_count} записей)
                                            </span>
                                        </div>
                                        <div className="mt-1 h-2 rounded-full bg-muted overflow-hidden">
                                            <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">Нет данных за выбранный период.</p>
                    )}
                </div>

                {/* By day */}
                <div className="rounded-lg border border-border bg-card p-5">
                    <h2 className="text-sm font-semibold text-foreground mb-3">По дням</h2>
                    {byDay.length > 0 ? (
                        <div className="space-y-2">
                            {byDay.map((d) => {
                                const maxMinutes = Math.max(...byDay.map((x) => x.total_minutes));
                                const pct = maxMinutes > 0 ? Math.round((d.total_minutes / maxMinutes) * 100) : 0;
                                return (
                                    <div key={d.date} className="flex items-center gap-3">
                                        <span className="w-24 text-xs text-muted-foreground shrink-0">
                                            {new Date(d.date).toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'short' })}
                                        </span>
                                        <div className="flex-1 h-4 rounded bg-muted overflow-hidden">
                                            <div className="h-full rounded bg-primary/70" style={{ width: `${pct}%` }} />
                                        </div>
                                        <span className="text-xs font-medium text-foreground w-16 text-right">{formatDuration(d.total_minutes)}</span>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">Нет данных за выбранный период.</p>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
