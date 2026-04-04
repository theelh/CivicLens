<?php

namespace App\Http\Controllers;

use App\Jobs\AnalyzeReportJob;
use App\Models\Report;
use App\Models\ReportAudio;
use App\Models\ReportImage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use App\Models\Activity;
use App\Services\ReportService;

class ReportController extends Controller
{
    // ── GET /reports/submit ───────────────────────────────────────────────────
    public function create()
    {
        return Inertia::render('SubmitReport');
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



        return redirect()->route('dashboard')
            ->with('success', 'Report submitted successfully.');
    }

    public function analyze(Report $report)
        {
            // Dispatch AI job
            AnalyzeReportJob::dispatch($report->id);

            return back()->with('success', 'AI analysis started.');
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

}