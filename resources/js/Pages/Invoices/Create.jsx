import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import InvoiceForm from './_Form';

export default function InvoiceCreate({ clients, preselectedClientId, suggestedItems, nextNumber }) {
    const today = new Date().toISOString().slice(0, 10);
    const due = new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);

    const initialItems = (suggestedItems && suggestedItems.length > 0)
        ? suggestedItems.map((s) => ({ description: s.description, quantity: s.quantity, unit_price: s.unit_price }))
        : [{ description: '', quantity: 1, unit_price: 0 }];

    const preselected = preselectedClientId ? clients.find((c) => c.id === preselectedClientId) : null;

    const form = useForm({
        client_id: preselectedClientId || '',
        currency: preselected?.currency || 'RUB',
        issued_at: today,
        due_at: due,
        tax_rate: 0,
        discount: 0,
        notes: '',
        items: initialItems,
    });

    function handleSubmit(e) {
        e.preventDefault();
        form.post('/invoices');
    }

    return (
        <AppLayout>
            <Head title="Новый счёт" />
            <div className="mx-auto max-w-4xl space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/invoices" className="text-muted-foreground hover:text-foreground">&larr; Назад</Link>
                        <h1 className="text-2xl font-bold text-foreground">Новый счёт</h1>
                    </div>
                    <div className="text-sm text-muted-foreground">Номер: {nextNumber}</div>
                </div>
                <InvoiceForm form={form} clients={clients} onSubmit={handleSubmit} submitLabel="Создать счёт" cancelHref="/invoices" />
            </div>
        </AppLayout>
    );
}
