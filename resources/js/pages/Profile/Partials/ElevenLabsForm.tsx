import { useForm, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useCallback } from 'react';
import { Volume2, Trash2, RefreshCw } from 'lucide-react';

interface Voice {
    voice_id: string;
    name: string;
    category: string | null;
    labels: Record<string, string>;
    preview_url: string | null;
}

interface SavedVoice {
    voice_id: string;
    voice_name: string;
}

interface Props {
    hasKey: boolean;
    voices: Record<string, SavedVoice>;
}

const LANGUAGES = [
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
    { code: 'en', label: 'Englisch', flag: '🇬🇧' },
    { code: 'fr', label: 'Französisch', flag: '🇫🇷' },
];

export default function ElevenLabsForm({ hasKey, voices }: Props) {
    const [voicesByLang, setVoicesByLang] = useState<Record<string, Voice[]>>({});
    const [loadingVoices, setLoadingVoices] = useState(false);
    const [voiceError, setVoiceError] = useState('');
    const [previewAudio, setPreviewAudio] = useState<HTMLAudioElement | null>(null);

    const apiKeyForm = useForm({
        elevenlabs_api_key: '',
    });

    const submitApiKey = (e: React.FormEvent) => {
        e.preventDefault();
        apiKeyForm.post(route('parent.elevenlabs.api-key.update'), {
            onSuccess: () => apiKeyForm.reset(),
        });
    };

    const removeApiKey = () => {
        router.post(route('parent.elevenlabs.api-key.update'), {
            elevenlabs_api_key: '',
        });
    };

    const loadVoices = useCallback(async () => {
        setLoadingVoices(true);
        setVoiceError('');
        try {
            const response = await fetch(route('parent.elevenlabs.voices'), {
                credentials: 'same-origin',
                headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            });
            const data = await response.json();
            if (response.ok) {
                setVoicesByLang(data.voices);
            } else {
                setVoiceError(data.error || 'Fehler beim Laden.');
            }
        } catch {
            setVoiceError('Verbindungsfehler.');
        } finally {
            setLoadingVoices(false);
        }
    }, []);

    const selectVoice = (language: string, voice: Voice) => {
        router.post(route('parent.elevenlabs.voice.update'), {
            language,
            voice_id: voice.voice_id,
            voice_name: voice.name,
        });
    };

    const removeVoice = (language: string) => {
        router.delete(route('parent.elevenlabs.voice.destroy'), {
            data: { language },
        });
    };

    const playPreview = (url: string) => {
        if (previewAudio) {
            previewAudio.pause();
        }
        const audio = new Audio(url);
        setPreviewAudio(audio);
        audio.play();
    };

    return (
        <section>
            <header>
                <h2 className="text-lg font-medium text-gray-900">Sprachausgabe (ElevenLabs)</h2>
                <p className="mt-1 text-sm text-gray-600">
                    Vokabeln können vorgelesen werden. Hinterlege deinen ElevenLabs API-Key und wähle eine Stimme pro Sprache.
                </p>
            </header>

            {/* API Key */}
            <form onSubmit={submitApiKey} className="mt-6 space-y-4 max-w-md">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        API-Key {hasKey && <span className="text-green-600 text-xs ml-2">● gespeichert</span>}
                    </label>
                    <Input
                        type="password"
                        value={apiKeyForm.data.elevenlabs_api_key}
                        onChange={e => apiKeyForm.setData('elevenlabs_api_key', e.target.value)}
                        placeholder={hasKey ? '••••••••••••' : 'xi-api-key eingeben'}
                    />
                    {apiKeyForm.errors.elevenlabs_api_key && (
                        <p className="text-red-500 text-xs mt-1">{apiKeyForm.errors.elevenlabs_api_key}</p>
                    )}
                </div>
                <div className="flex gap-3 items-center">
                    <Button type="submit" disabled={apiKeyForm.processing}>
                        {hasKey ? 'Key ändern' : 'Key speichern'}
                    </Button>
                    {apiKeyForm.recentlySuccessful && <span className="text-sm text-green-600">Gespeichert.</span>}
                    {hasKey && (
                        <button type="button" onClick={removeApiKey} className="text-sm text-red-500 hover:text-red-700">
                            Key entfernen
                        </button>
                    )}
                </div>
            </form>

            {/* Voice Selection */}
            {hasKey && (
                <div className="mt-8 space-y-4">
                    <div className="flex items-center gap-3">
                        <h3 className="text-sm font-medium text-gray-900">Stimmen pro Sprache</h3>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={loadVoices}
                            disabled={loadingVoices}
                        >
                            <RefreshCw className={`w-3 h-3 mr-1 ${loadingVoices ? 'animate-spin' : ''}`} />
                            Stimmen laden
                        </Button>
                    </div>

                    {voiceError && <p className="text-red-500 text-sm">{voiceError}</p>}

                    {LANGUAGES.map(lang => {
                        const saved = voices[lang.code];
                        const langVoices = voicesByLang[lang.code] ?? [];
                        return (
                            <div key={lang.code} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <span className="font-medium">
                                        {lang.flag} {lang.label}
                                    </span>
                                    {saved ? (
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-600">{saved.voice_name}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeVoice(lang.code)}
                                                className="text-red-400 hover:text-red-600"
                                                title="Stimme entfernen"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <span className="text-xs text-gray-400">Keine Stimme gewählt</span>
                                    )}
                                </div>

                                {langVoices.length > 0 && (
                                    <div className="mt-3 max-h-48 overflow-y-auto space-y-1">
                                        {langVoices.map(voice => (
                                            <div
                                                key={voice.voice_id}
                                                className={`flex items-center justify-between px-3 py-2 rounded-md text-sm cursor-pointer transition-colors ${
                                                    saved?.voice_id === voice.voice_id
                                                        ? 'bg-blue-50 border border-blue-200'
                                                        : 'hover:bg-gray-50'
                                                }`}
                                                onClick={() => selectVoice(lang.code, voice)}
                                            >
                                                <div>
                                                    <span className="font-medium">{voice.name}</span>
                                                    {voice.labels && Object.keys(voice.labels).length > 0 && (
                                                        <span className="ml-2 text-xs text-gray-400">
                                                            {[voice.labels.gender, voice.labels.accent, voice.labels.descriptive]
                                                                .filter(Boolean).join(', ')}
                                                        </span>
                                                    )}
                                                </div>
                                                {voice.preview_url && (
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            playPreview(voice.preview_url!);
                                                        }}
                                                        className="text-gray-400 hover:text-blue-600"
                                                        title="Vorschau"
                                                    >
                                                        <Volume2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {Object.keys(voicesByLang).length > 0 && langVoices.length === 0 && (
                                    <p className="mt-3 text-xs text-gray-400">Keine Stimmen für diese Sprache verfügbar.</p>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </section>
    );
}
