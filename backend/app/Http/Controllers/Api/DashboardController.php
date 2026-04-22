<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Api\Report;
use App\Models\Api\AiAnalysis;
use App\Models\Api\Category;
use App\Models\Api\Location;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use App\Models\Api\Activity;

class DashboardController extends Controller
{

public function index()
{
    $reports = Report::where('user_id', Auth::id())->with(['category', 'location', 'status'])
        ->latest()
        ->take(10)
        ->get()
        ->map(function ($r) {
            return [
                'id'       => $r->id,
                'title'    => $r->title ?? 'No title',
                'category' => $r->category?->name ?? 'other',
                'location' => $r->location?->address ?? 'Unknown',
                'status' => strtolower($r->status?->name ?? 'Submitted'),
                'date'     => $r->created_at->diffForHumans(),
            ];
        });

        //Location :

        $top = DB::table('reports')
        ->select('location_id', DB::raw('COUNT(*) as total'))
        ->whereNotNull('location_id')
        ->groupBy('location_id')
        ->orderByDesc('total')
        ->first();


            $location = $top
    ? DB::table('locations')->find($top->location_id)
    : null;


        $formattedLocation = 'Unknown area';

if ($location) {
    $parts = $location->address ? explode(',', $location->address) : [];
    $district = $parts[1] ?? $parts[0] ?? null;

    $formattedLocation = collect([
        $location->city,
        $district
    ])->filter()->implode(' – ');
}





    // ── AI INSIGHTS ───────────────────────────────

    $topCategory = AiAnalysis::select('predicted_category')
        ->selectRaw('COUNT(*) as count')
        ->groupBy('predicted_category')
        ->orderByDesc('count')
        ->first();

    // 1. Most frequent category
    $topCategoryName = $topCategory
        ? Category::find($topCategory->predicted_category)?->name
        : null;

    // 2. Reports this month
    $monthlyReports = Report::whereMonth('created_at', Carbon::now()->month)->count();

    // 3. Average confidence
    $avgConfidence = AiAnalysis::avg('confidence_score');

    $insights = [
        [
            'icon' => '📈',
            'text' => $monthlyReports
                ? "Reports increased this month ({$monthlyReports} total)."
                : "No reports this month yet.",
            'accent' => 'border-red-200',
        ],
        [
            'icon' => '🧠',
            "text" => $topCategoryName
                ? "Most reported issue: {$topCategoryName}."
                : "No AI category data yet.",
            'accent' => 'border-amber-200',
        ],
        [
            'icon' => '🤖',
            'text' => $avgConfidence
                ? "AI confidence avg: " . round($avgConfidence * 100) . "%."
                : "No AI confidence data yet.",
            'accent' => 'border-emerald-200',
        ],
    ];


    $now = Carbon::now();

$thisWeekCount = Report::whereBetween('created_at', [
    $now->startOfWeek(),
    $now->endOfWeek()
])->count();

$lastWeekCount = Report::whereBetween('created_at', [
    $now->copy()->subWeek()->startOfWeek(),
    $now->copy()->subWeek()->endOfWeek()
])->count();

$delta = $thisWeekCount - $lastWeekCount;

$deltaText = ($delta >= 0 ? '+' : '') . $delta . ' this week';

$activities = Activity::latest()
    ->take(10)
    ->get()
    ->map(function ($a) {
        return [
            'id' => $a->id,
            'text' => $a->message,
            'time' => $a->created_at->diffForHumans(),
            'type' => $a->type,
        ];
    });


    // Stats
    return response()->json(['reports' => $reports, 'location' => $formattedLocation]);
}

}
