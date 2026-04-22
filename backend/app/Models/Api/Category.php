<?php

namespace App\Models\Api;

use Illuminate\Database\Eloquent\Model;
use App\Models\Api\Report;

class Category extends Model
{
    protected $fillable = ['name', 'description', 'icon'];

    public function reports()
    {
        return $this->hasMany(Report::class);
    }
}
