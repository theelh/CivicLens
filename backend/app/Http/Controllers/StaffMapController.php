<?php

namespace App\Http\Controllers;

use App\Models\Report;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class StaffMapController extends Controller
{
    public function index(): \Inertia\Response
    {
        // Fetch all user reports that have coordinates via their location
        $reports = Report::with(['category', 'location', 'status'])
            ->whereHas('location', fn($q) =>
                $q->whereNotNull('latitude')->whereNotNull('longitude')
            )
            ->latest()
            ->get()
            ->map(fn($r) => [
                'id'            => $r->id,
                'title'         => $r->title ?? "Report #{$r->id}",
                'description'   => $r->description,
                'status'        => $r->status?->name ?? 'Submitted',
                'severity'      => $r->severity ?? 'medium',
                'category'      => $r->category?->name ?? 'Other',
                'category_icon' => $r->category?->icon ?? '📌',
                'latitude'      => (float) $r->location->latitude,
                'longitude'     => (float) $r->location->longitude,
                'address'       => implode(', ', array_filter([
                    $r->location?->address,
                    $r->location?->city,
                ])),
                'ai_summary'    => $r->ai_summary,
                'created_at'    => $r->created_at->format('Y-m-d'),
            ]);
 
        return Inertia::render('staff/mapView', [
            'reports' => $reports,
        ]);
    }
}
