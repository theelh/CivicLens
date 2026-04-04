import { Head, usePage } from '@inertiajs/react';
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    RadialBarChart, RadialBar,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

// ── Types ─────────────────────────────────────────────────────────────────────
interface MonthlyData   { month: string; submitted: number; resolved: number; }
interface CategoryData  { name: string; count: number; icon: string; }
interface SeverityData  { name: string; value: number; color: string; }
interface StatusData    { name: string; value: number; fill: string; }
interface RecentReport  { id: number; title: string; status: string; severity: string; date: string; }

interface AnalyticsProps {
    stats: {
        total: number;
        resolved: number;
        pending: number;
        in_progress: number;
        resolution_rate: number;
        avg_confidence: number;
        ai_analyzed: number;
    };
    monthly:   MonthlyData[];
    byCategory: CategoryData[];
    bySeverity: SeverityData[];
    byStatus:   StatusData[];
    recent:     RecentReport[];
}

// ── Colour palette ────────────────────────────────────────────────────────────
const BRAND   = '#2369A4';
const BRAND2   = '#6b7280';
const COLORS  = {
    submitted:   '#94a3b8',
    ai:          '#a78bfa',
    assigned:    '#60a5fa',
    inProgress:  '#fbbf24',
    resolved:    '#34d399',
    closed:      '#6b7280',
};

const SEVERITY_COLORS: Record<string, string> = {
    high:   '#ef4444',
    medium: '#f59e0b',
    low:    '#10b981',
};

const STATUS_META: Record<string, { dot: string; cls: string }> = {
    Submitted:    { dot: 'bg-slate-400',  cls: 'bg-slate-100 text-slate-600' },
    'AI Processing': { dot: 'bg-violet-500', cls: 'bg-violet-100 text-violet-700' },
    Assigned:     { dot: 'bg-blue-500',   cls: 'bg-blue-100 text-blue-700' },
    'In Progress':{ dot: 'bg-amber-500',  cls: 'bg-amber-100 text-amber-700' },
    Resolved:     { dot: 'bg-emerald-500',cls: 'bg-emerald-100 text-emerald-700' },
    Closed:       { dot: 'bg-gray-400',   cls: 'bg-gray-100 text-gray-600' },
};

