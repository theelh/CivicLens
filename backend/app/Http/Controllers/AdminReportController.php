<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Report;
use App\Models\User;
use App\Models\ReportStatus;
use Inertia\Inertia;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use App\Jobs\AnalyzeReportJob;
use App\Services\ReportService;
use App\Models\Activity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class AdminReportController extends Controller
{
    public function index(): \Inertia\Response
    {

        // ── KPI stats ─────────────────────────────────────────────────────────
        $total = Report::count();
        $resolved = Report::whereHas('status', fn($q) => $q->where('name', 'Resolved'))->count();

        $pending = Report::whereHas('status', fn($q) => $q->where('name', 'Submitted'))->count();

        $inProgress = Report::whereHas('status', fn($q) => $q->where('name', 'In Progress'))->count();

        $aiAnalyzed = Report::whereNotNull('ai_summary')->count();

        $avgConfidence = Report::whereNotNull('ai_confidence')->avg('ai_confidence') ?? 0;

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
        $months = collect(range(5, 0))->map(function ($i) {
            $date  = now()->subMonths($i);

            return [
                'month' => $date->format('M'),

                'submitted' => Report::whereYear('created_at', $date->year)
                    ->whereMonth('created_at', $date->month)
                    ->count(),

                'resolved' => Report::whereYear('updated_at', $date->year)
                    ->whereMonth('updated_at', $date->month)
                    ->whereHas('status', function ($q) {
                        $q->where('name', 'Resolved');
                    })
                    ->count(),

                'closed' => Report::whereYear('created_at', $date->year)
                    ->whereMonth('created_at', $date->month)
                    ->whereHas('status', function ($q) {
                        $q->where('name', 'Closed');
                    })
                    ->count(),
            ];
        })->values();

        // ── By category ───────────────────────────────────────────────────────
        $byCategory = Report::query()->join('categories', 'reports.category_id', '=', 'categories.id')
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
        $bySeverity = Report::whereNotNull('severity')
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

        $byStatus = Report::query()->join('report_statuses', 'reports.status_id', '=', 'report_statuses.id')
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

        return Inertia::render('admin/analytics', [
            'stats'      => $stats,
            'byCategory' => $byCategory,
            'bySeverity' => $bySeverity,
            'byStatus'   => $byStatus,
            'monthly'    => $months,
            'recent'     => $recent,
        ]);
    }

    // ── GET /reports/submit ───────────────────────────────────────────────────
    public function create()
    {
        return Inertia::render('admin/submitreport');
    }

    // ── POST /reports ─────────────────────────────────────────────────────────
    protected $reportService;

    public function __construct(ReportService $reportService)
    {
        $this->reportService = $reportService;
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'        => 'nullable|string|max:255',
            'description'  => 'required|string|max:5000',
            'category_id'  => 'nullable|exists:categories,id',
            'latitude'     => 'required|numeric',
            'longitude'    => 'required|numeric',
            'address'      => 'nullable|string|max:500',
            'image'        => 'nullable|image|mimes:jpg,jpeg,png,webp|max:10240',
            'audio'        => 'nullable|file|mimes:webm,mp3,wav,ogg|max:20480',
        ]);

        $report = $this->reportService->createReport(
            $validated,
            $request->file('image'),
            $request->file('audio')
        );

        AnalyzeReportJob::dispatch($report->id);
        Activity::create([
            'type' => 'submitted',
            'message' => "New report submitted: {$report->title}",
            'user_id' => Auth::id(),
            'report_id' => $report->id,
        ]);

        if ($report->severity === 'high') {
            Activity::create([
                'type' => 'urgent',
                'message' => "Report #{$report->id} flagged as urgent",
                'report_id' => $report->id,
                'user_id' => auth()->id(), // optional, if someone is responsible
            ]);
        }



        return redirect()->route('admin.dashboard')
            ->with('success', 'Report submitted successfully.');
    }


    // ── POST /reports/analyze-image ───────────────────────────────────────────
    public function analyzeImage(Request $request): JsonResponse
{
    $request->validate([
        'image' => 'required|image|mimes:jpg,jpeg,png,webp|max:10240',
    ]);

    $binary   = file_get_contents($request->file('image')->getRealPath());
    $mimeType = $request->file('image')->getMimeType();

    $caption = $this->hfCaption($binary, $mimeType);

    [$category, $confidence] = $this->hfZeroShot(
        $caption,
        ['infrastructure', 'sanitation', 'safety', 'transportation', 'noise', 'other']
    );

    [$severityRaw] = $this->hfZeroShot(
        $caption,
        ['high risk', 'medium issue', 'low issue']
    );

    $severity = match ($severityRaw) {
        'high risk'    => 'high',
        'low issue'    => 'low',
        default        => 'medium',        
    };

    
    if ($severity === 'high') {
        Activity::create([
            'type' => 'urgent',
            'message' => "Report #{$report->id} flagged as urgent",
            'report_id' => $report->id,
        ]);
    }

    return response()->json([
        'summary'    => $caption,
        'category'   => $category,
        'severity'   => $severity,
        'confidence' => round($confidence, 2),
    ]);
}

