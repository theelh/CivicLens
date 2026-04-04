<?php

namespace App\Jobs;

use App\Models\AiAnalysis;
use App\Models\Category;
use App\Models\Notification;
use App\Models\Report;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use App\Models\Activity;

class AnalyzeReportJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries   = 3;
    public int $timeout = 180;

    // ── All endpoints now use router.huggingface.co ───────────────────────────
    // BLIP + BART + Whisper → router.huggingface.co/models/... (legacy-compatible path)
    // Llama                 → router.huggingface.co/v1/chat/completions (OpenAI-compatible)
    private const BLIP_URL    = 'https://router.huggingface.co/models/Salesforce/blip-image-captioning-large';
    private const BART_URL    = 'https://router.huggingface.co/models/facebook/bart-large-mnli';
    private const WHISPER_URL = 'https://router.huggingface.co/microsoft/VibeVoice-ASR-HF';
    private const LLAMA_URL   = 'https://router.huggingface.co/v1/chat/completions';
    private const LLAMA_MODEL = 'meta-llama/Llama-3.1-8B-Instruct:novita';

    public function __construct(public readonly int $reportId) {}

    public function handle(): void
    {
        try {
            $report = Report::with('media')->findOrFail($this->reportId);

            $imageCaption  = null;
            $transcription = null;
            $summary       = null;
            $confidence    = 0.5;
            $categoryId    = $report->category_id;
            $severity      = $report->severity;

            // ── 1. Image captioning (BLIP) ────────────────────────────────────
            $image = $report->media->firstWhere('type', 'image');
            if ($image) {
                $path = Storage::disk('public')->path($image->file_path);
                if (file_exists($path)) {
                    Log::info("Captioning image for report #{$report->id}");
                    $imageCaption = $this->captionImage($path);
                    Log::info("Caption result: " . ($imageCaption ?? 'null'));

                    if ($imageCaption) {
                        [$categoryLabel, $score] = $this->classifyCategory($imageCaption);
                        $confidence = $score;
                        $mapped = $this->mapCategoryToId($categoryLabel);
                        if ($mapped) $categoryId = $mapped;
                        [$severity] = $this->classifySeverity($imageCaption);
                    }
                }
            }

            // ── 2. Audio transcription (Whisper) ──────────────────────────────
            $audio = $report->media->firstWhere('type', 'audio');
            if ($audio) {
                $path = Storage::disk('public')->path($audio->file_path);
                if (file_exists($path)) {
                    Log::info("Transcribing audio for report #{$report->id}");
                    $transcription = $this->transcribeAudio($path);
                    Log::info("Transcription result: " . ($transcription ?? 'null'));
                }
            }

            // ── 3. Build combined text ────────────────────────────────────────
            $combinedText = implode(' ', array_filter([
                $report->description,
                $imageCaption,
                $transcription,
            ]));

            Log::info("Combined text length: " . strlen($combinedText));

            // ── 4. Summarise (Llama) ──────────────────────────────────────────
            if (strlen(trim($combinedText)) > 20) {
                $summary = $this->summarise($combinedText);
                Log::info("Summary result: " . ($summary ?? 'null'));
            }

            // Fallback: never leave ai_summary null
            if (!$summary) {
                $summary = mb_substr(trim($combinedText), 0, 200);
                Log::warning("Summarisation fallback used for report #{$report->id}");
            }

            // ── 5. Save to ai_analyses table ──────────────────────────────────
            AiAnalysis::updateOrCreate(
                ['report_id' => $report->id],
                [
                    'predicted_category' => $categoryId ?? 1,
                    'severity_level'     => $severity,
                    'confidence_score'   => $confidence,
                    'sentiment'          => $summary,
                ]
            );
            

            // ── 6. Save to reports table ──────────────────────────────────────
            $report->update([
                'category_id'   => $categoryId,
                'severity'      => $severity,
                'status_id'     => 3, // "In Analysis"
                'ai_summary'    => $summary,
                'ai_confidence' => $confidence,
            ]);

            // if ($score > 80) {
            //     Activity::create([
            //         'type' => 'insight',
            //         'message' => "High insight detected for report #{$report->id}",
            //         'report_id' => $report->id,
            //     ]);
            // }


            if ($severity === 'high') {
                Activity::create([
                    'type' => 'urgent',
                    'message' => "Report #{$report->id} flagged as urgent",
                    'report_id' => $report->id,
                ]);
            }

            // ── 7. Notify user ────────────────────────────────────────────────
            Notification::create([
                'user_id'   => $report->user_id,
                'report_id' => $report->id,
                'title'     => 'AI Analysis Completed',
                'message'   => "Your report #{$report->id} has been analysed. " . mb_substr($summary, 0, 100) . '...',
                'type'      => $severity === 'high' ? 'urgent' : 'success',
                'is_read'   => false,
            ]);

            Log::info("AI analysis completed for report #{$report->id}", [
                'category_id' => $categoryId,
                'severity'    => $severity,
                'confidence'  => $confidence,
                'summary_len' => strlen($summary),
            ]);

        } catch (\Throwable $e) {
            Log::error("AI JOB FAILED for report #{$this->reportId}", [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private function mapCategoryToId(string $label): ?int
    {
        return Category::whereRaw('LOWER(name) LIKE ?', ['%' . strtolower($label) . '%'])
            ->value('id');
    }

    // ✅ BLIP — router.huggingface.co/models/... (raw binary body)
    private function captionImage(string $path): ?string
    {
        try {
            $res = Http::withHeaders([
                'Authorization' => 'Bearer ' . config('services.huggingface.token'),
                'Content-Type'  => 'image/jpeg',
            ])->withBody(file_get_contents($path), 'image/jpeg')
              ->timeout(60)
              ->post(self::BLIP_URL);

            Log::info('BLIP raw response: ' . $res->body());

            if (!$res->successful()) {
                Log::warning('BLIP HTTP ' . $res->status() . ': ' . $res->body());
                return null;
            }

            return $res->json()[0]['generated_text'] ?? null;
        } catch (\Exception $e) {
            Log::warning("captionImage failed: {$e->getMessage()}");
            return null;
        }
    }

    // ✅ BART MNLI — router.huggingface.co/models/... (JSON body)
    private function classifyCategory(string $text): array
    {
        $labels = ['infrastructure', 'sanitation', 'safety', 'transportation', 'noise', 'other'];
        try {
            $res = Http::withHeaders([
                'Authorization' => 'Bearer ' . config('services.huggingface.token'),
                'Content-Type'  => 'application/json',
            ])->timeout(60)
              ->post(self::BART_URL, [
                  'inputs'     => mb_substr($text, 0, 512),
                  'parameters' => ['candidate_labels' => $labels],
              ]);

            Log::info('BART category raw response: ' . $res->body());

            if (!$res->successful()) {
                Log::warning('BART category HTTP ' . $res->status() . ': ' . $res->body());
                return ['other', 0.5];
            }

            $data = $res->json();
            return [
                $data['labels'][0] ?? 'other',
                (float) ($data['scores'][0] ?? 0.5),
            ];
        } catch (\Exception $e) {
            Log::warning("classifyCategory failed: {$e->getMessage()}");
            return ['other', 0.5];
        }
    }

    // ✅ BART MNLI — router.huggingface.co/models/... (JSON body)
    private function classifySeverity(string $text): array
    {
        $labels = ['high risk', 'medium issue', 'low issue'];
        $map    = ['high risk' => 'high', 'medium issue' => 'medium', 'low issue' => 'low'];
        try {
            $res = Http::withHeaders([
                'Authorization' => 'Bearer ' . config('services.huggingface.token'),
                'Content-Type'  => 'application/json',
            ])->timeout(60)
              ->post(self::BART_URL, [
                  'inputs'     => mb_substr($text, 0, 512),
                  'parameters' => ['candidate_labels' => $labels],
              ]);

            if (!$res->successful()) {
                return ['low'];
            }

            $data  = $res->json();
            $label = $data['labels'][0] ?? 'low issue';
            return [$map[$label] ?? 'low'];
        } catch (\Exception $e) {
            Log::warning("classifySeverity failed: {$e->getMessage()}");
            return ['low'];
        }
    }

    // ✅ Whisper — router.huggingface.co/models/... (raw binary body)
    private function transcribeAudio(string $path): ?string
    {
        try {
            $res = Http::withHeaders([
                'Authorization' => 'Bearer ' . config('services.huggingface.token'),
                'Content-Type'  => 'audio/webm',
            ])->withBody(file_get_contents($path), 'audio/webm')
              ->timeout(90)
              ->post(self::WHISPER_URL);

            Log::info('Whisper raw response: ' . $res->body());

            if (!$res->successful()) {
                Log::warning('Whisper HTTP ' . $res->status() . ': ' . $res->body());
                return null;
            }

            return $res->json()['text'] ?? null;
        } catch (\Exception $e) {
            Log::warning("transcribeAudio failed: {$e->getMessage()}");
            return null;
        }
    }

    // ✅ Llama — router.huggingface.co/v1/chat/completions (OpenAI-compatible)
    private function summarise(string $text): ?string
    {
        try {
            $res = Http::withHeaders([
                'Authorization' => 'Bearer ' . config('services.huggingface.token'),
                'Content-Type'  => 'application/json',
            ])->timeout(60)
              ->post(self::LLAMA_URL, [
                  'model'      => self::LLAMA_MODEL,
                  'max_tokens' => 150,
                  'messages'   => [
                      [
                          'role'    => 'system',
                          'content' => 'You are a municipal assistant. Summarize city issue reports in 2-3 sentences. Be concise and factual. Return only the summary text with no preamble.',
                      ],
                      [
                          'role'    => 'user',
                          'content' => "Summarize this city issue report:\n\n" . mb_substr($text, 0, 1500),
                      ],
                  ],
              ]);

            Log::info('Llama raw response: ' . $res->body());

            if (!$res->successful()) {
                Log::warning('Llama HTTP ' . $res->status() . ': ' . $res->body());
                return null;
            }

            $content = $res->json()['choices'][0]['message']['content'] ?? null;
            return $content ? trim($content, " \t\n\r\"'") : null;

        } catch (\Exception $e) {
            Log::warning("summarise failed: {$e->getMessage()}");
            return null;
        }
    }
}