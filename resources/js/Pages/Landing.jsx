import { Head, Link } from '@inertiajs/react';

const features = [
    {
        icon: '📊',
        title: 'Проекты и задачи',
        text: 'Kanban-доска с drag-and-drop, подзадачи, приоритеты, дедлайны и лог изменений.',
    },
    {
        icon: '⏱️',
        title: 'Учёт времени',
        text: 'Таймер с точным отсчётом через Web Worker и ручной ввод. Аналитика по проектам и клиентам.',
    },
    {
        icon: '🧾',
        title: 'Счета и оплата',
        text: 'Автоматическая генерация счетов из рабочих часов. PDF с кириллицей, email, онлайн-оплата через ЮKassa.',
    },
    {
        icon: '👥',
        title: 'Клиенты и команда',
        text: 'Приглашения в workspace, роли admin / фрилансер / клиент, отдельные БД для каждого рабочего пространства.',
    },
    {
        icon: '🔐',
        title: 'Безопасность',
        text: 'Двухфакторная аутентификация (TOTP), изоляция данных между workspace, cookie-based auth через Sanctum.',
    },
    {
        icon: '📈',
        title: 'Аналитика',
        text: 'Доход по месяцам и кварталам, топ клиентов, контроль задолженности и активных проектов.',
    },
];

const plans = [
    {
        name: 'Free',
        price: '0 ₽',
        sub: 'навсегда',
        features: [
            'До 3 проектов',
            'До 3 клиентов',
            'Все основные функции',
            'Email-поддержка',
        ],
        cta: 'Начать бесплатно',
        highlight: false,
    },
    {
        name: 'Pro',
        price: '990 ₽',
        sub: 'в месяц',
        features: [
            'Безлимит проектов и клиентов',
            'Брендинг PDF-счетов',
            'Приоритетная поддержка',
            'Расширенная аналитика',
        ],
        cta: 'Попробовать Pro',
        highlight: true,
    },
];

