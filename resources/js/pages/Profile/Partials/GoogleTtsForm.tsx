import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

interface Props {
    hasKey: boolean;
    voices: Record<string, string>;
    allVoices: Record<string, Record<string, string[]>>;
    imagePrompt: string;
}

const LANG_LABELS: Record<string, string> = {
    de: 'Deutsch',
    en: 'Englisch',
    fr: 'Französisch',
};

export default function GoogleTtsForm({ hasKey, voices, allVoices, imagePrompt }: Props) {
    const [showKey, setShowKey] = useState(false);

    const { data, setData, put, processing, recentlySuccessful } = useForm({
        google_tts_api_key: '',
        google_tts_voice_de: voices.de ?? 'de-DE-Wavenet-C',
        google_tts_voice_en: voices.en ?? 'en-GB-Wavenet-A',
        google_tts_voice_fr: voices.fr ?? 'fr-FR-Wavenet-A',
        image_prompt: imagePrompt,
    });

    return (
        <form onSubmit={(e) => { e.preventDefault(); put(route('parent.profile.tts.update')); }} className="space-y-4">
            <div>
                <h2 className="text-lg font-medium text-gray-900">Sprachausgabe (Google Cloud TTS)</h2>
                <p className="mt-1 text-sm text-gray-600">
                    Konfiguriere die Text-to-Speech Sprachausgabe für Vokabel-Aussprache.
                </p>
            </div>

            <div>
                <Label htmlFor="tts-api-key">API-Key</Label>
                {hasKey && !showKey ? (
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-green-600 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                            API-Key hinterlegt
                        </span>
                        <button type="button" onClick={() => setShowKey(true)} className="text-xs text-blue-600 hover:underline">
                            Ändern
                        </button>
                    </div>
                ) : (
                    <Input
                        id="tts-api-key"
                        type="password"
                        value={data.google_tts_api_key}
                        onChange={(e) => setData('google_tts_api_key', e.target.value)}
                        placeholder={hasKey ? 'Neuen Key eingeben oder leer lassen' : 'Google Cloud API-Key'}
                        className="mt-1"
                    />
                )}
                <p className="text-xs text-gray-500 mt-1">
                    Benötigt die "Cloud Text-to-Speech API" in der Google Cloud Console.
                </p>
            </div>

            {(['de', 'en', 'fr'] as const).map((lang) => {
                const langVoices = allVoices[lang] ?? {};
                const fieldKey = `google_tts_voice_${lang}` as keyof typeof data;
                return (
                    <div key={lang}>
                        <Label>Stimme {LANG_LABELS[lang]}</Label>
                        <select
                            value={data[fieldKey]}
                            onChange={(e) => setData(fieldKey, e.target.value)}
                            className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                            {Object.entries(langVoices).map(([group, voiceList]) => (
                                <optgroup key={group} label={group}>
                                    {voiceList.map((v) => (
                                        <option key={v} value={v}>{v}</option>
                                    ))}
                                </optgroup>
                            ))}
                        </select>
                    </div>
                );
            })}

            <div className="border-t border-gray-200 pt-4 mt-4">
                <Label htmlFor="image-prompt">Bild-Prompt (Imagen)</Label>
                <textarea
                    id="image-prompt"
                    value={data.image_prompt}
                    onChange={(e) => setData('image_prompt', e.target.value)}
                    rows={3}
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Flat vector illustration of a {word}, simple and colorful..."
                />
                <p className="text-xs text-gray-500 mt-1">
                    <code className="bg-gray-100 px-1 rounded">{'{word}'}</code> wird durch das englische/fremdsprachige Wort ersetzt (Prompt am besten auf Englisch).
                </p>
            </div>

            <div className="flex items-center gap-3">
                <Button type="submit" disabled={processing}>Speichern</Button>
                {recentlySuccessful && <span className="text-sm text-green-600">Gespeichert!</span>}
            </div>
        </form>
    );
}
