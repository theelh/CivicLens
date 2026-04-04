<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Activity;
use Inertia\Inertia;
use App\Models\Notification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Response;

class AdminActivityController extends Controller
{
    public function index(): \Inertia\Response
    {
        $notifications = Notification::orderByRaw('is_read ASC')   // unread first
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn ($n) => [
                'id'         => $n->id,
                'title'      => $n->title,
                'message'    => $n->message,
                'type'       => $n->type,       // info | success | warning | urgent
                'is_read'    => (bool) $n->is_read,
                'created_at' => $n->created_at?->toISOString(),
            ]);

        return Inertia::render('admin/Notifications', [
            'notifications' => $notifications,
        ]);
    }

    // ── POST /notifications/{id}/read ────────────────────────────────────────
    public function markRead(int $id): RedirectResponse
    {
        Notification::where('id', $id)
            ->update(['is_read' => true]);

        return back();
    }

    // ── POST /notifications/{id}/unread ──────────────────────────────────────
    public function markUnread(int $id): RedirectResponse
    {
        Notification::where('id', $id)
            ->update(['is_read' => false]);

        return back();
    }

    // ── POST /notifications/read-all ─────────────────────────────────────────
    public function markAllRead(): RedirectResponse
    {
        Notification::where('is_read', false)
            ->update(['is_read' => true]);

        return back();
    }

    // ── DELETE /notifications/{id} ───────────────────────────────────────────
    public function destroy(int $id): RedirectResponse
    {
        Notification::where('id', $id)
            ->delete();

        return back();
    }

    // ── DELETE /notifications/read ───────────────────────────────────────────
    // Deletes all read notifications for the current user
    public function destroyRead(): RedirectResponse
    {
        Notification::where('is_read', true)
            ->delete();

        return back();
    }
}

