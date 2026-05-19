import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm, router } from '@inertiajs/react';

export default function TwoFactorSetup({ qrCodeUrl, secret, enabled }) {
    const enableForm = useForm({ code: '' });

    function handleEnable(e) {
        e.preventDefault();
        enableForm.post('/settings/two-factor/enable');
    }

    function handleDisable() {
        if (confirm('Вы уверены, что хотите отключить двухфакторную аутентификацию?')) {
            router.delete('/settings/two-factor/disable');
        }
    }

    return (
        <AppLayout>
            <Head title="Двухфакторная аутентификация" />
            <div className="mx-auto max-w-lg space-y-6">
                <h1 className="text-2xl font-bold text-foreground">
                    Двухфакторная аутентификация
                </h1>

                {enabled ? (
                    <div className="rounded-lg border border-border bg-card p-6 space-y-4">
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                Включена
                            </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Двухфакторная аутентификация включена для вашего аккаунта.
                        </p>
                        <button
                            onClick={handleDisable}
                            className="rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90"
                        >
                            Отключить 2FA
                        </button>
                    </div>
                ) : (
                    <div className="rounded-lg border border-border bg-card p-6 space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Отсканируйте QR-код приложением-аутентификатором (Google Authenticator, Authy и т.д.),
                            затем введите 6-значный код для подтверждения.
                        </p>

                        <div className="flex justify-center">
                            <div className="rounded-lg border border-border bg-white p-4">
                                <img
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeUrl)}`}
                                    alt="QR-код 2FA"
                                    className="h-48 w-48"
                                />
                            </div>
                        </div>

                        <div>
                            <p className="text-xs text-muted-foreground">Или введите код вручную:</p>
                            <code className="mt-1 block rounded bg-muted px-3 py-2 text-sm font-mono text-foreground select-all">
                                {secret}
                            </code>
                        </div>

                        <form onSubmit={handleEnable} className="space-y-3">
                            <div>
                                <label htmlFor="code" className="block text-sm font-medium text-foreground">
                                    Код подтверждения <span className="text-destructive">*</span>
                                </label>
                                <input
                                    id="code"
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={6}
                                    value={enableForm.data.code}
                                    onChange={(e) => enableForm.setData('code', e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-center text-lg tracking-widest text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
                                    required
                                    autoFocus
                                />
                                {enableForm.errors.code && (
                                    <p className="mt-1 text-sm text-destructive">{enableForm.errors.code}</p>
                                )}
                            </div>
                            <button
                                type="submit"
                                disabled={enableForm.processing}
                                className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                            >
                                {enableForm.processing ? 'Проверка...' : 'Включить 2FA'}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