export default function Landing() {
    return (
        <div className="min-h-screen bg-background">
            <Head title="FreelanceHub — управление проектами и финансами фрилансера" />

            <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
                <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
                    <span className="text-xl font-bold text-primary">FreelanceHub</span>
                    <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
                        <a href="#features" className="hover:text-foreground">Возможности</a>
                        <a href="#pricing" className="hover:text-foreground">Тарифы</a>
                        <a href="#faq" className="hover:text-foreground">FAQ</a>
                    </nav>
                    <div className="flex items-center gap-3">
                        <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">Войти</Link>
                        <Link href="/register" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                            Начать
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-background to-background" />
                <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:py-32">
                    <div className="mx-auto max-w-3xl text-center">
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs text-muted-foreground">
                            <span className="h-2 w-2 rounded-full bg-green-500" />
                            Мультитенантная SaaS-платформа для фрилансеров
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                            Все проекты, часы и счета<br />
                            <span className="text-primary">в одном месте</span>
                        </h1>
                        <p className="mt-6 text-lg text-muted-foreground sm:text-xl">
                            Ведите задачи на Kanban, считайте время работы, выставляйте счета клиентам
                            и принимайте онлайн-оплату через Stripe — без хаоса и таблиц в Excel.
                        </p>
                        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                            <Link href="/register" className="w-full sm:w-auto rounded-md bg-primary px-6 py-3 text-base font-medium text-primary-foreground hover:bg-primary/90">
                                Создать workspace бесплатно
                            </Link>
                            <Link href="/login" className="w-full sm:w-auto rounded-md border border-border px-6 py-3 text-base font-medium text-foreground hover:bg-accent">
                                У меня уже есть аккаунт
                            </Link>
                        </div>
                        <p className="mt-4 text-xs text-muted-foreground">
                            Без привязки карты • Free-тариф навсегда • 2 минуты на настройку
                        </p>
                    </div>

                    {/* Fake preview card */}
                    <div className="mx-auto mt-16 max-w-5xl">
                        <div className="rounded-xl border border-border bg-card shadow-2xl shadow-primary/10">
                            <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
                                <div className="flex gap-1.5">
                                    <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
                                    <div className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                                    <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
                                </div>
                                <span className="ml-2 text-xs text-muted-foreground">workspace.freelancehub.app</span>
                            </div>
                            <div className="grid gap-4 p-6 sm:grid-cols-3">
                                <div className="rounded-lg bg-muted/50 p-4">
                                    <div className="text-xs text-muted-foreground">Доход за месяц</div>
                                    <div className="mt-1 text-2xl font-bold text-foreground">184 500 ₽</div>
                                    <div className="mt-2 h-1.5 rounded-full bg-primary/20">
                                        <div className="h-full w-3/4 rounded-full bg-primary" />
                                    </div>
                                </div>
                                <div className="rounded-lg bg-muted/50 p-4">
                                    <div className="text-xs text-muted-foreground">Активных проектов</div>
                                    <div className="mt-1 text-2xl font-bold text-foreground">7</div>
                                    <div className="mt-2 text-xs text-muted-foreground">+ 12 открытых задач</div>
                                </div>
                                <div className="rounded-lg bg-muted/50 p-4">
                                    <div className="text-xs text-muted-foreground">Неоплаченные счета</div>
                                    <div className="mt-1 text-2xl font-bold text-foreground">42 300 ₽</div>
                                    <div className="mt-2 text-xs text-yellow-600 dark:text-yellow-400">3 счёта ожидают оплаты</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section id="features" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                        Всё, что нужно для работы на себя
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        От первой задачи до оплаченного счёта — без переключения между приложениями.
                    </p>
                </div>
                <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {features.map((f) => (
                        <div key={f.title} className="rounded-lg border border-border bg-card p-6 transition-shadow hover:shadow-md">
                            <div className="text-3xl">{f.icon}</div>
                            <h3 className="mt-3 font-semibold text-foreground">{f.title}</h3>
                            <p className="mt-2 text-sm text-muted-foreground">{f.text}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* How it works */}
            <section className="bg-muted/30 py-20">
                <div className="mx-auto max-w-6xl px-4 sm:px-6">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                            Как это работает
                        </h2>
                    </div>
                    <div className="mt-12 grid gap-8 md:grid-cols-3">
                        {[
                            { n: '1', t: 'Зарегистрируйтесь', d: 'Создайте workspace за 30 секунд. Получите изолированную базу данных для своих проектов.' },
                            { n: '2', t: 'Работайте', d: 'Добавляйте проекты, задачи и клиентов. Засекайте время прямо из карточки задачи.' },
                            { n: '3', t: 'Получайте оплату', d: 'Одним кликом формируйте счёт из рабочих часов и отправляйте клиенту PDF со ссылкой на оплату.' },
                        ].map((s) => (
                            <div key={s.n} className="relative">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                                    {s.n}
                                </div>
                                <h3 className="mt-4 font-semibold text-foreground">{s.t}</h3>
                                <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing */}
            <section id="pricing" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                        Прозрачные тарифы
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Начинайте бесплатно. Переходите на Pro, когда перерастёте лимиты.
                    </p>
                </div>
                <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-2">
                    {plans.map((plan) => (
                        <div
                            key={plan.name}
                            className={`rounded-xl border p-8 ${
                                plan.highlight
                                    ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                                    : 'border-border bg-card'
                            }`}
                        >
                            <div className="flex items-baseline justify-between">
                                <h3 className="text-2xl font-bold text-foreground">{plan.name}</h3>
                                {plan.highlight && (
                                    <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                                        Популярный
                                    </span>
                                )}
                            </div>
                            <div className="mt-4 flex items-baseline gap-2">
                                <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                                <span className="text-muted-foreground">{plan.sub}</span>
                            </div>
                            <ul className="mt-6 space-y-3 text-sm">
                                {plan.features.map((f) => (
                                    <li key={f} className="flex items-start gap-2 text-muted-foreground">
                                        <span className="mt-0.5 text-primary">✓</span>
                                        <span>{f}</span>
                                    </li>
                                ))}
                            </ul>
                            <Link
                                href="/register"
                                className={`mt-8 block w-full rounded-md px-4 py-2.5 text-center text-sm font-medium ${
                                    plan.highlight
                                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                                        : 'border border-border text-foreground hover:bg-accent'
                                }`}
                            >
                                {plan.cta}
                            </Link>
                        </div>
                    ))}
                </div>
            </section>

            {/* FAQ */}
            <section id="faq" className="bg-muted/30 py-20">
                <div className="mx-auto max-w-3xl px-4 sm:px-6">
                    <h2 className="text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                        Частые вопросы
                    </h2>
                    <div className="mt-12 space-y-4">
                        {[
                            {
                                q: 'Это действительно бесплатно?',
                                a: 'Да, тариф Free доступен навсегда без привязки карты. Он подойдёт для одного клиента и 3 проектов — этого достаточно, чтобы попробовать все функции.',
                            },
                            {
                                q: 'Мои данные изолированы от других пользователей?',
                                a: 'Да. Для каждого workspace создаётся отдельная база данных (stancl/tenancy). Ваши проекты, задачи и счета физически отделены от данных других клиентов.',
                            },
                            {
                                q: 'Как принимать оплату от клиентов?',
                                a: 'После создания счёта вы получаете публичную ссылку. Клиент открывает её и оплачивает картой, СБП или ЮMoney через ЮKassa. Статус счёта обновляется автоматически через webhook.',
                            },
                            {
                                q: 'Можно ли пригласить команду?',
                                a: 'Да. В workspace можно приглашать участников с ролями admin, freelancer или client. Каждая роль имеет свой набор прав, настраиваемый через политики Laravel.',
                            },
                            {
                                q: 'Поддерживается ли кириллица в PDF?',
                                a: 'Да, PDF-шаблон использует DejaVu Sans и корректно отображает кириллицу. Счета оформлены по российскому стандарту: выставлен/срок оплаты, НДС, скидка.',
                            },
                        ].map((item) => (
                            <details key={item.q} className="group rounded-lg border border-border bg-card p-4">
                                <summary className="flex cursor-pointer items-center justify-between font-medium text-foreground">
                                    {item.q}
                                    <span className="text-muted-foreground transition-transform group-open:rotate-180">▾</span>
                                </summary>
                                <p className="mt-3 text-sm text-muted-foreground">{item.a}</p>
                            </details>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6">
                <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                    Готовы навести порядок в работе?
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                    Создайте аккаунт за минуту и перенесите свой первый проект уже сегодня.
                </p>
                <Link
                    href="/register"
                    className="mt-8 inline-block rounded-md bg-primary px-8 py-3 text-base font-medium text-primary-foreground hover:bg-primary/90"
                >
                    Начать бесплатно
                </Link>
            </section>

            <footer className="border-t border-border py-8">
                <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm text-muted-foreground sm:flex-row sm:px-6">
                    <span>© {new Date().getFullYear()} FreelanceHub. Все права защищены.</span>
                    <div className="flex gap-6">
                        <a href="#features" className="hover:text-foreground">Возможности</a>
                        <a href="#pricing" className="hover:text-foreground">Тарифы</a>
                        <Link href="/login" className="hover:text-foreground">Войти</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
