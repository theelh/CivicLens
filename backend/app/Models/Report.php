<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\Category;
use App\Models\Department;
use App\Models\Location;
use App\Models\ReportStatus;
use App\Models\Media;
use App\Models\AiAnalysis;
use App\Models\Activity;
 

class Report extends Model
{
    protected $fillable = [
        'user_id',
        'category_id',
        'department_id',
        'location_id',
        'status_id',
        'title',
        'description',
        'severity',
        'ai_summary',
        'ai_confidence',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function location()
    {
        return $this->belongsTo(Location::class);
    }

    public function status()
    {
        return $this->belongsTo(ReportStatus::class);
    }

    public function media()
    {
        return $this->hasMany(Media::class, 'report_id', 'id');
    }

    public function ai_analysis()
    {
        return $this->hasOne(AiAnalysis::class, 'report_id', 'id');
    }

    public function activities()
{
    return $this->hasMany(Activity::class);
}

}
