import AuthLayout from '@/Layouts/AuthLayout';
import { Head, useForm } from '@inertiajs/react';

export default function AcceptInvitation({ invitation }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        password: '',
        password_confirmation: '',
    });

    function handleSubmit(e) {
        e.preventDefault();
        post(`/invitations/${invitation.token}/accept`);
    }

    const roleLabels = { freelancer: 'фрилансер', client: 'клиент', admin: 'администратор' };

    return (
        <AuthLayout>
            <Head title="Принять приглашение" />
            <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">
                    Присоединиться к {invitation.workspace_name}
                </h2>
                <p className="text-sm text-muted-foreground">
                    Вас пригласили в качестве: <strong>{roleLabels[invitation.role] || invitation.role}</strong>
                </p>

                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-foreground">Имя <span className="text-destructive">*</span></label>
                    <input
                        id="name"
                        type="text"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
                        required
                        autoFocus
                    />
                    {errors.name && <p className="mt-1 text-sm text-destructive">{errors.name}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-foreground">Email</label>
                    <input
                        type="email"
                        value={invitation.email}
                        disabled
                        className="mt-1 block w-full rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground"
                    />
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-foreground">Пароль <span className="text-destructive">*</span></label>
                    <input
                        id="password"
                        type="password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
                        required
                    />
                    {errors.password && <p className="mt-1 text-sm text-destructive">{errors.password}</p>}
                </div>

                <div>
                    <label htmlFor="password_confirmation" className="block text-sm font-medium text-foreground">
                        Подтверждение пароля <span className="text-destructive">*</span>
                    </label>
                    <input
                        id="password_confirmation"
                        type="password"
                        value={data.password_confirmation}
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                    {processing ? 'Присоединение...' : 'Присоединиться'}
                </button>
            </form>
        </AuthLayout>
    );
}
