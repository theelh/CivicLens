<?php

namespace App\Models\Api;

use Illuminate\Database\Eloquent\Model;
use App\Models\Api\Report;

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

