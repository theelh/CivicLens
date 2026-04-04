<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Activity extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'message',
        'user_id',
        'report_id',
    ];

    // ── Relations ─────────────────────────────────────────

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function report()
    {
        return $this->belongsTo(Report::class);
    }

    // ── Helpers (optional but useful) ─────────────────────

    public function getTimeAttribute()
    {
        return $this->created_at->diffForHumans();
    }

    public function getDotColorAttribute()
    {
        return match ($this->type) {
            'submitted' => 'bg-neutral-400',
            'resolved'  => 'bg-emerald-500',
            'closed'  => 'bg-green-500',
            'urgent'    => 'bg-red-500',
            'ai'        => 'bg-sky-500',
            'user_role'        => 'bg-sky-200',
            'delet_user'        => 'bg-red-200',
            default     => 'bg-gray-400',
        };
    }
}