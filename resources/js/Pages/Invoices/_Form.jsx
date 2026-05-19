export default function InvoiceForm({ form, clients, onSubmit, submitLabel, cancelHref }) {
    const { data, setData, processing, errors } = form;
    const input = 'mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring';
    const label = 'block text-sm font-medium text-foreground';

    function updateItem(i, key, value) {
        const items = [...data.items];
        items[i] = { ...items[i], [key]: value };
        setData('items', items);
    }

    function addItem() {
        setData('items', [...data.items, { description: '', quantity: 1, unit_price: 0 }]);
    }

    function removeItem(i) {
        setData('items', data.items.filter((_, idx) => idx !== i));
    }

    const subtotal = data.items.reduce((s, it) => s + (Number(it.quantity) || 0) * (Number(it.unit_price) || 0), 0);
    const discount = Number(data.discount) || 0;
    const taxable = Math.max(subtotal - discount, 0);
    const taxAmount = taxable * ((Number(data.tax_rate) || 0) / 100);
    const total = taxable + taxAmount;

    const fmt = (v) => new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 2 }).format(v);

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <div className="rounded-lg border border-border bg-card p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={label}>Клиент *</label>
                        <select value={data.client_id} onChange={(e) => setData('client_id', e.target.value)} className={input} required>
                            <option value="">— Выбрать —</option>
                            {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        {errors.client_id && <p className="mt-1 text-sm text-destructive">{errors.client_id}</p>}
                    </div>
                    <div>
                        <label className={label}>Валюта</label>
                        <select value={data.currency} onChange={(e) => setData('currency', e.target.value)} className={input}>
                            <option value="RUB">RUB</option>
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                        </select>
                    </div>
                    <div>
                        <label className={label}>Дата выставления *</label>
                        <input type="date" value={data.issued_at} onChange={(e) => setData('issued_at', e.target.value)} className={input} required />
                    </div>
                    <div>
                        <label className={label}>Срок оплаты *</label>
                        <input type="date" value={data.due_at} onChange={(e) => setData('due_at', e.target.value)} className={input} required />
                    </div>
                </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="font-semibold text-foreground">Позиции</h2>
                    <button type="button" onClick={addItem} className="text-sm text-primary hover:underline">+ Добавить позицию</button>
                </div>
                <div className="space-y-2">
                    {data.items.map((item, i) => (
                        <div key={i} className="grid grid-cols-12 gap-2">
                            <input type="text" placeholder="Описание" value={item.description} onChange={(e) => updateItem(i, 'description', e.target.value)} className="col-span-6 rounded-md border border-input bg-background px-3 py-2 text-sm" required />
                            <input type="number" step="0.01" min="0.01" placeholder="Кол-во" value={item.quantity} onChange={(e) => updateItem(i, 'quantity', e.target.value)} className="col-span-2 rounded-md border border-input bg-background px-3 py-2 text-sm" required />
                            <input type="number" step="0.01" min="0" placeholder="Цена" value={item.unit_price} onChange={(e) => updateItem(i, 'unit_price', e.target.value)} className="col-span-2 rounded-md border border-input bg-background px-3 py-2 text-sm" required />
                            <div className="col-span-1 flex items-center text-sm text-muted-foreground">
                                {fmt((Number(item.quantity) || 0) * (Number(item.unit_price) || 0))}
                            </div>
                            <button type="button" onClick={() => removeItem(i)} className="col-span-1 text-destructive hover:underline" disabled={data.items.length <= 1}>✕</button>
                        </div>
                    ))}
                </div>
                {errors.items && <p className="mt-2 text-sm text-destructive">{errors.items}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border border-border bg-card p-6 space-y-4">
                    <div>
                        <label className={label}>Скидка</label>
                        <input type="number" step="0.01" min="0" value={data.discount} onChange={(e) => setData('discount', e.target.value)} className={input} />
                    </div>
                    <div>
                        <label className={label}>Налог, %</label>
                        <input type="number" step="0.01" min="0" max="100" value={data.tax_rate} onChange={(e) => setData('tax_rate', e.target.value)} className={input} />
                    </div>
                    <div>
                        <label className={label}>Примечание</label>
                        <textarea value={data.notes} onChange={(e) => setData('notes', e.target.value)} rows={3} className={input} />
                    </div>
                </div>
                <div className="rounded-lg border border-border bg-card p-6 space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Подытог:</span><span className="text-foreground">{fmt(subtotal)} {data.currency}</span></div>
                    {discount > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Скидка:</span><span className="text-foreground">−{fmt(discount)} {data.currency}</span></div>}
                    {(Number(data.tax_rate) || 0) > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Налог:</span><span className="text-foreground">{fmt(taxAmount)} {data.currency}</span></div>}
                    <div className="flex justify-between border-t border-border pt-2 font-semibold text-base"><span className="text-foreground">Итого:</span><span className="text-foreground">{fmt(total)} {data.currency}</span></div>
                </div>
            </div>

            <div className="flex justify-end gap-3">
                <a href={cancelHref} className="rounded-md border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent">Отмена</a>
                <button type="submit" disabled={processing} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                    {processing ? 'Сохранение...' : submitLabel}
                </button>
            </div>
        </form>
    );
}
