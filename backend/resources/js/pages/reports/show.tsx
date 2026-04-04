import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import Swal from 'sweetalert2';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

// ── Types ─────────────────────────────────────────────────────────────────────
interface AiAnalysis {    
    id:number;
    predicted_category: string | null ;
    sentiment: string |null;
    severity_level: string | null;
    confidence_score: number | null;
}

interface Location {
    id: number;
    address: string;
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
  type:string;
  file_path: string;
}

interface Status {
    id:number;
    type:string | null;
    name:string;
    description : string |null;
}


interface Report {
    id: number;
    title: string | null;
    description: string;
    status: Status;
    media: Media[];
    ai_summary: string | null;
    ai_confidence: number | null;
    audio_path: string | null;
    created_at: string;
    updated_at: string;
    category: Category | null;
    location: Location | null;
    ai_analysis: AiAnalysis | null;
}
// ── Helpers ───────────────────────────────────────────────────────────────────
const STATUS_META: Record<string, { label: string; cls: string; dot: string }> = {
    'Submitted':  { label: 'Submitted',   cls: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',         dot: 'bg-gray-400'    },
    'AI Processing':   { label: 'AI Processing', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',   dot: 'bg-amber-500'   },
    'Assigned':   { label: 'Assigned', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',   dot: 'bg-amber-500'   },
    'In Progress':   { label: 'In Progress', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',   dot: 'bg-amber-500'   },
    'Resolved': { label: 'Resolved',  cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300', dot: 'bg-emerald-500' },
    'Closed':   { label: 'Closed',    cls: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',           dot: 'bg-red-500'     },
};

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
}

// ── Component ──────────────────────────────────────────────────────────────────
export default function Show() {
    const { report } = usePage().props as { report: Report};
    const [analyzing, setAnalyzing] = useState(false);

    const statusMeta = STATUS_META[report.status.name] ?? STATUS_META.Submitted;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard',    href: dashboard().url },
        { title: 'My Reports',   href: '/reports/all' },
        { title: report.title ?? `Report ${report.id}`, href: `/reports/${report.id}` },
    ];

    // ── Actions ──────────────────────────────────────────────────────────────

    const handleAnalyze = () => {
        setAnalyzing(true);
        router.post(`/reports/${report.id}/analy`, {}, {
            preserveScroll: true,
            onFinish: () => setAnalyzing(false),
        });
    };

    const handleMarkResolved = () => {
        Swal.fire({
            title: 'Mark as Resolved?',
            text: 'This will update the report status to resolved.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, mark resolved',
        }).then(result => {
            if (result.isConfirmed) {
                router.post(`/reports/${report.id}/resolve`, {}, { preserveScroll: true });
            }
        });
    };

    const handleDelete = () => {
        Swal.fire({
            title: 'Delete this report?',
            text: "This action can't be undone.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, delete it',
            cancelButtonText: 'Cancel',
        }).then(result => {
            if (result.isConfirmed) {
                router.delete(`/reports/${report.id}`, {
                    onSuccess: () => {
                        Swal.fire({
                            icon: 'success',
                            title: 'Deleted!',
                            text: 'Your report has been removed.',
                            timer: 1500,
                            showConfirmButton: false,
                        });
                    },
                });
            }
        });
    };

    const confidence_score = report.ai_analysis?.confidence_score !== null
        ? Math.round((report.ai_analysis?.confidence_score ?? 0) * 100)
        : null;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Report ${report.id} – CivicLens AI`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">

                {/* ── Top bar: title + actions ── */}
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-sm text-neutral-400">{report.id}</span>
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${statusMeta.cls}`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${statusMeta.dot}`} />
                                {statusMeta.label}
                            </span>
                            {report.category && (
                                <span className="rounded-full border border-neutral-200 bg-white px-2.5 py-0.5 text-xs font-medium text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                                    {report.category.icon} {report.category.name}
                                </span>
                            )}
                        </div>
                        <h1 className="mt-1.5 text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                            {report.title ?? `City Report ${report.id}`}
                        </h1>
                        <p className="mt-0.5 text-xs text-neutral-400">Submitted {formatDate(report.created_at)}</p>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Re-run AI */}
                        <button
                            onClick={handleAnalyze}
                            disabled={analyzing}
                            className="flex items-center gap-1.5 rounded-xl border border-purple-200 bg-purple-50 px-4 py-2 text-sm font-semibold text-purple-700 transition hover:bg-purple-100 disabled:opacity-50 dark:border-purple-800 dark:bg-purple-900/20 dark:text-purple-300"
                        >
                            {analyzing
                                ? <><span className="animate-spin">⚙️</span> Analyzing…</>
                                : <><span>🤖</span> Re-analyze</>}
                        </button>

                        {/* Mark resolved */}
                         
                        {statusMeta.label !== 'resolved' && (
                        <button
                            onClick={handleMarkResolved}
                            className="flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300"
                        >
                            ✅ Mark Resolved
                        </button>
                        )}

                        {/* Edit */}
                        <a
                            href={`/reports/${report.id}/edit`}
                            className="flex items-center gap-1.5 rounded-xl border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-100 dark:border-sky-800 dark:bg-sky-900/20 dark:text-sky-300"
                        >
                            ✏️ Edit
                        </a>

                        {/* Delete */}
                        <button
                            onClick={handleDelete}
                            className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400"
                        >
                            🗑️ Delete
                        </button>
                    </div>
                </div>

                {/* ── Main grid ── */}
                <div className="grid gap-6 lg:grid-cols-3">

                    {/* Left: image + description + audio — 2/3 */}
                    <div className="flex flex-col gap-5 lg:col-span-2">

                        {/* Photo */}
                        {report.media.length > 0 ? (
                            <div className="grid grid-cols-1 gap-4">
                                {report.media.map((media) => (
                                    <div key={media.id} className="overflow-hidden rounded-2xl border border-sidebar-border/70 bg-white shadow-sm dark:border-sidebar-border dark:bg-neutral-900">
                                        <img
                                            src={`/storage/${media.file_path}`}
                                            alt="Report photo"
                                            className="h-72 w-full object-cover"
                                        />
                                        <div className="flex items-center gap-2 px-4 py-2.5 text-xs text-neutral-400">
                                            <span>📷</span> Report photo
                                            <a
                                                href={`/storage/${media.file_path}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="ml-auto text-sky-500 hover:underline"
                                            >
                                                Open full size ↗
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 text-neutral-400 dark:border-neutral-700 dark:bg-neutral-800/50">
                                <div className="text-center">
                                    <span className="text-3xl">📷</span>
                                    <p className="mt-1 text-sm">No photo attached</p>
                                </div>
                            </div>
                        )}
                        {/* AI Analysis */}
                        <div className="rounded-2xl border border-sidebar-border/70 bg-white p-5 shadow-sm dark:border-sidebar-border dark:bg-neutral-900">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-400">🤖 AI Analysis</h2>
                                {confidence_score !== null && (
                                    <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-semibold text-sky-700 dark:bg-sky-900/30 dark:text-sky-300">
                                        {confidence_score}% confidence
                                    </span>
                                )}
                            </div>

                            {report.ai_analysis ? (
                                <div className="flex flex-col gap-4">
                                    {report.ai_analysis.severity_level && (
                                        <div>
                                            <p className="mb-1 text-xs font-semibold text-neutral-500">Severity Level</p>
                                            <p className="rounded-xl bg-neutral-50 px-4 py-3 text-sm text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                                                {report.ai_analysis.severity_level}
                                            </p>
                                        </div>
                                    )}
                                    {report.ai_analysis.sentiment && (
                                        <div>
                                            <p className="mb-1 text-xs font-semibold text-neutral-500">Report sentiment</p>
                                            <p className="rounded-xl bg-neutral-50 px-4 py-3 text-sm italic text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                                                "{report.ai_analysis.sentiment}"
                                            </p>
                                        </div>
                                    )}
                                    {report.ai_summary && (
                                        <div>
                                            <p className="mb-1 text-xs font-semibold text-neutral-500">AI Summary</p>
                                            <p className="rounded-xl border-l-4 border-[#2369A4] bg-sky-50 px-4 py-3 text-sm text-neutral-700 dark:bg-sky-900/20 dark:text-neutral-300">
                                                {report.ai_summary}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-2 py-6 text-center">
                                    <span className="text-3xl">🔍</span>
                                    <p className="text-sm text-neutral-500">No AI analysis yet.</p>
                                    <button
                                        onClick={handleAnalyze}
                                        disabled={analyzing}
                                        className="mt-1 rounded-xl bg-[#2369A4] px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:opacity-50"
                                    >
                                        {analyzing ? '⚙️ Running…' : '🤖 Run AI Analysis'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right sidebar — 1/3 */}
                    <div className="flex flex-col gap-5">

                        {/* Report details card */}
                        <div className="rounded-2xl border border-sidebar-border/70 bg-white p-5 shadow-sm dark:border-sidebar-border dark:bg-neutral-900">
                            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-400">Report Details</h2>
                            <dl className="flex flex-col gap-3">
                                <Detail label="Report"    value={`${report.id}`} mono />
                                <Detail label="Status"       value={statusMeta.label} />
                                <Detail label="Category"     value={report.category ? `${report.category.icon ?? ''} ${report.category.name}` : '—'} />
                                <Detail label="Submitted"    value={formatDate(report.created_at)} />
                                <Detail label="Last Updated" value={formatDate(report.updated_at)} />
                            </dl>
                        </div>

                        {/* Location card */}
                        <div className="rounded-2xl border border-sidebar-border/70 bg-white p-5 shadow-sm dark:border-sidebar-border dark:bg-neutral-900">
                            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-400">📍 Location</h2>
                            {report.location ? (
                                <>
                                    <p className="text-sm text-neutral-700 dark:text-neutral-300">{report.location.address}</p>
                                    {report.location?.latitude && report.location?.longitude && (
                                        <>
                                            <p className="mt-1 font-mono text-xs text-neutral-400">
                                                {/* {report.location?.latitude.toFixed(5)}, {report.location?.longitude.toFixed(5)} */}
                                            </p>
                                            <a
                                                href={`https://www.openstreetmap.org/?mlat=${report.location.latitude}&mlon=${report.location.longitude}&zoom=17`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="mt-3 flex items-center justify-center gap-1.5 rounded-xl border border-sky-200 bg-sky-50 py-2 text-xs font-semibold text-sky-600 transition hover:bg-sky-100 dark:border-sky-800 dark:bg-sky-900/20"
                                            >
                                                🗺️ View on Map ↗
                                            </a>
                                        </>
                                    )}
                                </>
                            ) : (
                                <p className="text-sm text-neutral-400">No location data.</p>
                            )}
                        </div>

                        {/* Quick actions card */}
                        <div className="rounded-2xl border border-sidebar-border/70 bg-white p-5 shadow-sm dark:border-sidebar-border dark:bg-neutral-900">
                            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-400">Quick Actions</h2>
                            <div className="flex flex-col gap-2">
                                <a
                                    href={`/reports/${report.id}/edit`}
                                    className="flex items-center gap-2 rounded-xl bg-neutral-50 px-4 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                                >
                                    ✏️ Edit Report
                                </a>
                                <button
                                    onClick={handleAnalyze}
                                    disabled={analyzing}
                                    className="flex items-center gap-2 rounded-xl bg-neutral-50 px-4 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 disabled:opacity-50 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                                >
                                    🤖 Re-run AI Analysis
                                </button>
                                {report.status !== 'resolved' && (
                                    <button
                                        onClick={handleMarkResolved}
                                        className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-300"
                                    >
                                        ✅ Mark as Resolved
                                    </button>
                                )}
                                <button
                                    onClick={handleDelete}
                                    className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400"
                                >
                                    🗑️ Delete Report
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

// ── Small helper component ────────────────────────────────────────────────────
function Detail({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
    return (
        <div className="flex items-start justify-between gap-3">
            <dt className="shrink-0 text-xs font-medium text-neutral-400">{label}</dt>
            <dd className={`text-right text-xs text-neutral-700 dark:text-neutral-300 ${mono ? 'font-mono' : ''}`}>
                {value}
            </dd>
        </div>
    );
}