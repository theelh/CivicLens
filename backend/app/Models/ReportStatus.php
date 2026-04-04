<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Report;

class ReportStatus extends Model
{
    protected $table = 'report_statuses';

    public const ASSIGNED = 'Assigned';
    public const AI_PROCESSING = 'Ai Processing';
    public const IN_PROGESS = 'In Progress';
    public const SUBMITTED = 'Submitted';
    public const CLOSED = 'Closed';
    public const RESOLVED = 'Resolved';

    protected $fillable = [
        'name',
        'label',
        'color',
    ];

    // ── Relationships ─────────────────────────────────────────────
    public function reports()
    {
        return $this->hasMany(Report::class, 'status_id', 'id');
    }
}
