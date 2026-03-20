import axios from 'axios';

const LANG_MAP: Record<string, string> = {
    de: 'de-DE',
    en: 'en-GB',
    fr: 'fr-FR',
};

let currentAudio: HTMLAudioElement | null = null;
let elevenLabsLanguages: string[] = [];

export function setElevenLabsLanguages(languages: string[]): void {
    elevenLabsLanguages = languages;
}

async function speakElevenLabs(text: string, lang: string): Promise<boolean> {
    try {
        const response = await axios.post('/tts/speak', {
            text,
            language: lang,
        }, {
            responseType: 'blob',
            headers: { 'Accept': 'audio/mpeg' },
        });

        const url = URL.createObjectURL(response.data);

        if (currentAudio) {
            currentAudio.pause();
            currentAudio = null;
        }

        const audio = new Audio(url);
        currentAudio = audio;
        audio.addEventListener('ended', () => {
            URL.revokeObjectURL(url);
            currentAudio = null;
        });
        await audio.play();
        return true;
    } catch {
        return false;
    }
}

function speakBrowser(text: string, lang: string): void {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = LANG_MAP[lang] ?? 'de-DE';
    utterance.rate = 0.9;
    utterance.pitch = 1;

    window.speechSynthesis.speak(utterance);
}

export async function speak(text: string, lang: 'de' | 'en' | 'fr'): Promise<void> {
    console.log('[TTS] speak', { text, lang, elevenLabsLanguages, hasLang: elevenLabsLanguages.includes(lang) });

    if (elevenLabsLanguages.includes(lang)) {
        const success = await speakElevenLabs(text, lang);
        console.log('[TTS] ElevenLabs result:', success);
        if (success) return;
    }

    console.log('[TTS] Falling back to browser TTS');
    speakBrowser(text, lang);
}

export function stopSpeech(): void {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
    }
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
}

export function isTtsSupported(): boolean {
    return 'speechSynthesis' in window || elevenLabsLanguages.length > 0;
}
