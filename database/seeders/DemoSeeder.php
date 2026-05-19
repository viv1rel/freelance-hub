<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Client;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Project;
use App\Models\Task;
use App\Models\Tenant;
use App\Models\TimeEntry;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * Idempotent demo seeder: rebuilds two demo workspaces from scratch.
 *
 * Run: php artisan db:seed --class=DemoSeeder
 */
class DemoSeeder extends Seeder
{
    public function run(): void
    {
        $this->buildWorkspace(
            tenantName: 'a',
            adminEmail: 'admin@demo.local',
            adminName: 'Демо Админ',
            freelancerEmail: 'freelancer@demo.local',
            freelancerName: 'Демо Фрилансер',
            clients: [
                ['email' => 'contact@w1.demo.local', 'name' => 'Иван Романов', 'company' => 'ООО «Ромашка»'],
                ['email' => 'a.petrova@w1.demo.local', 'name' => 'Анна Петрова', 'company' => 'Студия «Меридиан»'],
                ['email' => 'igor@w1.demo.local', 'name' => 'Игорь Соколов', 'company' => 'ИП Соколов'],
                ['email' => 'd.orlov@w1.demo.local', 'name' => 'Дмитрий Орлов', 'company' => 'Globex Corp'],
            ],
            projectsCount: 4,
        );

        $this->buildWorkspace(
            tenantName: 'Студия Алгоритм',
            adminEmail: 'admin2@demo.local',
            adminName: 'Мария Иванова',
            freelancerEmail: 'freelancer2@demo.local',
            freelancerName: 'Павел Сидоров',
            clients: [
                ['email' => 'a.grachev@w2.demo.local', 'name' => 'Алексей Грачёв', 'company' => 'Логистико'],
                ['email' => 'vika@w2.demo.local', 'name' => 'Виктория Семенова', 'company' => 'EcoShop'],
                ['email' => 'mk@w2.demo.local', 'name' => 'Михаил Кузнецов', 'company' => 'МедЛаб'],
            ],
            projectsCount: 3,
        );

        $this->crossAttach();
    }

    /**
     * Make admin@demo.local a member of the second workspace too,
     * so the workspace-switcher dropdown appears for them.
     */
    private function crossAttach(): void
    {
        $admin = User::where('email', 'admin@demo.local')->first();
        $ws2 = Tenant::where('name', 'Студия Алгоритм')->first();

        if ($admin && $ws2 && ! $admin->isMemberOf($ws2->id)) {
            $admin->workspaces()->attach($ws2->id, [
                'role' => 'freelancer',
                'joined_at' => now(),
            ]);
            $this->command->info('Cross-attached admin@demo.local to "Студия Алгоритм" as freelancer.');
        }
    }

