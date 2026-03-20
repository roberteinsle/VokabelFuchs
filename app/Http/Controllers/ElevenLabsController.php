<?php

namespace App\Http\Controllers;

use App\Models\ElevenLabsVoice;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class ElevenLabsController extends Controller
{
    public function updateApiKey(Request $request): RedirectResponse
    {
        $request->validate([
            'elevenlabs_api_key' => ['nullable', 'string', 'max:255'],
        ]);

        $request->user()->update([
            'elevenlabs_api_key' => $request->elevenlabs_api_key ?: null,
        ]);

        return back()->with('status', 'elevenlabs-updated');
    }

    public function voices(Request $request): JsonResponse
    {
        $apiKey = $request->user()->elevenlabs_api_key;

        if (! $apiKey) {
            return response()->json(['error' => 'Kein API-Key hinterlegt.'], 422);
        }

        $response = Http::withHeaders([
            'xi-api-key' => $apiKey,
        ])->get('https://api.elevenlabs.io/v1/voices');

        if ($response->failed()) {
            $message = $response->json('detail.message') ?? 'Unbekannter Fehler';

            return response()->json(['error' => 'ElevenLabs: '.$message], 422);
        }

        $allVoices = collect($response->json('voices', []))->map(fn ($v) => [
            'voice_id' => $v['voice_id'],
            'name' => $v['name'],
            'category' => $v['category'] ?? null,
            'labels' => $v['labels'] ?? [],
            'preview_url' => $v['preview_url'] ?? null,
            'language' => $v['labels']['language'] ?? null,
            'accent' => $v['labels']['accent'] ?? null,
        ]);

        // Group voices by target language: de → German, en → British accent preferred, fr → French
        $grouped = [
            'de' => $allVoices->filter(fn ($v) => $v['language'] === 'de')->values(),
            'en' => $allVoices->filter(fn ($v) => $v['language'] === 'en' && $v['accent'] === 'british')->values(),
            'fr' => $allVoices->filter(fn ($v) => $v['language'] === 'fr')->values(),
        ];

        // Fallback: if no british voices, show all english voices
        if ($grouped['en']->isEmpty()) {
            $grouped['en'] = $allVoices->filter(fn ($v) => $v['language'] === 'en')->values();
        }

        // Fallback: if no french voices, show all with french accent
        if ($grouped['fr']->isEmpty()) {
            $grouped['fr'] = $allVoices->filter(fn ($v) => ($v['accent'] ?? '') === 'french')->values();
        }

        return response()->json(['voices' => $grouped]);
    }

    public function updateVoice(Request $request): RedirectResponse
    {
        $request->validate([
            'language' => ['required', 'string', 'in:de,en,fr'],
            'voice_id' => ['required', 'string', 'max:255'],
            'voice_name' => ['required', 'string', 'max:255'],
        ]);

        ElevenLabsVoice::updateOrCreate(
            [
                'parent_id' => $request->user()->id,
                'language' => $request->language,
            ],
            [
                'voice_id' => $request->voice_id,
                'voice_name' => $request->voice_name,
            ]
        );

        return back()->with('status', 'voice-updated');
    }

    public function removeVoice(Request $request): RedirectResponse
    {
        $request->validate([
            'language' => ['required', 'string', 'in:de,en,fr'],
        ]);

        ElevenLabsVoice::where('parent_id', $request->user()->id)
            ->where('language', $request->language)
            ->delete();

        return back()->with('status', 'voice-removed');
    }

    public function speak(Request $request): \Illuminate\Http\Response|JsonResponse
    {
        $request->validate([
            'text' => ['required', 'string', 'max:500'],
            'language' => ['required', 'string', 'in:de,en,fr'],
        ]);

        $user = $request->user();
        $apiKey = $user->elevenlabs_api_key;

        if (! $apiKey) {
            return response()->json(['error' => 'Kein API-Key hinterlegt.'], 422);
        }

        $voice = ElevenLabsVoice::where('parent_id', $user->id)
            ->where('language', $request->language)
            ->first();

        if (! $voice) {
            return response()->json(['error' => 'Keine Stimme für diese Sprache konfiguriert.'], 422);
        }

        $response = Http::withHeaders([
            'xi-api-key' => $apiKey,
            'Content-Type' => 'application/json',
        ])->post("https://api.elevenlabs.io/v1/text-to-speech/{$voice->voice_id}?output_format=mp3_22050_32", [
            'text' => $request->text,
            'model_id' => 'eleven_multilingual_v2',
        ]);

        if ($response->failed()) {
            return response()->json(['error' => 'TTS-Fehler: '.$response->status()], $response->status());
        }

        return response($response->body(), 200, [
            'Content-Type' => 'audio/mpeg',
            'Cache-Control' => 'public, max-age=86400',
        ]);
    }
}
