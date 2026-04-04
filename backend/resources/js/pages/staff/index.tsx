import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import Swal from 'sweetalert2';
import AppLayout from '@/layouts/app-layout';

// ── Types ─────────────────────────────────────────────────────────────────────
interface AiAnalysis {
    image_caption: string | null;
    transcription: string | null;
    summary: string | null;
    confidence: number | null;
}

interface Location {
    id: number;
    address: string;
    city: string | null;
    country: string | null;
    latitude: number | null;
    longitude: number | null;
}

interface Category {
    id: number;
    name: string;
    icon: string | null;
}

interface Media {
    id: number;
    type: string;
    file_path: string;
}

interface Status {
    id: number;
    type: string | null;
    name: string;
    description: string | null;
}

interface Report {
    id: number;
    title: string | null;
    description: string;
    status: Status;
    media: Media[];
    audio_path: string | null;
    created_at: string;
    updated_at: string;
    category: Category | null;
    location: Location | null;
    // ✅ correct field name matching your interface
    ai_analysis: AiAnalysis | null;
}

// ── Status style map — keys must match your DB status names exactly ───────────
const STATUS_STYLE: Record<string, string> = {
    'Submitted':     'bg-gray-100 text-gray-600',
    'AI Processing': 'bg-purple-100 text-purple-600',
    'Assigned':      'bg-blue-100 text-blue-600',
    'In Progress':   'bg-yellow-100 text-yellow-700',
    'Resolved':      'bg-green-100 text-green-600',
    'Closed':        'bg-gray-200 text-gray-700',
};

// ── Filter tabs — must match your DB status names (case-insensitive compare below) ──
const STATUS_FILTERS = ['all', 'Submitted','Assigned', 'AI Processing', 'In Progress', 'Resolved', 'Closed'];

