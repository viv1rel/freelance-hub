<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Invoice;
use App\Models\Task;
use App\Models\Tenant;
use App\Models\User;
use App\Notifications\DeadlineReminder;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;

class SendDeadlineReminders extends Command
{
    protected $signature = 'app:send-deadline-reminders {--days=2 : Notify when deadline is within N days}';

    protected $description = 'Send reminders for upcoming task deadlines and invoice due dates across all workspaces';

    public function handle(): int
    {
        $days = (int) $this->option('days');
        $windowStart = Carbon::today();
        $windowEnd = Carbon::today()->addDays($days)->endOfDay();

        $sent = 0;

        /** @var Tenant $tenant */
        foreach (Tenant::all() as $tenant) {
            tenancy()->initialize($tenant);

            $admins = User::query()
                ->whereExists(function ($q) use ($tenant) {
                    $q->select(DB::raw(1))
                        ->from('workspace_members')
                        ->whereColumn('workspace_members.user_id', 'users.id')
                        ->where('workspace_members.tenant_id', $tenant->id)
                        ->whereIn('workspace_members.role', ['admin', 'freelancer']);
                })
                ->get();

            if ($admins->isEmpty()) {
                tenancy()->end();

                continue;
            }

            $tasks = Task::whereNotNull('deadline')
                ->whereBetween('deadline', [$windowStart->toDateString(), $windowEnd->toDateString()])
                ->whereNotIn('status', ['done', 'cancelled'])
                ->get();

            foreach ($tasks as $task) {
                $recipients = $task->assignee_id
                    ? $admins->where('id', $task->assignee_id)->all()
                    : $admins->all();

                Notification::send($recipients, new DeadlineReminder(
                    type: 'task',
                    title: $task->title,
                    deadline: Carbon::parse($task->deadline)->format('d.m.Y'),
                    url: null,
                ));
                $sent++;
            }

            $invoices = Invoice::whereIn('status', ['sent', 'overdue', 'partial'])
                ->whereBetween('due_at', [$windowStart, $windowEnd])
                ->get();

            foreach ($invoices as $invoice) {
                Notification::send($admins->all(), new DeadlineReminder(
                    type: 'invoice',
                    title: '№ '.$invoice->number,
                    deadline: $invoice->due_at->format('d.m.Y'),
                    url: null,
                ));
                $sent++;
            }

            tenancy()->end();
        }

        $this->info("Отправлено напоминаний: {$sent}");

        return self::SUCCESS;
    }
}
