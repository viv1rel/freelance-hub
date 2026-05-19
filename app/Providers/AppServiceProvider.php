<?php

namespace App\Providers;

use App\Models\Client;
use App\Models\Invoice;
use App\Models\Project;
use App\Models\Task;
use App\Policies\ClientPolicy;
use App\Policies\InvoicePolicy;
use App\Policies\ProjectPolicy;
use App\Policies\TaskPolicy;
use Carbon\Carbon;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        $this->registerGates();
        $this->registerPolicies();
        Carbon::setLocale(config('app.locale'));
        setlocale(LC_TIME, 'ru_RU.UTF-8', 'ru_RU', 'ru');
    }

    private function registerPolicies(): void
    {
        Gate::policy(Project::class, ProjectPolicy::class);
        Gate::policy(Task::class, TaskPolicy::class);
        Gate::policy(Client::class, ClientPolicy::class);
        Gate::policy(Invoice::class, InvoicePolicy::class);
    }

    private function registerGates(): void
    {
        Gate::define('admin', fn ($user) => $user->isAdmin());
        Gate::define('freelancer', fn ($user) => $user->isFreelancer() || $user->isAdmin());
        Gate::define('client', fn ($user) => $user->isClient());
    }
}
