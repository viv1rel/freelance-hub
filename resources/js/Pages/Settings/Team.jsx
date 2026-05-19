import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

const ROLE_LABELS = {
    admin: 'Администратор',
    freelancer: 'Фрилансер',
    client: 'Клиент',
};

const ROLE_BADGE = {
    admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    freelancer: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    client: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};

export default function Team({ members, invitations }) {
    const { flash, errors: pageErrors } = usePage().props;

    return (
        <AppLayout>
            <Head title="Участники" />
            <div className="mx-auto max-w-4xl space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-foreground">Участники рабочего пространства</h1>
                    <Link
                        href="/settings"
                        className="text-sm text-muted-foreground hover:text-foreground"
                    >
                        ← Назад к настройкам
                    </Link>
                </div>

                {flash?.success && (
                    <div className="rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-3 text-sm text-green-700 dark:text-green-400">
                        {flash.success}
                    </div>
                )}
                {pageErrors?.role && (
                    <div className="rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-sm text-red-700 dark:text-red-400">
                        {pageErrors.role}
                    </div>
                )}
                {pageErrors?.member && (
                    <div className="rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-sm text-red-700 dark:text-red-400">
                        {pageErrors.member}
                    </div>
                )}

                <MembersTable members={members} />
                <InvitationsTable invitations={invitations} />
                <InviteForm />
            </div>
        </AppLayout>
    );
}

function MembersTable({ members }) {
    return (
        <div className="rounded-lg border border-border bg-card">
            <div className="border-b border-border px-6 py-4">
                <h2 className="text-lg font-semibold text-foreground">Активные участники ({members.length})</h2>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="border-b border-border bg-muted/30 text-left text-xs uppercase text-muted-foreground">
                        <tr>
                            <th className="px-6 py-3 font-medium">Имя</th>
                            <th className="px-6 py-3 font-medium">Email</th>
                            <th className="px-6 py-3 font-medium">Роль</th>
                            <th className="px-6 py-3 font-medium">В команде с</th>
                            <th className="px-6 py-3 font-medium text-right">Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {members.map((m) => (
                            <MemberRow key={m.id} member={m} />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function MemberRow({ member }) {
    const [editing, setEditing] = useState(false);
    const { data, setData, patch, processing } = useForm({ role: member.role });

    const handleRoleSave = (e) => {
        e.preventDefault();
        patch(`/settings/team/${member.id}/role`, {
            preserveScroll: true,
            onSuccess: () => setEditing(false),
        });
    };

    const handleDelete = () => {
        if (!confirm(`Удалить ${member.name} из рабочего пространства? Назначенные задачи останутся без исполнителя.`)) {
            return;
        }
        router.delete(`/settings/team/${member.id}`, { preserveScroll: true });
    };

    return (
        <tr className="border-b border-border last:border-0">
            <td className="px-6 py-4 text-foreground">
                {member.name}
                {member.is_self && (
                    <span className="ml-2 text-xs text-muted-foreground">(вы)</span>
                )}
            </td>
            <td className="px-6 py-4 text-muted-foreground">{member.email}</td>
            <td className="px-6 py-4">
                {editing ? (
                    <form onSubmit={handleRoleSave} className="flex items-center gap-2">
                        <select
                            value={data.role}
                            onChange={(e) => setData('role', e.target.value)}
                            className="rounded-md border border-input bg-background px-2 py-1 text-sm"
                        >
                            <option value="admin">Администратор</option>
                            <option value="freelancer">Фрилансер</option>
                            <option value="client">Клиент</option>
                        </select>
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-md bg-primary px-2 py-1 text-xs text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                        >
                            ✓
                        </button>
                        <button
                            type="button"
                            onClick={() => { setEditing(false); setData('role', member.role); }}
                            className="rounded-md border border-input px-2 py-1 text-xs hover:bg-muted"
                        >
                            ✕
                        </button>
                    </form>
                ) : (
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${ROLE_BADGE[member.role]}`}>
                        {ROLE_LABELS[member.role]}
                    </span>
                )}
            </td>
            <td className="px-6 py-4 text-muted-foreground">{member.joined_at}</td>
            <td className="px-6 py-4 text-right">
                {member.is_self ? (
                    <span className="text-xs text-muted-foreground">—</span>
                ) : (
                    <div className="inline-flex items-center gap-2">
                        {!editing && (
                            <button
                                onClick={() => setEditing(true)}
                                className="rounded-md border border-input px-2.5 py-1 text-xs hover:bg-muted"
                            >
                                Сменить роль
                            </button>
                        )}
                        <button
                            onClick={handleDelete}
                            className="rounded-md border border-destructive px-2.5 py-1 text-xs text-destructive hover:bg-destructive/10"
                        >
                            Удалить
                        </button>
                    </div>
                )}
            </td>
        </tr>
    );
}

function InvitationsTable({ invitations }) {
    if (invitations.length === 0) return null;

    const revoke = (id) => {
        if (!confirm('Отозвать приглашение?')) return;
        router.delete(`/settings/team/invitations/${id}`, { preserveScroll: true });
    };

    return (
        <div className="rounded-lg border border-border bg-card">
            <div className="border-b border-border px-6 py-4">
                <h2 className="text-lg font-semibold text-foreground">Активные приглашения ({invitations.length})</h2>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="border-b border-border bg-muted/30 text-left text-xs uppercase text-muted-foreground">
                        <tr>
                            <th className="px-6 py-3 font-medium">Email</th>
                            <th className="px-6 py-3 font-medium">Роль</th>
                            <th className="px-6 py-3 font-medium">Истекает</th>
                            <th className="px-6 py-3 font-medium text-right">Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invitations.map((inv) => (
                            <tr key={inv.id} className="border-b border-border last:border-0">
                                <td className="px-6 py-4 text-foreground">{inv.email}</td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${ROLE_BADGE[inv.role]}`}>
                                        {ROLE_LABELS[inv.role]}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-muted-foreground">{inv.expires_at}</td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => revoke(inv.id)}
                                        className="rounded-md border border-destructive px-2.5 py-1 text-xs text-destructive hover:bg-destructive/10"
                                    >
                                        Отозвать
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function InviteForm() {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        role: 'freelancer',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/invitations', { onSuccess: () => reset() });
    };

    return (
        <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground">Пригласить нового участника</h2>
            <p className="mt-1 text-sm text-muted-foreground">
                Отправьте приглашение по email. Срок действия — 7 дней.
            </p>
            <form onSubmit={handleSubmit} className="mt-4 grid gap-3 sm:grid-cols-[1fr_180px_auto] sm:items-end">
                <div>
                    <label htmlFor="invite-email" className="block text-sm font-medium text-foreground">
                        Email <span className="text-destructive">*</span>
                    </label>
                    <input
                        id="invite-email"
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
                        required
                    />
                    {errors.email && <p className="mt-1 text-sm text-destructive">{errors.email}</p>}
                </div>
                <div>
                    <label htmlFor="invite-role" className="block text-sm font-medium text-foreground">Роль</label>
                    <select
                        id="invite-role"
                        value={data.role}
                        onChange={(e) => setData('role', e.target.value)}
                        className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm"
                    >
                        <option value="admin">Администратор</option>
                        <option value="freelancer">Фрилансер</option>
                        <option value="client">Клиент (просмотр счетов)</option>
                    </select>
                </div>
                <button
                    type="submit"
                    disabled={processing}
                    className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                    {processing ? 'Отправка...' : 'Отправить'}
                </button>
            </form>
        </div>
    );
}
