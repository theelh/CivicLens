<?php

namespace App\Http\Controllers\Api;

use App\Models\Report;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;

class MapController extends Controller
{
    public function reports(): JsonResponse
    {
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
                'severity'      => $r->severity ?? 'medium',
                'status'        => $r->status?->name ?? 'Submitted',
                'category'      => $r->category?->name ?? 'Other',
                'category_icon' => $r->category?->icon ?? '📌',
                'latitude'      => (float) $r->location->latitude,
                'longitude'     => (float) $r->location->longitude,
                'address'       => implode(', ', array_filter([
                    $r->location?->address,
                    $r->location?->city,
                ])),
                'ai_summary'    => $r->ai_summary,
                'created_at'    => $r->created_at->toISOString(),
            ]);

        return response()->json(['reports' => $reports]);
    }
}