<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Http;

class TtsController extends Controller
{
    public function speak(Request $request): Response|JsonResponse
    {
        $request->validate([
            'text' => ['required', 'string', 'max:500'],
            'language' => ['required', 'string', 'in:de,en,fr'],
        ]);

        $user = $request->user();
        $apiKey = $user->google_tts_api_key;

        if (! $apiKey) {
            return response()->json(['error' => 'Kein Google TTS API-Key hinterlegt.'], 422);
        }

        $lang = $request->language;
        $languageCode = config("tts.language_codes.{$lang}", 'de-DE');
        $voices = $user->google_tts_voices ?? [];
        $voiceName = $voices[$lang] ?? config("tts.default_voice_{$lang}");

        $response = Http::post("https://texttospeech.googleapis.com/v1/text:synthesize?key={$apiKey}", [
            'input' => ['text' => $request->text],
            'voice' => [
                'languageCode' => $languageCode,
                'name' => $voiceName,
            ],
            'audioConfig' => [
                'audioEncoding' => 'MP3',
            ],
        ]);

        if ($response->failed()) {
            $message = $response->json('error.message') ?? 'TTS-Fehler';

            return response()->json(['error' => $message], $response->status());
        }

        $audioContent = base64_decode($response->json('audioContent'));

        return response($audioContent, 200, [
            'Content-Type' => 'audio/mpeg',
            'Cache-Control' => 'public, max-age=86400',
        ]);
    }

    public function updateSettings(Request $request): RedirectResponse
    {
        $request->validate([
            'google_tts_api_key' => ['nullable', 'string', 'max:255'],
            'google_tts_voice_de' => ['required', 'string', 'max:100'],
            'google_tts_voice_en' => ['required', 'string', 'max:100'],
            'google_tts_voice_fr' => ['required', 'string', 'max:100'],
        ]);

        $data = [
            'google_tts_voices' => [
                'de' => $request->google_tts_voice_de,
                'en' => $request->google_tts_voice_en,
                'fr' => $request->google_tts_voice_fr,
            ],
        ];

        if ($request->filled('google_tts_api_key')) {
            $data['google_tts_api_key'] = $request->google_tts_api_key;
        }

        $request->user()->update($data);

        return back()->with('status', 'tts-updated');
    }
}
