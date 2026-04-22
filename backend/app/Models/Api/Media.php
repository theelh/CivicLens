<?php

namespace App\Models\Api;

use Illuminate\Database\Eloquent\Model;
use App\Models\Api\Report;

class Media extends Model
{
    protected $fillable = [
        'report_id',
        'type',
        'file_path',
    ];

    public function report()
    {
        return $this->belongsTo(Report::class, 'report_id', 'id');
    }
}

