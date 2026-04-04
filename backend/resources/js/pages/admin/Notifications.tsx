import { usePage, router, Head } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Notifications', href: '/admin/notifications' },
];

// ── Type ─────────────────────────────────────────────────────────────────────
interface Notification {
    id: number;
    title: string;
    message: string;
    is_read: boolean;
    type?: 'info' | 'success' | 'warning' | 'urgent';
    created_at?: string;
}

// ── Icon + colour per notification type ──────────────────────────────────────
const TYPE_META: Record<string, { icon: string; ring: string; badge: string }> = {
    info:    { icon: '📋', ring: 'ring-sky-200 dark:ring-sky-800',     badge: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300'         },
    success: { icon: '✅', ring: 'ring-emerald-200 dark:ring-emerald-800', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
    warning: { icon: '⚠️', ring: 'ring-amber-200 dark:ring-amber-800',  badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'   },
    urgent:  { icon: '🚨', ring: 'ring-red-200 dark:ring-red-800',      badge: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'           },
};

function getMeta(type?: string) {
    return TYPE_META[type ?? 'info'] ?? TYPE_META.info;
}

function timeAgo(dateStr?: string): string {
    if (!dateStr) return '';
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60)   return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

// ── Component ────────────────────────────────────────────────────────────────
export default function Notifications() {
    const { notifications: initial = [] } = usePage().props as any;

    // Local copy so we can optimistically update UI
    const [items, setItems] = useState<Notification[]>(initial);
    const [filter, setFilter]       = useState<'all' | 'unread' | 'read'>('all');
    const [selected, setSelected]   = useState<Set<number>>(new Set());
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const unreadCount = items.filter(n => !n.is_read).length;

    const filtered = filter === 'all'   ? items
                   : filter === 'unread' ? items.filter(n => !n.is_read)
                   :                       items.filter(n => n.is_read);

    // ── Actions ──────────────────────────────────────────────────────────────

    const markRead = (id: number) => {
        setItems(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        router.post(`/admin/notifications/${id}/read`, {}, { preserveScroll: true });
    };

    const markUnread = (id: number) => {
        setItems(prev => prev.map(n => n.id === id ? { ...n, is_read: false } : n));
        router.post(`/admin/notifications/${id}/unread`, {}, { preserveScroll: true });
    };

    const markAllRead = () => {
        setItems(prev => prev.map(n => ({ ...n, is_read: true })));
        router.post('/admin/notifications/read-all', {}, { preserveScroll: true });
    };

    const deleteOne = (id: number) => {
        setDeletingId(id);
        // animate out then remove
        setTimeout(() => {
            setItems(prev => prev.filter(n => n.id !== id));
            setSelected(prev => { const s = new Set(prev); s.delete(id); return s; });
            setDeletingId(null);
        }, 250);
        router.delete(`/admin/notifications/${id}`, { preserveScroll: true });
    };

    const deleteSelected = () => {
        const ids = Array.from(selected);
        setItems(prev => prev.filter(n => !ids.includes(n.id)));
        setSelected(new Set());
        ids.forEach(id => router.delete(`/admin/notifications/${id}`, { preserveScroll: true }));
    };

    const deleteAllRead = () => {
        setItems(prev => prev.filter(n => !n.is_read));
        router.delete('/admin/notifications/read', { preserveScroll: true });
    };

    const toggleSelect = (id: number) => {
        setSelected(prev => {
            const s = new Set(prev);
            s.has(id) ? s.delete(id) : s.add(id);
            return s;
        });
    };

    const toggleSelectAll = () => {
        if (selected.size === filtered.length) {
            setSelected(new Set());
        } else {
            setSelected(new Set(filtered.map(n => n.id)));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Notifications – CivicLens AI" />

            <div className="flex h-full flex-1 flex-col gap-5 p-4 md:p-6">

                {/* ── Page header ── */}
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                                Notifications
                            </h1>
                            {unreadCount > 0 && (
                                <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[#2369A4] px-1.5 text-xs font-bold text-white">
                                    {unreadCount}
                                </span>
                            )}
                        </div>
                        <p className="mt-0.5 text-sm text-neutral-500">
                            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up 🎉'}
                        </p>
                    </div>

                    {/* Bulk action toolbar */}
                    <div className="flex flex-wrap items-center gap-2">
                        {selected.size > 0 && (
                            <button
                                onClick={deleteSelected}
                                className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400"
                            >
                                🗑️ Delete selected ({selected.size})
                            </button>
                        )}
                        {items.some(n => n.is_read) && (
                            <button
                                onClick={deleteAllRead}
                                className="flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-600 transition hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                            >
                                🧹 Clear read
                            </button>
                        )}
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllRead}
                                className="flex items-center gap-1.5 rounded-xl bg-[#2369A4] px-3 py-2 text-xs font-semibold text-white transition hover:bg-sky-700"
                            >
                                ✓ Mark all read
                            </button>
                        )}
                    </div>
                </div>

                {/* ── Filter tabs ── */}
                <div className="flex gap-1 rounded-xl border border-neutral-200 bg-neutral-50 p-1 dark:border-neutral-700 dark:bg-neutral-800/50 w-fit">
                    {(['all', 'unread', 'read'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => { setFilter(f); setSelected(new Set()); }}
                            className={`rounded-lg px-4 py-1.5 text-sm font-medium capitalize transition ${
                                filter === f
                                    ? 'bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-neutral-100'
                                    : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
                            }`}
                        >
                            {f}
                            {f === 'unread' && unreadCount > 0 && (
                                <span className="ml-1.5 rounded-full bg-[#2369A4] px-1.5 py-0.5 text-xs text-white">
                                    {unreadCount}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* ── Notification list ── */}
                <div className="flex flex-col gap-2">

                    {/* Select-all row — only when list non-empty */}
                    {filtered.length > 0 && (
                        <div className="flex items-center gap-2 px-1 pb-1">
                            <input
                                type="checkbox"
                                checked={selected.size === filtered.length && filtered.length > 0}
                                onChange={toggleSelectAll}
                                className="h-4 w-4 rounded border-neutral-300 accent-[#2369A4]"
                            />
                            <span className="text-xs text-neutral-400">
                                {selected.size > 0 ? `${selected.size} selected` : 'Select all'}
                            </span>
                        </div>
                    )}

                    {filtered.map(n => {
                        const meta      = getMeta(n.type);
                        const isDeleting = deletingId === n.id;
                        const isSelected = selected.has(n.id);

                        return (
                            <div
                                key={n.id}
                                style={{ transition: 'opacity 0.2s, transform 0.2s' }}
                                className={`group flex items-start gap-3 rounded-2xl border p-4 transition-all ${
                                    isDeleting ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
                                } ${
                                    isSelected
                                        ? 'border-[#2369A4]/40 bg-sky-50 dark:bg-sky-900/10'
                                        : n.is_read
                                            ? 'border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900'
                                            : 'border-[#2369A4]/20 bg-sky-50/60 dark:border-sky-800/40 dark:bg-sky-900/10'
                                }`}
                            >
                                {/* Checkbox */}
                                <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => toggleSelect(n.id)}
                                    className="mt-1 h-4 w-4 shrink-0 rounded border-neutral-300 accent-[#2369A4]"
                                />

                                {/* Icon */}
                                <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-2 text-lg ${meta.ring} ${n.is_read ? 'opacity-50' : ''}`}>
                                    {meta.icon}
                                </div>

                                {/* Content */}
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
                                        <div className="flex items-center gap-2">
                                            {/* Unread dot */}
                                            {!n.is_read && (
                                                <span className="h-2 w-2 shrink-0 rounded-full bg-[#2369A4]" />
                                            )}
                                            <h3 className={`text-sm font-semibold ${n.is_read ? 'text-neutral-500 dark:text-neutral-400' : 'text-neutral-900 dark:text-neutral-100'}`}>
                                                {n.title}
                                            </h3>
                                            {n.type && (
                                                <span className={`hidden rounded-full px-2 py-0.5 text-xs font-medium sm:inline-block ${meta.badge}`}>
                                                    {n.type}
                                                </span>
                                            )}
                                        </div>
                                        <span className="shrink-0 text-xs text-neutral-400">{timeAgo(n.created_at)}</span>
                                    </div>

                                    <p className={`mt-0.5 text-sm leading-relaxed ${n.is_read ? 'text-neutral-400 dark:text-neutral-500' : 'text-neutral-600 dark:text-neutral-300'}`}>
                                        {n.message}
                                    </p>

                                    {/* Per-item actions — visible on hover or always on mobile */}
                                    <div className="mt-2 flex items-center gap-3 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                                        {n.is_read ? (
                                            <button
                                                onClick={() => markUnread(n.id)}
                                                className="flex items-center gap-1 text-xs font-medium text-neutral-400 transition hover:text-[#2369A4]"
                                            >
                                                ↩ Mark unread
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => markRead(n.id)}
                                                className="flex items-center gap-1 text-xs font-medium text-[#2369A4] transition hover:text-sky-700"
                                            >
                                                ✓ Mark read
                                            </button>
                                        )}
                                        <span className="text-neutral-200 dark:text-neutral-700">|</span>
                                        <button
                                            onClick={() => deleteOne(n.id)}
                                            className="flex items-center gap-1 text-xs font-medium text-neutral-400 transition hover:text-red-500"
                                        >
                                            🗑️ Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* Empty state */}
                    {filtered.length === 0 && (
                        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-neutral-200 py-16 dark:border-neutral-700">
                            <span className="text-4xl">
                                {filter === 'unread' ? '🎉' : filter === 'read' ? '📭' : '🔔'}
                            </span>
                            <p className="text-sm font-medium text-neutral-500">
                                {filter === 'unread' ? 'No unread notifications' : filter === 'read' ? 'No read notifications' : 'No notifications yet'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}