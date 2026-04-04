<?php

namespace App\Services;

use App\Models\Report;
use App\Models\Location;
use App\Models\Media;
use Illuminate\Support\Facades\Auth;

class ReportService
{
    public function createReport(array $data, $image = null, $audio = null): Report
    {
        // 1. Create location
        $location = Location::create([
            'latitude'  => $data['latitude'],
            'longitude' => $data['longitude'],
            'address'   => $data['address'] ?? null,
        ]);

        // 2. Create report
        $report = Report::create([
            'user_id'     => Auth::id(),
            'title'       => $data['title'] ?? null,
            'description' => $data['description'],
            'category_id' => $data['category_id'] ?? null,
            'location_id' => $location->id,
            'status_id'   => 1,
        ]);

        // 3. Handle media
        if ($image) {
            $path = $image->store("reports/{$report->id}/images", 'public');

            Media::create([
                'report_id' => $report->id,
                'type'      => 'image',
                'file_path' => $path,
            ]);
        }

        if ($audio) {
            $path = $audio->store("reports/{$report->id}/audio", 'public');

            Media::create([
                'report_id' => $report->id,
                'type'      => 'audio',
                'file_path' => $path,
            ]);
        }

        return $report;
    }
}
