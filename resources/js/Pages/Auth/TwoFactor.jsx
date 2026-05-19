import AuthLayout from '@/Layouts/AuthLayout';
import { Head, useForm } from '@inertiajs/react';

export default function TwoFactor() {
    const { data, setData, post, processing, errors } = useForm({
        code: '',
    });

    function handleSubmit(e) {
        e.preventDefault();
        post('/two-factor');
    }

    return (
        <AuthLayout>
            <Head title="Двухфакторная аутентификация" />
            <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">
                    Двухфакторная аутентификация
                </h2>
                <p className="text-sm text-muted-foreground">
                    Введите 6-значный код из приложения-аутентификатора.
                </p>

                <div>
                    <label htmlFor="code" className="block text-sm font-medium text-foreground">
                        Код <span className="text-destructive">*</span>
                    </label>
                    <input
                        id="code"
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={data.code}
                        onChange={(e) => setData('code', e.target.value)}
                        className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-center text-lg tracking-widest text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
                        required
                        autoFocus
                    />
                    {errors.code && (
                        <p className="mt-1 text-sm text-destructive">{errors.code}</p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                    {processing ? 'Проверка...' : 'Подтвердить'}
                </button>
            </form>
        </AuthLayout>
    );
}
