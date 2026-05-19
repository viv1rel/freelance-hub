import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import ClientForm from './_Form';

export default function ClientCreate({ availableUsers }) {
    const form = useForm({
        name: '',
        email: '',
        phone: '',
        company: '',
        hourly_rate: '',
        currency: 'RUB',
        notes: '',
        user_id: null,
    });

    function handleSubmit(e) {
        e.preventDefault();
        form.post('/clients');
    }

    return (
        <AppLayout>
            <Head title="Новый клиент" />
            <div className="mx-auto max-w-2xl space-y-6">
                <div className="flex items-center gap-4">
                    <Link href="/clients" className="text-muted-foreground hover:text-foreground">&larr; Назад</Link>
                    <h1 className="text-2xl font-bold text-foreground">Новый клиент</h1>
                </div>
                <ClientForm form={form} onSubmit={handleSubmit} submitLabel="Создать клиента" cancelHref="/clients" availableUsers={availableUsers} />
            </div>
        </AppLayout>
    );
}
