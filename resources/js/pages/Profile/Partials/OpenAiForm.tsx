import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

interface Props {
    hasKey: boolean;
}

export default function OpenAiForm({ hasKey }: Props) {
    const [showKey, setShowKey] = useState(false);

    const { data, setData, put, processing, recentlySuccessful } = useForm({
        openai_api_key: '',
    });

    return (
        <form onSubmit={(e) => { e.preventDefault(); put(route('parent.profile.openai.update')); }} className="space-y-4">
            <div>
                <h2 className="text-lg font-medium text-gray-900">Bildgenerierung (OpenAI DALL-E)</h2>
                <p className="mt-1 text-sm text-gray-600">
                    Generiere automatisch Pixel-Art Bilder für deine Vokabeln.
                </p>
            </div>

            <div>
                <Label htmlFor="openai-api-key">API-Key</Label>
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
                        id="openai-api-key"
                        type="password"
                        value={data.openai_api_key}
                        onChange={(e) => setData('openai_api_key', e.target.value)}
                        placeholder={hasKey ? 'Neuen Key eingeben oder leer lassen' : 'sk-...'}
                        className="mt-1"
                    />
                )}
                <p className="text-xs text-gray-500 mt-1">
                    Benötigt einen OpenAI API-Key mit DALL-E Zugriff.
                </p>
            </div>

            <div className="flex items-center gap-3">
                <Button type="submit" disabled={processing}>Speichern</Button>
                {recentlySuccessful && <span className="text-sm text-green-600">Gespeichert!</span>}
            </div>
        </form>
    );
}
