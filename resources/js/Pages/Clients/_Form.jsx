export default function ClientForm({ form, onSubmit, submitLabel, cancelHref, availableUsers = [] }) {
    const { data, setData, processing, errors } = form;
    const input = 'mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring';
    const label = 'block text-sm font-medium text-foreground';

    return (
        <form onSubmit={onSubmit} className="rounded-lg border border-border bg-card p-6 space-y-4">
            <div>
                <label className={label}>Имя *</label>
                <input type="text" value={data.name} onChange={(e) => setData('name', e.target.value)} className={input} required autoFocus />
                {errors.name && <p className="mt-1 text-sm text-destructive">{errors.name}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className={label}>Email</label>
                    <input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} className={input} />
                    {errors.email && <p className="mt-1 text-sm text-destructive">{errors.email}</p>}
                </div>
                <div>
                    <label className={label}>Телефон</label>
                    <input type="text" value={data.phone} onChange={(e) => setData('phone', e.target.value)} className={input} />
                </div>
            </div>

            <div>
                <label className={label}>Компания</label>
                <input type="text" value={data.company} onChange={(e) => setData('company', e.target.value)} className={input} />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className={label}>Почасовая ставка</label>
                    <input type="number" step="0.01" min="0" value={data.hourly_rate} onChange={(e) => setData('hourly_rate', e.target.value)} className={input} />
                    {errors.hourly_rate && <p className="mt-1 text-sm text-destructive">{errors.hourly_rate}</p>}
                </div>
                <div>
                    <label className={label}>Валюта</label>
                    <select value={data.currency} onChange={(e) => setData('currency', e.target.value)} className={input}>
                        <option value="RUB">RUB</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                    </select>
                </div>
            </div>

            <div>
                <label className={label}>Привязка к пользователю-клиенту</label>
                <select
                    value={data.user_id ?? ''}
                    onChange={(e) => setData('user_id', e.target.value || null)}
                    className={input}
                >
                    <option value="">— не привязан —</option>
                    {availableUsers.map((u) => (
                        <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                    ))}
                </select>
                <p className="mt-1 text-xs text-muted-foreground">
                    Если привязать аккаунт, пользователь с ролью «Клиент» увидит в своём кабинете только счета этого заказчика.
                </p>
                {errors.user_id && <p className="mt-1 text-sm text-destructive">{errors.user_id}</p>}
            </div>

            <div>
                <label className={label}>Заметки</label>
                <textarea value={data.notes} onChange={(e) => setData('notes', e.target.value)} rows={3} className={input} />
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
