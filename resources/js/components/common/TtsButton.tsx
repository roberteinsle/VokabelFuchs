import { speak, setTtsLanguages } from '@/lib/tts';
import { Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';

interface TtsButtonProps {
    text: string;
    lang: 'de' | 'en' | 'fr';
    size?: 'sm' | 'default';
    className?: string;
}

export default function TtsButton({ text, lang, size = 'sm', className }: TtsButtonProps) {
    const { tts } = usePage().props as { tts?: { available_languages: string[] } };
    const [playing, setPlaying] = useState(false);

    useEffect(() => {
        if (tts?.available_languages) {
            setTtsLanguages(tts.available_languages);
        }
    }, [tts?.available_languages]);

    const handleClick = async () => {
        setPlaying(true);
        try {
            await speak(text, lang);
        } finally {
            setTimeout(() => setPlaying(false), 1500);
        }
    };

    return (
        <Button
            type="button"
            variant="ghost"
            size={size}
            onClick={handleClick}
            className={className}
            title={`Aussprechen: ${text}`}
            disabled={playing}
        >
            <Volume2 className={`w-4 h-4 ${playing ? 'text-blue-500 animate-pulse' : ''}`} />
        </Button>
    );
}