export default function ReportsPage() {
    const { reports } = usePage().props as { reports: { data: Report[] } };

    const [search, setSearch]     = useState('');
    const [status, setStatus]     = useState<string>('all');
    const [loadingId, setLoadingId] = useState<number | null>(null);

    // ── Filter logic ──────────────────────────────────────────────────────────
    const filtered = (reports?.data ?? []).filter((r: Report) => {
        const q = search.toLowerCase();
        const matchSearch =
            !q ||
            r.title?.toLowerCase().includes(q) ||
            r.location?.city?.toLowerCase().includes(q) ||
            r.location?.address?.toLowerCase().includes(q);

        // Case-insensitive status match
        const matchStatus =
            status === 'all' ||
            (r.status?.name ?? '').toLowerCase() === status.toLowerCase();

        return matchSearch && matchStatus;
    });

    return (
        <AppLayout>
            <Head title="My Reports" />

            <div className="p-6 space-y-6">

                {/* ── Header ── */}
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-bold">📋 My Reports</h1>
                    <a
                        href="/staff/reports/submit"
                        className="bg-[#2369A4] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-sky-700 transition"
                    >
                        + New Report
                    </a>
                </div>

                {/* ── Filters ── */}
                <div className="flex flex-wrap gap-3 items-center">
                    <input
                        type="text"
                        placeholder="Search by title or location…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="border rounded-lg px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-[#2369A4]/30"
                    />
                    <div className="flex flex-wrap gap-1.5">
                        {STATUS_FILTERS.map((s) => (
                            <button
                                key={s}
                                onClick={() => setStatus(s)}
                                className={`px-3 py-1 rounded-full text-xs font-medium transition capitalize ${
                                    status === s
                                        ? 'bg-[#2369A4] text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Table ── */}
                <div className="bg-white rounded-xl shadow overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left border-b bg-neutral-50 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                                <th className="p-3">Reports</th>
                                <th className="p-3">Title</th>
                                <th className="p-3 hidden md:table-cell">Location</th>
                                <th className="p-3">Status</th>
                                <th className="p-3">AI</th>
                                <th className="p-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((r: Report) => {
                                // ✅ AI check — uses ai_analysis not ai_summary
                                const isAnalyzed = r.ai_analysis !== null &&
                                    (r.ai_analysis !== null ||
                                     r.ai_analysis.image_caption !== null);

                                const locationStr = [r.location?.city, r.location?.address, r.location?.country]
                                    .filter(Boolean)
                                    .join(' – ') || 'Unknown area';

                                return (
                                    <tr key={r.id} className="border-b hover:bg-gray-50 transition-colors">

                                        {/* ID */}
                                        <td className="p-3 font-mono text-xs text-neutral-400">
                                            {r.id}
                                        </td>

                                        {/* Title */}
                                        <td className="p-3 font-medium text-neutral-800 max-w-[180px] truncate">
                                            {r.title ?? <span className="italic text-neutral-400">Untitled</span>}
                                        </td>

                                        {/* Location */}
                                        <td className="p-3 text-gray-500 hidden md:table-cell max-w-[200px] truncate">
                                            {locationStr.length > 50 ? locationStr.slice(0, 50) + '…' : locationStr}
                                        </td>

                                        {/* Status — ✅ reads r.status.name, styled from STATUS_STYLE map */}
                                        <td className="p-3">
                                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_STYLE[r.status?.name] ?? 'bg-gray-100 text-gray-500'}`}>
                                                {r.status?.name ?? 'Unknown'}
                                            </span>
                                        </td>

                                        {/* AI — ✅ checks ai_analysis not ai_summary */}
                                        <td className="p-3 text-xs">
                                            {isAnalyzed ? (
                                                <span className="flex items-center gap-1 text-emerald-600 font-medium">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
                                                    Analyzed
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-gray-400">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-gray-300 inline-block" />
                                                    Pending
                                                </span>
                                            )}
                                        </td>

                                        {/* Actions */}
                                        <td className="p-3">
                                            <div className="flex gap-2">

                                                {/* View */}
                                                <a
                                                    href={`/staff/reports/show/${r.id}`}
                                                    className="px-3 py-1 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-medium transition"
                                                >
                                                    View
                                                </a>

                                                {/* Analyze */}
                                                <button
                                                    onClick={() => {
                                                        setLoadingId(r.id);
                                                        router.post(`/staff/reports/${r.id}/analyze`, {}, {
                                                            preserveScroll: true,
                                                            onFinish: () => setLoadingId(null),
                                                        });
                                                    }}
                                                    disabled={loadingId === r.id}
                                                    className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                                                        loadingId === r.id
                                                            ? 'bg-purple-200 text-purple-400 cursor-not-allowed'
                                                            : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
                                                    }`}
                                                >
                                                    {loadingId === r.id ? 'Analyzing…' : 'Analyze'}
                                                </button>

                                                {/* Delete */}
                                                <button
                                                    onClick={() => {
                                                        Swal.fire({
                                                            title: 'Delete this report?',
                                                            text: "This action can't be undone!",
                                                            icon: 'warning',
                                                            showCancelButton: true,
                                                            confirmButtonColor: '#ef4444',
                                                            cancelButtonColor: '#6b7280',
                                                            confirmButtonText: 'Yes, delete it!',
                                                            cancelButtonText: 'Cancel',
                                                        }).then((result) => {
                                                            if (result.isConfirmed) {
                                                                router.delete(`/staff/reports/${r.id}`, {
                                                                    preserveScroll: true,
                                                                    onSuccess: () => Swal.fire({
                                                                        icon: 'success',
                                                                        title: 'Deleted!',
                                                                        text: 'Report has been deleted.',
                                                                        timer: 1500,
                                                                        showConfirmButton: false,
                                                                    }),
                                                                    onError: () => Swal.fire({
                                                                        icon: 'error',
                                                                        title: 'Error',
                                                                        text: 'Something went wrong. Please try again.',
                                                                        timer: 2000,
                                                                        showConfirmButton: false,
                                                                    }),
                                                                });
                                                            }
                                                        });
                                                    }}
                                                    className="px-3 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-xs font-medium transition"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}

                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center p-10 text-gray-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <span className="text-3xl">📭</span>
                                            <p className="text-sm">No reports found</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}