import { Head, router, usePage } from '@inertiajs/react';
import { useState, useRef } from 'react';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

// ── Types ─────────────────────────────────────────────────────────────────────
interface Category {
    id: number;
    name: string;
    icon: string | null;
}

interface Location {
    id: number;
    address: string;
    city: string | null;
    country: string | null;
}

interface Media {
    id: number;
    type: string;
    file_path: string;
}

interface Report {
    id: number;
    title: string | null;
    description: string;
    category_id: number | null;
    location_id: number | null;
    severity: string | null;
    media: Media[];
    location: Location | null;
    category: Category | null;
}

interface Props {
    report: Report;
    categories: Category[];
    locations: Location[];
}

const SEVERITY_OPTIONS = [
    { value: 'low',    label: 'Low',    dot: 'bg-emerald-500', cls: 'border-emerald-400 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300' },
    { value: 'medium', label: 'Medium', dot: 'bg-amber-500',   cls: 'border-amber-400 bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300'           },
    { value: 'high',   label: 'High',   dot: 'bg-red-500',     cls: 'border-red-400 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300'                     },
];

export default function EditReport() {
    const { report, categories, locations } = usePage().props as unknown as Props;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard',  href: dashboard().url },
        { title: 'My Reports', href: '/reports' },
        { title: `Edit #${report.id}`, href: `/reports/${report.id}/edit` },
    ];

    // ── Form state (pre-filled from existing report) ──────────────────────────
    const [form, setForm] = useState({
        title:       report.title ?? '',
        description: report.description ?? '',
        category_id: report.category_id ?? '',
        location_id: report.location_id ?? '',
        severity:    report.severity ?? 'medium',
    });

    const [newImage, setNewImage]   = useState<File | null>(null);
    const [newAudio, setNewAudio]   = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [errors, setErrors]       = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [audioRecorded, setAudioRecorded] = useState(false);

    const fileInputRef  = useRef<HTMLInputElement>(null);
    const mediaRecRef   = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    // Existing media
    const existingImage = report.media?.find(m => m.type === 'image');
    const existingAudio = report.media?.find(m => m.type === 'audio');

    const set = (key: string, value: unknown) =>
        setForm(f => ({ ...f, [key]: value }));

    // ── Image handling ────────────────────────────────────────────────────────
    const handleImageChange = (file: File) => {
        setNewImage(file);
        const reader = new FileReader();
        reader.onload = e => setImagePreview(e.target?.result as string);
        reader.readAsDataURL(file);
    };

    // ── Voice recording ───────────────────────────────────────────────────────
    const startRecording = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mr = new MediaRecorder(stream);
        audioChunksRef.current = [];
        mr.ondataavailable = e => audioChunksRef.current.push(e.data);
        mr.onstop = () => {
            const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            setNewAudio(blob as unknown as File);
            setAudioRecorded(true);
        };
        mr.start();
        mediaRecRef.current = mr;
        setIsRecording(true);
    };

    const stopRecording = () => {
        mediaRecRef.current?.stop();
        setIsRecording(false);
    };

    // ── Submit ────────────────────────────────────────────────────────────────
    const handleSubmit = () => {
        const errs: Record<string, string> = {};
        if (!form.description.trim()) errs.description = 'Description is required.';
        if (!form.location_id)        errs.location_id  = 'Location is required.';
        setErrors(errs);
        if (Object.keys(errs).length > 0) return;

        setSubmitting(true);

        const fd = new FormData();
        fd.append('_method',     'POST');
        fd.append('title',       form.title);
        fd.append('description', form.description);
        fd.append('category_id', String(form.category_id));
        fd.append('location_id', String(form.location_id));
        fd.append('severity',    form.severity);
        if (newImage) fd.append('image', newImage);
        if (newAudio) fd.append('audio', newAudio, 'recording.webm');

        router.post(`/reports/update/${report.id}`, fd, {
            forceFormData: true,
            onError:  e  => { setErrors(e); setSubmitting(false); },
            onFinish: ()  => setSubmitting(false),
        });
    };

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Report #${report.id} – CivicLens AI`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">

                {/* Page header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                            Edit Report
                        </h1>
                        <p className="mt-0.5 text-sm text-neutral-500">
                            Report <span className="font-mono">#{report.id}</span> — changes will trigger a new AI analysis.
                        </p>
                    </div>
                    <a
                        href={`/reports/show/${report.id}`}
                        className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-600 transition hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                    >
                        ← Back to Report
                    </a>
                </div>

                <div className="grid gap-6 lg:grid-cols-5">

                    {/* ── Left: media ── */}
                    <div className="flex flex-col gap-5 lg:col-span-2">

                        {/* Image */}
                        <div className="rounded-2xl border border-sidebar-border/70 bg-white p-5 shadow-sm dark:border-sidebar-border dark:bg-neutral-900">
                            <h3 className="mb-3 font-semibold text-neutral-800 dark:text-neutral-200">📸 Photo</h3>

                            {/* Current image */}
                            {existingImage && !imagePreview && (
                                <div className="mb-3">
                                    <p className="mb-1.5 text-xs text-neutral-400">Current photo:</p>
                                    <img
                                        src={`/storage/${existingImage.file_path}`}
                                        alt="Current"
                                        className="h-36 w-full rounded-xl object-cover"
                                    />
                                </div>
                            )}

                            {/* New image preview */}
                            {imagePreview && (
                                <div className="mb-3">
                                    <p className="mb-1.5 text-xs text-emerald-600">New photo selected:</p>
                                    <img
                                        src={imagePreview}
                                        alt="New"
                                        className="h-36 w-full rounded-xl object-cover ring-2 ring-emerald-400"
                                    />
                                </div>
                            )}

                            {/* Upload zone */}
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                onDragOver={e => e.preventDefault()}
                                onDrop={e => {
                                    e.preventDefault();
                                    const file = e.dataTransfer.files[0];
                                    if (file?.type.startsWith('image/')) handleImageChange(file);
                                }}
                                className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-200 bg-neutral-50 py-5 transition hover:border-[#2369A4] hover:bg-sky-50 dark:border-neutral-700 dark:bg-neutral-800"
                            >
                                <span className="text-2xl">🖼️</span>
                                <p className="mt-1 text-xs text-neutral-400">
                                    {existingImage ? 'Replace photo' : 'Upload photo'}
                                </p>
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
                        </div>

                        {/* Audio */}
                        <div className="rounded-2xl border border-sidebar-border/70 bg-white p-5 shadow-sm dark:border-sidebar-border dark:bg-neutral-900">
                            <h3 className="mb-3 font-semibold text-neutral-800 dark:text-neutral-200">🎤 Voice Recording</h3>

                            {/* Existing audio */}
                            {existingAudio && !audioRecorded && (
                                <div className="mb-3">
                                    <p className="mb-1.5 text-xs text-neutral-400">Current recording:</p>
                                    <audio
                                        controls
                                        src={`/storage/${existingAudio.file_path}`}
                                        className="w-full rounded-xl"
                                    />
                                </div>
                            )}

                            {audioRecorded && (
                                <p className="mb-3 text-xs text-emerald-600 font-medium">
                                    ✓ New recording captured — will replace existing
                                </p>
                            )}

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
                                    : <><span>🎙️</span> {existingAudio ? 'Re-record' : 'Record Audio'}</>
                                }
                            </button>
                        </div>
                    </div>

                    {/* ── Right: form fields ── */}
                    <div className="flex flex-col gap-5 lg:col-span-3">

                        <div className="rounded-2xl border border-sidebar-border/70 bg-white p-5 shadow-sm dark:border-sidebar-border dark:bg-neutral-900">
                            <h3 className="mb-5 font-semibold text-neutral-800 dark:text-neutral-200">📋 Report Details</h3>

                            {/* Title */}
                            <div className="mb-4">
                                <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={e => set('title', e.target.value)}
                                    placeholder="e.g. Large pothole on main road"
                                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 outline-none focus:border-[#2369A4] focus:ring-2 focus:ring-[#2369A4]/10 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                                />
                            </div>

                            {/* Description */}
                            <div className="mb-4">
                                <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                    Description <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    rows={5}
                                    value={form.description}
                                    onChange={e => set('description', e.target.value)}
                                    placeholder="Describe the issue in detail…"
                                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 outline-none focus:border-[#2369A4] focus:ring-2 focus:ring-[#2369A4]/10 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                                />
                                {errors.description && (
                                    <p className="mt-1 text-xs text-red-500">{errors.description}</p>
                                )}
                            </div>

                            {/* Category */}
                            <div className="mb-4">
                                <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                    Category
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {categories.map(c => (
                                        <button
                                            key={c.id}
                                            type="button"
                                            onClick={() => set('category_id', c.id)}
                                            className={`flex flex-col items-center gap-1 rounded-xl border py-3 text-xs font-medium transition ${
                                                Number(form.category_id) === c.id
                                                    ? 'border-[#2369A4] bg-sky-50 text-[#2369A4] dark:bg-sky-900/30 dark:text-sky-300'
                                                    : 'border-neutral-200 bg-neutral-50 text-neutral-600 hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400'
                                            }`}
                                        >
                                            <span className="text-xl">{c.icon ?? '📌'}</span>
                                            {c.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Severity */}
                            <div className="mb-4">
                                <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                    Severity
                                </label>
                                <div className="flex gap-2">
                                    {SEVERITY_OPTIONS.map(s => (
                                        <button
                                            key={s.value}
                                            type="button"
                                            onClick={() => set('severity', s.value)}
                                            className={`flex flex-1 items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-semibold transition ${
                                                form.severity === s.value
                                                    ? s.cls + ' border-current'
                                                    : 'border-neutral-200 bg-neutral-50 text-neutral-500 hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800'
                                            }`}
                                        >
                                            <span className={`h-2 w-2 rounded-full ${s.dot}`} />
                                            {s.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Location */}
                            <div>
                                <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                    Location <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={form.location_id}
                                    onChange={e => set('location_id', e.target.value)}
                                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-900 outline-none focus:border-[#2369A4] focus:ring-2 focus:ring-[#2369A4]/10 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                                >
                                    <option value="">Select a location…</option>
                                    {locations.map(l => (
                                        <option key={l.id} value={l.id}>
                                            {[l.address, l.city, l.country].filter(Boolean).join(', ')}
                                        </option>
                                    ))}
                                </select>
                                {errors.location_id && (
                                    <p className="mt-1 text-xs text-red-500">{errors.location_id}</p>
                                )}
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-3">
                            <a
                                href={`/reports/show/${report.id}`}
                                className="flex flex-1 items-center justify-center rounded-2xl border border-neutral-200 bg-white py-3.5 text-sm font-semibold text-neutral-600 transition hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                            >
                                Cancel
                            </a>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="flex flex-[2] items-center justify-center gap-2 rounded-2xl bg-[#2369A4] py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-sky-700 disabled:opacity-60"
                            >
                                {submitting
                                    ? <><span className="animate-spin">⚙️</span> Saving…</>
                                    : <><span>💾</span> Save Changes</>
                                }
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}