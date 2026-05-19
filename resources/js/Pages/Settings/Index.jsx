import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, usePage } from '@inertiajs/react';

export default function SettingsIndex() {
    const { auth, flash } = usePage().props;
    const user = auth?.user;

    return (
        <AppLayout>
            <Head title="Настройки" />
            <div className="mx-auto max-w-2xl space-y-6">
                <h1 className="text-2xl font-bold text-foreground">Настройки</h1>

                {flash?.success && (
                    <div className="rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 text-sm text-green-700 dark:text-green-400">
                        {flash.success}
                    </div>
                )}

                {/* Two-Factor Authentication */}
                <div className="rounded-lg border border-border bg-card p-6">
                    <h2 className="text-lg font-semibold text-foreground">
                        Двухфакторная аутентификация
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Добавьте дополнительный уровень безопасности через TOTP.
                    </p>
                    <div className="mt-4 flex items-center gap-3">
                        <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                user?.two_factor_enabled
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                            }`}
                        >
                            {user?.two_factor_enabled ? 'Включена' : 'Отключена'}
                        </span>
                        <Link
                            href="/settings/two-factor"
                            className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                        >
                            {user?.two_factor_enabled ? 'Управление' : 'Включить'}
                        </Link>
                    </div>
                </div>

                {user?.role === 'admin' && (
                    <div className="rounded-lg border border-border bg-card p-6">
                        <h2 className="text-lg font-semibold text-foreground">Команда</h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Управление участниками рабочего пространства, ролями и приглашениями.
                        </p>
                        <Link
                            href="/settings/team"
                            className="mt-4 inline-block rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                        >
                            Открыть участников
                        </Link>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
