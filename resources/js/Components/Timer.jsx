import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';

function formatTime(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return [hours, minutes, seconds].map((v) => String(v).padStart(2, '0')).join(':');
}

export default function Timer({ projects, tasks, runningEntry, onUpdate }) {
    const [isRunning, setIsRunning] = useState(!!runningEntry);
    const [elapsed, setElapsed] = useState(0);
    const [projectId, setProjectId] = useState(runningEntry?.project_id || '');
    const [taskId, setTaskId] = useState(runningEntry?.task_id || '');
    const [description, setDescription] = useState(runningEntry?.description || '');
    const [loading, setLoading] = useState(false);
    const workerRef = useRef(null);

    const filteredTasks = tasks.filter((t) => !projectId || t.project_id === Number(projectId));

    useEffect(() => {
        workerRef.current = new Worker(
            new URL('../workers/timer.worker.js', import.meta.url),
            { type: 'module' }
        );

        workerRef.current.onmessage = (e) => {
            if (e.data.type === 'tick') {
                setElapsed(e.data.elapsed);
            }
        };

        return () => {
            workerRef.current?.terminate();
        };
    }, []);

    useEffect(() => {
        if (runningEntry?.started_at && workerRef.current) {
            setIsRunning(true);
            workerRef.current.postMessage({
                type: 'start',
                startedAt: runningEntry.started_at,
            });
        }
    }, [runningEntry]);

    const handleStart = useCallback(async () => {
        if (!projectId) return;
        setLoading(true);
        try {
            const res = await axios.post('/time-tracking/start', {
                project_id: projectId,
                task_id: taskId || null,
                description: description || null,
            });
            setIsRunning(true);
            setElapsed(0);
            workerRef.current?.postMessage({
                type: 'start',
                startedAt: res.data.started_at,
            });
            onUpdate?.();
        } finally {
            setLoading(false);
        }
    }, [projectId, taskId, description, onUpdate]);

    const handleStop = useCallback(async () => {
        setLoading(true);
        try {
            await axios.post('/time-tracking/stop');
            setIsRunning(false);
            setElapsed(0);
            workerRef.current?.postMessage({ type: 'stop' });
            setDescription('');
            onUpdate?.();
        } finally {
            setLoading(false);
        }
    }, [onUpdate]);

    return (
        <div className="rounded-lg border border-border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">Таймер</h3>
                <span className={`font-mono text-2xl font-bold ${isRunning ? 'text-primary' : 'text-muted-foreground'}`}>
                    {formatTime(elapsed)}
                </span>
            </div>

            {!isRunning && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <select
                        value={projectId}
                        onChange={(e) => { setProjectId(e.target.value); setTaskId(''); }}
                        className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm"
                    >
                        <option value="">Выберите проект</option>
                        {projects.map((p) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                    <select
                        value={taskId}
                        onChange={(e) => setTaskId(e.target.value)}
                        className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm"
                        disabled={!projectId}
                    >
                        <option value="">Задача (необязательно)</option>
                        {filteredTasks.map((t) => (
                            <option key={t.id} value={t.id}>{t.title}</option>
                        ))}
                    </select>
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Описание работы..."
                        className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                </div>
            )}

            {isRunning && runningEntry && (
                <div className="text-sm text-muted-foreground">
                    {runningEntry.project?.name}
                    {runningEntry.task && <> &rarr; {runningEntry.task.title}</>}
                    {runningEntry.description && <span className="ml-2 text-xs">({runningEntry.description})</span>}
                </div>
            )}

            <button
                onClick={isRunning ? handleStop : handleStart}
                disabled={loading || (!isRunning && !projectId)}
                className={`w-full rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50 ${
                    isRunning
                        ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                        : 'bg-primary text-primary-foreground hover:bg-primary/90'
                }`}
            >
                {loading ? '...' : isRunning ? 'Остановить' : 'Запустить'}
            </button>
        </div>
    );
}
