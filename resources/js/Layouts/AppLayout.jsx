import { Link, usePage, router } from '@inertiajs/react';
import { useState } from 'react';

export default function AppLayout({ children }) {
    const { auth } = usePage().props;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const isClient = auth?.user?.role === 'client';
    const workspaces = auth?.workspaces ?? [];
    const currentTenantId = auth?.user?.current_tenant_id;
    const currentWorkspace = workspaces.find((w) => w.id === currentTenantId);

    const handleSwitch = (e) => {
        const tenantId = e.target.value;
        if (tenantId && tenantId !== currentTenantId) {
            router.post(`/workspaces/${tenantId}/switch`);
        }
    };

    const navigation = isClient
        ? [
              { name: 'Мои счета', href: '/portal/invoices' },
              { name: 'Настройки', href: '/settings' },
          ]
        : [
              { name: 'Дашборд', href: '/dashboard' },
              { name: 'Проекты', href: '/projects' },
              { name: 'Задачи', href: '/tasks' },
              { name: 'Время', href: '/time-tracking' },
              { name: 'Клиенты', href: '/clients' },
              { name: 'Счета', href: '/invoices' },
              { name: 'Подписка', href: '/billing' },
              { name: 'Настройки', href: '/settings' },
          ];

    return (
        <div className="min-h-screen bg-background">
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-card border-r border-border transition-transform duration-200 lg:translate-x-0 ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="flex h-16 items-center gap-2 border-b border-border px-6">
                    <span className="text-xl font-bold text-primary">FreelanceHub</span>
                </div>
                {workspaces.length > 1 ? (
                    <div className="px-3 pt-4">
                        <select
                            value={currentTenantId ?? ''}
                            onChange={handleSwitch}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            aria-label="Переключить рабочее пространство"
                        >
                            {workspaces.map((w) => (
                                <option key={w.id} value={w.id}>
                                    {w.name} ({w.role})
                                </option>
                            ))}
                        </select>
                    </div>
                ) : currentWorkspace ? (
                    <div className="px-6 pt-4 text-xs text-muted-foreground truncate">
                        {currentWorkspace.name}
                    </div>
                ) : null}
                <nav className="mt-4 space-y-1 px-3">
                    {navigation.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                        >
                            {item.name}
                        </Link>
                    ))}
                </nav>
            </aside>

            {/* Main content */}
            <div className="lg:pl-64">
                <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-card px-4 sm:px-6">
                    <button
                        className="lg:hidden"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                        </svg>
                    </button>
                    <div className="flex-1" />
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">
                            {auth?.user?.name}
                        </span>
                        <button
                            onClick={() => router.post('/logout')}
                            className="text-sm text-muted-foreground hover:text-foreground"
                        >
                            Выйти
                        </button>
                    </div>
                </header>

                <main className="p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