    /**
     * @param  list<array{email:string,name:string,company:string}>  $clients
     */
    private function buildWorkspace(
        string $tenantName,
        string $adminEmail,
        string $adminName,
        string $freelancerEmail,
        string $freelancerName,
        array $clients,
        int $projectsCount,
    ): void {
        // Идемпотентность: сносим прежние демо-юзеры и их workspace
        $emails = array_merge(
            [$adminEmail, $freelancerEmail],
            array_column($clients, 'email'),
        );
        $usersToReset = User::whereIn('email', $emails)->get();
        foreach ($usersToReset as $u) {
            foreach ($u->workspaces as $w) {
                $w->delete(); // каскадно дропает pivot и tenant-БД через TenantDeleted listener
            }
            $u->delete();
        }

        $tenant = Tenant::create([
            'id' => Str::uuid()->toString(),
            'name' => $tenantName,
        ]);

        $admin = $this->makeUser($adminEmail, $adminName);
        $admin->workspaces()->attach($tenant->id, ['role' => 'admin', 'joined_at' => now()]);
        $admin->update(['current_tenant_id' => $tenant->id]);

        $freelancer = $this->makeUser($freelancerEmail, $freelancerName);
        $freelancer->workspaces()->attach($tenant->id, ['role' => 'freelancer', 'joined_at' => now()]);
        $freelancer->update(['current_tenant_id' => $tenant->id]);

        $clientUsers = [];
        foreach ($clients as $c) {
            $u = $this->makeUser($c['email'], $c['name']);
            $u->workspaces()->attach($tenant->id, ['role' => 'client', 'joined_at' => now()]);
            $u->update(['current_tenant_id' => $tenant->id]);
            $clientUsers[$c['email']] = $u;
        }

        // Дальнейшие записи идут в tenant-БД
        tenancy()->initialize($tenant);

        try {
            $createdClients = [];
            foreach ($clients as $c) {
                $createdClients[] = Client::create([
                    'user_id' => $clientUsers[$c['email']]->id,
                    'name' => $c['company'],
                    'email' => $c['email'],
                    'company' => $c['company'],
                    'currency' => 'RUB',
                    'hourly_rate' => 2500,
                ]);
            }

            $projects = [];
            for ($i = 1; $i <= $projectsCount; $i++) {
                $client = $createdClients[($i - 1) % count($createdClients)];
                $projects[] = Project::create([
                    'name' => 'Проект '.$i.' для '.$client->company,
                    'description' => 'Демо-проект, созданный сидером.',
                    'client_id' => $client->id,
                    'status' => $i === $projectsCount ? 'completed' : 'active',
                    'user_id' => $admin->id,
                    'deadline' => now()->addDays(30 * $i)->toDateString(),
                ]);
            }

            $taskTitles = [
                'Анализ требований', 'Разработка макета', 'Backend API',
                'Frontend UI', 'Тестирование', 'Деплой',
            ];
            foreach ($projects as $idx => $project) {
                foreach (array_slice($taskTitles, 0, 4) as $j => $title) {
                    Task::create([
                        'project_id' => $project->id,
                        'title' => $title,
                        'description' => 'Задача из демо-данных.',
                        'status' => ['open', 'in_progress', 'review', 'closed'][$j],
                        'priority' => ['low', 'medium', 'high', 'medium'][$j],
                        'deadline' => now()->addDays(7 * ($j + 1))->toDateString(),
                        'assignee_id' => $j % 2 === 0 ? $freelancer->id : $admin->id,
                        'sort_order' => $j,
                    ]);
                }
            }

            $firstProject = $projects[0];
            for ($i = 0; $i < 3; $i++) {
                $start = now()->subDays($i + 1)->setTime(10, 0);
                $end = $start->copy()->addMinutes(90);
                TimeEntry::create([
                    'user_id' => $freelancer->id,
                    'project_id' => $firstProject->id,
                    'started_at' => $start,
                    'ended_at' => $end,
                    'duration_minutes' => 90,
                    'description' => 'Работа над задачей #'.($i + 1),
                    'is_running' => false,
                ]);
            }

            $invoiceSpecs = [
                ['status' => 'paid', 'total' => 145000, 'paid_amount' => 145000],
                ['status' => 'sent', 'total' => 53000, 'paid_amount' => 0],
                ['status' => 'overdue', 'total' => 55000, 'paid_amount' => 0],
                ['status' => 'partially_paid', 'total' => 158000, 'paid_amount' => 80000],
                ['status' => 'draft', 'total' => 220000, 'paid_amount' => 0],
            ];

            $payTokens = [];
            foreach ($invoiceSpecs as $i => $spec) {
                $client = $createdClients[$i % count($createdClients)];
                $token = Str::random(60);
                $issuedAt = now()->subDays(($i + 1) * 5)->toDateString();
                $dueAt = $spec['status'] === 'overdue'
                    ? now()->subDays(3)->toDateString()
                    : now()->addDays(14 - $i * 2)->toDateString();

                $invoice = Invoice::create([
                    'client_id' => $client->id,
                    'user_id' => $admin->id,
                    'number' => sprintf('%s-%03d', $this->workspaceCode($tenantName), $i + 1),
                    'status' => $spec['status'],
                    'currency' => 'RUB',
                    'issued_at' => $issuedAt,
                    'due_at' => $dueAt,
                    'subtotal' => $spec['total'],
                    'tax_rate' => 0,
                    'tax_amount' => 0,
                    'discount' => 0,
                    'total' => $spec['total'],
                    'paid_amount' => $spec['paid_amount'],
                    'payment_token' => $token,
                    'sent_at' => $spec['status'] !== 'draft' ? Carbon::parse($issuedAt) : null,
                    'paid_at' => $spec['status'] === 'paid' ? Carbon::parse($issuedAt)->addDays(3) : null,
                ]);

                InvoiceItem::create([
                    'invoice_id' => $invoice->id,
                    'description' => 'Услуги по проекту',
                    'quantity' => 1,
                    'unit_price' => $spec['total'],
                    'amount' => $spec['total'],
                    'sort_order' => 0,
                ]);

                if (in_array($spec['status'], ['sent', 'overdue', 'partially_paid', 'draft'], true)) {
                    $payTokens[$invoice->number] = $token;
                }
            }

            $this->command->info("Workspace '{$tenantName}' seeded. Payment tokens:");
            foreach ($payTokens as $num => $tok) {
                $this->command->line("  {$num}: /pay/invoice/{$tok}");
            }
        } finally {
            tenancy()->end();
        }
    }

    private function makeUser(string $email, string $name): User
    {
        return User::create([
            'name' => $name,
            'email' => $email,
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);
    }

    private function workspaceCode(string $name): string
    {
        if (str_starts_with($name, 'Студия')) {
            return 'INV-W2-2026';
        }

        return 'INV-2026';
    }
}
