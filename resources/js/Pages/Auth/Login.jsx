import AuthLayout from '@/Layouts/AuthLayout';
import { Head, useForm, Link } from '@inertiajs/react';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    function handleSubmit(e) {
        e.preventDefault();
        post('/login');
    }

    return (
        <AuthLayout>
            <Head title="Вход" />
            <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">Вход в аккаунт</h2>

                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-foreground">
                        Email <span className="text-destructive">*</span>
                    </label>
                    <input
                        id="email"
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
                        required
                        autoFocus
                    />
                    {errors.email && (
                        <p className="mt-1 text-sm text-destructive">{errors.email}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-foreground">
                        Пароль <span className="text-destructive">*</span>
                    </label>
                    <input
                        id="password"
                        type="password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
                        required
                    />
                    {errors.password && (
                        <p className="mt-1 text-sm text-destructive">{errors.password}</p>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <input
                        id="remember"
                        type="checkbox"
                        checked={data.remember}
                        onChange={(e) => setData('remember', e.target.checked)}
                        className="rounded border-input text-primary focus:ring-ring"
                    />
                    <label htmlFor="remember" className="text-sm text-muted-foreground">
                        Запомнить меня
                    </label>
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                    {processing ? 'Вход...' : 'Войти'}
                </button>

                <p className="text-center text-sm text-muted-foreground">
                    Нет аккаунта?{' '}
                    <Link href="/register" className="text-primary hover:underline">
                        Зарегистрироваться
                    </Link>
                </p>
            </form>
        </AuthLayout>
    );
}
