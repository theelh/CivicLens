<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Report;

class Location extends Model
{
    protected $fillable = [
        'latitude',
        'longitude',
        'address',
        'city',
        'country',
    ];

    public function reports()
    {
        return $this->hasMany(Report::class);
    }
}

