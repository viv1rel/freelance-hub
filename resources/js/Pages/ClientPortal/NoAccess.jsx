import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';

export default function NoAccess() {
    return (
        <AppLayout>
            <Head title="Доступ ограничен" />
            <div className="mx-auto max-w-xl rounded-lg border border-border bg-card p-12 text-center">
                <h1 className="text-xl font-semibold text-foreground">Аккаунт не привязан к заказчику</h1>
                <p className="mt-3 text-sm text-muted-foreground">
                    Ваш пользователь имеет роль «Клиент», но ещё не привязан ни к одному заказчику в этом рабочем пространстве.
                    Попросите администратора привязать ваш аккаунт в карточке заказчика.
                </p>
            </div>
        </AppLayout>
    );
}
