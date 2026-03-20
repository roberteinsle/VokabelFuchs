<?php

namespace App\Http\Middleware;

use App\Models\Child;
use App\Models\ElevenLabsVoice;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $childId = $request->session()->get('child_id');
        $child = $childId ? Child::find($childId) : null;

        // ElevenLabs: check if parent has API key + configured voices
        $ttsLanguages = [];
        $user = $request->user();
        if ($user && $user->elevenlabs_api_key) {
            $ttsLanguages = ElevenLabsVoice::where('parent_id', $user->id)
                ->pluck('language')
                ->toArray();
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user,
            ],
            'child' => $child ? [
                'id' => $child->id,
                'name' => $child->name,
            ] : null,
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
            'tts' => [
                'elevenlabs_languages' => $ttsLanguages,
            ],
        ];
    }
}