// ── Custom tooltip ────────────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-xl border border-neutral-200 bg-white px-3 py-2 shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
            {label && <p className="mb-1 text-xs font-semibold text-neutral-500">{label}</p>}
            {payload.map((p: any, i: number) => (
                <p key={i} className="text-sm font-medium" style={{ color: p.color }}>
                    {p.name}: <span className="font-bold">{p.value}</span>
                </p>
            ))}
        </div>
    );
};

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon, accent }: {
    label: string; value: string | number; sub?: string; icon: string; accent: string;
}) {
    return (
        <div className="relative overflow-hidden rounded-2xl border border-sidebar-border/70 bg-white p-5 shadow-sm dark:border-sidebar-border dark:bg-neutral-900">
            <div className={`absolute -right-4 -top-4 h-20 w-20 rounded-full opacity-10 ${accent}`} />
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">{label}</p>
                    <p className="mt-1 text-3xl font-bold text-neutral-900 dark:text-neutral-100">{value}</p>
                    {sub && <p className="mt-0.5 text-xs text-neutral-400">{sub}</p>}
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-xl ${accent} bg-opacity-15`}>
                    {icon}
                </div>
            </div>
        </div>
    );
}

// ── Section wrapper ───────────────────────────────────────────────────────────
function Card({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) {
    return (
        <div className={`rounded-2xl border border-sidebar-border/70 bg-white p-5 shadow-sm dark:border-sidebar-border dark:bg-neutral-900 ${className}`}>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-400">{title}</h3>
            {children}
        </div>
    );
}

// ── Mock data fallback (when no backend data yet) ─────────────────────────────
const MOCK_MONTHLY: MonthlyData[] = [
    { month: 'Oct', submitted: 8,  resolved: 4  },
    { month: 'Nov', submitted: 14, resolved: 9  },
    { month: 'Dec', submitted: 11, resolved: 8  },
    { month: 'Jan', submitted: 18, resolved: 13 },
    { month: 'Feb', submitted: 22, resolved: 16 },
    { month: 'Mar', submitted: 17, resolved: 14 },
];

const MOCK_CATEGORY: CategoryData[] = [
    { name: 'Infrastructure', count: 34, icon: '🏗️' },
    { name: 'Sanitation',     count: 22, icon: '🗑️' },
    { name: 'Safety',         count: 18, icon: '🔦' },
    { name: 'Transportation', count: 12, icon: '🚗' },
    { name: 'Noise',          count: 8,  icon: '🔊' },
    { name: 'Other',          count: 6,  icon: '📌' },
];

const MOCK_SEVERITY: SeverityData[] = [
    { name: 'High',   value: 23, color: '#ef4444' },
    { name: 'Medium', value: 51, color: '#f59e0b' },
    { name: 'Low',    value: 26, color: '#10b981' },
];

const MOCK_STATUS: StatusData[] = [
    { name: 'Submitted',    value: 14, fill: COLORS.submitted   },
    { name: 'AI Processing',value: 6,  fill: COLORS.ai          },
    { name: 'In Progress',  value: 19, fill: COLORS.inProgress  },
    { name: 'Resolved',     value: 42, fill: COLORS.resolved    },
    { name: 'Closed',       value: 9,  fill: COLORS.closed      },
];

const MOCK_RECENT: RecentReport[] = [
    { id: 41, title: 'Pothole on Rue Souissi',       status: 'In Progress',  severity: 'high',   date: 'Today'   },
    { id: 40, title: 'Graffiti on Ave Hassan II',    status: 'Resolved',     severity: 'low',    date: 'Yesterday'},
    { id: 38, title: 'Broken Streetlight',           status: 'Resolved',     severity: 'medium', date: 'Mar 21'  },
    { id: 37, title: 'Illegal Dumping',              status: 'AI Processing',severity: 'high',   date: 'Mar 20'  },
    { id: 35, title: 'Road Crack Blvd Mohammed V',   status: 'Assigned',     severity: 'medium', date: 'Mar 18'  },
];

// ── Main component ────────────────────────────────────────────────────────────
export default function Analytics() {
    const props = usePage().props as any;

    // Use real data if available, fallback to mock
    const stats      = props.stats      ?? { total: 90, resolved: 42, pending: 14, in_progress: 19, resolution_rate: 67, avg_confidence: 81, ai_analyzed: 78 };
    const monthly    = props.monthly    ?? MOCK_MONTHLY;
    const byCategory = props.byCategory ?? MOCK_CATEGORY;
    const bySeverity = props.bySeverity ?? MOCK_SEVERITY;
    const byStatus   = props.byStatus   ?? MOCK_STATUS;
    const recent     = props.recent     ?? MOCK_RECENT;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/staff/dashboard' },
        { title: 'Analytics', href: '/staff/analytics' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Analytics – CivicLens AI" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">

                {/* ── Page header ── */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Analytics</h1>
                        <p className="mt-0.5 text-sm text-neutral-500">Your report data and AI analysis insights</p>
                    </div>
                    <span className="rounded-full bg-sky-50 px-3 py-1.5 text-xs font-semibold text-[#2369A4] dark:bg-sky-900/30 dark:text-sky-300">
                        🤖 AI-powered insights
                    </span>
                </div>

                {/* ── KPI stat cards ── */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard label="Total Reports"     value={stats.total}                               icon="📋" accent="bg-[#2369A4]"    sub="All time" />
                    <StatCard label="Resolved"          value={stats.resolved}                            icon="✅" accent="bg-emerald-500"  sub={`${stats.resolution_rate}% resolution rate`} />
                    <StatCard label="AI Analyzed"       value={`${stats.ai_analyzed}%`}                  icon="🤖" accent="bg-violet-500"   sub="Reports with AI summary" />
                    <StatCard label="Avg AI Confidence" value={`${stats.avg_confidence}%`}               icon="🎯" accent="bg-amber-500"    sub="Across all analyzed reports" />
                </div>

                {/* ── Row 1: Area chart + Donut ── */}
                <div className="grid gap-6 lg:grid-cols-3">

                    {/* Monthly trend — 2/3 */}
                    <Card title="📈 Monthly Submissions vs Resolutions" className="lg:col-span-2">
                        <ResponsiveContainer width="100%" height={220}>
                            <AreaChart data={monthly} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="gradSubmit" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%"  stopColor={BRAND}     stopOpacity={0.25} />
                                        <stop offset="95%" stopColor={BRAND}     stopOpacity={0}    />
                                    </linearGradient>
                                    <linearGradient id="gradClose" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%"  stopColor={BRAND2}     stopOpacity={0.25} />
                                        <stop offset="95%" stopColor={BRAND2}     stopOpacity={0}    />
                                    </linearGradient>
                                    <linearGradient id="gradResolve" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%"  stopColor="#10b981"  stopOpacity={0.25} />
                                        <stop offset="95%" stopColor="#10b981"  stopOpacity={0}    />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                <Tooltip content={<ChartTooltip />} />
                                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                                <Area type="monotone" dataKey="submitted" name="Submitted" stroke={BRAND}    strokeWidth={2} fill="url(#gradSubmit)"  dot={{ r: 3, fill: BRAND }}    />
                                <Area type="monotone" dataKey="closed" name="Closed" stroke={BRAND2} strokeWidth={2} fill="url(#gradClose)" dot={{ r: 3, fill: BRAND2 }} />
                                <Area type="monotone" dataKey="resolved"  name="Resolved"  stroke="#10b981" strokeWidth={2} fill="url(#gradResolve)" dot={{ r: 3, fill: '#10b981' }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Card>

                    {/* Status donut — 1/3 */}
                    <Card title="🔵 Reports by Status">
                        <ResponsiveContainer width="100%" height={180}>
                            <PieChart>
                                <Pie
                                    data={byStatus}
                                    cx="50%" cy="50%"
                                    innerRadius={50} outerRadius={80}
                                    paddingAngle={3}
                                    dataKey="value"
                                >
                                    {byStatus.map((entry, i) => (
                                        <Cell key={i} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <Tooltip content={<ChartTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Legend */}
                        <div className="mt-2 flex flex-col gap-1.5">
                            {byStatus.map((s, i) => (
                                <div key={i} className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-1.5">
                                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.fill }} />
                                        <span className="text-neutral-600 dark:text-neutral-400">{s.name}</span>
                                    </div>
                                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">{s.value}</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* ── Row 2: Bar chart + Severity pie + Category list ── */}
                <div className="grid gap-6 lg:grid-cols-3">

                    {/* Category bar chart — 1/3 */}
                    <Card title="🗂️ Reports by Category">
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart
                                data={byCategory}
                                layout="vertical"
                                margin={{ top: 0, right: 16, left: 8, bottom: 0 }}
                                barSize={14}
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                                <XAxis type="number" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                <YAxis
                                    type="category"
                                    dataKey="name"
                                    tick={{ fontSize: 11, fill: '#6b7280' }}
                                    axisLine={false}
                                    tickLine={false}
                                    width={90}
                                />
                                <Tooltip content={<ChartTooltip />} />
                                <Bar dataKey="count" name="Reports" radius={[0, 6, 6, 0]}>
                                    {byCategory.map((_, i) => (
                                        <Cell key={i} fill={BRAND} opacity={1 - i * 0.1} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>

                    {/* Severity radial — 1/3 */}
                    <Card title="⚡ Severity Breakdown">
                        <ResponsiveContainer width="100%" height={180}>
                            <RadialBarChart
                                cx="50%" cy="50%"
                                innerRadius={30} outerRadius={90}
                                barSize={14}
                                data={bySeverity}
                                startAngle={90} endAngle={-270}
                            >
                                <RadialBar dataKey="value" cornerRadius={6} background={{ fill: '#f5f5f5' }}>
                                    {bySeverity.map((entry, i) => (
                                        <Cell key={i} fill={entry.color} />
                                    ))}
                                </RadialBar>
                                <Tooltip content={<ChartTooltip />} />
                            </RadialBarChart>
                        </ResponsiveContainer>
                        <div className="mt-2 flex justify-center gap-4">
                            {bySeverity.map((s, i) => (
                                <div key={i} className="flex flex-col items-center gap-0.5">
                                    <span className="text-lg font-bold" style={{ color: s.color }}>{s.value}%</span>
                                    <span className="text-xs text-neutral-400">{s.name}</span>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* AI confidence meter — 1/3 */}
                    <Card title="🎯 AI Analysis Quality">
                        {/* Big confidence number */}
                        <div className="mb-4 flex flex-col items-center justify-center py-2">
                            <div className="relative flex h-28 w-28 items-center justify-center rounded-full"
                                style={{
                                    background: `conic-gradient(${BRAND} ${stats.avg_confidence * 3.6}deg, #f0f0f0 0deg)`,
                                }}>
                                <div className="flex h-20 w-20 flex-col items-center justify-center rounded-full bg-white dark:bg-neutral-900">
                                    <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{stats.avg_confidence}%</span>
                                    <span className="text-xs text-neutral-400">avg</span>
                                </div>
                            </div>
                            <p className="mt-3 text-sm font-medium text-neutral-600 dark:text-neutral-300">Average AI Confidence</p>
                        </div>
                        {/* Breakdown bars */}
                        <div className="flex flex-col gap-2">
                            {[
                                { label: 'AI Analyzed',     value: stats.ai_analyzed,      color: 'bg-violet-500' },
                                { label: 'Resolution Rate',  value: stats.resolution_rate,  color: 'bg-emerald-500' },
                                { label: 'Avg Confidence',  value: stats.avg_confidence,   color: 'bg-[#2369A4]' },
                            ].map((item, i) => (
                                <div key={i}>
                                    <div className="mb-0.5 flex justify-between text-xs">
                                        <span className="text-neutral-500">{item.label}</span>
                                        <span className="font-semibold text-neutral-700 dark:text-neutral-300">{item.value}%</span>
                                    </div>
                                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                                        <div
                                            className={`h-full rounded-full ${item.color} transition-all duration-700`}
                                            style={{ width: `${item.value}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* ── Row 3: Recent reports table ── */}
                <div className="rounded-2xl border border-sidebar-border/70 bg-white shadow-sm dark:border-sidebar-border dark:bg-neutral-900">
                    <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4 dark:border-neutral-800">
                        <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-400">🕐 Recent Reports</h3>
                        <a href="/staff/reports/all" className="text-xs font-semibold text-[#2369A4] hover:underline">View all →</a>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-neutral-100 text-left text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:border-neutral-800">
                                    <th className="px-5 py-3">Report</th>
                                    <th className="px-5 py-3">Title</th>
                                    <th className="px-5 py-3">Status</th>
                                    <th className="px-5 py-3">Severity</th>
                                    <th className="px-5 py-3">Date</th>
                                    <th className="px-5 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                {recent.map((r: RecentReport) => {
                                    const sm = STATUS_META[r.status] ?? { dot: 'bg-gray-400', cls: 'bg-gray-100 text-gray-600' };
                                    return (
                                        <tr key={r.id} className="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                                            <td className="px-5 py-3 font-mono text-xs text-neutral-400">{r.id}</td>
                                            <td className="max-w-[200px] truncate px-5 py-3 font-medium text-neutral-800 dark:text-neutral-200">{r.title}</td>
                                            <td className="px-5 py-3">
                                                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${sm.cls}`}>
                                                    <span className={`h-1.5 w-1.5 rounded-full ${sm.dot}`} />
                                                    {r.status}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3">
                                                <span
                                                    className="rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize"
                                                    style={{
                                                        backgroundColor: SEVERITY_COLORS[r.severity] + '20',
                                                        color: SEVERITY_COLORS[r.severity],
                                                    }}
                                                >
                                                    {r.severity}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 text-xs text-neutral-400">{r.date}</td>
                                            <td className="px-5 py-3">
                                                <a href={`/staff/reports/show/${r.id}`} className="text-xs font-semibold text-[#2369A4] hover:underline">
                                                    View →
                                                </a>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </AppLayout>
    );
}