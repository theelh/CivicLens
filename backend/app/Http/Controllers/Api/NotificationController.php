<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Api\Notification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Http\JsonResponse;

class NotificationController extends Controller
{
    // ── GET /notifications ───────────────────────────────────────────────────
    // Render the Inertia notifications page
    public function index()
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

        return response()->json( [
            'notifications' => $notifications,
        ]);
    }

    // ── POST /notifications/{id}/read ────────────────────────────────────────
    public function markRead(int $id): JsonResponse
    {
        Notification::where('id', $id)
            ->where('user_id', Auth::id())
            ->update(['is_read' => true]);

        return response()->json([
            'message' => 'Notification marked as read'
        ]);
    }

    // ── POST /notifications/{id}/unread ──────────────────────────────────────
    public function markUnread(int $id): RedirectResponse
    {
        Notification::where('id', $id)
            ->where('user_id', Auth::id())
            ->update(['is_read' => false]);

        return response()->json([
            'message' => 'Notification marked as unread'
        ]);
    }

    // ── POST /notifications/read-all ─────────────────────────────────────────
    public function markAllRead(): RedirectResponse
    {
        Notification::where('user_id', Auth::id())
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json([
            'message' => 'All notifications marked as read'
        ]);
    }

    // ── DELETE /notifications/{id} ───────────────────────────────────────────
    public function destroy(int $id): RedirectResponse
    {
        Notification::where('id', $id)
            ->where('user_id', Auth::id())
            ->delete();

        return response()->json([
            'message' => 'Notification deleted successfully'
        ]);
    }

    // ── DELETE /notifications/read ───────────────────────────────────────────
    // Deletes all read notifications for the current user
    public function destroyRead(): RedirectResponse
    {
        Notification::where('user_id', Auth::id())
            ->where('is_read', true)
            ->delete();

        return response()->json([
            'message' => 'All read notifications deleted successfully'
        ]);
    }
}