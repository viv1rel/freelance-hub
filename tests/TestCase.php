<?php

namespace Tests;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Support\Facades\Event;
use Stancl\Tenancy\Bootstrappers\DatabaseTenancyBootstrapper;
use Stancl\Tenancy\Events\TenantCreated;
use Stancl\Tenancy\Events\TenantDeleted;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        if ($this->app['config']->get('database.default') === 'sqlite') {
            // В тестах с SQLite все таблицы живут в одной in-memory БД.
            // Выкидываем DatabaseTenancyBootstrapper, чтобы tenancy()->initialize()
            // не переключал соединение на пустую SQLite-БД.
            $this->app['config']->set(
                'tenancy.bootstrappers',
                array_values(array_filter(
                    $this->app['config']->get('tenancy.bootstrappers', []),
                    fn ($b) => $b !== DatabaseTenancyBootstrapper::class
                ))
            );

            // И отключаем listener'ы, которые иначе делали бы
            // CREATE / DROP DATABASE для тестовых tenants.
            Event::forget(TenantCreated::class);
            Event::forget(TenantDeleted::class);
        }
    }

    protected function runTenantMigrations(): void
    {
        $this->artisan('migrate', [
            '--path' => 'database/migrations/tenant',
            '--realpath' => false,
        ]);
    }

    protected function makeUserInWorkspace(string $role = 'admin', ?Tenant $tenant = null): User
    {
        $tenant ??= Tenant::create([
            'id' => 'ws-'.uniqid(),
            'name' => 'Test WS',
        ]);

        $user = User::factory()->create();

        $user->workspaces()->attach($tenant->id, [
            'role' => $role,
            'joined_at' => now(),
        ]);
        $user->update(['current_tenant_id' => $tenant->id]);

        return $user->fresh();
    }
}
