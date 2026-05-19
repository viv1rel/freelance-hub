import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';

const statusLabels = { open: 'Открыта', in_progress: 'В работе', review: 'Ревью', closed: 'Закрыта' };
const statusColors = {
    open: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    in_progress: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    review: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    closed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
};
const priorityLabels = {
    low: { label: 'Низкий', color: 'text-gray-500' },
    medium: { label: 'Средний', color: 'text-blue-500' },
    high: { label: 'Высокий', color: 'text-orange-500' },
    urgent: { label: 'Срочный', color: 'text-red-500' },
};
const fieldLabels = { status: 'статус', priority: 'приоритет', assignee_id: 'исполнитель', title: 'заголовок', deadline: 'дедлайн' };

export default function TaskShow({ task }) {
    const { flash } = usePage().props;

    function handleDelete() {
        if (confirm('Удалить задачу?')) {
            router.delete(`/tasks/${task.id}`);
        }
    }

    return (
        <AppLayout>
            <Head title={task.title} />
            <div className="mx-auto max-w-3xl space-y-6">
                <div className="flex items-center gap-4">
                    <Link href="/tasks" className="text-muted-foreground hover:text-foreground">&larr; Задачи</Link>
                    {task.project && (
                        <>
                            <span className="text-muted-foreground">/</span>
                            <Link href={`/projects/${task.project.id}`} className="text-muted-foreground hover:text-foreground">
                                {task.project.name}
                            </Link>
                        </>
                    )}
                </div>

                {flash?.success && (
                    <div className="rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-3 text-sm text-green-700 dark:text-green-400">
                        {flash.success}
                    </div>
                )}

                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">{task.title}</h1>
                        <div className="mt-2 flex items-center gap-3">
                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[task.status]}`}>
                                {statusLabels[task.status]}
                            </span>
                            <span className={`text-sm font-medium ${priorityLabels[task.priority].color}`}>
                                {priorityLabels[task.priority].label} приоритет
                            </span>
                            {task.deadline && (
                                <span className="text-sm text-muted-foreground">
                                    Дедлайн: {new Date(task.deadline).toLocaleDateString('ru-RU')}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Link href={`/tasks/${task.id}/edit`}
                            className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-accent">
                            Редактировать
                        </Link>
                        <button onClick={handleDelete}
                            className="rounded-md border border-destructive/50 px-3 py-1.5 text-sm font-medium text-destructive hover:bg-destructive/10">
                            Удалить
                        </button>
                    </div>
                </div>

                {task.description && (
                    <div className="rounded-lg border border-border bg-card p-5">
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Описание</h3>
                        <p className="text-foreground whitespace-pre-wrap">{task.description}</p>
                    </div>
                )}

                {task.subtasks?.length > 0 && (
                    <div className="rounded-lg border border-border bg-card p-5">
                        <h3 className="text-sm font-medium text-muted-foreground mb-3">Подзадачи</h3>
                        <div className="divide-y divide-border">
                            {task.subtasks.map((sub) => (
                                <Link key={sub.id} href={`/tasks/${sub.id}`}
                                    className="flex items-center justify-between py-2 hover:text-primary transition-colors">
                                    <span className="text-sm text-foreground">{sub.title}</span>
                                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[sub.status]}`}>
                                        {statusLabels[sub.status]}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {task.activities?.length > 0 && (
                    <div className="rounded-lg border border-border bg-card p-5">
                        <h3 className="text-sm font-medium text-muted-foreground mb-3">История изменений</h3>
                        <div className="space-y-3">
                            {task.activities.map((a) => (
                                <div key={a.id} className="flex items-start gap-3 text-sm">
                                    <div className="mt-1 h-2 w-2 rounded-full bg-muted-foreground shrink-0" />
                                    <div>
                                        <span className="text-foreground">
                                            {a.field === 'created' ? (
                                                <>Задача создана</>
                                            ) : (
                                                <>
                                                    Изменено поле <strong>{fieldLabels[a.field] || a.field}</strong>:{' '}
                                                    <span className="text-muted-foreground">{a.old_value || 'нет'}</span>
                                                    {' '}&rarr;{' '}
                                                    <span className="font-medium">{a.new_value}</span>
                                                </>
                                            )}
                                        </span>
                                        <span className="ml-2 text-xs text-muted-foreground">
                                            {new Date(a.created_at).toLocaleString('ru-RU')}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
