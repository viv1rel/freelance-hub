import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm, Link } from '@inertiajs/react';

export default function TaskEdit({ task, projects }) {
    const { data, setData, put, processing, errors } = useForm({
        project_id: task.project_id,
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        deadline: task.deadline ? task.deadline.split('T')[0] : '',
    });

    function handleSubmit(e) {
        e.preventDefault();
        put(`/tasks/${task.id}`);
    }

    return (
        <AppLayout>
            <Head title={`Редактировать: ${task.title}`} />
            <div className="mx-auto max-w-2xl space-y-6">
                <div className="flex items-center gap-4">
                    <Link href={`/tasks/${task.id}`} className="text-muted-foreground hover:text-foreground">&larr; Назад</Link>
                    <h1 className="text-2xl font-bold text-foreground">Редактировать задачу</h1>
                </div>

                <form onSubmit={handleSubmit} className="rounded-lg border border-border bg-card p-6 space-y-4">
                    <div>
                        <label htmlFor="project_id" className="block text-sm font-medium text-foreground">Проект <span className="text-destructive">*</span></label>
                        <select id="project_id" value={data.project_id} onChange={(e) => setData('project_id', e.target.value)}
                            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm">
                            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-foreground">Заголовок <span className="text-destructive">*</span></label>
                        <input id="title" type="text" value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
                            required
                        />
                        {errors.title && <p className="mt-1 text-sm text-destructive">{errors.title}</p>}
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-foreground">Описание</label>
                        <textarea id="description" value={data.description}
                            onChange={(e) => setData('description', e.target.value)} rows={4}
                            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-foreground">Статус</label>
                            <select id="status" value={data.status} onChange={(e) => setData('status', e.target.value)}
                                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm">
                                <option value="open">Открыта</option>
                                <option value="in_progress">В работе</option>
                                <option value="review">Ревью</option>
                                <option value="closed">Закрыта</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="priority" className="block text-sm font-medium text-foreground">Приоритет</label>
                            <select id="priority" value={data.priority} onChange={(e) => setData('priority', e.target.value)}
                                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm">
                                <option value="low">Низкий</option>
                                <option value="medium">Средний</option>
                                <option value="high">Высокий</option>
                                <option value="urgent">Срочный</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="deadline" className="block text-sm font-medium text-foreground">Дедлайн</label>
                            <input id="deadline" type="date" value={data.deadline}
                                onChange={(e) => setData('deadline', e.target.value)}
                                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <Link href={`/tasks/${task.id}`} className="rounded-md border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent">
                            Отмена
                        </Link>
                        <button type="submit" disabled={processing}
                            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                            {processing ? 'Сохранение...' : 'Сохранить'}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
