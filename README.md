# FreelanceHub

SaaS-платформа для автоматизации управления проектами и финансами фрилансеров.

## Возможности

- **Проекты и задачи** — Kanban-доска с drag-and-drop, список, фильтрация, логирование активности
- **Учёт времени** — таймер (старт/стоп/пауза), ручной ввод, отчёты по проектам и клиентам
- **Клиенты и счета** — генерация счетов из записей времени, PDF с кириллицей, отправка по email
- **Онлайн-оплата** — оплата счетов через ЮKassa (карты, СБП, ЮMoney)
- **Подписки** — тарифы Free (3 проекта / 3 клиента) и Pro (безлимит); подписка покупается на workspace и распространяется на всех его участников
- **Мультитенантность** — у каждого workspace отдельная MySQL БД (stancl/tenancy)
- **Многоучастниковые workspace** — один User состоит в N workspace через pivot `workspace_members`; роль может отличаться в каждом; переключение через дропдаун в сайдбаре
- **Роли** — admin, freelancer, client (Laravel Gate + Policies + role middleware), хранятся в pivot
- **Клиент-портал** — `/portal/invoices` для роли client: видит только свои счета, остальное закрыто
- **Управление командой** — `/settings/team`: приглашения, смена ролей, удаление, защита last-admin
- **Напоминания** — ежедневный артизан-таск `app:send-deadline-reminders` рассылает email по приближающимся дедлайнам задач и срокам оплаты счетов
- **2FA** — двухфакторная аутентификация через TOTP (Google Authenticator)
- **Throttle** — rate-limit на регистрации/логине/2FA/инвайтах

## Стек

| Слой | Технологии |
|---|---|
| Backend | PHP 8.3, Laravel 11, stancl/tenancy 3.x |
| Frontend | React 18, Inertia.js 2.x, Tailwind CSS 3.x, shadcn/ui |
| База данных | MySQL 8.0 (центральная + tenant БД), Redis |
| Очереди / кэш | Redis |
| Платежи | ЮKassa SDK |
| PDF | Dompdf + DejaVu Sans (кириллица) |
| Тесты | Pest v4 |
| Инфраструктура | Docker, Docker Compose, Nginx, PHP-FPM 8.3 |
| CI/CD | GitHub Actions (Pint + PHPStan/larastan + Pest) |
| Почта (dev) | Mailpit |

## Быстрый старт

### Требования

- Docker и Docker Compose

### Установка

```bash
# 1. Клонируй репозиторий
git clone https://github.com/<username>/freelance-hub.git
cd freelance-hub

# 2. Скопируй файл окружения
cp .env.example .env

# 3. Заполни .env (см. раздел "Переменные окружения" ниже)

# 4. Запусти контейнеры
docker compose up -d

# 5. Установи зависимости
docker compose exec app composer install
docker compose exec app npm install

# 6. Сгенерируй ключ приложения
docker compose exec app php artisan key:generate

# 7. Запусти миграции
docker compose exec app php artisan migrate

# 8. Собери фронтенд
docker compose exec app npm run build
```

Открой [http://localhost](http://localhost) в браузере.

### Почта (Mailpit)

Все исходящие письма в режиме разработки перехватываются Mailpit:
[http://localhost:8025](http://localhost:8025)

## Переменные окружения

Основные переменные в `.env`:

```dotenv
# Приложение
APP_URL=http://localhost

# База данных
DB_HOST=mysql
DB_DATABASE=freelancehub
DB_USERNAME=freelancehub
DB_PASSWORD=secret

# ЮKassa (получи в личном кабинете yookassa.ru)
YOOKASSA_SHOP_ID=123456
YOOKASSA_SECRET_KEY=test_xxxxxxxxxxxxxxxx
YOOKASSA_PRO_PRICE=99000  # цена Pro в копейках (99000 = 990 руб.)
```

### Webhook ЮKassa (для локальной разработки)

ЮKassa не может достучаться до `localhost`, поэтому нужен публичный туннель:

```bash
npx localtunnel --port 80
```

Полученный URL (например `https://abc123.loca.lt`) укажи:
- в `.env`: `APP_URL=https://abc123.loca.lt`
- в настройках ЮKassa → Уведомления: `https://abc123.loca.lt/yookassa/webhook`

После смены `APP_URL`:
```bash
docker compose exec app php artisan config:clear
docker compose exec app npm run build
```

## Разработка

```bash
# Фронтенд с hot-reload
docker compose exec app npm run dev

# Запуск тестов
docker compose exec app php artisan test

# Проверка стиля кода
docker compose exec app ./vendor/bin/pint

# Статический анализ (PHPStan, level 5)
docker compose exec app composer analyse

# Логи приложения
docker compose logs -f app

# Подключиться к контейнеру
docker compose exec app bash

# Консоль Laravel
docker compose exec app php artisan tinker
```

## Архитектура

```
FreelanceHub
├── Центральная БД (MySQL)
│   ├── users               — аккаунты (current_tenant_id — активный workspace)
│   ├── workspace_members   — pivot (user_id, tenant_id, role, joined_at)
│   ├── tenants             — workspaces
│   ├── subscriptions       — подписки на уровне tenant (Free / Pro)
│   └── workspace_invitations
│
└── Tenant БД (отдельная MySQL БД на каждый workspace)
    ├── projects
    ├── tasks + task_activities
    ├── time_entries
    ├── clients
    ├── invoices + invoice_items
    └── transactions
```

### Иерархия данных

```
User ↔ (workspace_members) ↔ Tenant → Project → Task → TimeEntry
                                    → Client  → Invoice → InvoiceItem → Transaction
```

### Структура проекта

```
app/
├── Http/Controllers/
│   ├── Auth/          # Регистрация, вход, 2FA, приглашения
│   ├── Tenant/        # Проекты, задачи, время, клиенты, счета, дашборд, ClientPortal
│   ├── Settings/      # Team — управление участниками
│   └── Billing/       # Подписки, webhook ЮKassa
├── Console/Commands/  # SendDeadlineReminders (Schedule в routes/console.php)
├── Models/            # Eloquent-модели
├── Policies/          # Авторизация действий
├── Services/          # Бизнес-логика (YooKassaService, PdfService, ...)
└── Notifications/     # Email-уведомления (InvoiceSent, DeadlineReminder, ...)

resources/js/
├── Pages/             # Inertia-страницы (React)
├── Components/        # Переиспользуемые компоненты (KanbanBoard, Timer, ...)
└── Layouts/           # AppLayout, AuthLayout

database/
├── migrations/        # Миграции центральной БД
└── migrations/tenant/ # Миграции tenant БД
```

## Тестирование

Тесты написаны на Pest v4, используют SQLite in-memory:

```bash
docker compose exec app php artisan test
```

Покрытие (49 тестов): аутентификация и приглашения (включая «повторное» приглашение существующего юзера), CRUD проектов и задач (Kanban + лог активности), управление командой и last-admin guard, клиент-портал и изоляция доступа, создание/оплата счетов, лимиты Free-плана и Pro на уровне tenant, переключение между workspace и изоляция tenant-контекста.

## Документация

- `README.md` — этот файл, обзор и инструкция по запуску
- `TESTING_GUIDE.md` — пошаговое руководство по ручному тестированию

## Лицензия

MIT
