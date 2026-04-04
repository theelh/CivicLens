<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\DatabaseMessage;

class ReportAnalyzedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $report;

    /**
     * Create a new notification instance.
     */
    public function __construct($report)
    {
        $this->report = $report;
    }

    /**
     * Notification channels
     */
    public function via($notifiable): array
    {
        return ['database'];
    }

    /**
     * Data stored in database
     */
    public function toDatabase($notifiable): array
    {
        return [
            'report_id' => $this->report->id,
            'title'     => 'AI Analysis Completed',
            'message'   => 'Your report has been analyzed. Check the results.',
            'summary'   => $this->report->ai_summary,
            'confidence'=> $this->report->ai_confidence,
        ];
    }
}