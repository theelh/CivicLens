<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Report;

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