private function mapCategoryToId(string $category): ?int
{
    return \App\Models\Category::whereRaw('LOWER(name) = ?', [strtolower($category)])
        ->value('id');
}


    // ── POST /reports/transcribe ──────────────────────────────────────────────
    public function transcribe(Request $request): JsonResponse
    {
        $request->validate(['audio' => 'required|file|mimes:webm,mp3,wav,ogg|max:20480']);

        $text = $this->hfWhisper(file_get_contents($request->file('audio')->getRealPath()));

        return response()->json(['text' => $text ?? '']);
    }

    // ── GET /geocode ──────────────────────────────────────────────────────────
    public function geocode(Request $request): JsonResponse
    {
        $lat = $request->query('lat');
        $lng = $request->query('lng');

        try {
            $res = Http::withHeaders(['User-Agent' => 'CivicLensAI/1.0'])
                ->get('https://nominatim.openstreetmap.org/reverse', [
                    'lat' => $lat, 'lon' => $lng, 'format' => 'json',
                ])->json();

            return response()->json(['address' => $res['display_name'] ?? "{$lat}, {$lng}"]);
        } catch (\Exception $e) {
            return response()->json(['address' => "{$lat}, {$lng}"]);
        }
    }

    // ── HuggingFace helpers ───────────────────────────────────────────────────

    private function hfCaption(string $binary, string $mimeType): string
    {
        try {
            $res = Http::withHeaders([
                'Authorization' => 'Bearer ' . config('services.huggingface.token'),
                'Content-Type'  => $mimeType,
            ])->withBody($binary, $mimeType)->timeout(30)
              ->post('https://router.huggingface.co/models/Salesforce/blip-image-captioning-large');

            return $res->json()[0]['generated_text'] ?? 'A city infrastructure issue.';
        } catch (\Exception $e) {
            Log::warning('HF caption: ' . $e->getMessage());
            return 'A city infrastructure issue.';
        }
    }

    private function hfZeroShot(string $text, array $labels): array
    {
        try {
            $res = Http::withHeaders([
                'Authorization' => 'Bearer ' . config('services.huggingface.token'),
            ])->timeout(30)
              ->post('https://router.huggingface.co/models/facebook/bart-large-mnli', [
                  'inputs'     => $text,
                  'parameters' => ['candidate_labels' => $labels],
              ]);

            $data = $res->json();
            return [$data['labels'][0] ?? $labels[0], $data['scores'][0] ?? 0.5];
        } catch (\Exception $e) {
            Log::warning('HF zero-shot: ' . $e->getMessage());
            return [$labels[0], 0.5];
        }
    }

    private function hfWhisper(string $binary): ?string
    {
        try {
            $res = Http::withHeaders([
                'Authorization' => 'Bearer ' . config('services.huggingface.token'),
                'Content-Type'  => 'audio/webm',
            ])->withBody($binary, 'audio/webm')->timeout(60)
              ->post('https://router.huggingface.co/models/openai/whisper-large-v3');

            return $res->json()['text'] ?? null;
        } catch (\Exception $e) {
            Log::warning('HF Whisper: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Display a listing of the user's reports
     */
    public function indexAll()
    {
        $reports = Report::with(['category', 'location','status'])
            ->latest()
            ->paginate();

        return Inertia::render('admin/index', [
            'reports' => $reports
        ]);
    }


    /**
     * Show a specific report
     */
    public function show(int $id)
{
    $report = Report::with(['category', 'location', 'status', 'media', 'ai_analysis'])
        ->findOrFail($id);

    return Inertia::render('admin/show', [
        'report' => $report
    ]);
}private function markAssigned(Report $report): void
{
    $assignedStatus = ReportStatus::where('name', ReportStatus::ASSIGNED)->firstOrFail();

    $report->update([
        'status_id' => $assignedStatus->id
    ]);
}

    public function analyze(Report $report): RedirectResponse
        {
            // $this->authorizeReport($report);
        
            try {
                AnalyzeReportJob::dispatch($report->id);

                $this->markAssigned($report);

                return back()->with('success', 'AI analysis started.'); 

            } catch (\Throwable $th) {
                Log::error('Error dispatching AI analysis job: ' . $th->getMessage());
                return back()->with('error', 'Failed to start AI analysis. Please try again later.');
            }
        }
        
        /**
         * Mark report as resolved — fixed to use route model binding
         */
        public function markResolved(int $id): RedirectResponse
        {
            $report = Report::with(['status'])
                ->findOrFail($id);
            $report->update(['status_id' => 5]);
            Activity::create([
                'type' => 'resolved',
                'message' => "Report #{$report->id} has been resolved",
                'report_id' => $report->id,
            ]);
        
            return back()->with('success', 'Report marked as resolved.');
        }
        public function markClosed(int $id): RedirectResponse
        {
            $report = Report::with(['status'])
                ->findOrFail($id);
            $report->update(['status_id' => 6]);
            Activity::create([
                'type' => 'closed',
                'message' => "Report #{$report->id} has been closed",
                'report_id' => $report->id,
            ]);
        
            return back()->with('success', 'Report marked as resolved.');
        }

    /**
     * Show edit form
     */
    public function edit(int $id): \Inertia\Response
{
    $report = Report::with(['category', 'location', 'media'])
        ->where('user_id', Auth::id())
        ->findOrFail($id);
 
    return Inertia::render('admin/edit', [
        'report'     => $report,
        'categories' => \App\Models\Category::select('id', 'name', 'icon')->get(),
        'locations'  => \App\Models\Location::select('id', 'address', 'city', 'country')->get(),
    ]);
}
 
/**
 * Update report — handles image + audio replacement, re-queues AI job
 */
public function update(Request $request, int $id): RedirectResponse
{
    $report = Report::where('user_id', Auth::id())->findOrFail($id);
 
    $validated = $request->validate([
        'title'        => 'nullable|string|max:255',
        'description'  => 'required|string|max:5000',
        'category_id'  => 'nullable|exists:categories,id',
        'location_id'  => 'required|exists:locations,id',
        'severity'     => 'nullable|in:low,medium,high',
        'image'        => 'nullable|image|mimes:jpg,jpeg,png,webp|max:10240',
        'audio'        => 'nullable|file|mimes:webm,mp3,wav,ogg|max:20480',
    ]);
 
    // Update scalar fields
    $report->update([
        'title'       => $validated['title']       ?? $report->title,
        'description' => $validated['description'],
        'category_id' => $validated['category_id'] ?? $report->category_id,
        'location_id' => $validated['location_id'],
        'severity'    => $validated['severity']    ?? $report->severity,
        // Reset AI fields so the new job result is clearly fresh
        'ai_summary'    => null,
        'ai_confidence' => null,
        'status_id'     => 1, // back to "Submitted"
    ]);
 
    // Replace image media
    if ($request->hasFile('image')) {
        // Delete old media record + file
        $oldImage = $report->media()->where('type', 'image')->first();
        if ($oldImage) {
            Storage::disk('public')->delete($oldImage->file_path);
            $oldImage->delete();
        }
 
        $path = $request->file('image')->store('reports/images', 'public');
        $report->media()->create(['type' => 'image', 'file_path' => $path]);
    }
 
    // Replace audio media
    if ($request->hasFile('audio')) {
        $oldAudio = $report->media()->where('type', 'audio')->first();
        if ($oldAudio) {
            Storage::disk('public')->delete($oldAudio->file_path);
            $oldAudio->delete();
        }
 
        $path = $request->file('audio')->storeAs('reports/audio', 'recording_' . time() . '.webm', 'public');
        $report->media()->create(['type' => 'audio', 'file_path' => $path]);
    }
 
    // Re-queue AI analysis with updated content
    AnalyzeReportJob::dispatch($report->id);
    if ($report->severity === 'high') {
    Activity::create([
        'type' => 'urgent',
        'message' => "Report #{$report->id} flagged as urgent",
        'report_id' => $report->id,
        'user_id' => auth()->id(), // optional, if someone is responsible
    ]);
}

 
    return redirect()->route('admin.reports.show', $report->id)
        ->with('success', 'Report updated. AI re-analysis has been queued.');
}

    /**
     * Delete report
     */
    public function destroy(int $id)
    {
        $report = Report::where('id', $id)->firstOrFail();

        if ($report->image_path) {
            Storage::disk('public')->delete($report->image_path);
        }

        if ($report->audio_path) {
            Storage::disk('public')->delete($report->audio_path);
        }

        Activity::create([
            'type' => 'deleted',
            'message' => "Report #{$report->id} titled '{$report->title}' was deleted",
            'report_id' => $report->id,
            'user_id' => auth()->id(), // who deleted it
        ]);
        $report->delete();


        return redirect()->route('admin.reports.index')
            ->with('success', 'Report deleted successfully.');
    }


    /**
     * Private helper to secure user reports
     */
    private function authorizeReport(Report $report)
    {
        if ($report->user_id !== Auth::id()) {
            abort(403, 'Unauthorized');
        }
    }
}

