<?php

namespace App\Models\Api;
 
use Illuminate\Database\Eloquent\Model;
use App\Models\Api\Report;
 
class AiAnalysis extends Model
{
     protected $fillable = ['report_id','predicted_category','severity_level','confidence_score','sentiment'];
    public function report()
    {
        return $this->belongsTo(Report::class, 'report_id', 'id');
    }
}
