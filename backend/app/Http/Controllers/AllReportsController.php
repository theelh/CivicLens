<?php

namespace App\Http\Controllers;

use App\Models\Report;
use App\Models\ReportStatus;
use App\Models\Category;
use App\Models\Media;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use App\Jobs\AnalyzeReportJob;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Models\Activity;

class AllReportsController extends Controller
{
    /**
     * Display a listing of the user's reports
     */
    public function index()
    {
        $reports = Report::with(['category', 'location','status'])
            ->where('user_id', Auth::id())
            ->latest()
            ->paginate(10);

        return Inertia::render('reports/index', [
            'reports' => $reports
        ]);
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

        return redirect()->route('reports.index')
            ->with('success', 'Report created successfully.');
    }

    /**
     * Show a specific report
     */
    public function show(int $id)
{
    $report = Report::with(['category', 'location', 'status', 'media', 'ai_analysis'])
        ->where('user_id', Auth::id())
        ->findOrFail($id);

    return Inertia::render('reports/show', [
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
                ->where('user_id', Auth::id())
                ->findOrFail($id);
            $report->update(['status_id' => 5]);
            Activity::create([
                'type' => 'resolved',
                'message' => "Report #{$report->id} has been resolved",
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
 
    return Inertia::render('reports/edit', [
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

 
    return redirect()->route('reports.show', $report->id)
        ->with('success', 'Report updated. AI re-analysis has been queued.');
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


        return redirect()->route('reports.index')
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
