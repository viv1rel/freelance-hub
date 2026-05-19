import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import InvoiceForm from './_Form';

export default function InvoiceEdit({ invoice, clients }) {
    const form = useForm({
        client_id: invoice.client_id,
        currency: invoice.currency,
        issued_at: invoice.issued_at,
        due_at: invoice.due_at,
        tax_rate: invoice.tax_rate,
        discount: invoice.discount,
        notes: invoice.notes || '',
        items: invoice.items.map((i) => ({ description: i.description, quantity: i.quantity, unit_price: i.unit_price })),
    });

    function handleSubmit(e) {
        e.preventDefault();
        form.put(`/invoices/${invoice.id}`);
    }

    return (
        <AppLayout>
            <Head title={`Счёт № ${invoice.number}`} />
            <div className="mx-auto max-w-4xl space-y-6">
                <div className="flex items-center gap-4">
                    <Link href={`/invoices/${invoice.id}`} className="text-muted-foreground hover:text-foreground">&larr; Назад</Link>
                    <h1 className="text-2xl font-bold text-foreground">Счёт № {invoice.number}</h1>
                </div>
                <InvoiceForm form={form} clients={clients} onSubmit={handleSubmit} submitLabel="Сохранить" cancelHref={`/invoices/${invoice.id}`} />
            </div>
        </AppLayout>
    );
}
