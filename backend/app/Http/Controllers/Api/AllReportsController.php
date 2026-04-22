<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Api\Report;
use App\Models\Api\ReportStatus;
use App\Models\Api\Category;
use App\Models\Api\Media;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use App\Jobs\AnalyzeReportJob;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Models\Api\Activity;
use App\Models\Api\Location;
use App\Models\Api\AiAnalysis;
use App\Models\Api\Notification;
use Illuminate\Http\JsonResponse;

class AllReportsController extends Controller
{
    /**
     * Display a listing of the user's reports
     */


    public function index()
    {
        // $reports = Report::with(['category', 'location','status'])
        //     ->where('user_id', Auth::id())
        //     ->latest()->get();
        //     // ->paginate(10)
        $reports = Report::with(['category', 'location','status', 'media'])->orderBy('created_at', 'desc')->get();

            Log::info($reports);
            
        return response()->json(['reports' => $reports]);
    }

    public function userReports()
    {
        $reports = Report::with(['category', 'location','status', 'media'])
            ->where('user_id', Auth::id())
            ->latest()->get();

        return response()->json(['reports' => $reports]);
    }

    /**
     * Show form for creating report
     */
    public function create()
    {
        return Inertia::render('submitreport', [
            'categories' => Category::select('id', 'name', 'icon')->get()
        ]);
    }

    /**
     * Store new report
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'        => 'nullable|string|max:255',
            'description'  => 'required|string|max:5000',
            'category_id'  => 'nullable|exists:categories,id',
            'location_id'  => 'required|exists:locations,id',
            'image'        => 'nullable|image|mimes:jpg,jpeg,png,webp|max:10240',
            'audio'        => 'nullable|file|mimes:webm,mp3,wav,ogg|max:20480',
        ]);

        $report = new Report();
        $report->fill($validated);
        $report->user_id = Auth::id();

        // Upload image
        if ($request->hasFile('image')) {
            $report->image_path = $request->file('image')->store('reports/images', 'public');
        }

        // Upload audio
        if ($request->hasFile('audio')) {
            $report->audio_path = $request->file('audio')->store('reports/audio', 'public');
        }

        $report->save();

        // Dispatch AI analyze job
        \App\Jobs\AnalyzeReportJob::dispatch($report->id);

        return response()->json([
            'message' => 'Report created successfully',
            'report' => $report
        ], 201);
    }

    /**
     * Show a specific report
     */
    public function show(int $id)
{
    $report = Report::with(['category', 'location', 'status', 'media', 'ai_analysis'])
        ->findOrFail($id);

    return response()->json([
        'report' => $report
    ]);
}
    public function showUser(int $id)
{
    $report = Report::with(['category', 'location', 'status', 'media', 'ai_analysis'])
        ->where('user_id', Auth::id())
        ->findOrFail($id);

    return response()->json([
        'report' => $report
    ]);
}

private function markAssigned(Report $report): void
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

                return response()->json([
                    'message' => 'AI analysis started'
                ]);

            } catch (\Throwable $th) {
                Log::error('Error dispatching AI analysis job: ' . $th->getMessage());
                return response()->json([
                    'message' => 'Failed to start AI analysis'
                ], 500);
            }
        }
        
        /**
         * Mark report as resolved — fixed to use route model binding
         */
        public function markResolved(int $id): RedirectResponse
        {
            $report = Report::with(['status'])
                ->where('user_id', Auth::id())
                ->findOrFail($id);
            $report->update(['status_id' => 5]);
            Activity::create([
                'type' => 'resolved',
                'message' => "Report #{$report->id} has been resolved",
                'report_id' => $report->id,
            ]);
        
            return response()->json([
                'message' => 'Report marked as resolved'
            ]);
        }

    /**
     * Show edit form
     */
    public function edit(int $id): JesonResponse
{
    $report = Report::with(['category', 'location', 'media'])
        ->where('user_id', Auth::id())
        ->findOrFail($id);
 
    return response()->json([
        'report'     => $report,
        'categories' => \App\Models\Api\Category::select('id', 'name', 'icon')->get(),
        'locations'  => \App\Models\Api\Location::select('id', 'address', 'city', 'country')->get(),
    ]);
}
 
/**
 * Update report — handles image + audio replacement, re-queues AI job
 */
public function update(Request $request, int $id): jsonResponse
{
    $report = Report::where('user_id', Auth::id())->findOrFail($id);
 
    // ✅ New validation — accepts address + coordinates
    $validated = $request->validate([
        'title'       => 'nullable|string|max:255',
        'description' => 'required|string|max:5000',
        'category_id' => 'nullable|exists:categories,id',
        'severity'    => 'nullable|in:low,medium,high',
        'address'     => 'nullable|string|max:500',
        'latitude'    => 'nullable|numeric|between:-90,90',
        'longitude'   => 'nullable|numeric|between:-180,180',
        'image'       => 'nullable|image|mimes:jpg,jpeg,png,webp|max:10240',
        'audio'       => 'nullable|file|mimes:webm,mp3,wav,ogg|max:20480',
    ]);

    // ✅ Find or create location from address/coordinates
if ($request->filled('address') || ($request->filled('latitude') && $request->filled('longitude'))) {
    
    // Try to find existing location for this report
    $location = $report->location;

    if ($location) {
        // Update existing
        $location->update([
            'address'   => $request->address   ?? $location->address,
            'latitude'  => $request->latitude  ?? $location->latitude,
            'longitude' => $request->longitude ?? $location->longitude,
        ]);
    } else {
        // Create new location and link it
        $location = \App\Models\Location::create([
            'address'   => $request->address,
            'latitude'  => $request->latitude,
            'longitude' => $request->longitude,
        ]);
        $report->update(['location_id' => $location->id]);
    }
}
 
    // Update scalar fields
    $report->update([
        'title'       => $validated['title']       ?? $report->title,
        'description' => $validated['description'],
        'category_id' => $validated['category_id'] ?? $report->category_id,        
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

 
    return response()->json([
        'message' => 'Report updated successfully',
        'report' => $report
    ]);
}

    /**
     * Delete report
     */
    public function destroy(int $id)
    {
        $report = Report::where('id', $id)
        ->where('user_id', Auth::id())  // ensure user owns the report
        ->firstOrFail();

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


        return response()->json([
            'message' => 'Report deleted successfully'
        ]);
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
