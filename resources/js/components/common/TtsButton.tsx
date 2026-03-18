import { speak } from '@/lib/tts';
import { Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TtsButtonProps {
    text: string;
    lang: 'de' | 'en' | 'fr';
    size?: 'sm' | 'default';
    className?: string;
}

export default function TtsButton({ text, lang, size = 'sm', className }: TtsButtonProps) {
    return (
        <Button
            type="button"
            variant="ghost"
            size={size}
            onClick={() => speak(text, lang)}
            className={className}
            title={`Aussprechen: ${text}`}
        >
            <Volume2 className="w-4 h-4" />
        </Button>
    );
}
