import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import ClientForm from './_Form';

export default function ClientEdit({ client, availableUsers }) {
    const form = useForm({
        name: client.name || '',
        email: client.email || '',
        phone: client.phone || '',
        company: client.company || '',
        hourly_rate: client.hourly_rate || '',
        currency: client.currency || 'RUB',
        notes: client.notes || '',
        user_id: client.user_id ?? null,
    });

    function handleSubmit(e) {
        e.preventDefault();
        form.put(`/clients/${client.id}`);
    }

    return (
        <AppLayout>
            <Head title="Редактирование клиента" />
            <div className="mx-auto max-w-2xl space-y-6">
                <div className="flex items-center gap-4">
                    <Link href={`/clients/${client.id}`} className="text-muted-foreground hover:text-foreground">&larr; Назад</Link>
                    <h1 className="text-2xl font-bold text-foreground">Редактирование клиента</h1>
                </div>
                <ClientForm form={form} onSubmit={handleSubmit} submitLabel="Сохранить" cancelHref={`/clients/${client.id}`} availableUsers={availableUsers} />
            </div>
        </AppLayout>
    );
}
