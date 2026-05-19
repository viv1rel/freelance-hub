import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm, Link } from '@inertiajs/react';

export default function ProjectEdit({ project }) {
    const { data, setData, put, processing, errors } = useForm({
        name: project.name,
        description: project.description || '',
        status: project.status,
        deadline: project.deadline ? project.deadline.split('T')[0] : '',
    });

    function handleSubmit(e) {
        e.preventDefault();
        put(`/projects/${project.id}`);
    }

    return (
        <AppLayout>
            <Head title={`Редактировать: ${project.name}`} />
            <div className="mx-auto max-w-2xl space-y-6">
                <div className="flex items-center gap-4">
                    <Link href={`/projects/${project.id}`} className="text-muted-foreground hover:text-foreground">&larr; Назад</Link>
                    <h1 className="text-2xl font-bold text-foreground">Редактировать проект</h1>
                </div>

                <form onSubmit={handleSubmit} className="rounded-lg border border-border bg-card p-6 space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-foreground">Название <span className="text-destructive">*</span></label>
                        <input id="name" type="text" value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
                            required
                        />
                        {errors.name && <p className="mt-1 text-sm text-destructive">{errors.name}</p>}
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-foreground">Описание</label>
                        <textarea id="description" value={data.description}
                            onChange={(e) => setData('description', e.target.value)} rows={4}
                            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-foreground">Статус</label>
                            <select id="status" value={data.status} onChange={(e) => setData('status', e.target.value)}
                                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm">
                                <option value="active">Активный</option>
                                <option value="completed">Завершён</option>
                                <option value="archived">Архив</option>
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
                        <Link href={`/projects/${project.id}`} className="rounded-md border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent">
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
