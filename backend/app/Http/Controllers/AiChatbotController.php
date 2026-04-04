<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AiChatbotController extends Controller
{
    // CivicLens platform context injected into every conversation
    private const SYSTEM_PROMPT = <<<PROMPT
You are the CivicLens AI Assistant — a helpful, concise, and friendly assistant embedded in the CivicLens civic issue reporting platform.
 
You help citizens with:
- How to submit a report (photo, voice, text)
- Checking the status of their reports
- Understanding AI analysis results (category, severity, confidence score)
- Navigating the platform (dashboard, map view, analytics, notifications)
- General questions about city infrastructure, sanitation, safety, and public services
 
Guidelines:
- Keep answers short and clear (2-4 sentences max unless detail is needed)
- Be friendly and encouraging — citizens are helping improve their city
- If asked about something outside the platform scope, politely redirect
- Never make up report data — tell users to check their dashboard for live info
- Respond in the same language the user writes in (French, Arabic, or English)
PROMPT;
 
    public function chat(Request $request): JsonResponse
    {
        $request->validate([
            'message'  => 'required|string|max:1000',
            'history'  => 'nullable|array',         // optional: pass conversation history
            'history.*.role'    => 'in:user,assistant',
            'history.*.content' => 'string|max:2000',
        ]);
 
        $userMessage = trim($request->input('message'));
        $history     = $request->input('history', []);
 
        // Build messages array: system + history + new user message
        $messages = [
            [
                'role'    => 'system',
                'content' => self::SYSTEM_PROMPT,
            ],
        ];
 
        // Append prior conversation turns (max last 6 to stay within token limits)
        foreach (array_slice($history, -6) as $turn) {
            $messages[] = [
                'role'    => $turn['role'],
                'content' => $turn['content'],
            ];
        }
 
        // Append current user message
        $messages[] = [
            'role'    => 'user',
            'content' => $userMessage,
        ];
 
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . config('services.huggingface.token'),
                'Content-Type'  => 'application/json',
            ])->timeout(30)
              ->post('https://router.huggingface.co/v1/chat/completions', [
                  'model'       => 'meta-llama/Llama-3.1-8B-Instruct:novita',
                  'max_tokens'  => 300,
                  'temperature' => 0.7,
                  'messages'    => $messages,
              ]);
 
            Log::info('Chatbot raw response: ' . $response->body());
 
            if (!$response->successful()) {
                Log::warning('Chatbot API error: ' . $response->status() . ' — ' . $response->body());
                return response()->json([
                    'reply' => 'Sorry, the assistant is temporarily unavailable. Please try again in a moment.',
                ], 200);
            }
 
            $content = $response->json()['choices'][0]['message']['content'] ?? null;
 
            if (!$content) {
                return response()->json(['reply' => 'I could not generate a response. Please try rephrasing.']);
            }
 
            return response()->json([
                'reply' => trim($content),
            ]);
 
        } catch (\Exception $e) {
            Log::error('Chatbot exception: ' . $e->getMessage());
 
            return response()->json([
                'reply' => 'Something went wrong on my end. Please try again.',
            ], 200); // always 200 so frontend shows the message gracefully
        }
    }
}
