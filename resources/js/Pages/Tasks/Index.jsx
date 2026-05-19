import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';

const statusLabels = { open: 'Открыта', in_progress: 'В работе', review: 'Ревью', closed: 'Закрыта' };
const statusColors = {
    open: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    in_progress: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    review: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    closed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
};
const priorityColors = { low: 'text-gray-500', medium: 'text-blue-500', high: 'text-orange-500', urgent: 'text-red-500' };

export default function TasksIndex({ tasks, projects, filters }) {
    const { flash } = usePage().props;

    function handleFilter(key, value) {
        router.get('/tasks', { ...filters, [key]: value || undefined }, { preserveState: true, replace: true });
    }

    return (
        <AppLayout>
            <Head title="Задачи" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-foreground">Задачи</h1>
                    <div className="flex gap-2">
                        <Link href="/tasks?view=kanban"
                            className="rounded-md border border-border px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent">
                            Канбан
                        </Link>
                        <Link href="/tasks/create"
                            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                            Новая задача
                        </Link>
                    </div>
                </div>

                {flash?.success && (
                    <div className="rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-3 text-sm text-green-700 dark:text-green-400">
                        {flash.success}
                    </div>
                )}

                <div className="flex flex-wrap gap-3">
                    <input type="text" placeholder="Поиск задач..." defaultValue={filters.search}
                        onChange={(e) => handleFilter('search', e.target.value)}
                        className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                    <select defaultValue={filters.project_id || ''} onChange={(e) => handleFilter('project_id', e.target.value)}
                        className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm">
                        <option value="">Все проекты</option>
                        {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <select defaultValue={filters.status || ''} onChange={(e) => handleFilter('status', e.target.value)}
                        className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm">
                        <option value="">Все статусы</option>
                        <option value="open">Открытые</option>
                        <option value="in_progress">В работе</option>
                        <option value="review">Ревью</option>
                        <option value="closed">Закрытые</option>
                    </select>
                    <select defaultValue={filters.priority || ''} onChange={(e) => handleFilter('priority', e.target.value)}
                        className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm">
                        <option value="">Все приоритеты</option>
                        <option value="low">Низкий</option>
                        <option value="medium">Средний</option>
                        <option value="high">Высокий</option>
                        <option value="urgent">Срочный</option>
                    </select>
                </div>

                {tasks.data.length > 0 ? (
                    <div className="rounded-lg border border-border bg-card divide-y divide-border">
                        {tasks.data.map((task) => (
                            <Link key={task.id} href={`/tasks/${task.id}`}
                                className="flex items-center justify-between px-4 py-3 hover:bg-accent/50 transition-colors">
                                <div className="flex items-center gap-3 min-w-0">
                                    <span className={`text-xs font-bold shrink-0 ${priorityColors[task.priority]}`}>
                                        {task.priority.charAt(0).toUpperCase()}
                                    </span>
                                    <div className="min-w-0">
                                        <span className="text-sm font-medium text-foreground block truncate">{task.title}</span>
                                        <span className="text-xs text-muted-foreground">{task.project?.name}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    {task.deadline && (
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(task.deadline).toLocaleDateString('ru-RU')}
                                        </span>
                                    )}
                                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[task.status]}`}>
                                        {statusLabels[task.status]}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 text-muted-foreground"><p>Задач не найдено.</p></div>
                )}

                {tasks.last_page > 1 && (
                    <div className="flex justify-center gap-2">
                        {tasks.links.map((link, i) => (
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
