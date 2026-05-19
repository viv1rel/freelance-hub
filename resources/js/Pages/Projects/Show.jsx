import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';

const statusLabels = { active: 'Активный', completed: 'Завершён', archived: 'Архив' };
const statusColors = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    archived: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};
const taskStatusLabels = { open: 'Открыта', in_progress: 'В работе', review: 'Ревью', closed: 'Закрыта' };
const taskStatusColors = {
    open: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    in_progress: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    review: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    closed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
};
const priorityColors = { low: 'text-gray-500', medium: 'text-blue-500', high: 'text-orange-500', urgent: 'text-red-500' };

export default function ProjectShow({ project }) {
    const { flash } = usePage().props;

    function handleDelete() {
        if (confirm('Удалить проект? Все задачи будут удалены.')) {
            router.delete(`/projects/${project.id}`);
        }
    }

    return (
        <AppLayout>
            <Head title={project.name} />
            <div className="space-y-6">
                <Link href="/projects" className="text-muted-foreground hover:text-foreground">&larr; Проекты</Link>

                {flash?.success && (
                    <div className="rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-3 text-sm text-green-700 dark:text-green-400">
                        {flash.success}
                    </div>
                )}

                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-foreground">{project.name}</h1>
                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[project.status]}`}>
                                {statusLabels[project.status]}
                            </span>
                        </div>
                        {project.description && <p className="mt-2 text-muted-foreground">{project.description}</p>}
                        {project.deadline && (
                            <p className="mt-1 text-sm text-muted-foreground">
                                Дедлайн: {new Date(project.deadline).toLocaleDateString('ru-RU')}
                            </p>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Link href={`/projects/${project.id}/edit`}
                            className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-accent">
                            Редактировать
                        </Link>
                        <button onClick={handleDelete}
                            className="rounded-md border border-destructive/50 px-3 py-1.5 text-sm font-medium text-destructive hover:bg-destructive/10">
                            Удалить
                        </button>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-foreground">Задачи</h2>
                        <div className="flex gap-2">
                            <Link href={`/tasks/create?project_id=${project.id}`}
                                className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                                Добавить задачу
                            </Link>
                            <Link href={`/tasks?view=kanban&project_id=${project.id}`}
                                className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-accent">
                                Канбан
                            </Link>
                        </div>
                    </div>

                    {project.tasks?.length > 0 ? (
                        <div className="rounded-lg border border-border bg-card divide-y divide-border">
                            {project.tasks.map((task) => (
                                <Link key={task.id} href={`/tasks/${task.id}`}
                                    className="flex items-center justify-between px-4 py-3 hover:bg-accent/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <span className={`text-xs font-bold ${priorityColors[task.priority]}`}>
                                            {task.priority.charAt(0).toUpperCase()}
                                        </span>
                                        <span className="text-sm font-medium text-foreground">{task.title}</span>
                                        {task.subtasks?.length > 0 && (
                                            <span className="text-xs text-muted-foreground">({task.subtasks.length} подзадач)</span>
                                        )}
                                    </div>
                                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${taskStatusColors[task.status]}`}>
                                        {taskStatusLabels[task.status]}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            <p>Задач пока нет.</p>
                            <Link href={`/tasks/create?project_id=${project.id}`} className="mt-2 inline-block text-primary hover:underline">
                                Создать первую задачу
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
