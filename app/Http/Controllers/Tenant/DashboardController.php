<?php

declare(strict_types=1);

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\Invoice;
use App\Models\Project;
use App\Models\Task;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $now = now();
        $monthStart = $now->copy()->startOfMonth();
        $quarterStart = $now->copy()->firstOfQuarter();

        $monthRevenue = (float) Invoice::where('status', 'paid')
            ->whereBetween('paid_at', [$monthStart, $now])
            ->sum('paid_amount');

        $quarterRevenue = (float) Invoice::where('status', 'paid')
            ->whereBetween('paid_at', [$quarterStart, $now])
            ->sum('paid_amount');

        $activeProjects = Project::where('status', 'active')->count();
        $openTasks = Task::whereNotIn('status', ['closed'])->count();

        $unpaid = Invoice::whereIn('status', ['sent', 'partially_paid', 'overdue']);
        $unpaidCount = (clone $unpaid)->count();
        $unpaidAmount = (float) (clone $unpaid)->sum(DB::raw('total - paid_amount'));

        $topClients = Invoice::selectRaw('client_id, SUM(paid_amount) as revenue')
            ->where('status', 'paid')
            ->groupBy('client_id')
            ->orderByDesc('revenue')
            ->limit(5)
            ->with('client:id,name')
            ->get()
            ->map(fn (Invoice $row): array => [
                'id' => $row->client_id,
                'name' => $row->client->name ?? '—',
                'revenue' => (float) $row->getAttribute('revenue'),
            ]);

        $monthsBack = 11;
        $revenueSeries = [];
        for ($i = $monthsBack; $i >= 0; $i--) {
            $start = $now->copy()->subMonths($i)->startOfMonth();
            $end = $start->copy()->endOfMonth();
            $sum = (float) Invoice::where('status', 'paid')
                ->whereBetween('paid_at', [$start, $end])
                ->sum('paid_amount');
            $revenueSeries[] = [
                'month' => $start->translatedFormat('LLL Y'),
                'revenue' => $sum,
            ];
        }

        return Inertia::render('Dashboard/Index', [
            'metrics' => [
                'monthRevenue' => $monthRevenue,
                'quarterRevenue' => $quarterRevenue,
                'activeProjects' => $activeProjects,
                'openTasks' => $openTasks,
                'unpaidCount' => $unpaidCount,
                'unpaidAmount' => $unpaidAmount,
                'totalClients' => Client::count(),
            ],
            'topClients' => $topClients,
            'revenueSeries' => $revenueSeries,
            'recentInvoices' => Invoice::with('client:id,name')->latest()->limit(5)->get(),
        ]);
    }
}
