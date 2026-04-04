import { Head,  usePage } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
];

const TYPE_STYLES: Record<string, string> = {
    submitted: 'bg-neutral-400',
    resolved: 'bg-emerald-500',
    urgent: 'bg-red-500',
    ai: 'bg-sky-500',
    deleted: 'bg-red-700',
};



const STATUS_META: Record<string, { label: string; cls: string }> = {
    'submitted':     { label: 'Submitted',     cls: 'bg-gray-100 text-gray-600' },
    'ai processing': { label: 'AI Processing', cls: 'bg-purple-100 text-purple-600' },
    'in progress':   { label: 'In Progress',   cls: 'bg-yellow-100 text-yellow-700' },
    'assigned':      { label: 'Assigned',      cls: 'bg-blue-100 text-blue-600' },
    'resolved':      { label: 'Resolved',      cls: 'bg-green-100 text-green-600' },
    'closed':        { label: 'Closed',        cls: 'bg-gray-200 text-gray-700' },
};


const CAT_ICON: Record<string, string> = {
    Infrastructure: '🏗️',
    Sanitation: '🗑️',
    Safety: '🔦',
    Transportation: '🚗',
    Noise: '🔊',
};

const PAGE_SIZE = 5;

export default function Dashboard() {
    const [activeFilter, setActiveFilter] = useState<string>('all');
    const [currentPage, setCurrentPage]   = useState(1);

    const { reports = [], stats = {}, insights = [], insighte = {} } = usePage().props as any;

    const { activities = [] } = usePage().props as any;

    const locationLabel = insighte?.top_location
    ? [
        insighte.top_location.city,
        insighte.top_location.address?.split(',')[1] ?? insighte.top_location.address
      ]
        .filter(Boolean)
        .join(' – ')
    : 'Unknown area';

    console.log(locationLabel);

    
    const filtered: any[] = activeFilter === 'all'
    ? reports
    : (reports as any[]).filter((r: any) => {
        const name = typeof r.status === 'string' ? r.status : r.status?.name ?? '';
        return name.toLowerCase() === activeFilter.toLowerCase();
      });

    
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const safePage   = Math.min(currentPage, totalPages);
    const paginated  = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

    const startItem = filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
    const endItem   = Math.min(safePage * PAGE_SIZE, filtered.length);

    const handleFilterChange = (f: string) => {
        setActiveFilter(f);
        setCurrentPage(1);
    };

    const goTo = (page: number) => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
    };

    const pageNumbers = (): (number | '…')[] => {
        if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
        const pages: (number | '…')[] = [1];
        if (safePage > 3) pages.push('…');
        for (let i = Math.max(2, safePage - 1); i <= Math.min(totalPages - 1, safePage + 1); i++) pages.push(i);
        if (safePage < totalPages - 2) pages.push('…');
        pages.push(totalPages);
        return pages;
    };

    const { auth } = usePage().props as any;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard – CivicLens AI" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4 md:p-6">

                {/* ── Welcome banner ── */}
                <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-[#2369A4] to-cyan-500 px-6 py-5 text-white shadow-lg">
                    <span className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
                    <span className="pointer-events-none absolute -bottom-8 right-24 h-24 w-24 rounded-full bg-white/10" />
                    <div className="relative">
                        <p className="text-sm font-medium opacity-80">Welcome back 👋</p>
                        <h1 className="mt-0.5 text-2xl font-bold tracking-tight">Your CivicLens Dashboard</h1>
                        <p className="mt-1 max-w-md text-sm opacity-75">
                            Track your city reports, monitor AI analysis results, and help improve your neighbourhood.
                        </p>
                        <a href='/reports/submit' className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2 text-sm font-semibold backdrop-blur-sm transition hover:bg-white/30">
                            <span>📸</span> Submit a New Report
                        </a>
                        <a href="/notifications" className="mt-4 mx-3 relative inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-[#171717] text-sm font-semibold backdrop-blur-sm transition hover:bg-white/30">
                            🔔 Notifications
                            {auth.notificationsCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 rounded-full">
                                    {auth.notificationsCount}
                                </span>
                            )}
                        </a>
                    </div>
                </div>

                {/* ── Stat cards ── */}
                <div className="grid gap-4 sm:grid-cols-3">
                    {[
                        { label: 'Reports Submitted', delta: insighte?.weekly_delta, value: stats?.total ?? 0,    icon: '📋', color: 'bg-[#2369A4]' },
                        { label: 'Under Review',       delta: insighte?.weekly_delta, value: stats?.review ?? 0,   icon: '🔍', color: 'bg-amber-500' },
                        { label: 'Resolved',           delta: insighte?.weekly_delta, value: stats?.resolved ?? 0, icon: '✅', color: 'bg-emerald-500' },
                    ].map(s => (
                        <div key={s.label} className="flex items-center gap-4 rounded-2xl border border-sidebar-border/70 bg-white p-5 shadow-sm dark:border-sidebar-border dark:bg-neutral-900">
                            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl ${s.color} bg-opacity-15`}>
                                {s.icon}
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{s.value}</p>
                                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{s.label}</p>
                                <p className="mt-0.5 text-xs text-[#2369A4] dark:text-sky-400">{s.delta}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Main grid ── */}
                <div className="grid gap-6 lg:grid-cols-3">

                    {/* Reports table — 2/3 */}
                    <div className="flex flex-col gap-3 rounded-2xl border border-sidebar-border/70 bg-white p-5 shadow-sm dark:border-sidebar-border dark:bg-neutral-900 lg:col-span-2">

                        {/* Header + filter pills */}
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">My Reports</h2>
                                <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-semibold text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                                    {filtered.length}
                                </span>
                            </div>
                            <div className="flex gap-1.5 text-xs font-medium">
                                {(['all', 'Submitted','AI Processing','In Progress','Assigned','Resolved','Closed'] as const).map(f => (
                                    <button
                                        key={f}
                                        onClick={() => handleFilterChange(f)}
                                        className={`rounded-full px-3 py-1 capitalize transition ${
                                            activeFilter === f
                                                ? 'bg-[#2369A4] text-white'
                                                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'
                                        }`}
                                    >
                                        {f}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto mt-5">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-neutral-100 text-left text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:border-neutral-800">
                                        <th className="pb-2 pr-4">Report</th>
                                        <th className="pb-2 pr-4">Issue</th>
                                        <th className="pb-2 pr-4 hidden md:table-cell">Location</th>
                                        <th className="pb-2 pr-4">Status</th>
                                        <th className="pb-2 hidden sm:table-cell">Date</th>
                                        {/* <th className="pb-2">Action</th> */}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                    {paginated.map((r: any) => {                                        
                                        // so read r.status?.name instead of r.status
                                        const statusName = typeof r.status === 'string' ? r.status : r.status?.name ?? 'Submitted';
                                        const statusMeta = STATUS_META[statusName] ?? { label: statusName, cls: 'bg-gray-100 text-gray-500' };
                                        return (
                                            <tr key={r.id} className="group transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                                                <td className="py-3 pr-4 font-mono text-xs text-neutral-400">{r.id}</td>
                                                <td className="py-3 pr-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-base leading-none">{CAT_ICON[r.category] ?? '📌'}</span>
                                                        <span className="font-medium text-neutral-800 dark:text-neutral-200">{r.title}</span>
                                                    </div>
                                                </td>
                                                <td className="py-3 pr-4 max-w-[16rem] text-neutral-500 hidden md:table-cell">{r.location}</td>
                                                <td className="py-3 pr-4">
                                                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusMeta.cls}`}>
                                                        {statusMeta.label}
                                                    </span>
                                                </td>
                                                <td className="py-3 text-xs text-neutral-400 hidden sm:table-cell">{r.date}</td>
                                                {/* <td className="py-3">
                                                    <button
                                                        onClick={() => {
                                                            setLoadingId(r.id);
                                                            router.post(`/reports/${r.id}/analyze`);
                                                        }}
                                                        disabled={loadingId === r.id}
                                                        className="rounded-lg bg-[#2369A4] px-3 py-1 text-xs font-semibold text-white transition hover:bg-sky-700 disabled:opacity-50"
                                                    >
                                                        {loadingId === r.id ? '⏳' : '🤖 Analyze'}
                                                    </button>
                                                </td> */}
                                            </tr>
                                        );
                                    })}

                                    {paginated.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="py-10 text-center text-sm text-neutral-400">
                                                No reports match this filter.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* ── Pagination bar ── */}
                        <div className="mt-1 flex items-center justify-between border-t border-neutral-100 pt-3 dark:border-neutral-800">

                            {/* Count label */}
                            <p className="text-xs text-neutral-400">
                                {filtered.length === 0 ? (
                                    'No results'
                                ) : (
                                    <>
                                        Showing{' '}
                                        <span className="font-semibold text-neutral-600 dark:text-neutral-300">{startItem}–{endItem}</span>
                                        {' '}of{' '}
                                        <span className="font-semibold text-neutral-600 dark:text-neutral-300">{filtered.length}</span>
                                    </>
                                )}
                            </p>

                            {/* Page controls — only show if more than 1 page */}
                            {totalPages > 1 && (
                                <div className="flex items-center gap-1">

                                    {/* ← Prev */}
                                    <button
                                        onClick={() => goTo(safePage - 1)}
                                        disabled={safePage === 1}
                                        aria-label="Previous page"
                                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 text-sm font-medium text-neutral-500 transition hover:border-[#2369A4] hover:text-[#2369A4] disabled:pointer-events-none disabled:opacity-30 dark:border-neutral-700 dark:text-neutral-400"
                                    >
                                        ‹
                                    </button>

                                    {/* Page numbers */}
                                    {pageNumbers().map((p, i) =>
                                        p === '…' ? (
                                            <span
                                                key={`ellipsis-${i}`}
                                                className="flex h-8 w-8 items-center justify-center text-xs text-neutral-400 select-none"
                                            >
                                                …
                                            </span>
                                        ) : (
                                            <button
                                                key={p}
                                                onClick={() => goTo(p as number)}
                                                aria-label={`Page ${p}`}
                                                aria-current={safePage === p ? 'page' : undefined}
                                                className={`flex h-8 w-8 items-center justify-center rounded-lg border text-xs font-semibold transition ${
                                                    safePage === p
                                                        ? 'border-[#2369A4] bg-[#2369A4] text-white shadow-sm'
                                                        : 'border-neutral-200 text-neutral-600 hover:border-[#2369A4] hover:text-[#2369A4] dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-sky-500 dark:hover:text-sky-400'
                                                }`}
                                            >
                                                {p}
                                            </button>
                                        )
                                    )}

                                    {/* → Next */}
                                    <button
                                        onClick={() => goTo(safePage + 1)}
                                        disabled={safePage === totalPages}
                                        aria-label="Next page"
                                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 text-sm font-medium text-neutral-500 transition hover:border-[#2369A4] hover:text-[#2369A4] disabled:pointer-events-none disabled:opacity-30 dark:border-neutral-700 dark:text-neutral-400"
                                    >
                                        ›
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Activity feed — 1/3 */}
                    <div className="flex flex-col gap-3  rounded-2xl border border-sidebar-border/70 bg-white p-5 shadow-sm dark:border-sidebar-border dark:bg-neutral-900">
                        <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">Recent Activity</h2>
                        <ul className="flex flex-col gap-4">
                            {activities.length > 0 ? (
                                activities.map((a: any, i: number) => {
                                    const dot = TYPE_STYLES[a.type] ?? 'bg-neutral-400';

                                    return (
                                        <li key={a.id} className="flex gap-3 text-sm">
                                            <div className="flex flex-col items-center gap-1">
                                                <span className={`mt-1 h-2.5 w-2.5 rounded-full ${dot}`} />
                                                {i < activities.length - 1 && (
                                                    <span className="w-px flex-1 bg-neutral-100 dark:bg-neutral-800" />
                                                )}
                                            </div>
                                            <div className="pb-2">
                                                <p className="text-neutral-700 dark:text-neutral-300">
                                                    {a.text}
                                                </p>
                                                <p className="mt-1 text-xs text-neutral-400">
                                                    {a.time}
                                                </p>
                                            </div>
                                        </li>
                                    );
                                })
                            ) : (
                                <p className="text-sm text-neutral-400">No activity yet</p>
                            )}
                        </ul>
                    </div>
                </div>

                {/* ── AI Insights banner ── */}
                <div className="rounded-2xl border border-sidebar-border/70 bg-white p-5 shadow-sm dark:border-sidebar-border dark:bg-neutral-900">
                    <div className="mb-3 flex items-center gap-2">
                        <span className="text-lg">🤖</span>
                        <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">AI Insights for Your Area</h2>
                        <span className="ml-auto rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-semibold text-sky-700 dark:bg-sky-900/40 dark:text-sky-300">
                            {insighte?.top_location ?? 'Unknown area'}
                        </span>
                    </div>
                    <div className="grid gap-3 ">
                        <div className="grid gap-3 sm:grid-cols-3">
                            {insights.map((ins: any, i: number) => (
                                <div
                                    key={i}
                                    className={`rounded-xl border-l-4 bg-neutral-50 px-4 py-3 dark:bg-neutral-800/50 ${ins.accent}`}
                                >
                                    <p className="text-sm leading-snug text-neutral-700 dark:text-neutral-300">
                                        <span className="mr-1.5">{ins.icon}</span>
                                        {ins.text}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </AppLayout>
    );
}