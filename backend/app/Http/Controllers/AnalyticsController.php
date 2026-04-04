<?php

namespace App\Http\Controllers;

use App\Models\Report;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AnalyticsController extends Controller
{
    public function index(): \Inertia\Response
    {
        $userId = Auth::id();

        // ── KPI stats ─────────────────────────────────────────────────────────
        $total      = Report::where('user_id', $userId)->count();
        $resolved   = Report::where('user_id', $userId)
                            ->whereHas('status', fn($q) => $q->where('name', 'Resolved'))
                            ->count();
        $pending    = Report::where('user_id', $userId)
                            ->whereHas('status', fn($q) => $q->where('name', 'Submitted'))
                            ->count();
        $inProgress = Report::where('user_id', $userId)
                            ->whereHas('status', fn($q) => $q->where('name', 'In Progress'))
                            ->count();
        $aiAnalyzed = Report::where('user_id', $userId)
                            ->whereNotNull('ai_summary')
                            ->count();
        $avgConfidence = Report::where('user_id', $userId)
                               ->whereNotNull('ai_confidence')
                               ->avg('ai_confidence') ?? 0;

        $stats = [
            'total'           => $total,
            'resolved'        => $resolved,
            'pending'         => $pending,
            'in_progress'     => $inProgress,
            'resolution_rate' => $total > 0 ? round(($resolved / $total) * 100) : 0,
            'avg_confidence'  => round($avgConfidence * 100),
            'ai_analyzed'     => $total > 0 ? round(($aiAnalyzed / $total) * 100) : 0,
        ];

        // ── Monthly submissions vs resolutions (last 6 months) ────────────────
        $months = collect(range(5, 0))->map(function ($i) use ($userId) {
            $date  = now()->subMonths($i);
            $month = $date->format('M');
            $year  = $date->year;
            $m     = $date->month;

            $submitted = Report::where('user_id', $userId)
                ->whereYear('created_at', $year)
                ->whereMonth('created_at', $m)
                ->count();

            $resolved = Report::where('user_id', $userId)
                ->whereYear('updated_at', $year)
                ->whereMonth('updated_at', $m)
                ->whereHas('status', fn($q) => $q->where('name', 'Resolved'))
                ->count();

            return ['month' => $month, 'submitted' => $submitted, 'resolved' => $resolved];
        })->values();

        // ── By category ───────────────────────────────────────────────────────
        $byCategory = Report::where('reports.user_id', $userId)
            ->join('categories', 'reports.category_id', '=', 'categories.id')
            ->select('categories.name', 'categories.icon', DB::raw('count(*) as count'))
            ->groupBy('categories.id', 'categories.name', 'categories.icon')
            ->orderByDesc('count')
            ->get()
            ->map(fn($r) => [
                'name'  => $r->name,
                'icon'  => $r->icon ?? '📌',
                'count' => (int) $r->count,
            ]);

        // ── By severity ───────────────────────────────────────────────────────
        $severityMap = ['high' => '#ef4444', 'medium' => '#f59e0b', 'low' => '#10b981'];
        $bySeverity = Report::where('user_id', $userId)
            ->whereNotNull('severity')
            ->select('severity', DB::raw('count(*) as count'))
            ->groupBy('severity')
            ->get()
            ->map(fn($r) => [
                'name'  => ucfirst($r->severity),
                'value' => $total > 0 ? round(($r->count / $total) * 100) : 0,
                'color' => $severityMap[$r->severity] ?? '#94a3b8',
            ]);

        // ── By status ─────────────────────────────────────────────────────────
        $statusColors = [
            'Submitted'     => '#94a3b8',
            'AI Processing' => '#a78bfa',
            'Assigned'      => '#60a5fa',
            'In Progress'   => '#fbbf24',
            'Resolved'      => '#34d399',
            'Closed'        => '#6b7280',
        ];

        $byStatus = Report::where('reports.user_id', $userId)
            ->join('report_statuses', 'reports.status_id', '=', 'report_statuses.id')
            ->select('report_statuses.name', DB::raw('count(*) as count'))
            ->groupBy('report_statuses.id', 'report_statuses.name')
            ->get()
            ->map(fn($r) => [
                'name'  => $r->name,
                'value' => (int) $r->count,
                'fill'  => $statusColors[$r->name] ?? '#94a3b8',
            ]);

        // ── Recent reports ────────────────────────────────────────────────────
        $recent = Report::with('status')
            ->where('user_id', $userId)
            ->latest()
            ->take(5)
            ->get()
            ->map(fn($r) => [
                'id'       => $r->id,
                'title'    => $r->title ?? "Report #{$r->id}",
                'status'   => $r->status?->name ?? 'Submitted',
                'severity' => $r->severity ?? 'medium',
                'date'     => $r->created_at->diffForHumans(),
            ]);

        return Inertia::render('reports/analytics', [
            'stats'      => $stats,
            'byCategory' => $byCategory,
            'bySeverity' => $bySeverity,
            'byStatus'   => $byStatus,
            'monthly'    => $months,
            'recent'     => $recent,
        ]);
    }
}