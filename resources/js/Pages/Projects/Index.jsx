import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';

const statusLabels = { active: 'Активный', completed: 'Завершён', archived: 'Архив' };
const statusColors = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    archived: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

export default function ProjectsIndex({ projects, filters }) {
    const { flash } = usePage().props;

    function handleFilter(key, value) {
        router.get('/projects', { ...filters, [key]: value || undefined }, {
            preserveState: true,
            replace: true,
        });
    }

    return (
        <AppLayout>
            <Head title="Проекты" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-foreground">Проекты</h1>
                    <Link
                        href="/projects/create"
                        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                    >
                        Новый проект
                    </Link>
                </div>

                {flash?.success && (
                    <div className="rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-3 text-sm text-green-700 dark:text-green-400">
                        {flash.success}
                    </div>
                )}

                <div className="flex gap-3">
                    <input
                        type="text"
                        placeholder="Поиск проектов..."
                        defaultValue={filters.search}
                        onChange={(e) => handleFilter('search', e.target.value)}
                        className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                    <select
                        defaultValue={filters.status || ''}
                        onChange={(e) => handleFilter('status', e.target.value)}
                        className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm"
                    >
                        <option value="">Все статусы</option>
                        <option value="active">Активные</option>
                        <option value="completed">Завершённые</option>
                        <option value="archived">Архивные</option>
                    </select>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {projects.data.map((project) => (
                        <Link
                            key={project.id}
                            href={`/projects/${project.id}`}
                            className="rounded-lg border border-border bg-card p-5 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between">
                                <h3 className="font-semibold text-foreground">{project.name}</h3>
                                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[project.status]}`}>
                                    {statusLabels[project.status]}
                                </span>
                            </div>
                            {project.description && (
                                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{project.description}</p>
                            )}
                            <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                                <span>{project.tasks_count} задач</span>
                                {project.deadline && (
                                    <span>Дедлайн: {new Date(project.deadline).toLocaleDateString('ru-RU')}</span>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>

                {projects.data.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        <p>Проектов пока нет.</p>
                        <Link href="/projects/create" className="mt-2 inline-block text-primary hover:underline">
                            Создать первый проект
                        </Link>
                    </div>
                )}

                {projects.last_page > 1 && (
                    <div className="flex justify-center gap-2">
                        {projects.links.map((link, i) => (
                            <Link
                                key={i}
                                href={link.url || '#'}
                                className={`rounded px-3 py-1 text-sm ${
                                    link.active
                                        ? 'bg-primary text-primary-foreground'
                                        : 'border border-border text-muted-foreground hover:bg-accent'
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
