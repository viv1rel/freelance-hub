import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useCallback } from 'react';
import {
    DndContext, DragOverlay, closestCorners,
    KeyboardSensor, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import {
    SortableContext, sortableKeyboardCoordinates,
    verticalListSortingStrategy, useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import axios from 'axios';

const columnConfig = {
    open: { title: 'Открытые', color: 'border-gray-300 dark:border-gray-600' },
    in_progress: { title: 'В работе', color: 'border-yellow-400 dark:border-yellow-600' },
    review: { title: 'Ревью', color: 'border-purple-400 dark:border-purple-600' },
    closed: { title: 'Закрытые', color: 'border-green-400 dark:border-green-600' },
};

const priorityColors = {
    low: 'bg-gray-200 dark:bg-gray-700',
    medium: 'bg-blue-200 dark:bg-blue-800',
    high: 'bg-orange-200 dark:bg-orange-800',
    urgent: 'bg-red-200 dark:bg-red-800',
};

function SortableCard({ task }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id, data: { task } });
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <TaskCard task={task} />
        </div>
    );
}

function TaskCard({ task }) {
    return (
        <Link href={`/tasks/${task.id}`}
            className="block rounded-md border border-border bg-card p-3 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-2">
                <span className="text-sm font-medium text-foreground line-clamp-2">{task.title}</span>
                <span className={`h-2 w-2 rounded-full shrink-0 mt-1.5 ${priorityColors[task.priority]}`} />
            </div>
            {task.project && <span className="mt-1.5 block text-xs text-muted-foreground truncate">{task.project.name}</span>}
            {task.deadline && (
                <span className="mt-1 block text-xs text-muted-foreground">
                    {new Date(task.deadline).toLocaleDateString('ru-RU')}
                </span>
            )}
        </Link>
    );
}

function KanbanColumn({ status, tasks }) {
    const config = columnConfig[status];
    const taskIds = tasks.map((t) => t.id);
    return (
        <div className={`flex flex-col rounded-lg border-t-2 ${config.color} bg-muted/50 min-w-[280px] w-[280px]`}>
            <div className="flex items-center justify-between px-3 py-2">
                <h3 className="text-sm font-semibold text-foreground">{config.title}</h3>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">{tasks.length}</span>
            </div>
            <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
                <div className="flex-1 space-y-2 overflow-y-auto px-2 pb-2" style={{ minHeight: '200px' }}>
                    {tasks.map((task) => <SortableCard key={task.id} task={task} />)}
                </div>
            </SortableContext>
        </div>
    );
}

export default function Kanban({ columns: initialColumns, projects, filters }) {
    const [columns, setColumns] = useState(initialColumns);
    const [activeTask, setActiveTask] = useState(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    const findColumn = useCallback((taskId) => {
        for (const [status, tasks] of Object.entries(columns)) {
            if (tasks.some((t) => t.id === taskId)) return status;
        }
        return null;
    }, [columns]);

    function handleDragStart(event) {
        const col = findColumn(event.active.id);
        if (col) setActiveTask(columns[col].find((t) => t.id === event.active.id));
    }

    function handleDragOver(event) {
        const { active, over } = event;
        if (!over) return;
        const activeCol = findColumn(active.id);
        let overCol = findColumn(over.id);
        if (!overCol && Object.keys(columnConfig).includes(String(over.id))) overCol = String(over.id);
        if (!activeCol || !overCol || activeCol === overCol) return;

        setColumns((prev) => {
            const activeTasks = [...prev[activeCol]];
            const overTasks = [...prev[overCol]];
            const activeIndex = activeTasks.findIndex((t) => t.id === active.id);
            const [movedTask] = activeTasks.splice(activeIndex, 1);
            movedTask.status = overCol;
            const overIndex = overTasks.findIndex((t) => t.id === over.id);
            overIndex >= 0 ? overTasks.splice(overIndex, 0, movedTask) : overTasks.push(movedTask);
            return { ...prev, [activeCol]: activeTasks, [overCol]: overTasks };
        });
    }

    function handleDragEnd(event) {
        setActiveTask(null);
        const newCol = findColumn(event.active.id);
        if (!newCol) return;
        const sortOrder = columns[newCol].findIndex((t) => t.id === event.active.id);
        axios.post('/tasks/reorder', { task_id: event.active.id, status: newCol, sort_order: sortOrder })
            .catch(() => router.reload({ only: ['columns'] }));
    }

    function handleFilter(key, value) {
        router.get('/tasks', { ...filters, view: 'kanban', [key]: value || undefined }, { preserveState: true, replace: true });
    }

    return (
        <AppLayout>
            <Head title="Канбан-доска" />
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-foreground">Канбан-доска</h1>
                    <Link href="/tasks" className="rounded-md border border-border px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent">
                        Список
                    </Link>
                </div>

                <div className="flex gap-3">
                    <select defaultValue={filters.project_id || ''} onChange={(e) => handleFilter('project_id', e.target.value)}
                        className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm">
                        <option value="">Все проекты</option>
                        {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>

                <DndContext sensors={sensors} collisionDetection={closestCorners}
                    onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
                    <div className="flex gap-4 overflow-x-auto pb-4">
                        {Object.entries(columnConfig).map(([status]) => (
                            <KanbanColumn key={status} status={status} tasks={columns[status] || []} />
                        ))}
                    </div>
                    <DragOverlay>{activeTask ? <TaskCard task={activeTask} /> : null}</DragOverlay>
                </DndContext>
            </div>
        </AppLayout>
    );
}
