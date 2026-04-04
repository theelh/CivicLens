<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class NotificationController extends Controller
{
    // ── GET /notifications ───────────────────────────────────────────────────
    // Render the Inertia notifications page
    public function index(): \Inertia\Response
    {
        $notifications = Notification::where('user_id', Auth::id())
            ->orderByRaw('is_read ASC')   // unread first
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

        return Inertia::render('Notifications', [
            'notifications' => $notifications,
        ]);
    }

    // ── POST /notifications/{id}/read ────────────────────────────────────────
    public function markRead(int $id): RedirectResponse
    {
        Notification::where('id', $id)
            ->where('user_id', Auth::id())
            ->update(['is_read' => true]);

        return back();
    }

    // ── POST /notifications/{id}/unread ──────────────────────────────────────
    public function markUnread(int $id): RedirectResponse
    {
        Notification::where('id', $id)
            ->where('user_id', Auth::id())
            ->update(['is_read' => false]);

        return back();
    }

    // ── POST /notifications/read-all ─────────────────────────────────────────
    public function markAllRead(): RedirectResponse
    {
        Notification::where('user_id', Auth::id())
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return back();
    }

    // ── DELETE /notifications/{id} ───────────────────────────────────────────
    public function destroy(int $id): RedirectResponse
    {
        Notification::where('id', $id)
            ->where('user_id', Auth::id())
            ->delete();

        return back();
    }

    // ── DELETE /notifications/read ───────────────────────────────────────────
    // Deletes all read notifications for the current user
    public function destroyRead(): RedirectResponse
    {
        Notification::where('user_id', Auth::id())
            ->where('is_read', true)
            ->delete();

        return back();
    }
}