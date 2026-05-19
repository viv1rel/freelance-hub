<?php

declare(strict_types=1);

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Requests\ClientRequest;
use App\Models\Client;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ClientController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Client::class);

        $query = Client::query()
            ->withCount(['projects', 'invoices'])
            ->latest();

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('company', 'like', "%{$search}%");
            });
        }

        return Inertia::render('Clients/Index', [
            'clients' => $query->paginate(15)->withQueryString(),
            'filters' => $request->only(['search']),
        ]);
    }

    public function create(Request $request): Response
    {
        $this->authorize('create', Client::class);

        return Inertia::render('Clients/Create', [
            'availableUsers' => $this->availableClientUsers($request->user()->currentTenantId()),
        ]);
    }

    public function store(ClientRequest $request): RedirectResponse
    {
        $this->authorize('create', Client::class);

        Client::create($request->validated());

        return redirect()->route('clients.index')->with('success', 'Клиент создан.');
    }

    public function show(Client $client): Response
    {
        $this->authorize('view', $client);

        $client->load(['projects', 'invoices' => fn ($q) => $q->latest()->limit(10)]);

        return Inertia::render('Clients/Show', [
            'client' => $client,
        ]);
    }

    public function edit(Request $request, Client $client): Response
    {
        $this->authorize('update', $client);

        return Inertia::render('Clients/Edit', [
            'client' => $client,
            'availableUsers' => $this->availableClientUsers($request->user()->currentTenantId(), $client->user_id),
        ]);
    }

    /**
     * Client-role users in this workspace that aren't yet linked to another Client.
     *
     * @return array<int, array{id:int,name:string,email:string}>
     */
    private function availableClientUsers(?string $tenantId, ?int $includeUserId = null): array
    {
        $linkedUserIds = Client::query()
            ->whereNotNull('user_id')
            ->when($includeUserId, fn ($q) => $q->where('user_id', '!=', $includeUserId))
            ->pluck('user_id')
            ->all();

        return User::query()
            ->whereExists(function ($q) use ($tenantId) {
                $q->select(DB::raw(1))
                    ->from('workspace_members')
                    ->whereColumn('workspace_members.user_id', 'users.id')
                    ->where('workspace_members.tenant_id', $tenantId)
                    ->where('workspace_members.role', 'client');
            })
            ->whereNotIn('id', $linkedUserIds)
            ->orderBy('name')
            ->get(['id', 'name', 'email'])
            ->toArray();
    }

    public function update(ClientRequest $request, Client $client): RedirectResponse
    {
        $this->authorize('update', $client);

        $client->update($request->validated());

        return redirect()->route('clients.show', $client)->with('success', 'Клиент обновлён.');
    }

    public function destroy(Client $client): RedirectResponse
    {
        $this->authorize('delete', $client);

        $client->delete();

        return redirect()->route('clients.index')->with('success', 'Клиент удалён.');
    }
}
