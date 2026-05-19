import AppLayout from '@/Layouts/AppLayout';
import Timer from '@/Components/Timer';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

function formatDuration(minutes) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}ч ${m}м` : `${m}м`;
}

export default function TimeTrackingIndex({ entries, runningEntry, projects, tasks, filters }) {
    const { flash } = usePage().props;
    const [showManual, setShowManual] = useState(false);

    const manualForm = useForm({
        project_id: '',
        task_id: '',
        started_at: '',
        ended_at: '',
        duration_minutes: '',
        description: '',
    });

    function handleManualSubmit(e) {
        e.preventDefault();
        manualForm.post('/time-tracking', {
            onSuccess: () => { setShowManual(false); manualForm.reset(); },
        });
    }

    function handleFilter(key, value) {
        router.get('/time-tracking', { ...filters, [key]: value || undefined }, { preserveState: true, replace: true });
    }

    function handleDelete(id) {
        if (confirm('Удалить запись?')) {
            router.delete(`/time-tracking/${id}`);
        }
    }

    const manualTasks = tasks.filter((t) => !manualForm.data.project_id || t.project_id === Number(manualForm.data.project_id));

    return (
        <AppLayout>
            <Head title="Учёт времени" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-foreground">Учёт времени</h1>
                    <div className="flex gap-2">
                        <Link href="/time-tracking/reports"
                            className="rounded-md border border-border px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent">
                            Отчёты
                        </Link>
                        <button onClick={() => setShowManual(!showManual)}
                            className="rounded-md border border-border px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent">
                            {showManual ? 'Скрыть' : 'Добавить вручную'}
                        </button>
                    </div>
                </div>

                {flash?.success && (
                    <div className="rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-3 text-sm text-green-700 dark:text-green-400">
                        {flash.success}
                    </div>
                )}

                {/* Timer */}
                <Timer
                    projects={projects}
                    tasks={tasks}
                    runningEntry={runningEntry}
                    onUpdate={() => router.reload()}
                />

                {/* Manual entry form */}
                {showManual && (
                    <form onSubmit={handleManualSubmit} className="rounded-lg border border-border bg-card p-4 space-y-3">
                        <h3 className="text-sm font-semibold text-foreground">Ручной ввод</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-foreground mb-1">Проект <span className="text-destructive">*</span></label>
                                <select value={manualForm.data.project_id}
                                    onChange={(e) => { manualForm.setData('project_id', e.target.value); manualForm.setData('task_id', ''); }}
                                    className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm" required>
                                    <option value="">Выберите проект</option>
                                    {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-foreground mb-1">Задача</label>
                                <select value={manualForm.data.task_id}
                                    onChange={(e) => manualForm.setData('task_id', e.target.value)}
                                    className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm">
                                    <option value="">Необязательно</option>
                                    {manualTasks.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-foreground mb-1">Начало <span className="text-destructive">*</span></label>
                                <input type="datetime-local" value={manualForm.data.started_at}
                                    onChange={(e) => manualForm.setData('started_at', e.target.value)}
                                    className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm" required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-foreground mb-1">Конец <span className="text-destructive">*</span></label>
                                <input type="datetime-local" value={manualForm.data.ended_at}
                                    onChange={(e) => manualForm.setData('ended_at', e.target.value)}
                                    className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm" required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-foreground mb-1">Описание</label>
                            <input type="text" value={manualForm.data.description}
                                onChange={(e) => manualForm.setData('description', e.target.value)}
                                placeholder="Что было сделано..."
                                className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
                            />
                        </div>
                        <button type="submit" disabled={manualForm.processing}
                            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                            {manualForm.processing ? 'Сохранение...' : 'Добавить запись'}
                        </button>
                    </form>
                )}

                {/* Filters */}
                <div className="flex flex-wrap gap-3">
                    <select defaultValue={filters.project_id || ''} onChange={(e) => handleFilter('project_id', e.target.value)}
                        className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm">
                        <option value="">Все проекты</option>
                        {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <input type="date" defaultValue={filters.from || ''} onChange={(e) => handleFilter('from', e.target.value)}
                        className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm"
                        placeholder="С даты"
                    />
                    <input type="date" defaultValue={filters.to || ''} onChange={(e) => handleFilter('to', e.target.value)}
                        className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm"
                        placeholder="По дату"
                    />
                </div>

                {/* Entries list */}
                {entries.data.length > 0 ? (
                    <div className="rounded-lg border border-border bg-card divide-y divide-border">
                        {entries.data.map((entry) => (
                            <div key={entry.id} className="flex items-center justify-between px-4 py-3">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-foreground">{entry.project?.name}</span>
                                        {entry.task && <span className="text-xs text-muted-foreground">&rarr; {entry.task.title}</span>}
                                    </div>
                                    {entry.description && (
                                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{entry.description}</p>
                                    )}
                                    <span className="text-xs text-muted-foreground">
                                        {new Date(entry.started_at).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    <span className="text-sm font-semibold text-foreground">{formatDuration(entry.duration_minutes)}</span>
                                    <button onClick={() => handleDelete(entry.id)}
                                        className="text-xs text-destructive hover:underline">
                                        Удалить
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 text-muted-foreground">
                        <p>Записей времени пока нет.</p>
                    </div>
                )}

                {entries.last_page > 1 && (
                    <div className="flex justify-center gap-2">
                        {entries.links.map((link, i) => (
                            <Link key={i} href={link.url || '#'}
                                className={`rounded px-3 py-1 text-sm ${link.active ? 'bg-primary text-primary-foreground' : 'border border-border text-muted-foreground hover:bg-accent'} ${!link.url ? 'pointer-events-none opacity-50' : ''}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
