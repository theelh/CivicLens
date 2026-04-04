import { Head, router, useForm } from '@inertiajs/react';
import axios from 'axios';
import { useState, useRef, useCallback } from 'react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

// Axios always sends session cookie + CSRF header
axios.defaults.withCredentials = true;
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Submit Report', href: '/admin/reports/submit' },
];

interface AiAnalysis {
    category: string;
    severity: 'low' | 'medium' | 'high';
    confidence: number;
    summary: string;
}

const CATEGORIES = [
    { id: 1, label: 'Infrastructure',  icon: '🏗️' },
    { id: 2, label: 'Sanitation',      icon: '🗑️' },
    { id: 3, label: 'Safety',          icon: '🔦' },
    { id: 4, label: 'Transportation',  icon: '🚗' },
    { id: 5, label: 'Noise',           icon: '🔊' },
    { id: 6, label: 'Other',           icon: '📌' },
];


const SEVERITY_META = {
    low:    { label: 'Low',    ring: 'border-emerald-400 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300', dot: 'bg-emerald-500' },
    medium: { label: 'Medium', ring: 'border-amber-400 bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',           dot: 'bg-amber-500'   },
    high: { label: 'High', ring: 'border-red-400 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300',                     dot: 'bg-red-500'     },
};

export default function SubmitReport() {
    // ── Inertia useForm — handles CSRF token, multipart, and validation errors
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        category_id: '' as number | '',
        severity: 'medium' as 'low' | 'medium' | 'high',
        latitude: '',
        longitude: '',
        address: '',
        image: null as File | null,
        audio: null as File | null,
    });

    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [aiAnalysis, setAiAnalysis]     = useState<AiAnalysis | null>(null);
    const [aiLoading, setAiLoading]       = useState(false);
    const [isRecording, setIsRecording]   = useState(false);
    const [geoLoading, setGeoLoading]     = useState(false);
    const [submitted, setSubmitted]       = useState(false);

    const fileInputRef   = useRef<HTMLInputElement>(null);
    const mediaRecRef    = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    // Read CSRF token from the <meta> tag Inertia/Laravel injects
    const csrfToken = (): string =>
        (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '';

    // ── Image pick → instant AI auto-fill ────────────────────────────────────
    const handleImageChange = useCallback(async (file: File) => {
        setData('image', file);
        const reader = new FileReader();
        reader.onload = e => setImagePreview(e.target?.result as string);
        reader.readAsDataURL(file);

        setAiLoading(true);
        try {
            const fd = new FormData();
            fd.append('image', file);
            fd.append('_token', csrfToken());

            const res = await axios.post<AiAnalysis>('/staff/reports/analyze-image', fd);
            const ai  = res.data;
            setAiAnalysis(ai);

            const mapCategoryToId = (category: string): number | '' => {
                const found = CATEGORIES.find(c =>
                    c.label.toLowerCase().includes(category.toLowerCase())
                );
                return found ? found.id : '';
            };


            if (ai.category) {
                const id = mapCategoryToId(ai.category);
                if (id) setData('category_id', id);
            }
            if (ai.severity) setData('severity', ai.severity);
            if (ai.summary) {
                setData('description', d =>
                    d ? `${ai.summary}\n\n${d}` : ai.summary
                );
            }
        } catch (err) {
            console.warn('AI auto-fill skipped:', err);
        } finally {
            setAiLoading(false);
        }
    }, []);

    // ── GPS detect → reverse geocode ─────────────────────────────────────────
    const detectLocation = () => {
        if (!navigator.geolocation) return;
        setGeoLoading(true);
        navigator.geolocation.getCurrentPosition(
            async ({ coords: { latitude, longitude } }) => {
                setData('latitude', String(latitude));
                setData('longitude', String(longitude));
                try {
                    const res = await axios.get<{ address: string }>(
                        `/staff/geocode?lat=${latitude}&lng=${longitude}`
                    );
                    setData('address', res.data.address);
                } catch {
                    setData('address', `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
                }
                setGeoLoading(false);
            },
            () => setGeoLoading(false)
        );
    };

    // ── Voice recording → Whisper transcription ───────────────────────────────
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mr     = new MediaRecorder(stream);
            audioChunksRef.current = [];

            mr.ondataavailable = e => audioChunksRef.current.push(e.data);
            mr.onstop = async () => {
                const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const file = new File([blob], 'recording.webm', { type: 'audio/webm' });
                setData('audio', file);

                try {
                    const fd = new FormData();
                    fd.append('audio', file);
                    fd.append('_token', csrfToken());
                    const res = await axios.post<{ text: string }>('/staff/reports/transcribe', fd);
                    if (res.data.text) {
                        setData('description', d =>
                            d ? `${d}\n${res.data.text}` : res.data.text
                        );
                    }
                } catch (err) {
                    console.warn('Transcription skipped:', err);
                }
            };

            mr.start();
            mediaRecRef.current = mr;
            setIsRecording(true);
        } catch (err) {
            console.error('Mic access denied:', err);
        }
    };

    const stopRecording = () => {
        mediaRecRef.current?.stop();
        setIsRecording(false);
    };

    // ── Form submit via Inertia (handles CSRF + multipart automatically) ───────
    const handleSubmit = () => {
        post('/staff/reports', {
            forceFormData: true,   // send as multipart so files are included
            preserveScroll: true,
            onSuccess: () => setSubmitted(true),
        });
    };

    // ── Success screen ────────────────────────────────────────────────────────
    if (submitted) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Report Submitted – CivicLens AI" />
                <div className="flex h-full flex-1 items-center justify-center p-8">
                    <div className="text-center">
                        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-4xl dark:bg-emerald-900/40">✅</div>
                        <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Report Submitted!</h2>
                        <p className="mt-2 text-neutral-500">AI analysis is running. You'll be notified once reviewed.</p>
                        <button
                            onClick={() => router.visit('/admin/dashboard')}
                            className="mt-6 rounded-xl bg-sky-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-sky-700"
                        >
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Submit Report – CivicLens AI" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4 md:p-6">

                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Submit a City Report</h1>
                    <p className="mt-1 text-sm text-neutral-500">
                        Upload a photo, speak, or type — AI will analyse and categorise it automatically.
                    </p>
                </div>

                <div className="grid gap-6 lg:grid-cols-5">

                    {/* ── Left: media inputs ───────────────────────────────── */}
                    <div className="flex flex-col gap-5 lg:col-span-2">

                        {/* Photo */}
                        <div className="rounded-2xl border border-sidebar-border/70 bg-white p-5 shadow-sm dark:border-sidebar-border dark:bg-neutral-900">
                            <h3 className="mb-3 font-semibold text-neutral-800 dark:text-neutral-200">📸 Upload Photo</h3>
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                onDragOver={e => e.preventDefault()}
                                onDrop={e => {
                                    e.preventDefault();
                                    const file = e.dataTransfer.files[0];
                                    if (file?.type.startsWith('image/')) handleImageChange(file);
                                }}
                                className="relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-200 bg-neutral-50 transition hover:border-sky-400 hover:bg-sky-50 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:border-sky-500 dark:hover:bg-sky-900/10"
                                style={{ minHeight: 180 }}
                            >
                                {imagePreview
                                    ? <img src={imagePreview} alt="preview" className="h-44 w-full rounded-xl object-cover" />
                                    : (
                                        <div className="flex flex-col items-center gap-2 py-8 text-neutral-400">
                                            <span className="text-4xl">🖼️</span>
                                            <span className="text-sm">Drag & drop or click to upload</span>
                                            <span className="text-xs text-neutral-300">JPG, PNG, WEBP</span>
                                        </div>
                                    )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={e => {
                                        const file = e.target.files?.[0];
                                        if (file) handleImageChange(file);
                                    }}
                                />
                            </div>

                            {aiLoading && (
                                <div className="mt-3 flex items-center gap-2 rounded-xl bg-sky-50 p-3 text-sm text-sky-700 dark:bg-sky-900/20 dark:text-sky-300">
                                    <span className="animate-spin">⚙️</span> AI is analysing your photo…
                                </div>
                            )}
                            {aiAnalysis && !aiLoading && (
                                <div className="mt-3 rounded-xl border border-sky-200 bg-sky-50 p-3 text-sm dark:border-sky-800 dark:bg-sky-900/20">
                                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-sky-600 dark:text-sky-400">
                                        🤖 AI Auto-fill Applied
                                    </p>
                                    <p className="text-neutral-700 dark:text-neutral-300">
                                        <strong>Caption:</strong> {aiAnalysis.summary}
                                    </p>
                                    <p className="text-neutral-700 dark:text-neutral-300">
                                        <strong>Category:</strong> {aiAnalysis.category} ·{' '}
                                        <strong>Severity:</strong> {aiAnalysis.severity} ·{' '}
                                        <strong>Confidence:</strong> {Math.round(aiAnalysis.confidence * 100)}%
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Voice */}
                        <div className="rounded-2xl border border-sidebar-border/70 bg-white p-5 shadow-sm dark:border-sidebar-border dark:bg-neutral-900">
                            <h3 className="mb-2 font-semibold text-neutral-800 dark:text-neutral-200">🎤 Voice Description</h3>
                            <p className="mb-3 text-xs text-neutral-400">
                                Speak your complaint — Whisper transcribes it into the description.
                            </p>
                            <button
                                type="button"
                                onClick={isRecording ? stopRecording : startRecording}
                                className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition ${
                                    isRecording
                                        ? 'bg-red-500 text-white hover:bg-red-600'
                                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-200'
                                }`}
                            >
                                {isRecording
                                    ? <><span className="animate-pulse">🔴</span> Stop Recording</>
                                    : <><span>🎙️</span> Start Recording</>}
                            </button>
                            {data.audio && !isRecording && (
                                <p className="mt-2 text-center text-xs text-emerald-600 dark:text-emerald-400">
                                    ✓ Audio captured &amp; transcribed
                                </p>
                            )}
                        </div>
                    </div>

                    {/* ── Right: form fields ───────────────────────────────── */}
                    <div className="flex flex-col gap-5 lg:col-span-3">
                        <div className="rounded-2xl border border-sidebar-border/70 bg-white p-5 shadow-sm dark:border-sidebar-border dark:bg-neutral-900">
                            <h3 className="mb-4 font-semibold text-neutral-800 dark:text-neutral-200">📋 Report Details</h3>

                            {/* Title */}
                            <div className="mb-4">
                                <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                    Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.title}
                                    onChange={e => setData('title', e.target.value)}
                                    placeholder="e.g. Large pothole on main road"
                                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder-neutral-500"
                                />
                                {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
                            </div>

                            {/* Category */}
                            <div className="mb-4">
                                <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                    Category <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {CATEGORIES.map(c => (
                                        <button
                                            key={c.id}
                                            type="button"
                                            onClick={() => setData('category_id', c.id)}
                                            className={`flex flex-col items-center gap-1 rounded-xl border py-3 text-xs font-medium transition ${
                                                data.category_id === c.id
                                                    ? 'border-sky-500 bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300'
                                                    : 'border-neutral-200 bg-neutral-50 text-neutral-600 hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400'
                                            }`}
                                        >
                                            <span className="text-xl">{c.icon}</span>
                                            {c.label}
                                        </button>
                                    ))}
                                </div>
                                {errors.category_id && <p className="mt-1 text-xs text-red-500">{errors.category_id}</p>}
                            </div>

                            {/* Severity */}
                            <div className="mb-4">
                                <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Severity</label>
                                <div className="flex gap-2">
                                    {(['low', 'medium', 'high'] as const).map(s => (
                                        <button
                                            key={s}
                                            type="button"
                                            onClick={() => setData('severity', s)}
                                            className={`flex flex-1 items-center justify-center gap-2 rounded-xl border py-2 text-sm font-semibold transition ${
                                                data.severity === s
                                                    ? SEVERITY_META[s].ring + ' border-current'
                                                    : 'border-neutral-200 bg-neutral-50 text-neutral-500 hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800'
                                            }`}
                                        >
                                            <span className={`h-2 w-2 rounded-full ${SEVERITY_META[s].dot}`} />
                                            {SEVERITY_META[s].label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Description */}
                            <div className="mb-4">
                                <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                    Description
                                    <span className="ml-1 text-xs font-normal text-neutral-400">(auto-filled by AI / voice)</span>
                                </label>
                                <textarea
                                    rows={4}
                                    value={data.description}
                                    onChange={e => setData('description', e.target.value)}
                                    placeholder="Describe the issue in detail…"
                                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder-neutral-500"
                                />
                            </div>

                            {/* Location */}
                            <div>
                                <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                    Location <span className="text-red-500">*</span>
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={data.address}
                                        onChange={e => setData('address', e.target.value)}
                                        placeholder="Street address or area"
                                        className="flex-1 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm outline-none focus:border-sky-400 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder-neutral-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={detectLocation}
                                        disabled={geoLoading}
                                        className="shrink-0 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:opacity-50"
                                    >
                                        {geoLoading ? '⏳' : '📍 Detect'}
                                    </button>
                                </div>
                                {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address}</p>}
                                {data.latitude && (
                                    <p className="mt-1 text-xs text-neutral-400">
                                        GPS: {parseFloat(data.latitude).toFixed(5)}, {parseFloat(data.longitude).toFixed(5)}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={processing}
                            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-sky-600 py-4 text-base font-bold text-white shadow-lg transition hover:bg-sky-700 disabled:opacity-60"
                        >
                            {processing
                                ? <><span className="animate-spin">⚙️</span> Submitting…</>
                                : <><span>🚀</span> Submit Report</>}
                        </button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}