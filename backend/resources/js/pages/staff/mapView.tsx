import { Head, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState, useCallback } from 'react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

// ── Types ─────────────────────────────────────────────────────────────────────
interface MapReport {
    id: number;
    title: string;
    description: string;
    status: string;
    severity: string;
    category: string;
    category_icon: string;
    latitude: number;
    longitude: number;
    address: string;
    ai_summary: string | null;
    created_at: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────
const SEVERITY_COLOR: Record<string, string> = {
    high:   '#ef4444',
    medium: '#f59e0b',
    low:    '#10b981',
};

const STATUS_META: Record<string, { cls: string; dot: string }> = {
    Submitted:      { cls: 'bg-slate-100 text-slate-600',    dot: 'bg-slate-400'   },
    'AI Processing':{ cls: 'bg-violet-100 text-violet-700',  dot: 'bg-violet-500'  },
    Assigned:       { cls: 'bg-blue-100 text-blue-700',      dot: 'bg-blue-500'    },
    'In Progress':  { cls: 'bg-amber-100 text-amber-700',    dot: 'bg-amber-500'   },
    Resolved:       { cls: 'bg-emerald-100 text-emerald-700',dot: 'bg-emerald-500' },
    Closed:         { cls: 'bg-gray-100 text-gray-600',      dot: 'bg-gray-400'    },
};

const FILTERS = ['All', 'High', 'Medium', 'Low'];
const STATUS_FILTERS = ['All Statuses', 'Submitted', 'In Progress', 'Resolved', 'Assigned', 'Closed'];

// ── Mock data for when no backend yet ────────────────────────────────────────
const MOCK_REPORTS: MapReport[] = [
    { id: 1, title: 'Large pothole',        description: 'Deep pothole causing vehicle damage', status: 'In Progress',  severity: 'high',   category: 'Infrastructure', category_icon: '🏗️', latitude: 33.9716,  longitude: -6.8498, address: 'Rue Souissi, Rabat',       ai_summary: 'A significant road hazard requiring immediate repair.', created_at: '2024-03-20' },
    { id: 2, title: 'Illegal dumping',      description: 'Large pile of garbage near park',    status: 'Submitted',    severity: 'medium', category: 'Sanitation',     category_icon: '🗑️', latitude: 33.9851,  longitude: -6.8545, address: 'Quartier Océan, Rabat',    ai_summary: 'Environmental hazard attracting pests and creating odour.', created_at: '2024-03-19' },
    { id: 3, title: 'Broken streetlight',   description: 'Streetlight out for 2 weeks',        status: 'Assigned',     severity: 'medium', category: 'Safety',         category_icon: '🔦', latitude: 33.9936,  longitude: -6.8538, address: 'Ave Hassan II, Rabat',     ai_summary: 'Safety risk for pedestrians at night.', created_at: '2024-03-18' },
    { id: 4, title: 'Road crack',           description: 'Long crack across 3 lanes',          status: 'Resolved',     severity: 'high',   category: 'Infrastructure', category_icon: '🏗️', latitude: 33.9774,  longitude: -6.8612, address: 'Blvd Mohammed V, Rabat',   ai_summary: null, created_at: '2024-03-17' },
    { id: 5, title: 'Graffiti on wall',     description: 'Vandalism on public building',       status: 'Resolved',     severity: 'low',    category: 'Sanitation',     category_icon: '🗑️', latitude: 33.9693,  longitude: -6.8601, address: 'Rue Chellah, Rabat',       ai_summary: 'Aesthetic damage to public property.', created_at: '2024-03-16' },
    { id: 6, title: 'Noise at night',       description: 'Construction noise after hours',     status: 'Submitted',    severity: 'low',    category: 'Noise',          category_icon: '🔊', latitude: 33.9882,  longitude: -6.8470, address: 'Agdal, Rabat',             ai_summary: null, created_at: '2024-03-15' },
    { id: 7, title: 'Flooded road',         description: 'Water accumulation blocking road',   status: 'In Progress',  severity: 'high',   category: 'Infrastructure', category_icon: '🏗️', latitude: 34.0013,  longitude: -6.8554, address: 'Hay Riad, Rabat',          ai_summary: 'Dangerous flooding requiring drainage repair.', created_at: '2024-03-14' },
    { id: 8, title: 'Broken bench',         description: 'Park bench damaged',                 status: 'Submitted',    severity: 'low',    category: 'Infrastructure', category_icon: '🏗️', latitude: 33.9753,  longitude: -6.8523, address: 'Jardin d\'Essais, Rabat',  ai_summary: null, created_at: '2024-03-13' },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function MapView() {
    const props = usePage().props as any;
    const allReports: MapReport[] = props.reports ?? MOCK_REPORTS;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/staff/dashboard' },
        { title: 'Map View',  href: '/staff/map' },
    ];

    const mapRef        = useRef<HTMLDivElement>(null);
    const leafletRef    = useRef<any>(null);
    const markersRef    = useRef<any[]>([]);
    const mapInstanceRef = useRef<any>(null);

    const [search, setSearch]               = useState('');
    const [suggestions, setSuggestions]     = useState<any[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [severityFilter, setSeverityFilter] = useState('All');
    const [statusFilter, setStatusFilter]   = useState('All Statuses');
    const [selectedReport, setSelectedReport] = useState<MapReport | null>(null);
    const [sidebarOpen, setSidebarOpen]     = useState(false);
    const [mapReady, setMapReady]           = useState(false);
    const [activeCount, setActiveCount]     = useState(allReports.length);
    const searchTimeout                     = useRef<ReturnType<typeof setTimeout>>();

    // ── Filtered reports ──────────────────────────────────────────────────────
    const filtered = allReports.filter(r => {
        const q = search.toLowerCase();
        const matchSearch = !q ||
            r.title.toLowerCase().includes(q) ||
            r.address.toLowerCase().includes(q) ||
            r.category.toLowerCase().includes(q);
        const matchSeverity = severityFilter === 'All' || r.severity === severityFilter.toLowerCase();
        const matchStatus   = statusFilter === 'All Statuses' || r.status === statusFilter;
        return matchSearch && matchSeverity && matchStatus;
    });

    // ── Load Leaflet dynamically ──────────────────────────────────────────────
    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Inject Leaflet CSS
        if (!document.getElementById('leaflet-css')) {
            const link = document.createElement('link');
            link.id = 'leaflet-css';
            link.rel = 'stylesheet';
            link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            document.head.appendChild(link);
        }

        // Load Leaflet JS
        import('leaflet').then(L => {
            leafletRef.current = L.default ?? L;
            if (mapRef.current && !mapInstanceRef.current) {
                const map = leafletRef.current.map(mapRef.current, {
                    center:    [33.9716, -6.8498],
                    zoom:      13,
                    zoomControl: false,
                });

                // Custom zoom control position
                leafletRef.current.control.zoom({ position: 'bottomright' }).addTo(map);

                // Tile layer — clean CartoDB light style
                leafletRef.current.tileLayer(
                    'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
                    {
                        attribution: '© OpenStreetMap © CARTO',
                        subdomains: 'abcd',
                        maxZoom: 19,
                    }
                ).addTo(map);

                mapInstanceRef.current = map;
                setMapReady(true);
            }
        });

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    // ── Render markers ────────────────────────────────────────────────────────
    useEffect(() => {
        if (!mapReady || !leafletRef.current || !mapInstanceRef.current) return;
        const L = leafletRef.current;

        // Clear old markers
        markersRef.current.forEach(m => m.remove());
        markersRef.current = [];

        filtered.forEach(report => {
            const color  = SEVERITY_COLOR[report.severity] ?? '#94a3b8';
            const isSelected = selectedReport?.id === report.id;

            // Custom SVG marker
            const icon = L.divIcon({
                className: '',
                html: `
                    <div style="
                        position: relative;
                        width: ${isSelected ? 40 : 32}px;
                        height: ${isSelected ? 40 : 32}px;
                        transition: all 0.2s;
                    ">
                        <div style="
                            width: 100%;
                            height: 100%;
                            background: ${color};
                            border-radius: 50% 50% 50% 0;
                            transform: rotate(-45deg);
                            border: 3px solid white;
                            box-shadow: 0 2px 8px rgba(0,0,0,0.25);
                        "></div>
                        <span style="
                            position: absolute;
                            top: 50%;
                            left: 50%;
                            transform: translate(-50%, -65%);
                            font-size: ${isSelected ? '14px' : '12px'};
                            line-height: 1;
                        ">${report.category_icon}</span>
                    </div>
                `,
                iconSize:   [isSelected ? 40 : 32, isSelected ? 40 : 32],
                iconAnchor: [isSelected ? 20 : 16, isSelected ? 40 : 32],
            });

            const marker = L.marker([report.latitude, report.longitude], { icon })
                .addTo(mapInstanceRef.current)
                .on('click', () => {
                    setSelectedReport(report);
                    setSidebarOpen(true);
                    mapInstanceRef.current.panTo(
                        [report.latitude, report.longitude],
                        { animate: true, duration: 0.5 }
                    );
                });

            markersRef.current.push(marker);
        });

        setActiveCount(filtered.length);
    }, [mapReady, filtered.length, severityFilter, statusFilter, selectedReport?.id]);

    // ── Nominatim search (OpenStreetMap geocoding) ────────────────────────────
    const handleSearchInput = useCallback((value: string) => {
        setSearch(value);
        clearTimeout(searchTimeout.current);

        if (value.length < 3) { setSuggestions([]); return; }

        setSearchLoading(true);
        searchTimeout.current = setTimeout(async () => {
            try {
                const res = await fetch(
                    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(value)}&format=json&limit=5&countrycodes=ma`,
                    { headers: { 'Accept-Language': 'en' } }
                );
                const data = await res.json();
                setSuggestions(data);
            } catch { setSuggestions([]); }
            finally { setSearchLoading(false); }
        }, 400);
    }, []);

    const flyToSuggestion = (item: any) => {
        setSearch(item.display_name.split(',')[0]);
        setSuggestions([]);
        mapInstanceRef.current?.flyTo(
            [parseFloat(item.lat), parseFloat(item.lon)],
            15,
            { animate: true, duration: 1 }
        );
    };

    const flyToReport = (report: MapReport) => {
        setSelectedReport(report);
        setSidebarOpen(true);
        mapInstanceRef.current?.flyTo(
            [report.latitude, report.longitude],
            16,
            { animate: true, duration: 0.8 }
        );
    };

    const sm = selectedReport ? (STATUS_META[selectedReport.status] ?? STATUS_META['Submitted']) : null;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Map View – CivicLens AI" />

            <div className="relative flex h-full flex-1 overflow-hidden rounded-xl">

                {/* ── Map container ── */}
                <div ref={mapRef} className="h-full flex-1" style={{ minHeight: '600px', zIndex: 0 }} />

                {/* Loading overlay */}
                {!mapReady && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-neutral-100 dark:bg-neutral-900">
                        <div className="flex flex-col items-center gap-3">
                            <span className="animate-spin text-3xl">🗺️</span>
                            <p className="text-sm text-neutral-500">Loading map…</p>
                        </div>
                    </div>
                )}

                {/* ── Top search + filter bar (floating) ── */}
                <div className="absolute left-4 right-4 top-4 z-20 flex flex-col gap-2 md:left-4 md:right-auto md:w-96">

                    {/* Search box */}
                    <div className="relative">
                        <div className="flex items-center gap-2 rounded-2xl border border-white/60 bg-white/95 px-4 py-3 shadow-xl backdrop-blur-md dark:border-neutral-700/60 dark:bg-neutral-900/95">
                            <span className="text-lg">{searchLoading ? '⏳' : '🔍'}</span>
                            <input
                                type="text"
                                value={search}
                                onChange={e => handleSearchInput(e.target.value)}
                                placeholder="Search address, category, or report title…"
                                className="flex-1 bg-transparent text-sm text-neutral-800 placeholder-neutral-400 outline-none dark:text-neutral-200"
                            />
                            {search && (
                                <button onClick={() => { setSearch(''); setSuggestions([]); }} className="text-neutral-400 hover:text-neutral-600">✕</button>
                            )}
                        </div>

                        {/* Geocode suggestions dropdown */}
                        {suggestions.length > 0 && (
                            <div className="absolute top-full mt-1 w-full overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xl dark:border-neutral-700 dark:bg-neutral-900">
                                {suggestions.map((s, i) => (
                                    <button
                                        key={i}
                                        onClick={() => flyToSuggestion(s)}
                                        className="flex w-full items-start gap-2 px-4 py-2.5 text-left text-sm transition hover:bg-neutral-50 dark:hover:bg-neutral-800"
                                    >
                                        <span className="mt-0.5 shrink-0 text-neutral-400">📍</span>
                                        <span className="text-neutral-700 dark:text-neutral-300 line-clamp-1">{s.display_name}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Filter chips */}
                    <div className="flex flex-wrap gap-1.5">
                        {/* Severity */}
                        {FILTERS.map(f => (
                            <button
                                key={f}
                                onClick={() => setSeverityFilter(f)}
                                className={`rounded-full px-3 py-1 text-xs font-semibold shadow-sm backdrop-blur-sm transition ${
                                    severityFilter === f
                                        ? 'bg-[#2369A4] text-white shadow-md'
                                        : 'bg-white/90 text-neutral-600 hover:bg-white dark:bg-neutral-800/90 dark:text-neutral-300'
                                }`}
                            >
                                {f === 'High' && '🔴 '}
                                {f === 'Medium' && '🟡 '}
                                {f === 'Low' && '🟢 '}
                                {f}
                            </button>
                        ))}
                        <div className="h-5 w-px self-center bg-white/40" />
                        {/* Status */}
                        {STATUS_FILTERS.map(f => (
                            <button
                                key={f}
                                onClick={() => setStatusFilter(f)}
                                className={`rounded-full px-3 py-1 text-xs font-semibold shadow-sm backdrop-blur-sm transition ${
                                    statusFilter === f
                                        ? 'bg-[#2369A4] text-white shadow-md'
                                        : 'bg-white/90 text-neutral-600 hover:bg-white dark:bg-neutral-800/90 dark:text-neutral-300'
                                }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Active count pill ── */}
                <div className="absolute bottom-10 left-4 z-20">
                    <div className="flex items-center gap-2 rounded-2xl border border-white/60 bg-white/95 px-4 py-2 shadow-lg backdrop-blur-md dark:border-neutral-700 dark:bg-neutral-900/95">
                        <span className="h-2 w-2 rounded-full bg-[#2369A4] animate-pulse" />
                        <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                            {activeCount} report{activeCount !== 1 ? 's' : ''} visible
                        </span>
                    </div>
                </div>

                {/* ── Legend ── */}
                <div className="absolute bottom-10 right-14 z-20">
                    <div className="flex flex-col gap-1.5 rounded-2xl border border-white/60 bg-white/95 px-3 py-3 shadow-lg backdrop-blur-md dark:border-neutral-700 dark:bg-neutral-900/95">
                        <p className="mb-0.5 text-xs font-bold text-neutral-500 uppercase tracking-wide">Severity</p>
                        {[
                            { label: 'High',   color: '#ef4444' },
                            { label: 'Medium', color: '#f59e0b' },
                            { label: 'Low',    color: '#10b981' },
                        ].map(l => (
                            <div key={l.label} className="flex items-center gap-2">
                                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: l.color }} />
                                <span className="text-xs text-neutral-600 dark:text-neutral-400">{l.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Report list panel (left slide-in) ── */}
                <div className={`absolute bottom-0 left-0 top-0 z-20 flex w-80 flex-col border-r border-neutral-200/60 bg-white/95 shadow-2xl backdrop-blur-md transition-transform duration-300 dark:border-neutral-700/60 dark:bg-neutral-900/95 ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                } md:relative md:translate-x-0 md:shadow-none`}
                    style={{ marginTop: 0 }}
                >
                    {/* Panel header */}
                    <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3 dark:border-neutral-800">
                        <div>
                            <h2 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">Reports</h2>
                            <p className="text-xs text-neutral-400">{filtered.length} matching</p>
                        </div>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 md:hidden dark:hover:bg-neutral-800"
                        >✕</button>
                    </div>

                    {/* Report list */}
                    <div className="flex-1 overflow-y-auto">
                        {filtered.length === 0 ? (
                            <div className="flex flex-col items-center gap-2 py-12 text-center">
                                <span className="text-3xl">📭</span>
                                <p className="text-sm text-neutral-400">No reports match filters</p>
                            </div>
                        ) : (
                            filtered.map(r => {
                                const isActive = selectedReport?.id === r.id;
                                return (
                                    <button
                                        key={r.id}
                                        onClick={() => flyToReport(r)}
                                        className={`w-full border-b border-neutral-100 px-4 py-3 text-left transition dark:border-neutral-800 ${
                                            isActive
                                                ? 'bg-sky-50 dark:bg-sky-900/20'
                                                : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                                        }`}
                                    >
                                        <div className="flex items-start gap-2">
                                            <span
                                                className="mt-1 h-2 w-2 shrink-0 rounded-full"
                                                style={{ backgroundColor: SEVERITY_COLOR[r.severity] }}
                                            />
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-1">
                                                    <span className="text-sm">{r.category_icon}</span>
                                                    <p className="truncate text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                                                        {r.title}
                                                    </p>
                                                </div>
                                                <p className="mt-0.5 truncate text-xs text-neutral-400">{r.address}</p>
                                                <div className="mt-1.5 flex items-center gap-1.5">
                                                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_META[r.status]?.cls ?? 'bg-gray-100 text-gray-600'}`}>
                                                        {r.status}
                                                    </span>
                                                    <span className="text-xs text-neutral-300">·</span>
                                                    <span className="text-xs text-neutral-400">#{r.id}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>

                    {/* Selected report detail card */}
                    {selectedReport && sm && (
                        <div className="border-t border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
                            <div className="mb-2 flex items-start justify-between gap-2">
                                <div className="flex items-center gap-1.5">
                                    <span>{selectedReport.category_icon}</span>
                                    <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 line-clamp-1">
                                        {selectedReport.title}
                                    </h3>
                                </div>
                                <button
                                    onClick={() => setSelectedReport(null)}
                                    className="shrink-0 text-xs text-neutral-400 hover:text-neutral-600"
                                >✕</button>
                            </div>

                            <p className="mb-2 text-xs text-neutral-500 line-clamp-2">{selectedReport.description}</p>

                            {selectedReport.ai_summary && (
                                <div className="mb-2 rounded-xl border border-sky-100 bg-sky-50 px-3 py-2 dark:border-sky-800/40 dark:bg-sky-900/20">
                                    <p className="text-xs font-semibold text-sky-600 dark:text-sky-400">🤖 AI Summary</p>
                                    <p className="mt-0.5 text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2">
                                        {selectedReport.ai_summary}
                                    </p>
                                </div>
                            )}

                            <div className="mb-3 flex gap-1.5">
                                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${sm.cls}`}>
                                    {selectedReport.status}
                                </span>
                                <span
                                    className="rounded-full px-2 py-0.5 text-xs font-semibold capitalize"
                                    style={{
                                        backgroundColor: SEVERITY_COLOR[selectedReport.severity] + '20',
                                        color: SEVERITY_COLOR[selectedReport.severity],
                                    }}
                                >
                                    {selectedReport.severity}
                                </span>
                            </div>

                            <a
                                href={`/staff/reports/show/${selectedReport.id}`}
                                className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#2369A4] py-2 text-xs font-bold text-white transition hover:bg-sky-700"
                            >
                                View Full Report →
                            </a>
                        </div>
                    )}
                </div>

                {/* ── Mobile toggle button ── */}
                <button
                    onClick={() => setSidebarOpen(v => !v)}
                    className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-xl border border-white/60 bg-white/95 p-2.5 shadow-lg backdrop-blur-md transition hover:bg-white md:hidden dark:border-neutral-700 dark:bg-neutral-900/95"
                >
                    <span className="text-lg">{sidebarOpen ? '◀' : '▶'}</span>
                </button>

            </div>
        </AppLayout>
    );
}