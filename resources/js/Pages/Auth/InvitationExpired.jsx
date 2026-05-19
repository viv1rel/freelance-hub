import AuthLayout from '@/Layouts/AuthLayout';
import { Head, Link } from '@inertiajs/react';

export default function InvitationExpired() {
    return (
        <AuthLayout>
            <Head title="Приглашение недействительно" />
            <div className="space-y-4 text-center">
                <h2 className="text-xl font-semibold text-foreground">
                    Приглашение недействительно
                </h2>
                <p className="text-sm text-muted-foreground">
                    Срок действия этого приглашения истёк или оно уже было использовано.
                    Запросите новое приглашение у администратора.
                </p>
                <Link
                    href="/login"
                    className="inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                    Перейти к входу
                </Link>
            </div>
        </AuthLayout>
    );
}
